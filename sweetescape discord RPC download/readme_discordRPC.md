# 🎵 SweetEscape Discord RPC

Display your currently playing music from [SweetEscape](https://sweetescape.vercel.app) on your Discord profile!

## ✨ Features

- 🎧 Show what you're listening to on Discord
- 🖼️ Display YouTube video thumbnails
- 🔗 Clickable buttons to listen on YouTube or visit SweetEscape
- 🌐 Runs silently in system tray (no console clutter!)
- 🚀 Lightweight and easy to use

## 📦 Installation

### Prerequisites

- Python 3.7 or higher
- Discord Desktop App (must be running)

### Setup

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/sweetescape-discord-rpc.git
   cd sweetescape-discord-rpc
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Icon included**
   - The `sweetescapesystemtray.png` icon is included in the repository
   - The app will automatically use it for the system tray icon!

## 🚀 Usage

### Windows

**Run in background (recommended):**
```bash
pythonw discord_rpc_server.pyw
```
Or simply **double-click** `discord_rpc_server.pyw`

The app will start silently in your system tray!

### macOS/Linux

```bash
python discord_rpc_server.py
```

## 🎮 How to Use

1. **Start the server** (it will appear in your system tray)
2. **Open Discord** (make sure you're logged in)
3. **Visit** [sweetescape.vercel.app](https://sweetescape.vercel.app)
4. **Play a song** - your Discord status will update automatically!

## 🔧 System Tray Options

Right-click the tray icon for:
- **Show Console** - View connection status
- **Quit** - Stop the server

## 🛠️ Troubleshooting

**Discord not connecting?**
- Make sure Discord Desktop is running and you're logged in
- Close and restart the server

**Website not connecting?**
- Make sure the server is running (check system tray)
- The server runs on `localhost:8765`

**Icon not showing?**
- Check that `favicon.png` is in the same folder as the script
- Make sure the image is 64x64 or larger

## 📝 Requirements

- `pypresence` - Discord Rich Presence integration
- `websockets` - WebSocket server
- `pystray` - System tray support
- `Pillow` - Image handling

## 🤝 Contributing

Pull requests are welcome! Feel free to open an issue if you find bugs or have suggestions.

## 📄 License

MIT License - feel free to use and modify!

## 🙏 Credits

Created for [SweetEscape](https://sweetescape.vercel.app)

---

⭐ If you like this project, give it a star on GitHub!
