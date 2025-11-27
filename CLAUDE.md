# SSH Colors Project

## Goal
Manage SSH host colors from a single source of truth: comments in `~/.ssh/config`.

## Components

### 1. sync-ssh-profiles.py
Python script that parses `~/.ssh/config` and generates:
- **iTerm2 Dynamic Profiles** with colored backgrounds and tmux integration
- **VS Code workspace files** (optional, for manual use)

### 2. vscode-extension/
VS Code extension that:
- Automatically applies window colors when connecting to an SSH host
- Reads color definitions from `~/.ssh/config`
- No manual workspace files needed

## SSH Config Format

```ssh-config
# iterm-color: #1a1a2e
# vscode-color: #1a1a2e
# tmux-session: dev
# iterm-tmux-cc: true
Host dev-server
    HostName dev.example.com
    User emma

# iterm-color: #2d1f1f
# vscode-color: #661a1a
Host prod-server
    HostName prod.example.com
    User emma
```

## Usage

```bash
# Generate iTerm2 profiles
python3 sync-ssh-profiles.py

# Build and install VS Code extension
cd vscode-extension
npm install
npm run compile
# Press F5 to test, or:
npx vsce package
code --install-extension ssh-host-colors-0.0.1.vsix
```

## TODO / Ideas
- [ ] Test VS Code extension with actual Remote SSH connections
- [ ] Add support for deploying settings to remote ~/.vscode-server/
- [x] Add iTerm2 native tmux integration (-CC flag) as an option
- [ ] File watcher to auto-regenerate iTerm profiles on config change
- [ ] Support color aliases (e.g., `# color: prod` → predefined red theme)
