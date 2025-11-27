#!/usr/bin/env python3
"""
Parses ~/.ssh/config for color annotations and generates:
- iTerm2 Dynamic Profiles with colored backgrounds
- VS Code workspace files with Peacock colors

Add comments to your ~/.ssh/config like:
    # iterm-color: #1a1a2e
    # vscode-color: #1a1a2e
    Host dev-server
        HostName dev.example.com
        User emma

Options:
    iterm-color: #RRGGBB    - Background color for iTerm2 profile
    vscode-color: #RRGGBB   - Window color for VS Code
"""

import os
import re
import json
from pathlib import Path

SSH_CONFIG = Path.home() / ".ssh" / "config"
ITERM_DYNAMIC_PROFILES = Path.home() / "Library/Application Support/iTerm2/DynamicProfiles"
VSCODE_WORKSPACES_DIR = Path.home() / ".ssh" / "workspaces"


def parse_ssh_config(path: Path) -> list[dict]:
    """Parse SSH config and extract hosts with color annotations."""
    hosts = []
    current = {}
    
    with open(path) as f:
        for line in f:
            line = line.strip()
            
            # Parse color comments
            if match := re.match(r"#\s*iterm-color:\s*(#[0-9a-fA-F]{6})", line):
                current["iterm_color"] = match.group(1)
            elif match := re.match(r"#\s*vscode-color:\s*(#[0-9a-fA-F]{6})", line):
                current["vscode_color"] = match.group(1)
            # Parse Host line
            elif match := re.match(r"^Host\s+(.+)$", line, re.IGNORECASE):
                hostname = match.group(1)
                # Skip wildcards
                if "*" not in hostname and "?" not in hostname:
                    current["host"] = hostname
                    if current.get("iterm_color") or current.get("vscode_color"):
                        hosts.append(current)
                current = {}
    
    return hosts


def hex_to_iterm_rgb(hex_color: str) -> dict:
    """Convert #RRGGBB to iTerm2's color dict format."""
    hex_color = hex_color.lstrip("#")
    r, g, b = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    return {
        "Red Component": r,
        "Green Component": g,
        "Blue Component": b,
        "Alpha Component": 1.0,
        "Color Space": "sRGB",
    }


def generate_iterm_profiles(hosts: list[dict], output_dir: Path):
    """Generate iTerm2 Dynamic Profiles JSON."""
    profiles = []
    
    for host in hosts:
        if not host.get("iterm_color"):
            continue
        
        color_rgb = hex_to_iterm_rgb(host["iterm_color"])

        profile = {
            "Name": f"SSH: {host['host']}",
            "Guid": f"ssh-{host['host'].lower().replace('.', '-')}",
            "Custom Command": "Yes",
            "Command": f"ssh {host['host']}",
            "Background Color": color_rgb,
            "Badge Text": host["host"],
            "Tags": ["SSH"],
            # Automatic Profile Switching based on hostname
            "Bound Hosts": [host["host"]],
            # Tab color
            "Use Tab Color": True,
            "Tab Color": color_rgb,
            # New windows: home directory, new tabs/splits: last directory
            "Custom Directory": "Recycle",
            "Working Directory": str(Path.home()),
            # New tabs in this window use this profile
            "New Windows Use This Profile": False,
            "New Tabs Use This Profile": True,
        }
        profiles.append(profile)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "ssh-hosts.json"
    
    with open(output_file, "w") as f:
        json.dump({"Profiles": profiles}, f, indent=2)
    
    print(f"✓ Generated iTerm2 profiles: {output_file}")
    print(f"  {len(profiles)} profiles created")


def generate_vscode_workspaces(hosts: list[dict], output_dir: Path):
    """Generate VS Code workspace files with Peacock colors."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    count = 0
    for host in hosts:
        if not host.get("vscode_color"):
            continue
        
        workspace = {
            "folders": [
                {"uri": f"vscode-remote://ssh-remote+{host['host']}/home"}
            ],
            "settings": {
                "peacock.color": host["vscode_color"],
                "workbench.colorCustomizations": {
                    "titleBar.activeBackground": host["vscode_color"],
                    "titleBar.activeForeground": "#ffffff",
                    "activityBar.background": host["vscode_color"],
                    "statusBar.background": host["vscode_color"],
                }
            }
        }
        
        output_file = output_dir / f"{host['host']}.code-workspace"
        with open(output_file, "w") as f:
            json.dump(workspace, f, indent=2)
        count += 1
    
    print(f"✓ Generated VS Code workspaces: {output_dir}")
    print(f"  {count} workspace files created")


def main():
    if not SSH_CONFIG.exists():
        print(f"Error: {SSH_CONFIG} not found")
        return
    
    hosts = parse_ssh_config(SSH_CONFIG)
    
    if not hosts:
        print("No hosts with color annotations found.")
        print("Add comments like '# iterm-color: #1a1a2e' before Host entries.")
        return
    
    print(f"Found {len(hosts)} hosts with color annotations\n")
    
    generate_iterm_profiles(hosts, ITERM_DYNAMIC_PROFILES)
    generate_vscode_workspaces(hosts, VSCODE_WORKSPACES_DIR)
    
    print("\nDone! Restart iTerm2 to load new profiles.")
    print("Open .code-workspace files to launch colored VS Code windows.")


if __name__ == "__main__":
    main()
