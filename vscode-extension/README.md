# SSH Host Colors

Automatically apply window colors to VS Code and iTerm2 based on which SSH host you're connected to. Colors are defined in `~/.ssh/config` comments, making your SSH config the single source of truth.

## Features

- **VS Code**: Automatically colors the title bar, activity bar, and status bar when connecting via Remote SSH
- **iTerm2**: Generates Dynamic Profiles with colored backgrounds and tab colors
- **Auto-sync**: Regenerates iTerm2 profiles when `~/.ssh/config` changes
- **Automatic Profile Switching**: iTerm2 profiles switch automatically based on hostname

## Setup

Add color comments to your `~/.ssh/config`:

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

## Options

| Comment | Description |
|---------|-------------|
| `# iterm-color: #RRGGBB` | Background and tab color for iTerm2 profile |
| `# vscode-color: #RRGGBB` | Window color for VS Code |

## Requirements

- **VS Code**: Remote - SSH extension
- **iTerm2**: Shell Integration (for automatic profile switching)
- **Python 3**: Required for generating iTerm2 profiles

## Commands

- `SSH Host Colors: Refresh from SSH Config` - Manually refresh colors and regenerate iTerm2 profiles

## How It Works

1. On startup, the extension reads `~/.ssh/config` and extracts color annotations
2. For VS Code: When connected to a remote SSH host, it applies the matching color to the window
3. For iTerm2: It runs a bundled Python script to generate Dynamic Profiles at `~/Library/Application Support/iTerm2/DynamicProfiles/ssh-hosts.json`
4. When `~/.ssh/config` changes, both are automatically updated

## License

MIT
