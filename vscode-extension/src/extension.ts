import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFile } from 'child_process';

/**
 * SSH Host Colors Extension
 *
 * Parses ~/.ssh/config for color annotations like:
 *   # vscode-color: #1a1a2e
 *   Host dev-server
 *
 * And automatically applies those colors when connecting to that host via Remote SSH.
 * Also runs the bundled Python script to generate iTerm2 profiles.
 */

interface HostColors {
  [host: string]: string;
}

function parseSSHConfig(): HostColors {
  const configPath = path.join(os.homedir(), '.ssh', 'config');
  const colors: HostColors = {};
  
  if (!fs.existsSync(configPath)) {
    console.log('SSH Host Colors: No ~/.ssh/config found');
    return colors;
  }
  
  const content = fs.readFileSync(configPath, 'utf-8');
  const lines = content.split('\n');
  
  let currentColor: string | null = null;
  
  for (const line of lines) {
    // Look for color comment
    const colorMatch = line.match(/#\s*vscode-color:\s*(#[0-9a-fA-F]{6})/i);
    if (colorMatch) {
      currentColor = colorMatch[1];
      continue;
    }
    
    // Look for Host line
    const hostMatch = line.match(/^Host\s+(\S+)/i);
    if (hostMatch && currentColor) {
      const hostname = hostMatch[1];
      // Skip wildcards
      if (!hostname.includes('*') && !hostname.includes('?')) {
        colors[hostname] = currentColor;
      }
      currentColor = null;
    }
  }
  
  console.log(`SSH Host Colors: Loaded ${Object.keys(colors).length} host colors`);
  return colors;
}

function getCurrentSSHHost(): string | null {
  // Check if we're in a remote SSH session
  if (vscode.env.remoteName !== 'ssh-remote') {
    return null;
  }
  
  // Get the workspace folder URI to extract the host
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return null;
  }
  
  const uri = workspaceFolders[0].uri;
  // URI authority looks like: ssh-remote+hostname
  const match = uri.authority.match(/^ssh-remote\+(.+)$/);
  
  return match ? match[1] : null;
}

function applyColor(color: string) {
  const config = vscode.workspace.getConfiguration('workbench');
  
  const colorCustomizations = {
    "titleBar.activeBackground": color,
    "titleBar.activeForeground": "#ffffff",
    "titleBar.inactiveBackground": color + "cc",
    "activityBar.background": color,
    "activityBar.foreground": "#ffffff",
    "statusBar.background": color,
    "statusBar.foreground": "#ffffff",
  };
  
  config.update('colorCustomizations', colorCustomizations, vscode.ConfigurationTarget.Workspace);
  console.log(`SSH Host Colors: Applied color ${color}`);
}

function clearColors() {
  const config = vscode.workspace.getConfiguration('workbench');
  config.update('colorCustomizations', undefined, vscode.ConfigurationTarget.Workspace);
}

function runSyncScript(context: vscode.ExtensionContext): void {
  const scriptPath = path.join(context.extensionPath, 'sync-ssh-profiles.py');

  if (!fs.existsSync(scriptPath)) {
    console.log('SSH Host Colors: sync-ssh-profiles.py not found in extension');
    return;
  }

  execFile('python3', [scriptPath], (error, stdout, stderr) => {
    if (error) {
      console.error(`SSH Host Colors: Failed to run sync script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`SSH Host Colors: Script stderr: ${stderr}`);
    }
    if (stdout) {
      console.log(`SSH Host Colors: ${stdout}`);
    }
  });
}

function checkAndApplyColor() {
  const host = getCurrentSSHHost();
  
  if (!host) {
    console.log('SSH Host Colors: Not in SSH remote session');
    return;
  }
  
  console.log(`SSH Host Colors: Connected to ${host}`);
  
  const colors = parseSSHConfig();
  const color = colors[host];
  
  if (color) {
    applyColor(color);
    vscode.window.setStatusBarMessage(`SSH Host Colors: Applied ${host} theme`, 3000);
  } else {
    console.log(`SSH Host Colors: No color defined for ${host}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('SSH Host Colors: Extension activated');

  // Run sync script on startup to generate iTerm2 profiles
  runSyncScript(context);

  // Check immediately on activation
  checkAndApplyColor();

  // Watch for workspace folder changes (new remote connections)
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      checkAndApplyColor();
    })
  );

  // Register refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand('ssh-host-colors.refresh', () => {
      runSyncScript(context);
      checkAndApplyColor();
      vscode.window.showInformationMessage('SSH Host Colors: Refreshed from SSH config');
    })
  );

  // Watch for changes to SSH config
  const sshConfigPath = path.join(os.homedir(), '.ssh', 'config');
  const watcher = vscode.workspace.createFileSystemWatcher(sshConfigPath);

  watcher.onDidChange(() => {
    console.log('SSH Host Colors: SSH config changed, reloading');
    runSyncScript(context);
    checkAndApplyColor();
  });

  context.subscriptions.push(watcher);
}

export function deactivate() {
  console.log('SSH Host Colors: Extension deactivated');
}
