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

# Your Discord Application ID
CLIENT_ID = "1428031900877983825"

# Initialize Discord Rich Presence
rpc = None
connected_to_discord = False
discord_lock = threading.Lock()

def init_discord():
    """Initialize Discord connection in a separate thread"""
    global rpc, connected_to_discord
    try:
        rpc = Presence(CLIENT_ID)
        rpc.connect()
        with discord_lock:
            connected_to_discord = True
    except Exception as e:
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
            "details": f"🎧 Listening to {song}",
            "state": f"by {artist}",
            "large_text": f"🎶 {song} • {artist}",
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
        return True
    except Exception as e:
        return False

def clear_discord_rpc():
    """Clear Discord Rich Presence"""
    try:
        rpc.clear()
        return True
    except Exception as e:
        return False

async def handle_client(websocket):
    global connected_to_discord
    
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
                response = f"Rich Presence updated: {song} by {artist}"
                await websocket.send(response)
            else:
                await websocket.send("Error: Could not update Discord")
    
    except websockets.exceptions.ConnectionClosed:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, clear_discord_rpc)

async def start_server():
    async with websockets.serve(handle_client, "localhost", 9112):
        await asyncio.Future()

def create_icon():
    """Create system tray icon from sweetescapesystemtray.png or fallback"""
    try:
        # Try to load the icon (same directory as script)
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

def show_console(icon, item):
    """Show console window with status"""
    status = "Connected" if connected_to_discord else "Disconnected"
    if sys.platform == 'win32':
        script = f'''
print("=" * 60)
print("🚀 Discord RPC Server - Status")
print("=" * 60)
print("✅ Server: Running on localhost:8765")
print("✅ Discord: {status}")
print("")
print("💡 Close this window to hide")
print("=" * 60)
input("\\nPress Enter to close...")
'''
        subprocess.Popen(['python', '-c', script], creationflags=subprocess.CREATE_NEW_CONSOLE)

def quit_action(icon, item):
    """Quit the application"""
    if rpc and connected_to_discord:
        rpc.close()
    icon.stop()
    os._exit(0)

def main():
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
            pystray.MenuItem("Show Console", show_console),
            pystray.MenuItem("Quit", quit_action)
        )
    )
    
    icon.run()

if __name__ == "__main__":
    main()
