// Initialize Supabase
const supabaseUrl = 'https://cwhxanbpymkngzpbsshh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aHhhbmJweW1rbmd6cGJzc2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTQzMTksImV4cCI6MjA2OTQzMDMxOX0.6K3eM1XoWaPmyMHsLYgw0mAnSxYjME4clflL4PxQalQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let artists = [];

// Check if user is already logged in
supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
        currentUser = session.user;
        showMainApp();
    } else {
        currentUser = null;
        showLoginForm();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        currentUser = session.user;
        showMainApp();
    }
});

// Authentication functions
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('authError', 'Please enter both email and password');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        showError('authError', error.message);
    } else {
        currentUser = data.user;
        showSuccess('authSuccess', 'Login successful!');
        setTimeout(() => {
            clearMessages();
            showMainApp();
        }, 1000);
    }
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showError('appError', error.message);
    } else {
        currentUser = null;
        showLoginForm();
    }
}

// UI functions
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    clearInputs();
    clearMessages();
}

function showMainApp() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    loadArtistsAndSongs();
    updateUserInfo();
}

function clearInputs() {
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function clearMessages() {
    document.getElementById('authError').textContent = '';
    document.getElementById('authSuccess').textContent = '';
    document.getElementById('appError').textContent = '';
    document.getElementById('appSuccess').textContent = '';
}

function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function showSuccess(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function updateUserInfo() {
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.innerHTML = `Welcome, ${currentUser.email}`;
}

// Data loading functions
async function loadArtistsAndSongs() {
    try {
        // Load artists
        const { data: artistsData, error: artistsError } = await supabase
            .from('artists')
            .select('*')
            .order('name');

        if (artistsError) throw artistsError;

        // Load songs for each artist
        const { data: songsData, error: songsError } = await supabase
            .from('songs')
            .select('*')
            .order('name');

        if (songsError) throw songsError;

        artists = artistsData.map(artist => ({
            ...artist,
            songs: songsData.filter(song => song.artist_id === artist.id)
        }));

        displayArtists();
        updateArtistSelect();

    } catch (error) {
        showError('appError', 'Error loading data: ' + error.message);
    }
}

function displayArtists() {
    const container = document.getElementById('artistsContainer');
    
    if (artists.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No playlists found.</p>';
        return;
    }

    container.innerHTML = artists.map(artist => `
        <div class="artist-card">
            <div class="artist-header">
                <div class="artist-name">🎵 ${artist.name}</div>
                <button onclick="deleteArtist(${artist.id})" class="btn-danger">Delete Playlist</button>
            </div>
            <div class="songs">
                ${artist.songs.length === 0 ? '<p>No songs yet.</p>' : 
                    artist.songs.map(song => `
                        <div class="song-item">
                            <div class="song-name">${song.name}</div>
                            <div class="song-author">by ${song.author}</div>
                            <div class="song-url">
                                <a href="${song.youtube_url}" target="_blank">${song.youtube_url}</a>
                            </div>
                            <button onclick="deleteSong(${song.id})" class="btn-danger" style="margin-top: 10px;">Delete Song</button>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `).join('');
}

function updateArtistSelect() {
    const select = document.getElementById('songArtistSelect');
    select.innerHTML = '<option value="">Select Playlist</option>' + 
        artists.map(artist => `<option value="${artist.id}">🎵 ${artist.name}</option>`).join('');
    // Also update mass import select
const massImportSelect = document.getElementById('massImportArtistSelect');
massImportSelect.innerHTML = '<option value="">Select Playlist</option>' + 
    artists.map(artist => `<option value="${artist.id}">🎵 ${artist.name}</option>`).join('');
}

// Playlist CRUD operations
async function addArtist() {
    const name = document.getElementById('newArtistName').value.trim();
    
    if (!name) {
        showError('appError', 'Please enter a playlist name');
        return;
    }

    const { data, error } = await supabase
        .from('artists')
        .insert([{ name: name, created_by: currentUser.id }])
        .select();

    if (error) {
        showError('appError', 'Error creating playlist: ' + error.message);
    } else {
        showSuccess('appSuccess', 'Playlist created successfully!');
        document.getElementById('newArtistName').value = '';
        loadArtistsAndSongs();
        setTimeout(() => clearMessages(), 3000);
    }
}

async function addSong() {
    const artistId = document.getElementById('songArtistSelect').value;
    const name = document.getElementById('newSongName').value.trim();
    const author = document.getElementById('newSongAuthor').value.trim();
    const youtubeUrl = document.getElementById('newSongUrl').value.trim();

    if (!artistId || !name || !author || !youtubeUrl) {
        showError('appError', 'Please fill in all song fields');
        return;
    }

    // Basic YouTube URL validation
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
        showError('appError', 'Please enter a valid YouTube URL');
        return;
    }

    const { data, error } = await supabase
        .from('songs')
        .insert([{
            name: name,
            author: author,
            youtube_url: youtubeUrl,
            artist_id: parseInt(artistId),
            created_by: currentUser.id
        }])
        .select();

    if (error) {
        showError('appError', 'Error adding song: ' + error.message);
    } else {
        showSuccess('appSuccess', 'Song added successfully!');
        // Clear form
        document.getElementById('songArtistSelect').value = '';
        document.getElementById('newSongName').value = '';
        document.getElementById('newSongAuthor').value = '';
        document.getElementById('newSongUrl').value = '';
        loadArtistsAndSongs();
        setTimeout(() => clearMessages(), 3000);
    }
}

async function deleteArtist(artistId) {
    if (!confirm('Are you sure you want to delete this playlist and all its songs?')) {
        return;
    }

    const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artistId);

    if (error) {
        showError('appError', 'Error deleting playlist: ' + error.message);
    } else {
        showSuccess('appSuccess', 'Playlist deleted successfully!');
        loadArtistsAndSongs();
        setTimeout(() => clearMessages(), 3000);
    }
}

async function deleteSong(songId) {
    if (!confirm('Are you sure you want to delete this song?')) {
        return;
    }

    const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);

    if (error) {
        showError('appError', 'Error deleting song: ' + error.message);
    } else {
        showSuccess('appSuccess', 'Song deleted successfully!');
        loadArtistsAndSongs();
        setTimeout(() => clearMessages(), 3000);
    }
}

async function massImportSongs() {
    const artistId = document.getElementById('massImportArtistSelect').value;
    const importText = document.getElementById('massImportText').value.trim();

    if (!artistId) {
        showError('appError', 'Please select a playlist');
        return;
    }

    if (!importText) {
        showError('appError', 'Please enter songs to import');
        return;
    }

    const lines = importText.split('\n').filter(line => line.trim());
    const songsToImport = [];
    const errors = [];

    lines.forEach((line, index) => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length < 2) {
            errors.push(`Line ${index + 1}: Missing name or URL`);
            return;
        }

        const name = parts[0];
        const youtubeUrl = parts[1];
        const author = parts[2] || 'Unknown';

        if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
            errors.push(`Line ${index + 1}: Invalid YouTube URL`);
            return;
        }

        songsToImport.push({
            name: name,
            author: author,
            youtube_url: youtubeUrl,
            artist_id: parseInt(artistId),
            created_by: currentUser.id
        });
    });

    if (errors.length > 0) {
        showError('appError', 'Import errors:\n' + errors.join('\n'));
        return;
    }

    const { data, error } = await supabase
        .from('songs')
        .insert(songsToImport)
        .select();

    if (error) {
        showError('appError', 'Error importing songs: ' + error.message);
    } else {
        showSuccess('appSuccess', `Successfully imported ${songsToImport.length} songs!`);
        document.getElementById('massImportText').value = '';
        document.getElementById('massImportArtistSelect').value = '';
        loadArtistsAndSongs();
        setTimeout(() => clearMessages(), 3000);
    }
}
