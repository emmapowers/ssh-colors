# SSH Host Colors

Manage iTerm2 and VS Code window colors for SSH hosts from your `~/.ssh/config`.

## The Idea

Add color annotations to your SSH config:

```ssh-config
# iterm-color: #1a1a2e
# vscode-color: #1a1a2e
Host dev-server
    HostName dev.example.com
    User emma

# iterm-color: #2d1f1f
# vscode-color: #661a1a
Host prod-server
    HostName prod.example.com
    User emma
```

Then:
- **iTerm2**: Run the Python script to generate colored profiles with tmux
- **VS Code**: Install the extension for automatic coloring on SSH connect

## iTerm2 Setup

```bash
# Run once, or whenever you update ~/.ssh/config
python3 sync-ssh-profiles.py

# Restart iTerm2 to load profiles
# Access via Profiles menu or ⌘+O
```

Each profile:
- Connects via SSH
- Attaches to a tmux session (creates if needed)
- Has a colored background
- Shows hostname badge

### Custom tmux session name

```ssh-config
# iterm-color: #1a1a2e
# tmux-session: myproject
Host dev-server
    ...
```

## VS Code Extension

The extension automatically applies colors when you connect to a host via Remote SSH.

### Build & Install

```bash
cd vscode-extension
npm install
npm run compile

# Package and install
npx vsce package
code --install-extension ssh-host-colors-0.0.1.vsix
```

### Development

Open the `vscode-extension` folder in VS Code and press F5 to launch the Extension Development Host.

## Development with Pixi

This project uses [pixi](https://pixi.sh) for Python dependency management.

```bash
pixi install              # Install dependencies
pixi run build-binary     # Build standalone Python binary
pixi run build-extension  # Build and package VS Code extension
```

## Color Ideas

| Environment | Hex | Description |
|-------------|-----|-------------|
| Production | `#2d1f1f` | Dark red tint |
| Staging | `#2d2d1f` | Dark yellow tint |
| Development | `#1f2d1f` | Dark green tint |
| Personal | `#1a1a2e` | Dark blue tint |
