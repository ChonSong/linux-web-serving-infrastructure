# Code-Server Mobile Workflow Guide

## 🎯 The Setup

**Primary Terminal Interface**: https://dev.codeovertcp.com (code-server)
**Backup Web Chat**: https://code.codeovertcp.com (gemini-assistant)
**Password**: dawnofdoyle

---

## 📱 Mobile-First Terminal Workflow

### Quick Start
1. Open https://dev.codeovertcp.com on your phone
2. Login with password: `dawnofdoyle`
3. Open terminal: Tap hamburger menu → Terminal → New Terminal
4. You're ready to use Claude Code CLI!

---

## 🧘 Zen Mode Strategy (Full-Screen Terminal)

### Method 1: Command Palette
1. Open terminal (Ctrl + ` or via menu)
2. Press `F1` or tap hamburger menu → "Show All Commands"
3. Type: `View: Toggle Maximized Panel`
4. Terminal now fills entire screen

### Method 2: Keyboard Shortcut
- **Desktop**: `Ctrl + J` to toggle panel, then maximize
- **Mobile**: Use Command Palette (Method 1)

### To Exit Zen Mode
- Run the same command again: `View: Toggle Maximized Panel`
- Or press `Ctrl + J` (desktop)

---

## ⚙️ Optimized Settings

Your code-server is now configured with:

### Terminal Optimizations
- **Font Size**: 14px (readable on mobile)
- **Line Height**: 1.2 (compact but clear)
- **Scrollback**: 10,000 lines (plenty of history)
- **Cursor**: Blinking line (easy to see)

### UI Optimizations
- **Activity Bar**: Hidden (more screen space)
- **Minimap**: Disabled (unnecessary on mobile)
- **Breadcrumbs**: Hidden (cleaner interface)
- **Tree Indent**: 20px (bigger touch targets)

### Mobile Touch Targets
- Larger indent spacing for file tree
- Bigger font sizes for editor (14px)
- Increased line height (1.5) for easier tapping

---

## 🔥 Pro Tips for Mobile

### 1. Terminal-First Workflow
- Open code-server → Immediately open terminal
- Use `View: Toggle Maximized Panel` to go full-screen
- Work in terminal with Claude Code CLI
- When AI writes code, toggle back to see editor
- Quick edit if needed, then back to terminal

### 2. File Navigation
When you need to check a file:
- Use terminal: `cat filename` or `less filename`
- Or toggle panel, use file explorer, toggle back
- Or use `Ctrl + P` → type filename → opens in editor

### 3. Multiple Terminals
- Create multiple terminals for different tasks
- Terminal 1: Claude Code CLI
- Terminal 2: Running dev server (`npm run dev`)
- Terminal 3: Git commands
- Switch between them via terminal dropdown

### 4. Split Terminal (Advanced)
- Hamburger menu → Terminal → Split Terminal
- Side-by-side terminals (works better on tablet/landscape)

---

## 🚀 Using Claude Code CLI

### In the Terminal:
```bash
# Start Claude Code (if installed globally)
claude

# Or use npx if not installed globally
npx @anthropic-ai/claude-code

# Example workflow
claude "help me build a React component"
```

### Best Practices:
1. **Use Zen Mode** (`View: Toggle Maximized Panel`) for focused terminal work
2. **Let Claude write code**, then toggle to editor to verify
3. **Keep terminal maximized** most of the time
4. **Use file explorer** only when you need to browse structure
5. **Copy/paste** works great on mobile browsers

---

## 📋 Keyboard Shortcuts Reference

### Essential (also available via hamburger menu)
- `Ctrl + `` - Toggle Terminal
- `Ctrl + P` - Quick Open File
- `Ctrl + Shift + P` or `F1` - Command Palette
- `Ctrl + J` - Toggle Panel (desktop)

### Terminal Shortcuts
- `Ctrl + C` - Cancel current command
- `Ctrl + L` - Clear terminal
- `Ctrl + Shift + 5` - Split terminal
- `Ctrl + Shift + `` - New terminal

### Mobile Note
On mobile, most shortcuts are accessed via:
1. **Hamburger menu** (≡) top-left
2. **Command Palette** (F1 or via menu)

---

## 🎨 Customization

### Change Theme
1. `F1` → Type "Color Theme"
2. Pick your favorite (current: Default Dark+)

### Adjust Font Size
Edit `~/.local/share/code-server/User/settings.json`:
```json
{
  "terminal.integrated.fontSize": 16,  // Bigger
  "editor.fontSize": 16
}
```

### Hide Status Bar (More Space)
```json
{
  "workbench.statusBar.visible": false
}
```

---

## 🐛 Troubleshooting

### Terminal Not Opening
- Try: `F1` → "Terminal: Create New Terminal"
- Reload page (Ctrl + R or refresh button)

### Slow Performance
- Close unused terminals
- Reload page
- Clear browser cache

### Can't Type in Terminal
- Click inside terminal area first
- Check if browser keyboard is open
- Try creating new terminal

---

## 📊 Comparison: code-server vs gemini-assistant

| Feature | code-server (dev.codeovertcp.com) | gemini-assistant (code.codeovertcp.com) |
|---------|-----------------------------------|----------------------------------------|
| **Terminal** | ✅ Full bash terminal | ❌ No terminal |
| **Editor** | ✅ Full VS Code editor | ❌ No editor |
| **Claude Code CLI** | ✅ Perfect for CLI work | ❌ Can't run CLI |
| **File Management** | ✅ Browse, edit, create | ❌ No file access |
| **Extensions** | ✅ Full extension support | ❌ N/A |
| **Mobile UI** | ✅ Optimized with settings | ⚠️ Basic chat interface |
| **Use Case** | **Primary development** | Backup web chat only |

**Recommendation**: Use code-server (dev.codeovertcp.com) as your primary interface.

---

## 🎯 Your Optimal Workflow

### Daily Workflow
1. **Open**: https://dev.codeovertcp.com on phone
2. **Terminal**: Open terminal immediately
3. **Maximize**: `F1` → "Toggle Maximized Panel"
4. **Claude**: Run Claude Code CLI
5. **Build**: Let Claude write code
6. **Verify**: Toggle panel to see editor when needed
7. **Repeat**: Stay in terminal, toggle when necessary

### When to Use Each Site
- **dev.codeovertcp.com** (code-server): 95% of the time
  - Running Claude Code CLI
  - Editing files
  - Git operations
  - Building/testing projects

- **code.codeovertcp.com** (gemini-assistant): 5% of the time
  - Quick questions when you can't access dev
  - Testing the Gemini 3 API
  - Demonstrating the web chat to others

---

## 📝 Configuration Files

### code-server Config
**Location**: `~/.config/code-server/config.yaml`
```yaml
bind-addr: 127.0.0.1:8080
auth: password
password: dawnofdoyle
cert: false
```

### VS Code Settings
**Location**: `~/.local/share/code-server/User/settings.json`
- Mobile-optimized settings already applied
- Edit this file to customize further

### Caddy Config
**Location**: `/etc/caddy/Caddyfile`
- dev.codeovertcp.com → code-server (port 8080)
- code.codeovertcp.com → gemini-assistant (static)
- sean.codeovertcp.com → portfolio hub

---

## 🔐 Security Notes

- **Password**: dawnofdoyle (change if needed)
- **HTTPS**: Enabled via Cloudflare Origin Certificate
- **Port**: code-server runs on localhost:8080 (proxied by Caddy)
- **Access**: Only accessible via HTTPS through Caddy reverse proxy

---

## 📚 Resources

- [code-server Docs](https://coder.com/docs/code-server)
- [VS Code Keyboard Shortcuts](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-linux.pdf)
- [Claude Code CLI Docs](https://github.com/anthropics/claude-code)

---

**Last Updated**: 2025-11-23
**Author**: Claude Code + Developer Collaboration
