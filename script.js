class AdvancedMusicPlayer {
    constructor() {
        this.playlists = [];
        this.songLibrary = [];
        this.db = null;

        this.currentPlaylist = null;
        this.currentSongIndex = 0;
        this.ytPlayer = null;
        this.isPlaying = false;
        this.isLooping = false;
        this.progressBar = null;
        this.progressInterval = null;
        this.isSidebarVisible = false;
        this.listeningTime = 0;
        this.listeningTimeInterval = null;
        this.listeningTimeDisplay = document.getElementById('listeningTime');
        this.currentSpeed = 1;

        this.initDatabase().then(() => {
            return Promise.all([
                this.loadSongLibrary(),
                this.loadPlaylists(),
                this.loadSettings()
            ]);
        }).then(() => {
            this.setupYouTubePlayer();
            this.initializeElements();
            this.setupEventListeners();
            this.initializeTheme();
            this.renderInitialState();
        }).catch(error => {
            console.error('Error initializing music player:', error);
        });
    }
    initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MusicPlayerDB', 1);
            
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject('Could not open IndexedDB');
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('songLibrary')) {
                    db.createObjectStore('songLibrary', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('playlists')) {
                    db.createObjectStore('playlists', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'name' });
                }
            };
        });
    }

    initializeElements() {
        this.elements = {
            songNameInput: document.getElementById('songName'),
            songUrlInput: document.getElementById('songUrl'),
            addSongBtn: document.getElementById('addSongBtn'),
            songLibrary: document.getElementById('songLibrary'),
            librarySearch: document.getElementById('librarySearch'),

            newPlaylistName: document.getElementById('newPlaylistName'),
            createPlaylistBtn: document.getElementById('createPlaylistBtn'),
            playlistContainer: document.getElementById('playlistContainer'),
            timeDisplay: document.getElementById('timeDisplay'),
            playlistEditModal: document.getElementById('playlistEditModal'),
            closePlaylistModalBtn: document.getElementById('closePlaylistModal'),
            currentPlaylistName: document.getElementById('currentPlaylistName'),
            searchSongsToAdd: document.getElementById('searchSongsToAdd'),
            librarySearchResults: document.getElementById('librarySearchResults'),
            currentPlaylistSongs: document.getElementById('currentPlaylistSongs'),
            
            playlistSongsModal: document.getElementById('playlistSongsModal'),
            playlistSongsContent: document.getElementById('playlistSongsContent'),
            addSongToPlaylistBtn: document.getElementById('addSongToPlaylistBtn'),
            playlistSelectionForSong: document.getElementById('playlistSelectionForSong'),
          
            importLibraryBtn: document.getElementById('importLibraryBtn'),
            exportLibraryBtn: document.getElementById('exportLibraryBtn'),
            modifyLibraryBtn: document.getElementById('modifyLibraryBtn'),
            libraryModificationModal: document.getElementById('libraryModificationModal'),
            closeLibraryModalBtn: document.getElementById('closeLibraryModal'),
            songNameInput: document.getElementById('songName'),
            songUrlInput: document.getElementById('songUrl'),
            addSongBtn: document.getElementById('addSongBtn'),
            songLibrary: document.getElementById('songLibrary'),
            librarySearch: document.getElementById('librarySearch'),
            importLibraryBtn: document.getElementById('importLibraryBtn'),
            exportLibraryBtn: document.getElementById('exportLibraryBtn'),

            progressBar: document.getElementById('musicProgressBar'),
            currentSongName: document.getElementById('currentSongName'),
            nextSongName: document.getElementById('nextSongName'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            loopBtn: document.getElementById('loopBtn'),
            showPlaylistBtn: document.getElementById('showPlaylistBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            currentPlaylistSidebar: document.getElementById('currentPlaylistSidebar'),
            sidebarPlaylistName: document.getElementById('sidebarPlaylistName'),
            sidebarPlaylistSongs: document.getElementById('sidebarPlaylistSongs'),
            closeSidebarBtn: document.getElementById('closeSidebarBtn'),
            youtubeSearchSuggestion: document.getElementById('youtubeSearchSuggestion'),
            listeningTimeDisplay: document.getElementById('listeningTime'),
            speedBtn: document.getElementById('speedBtn'),
            speedOptions: document.getElementById('speedOptions'),

            tabs: document.querySelectorAll('.tab'),
            tabPanes: document.querySelectorAll('.tab-pane'),
            themeToggle: document.getElementById('themeToggle')
            
        };
        if (this.elements.speedBtn) {
            this.elements.speedBtn.textContent = this.currentSpeed + 'x';
        }
    }

    setupEventListeners() {
        this.handleAddSong = this.addSongToLibrary.bind(this);
        this.handleFilterLibrary = this.filterLibrarySongs.bind(this);
        this.handleLibrarySearchKeydown = (e) => {
            if (e.key === 'Enter' && this.elements.youtubeSearchSuggestion.style.display !== 'none') {
                const searchTerm = this.elements.librarySearch.value.trim();
                this.searchYouTube(searchTerm);
            }
        };
        this.handleCreatePlaylist = this.createPlaylist.bind(this);
        this.handleClosePlaylistModal = this.closePlaylistModal.bind(this);
        this.handleSearchSongsToAdd = this.searchSongsToAddToPlaylist.bind(this);
        this.handleAddSongToPlaylist = this.addSongToSelectedPlaylist.bind(this);
        this.handleSeekMusic = this.seekMusic.bind(this);
        this.handleTogglePlayPause = this.togglePlayPause.bind(this);
        this.handlePlayPrevious = this.playPreviousSong.bind(this);
        this.handlePlayNext = this.playNextSong.bind(this);
        this.handleToggleLoop = this.toggleLoop.bind(this);
        this.handleVolumeChange = (e) => this.setVolume(e.target.value);
        this.handleToggleSidebar = this.togglePlaylistSidebar.bind(this);
        this.handleOpenLibraryModal = this.openLibraryModal.bind(this);
        this.handleCloseLibraryModal = this.closeLibraryModal.bind(this);

        this.elements.modifyLibraryBtn.addEventListener('click', this.handleOpenLibraryModal);
        this.elements.closeLibraryModalBtn.addEventListener('click', this.handleCloseLibraryModal);
        this.handleToggleTheme = this.toggleTheme.bind(this);
        this.handleToggleSpeedOptions = this.toggleSpeedOptions.bind(this);
        this.handleSpeedOptionClick = (e) => this.setPlaybackSpeed(parseFloat(e.target.dataset.speed));
        this.handleImportLibrary = this.showImportModal.bind(this);
        this.handleExportLibrary = this.exportLibrary.bind(this);

        this.elements.importLibraryBtn.addEventListener('click', this.handleImportLibrary);
        this.elements.exportLibraryBtn.addEventListener('click', this.handleExportLibrary);

        this.elements.addSongBtn.addEventListener('click', this.handleAddSong);
        this.elements.librarySearch?.addEventListener('input', this.handleFilterLibrary);
        this.elements.librarySearch?.addEventListener('keydown', this.handleLibrarySearchKeydown);
        this.elements.createPlaylistBtn.addEventListener('click', this.handleCreatePlaylist);
        this.elements.closePlaylistModalBtn.addEventListener('click', this.handleClosePlaylistModal);
        this.elements.searchSongsToAdd?.addEventListener('input', this.handleSearchSongsToAdd);
        this.elements.addSongToPlaylistBtn?.addEventListener('click', this.handleAddSongToPlaylist);
        this.elements.progressBar?.addEventListener('click', this.handleSeekMusic);
        this.elements.playPauseBtn.addEventListener('click', this.handleTogglePlayPause);
        this.elements.prevBtn.addEventListener('click', this.handlePlayPrevious);
        this.elements.nextBtn.addEventListener('click', this.handlePlayNext);
        this.elements.loopBtn.addEventListener('click', this.handleToggleLoop);
        this.elements.volumeSlider.addEventListener('input', this.handleVolumeChange);
        this.elements.showPlaylistBtn.addEventListener('click', this.handleToggleSidebar);
      
        
        this.handleSongUrlInput = this.validateYouTubeUrl.bind(this);

        this.elements.songUrlInput.addEventListener('input', this.handleSongUrlInput);
        this.elements.closeSidebarBtn.addEventListener('click', this.handleToggleSidebar);
        this.elements.themeToggle.addEventListener('click', this.handleToggleTheme);
        this.elements.speedBtn.addEventListener('click', this.handleToggleSpeedOptions);
        this.handleSongUrlKeydown = (e) => {
            if (e.key === 'Enter') {
                this.addSongToLibrary();
            }
        };

        this.elements.songUrlInput.addEventListener('keydown', this.handleSongUrlKeydown);

        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', this.handleSpeedOptionClick);
        });

        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    }
     loadSongLibrary() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['songLibrary'], 'readonly');
            const store = transaction.objectStore('songLibrary');
            const request = store.getAll();

            request.onsuccess = () => {
                this.songLibrary = request.result || [];
                this.songLibrary = this.songLibrary.map(song => {
                    if (song.favorite === undefined) {
                        song.favorite = false;
                    }
                    return song;
                });
                if (this.songLibrary.some(song => song.favorite === undefined)) {
                    this.saveSongLibrary().then(resolve).catch(reject);
                } else {
                    resolve();
                }
            };

            request.onerror = (event) => {
                console.error('Error loading song library:', event.target.error);
                reject('Could not load song library');
            };
        });
    }
    loadPlaylists() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(['playlists'], 'readonly');
            const store = transaction.objectStore('playlists');
            const request = store.getAll();
            
            request.onsuccess = () => {
                this.playlists = request.result || [];
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Error loading playlists:', event.target.error);
                reject('Could not load playlists');
            };
        });
    }
    loadSettings() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            
            const timeRequest = store.get('listeningTime');
            timeRequest.onsuccess = () => {
                if (timeRequest.result) {
                    this.listeningTime = timeRequest.result.value || 0;
                }
            };
            const speedRequest = store.get('playbackSpeed');
            speedRequest.onsuccess = () => {
                if (speedRequest.result) {
                    this.currentSpeed = speedRequest.result.value || 1;
                }
            };
            
            transaction.oncomplete = () => {
                resolve();
            };
            
            transaction.onerror = (event) => {
                console.error('Error loading settings:', event.target.error);
                reject('Could not load settings');
            };
        });
    }
    setupProgressBar() {
        if (!this.elements.progressBar) return;
    }

    updateProgressBar() {
        if (!this.ytPlayer || !this.elements.progressBar) return;

        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(() => {
            if (this.ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                const currentTime = this.ytPlayer.getCurrentTime();
                const duration = this.ytPlayer.getDuration();

                if (duration > 0) {
                    const progressPercent = (currentTime / duration) * 100;
                    this.elements.progressBar.value = progressPercent;

                    if (this.elements.timeDisplay) {
                        const formattedCurrentTime = this.formatTime(currentTime);
                        const formattedDuration = this.formatTime(duration);
                        this.elements.timeDisplay.textContent = `${formattedCurrentTime}/${formattedDuration}`;
                    }
                }
            }
        }, 1000);
    }

    seekMusic(e) {
        if (!this.ytPlayer) return;

        const duration = this.ytPlayer.getDuration();
        const clickPosition = e.offsetX / this.elements.progressBar.offsetWidth;
        const seekTime = duration * clickPosition;

        this.ytPlayer.seekTo(seekTime, true);
        if (this.elements.timeDisplay) {
            const formattedCurrentTime = this.formatTime(seekTime);
            const formattedDuration = this.formatTime(duration);
            this.elements.timeDisplay.textContent = `${formattedCurrentTime}/${formattedDuration}`;
        }
    }


    addSongToLibrary() {
        const songName = this.elements.songNameInput.value.trim();
        const songUrl = this.elements.songUrlInput.value.trim();

        if (!songName || !songUrl) return;

        const videoId = this.extractYouTubeId(songUrl);
        if (!videoId) {
            alert('Invalid YouTube URL');
            return;
        }

        if (this.songLibrary.some(song => song.videoId === videoId)) {
            alert('This song is already in the library');
            return;
        }

        const newSong = {
            id: Date.now(),
            name: songName,
            videoId: videoId
        };

        this.songLibrary.push(newSong);
        this.saveSongLibrary()
            .then(() => {
                this.renderSongLibrary();
                this.updatePlaylistSelection();

                this.elements.songNameInput.value = '';
                this.elements.songUrlInput.value = '';
                this.removeYouTubeThumbnailPreview();
          
                this.closeLibraryModal();
            })
            .catch(error => {
                console.error('Error adding song to library:', error);
                alert('Failed to save song. Please try again.');
            });
    }

    renderSongLibrary() {
        this.elements.songLibrary.innerHTML = '';

        const sortedLibrary = [...this.songLibrary].sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            return 0;
        });

        sortedLibrary.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-item');
            songElement.innerHTML = `
                <span>${song.name}</span>
                <div class="song-actions">
                    <button class="favorite-btn" onclick="musicPlayer.toggleFavorite(${song.id})">
                        <i class="fa ${song.favorite ? 'fa-star' : 'fa-star-o'}"></i>
                    </button>
                    <button onclick="musicPlayer.playSong(${song.id})">Play</button>
                    <button onclick="musicPlayer.removeSong(${song.id})">Remove</button>
                </div>
            `;
            this.elements.songLibrary.appendChild(songElement);
        });
    }

    filterLibrarySongs() {
        const searchTerm = this.elements.librarySearch.value.toLowerCase();
        const songItems = this.elements.songLibrary.querySelectorAll('.song-item');
        
        let resultsFound = false;
        
        songItems.forEach(item => {
            const songName = item.querySelector('span').textContent.toLowerCase();
            const isVisible = songName.includes(searchTerm);
            item.style.display = isVisible ? 'flex' : 'none';
            
            if (isVisible) {
                resultsFound = true;
            }
        });
        
        if (!resultsFound && searchTerm.trim() !== '') {
            this.showYouTubeSearchSuggestion(searchTerm);
        } else {
            this.hideYouTubeSearchSuggestion();
        }
    }

    showYouTubeSearchSuggestion(searchTerm) {
        const querySpan = this.elements.youtubeSearchSuggestion.querySelector('.search-query');
        querySpan.textContent = `Search for "${searchTerm}" on YouTube`;
        
        this.elements.youtubeSearchSuggestion.style.display = 'block';
        
        this.elements.youtubeSearchSuggestion.onclick = null;
        
        this.elements.youtubeSearchSuggestion.onclick = () => {
            this.searchYouTube(searchTerm);
        };
    }

    hideYouTubeSearchSuggestion() {
        this.elements.youtubeSearchSuggestion.style.display = 'none';
    }

    searchYouTube(searchTerm) {
        this.elements.songNameInput.value = searchTerm;

        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
        window.open(searchUrl, '_blank');
        this.openLibraryModal();
    }
    removeSong(songId) {
        this.songLibrary = this.songLibrary.filter(song => song.id !== songId);
        this.saveSongLibrary()
            .then(() => {
                this.renderSongLibrary();
                this.updatePlaylistSelection();
            })
            .catch(error => {
                console.error('Error removing song:', error);
                alert('Failed to remove song. Please try again.');
            });
    }

    createPlaylist() {
        const playlistName = this.elements.newPlaylistName.value.trim();
        if (!playlistName) {
            alert('Please enter a playlist name');
            return;
        }

        if (this.playlists.some(p => p.name.toLowerCase() === playlistName.toLowerCase())) {
            alert('A playlist with this name already exists');
            return;
        }

        const newPlaylist = {
            id: Date.now(),
            name: playlistName,
            songs: []
        };

        this.playlists.push(newPlaylist);
        this.savePlaylists()
            .then(() => {
                this.renderPlaylists();
                this.updatePlaylistSelection();
                this.elements.newPlaylistName.value = '';
            })
            .catch(error => {
                console.error('Error creating playlist:', error);
                alert('Failed to create playlist. Please try again.');
            });
    }

    renderPlaylists() {
        this.elements.playlistContainer.innerHTML = '';
        this.playlists.forEach(playlist => {
            const playlistElement = document.createElement('div');
            playlistElement.classList.add('playlist-card');
            playlistElement.innerHTML = `
                <h3>${playlist.name}</h3>
                <p>${playlist.songs.length} songs</p>
                <div class="playlist-actions">
                    <button onclick="musicPlayer.openPlaylistEditModal(${playlist.id})">Edit</button>
                    <button onclick="musicPlayer.deletePlaylist(${playlist.id})">Delete</button>
                    <button onclick="musicPlayer.playPlaylist(${playlist.id})">Play</button>
                </div>
            `;
            this.elements.playlistContainer.appendChild(playlistElement);
        });
    }

    openPlaylistEditModal(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        this.elements.currentPlaylistName.textContent = playlist.name;
        this.elements.currentPlaylistName.dataset.playlistId = playlistId;
        this.renderCurrentPlaylistSongs(playlist);
        this.renderLibrarySearchResults(playlist);

        this.elements.playlistEditModal.style.display = 'block';
    }

    renderCurrentPlaylistSongs(playlist) {
        this.elements.currentPlaylistSongs.innerHTML = '';
        playlist.songs.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.classList.add('playlist-song-item');
            songElement.draggable = true;
            songElement.dataset.videoId = song.videoId;
            songElement.dataset.index = index;
            songElement.innerHTML = `
                <span class="drag-handle">☰</span>
                <span class="song-name">${song.name}</span>
                <button onclick="musicPlayer.removeSongFromPlaylist(${playlist.id}, '${song.videoId}')">Remove</button>
            `;
            songElement.addEventListener('dragstart', this.handleDragStart.bind(this));
            songElement.addEventListener('dragover', this.handleDragOver.bind(this));
            songElement.addEventListener('drop', this.handleDrop.bind(this));
            songElement.addEventListener('dragend', this.handleDragEnd.bind(this));

            this.elements.currentPlaylistSongs.appendChild(songElement);
        });
    }
    searchSongsToAddToPlaylist() {
        const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        this.renderLibrarySearchResults(playlist);
    }

    renderLibrarySearchResults(playlist) {
        const searchTerm = this.elements.searchSongsToAdd.value.toLowerCase();
        this.elements.librarySearchResults.innerHTML = '';

        this.songLibrary.forEach(song => {
            if (playlist.songs.some(ps => ps.videoId === song.videoId)) return;

            if (song.name.toLowerCase().includes(searchTerm)) {
                const songElement = document.createElement('div');
                songElement.classList.add('search-song-item');
                songElement.innerHTML = `
                    <span>${song.name}</span>
                    <button onclick="musicPlayer.addSongToCurrentPlaylist('${song.name}', '${song.videoId}')">Add</button>
                `;
                this.elements.librarySearchResults.appendChild(songElement);
            }
        });
    }

    addSongToCurrentPlaylist(songName, videoId) {
        const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        if (playlist.songs.some(song => song.videoId === videoId)) {
            alert('This song is already in the playlist');
            return;
        }

        playlist.songs.push({ name: songName, videoId: videoId });
        this.savePlaylists()
            .then(() => {
                this.renderCurrentPlaylistSongs(playlist);
                this.renderLibrarySearchResults(playlist);
                this.renderPlaylists();
            })
            .catch(error => {
                console.error('Error adding song to playlist:', error);
                alert('Failed to add song to playlist. Please try again.');
            });
    }

    addSongToSelectedPlaylist() {
        const selectedPlaylistId = parseInt(this.elements.playlistSelectionForSong.value);
        const selectedSongName = this.elements.songNameInput.value.trim();
        const selectedSongUrl = this.elements.songUrlInput.value.trim();

        if (!selectedSongName || !selectedSongUrl) {
            alert('Please enter song name and URL');
            return;
        }

        const videoId = this.extractYouTubeId(selectedSongUrl);
        if (!videoId) {
            alert('Invalid YouTube URL');
            return;
        }

        const newSong = {
            id: Date.now(),
            name: songName,
            videoId: videoId,
            favorite: false  
        };

        const playlist = this.playlists.find(p => p.id === selectedPlaylistId);
        if (playlist) {
            if (playlist.songs.some(song => song.videoId === videoId)) {
                alert('This song is already in the playlist');
                return;
            }

            playlist.songs.push(newSong);
            this.savePlaylists();
            this.renderPlaylists();
            
            this.elements.songNameInput.value = '';
            this.elements.songUrlInput.value = '';
        }
    }

    updatePlaylistSelection() {
        if (this.elements.playlistSelectionForSong) {
            this.elements.playlistSelectionForSong.innerHTML = '';
            this.playlists.forEach(playlist => {
                const option = document.createElement('option');
                option.value = playlist.id;
                option.textContent = playlist.name;
                this.elements.playlistSelectionForSong.appendChild(option);
            });
        }
    }

    removeSongFromPlaylist(playlistId, videoId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist) {
            playlist.songs = playlist.songs.filter(song => song.videoId !== videoId);
            this.savePlaylists()
                .then(() => {
                    this.renderCurrentPlaylistSongs(playlist);
                    this.renderLibrarySearchResults(playlist);
                    this.renderPlaylists();
                    if (this.currentPlaylist && this.currentPlaylist.id === playlistId) {
                        this.renderPlaylistSidebar();
                    }
                })
                .catch(error => {
                    console.error('Error removing song from playlist:', error);
                    alert('Failed to remove song from playlist. Please try again.');
                });
        }
    }

    closePlaylistModal() {
        if (this.elements.playlistEditModal) {
            this.elements.playlistEditModal.style.display = 'none';
        }
        if (this.elements.playlistSongsModal) {
            this.elements.playlistSongsModal.style.display = 'none';
        }
    }

    deletePlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        const confirmDelete = confirm(`Are you sure you want to delete the playlist "${playlist.name}"?`);
        if (!confirmDelete) return;
        if (this.currentPlaylist && this.currentPlaylist.id === playlistId) {
            if (this.ytPlayer) {
                this.ytPlayer.stopVideo();
            }
            this.currentPlaylist = null;
            this.isPlaying = false;
            this.updatePlayerUI();
            this.hideSidebar();
        }
        this.playlists = this.playlists.filter(p => p.id !== playlistId);
        this.savePlaylists()
            .then(() => {
                this.renderPlaylists();
                this.updatePlaylistSelection();
            })
            .catch(error => {
                console.error('Error deleting playlist:', error);
                alert('Failed to delete playlist. Please try again.');
            });
    }

    playPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist || !playlist.songs.length) {
            alert('Playlist is empty');
            return;
        }

        this.currentPlaylist = playlist;
        this.currentSongIndex = 0;
        this.playSongById(playlist.songs[0].videoId);
        this.showSidebar();
        this.renderPlaylistSidebar();
    }

    playSong(songId) {
        const song = this.songLibrary.find(s => s.id === songId);
        if (!song) return;

        this.currentPlaylist = null;
        this.currentSongIndex = this.songLibrary.findIndex(s => s.id === songId);
        this.playSongById(song.videoId);
        this.hideSidebar();
    }

    playSongById(videoId) {
        if (this.ytPlayer) {
            this.ytPlayer.loadVideoById(videoId);
            this.ytPlayer.playVideo();
            this.isPlaying = true;
            this.updatePlayerUI();
            
            if (this.elements.progressBar) {
                this.elements.progressBar.value = 0;
            }
            
            if (this.currentPlaylist && this.isSidebarVisible) {
                this.renderPlaylistSidebar();
            }
            if (this.ytPlayer && this.currentSpeed !== 1) {
                setTimeout(() => {
                    this.ytPlayer.setPlaybackRate(this.currentSpeed);
                }, 500);
            }
        }
    }

    togglePlayPause() {
        if (!this.ytPlayer) return;

        if (this.isPlaying) {
            this.ytPlayer.pauseVideo();
            this.isPlaying = false;
        } else {
            this.ytPlayer.playVideo();
            this.isPlaying = true;
        }
        this.updatePlayerUI();
    }

    playNextSong() {
        const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
        
        if (!source.length) return;

        this.currentSongIndex = (this.currentSongIndex + 1) % source.length;
        
        if (this.currentPlaylist) {
            this.playSongById(source[this.currentSongIndex].videoId);
        } else {
            this.playCurrentSong();
        }
    }

    playPreviousSong() {
        const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
        
        if (!source.length) return;

        this.currentSongIndex = (this.currentSongIndex - 1 + source.length) % source.length;
        
        if (this.currentPlaylist) {
            this.playSongById(source[this.currentSongIndex].videoId);
        } else {
            this.playCurrentSong();
        }
    }

    playCurrentSong() {
        if (!this.songLibrary.length) return;

        const currentSong = this.songLibrary[this.currentSongIndex];
        
        if (this.ytPlayer) {
            this.ytPlayer.loadVideoById(currentSong.videoId);
            this.ytPlayer.playVideo();
            this.isPlaying = true;
            this.updatePlayerUI();
        }
    }

    playSongFromPlaylist(index) {
        if (!this.currentPlaylist || index >= this.currentPlaylist.songs.length) return;
        
        this.currentSongIndex = index;
        this.playSongById(this.currentPlaylist.songs[index].videoId);
    }

    updatePlayerUI() {
        const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
        
        if (!source.length) return;

        const currentSong = source[this.currentSongIndex];
        const nextSongIndex = (this.currentSongIndex + 1) % source.length;
        const nextSong = source[nextSongIndex];

        this.elements.currentSongName.textContent = currentSong.name;
        
        if (this.isLooping) {
            this.elements.nextSongName.textContent = currentSong.name;
        } else {
            this.elements.nextSongName.textContent = nextSong.name;
        }

        const playPauseIcon = this.elements.playPauseBtn.querySelector('i');
        playPauseIcon.classList.remove('fa-play', 'fa-pause');
        playPauseIcon.classList.add(this.isPlaying ? 'fa-pause' : 'fa-play');
        if (this.currentPlaylist && this.isSidebarVisible) {
            this.renderPlaylistSidebar();
        }
    }
    togglePlaylistSidebar() {
        if (this.isSidebarVisible) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }
    
    showSidebar() {
        if (!this.currentPlaylist) return;
        
        this.elements.currentPlaylistSidebar.classList.add('visible');
        this.isSidebarVisible = true;
        this.renderPlaylistSidebar();
    }
    
    hideSidebar() {
        this.elements.currentPlaylistSidebar.classList.remove('visible');
        this.isSidebarVisible = false;
    }
    
    renderPlaylistSidebar() {
        if (!this.currentPlaylist) return;
        
        this.elements.sidebarPlaylistName.textContent = this.currentPlaylist.name;
        this.elements.sidebarPlaylistSongs.innerHTML = '';
        
        this.currentPlaylist.songs.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.classList.add('sidebar-song-item');
            
            if (index === this.currentSongIndex) {
                songElement.classList.add('active');
            }
            
            songElement.innerHTML = `
                <span>${index + 1}. ${song.name}</span>
            `;
            
            songElement.addEventListener('click', () => this.playSongFromPlaylist(index));
            
            this.elements.sidebarPlaylistSongs.appendChild(songElement);
        });
        if (this.currentPlaylist.songs.length > 0) {
            const activeElement = this.elements.sidebarPlaylistSongs.querySelector('.sidebar-song-item.active');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    setupYouTubePlayer() {
        if (window.YT && window.YT.Player) {
            this.initializeYouTubePlayer();
        } else {
            window.onYouTubeIframeAPIReady = () => this.initializeYouTubePlayer();
        }
    }

    initializeYouTubePlayer() {
        this.ytPlayer = new YT.Player('ytPlayer', {
            height: '0',
            width: '0',
            events: {
                'onStateChange': this.onPlayerStateChange.bind(this)
            }
        });
    }

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            if (this.isLooping) {
                this.playSongById(
                    this.currentPlaylist 
                    ? this.currentPlaylist.songs[this.currentSongIndex].videoId 
                    : this.songLibrary[this.currentSongIndex].videoId
                );
            } else {
                this.playNextSong();
            }

            if (this.elements.progressBar) {
                this.elements.progressBar.value = 0;
            }
        }

        if (event.data === YT.PlayerState.PLAYING) {
            if (this.currentSpeed !== 1) {
                this.ytPlayer.setPlaybackRate(this.currentSpeed);
            }
            this.updateProgressBar();
            this.startListeningTimeTracking();
        } else {
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
            }
        }
    }
    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.elements.loopBtn.classList.toggle('active', this.isLooping);
        
        this.updatePlayerUI();
    }

    setVolume(volume) {
        if (this.ytPlayer) {
            this.ytPlayer.setVolume(volume);
        }
    }

    initializeTheme() {
        if (!this.db) {
            document.documentElement.setAttribute('data-theme', 'light');
            this.updateThemeIcon('light');
            return;
        }

        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get('theme');
        
        request.onsuccess = () => {
            const savedTheme = request.result ? request.result.value : 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        };
        
        request.onerror = (event) => {
            console.error('Error loading theme setting:', event.target.error);
          
            document.documentElement.setAttribute('data-theme', 'light');
            this.updateThemeIcon('light');
        };
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.saveSetting('theme', newTheme)
            .then(() => {
                this.updateThemeIcon(newTheme);
            })
            .catch(error => {
                console.error('Error saving theme:', error);
            });
    }


    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.classList.remove('fa-moon', 'fa-sun');
        icon.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun');
    }

    switchTab(tabName) {
        this.elements.tabs.forEach(tab => tab.classList.remove('active'));
        this.elements.tabPanes.forEach(pane => pane.classList.remove('active'));

        document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    savePlaylists() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(['playlists'], 'readwrite');
            const store = transaction.objectStore('playlists');
            
            store.clear();
            
            this.playlists.forEach(playlist => {
                store.add(playlist);
            });
            
            transaction.oncomplete = () => {
                resolve();
            };
            
            transaction.onerror = (event) => {
                console.error('Error saving playlists:', event.target.error);
                reject('Could not save playlists');
            };
        });
    }
    saveSetting(name, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            
            store.put({ name, value });
            
            transaction.oncomplete = () => {
                resolve();
            };
            
            transaction.onerror = (event) => {
                console.error(`Error saving setting ${name}:`, event.target.error);
                reject(`Could not save setting ${name}`);
            };
        });
    }

    saveSongLibrary() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            try {
                const transaction = this.db.transaction(['songLibrary'], 'readwrite');
                const store = transaction.objectStore('songLibrary');

                const clearRequest = store.clear();

                clearRequest.onsuccess = () => {
                    console.log("Song library cleared successfully");

                    let addedCount = 0;
                    for (const song of this.songLibrary) {
                        store.add(song);
                        addedCount++;
                    }

                    console.log(`Added ${addedCount} songs to library`);
                };

                transaction.oncomplete = () => {
                    console.log("Transaction completed successfully");
                    resolve();
                };

                transaction.onerror = (event) => {
                    console.error('Error saving song library:', event.target.error);
                    reject(new Error('Failed to save song library: ' + event.target.error.message));
                };
            } catch (error) {
                console.error('Exception in saveSongLibrary:', error);
                reject(error);
            }
        });
    }

    renderInitialState() {
        this.renderPlaylists();
        this.renderSongLibrary();
        this.updatePlaylistSelection();
        this.updateListeningTimeDisplay();
        this.elements.speedBtn.textContent = this.currentSpeed + 'x';
    }

    extractYouTubeId(url) {
        if (!url) return null;

        const patterns = [
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i, 
            /^([^"&?\/\s]{11})$/i 
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }
    updateListeningTimeDisplay() {
        if (!this.listeningTimeDisplay) return;
        const seconds = this.listeningTime % 60;
        const minutes = Math.floor(this.listeningTime / 60) % 60;
        const hours = Math.floor(this.listeningTime / 3600);
        if (hours > 0) {
            this.listeningTimeDisplay.textContent = `${hours}h ${minutes}m`;
        } else {
            this.listeningTimeDisplay.textContent = `${minutes}m`;
        }
    }
    saveListeningTime() {
        this.saveSetting('listeningTime', this.listeningTime)
            .catch(error => console.error('Error saving listening time:', error));
    }
  
    toggleSpeedOptions() {
        this.elements.speedOptions.classList.toggle('show');
        if (this.elements.speedOptions.classList.contains('show')) {
            setTimeout(() => {
                const closeSpeedMenu = (e) => {
                    if (!this.elements.speedBtn.contains(e.target) && !this.elements.speedOptions.contains(e.target)) {
                        this.elements.speedOptions.classList.remove('show');
                        document.removeEventListener('click', closeSpeedMenu);
                    }
                };
                document.addEventListener('click', closeSpeedMenu);
            }, 0);
        }
    }
    setPlaybackSpeed(speed) {
        this.currentSpeed = speed;
        this.elements.speedBtn.textContent = speed + 'x';
        this.elements.speedOptions.classList.remove('show');
        if (this.ytPlayer) {
            this.ytPlayer.setPlaybackRate(speed);
        }
        this.saveSetting('playbackSpeed', speed)
            .catch(error => {
                console.error('Error saving playback speed:', error);
            });
    }
    exportLibrary() {
        let exportText = '';
        this.songLibrary.forEach(song => {
            exportText += `${song.name}, https://www.youtube.com/watch?v=${song.videoId}\n`;
        });

        navigator.clipboard.writeText(exportText)
            .then(() => {
                alert('Library exported to clipboard successfully!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                this.showExportModal(exportText);
            });
    }

    showExportModal(exportText) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.style.display = 'block';

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close-btn');
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => modal.remove();

        const heading = document.createElement('h2');
        heading.textContent = 'Export Library';

        const instructions = document.createElement('p');
        instructions.textContent = 'Copy the text below to share your library:';

        const textarea = document.createElement('textarea');
        textarea.value = exportText;
        textarea.style.width = '100%';
        textarea.style.height = '200px';
        textarea.readOnly = true;

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.classList.add('copy-btn'); 
        copyBtn.onclick = () => {
            textarea.select();
            document.execCommand('copy');
            alert('Copied to clipboard!');
        };

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(heading);
        modalContent.appendChild(instructions);
        modalContent.appendChild(textarea);
        modalContent.appendChild(copyBtn);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);
    }

    
    importLibrary(importText) {
        if (!importText.trim()) {
            alert('Please enter songs to import.');
            return;
        }

        const lines = importText.split('\n').filter(line => line.trim());
        const importedSongs = [];
        const failedImports = [];
        const duplicates = [];
        const existingIds = new Set(this.songLibrary.map(song => song.id));

        const generateUniqueId = () => {
            let newId;
            do {
                newId = Date.now() + Math.floor(Math.random() * 10000);
            } while (existingIds.has(newId));

            existingIds.add(newId); 
            return newId;
        };

        lines.forEach((line, index) => {
            try {
                const lastCommaIndex = line.lastIndexOf(',');

                if (lastCommaIndex === -1) {
                    failedImports.push(line);
                    return;
                }

                const songName = line.substring(0, lastCommaIndex).trim();
                const songUrl = line.substring(lastCommaIndex + 1).trim();

                if (!songName || !songUrl) {
                    failedImports.push(line);
                    return;
                }

                if (!songUrl.includes('youtube.com/watch') && !songUrl.includes('youtu.be/')) {
                    failedImports.push(line);
                    return;
                }

                let videoId = null;

                const vParam = songUrl.match(/[?&]v=([^&]+)/);
                if (vParam && vParam[1]) {
                    videoId = vParam[1];
                }
                else if (songUrl.includes('youtu.be/')) {
                    const parts = songUrl.split('youtu.be/');
                    if (parts.length > 1) {
                        videoId = parts[1].split('?')[0].split('&')[0].trim();
                    }
                }

                if (!videoId) {
                    failedImports.push(line);
                    return;
                }

                if (this.songLibrary.some(song => song.videoId === videoId)) {
                    duplicates.push(line);
                    return;
                }

                const newSong = {
                    id: generateUniqueId(),
                    name: songName,
                    videoId: videoId,
                    favorite: false,
                    addedOn: new Date().toISOString()
                };

                importedSongs.push(newSong);
            } catch (error) {
                failedImports.push(line);
            }
        });

        if (importedSongs.length > 0) {
            
            this.addImportedSongsOneByOne(importedSongs)
                .then(() => {
                    this.renderSongLibrary();

                    if (typeof this.updatePlaylistSelection === 'function') {
                        this.updatePlaylistSelection();
                    }

                    let message = `Successfully imported ${importedSongs.length} songs.`;
                    if (duplicates.length > 0) {
                        message += ` Skipped ${duplicates.length} duplicate(s).`;
                    }
                    if (failedImports.length > 0) {
                        message += ` Failed to import ${failedImports.length} song(s).`;
                    }

                    alert(message);
                })
                .catch(error => {
                    console.error('Error saving imported songs:', error);
                    alert('Error occurred. Please try again.');
                });
        } else {
            let message = 'No new songs were imported.';
            if (duplicates.length > 0) {
                message += ` Found ${duplicates.length} duplicate(s).`;
            }
            if (failedImports.length > 0) {
                message += ` Failed to parse ${failedImports.length} line(s).`;
            }

            alert(message);
        }
    }
  
  
    addImportedSongsOneByOne(importedSongs) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            this.songLibrary = [...this.songLibrary, ...importedSongs];

            const transaction = this.db.transaction(['songLibrary'], 'readwrite');
            const store = transaction.objectStore('songLibrary');

            let successCount = 0;

            importedSongs.forEach(song => {
                try {
                    const getRequest = store.get(song.id);

                    getRequest.onsuccess = () => {
                        if (getRequest.result) {
                            song.id = Date.now() + Math.floor(Math.random() * 10000) + successCount;
                        }

                        const addRequest = store.add(song);

                        addRequest.onsuccess = () => {
                            successCount++;
                        };

                        addRequest.onerror = (e) => {
                            console.error("Failed to add song:", e.target.error);
                        };
                    };
                } catch (e) {
                    console.error("Error adding song:", e);
                }
            });

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = (event) => {
                console.error('Transaction error:', event.target.error);
                resolve();
            };
        });
    }
    showImportModal() {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.style.display = 'block';

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close-btn');
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => modal.remove();

        const heading = document.createElement('h2');
        heading.textContent = 'Import Songs';

        const instructions = document.createElement('p');
        instructions.textContent = 'Paste songs in format: "Song name, YouTube URL" (one per line)';

        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Song Name, https://www.youtube.com/watch?v=videoId\nAnother Song, https://www.youtube.com/watch?v=anotherVideoId';
        textarea.style.width = '100%';
        textarea.style.height = '200px';

        const importBtn = document.createElement('button');
        importBtn.textContent = 'Import Songs';
        importBtn.onclick = () => {
            this.importLibrary(textarea.value);
            modal.remove();
        };

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(heading);
        modalContent.appendChild(instructions);
        modalContent.appendChild(textarea);
        modalContent.appendChild(importBtn);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);
    }
    handleDragStart(e) {
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.currentTarget.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const draggingElement = document.querySelector('.dragging');
        if (draggingElement !== e.currentTarget) {
            const container = this.elements.currentPlaylistSongs;
            const afterElement = this.getDragAfterElement(container, e.clientY);

            if (afterElement) {
                container.insertBefore(draggingElement, afterElement);
            } else {
                container.appendChild(draggingElement);
            }
        }
    }

    handleDrop(e) {
        e.preventDefault();

        const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const items = Array.from(this.elements.currentPlaylistSongs.querySelectorAll('.playlist-song-item'));
        const toIndex = items.indexOf(e.currentTarget);

        if (fromIndex !== toIndex) {
            const [movedSong] = playlist.songs.splice(fromIndex, 1);
            playlist.songs.splice(toIndex, 0, movedSong);

            this.savePlaylists()
                .then(() => {
                    if (this.currentPlaylist && this.currentPlaylist.id === playlistId) {
                        this.renderPlaylistSidebar();
                    }
                })
                .catch(error => {
                    console.error('Error reordering playlist:', error);
                    alert('Failed to reorder playlist. Please try again.');
                });
        }
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.playlist-song-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    toggleFavorite(songId) {
        const songIndex = this.songLibrary.findIndex(song => song.id === songId);
        if (songIndex === -1) return;

        this.songLibrary[songIndex].favorite = !this.songLibrary[songIndex].favorite;

        this.saveSongLibrary()
            .then(() => {
                this.renderSongLibrary();
            })
            .catch(error => {
                console.error('Error updating favorite status:', error);
                alert('Failed to update favorite status. Please try again.');
            });
    }
    validateYouTubeUrl() {
        const url = this.elements.songUrlInput.value.trim();

        if (!url) {
            this.removeYouTubeThumbnailPreview();
            return;
        }

        const videoId = this.extractYouTubeId(url);

        this.removeYouTubeThumbnailPreview();

        if (videoId) {
            this.showYouTubeThumbnailPreview(videoId);

            this.checkVideoRestrictions(videoId);
        }
    }

    showYouTubeThumbnailPreview(videoId) {
        const previewContainer = document.createElement('div');
        previewContainer.id = 'thumbnailPreview';
        previewContainer.classList.add('thumbnail-preview');
        const thumbnail = document.createElement('img');
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        thumbnail.alt = 'Video thumbnail';
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.classList.add('thumbnail-close-btn');
        closeButton.onclick = this.removeYouTubeThumbnailPreview.bind(this);
        previewContainer.appendChild(thumbnail);
        previewContainer.appendChild(closeButton);
        document.querySelector('.add-song-section').appendChild(previewContainer);
    }

    removeYouTubeThumbnailPreview() {
        const existingPreview = document.getElementById('thumbnailPreview');
        if (existingPreview) {
            existingPreview.remove();
        }
    }

    checkVideoRestrictions(videoId) {
        const tempPlayer = document.createElement('div');
        tempPlayer.id = 'tempYTPlayer';
        tempPlayer.style.display = 'none';
        document.body.appendChild(tempPlayer);

        const player = new YT.Player('tempYTPlayer', {
            videoId: videoId,
            events: {
                onError: (event) => {
                    if (event.data === 101 || event.data === 150) {
                        alert('This video cannot be played outside YouTube due to restrictions set by the content owner.');
                    }
                    player.destroy();
                    document.getElementById('tempYTPlayer')?.remove();
                },
                onReady: () => {
                    setTimeout(() => {
                        player.destroy();
                        document.getElementById('tempYTPlayer')?.remove();
                    }, 1000);
                }
            }
        });
    }


    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    openLibraryModal() {
        this.elements.libraryModificationModal.style.display = 'flex';
    }

    closeLibraryModal() {
        this.elements.libraryModificationModal.style.display = 'none';
    }


  
  
  
  
  
  
  
  
    
    cleanup() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

        if (this.listeningTimeInterval) {
            clearInterval(this.listeningTimeInterval);
            this.listeningTimeInterval = null;
        }
        if (this.elements) {
            if (this.elements.addSongBtn) {
                this.elements.addSongBtn.removeEventListener('click', this.addSongToLibrary);
            }

            if (this.elements.librarySearch) {
                this.elements.librarySearch.removeEventListener('input', this.filterLibrarySongs);
                this.elements.librarySearch.removeEventListener('keydown', this.handleLibrarySearchKeydown);
            }

            if (this.elements.createPlaylistBtn) {
                this.elements.createPlaylistBtn.removeEventListener('click', this.createPlaylist);
            }

            if (this.elements.closePlaylistModalBtn) {
                this.elements.closePlaylistModalBtn.removeEventListener('click', this.closePlaylistModal);
            }

            if (this.elements.searchSongsToAdd) {
                this.elements.searchSongsToAdd.removeEventListener('input', this.searchSongsToAddToPlaylist);
            }

            if (this.elements.addSongToPlaylistBtn) {
                this.elements.addSongToPlaylistBtn.removeEventListener('click', this.addSongToSelectedPlaylist);
            }

            if (this.elements.progressBar) {
                this.elements.progressBar.removeEventListener('click', this.seekMusic);
            }

            if (this.elements.playPauseBtn) {
                this.elements.playPauseBtn.removeEventListener('click', this.togglePlayPause);
            }

            if (this.elements.prevBtn) {
                this.elements.prevBtn.removeEventListener('click', this.playPreviousSong);
            }

            if (this.elements.nextBtn) {
                this.elements.nextBtn.removeEventListener('click', this.playNextSong);
            }

            if (this.elements.loopBtn) {
                this.elements.loopBtn.removeEventListener('click', this.toggleLoop);
            }

            if (this.elements.volumeSlider) {
                this.elements.volumeSlider.removeEventListener('input', this.handleVolumeChange);
            }

            if (this.elements.showPlaylistBtn) {
                this.elements.showPlaylistBtn.removeEventListener('click', this.togglePlaylistSidebar);
            }

            if (this.elements.closeSidebarBtn) {
                this.elements.closeSidebarBtn.removeEventListener('click', this.togglePlaylistSidebar);
            }

            if (this.elements.themeToggle) {
                this.elements.themeToggle.removeEventListener('click', this.toggleTheme);
            }

            if (this.elements.speedBtn) {
                this.elements.speedBtn.removeEventListener('click', this.toggleSpeedOptions);
            }

            document.querySelectorAll('.speed-option').forEach(option => {
                option.removeEventListener('click', this.handleSpeedOptionClick);
            });
        }

        if (this.ytPlayer && typeof this.ytPlayer.destroy === 'function') {
            this.ytPlayer.destroy();
            this.ytPlayer = null;
        }
    }



}

























let musicPlayer;
function initializeMusicPlayer() {
    musicPlayer = new AdvancedMusicPlayer();
}

window.addEventListener('beforeunload', () => {
    if (musicPlayer) {
        musicPlayer.cleanup();
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const layoutToggleBtn = document.getElementById('layoutToggleBtn');
    const nowPlayingSection = document.querySelector('.now-playing');
    const playlistSidebar = document.getElementById('currentPlaylistSidebar');
    
    let currentLayout = 'center'; 
    
    layoutToggleBtn.addEventListener('click', function() {
      
        nowPlayingSection.classList.remove('controls-left', 'controls-center', 'controls-right');
        
        if (currentLayout === 'center') {
            currentLayout = 'left';
            nowPlayingSection.classList.add('controls-left');
            layoutToggleBtn.title = "Controls aligned left";
        } else if (currentLayout === 'left') {
            currentLayout = 'right';
            nowPlayingSection.classList.add('controls-right');
            layoutToggleBtn.title = "Controls aligned right";
        } else {
            currentLayout = 'center';
            nowPlayingSection.classList.add('controls-center');
            layoutToggleBtn.title = "Controls aligned center";
        }
        
        localStorage.setItem('controlsLayout', currentLayout);
    });
    
    const savedLayout = localStorage.getItem('controlsLayout');
    if (savedLayout) {
        currentLayout = savedLayout;
        nowPlayingSection.classList.add(`controls-${currentLayout}`);
    } else {
        nowPlayingSection.classList.add('controls-center');
    }
    
    const adjustLayoutTogglePosition = function() {
        if (playlistSidebar.classList.contains('open')) {
            document.querySelector('.layout-toggle').style.left = '300px'; 
        } else {
            document.querySelector('.layout-toggle').style.left = '15px';
        }
    };
    
    const showPlaylistBtn = document.getElementById('showPlaylistBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    
    showPlaylistBtn.addEventListener('click', function() {
        setTimeout(adjustLayoutTogglePosition, 10); 
    });
    
    closeSidebarBtn.addEventListener('click', function() {
        setTimeout(adjustLayoutTogglePosition, 10);
    });
    
    adjustLayoutTogglePosition();
});
let appTimer = null;
let timerEndTime = null;

document.getElementById('timerButton').addEventListener('click', function() {
    document.getElementById('timerModal').style.display = 'flex';
    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('specificTimeInput').value = `${hours}:${minutes}`;
});

document.getElementById('closeTimerModal').addEventListener('click', function() {
    document.getElementById('timerModal').style.display = 'none';
});

document.querySelectorAll('.timer-options button').forEach(button => {
    button.addEventListener('click', function() {
        const minutes = parseFloat(this.getAttribute('data-time'));
        setAppTimer(minutes);
    });
});

document.getElementById('setCustomTimer').addEventListener('click', function() {
    const customMinutes = parseFloat(document.getElementById('customTimerInput').value);
    if (customMinutes > 0) {
        setAppTimer(customMinutes);
    }
});

document.getElementById('cancelTimer').addEventListener('click', function() {
    clearAppTimer();
});
document.getElementById('setSpecificTime').addEventListener('click', function() {
    const timeInput = document.getElementById('specificTimeInput').value;
    if (timeInput) {
        setSpecificTimeTimer(timeInput);
    }
});

function setSpecificTimeTimer(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const now = new Date();
    const targetTime = new Date();
    
    targetTime.setHours(hours, minutes, 0, 0);
    
    if (targetTime < now) {
        targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeDiff = targetTime - now;
    
    const minutesDiff = (timeDiff / 60000).toFixed(2);
    setAppTimer(parseFloat(minutesDiff), targetTime);
}

function setAppTimer(minutes, specificEndTime = null) {
    clearAppTimer();
    
    const milliseconds = minutes * 60000;
    if (specificEndTime) {
        timerEndTime = specificEndTime;
    } else {
        timerEndTime = new Date(Date.now() + milliseconds);
    }
    
    const timerStatus = document.getElementById('timerStatus');
    
    if (specificEndTime) {
        const formattedTime = timerEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timerStatus.textContent = `App will close at ${formattedTime} (in ${minutes.toFixed(2)} minutes)`;
        
      
        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.textContent = formattedTime;
        timerDisplay.style.display = 'inline';
    } else {
        timerStatus.textContent = `App will close in ${minutes.toFixed(2)} minutes`;
        
        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.textContent = `${Math.floor(minutes)}m`;
        timerDisplay.style.display = 'inline';
    }
    
    document.getElementById('cancelTimer').style.display = 'inline-block';
    
    appTimer = setTimeout(function() {
        try {
            window.close();
            
            window.open('', '_self').close();
        } catch (e) {
            console.log("Standard window close failed:", e);
        }
        
        try {
            window.location.replace("about:blank");
        } catch (e) {
            console.log("Navigation redirect failed:", e);
        }
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; background: #1a1a1a; color: #fff; position: fixed; top: 0; left: 0; right: 0; bottom: 0;"><h1>Session Ended</h1><p>Your music session has ended. The app has been closed.</p><button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #3498db; border: none; color: white; border-radius: 4px; cursor: pointer;">Restart App</button></div>';
        
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].parentNode) {
                scripts[i].parentNode.removeChild(scripts[i]);
            }
        }
    }, milliseconds);
    
    document.getElementById('timerModal').style.display = 'none';
    updateTimerCountdown();
}

function clearAppTimer() {
    if (appTimer) {
        clearTimeout(appTimer);
        appTimer = null;
        timerEndTime = null;
        
        const timerStatus = document.getElementById('timerStatus');
        timerStatus.textContent = 'No timer set';
        
        document.getElementById('cancelTimer').style.display = 'none';
        
        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.textContent = '';
        timerDisplay.style.display = 'none';
    }
}

function updateTimerCountdown() {
    if (timerEndTime) {
        const now = new Date();
        const timeLeft = timerEndTime - now;
        
        if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            const timerStatus = document.getElementById('timerStatus');
            timerStatus.textContent = `App will close in ${minutes}m ${seconds}s`;
            
            const timerDisplay = document.getElementById('timerDisplay');
            if (minutes > 0) {
                timerDisplay.textContent = `${minutes}m ${seconds}s`;
            } else {
                timerDisplay.textContent = `${seconds}s`;
            }
            
            setTimeout(updateTimerCountdown, 1000);
        }
    }
}
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('timerModal')) {
        document.getElementById('timerModal').style.display = 'none';
    }
});
document.addEventListener('DOMContentLoaded', initializeMusicPlayer);
