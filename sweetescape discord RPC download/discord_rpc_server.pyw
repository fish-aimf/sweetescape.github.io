import asyncio
import websockets
import json
from pypresence import Presence
import threading
import time
import re
import sys
import pystray
from PIL import Image, ImageDraw
import subprocess
import os
from datetime import datetime

# Your Discord Application ID
CLIENT_ID = "1428031900877983825"

# Global state
rpc = None
connected_to_discord = False
discord_lock = threading.Lock()
server_stats = {
    "connected_clients": 0,
    "total_updates": 0,
    "uptime_start": None,
    "last_song": None,
    "last_artist": None,
    "last_update": None,
    "errors": 0
}
stats_lock = threading.Lock()

def init_discord():
    """Initialize Discord connection in a separate thread"""
    global rpc, connected_to_discord
    try:
        rpc = Presence(CLIENT_ID)
        rpc.connect()
        with discord_lock:
            connected_to_discord = True
    except Exception as e:
        with stats_lock:
            server_stats["errors"] += 1
        pass

def extract_youtube_id(url):
    """Extract YouTube video ID from URL"""
    if not url:
        return None
        
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def update_discord_rpc(song, artist, url):
    """Update Discord RPC in a thread-safe way"""
    try:
        video_id = extract_youtube_id(url)
        
        # Build RPC data with proper image handling
        rpc_data = {
            "details": f"Listening to \"{song}\"",
            "state": f"song by {artist}",
            "large_text": f"{song} • {artist}",
            "small_image": "favicon",
            "small_text": "sweetescape.vercel.app",
            "buttons": [
                {"label": "🎵 Listen on YouTube", "url": url},
                {"label": "🌐 Open SweetEscape", "url": "https://sweetescape.vercel.app"}
            ]
        }
        
        # Add large_image only if we have a valid video_id
        if video_id:
            rpc_data["large_image"] = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        else:
            rpc_data["large_image"] = "music_note"
        
        rpc.update(**rpc_data)
        
        # Update stats
        with stats_lock:
            server_stats["total_updates"] += 1
            server_stats["last_song"] = song
            server_stats["last_artist"] = artist
            server_stats["last_update"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return True
    except Exception as e:
        with stats_lock:
            server_stats["errors"] += 1
        return False

def clear_discord_rpc():
    """Clear Discord Rich Presence"""
    try:
        rpc.clear()
        return True
    except Exception as e:
        with stats_lock:
            server_stats["errors"] += 1
        return False

async def handle_client(websocket):
    global connected_to_discord
    
    with stats_lock:
        server_stats["connected_clients"] += 1
    
    if not connected_to_discord:
        discord_thread = threading.Thread(target=init_discord)
        discord_thread.start()
        discord_thread.join(timeout=5)
        
        if not connected_to_discord:
            await websocket.send("Error: Could not connect to Discord")
            return
    
    try:
        async for message in websocket:
            data = json.loads(message)
            
            song = data.get('song', 'Unknown')
            artist = data.get('artist', 'Unknown')
            url = data.get('url', '')
            
            loop = asyncio.get_event_loop()
            success = await loop.run_in_executor(None, update_discord_rpc, song, artist, url)
            
            if success:
                response = {
                    "status": "success",
                    "message": f"Rich Presence updated: {song} by {artist}",
                    "timestamp": datetime.now().isoformat()
                }
                await websocket.send(json.dumps(response))
            else:
                response = {
                    "status": "error",
                    "message": "Could not update Discord"
                }
                await websocket.send(json.dumps(response))
    
    except websockets.exceptions.ConnectionClosed:
        with stats_lock:
            server_stats["connected_clients"] -= 1
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, clear_discord_rpc)
    except Exception as e:
        with stats_lock:
            server_stats["errors"] += 1
        with stats_lock:
            server_stats["connected_clients"] -= 1

async def start_server():
    # ping_interval=None and ping_timeout=None reduce CPU usage on idle connections
    async with websockets.serve(handle_client, "localhost", 9112, ping_interval=None, ping_timeout=None):
        await asyncio.Future()

def create_icon():
    """Create system tray icon from sweetescapesystemtray.png or fallback"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        icon_path = os.path.join(script_dir, 'sweetescapesystemtray.png')
        
        if os.path.exists(icon_path):
            return Image.open(icon_path).resize((64, 64))
        
        # Fallback: create simple icon
        width = 64
        height = 64
        image = Image.new('RGB', (width, height), (30, 30, 30))
        dc = ImageDraw.Draw(image)
        dc.ellipse([16, 16, 48, 48], fill=(88, 101, 242))
        dc.ellipse([24, 32, 40, 48], fill=(255, 255, 255))
        return image
    except Exception as e:
        # Ultimate fallback
        width = 64
        height = 64
        image = Image.new('RGB', (width, height), (30, 30, 30))
        dc = ImageDraw.Draw(image)
        dc.ellipse([16, 16, 48, 48], fill=(88, 101, 242))
        return image

def get_uptime():
    """Calculate uptime in a readable format"""
    if not server_stats["uptime_start"]:
        return "0s"
    
    elapsed = time.time() - server_stats["uptime_start"]
    hours, remainder = divmod(int(elapsed), 3600)
    minutes, seconds = divmod(remainder, 60)
    
    if hours > 0:
        return f"{hours}h {minutes}m {seconds}s"
    elif minutes > 0:
        return f"{minutes}m {seconds}s"
    else:
        return f"{seconds}s"

def show_console(icon, item):
    """Show console window with detailed status"""
    with stats_lock:
        status = "✅ Connected" if connected_to_discord else "❌ Disconnected"
        uptime = get_uptime()
        last_song = server_stats["last_song"] or "None"
        last_artist = server_stats["last_artist"] or "None"
        last_update = server_stats["last_update"] or "Never"
        total_updates = server_stats["total_updates"]
        errors = server_stats["errors"]
        clients = server_stats["connected_clients"]
    
    if sys.platform == 'win32':
        script = f'''
import time
print("=" * 70)
print("🎵 DISCORD RPC SERVER - LIVE STATUS")
print("=" * 70)
print("")
print("📊 SERVER STATUS:")
print("  ✓ Server: Running on localhost:9112")
print("  ✓ Discord: {status}")
print("  ✓ Uptime: {uptime}")
print("")
print("📈 STATISTICS:")
print("  • Total Updates: {total_updates}")
print("  • Active Clients: {clients}")
print("  • Errors: {errors}")
print("")
print("🎧 CURRENT TRACK:")
print("  • Song: {last_song}")
print("  • Artist: {last_artist}")
print("  • Last Updated: {last_update}")
print("")
print("=" * 70)
print("💡 Close this window to hide the console")
print("=" * 70)
input("\\nPress Enter to close...")
'''
        subprocess.Popen(['python', '-c', script], creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        # Linux/macOS
        print("=" * 70)
        print("🎵 DISCORD RPC SERVER - LIVE STATUS")
        print("=" * 70)
        print(f"\n📊 SERVER STATUS:\n  ✓ Server: Running on localhost:9112\n  ✓ Discord: {status}\n  ✓ Uptime: {uptime}")
        print(f"\n📈 STATISTICS:\n  • Total Updates: {total_updates}\n  • Active Clients: {clients}\n  • Errors: {errors}")
        print(f"\n🎧 CURRENT TRACK:\n  • Song: {last_song}\n  • Artist: {last_artist}\n  • Last Updated: {last_update}")
        print("\n" + "=" * 70)

def quit_action(icon, item):
    """Quit the application"""
    if rpc and connected_to_discord:
        rpc.close()
    icon.stop()
    os._exit(0)

def main():
    # Initialize uptime tracker
    server_stats["uptime_start"] = time.time()
    
    # Start websocket server in background thread
    loop = asyncio.new_event_loop()
    
    def run_server():
        asyncio.set_event_loop(loop)
        loop.run_until_complete(start_server())
    
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    time.sleep(1)
    
    # Create and run system tray
    icon = pystray.Icon(
        "discord_rpc",
        create_icon(),
        "Discord RPC Server",
        menu=pystray.Menu(
            pystray.MenuItem("📊 Show Status", show_console),
            pystray.MenuItem("Quit", quit_action)
        )
    )
    
    icon.run()

if __name__ == "__main__":
    main()
