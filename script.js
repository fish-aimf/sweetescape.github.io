class AdvancedMusicPlayer {
  constructor() {
    this.playlists = [];
    this.songLibrary = [];
    this.songQueue = [];
    this.db = null;
    this.isPlaylistLooping = true;
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
    this.listeningTimeDisplay = document.getElementById("listeningTime");
    this.currentSpeed = 1;
    this.temporarilySkippedSongs = new Set();
    this.recentlyPlayedLimit = 20;
    this.longPressTimer = null;
    this.titleScrollInterval = null;
    this.isLongPressing = false;
    this.originalFavicon = document.querySelector('link[rel="icon"]')?.href || "/favicon.ico";
    this.originalTitle = document.title;
    this.allowDuplicates = true;
    this.isVideoFullscreen = false;
    this.isAutoplayEnabled = true;
    this.webEmbedOverlay = null;
    this.isWebEmbedVisible = false;
    this.appTimer = null;
    this.timerEndTime = null;
    this.currentLayout = "center";
    this.isLyricsFullscreen = false;
    this.fullscreenYtPlayer = null;
    this.fullscreenLyricsInterval = null;
    this.adsEnabled = false; 
    this.recentlyPlayedDisplayLimit = 3;
    this.suggestedSongsDisplayLimit = 2;
    this.yourPicksDisplayLimit = 2;
    this.recentlyPlayedPlaylistsDisplayLimit = 1;
    this.visualizerEnabled = true;
    this.webEmbedSites = [
      'https://www.desmos.com/calculator',
      'https://i2.res.24o.it/pdf2010/Editrice/ILSOLE24ORE/ILSOLE24ORE/Online/_Oggetti_Embedded/Documenti/2025/07/12/Preliminary%20Report%20VT.pdf?utm_source=chatgpt.com' ,
      'https://www.wikipedia.org',
      'https://www.desmos.com/scientific',
      'https://www.desmos.com/3d'
    ];
    this.currentWebEmbedIndex = 0;
    
    this.pageDisguises = [
      {
        favicon: "https://i.ibb.co/W4MfKV9X/image.png",
        title: "WhatsApp",
        isPriority: true,
      },
      {
        favicon: "https://i.ibb.co/Y77XtqRh/image.png",
        title: "Inbox (78) - Gmail",
        isPriority: true,
      },
      {
        favicon: "https://i.ibb.co/fV4bT2Fp/image.png",
        title: "DeepSeek - Into the Unknown",
        isPriority: true,
      },
      {
        favicon: "https://i.ibb.co/35hmFHPL/image.png",
        title: "Home",
        isPriority: true,
      },
      {
        favicon: "https://i.ibb.co/JFKpsWK3/image.png",
        title: "Desmos | Graphing Calculator",
        isPriority: true,
      },
      {
        favicon: "https://i.ibb.co/35MNf3BZ/image.png",
        title: "New Tab",
        isPriority: true,
      },
      {
        favicon: "https://i.ibb.co/vCKb51GK/image.png",
        title: "ChatGPT",
        isPriority: true,
      },
      {
        favicon: "https://i.ibb.co/xtwTzMvz/image.png",
        title: "Home | Microsoft 365 Copilot",
        isPriority: true,
      },
    ];
    this.currentDisguiseIndex = -1;
    this.priorityModeActive = false;
    this.titleObserver = null;
    this.recentlyPlayedSongs = [];
    this.recentlyPlayedPlaylists = [];
    this.currentTabIndex = 0;
    this.setupChangelogModal();
    this.loadVersion();
    this.visualizer = {
        canvas: null,
        ctx: null,
        bars: [],
        particles: [],
        animationId: null,
        isActive: false
    };
    this.initDatabase()
      .then(() => {
        return Promise.all([
          this.loadSongLibrary(),
          this.loadPlaylists(),
          this.loadSettings(),
          this.loadRecentlyPlayed(),
          this.loadDiscoverMoreSettingsOnStartup(),
          this.loadVisualizerSettings()
        ]);
      })
      .then(() => {
        this.setupYouTubePlayer();
        this.loadQueue();
        this.initializeElements();
        this.setupEventListeners();
        this.initializeTheme();
        this.initializeAutoplay();
        this.setupKeyboardControls();
        
        
        this.renderInitialState();
        this.renderAdditionalDetails();
        this.setupLyricsTabContextMenu();
        this.initializeFullscreenLyrics();
        this.initializeAdvertisementSettings();
  
        this.initializeVisualizer(); // Initialize but don't start
        this.loadVisualizerSettings();
      })
      .catch((error) => {
        console.error("Error initializing music player:", error);
      });
  }
  initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MusicPlayerDB", 1);
      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject("Could not open IndexedDB");
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("songLibrary")) {
        db.createObjectStore("songLibrary", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("playlists")) {
        db.createObjectStore("playlists", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "name" });
    }
    if (!db.objectStoreNames.contains("recentlyPlayed")) {
        db.createObjectStore("recentlyPlayed", { keyPath: "type" });
    }
    if (!db.objectStoreNames.contains("userSettings")) {
        db.createObjectStore("userSettings", { keyPath: "category" });
    }
};
    });
  }
  initializeElements() {
    this.elements = {
      songNameInput: document.getElementById("songName"),
      songAuthorInput: document.getElementById("songAuthor"),
      songUrlInput: document.getElementById("songUrl"),
      addSongBtn: document.getElementById("addSongBtn"),
      songLibrary: document.getElementById("songLibrary"),
      librarySearch: document.getElementById("librarySearch"),
      toggleControlBarBtn: document.getElementById("toggleControlBarBtn"),
      additionalDetails: document.getElementById("additionalDetails"),
      newPlaylistName: document.getElementById("newPlaylistName"),
      createPlaylistBtn: document.getElementById("createPlaylistBtn"),
      playlistContainer: document.getElementById("playlistContainer"),
      timeDisplay: document.getElementById("timeDisplay"),
      playlistEditModal: document.getElementById("playlistEditModal"),
      closePlaylistModalBtn: document.getElementById("closePlaylistModal"),
      currentPlaylistName: document.getElementById("currentPlaylistName"),
      searchSongsToAdd: document.getElementById("searchSongsToAdd"),
      librarySearchResults: document.getElementById("librarySearchResults"),
      currentPlaylistSongs: document.getElementById("currentPlaylistSongs"),
      playlistTotalDuration: document.getElementById("playlistTotalDuration"),
      loopPlaylistBtn: document.getElementById("loopPlaylistBtn"),
      autoplayBtn: document.getElementById("autoplayBtn"),
      playlistSongsModal: document.getElementById("playlistSongsModal"),
      playlistSongsContent: document.getElementById("playlistSongsContent"),
      addSongToPlaylistBtn: document.getElementById("addSongToPlaylistBtn"),
      playlistSelectionForSong: document.getElementById("playlistSelectionForSong"),
      importLibraryBtn: document.getElementById("importLibraryBtn"),
      exportLibraryBtn: document.getElementById("exportLibraryBtn"),
      modifyLibraryBtn: document.getElementById("modifyLibraryBtn"),
      libraryModificationModal: document.getElementById("libraryModificationModal"),
      closeLibraryModalBtn: document.getElementById("closeLibraryModal"),
      progressBar: document.getElementById("musicProgressBar"),
      currentSongName: document.getElementById("currentSongName"),
      nextSongName: document.getElementById("nextSongName"),
      playPauseBtn: document.getElementById("playPauseBtn"),
      prevBtn: document.getElementById("prevBtn"),
      nextBtn: document.getElementById("nextBtn"),
      loopBtn: document.getElementById("loopBtn"),
      showPlaylistBtn: document.getElementById("showPlaylistBtn"),
      volumeSlider: document.getElementById("volumeSlider"),
      currentPlaylistSidebar: document.getElementById("currentPlaylistSidebar"),
      sidebarPlaylistName: document.getElementById("sidebarPlaylistName"),
      sidebarPlaylistSongs: document.getElementById("sidebarPlaylistSongs"),
      closeSidebarBtn: document.getElementById("closeSidebarBtn"),
      youtubeSearchSuggestion: document.getElementById("youtubeSearchSuggestion"),
      listeningTimeDisplay: document.getElementById("listeningTime"),
      speedBtn: document.getElementById("speedBtn"),
      speedOptions: document.getElementById("speedOptions"),
      tabs: document.querySelectorAll(".tab"),
      tabPanes: document.querySelectorAll(".tab-pane"),
      themeToggle: document.getElementById("themeToggle"),
      lyricsTab: document.querySelector('.tab[data-tab="lyrics"]'),
      lyricsPane: document.getElementById("lyrics"),
      autofillBtn: document.getElementById("autofillBtn"),
      settingsButton: document.getElementById("settingsButton"),
        settingsModal: document.getElementById("settingsModal"),
        settingsCloseBtn: document.getElementById("settingsCloseBtn"),
        settingsContent: document.getElementById("settingsContent"),
      themeMode: document.getElementById("themeMode"),
    customThemeSection: document.getElementById("customThemeSection"),
    primaryColorPicker: document.getElementById("primaryColorPicker"),
    backgroundColorPicker: document.getElementById("backgroundColorPicker"),
    saveCustomTheme: document.getElementById("saveCustomTheme"),
      secondaryColorPicker: document.getElementById('secondaryColorPicker'),
  textPrimaryColorPicker: document.getElementById('textPrimaryColorPicker'),
  textSecondaryColorPicker: document.getElementById('textSecondaryColorPicker'),
  hoverColorPicker: document.getElementById('hoverColorPicker'),
  borderColorPicker: document.getElementById('borderColorPicker'),
  accentColorPicker: document.getElementById('accentColorPicker'),
      themeImportText: document.getElementById("themeImportText"),
        buttonTextColorPicker: document.getElementById("buttonTextColorPicker"),
        shadowColorPicker: document.getElementById("shadowColorPicker"),
        shadowOpacity: document.getElementById("shadowOpacity"),
        errorColorPicker: document.getElementById("errorColorPicker"),
        errorHoverColorPicker: document.getElementById("errorHoverColorPicker"),
        youtubeRedColorPicker: document.getElementById("youtubeRedColorPicker"),
      adsToggle: document.getElementById("adsToggle"),
      saveCustomTheme: document.getElementById("saveCustomTheme"),
      recentlyPlayedStorageLimit: document.getElementById("recentlyPlayedStorageLimit"),
        recentlyPlayedDisplayLimit: document.getElementById("recentlyPlayedDisplayLimit"),
        suggestedSongsDisplayLimit: document.getElementById("suggestedSongsDisplayLimit"),
        yourPicksDisplayLimit: document.getElementById("yourPicksDisplayLimit"),
        recentlyPlayedPlaylistsLimit: document.getElementById("recentlyPlayedPlaylistsLimit"),
        saveDiscoverMoreSettings: document.getElementById("saveDiscoverMoreSettings"),
      discordButton: document.getElementById("discordButton"),
      visualizerToggle: document.getElementById("visualizerToggle")
    };
    if (this.elements.speedBtn) {
      this.elements.speedBtn.textContent = this.currentSpeed + "x";
    }
    const controlBarVisible = localStorage.getItem("controlBarVisible");
    if (controlBarVisible === "false") {
      const controlBarContainer = document.querySelector(".player-controls").closest(".player-container");
      const targetElement = controlBarContainer || document.querySelector(".player-controls").parentElement;
      const layoutToggleBtn = document.querySelector(".layout-toggle-button");
      targetElement.style.visibility = "hidden";
      targetElement.style.position = "absolute";
      targetElement.style.pointerEvents = "none";
      if (layoutToggleBtn && !targetElement.contains(layoutToggleBtn)) {
        layoutToggleBtn.style.visibility = "visible";
        layoutToggleBtn.style.position = "";
        layoutToggleBtn.style.pointerEvents = "auto";
      }
    }
  }
  setupEventListeners() {
    this.handleAddSong = this.addSongToLibrary.bind(this);
    this.handleFilterLibrary = this.filterLibrarySongs.bind(this);
    this.handleLibrarySearchKeydown = (e) => {
      if (e.key === "Enter" && this.elements.youtubeSearchSuggestion.style.display !== "none") {
        this.searchYouTube(this.elements.librarySearch.value.trim());
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
    this.handlePlaylistDragStart = this.handlePlaylistDragStart.bind(this);
    this.handlePlaylistDragOver = this.handlePlaylistDragOver.bind(this);
    this.handlePlaylistDrop = this.handlePlaylistDrop.bind(this);
    this.handleVolumeChange = (e) => this.setVolume(e.target.value);
    this.handleToggleSidebar = this.togglePlaylistSidebar.bind(this);
    this.handleToggleAutoplay = this.toggleAutoplay.bind(this);
    this.handleOpenLibraryModal = this.openLibraryModal.bind(this);
    this.handleCloseLibraryModal = this.closeLibraryModal.bind(this);
    this.handleToggleControlBar = this.toggleControlBar.bind(this);
    this.handleToggleTheme = this.toggleTheme.bind(this);
    this.handleToggleSpeedOptions = this.toggleSpeedOptions.bind(this);
    this.handleSpeedOptionClick = (e) => this.setPlaybackSpeed(parseFloat(e.target.dataset.speed));
    this.handleImportLibrary = this.showImportModal.bind(this);
    this.handleExportLibrary = this.exportLibrary.bind(this);
    this.handleTogglePlaylistLoop = this.togglePlaylistLoop.bind(this);
    this.handleSongUrlInput = this.validateYouTubeUrl.bind(this);
    this.handleSongNameRightClick = this.handleSongNameRightClick.bind(this);
    this.handleAddSong = this.addSongToLibrary.bind(this);
    const tabButtons = document.querySelectorAll('.settings-tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => this.handleTabSwitch(e));
    });
    
    // Add visualizer toggle listener
    if (this.elements.visualizerToggle) {
        this.elements.visualizerToggle.addEventListener('change', (e) => this.handleVisualizerToggle(e));
    }
     this.handleDiscordClick = () => {
    window.open('https://discord.gg/fwfGnTHzq2', '_blank');
  };
    this.handleSongUrlKeydown = (e) => {
      if (e.key === "Enter") {
        this.addSongToLibrary();
      }
    };
    if (this.elements.saveDiscoverMoreSettings) {
        this.elements.saveDiscoverMoreSettings.addEventListener("click", this.handleSaveDiscoverMoreSettings.bind(this));
    }
    this.handleNewPlaylistNameKeydown = (e) => {
      if (e.key === "Enter") {
        this.createPlaylist();
      }
    };
    if (this.elements.searchSongsToAdd) {
      this.elements.searchSongsToAdd.addEventListener("input", this.handleSearchSongsToAdd);
    }
    if (this.elements.songUrlInput) {
      this.elements.songUrlInput.addEventListener("paste", (e) => {
        setTimeout(() => {
          this.handleUrlPaste();
        }, 10);
      });
      this.elements.songUrlInput.addEventListener("input", this.handleUrlPaste.bind(this));
    }
    if (this.elements.autofillBtn) {
      this.elements.autofillBtn.addEventListener("click", this.handleAutofill.bind(this));
      this.elements.autofillBtn.addEventListener("mouseenter", this.showGhostPreview.bind(this));
      this.elements.autofillBtn.addEventListener("mouseleave", this.removeGhostPreview.bind(this));
    }
    this.addQueueStyles();
    this.setupTimerEventListeners();
    this.setupLayoutEventListeners();
    this.setupExportButtonListeners();
    document.addEventListener('contextmenu', (e) => {
      if (e.target.classList.contains('play-btn') || 
          e.target.closest('.play-btn') || 
          e.target.onclick?.toString().includes('playSong') ||
          e.target.onclick?.toString().includes('playPlaylist')) {
        e.preventDefault();
        const songElement = e.target.closest('[data-song-id]') || e.target.closest('[data-playlist-id]');
        if (songElement && songElement.dataset.songId) {
          const song = this.songLibrary.find(s => s.id == songElement.dataset.songId);
          if (song) this.addToQueue(song);
        } else if (songElement && songElement.dataset.playlistId) {
          const playlist = this.playlists.find(p => p.id == songElement.dataset.playlistId);
          if (playlist) {
            playlist.songs.forEach(song => this.addToQueue(song));
          }
        } else {
          const onclickStr = e.target.onclick?.toString() || e.target.closest('button')?.onclick?.toString();
          if (onclickStr) {
            const songIdMatch = onclickStr.match(/playSong\((\d+)\)/);
            const playlistIdMatch = onclickStr.match(/playPlaylist\((\d+)\)/);
            if (songIdMatch) {
              const song = this.songLibrary.find(s => s.id == parseInt(songIdMatch[1]));
              if (song) this.addToQueue(song);
            } else if (playlistIdMatch) {
              const playlist = this.playlists.find(p => p.id == parseInt(playlistIdMatch[1]));
              if (playlist) {
                playlist.songs.forEach(song => this.addToQueue(song));
              }
            }
          }
        }
      }
    });
    const eventBindings = [
      [this.elements.toggleControlBarBtn, "click", this.handleToggleControlBar],
      [this.elements.modifyLibraryBtn, "click", this.handleOpenLibraryModal],
      [this.elements.closeLibraryModalBtn, "click", this.handleCloseLibraryModal],
      [this.elements.importLibraryBtn, "click", this.handleImportLibrary],
      [this.elements.exportLibraryBtn, "click", this.handleExportLibrary],
      [this.elements.loopPlaylistBtn, "click", this.handleTogglePlaylistLoop],
      [this.elements.addSongBtn, "click", this.handleAddSong],
      [this.elements.createPlaylistBtn, "click", this.handleCreatePlaylist],
      [this.elements.closePlaylistModalBtn, "click", this.handleClosePlaylistModal],
      [this.elements.addSongToPlaylistBtn, "click", this.handleAddSongToPlaylist],
      [this.elements.playPauseBtn, "click", this.handleTogglePlayPause],
      [this.elements.prevBtn, "click", this.handlePlayPrevious],
      [this.elements.nextBtn, "click", this.handlePlayNext],
      [this.elements.loopBtn, "click", this.handleToggleLoop],
      [this.elements.showPlaylistBtn, "click", this.handleToggleSidebar],
      [this.elements.closeSidebarBtn, "click", this.handleToggleSidebar],
      [this.elements.themeToggle, "click", this.handleToggleTheme],
      [this.elements.autoplayBtn, "click", this.handleToggleAutoplay],
      [this.elements.speedBtn, "click", this.handleToggleSpeedOptions],
      [this.elements.librarySearch, "input", this.handleFilterLibrary],
      [this.elements.librarySearch, "keydown", this.handleLibrarySearchKeydown],
      [this.elements.songUrlInput, "input", this.handleSongUrlInput],
      [this.elements.songUrlInput, "keydown", this.handleSongUrlKeydown],
      [this.elements.newPlaylistName, "keydown", this.handleNewPlaylistNameKeydown],
      [this.elements.volumeSlider, "input", this.handleVolumeChange],
      [this.elements.progressBar, "click", this.handleSeekMusic],
      [this.elements.currentSongName, "contextmenu", this.handleSongNameRightClick],
      [this.elements.toggleControlBarBtn, "click", this.handleToggleControlBar],
      [this.elements.discordButton, "click", this.handleDiscordClick]
    ];
    eventBindings.forEach(([element, event, handler]) => {
      if (element) {
        element.addEventListener(event, handler);
      }
    });
    document.querySelectorAll(".speed-option").forEach((option) => {
      option.addEventListener("click", this.handleSpeedOptionClick);
    });
    this.elements.tabs.forEach((tab) => {
      tab.addEventListener("click", () => this.switchTab(tab.dataset.tab));
    });
    const settingsEventBindings = [
        [this.elements.settingsButton, "click", this.handleOpenSettings],
        [this.elements.settingsCloseBtn, "click", this.handleCloseSettings],
        [this.elements.settingsModal, "click", this.handleSettingsModalClick],
        [this.elements.themeMode, "change", this.handleThemeModeChange],
        [this.elements.saveCustomTheme, "click", this.handleSaveCustomTheme],
      [this.elements.adsToggle, "change", this.handleAdsToggle.bind(this)]
    ];
settingsEventBindings.forEach(([element, event, handler], index) => {
    if (element) {
        element.addEventListener(event, handler.bind(this));
    } else {
        console.warn(`Settings element not found for event binding at index ${index}`);
    }
});
  }
  setupKeyboardControls() {
    document.addEventListener("keydown", (e) => {
      if (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.isContentEditable) {
        return;
      }
      if (e.key.toLowerCase() === "b") {
        this.cycleFaviconAndTitle();
        return;
      }
      if (e.key.toLowerCase() === "n") {
        if (e.shiftKey) {
          this.cycleWebEmbedSite();
        } else {
          this.toggleWebEmbedOverlay();
        }
        return;
      }
      if (e.key.toLowerCase() === "y") {
        e.preventDefault();
        this.showQueueOverlay();
        return;
      }
      if ([
        "Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyK", "KeyA", "KeyD", "KeyL", "KeyR", "KeyP", "KeyT", "Equal", "Minus", "KeyM", "Tab", "KeyQ", "KeyH", "KeyU", "KeyY", "KeyN"
      ].includes(e.code)) {
        e.preventDefault();
      }
      switch (e.code) {
        case "Space":
        case "KeyK":
          this.togglePlayPause();
          break;
        case "ArrowLeft":
        case "KeyA":
          this.playPreviousSong();
          break;
        case "ArrowRight":
        case "KeyD":
          this.playNextSong();
          break;
        case "ArrowUp":
          this.adjustVolume(0.1);
          break;
        case "ArrowDown":
          this.adjustVolume(-0.1);
          break;
        case "KeyL":
          this.toggleLoop();
          break;
        case "KeyR":
          if (this.ytPlayer) {
            this.ytPlayer.seekTo(0, true);
          }
          break;
        case "KeyP":
          this.toggleTheme();
          break;
        case "KeyT":
          this.openTimerModal();
          break;
        case "Equal":
          this.adjustVolume(0.01);
          break;
        case "Minus":
          this.adjustVolume(-0.01);
          break;
        case "KeyH":
          this.toggleControlBar();
          break;
        case "KeyM":
        case "Tab":
          this.togglePlaylistSidebar();
          break;
        case "KeyQ":
          this.cycleToNextTab();
          break;
        case "KeyU":
          if (this.ytPlayer && this.elements.currentSongName.textContent !== "No Song Playing") {
            this.toggleVideoFullscreen();
          }
          break;
        case "KeyY":
          this.showQueueOverlay();
          break;
      }
    });
  }
  loadSongLibrary() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }
      const transaction = this.db.transaction(["songLibrary"], "readonly");
      const store = transaction.objectStore("songLibrary");
      const request = store.getAll();
      request.onsuccess = () => {
        this.songLibrary = request.result || [];
        this.songLibrary = this.songLibrary.map((song) => {
          if (song.favorite === undefined) {
            song.favorite = false;
          }
          if (song.lyrics === undefined) {
            song.lyrics = "";
          }
          if (song.author === undefined) {
            song.author = "";
          }
          return song;
        });
        if (
          this.songLibrary.some(
            (song) => song.favorite === undefined || song.lyrics === undefined
          )
        ) {
          this.saveSongLibrary().then(resolve).catch(reject);
        } else {
          resolve();
        }
      };
      request.onerror = (event) => {
        console.error("Error loading song library:", event.target.error);
        reject("Could not load song library");
      };
    });
  }
  loadPlaylists() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }
      const transaction = this.db.transaction(["playlists"], "readonly");
      const store = transaction.objectStore("playlists");
      const request = store.getAll();
      request.onsuccess = () => {
        this.playlists = request.result || [];
        this.syncFavoritesOnLoad()
          .then(() => resolve())
          .catch((error) => {
            console.error("Error syncing favorites playlist:", error);
            resolve();
          });
      };
      request.onerror = (event) => {
        console.error("Error loading playlists:", event.target.error);
        reject("Could not load playlists");
      };
    });
  }
  cycleToNextTab() {
    if (!this.elements.tabs || this.elements.tabs.length === 0) {
      return;
    }
    const tabElements = Array.from(this.elements.tabs);
    this.currentTabIndex = (this.currentTabIndex + 1) % tabElements.length;
    const nextTabName = tabElements[this.currentTabIndex].dataset.tab;
    this.switchTab(nextTabName);
  }
  loadSettings() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }
      try {
        const transaction = this.db.transaction(["settings"], "readonly");
        const store = transaction.objectStore("settings");
        const settingsToLoad = [
          { key: "listeningTime", default: 0, target: "listeningTime" },
          { key: "playbackSpeed", default: 1, target: "currentSpeed" },
          {
            key: "isPlaylistLooping",
            default: true,
            target: "isPlaylistLooping",
          },
          {
            key: "recentlyPlayedLimit",
            default: 20,
            target: "recentlyPlayedLimit",
          },
          { key: "allowDuplicates", default: true, target: "allowDuplicates" },
        ];
        settingsToLoad.forEach((setting) => {
          const request = store.get(setting.key);
          request.onsuccess = () => {
            if (request.result) {
              this[setting.target] = request.result.value ?? setting.default;
            } else {
              this[setting.target] = setting.default;
            }
          };
          request.onerror = () => {
            console.warn(
              `Failed to load setting: ${setting.key}, using default value`
            );
            this[setting.target] = setting.default;
          };
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => {
          console.error("Error loading settings:", event.target.error);
          reject("Could not load settings");
        };
      } catch (error) {
        console.error("Error in loadSettings:", error);
        reject("Exception in loadSettings");
      }
    });
  }
  setupProgressBar() {
  if (!this.elements.progressBar) return;
  this.elements.progressBar.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
  this.elements.progressBar.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
  this.elements.progressBar.addEventListener('touchend', this.handleTouchEnd.bind(this));
}
updateProgressBar() {
  if (!this.ytPlayer || !this.elements.progressBar) return;
  if (this.progressInterval) {
    clearInterval(this.progressInterval);
    this.progressInterval = null;
  }
  this.progressInterval = setInterval(() => {
    try {
      if (
        !this.ytPlayer ||
        this.ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING
      ) {
        return;
      }
      const currentTime = this.ytPlayer.getCurrentTime() || 0;
      const duration = this.ytPlayer.getDuration() || 0;
      if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        this.elements.progressBar.value = progressPercent;
        if (this.elements.timeDisplay) {
          const formattedCurrentTime = this.formatTime(currentTime);
          const formattedDuration = this.formatTime(duration);
          this.elements.timeDisplay.textContent = `${formattedCurrentTime}/${formattedDuration}`;
        }
      }
    } catch (error) {
      console.error("Error updating progress bar:", error);
    }
  }, 500);
}
seekMusic(e) {
  if (!this.ytPlayer) return;
  const duration = this.ytPlayer.getDuration();
  let clickPosition;
  if (e.type === 'touchstart' || e.type === 'touchmove') {
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = this.elements.progressBar.getBoundingClientRect();
    clickPosition = (touch.clientX - rect.left) / rect.width;
  } else {
    clickPosition = e.offsetX / this.elements.progressBar.offsetWidth;
  }
  clickPosition = Math.max(0, Math.min(1, clickPosition));
  const seekTime = duration * clickPosition;
  this.ytPlayer.seekTo(seekTime, true);
  if (this.elements.timeDisplay) {
    const formattedCurrentTime = this.formatTime(seekTime);
    const formattedDuration = this.formatTime(duration);
    this.elements.timeDisplay.textContent = `${formattedCurrentTime}/${formattedDuration}`;
  }
}
handleTouchStart(e) {
  e.preventDefault(); 
  this.isDragging = true;
  this.seekMusic(e);
}
handleTouchMove(e) {
  if (!this.isDragging) return;
  e.preventDefault();
  this.seekMusic(e);
}
handleTouchEnd(e) {
  this.isDragging = false;
}
  addSongToLibrary() {
    const songName = this.elements.songNameInput.value.trim();
    const songAuthor = this.elements.songAuthorInput.value.trim();
    const songUrl = this.elements.songUrlInput.value.trim();
    if (!songName || !songUrl) {
      alert("Please enter both song name and URL");
      return;
    }
    const videoId = this.extractYouTubeId(songUrl);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }
    if (this.songLibrary.some((song) => song.videoId === videoId)) {
      alert("This song is already in your library");
      return;
    }
    const newSong = {
      id: Date.now(),
      name: songName,
      author: songAuthor,
      videoId: videoId,
      favorite: false,
    };
    this.songLibrary.push(newSong);
    this.saveSongLibrary()
      .then(() => {
        this.renderSongLibrary();
        this.updatePlaylistSelection();
        this.elements.songNameInput.value = "";
        this.elements.songAuthorInput.value = "";
        this.elements.songUrlInput.value = "";
        this.removeYouTubeThumbnailPreview();
        this.closeLibraryModal();
      })
      .catch((error) => {
        console.error("Error adding song to library:", error);
        alert("Failed to save song. Please try again.");
      });
  }
  handleUrlPaste() {
      const songUrl = this.elements.songUrlInput.value.trim();
      const songName = this.elements.songNameInput.value.trim();
      if (songUrl) {
          const videoId = this.extractYouTubeId(songUrl);
          if (videoId) {
              this.showYouTubeThumbnailPreview(videoId);
              this.elements.autofillBtn.disabled = false;
              if (!songName) {
                  this.fetchYouTubeTitle(videoId)
                      .then((title) => {
                          if (title && !this.elements.songNameInput.value.trim()) {
                              this.elements.songNameInput.value = title;
                          }
                      })
                      .catch((error) => {
                          console.warn("Could not fetch YouTube title:", error);
                      });
              }
          } else {
              this.removeYouTubeThumbnailPreview();
              this.elements.autofillBtn.disabled = true;
          }
      } else {
          this.removeYouTubeThumbnailPreview();
          this.elements.autofillBtn.disabled = true;
      }
  }
  fetchYouTubeTitle(videoId) {
    return new Promise((resolve, reject) => {
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch video info");
          }
          return response.json();
        })
        .then((data) => {
          resolve(data.title);
        })
        .catch((error) => {
          console.error("Error fetching YouTube title:", error);
          reject(error);
        });
    });
  }
  renderSongLibrary() {
    try {
      if (!this.elements.songLibrary) return;
      const sortedLibrary = [...this.songLibrary].sort((a, b) => {
        if (a.favorite !== b.favorite) {
          return a.favorite ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      const fragment = document.createDocumentFragment();
      if (sortedLibrary.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.classList.add("empty-library-message");
        emptyMessage.textContent =
          "Your library is empty. Add songs to get started!";
        fragment.appendChild(emptyMessage);
      } else {
        sortedLibrary.forEach((song) => {
          const songElement = this.createSongElement(song);
          fragment.appendChild(songElement);
        });
      }
      this.elements.songLibrary.innerHTML = "";
      this.elements.songLibrary.appendChild(fragment);
    } catch (error) {
      console.error("Error rendering song library:", error);
      this.elements.songLibrary.innerHTML =
        '<div class="error-message">Failed to display song library</div>';
    }
  }
  createSongElement(song) {
    const songElement = document.createElement("div");
    songElement.classList.add("song-item");
    songElement.innerHTML = `
            <span class="song-name" data-song-id="${song.id}">
                ${this.escapeHtml(song.name)}
                ${
                  song.author
                    ? `<small style="color: var(--text-secondary); display: block; font-size: 0.4em;">by ${this.escapeHtml(
                        song.author
                      )}</small>`
                    : ""
                }
            </span>
            <div class="song-actions">
                <button class="favorite-btn" data-song-id="${song.id}">
                    <i class="fa ${
                      song.favorite ? "fa-star" : "fa-star-o"
                    }"></i>
                </button>
                <button class="play-btn" data-song-id="${song.id}">Play</button>
                <button class="remove-btn" data-song-id="${
                  song.id
                }">Remove</button>
            </div>
        `;
    this.attachSongElementListeners(songElement, song);
    return songElement;
  }
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  attachSongElementListeners(songElement, song) {
    const favoriteBtn = songElement.querySelector(".favorite-btn");
    const playBtn = songElement.querySelector(".play-btn");
    const removeBtn = songElement.querySelector(".remove-btn");
    const songNameSpan = songElement.querySelector(".song-name");
    favoriteBtn.addEventListener("click", () => this.toggleFavorite(song.id));
    playBtn.addEventListener("click", () => this.playSong(song.id));
    removeBtn.addEventListener("click", () => this.removeSong(song.id));
    let clickTimeout;
    songNameSpan.addEventListener("click", () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
        this.openSongEditModal(song.id);
      } else {
        clickTimeout = setTimeout(() => {
          clickTimeout = null;
        }, 300);
      }
    });
  }
  filterLibrarySongs() {
    const searchTerm = this.elements.librarySearch.value.toLowerCase();
    const songItems = this.elements.songLibrary.querySelectorAll(".song-item");
    let resultsFound = false;
    songItems.forEach((item) => {
      const songElement = item.querySelector("span");
      const songName = songElement.textContent.toLowerCase();
      const songId = songElement.dataset.songId;
      const song = this.songLibrary.find((s) => s.id == songId);
      const authorMatch =
        song && song.author && song.author.toLowerCase().includes(searchTerm);
      const isVisible = songName.includes(searchTerm) || authorMatch;
      item.style.display = isVisible ? "flex" : "none";
      if (isVisible) {
        resultsFound = true;
      }
    });
    if (!resultsFound && searchTerm.trim() !== "") {
      this.showYouTubeSearchSuggestion(searchTerm);
    } else {
      this.hideYouTubeSearchSuggestion();
    }
  }
  showYouTubeSearchSuggestion(searchTerm) {
    const querySpan =
      this.elements.youtubeSearchSuggestion.querySelector(".search-query");
    querySpan.textContent = `Search for "${searchTerm}" on YouTube`;
    this.elements.youtubeSearchSuggestion.style.display = "block";
    this.elements.youtubeSearchSuggestion.onclick = null;
    this.elements.youtubeSearchSuggestion.onclick = () => {
      this.searchYouTube(searchTerm);
    };
  }
  hideYouTubeSearchSuggestion() {
    this.elements.youtubeSearchSuggestion.style.display = "none";
  }
  searchYouTube(searchTerm) {
    this.elements.songNameInput.value = searchTerm;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchTerm
    )}`;
    window.open(searchUrl, "_blank");
    this.openLibraryModal();
  }
  removeSong(songId) {
    const song = this.songLibrary.find((song) => song.id === songId);
    if (!song) return Promise.resolve();
    const videoId = song.videoId;
    this.songLibrary = this.songLibrary.filter((song) => song.id !== songId);
    return this.saveSongLibrary()
      .then(() => {
        let favoritesPlaylist = this.playlists.find(
          (p) =>
            p.name.toLowerCase() === "favorites" ||
            p.name.toLowerCase() === "favourite" ||
            p.name.toLowerCase() === "favourite songs" ||
            p.name.toLowerCase() === "favorite songs"
        );
        if (favoritesPlaylist) {
          const originalLength = favoritesPlaylist.songs.length;
          favoritesPlaylist.songs = favoritesPlaylist.songs.filter(
            (s) => s.videoId !== videoId
          );
          if (originalLength !== favoritesPlaylist.songs.length) {
            return this.savePlaylists();
          }
        }
        return Promise.resolve();
      })
      .then(() => {
        this.renderSongLibrary();
        this.renderPlaylists();
        this.updatePlaylistSelection();
      })
      .catch((error) => {
        console.error("Error removing song:", error);
        alert("Failed to remove song. Please try again.");
      });
  }
  createPlaylist() {
    const playlistName = this.elements.newPlaylistName.value.trim();
    if (!playlistName) {
      alert("Please enter a playlist name");
      return;
    }
    if (
      this.playlists.some(
        (p) => p.name.toLowerCase() === playlistName.toLowerCase()
      )
    ) {
      alert("A playlist with this name already exists");
      return;
    }
    const newPlaylist = {
      id: Date.now(),
      name: playlistName,
      songs: [],
      position: this.playlists.length,
    };
    this.playlists.push(newPlaylist);
    this.savePlaylists()
      .then(() => {
        this.renderPlaylists();
        this.updatePlaylistSelection();
        this.elements.newPlaylistName.value = "";
      })
      .catch((error) => {
        console.error("Error creating playlist:", error);
        alert("Failed to create playlist. Please try again.");
      });
  }
  renderPlaylists() {
    this.elements.playlistContainer.innerHTML = "";
    const sortedPlaylists = [...this.playlists].sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      return 0;
    });
    sortedPlaylists.forEach((playlist, index) => {
      if (playlist.position === undefined) {
        playlist.position = index;
      }
      const duration = this.getPlaylistDuration(playlist);
      let durationText = "";
      if (playlist.songs.length > 0) {
        durationText = ` • ${duration}`;
      }
      const playlistElement = document.createElement("div");
      playlistElement.classList.add("playlist-card");
      playlistElement.dataset.playlistId = playlist.id;
      playlistElement.dataset.position = playlist.position;
      playlistElement.draggable = false;
      playlistElement.innerHTML = `
                <h3 class="playlist-name">${playlist.name}</h3>
                <p>${playlist.songs.length} song${
        playlist.songs.length !== 1 ? "s" : ""
      }${durationText}</p>
                <div class="playlist-actions">
                    <button onclick="musicPlayer.openPlaylistEditModal(${
                      playlist.id
                    })">Edit</button>
                    <button onclick="musicPlayer.deletePlaylist(${
                      playlist.id
                    })">Delete</button>
                    <button onclick="musicPlayer.playPlaylist(${
                      playlist.id
                    })">Play</button>
                </div>
            `;
      const playlistNameEl = playlistElement.querySelector(".playlist-name");
      this.addHoldToDragHandler(playlistNameEl, playlistElement);
      this.elements.playlistContainer.appendChild(playlistElement);
    });
  }
  openPlaylistEditModal(playlistId) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    this.elements.currentPlaylistName.textContent = playlist.name;
    this.elements.currentPlaylistName.dataset.playlistId = playlistId;
    this.setupPlaylistNameEditing();
    this.renderCurrentPlaylistSongs(playlist);
    this.createDuplicateToggle();
    this.renderLibrarySearchResults(playlist);
    this.elements.playlistEditModal.style.display = "block";
  }
  createDuplicateToggle() {
      let toggleContainer = document.querySelector(".duplicate-toggle-container");
      if (!toggleContainer) {
        toggleContainer = document.createElement("div");
        toggleContainer.className = "duplicate-toggle-container";
        const duplicatesBtn = document.createElement("button");
        duplicatesBtn.className = "playlist-action-btn";
        duplicatesBtn.id = "allowDuplicatesBtn";
        this.updateDuplicatesButtonText(duplicatesBtn);
        duplicatesBtn.addEventListener("click", () => {
          this.allowDuplicates = !this.allowDuplicates;
          this.saveSetting("allowDuplicates", this.allowDuplicates);
          this.updateDuplicatesButtonText(duplicatesBtn);
          const playlistId = parseInt(
            this.elements.currentPlaylistName.dataset.playlistId
          );
          const playlist = this.playlists.find((p) => p.id === playlistId);
          if (playlist) {
            this.renderLibrarySearchResults(playlist);
          }
        });
        toggleContainer.appendChild(duplicatesBtn);
        const clearDuplicatesBtn = document.createElement("button");
        clearDuplicatesBtn.className = "playlist-action-btn";
        clearDuplicatesBtn.textContent = "Clear Duplicates";
        clearDuplicatesBtn.addEventListener("click", () => {
          this.clearPlaylistDuplicates();
        });
        toggleContainer.appendChild(clearDuplicatesBtn);
        const reverseBtn = document.createElement("button");
        reverseBtn.className = "playlist-action-btn";
        reverseBtn.textContent = "Reverse Position";
        reverseBtn.addEventListener("click", () => {
          this.reversePlaylistOrder();
        });
        toggleContainer.appendChild(reverseBtn);
        const searchContainer = this.elements.searchSongsToAdd.parentElement;
        searchContainer.insertBefore(
          toggleContainer,
          this.elements.librarySearchResults.nextSibling
        );
      } else {
        const duplicatesBtn = toggleContainer.querySelector(
          "#allowDuplicatesBtn"
        );
        if (duplicatesBtn) {
          this.updateDuplicatesButtonText(duplicatesBtn);
        }
      }
    }
  updateDuplicatesButtonText(button) {
    if (this.allowDuplicates) {
      button.textContent = "Duplicates Allowed";
      button.classList.remove("duplicates-banned");
      button.classList.add("duplicates-allowed");
    } else {
      button.textContent = "Duplicates Banned";
      button.classList.remove("duplicates-allowed");
      button.classList.add("duplicates-banned");
    }
  }
  renderCurrentPlaylistSongs(playlist) {
    this.elements.currentPlaylistSongs.innerHTML = "";
    if (playlist.songs.length > 0) {
      const randomizeBtn = document.createElement("button");
      randomizeBtn.className = "randomize-btn-absolute";
      randomizeBtn.innerHTML = '<i class="fa fa-refresh"></i>';
      randomizeBtn.title = "Randomize Playlist";
      randomizeBtn.addEventListener("click", () => {
        this.randomizePlaylist();
      });
      this.elements.currentPlaylistSongs.appendChild(randomizeBtn);
    }
    playlist.songs.forEach((song, index) => {
      const songElement = document.createElement("div");
      songElement.classList.add("playlist-song-item");
      songElement.draggable = true;
      songElement.dataset.videoId = song.videoId;
      songElement.dataset.entryId = song.entryId || Date.now() + index;
      songElement.dataset.index = index;
      songElement.innerHTML = `
                <span class="drag-handle">☰</span>
                <span class="song-name">${this.escapeHtml(song.name)}</span>
                <button class="remove-song-btn">Remove</button>
            `;
      const removeBtn = songElement.querySelector(".remove-song-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          this.removeSongFromPlaylist(
            playlist.id,
            song.entryId || songElement.dataset.entryId
          );
        });
      }
      songElement.addEventListener(
        "dragstart",
        this.handleDragStart.bind(this)
      );
      songElement.addEventListener("dragover", this.handleDragOver.bind(this));
      songElement.addEventListener("drop", this.handleDrop.bind(this));
      songElement.addEventListener("dragend", this.handleDragEnd.bind(this));
      this.elements.currentPlaylistSongs.appendChild(songElement);
    });
  }
  searchSongsToAddToPlaylist() {
    const playlistId = parseInt(
      this.elements.currentPlaylistName.dataset.playlistId
    );
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    this.renderLibrarySearchResults(playlist);
  }
  clearPlaylistDuplicates() {
    const playlistId = parseInt(
      this.elements.currentPlaylistName.dataset.playlistId
    );
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const seenVideoIds = new Set();
    const uniqueSongs = [];
    playlist.songs.forEach((song) => {
      if (!seenVideoIds.has(song.videoId)) {
        seenVideoIds.add(song.videoId);
        uniqueSongs.push(song);
      }
    });
    if (uniqueSongs.length !== playlist.songs.length) {
      playlist.songs = uniqueSongs;
      this.savePlaylists()
        .then(() => {
          this.renderCurrentPlaylistSongs(playlist);
          this.renderLibrarySearchResults(playlist);
          this.renderPlaylists();
        })
        .catch((error) => {
          console.error("Error clearing duplicates:", error);
          alert("Failed to clear duplicates. Please try again.");
        });
    } else {
      alert("No duplicates found in this playlist.");
    }
  }
  reversePlaylistOrder() {
    const playlistId = parseInt(
      this.elements.currentPlaylistName.dataset.playlistId
    );
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    playlist.songs.reverse();
    this.savePlaylists()
      .then(() => {
        this.renderCurrentPlaylistSongs(playlist);
        this.renderPlaylists();
      })
      .catch((error) => {
        console.error("Error reversing playlist:", error);
        alert("Failed to reverse playlist. Please try again.");
      });
  }
  randomizePlaylist() {
    const playlistId = parseInt(
      this.elements.currentPlaylistName.dataset.playlistId
    );
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    for (let i = playlist.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playlist.songs[i], playlist.songs[j]] = [
        playlist.songs[j],
        playlist.songs[i],
      ];
    }
    this.savePlaylists()
      .then(() => {
        this.renderCurrentPlaylistSongs(playlist);
        this.renderPlaylists();
      })
      .catch((error) => {
        console.error("Error randomizing playlist:", error);
        alert("Failed to randomize playlist. Please try again.");
      });
  }
  renderLibrarySearchResults(playlist) {
    const searchTerm = this.elements.searchSongsToAdd.value.toLowerCase();
    this.elements.librarySearchResults.innerHTML = "";
    let songsToShow = this.songLibrary;
    if (!this.allowDuplicates) {
      const playlistVideoIds = new Set(
        playlist.songs.map((song) => song.videoId)
      );
      songsToShow = this.songLibrary.filter(
        (song) => !playlistVideoIds.has(song.videoId)
      );
    }
    songsToShow.forEach((song) => {
      const songNameMatch = song.name.toLowerCase().includes(searchTerm);
      const authorMatch =
        song.author && song.author.toLowerCase().includes(searchTerm);
      if (songNameMatch || authorMatch) {
        const songElement = document.createElement("div");
        songElement.classList.add("search-song-item");
        const spanElement = document.createElement("span");
        spanElement.textContent = song.name;
        const buttonElement = document.createElement("button");
        buttonElement.textContent = "Add";
        buttonElement.addEventListener("click", () => {
          this.addSongToCurrentPlaylist(song.name, song.videoId);
        });
        songElement.appendChild(spanElement);
        songElement.appendChild(buttonElement);
        this.elements.librarySearchResults.appendChild(songElement);
      }
    });
  }
  addSongToCurrentPlaylist(songName, videoId) {
    const playlistId = parseInt(
      this.elements.currentPlaylistName.dataset.playlistId
    );
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    playlist.songs.push({
      name: songName,
      videoId: videoId,
      entryId: Date.now(),
    });
    this.savePlaylists()
      .then(() => {
        this.renderCurrentPlaylistSongs(playlist);
        this.renderLibrarySearchResults(playlist);
        this.renderPlaylists();
      })
      .catch((error) => {
        console.error("Error adding song to playlist:", error);
        alert("Failed to add song to playlist. Please try again.");
      });
  }
  addSongToSelectedPlaylist() {
    const selectedPlaylistId = parseInt(
      this.elements.playlistSelectionForSong.value
    );
    const selectedSongName = this.elements.songNameInput.value.trim();
    const selectedSongUrl = this.elements.songUrlInput.value.trim();
    if (!selectedSongName || !selectedSongUrl) {
      alert("Please enter song name and URL");
      return;
    }
    const videoId = this.extractYouTubeId(selectedSongUrl);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }
    const newSong = {
      name: selectedSongName,
      videoId: videoId,
      entryId: Date.now(),
    };
    const playlist = this.playlists.find((p) => p.id === selectedPlaylistId);
    if (playlist) {
      playlist.songs.push(newSong);
      this.savePlaylists()
        .then(() => {
          this.renderPlaylists();
          this.elements.songNameInput.value = "";
          this.elements.songUrlInput.value = "";
        })
        .catch((error) => {
          console.error("Error adding song to playlist:", error);
          alert("Failed to add song to playlist. Please try again.");
        });
    }
  }
  updatePlaylistSelection() {
    if (this.elements.playlistSelectionForSong) {
      this.elements.playlistSelectionForSong.innerHTML = "";
      this.playlists.forEach((playlist) => {
        const option = document.createElement("option");
        option.value = playlist.id;
        option.textContent = playlist.name;
        this.elements.playlistSelectionForSong.appendChild(option);
      });
    }
  }
  removeSongFromPlaylist(playlistId, entryId) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter((song) => song.entryId != entryId);
      this.savePlaylists()
        .then(() => {
          this.renderCurrentPlaylistSongs(playlist);
          this.renderLibrarySearchResults(playlist);
          this.renderPlaylists();
          if (this.currentPlaylist && this.currentPlaylist.id === playlistId) {
            this.renderPlaylistSidebar();
          }
        })
        .catch((error) => {
          console.error("Error removing song from playlist:", error);
          alert("Failed to remove song from playlist. Please try again.");
        });
    }
  }
  closePlaylistModal() {
    if (this.elements.playlistEditModal) {
      this.elements.playlistEditModal.style.display = "none";
    }
    if (this.elements.playlistSongsModal) {
      this.elements.playlistSongsModal.style.display = "none";
    }
    this.elements.playlistEditModal.style.display = "none";
    if (this.handlePlaylistNameClick) {
      this.elements.currentPlaylistName.removeEventListener(
        "click",
        this.handlePlaylistNameClick
      );
    }
  }
  deletePlaylist(playlistId) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const confirmDelete = confirm(
      `Are you sure you want to delete the playlist "${playlist.name}"?`
    );
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
    this.playlists = this.playlists.filter((p) => p.id !== playlistId);
    this.savePlaylists()
      .then(() => {
        this.renderPlaylists();
        this.updatePlaylistSelection();
      })
      .catch((error) => {
        console.error("Error deleting playlist:", error);
        alert("Failed to delete playlist. Please try again.");
      });
  }
  playPlaylist(playlistId) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist || !playlist.songs.length) {
      alert("Playlist is empty");
      return;
    }
    this.currentPlaylist = playlist;
    this.currentSongIndex = 0;
    if (this.temporarilySkippedSongs.size > 0) {
      let foundNonSkipped = false;
      for (let i = 0; i < playlist.songs.length; i++) {
        const entryId =
          playlist.songs[i].entryId || "id_" + playlist.songs[i].videoId;
        if (!this.temporarilySkippedSongs.has(entryId)) {
          this.currentSongIndex = i;
          foundNonSkipped = true;
          break;
        }
      }
      if (!foundNonSkipped) {
        alert("All songs in this playlist are temporarily skipped");
        return;
      }
    }
    this.playSongById(playlist.songs[this.currentSongIndex].videoId);
    this.showSidebar();
    this.renderPlaylistSidebar();
    this.saveRecentlyPlayedPlaylist(playlist);
  }
  playSong(songId) {
    const song = this.songLibrary.find((s) => s.id === songId);
    if (!song) return;
    this.currentPlaylist = null;
    this.currentSongIndex = this.songLibrary.findIndex((s) => s.id === songId);
    this.playSongById(song.videoId);
    this.hideSidebar();
    this.saveRecentlyPlayedSong(song);
    if (
      document.getElementById("lyrics") &&
      document.getElementById("lyrics").classList.contains("active")
    ) {
      this.renderLyricsTab();
    }
  }
  handleSongNameRightClick(event) {
  event.preventDefault();
  const songName = this.elements.currentSongName.textContent;
  if (songName && songName !== "No Song Playing") {
    navigator.clipboard.writeText(songName).then(() => {
      const originalText = this.elements.currentSongName.textContent;
      this.elements.currentSongName.textContent = "Copied!";
      setTimeout(() => {
        this.elements.currentSongName.textContent = originalText;
      }, 1000);
    }).catch(() => {
      console.warn('Failed to copy to clipboard');
    });
  }
}
 playSongById(videoId) {
  if (!this.ytPlayer) {
    console.error("YouTube player not initialized");
    return;
  }
  
  if (!videoId) {
    console.error("No video ID provided");
    return;
  }
  
  try {
    console.log("Loading video:", videoId);
    
    this.ytPlayer.loadVideoById({
      videoId: videoId,
      suggestedQuality: "small",
    });
    
    // Set quality after a short delay
    setTimeout(() => {
      try {
        this.ytPlayer.setPlaybackQuality("small");
      } catch (error) {
        console.warn("Failed to set video quality:", error);
      }
    }, 200);
    
    this.isPlaying = true;
    this.updatePlayerUI();
    
    // Reset progress bar
    if (this.elements.progressBar) {
      this.elements.progressBar.value = 0;
    }
    
    // Update playlist sidebar if visible
    if (this.currentPlaylist && this.isSidebarVisible) {
      this.renderPlaylistSidebar();
    }
    
    // Set playback speed if different from default
    if (this.currentSpeed !== 1) {
      setTimeout(() => {
        try {
          this.ytPlayer.setPlaybackRate(this.currentSpeed);
        } catch (error) {
          console.warn("Failed to set playback speed:", error);
        }
      }, 500);
    }
    
    this.updateProgressBar();
    this.updatePageTitle();
    
  } catch (error) {
    console.error("Error playing song with ID " + videoId + ":", error);
    alert("Failed to play the video. Please try again.");
    
    // Try next song if autoplay is enabled
    if (this.isAutoplayEnabled) {
      setTimeout(() => {
        this.playNextSong();
      }, 1000);
    }
  }
}
 
  togglePlayPause() {
    if (!this.ytPlayer) {
      console.warn("YouTube player not initialized");
      return;
    }
    try {
      const playerState = this.ytPlayer.getPlayerState();
      if (playerState === YT.PlayerState.PLAYING) {
        this.ytPlayer.pauseVideo();
        this.isPlaying = false;
        if (this.titleScrollInterval) {
          clearInterval(this.titleScrollInterval);
          this.titleScrollInterval = null;
          document.title = "Music Player";
        }
      } else {
        this.ytPlayer.playVideo();
        this.isPlaying = true;
        this.updatePageTitle();
      }
      this.updatePlayerUI();
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  }
  playNextSong() {
  // Handle queue first
  if (this.songQueue.length > 0) {
    const nextSong = this.songQueue.shift();
    this.saveQueue();
    this.updateQueueVisualIndicators();
    
    const songInLibrary = this.songLibrary.find(s => s.videoId === nextSong.videoId);
    if (songInLibrary) {
      this.currentSongIndex = this.songLibrary.findIndex(s => s.id === songInLibrary.id);
      this.currentPlaylist = null;
    }
    
    this.saveRecentlyPlayedSong(nextSong);
    this.playSongById(nextSong.videoId);
    this.updatePlayerUI();
    return;
  }
  
  const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
  if (!source.length) return;
  
  // Handle temporarily skipped songs in playlist
  if (this.currentPlaylist && this.temporarilySkippedSongs && this.temporarilySkippedSongs.size > 0) {
    this.playNextNonSkippedSong();
    return;
  }
  
  // Check if we're at the end and not looping
  if (this.currentSongIndex === source.length - 1 && !this.isPlaylistLooping) {
    if (this.ytPlayer) {
      this.ytPlayer.stopVideo();
      this.isPlaying = false;
      this.updatePlayerUI();
    }
    return;
  }
  
  // Move to next song
  this.currentSongIndex = (this.currentSongIndex + 1) % source.length;
  const currentSong = source[this.currentSongIndex];
  
  this.saveRecentlyPlayedSong(currentSong);
  
  if (this.currentPlaylist) {
    this.playSongById(currentSong.videoId);
  } else {
    this.playCurrentSong();
  }
}

  playPreviousSong() {
  const source = this.currentPlaylist
    ? this.currentPlaylist.songs
    : this.songLibrary;
  if (!source.length) return;
  if (this.currentPlaylist && this.temporarilySkippedSongs.size > 0) {
    const totalSongs = source.length;
    let prevIndex = (this.currentSongIndex - 1 + totalSongs) % totalSongs;
    const startIndex = prevIndex;
    while (this.isSongTemporarilySkipped(source[prevIndex])) {
      prevIndex = (prevIndex - 1 + totalSongs) % totalSongs;
      if (prevIndex === startIndex) {
        return;
      }
    }
    this.currentSongIndex = prevIndex;
    this.saveRecentlyPlayedSong(source[this.currentSongIndex]); 
    this.playSongById(source[this.currentSongIndex].videoId);
    return;
  }
  this.currentSongIndex =
    (this.currentSongIndex - 1 + source.length) % source.length;
  const currentSong = source[this.currentSongIndex]; 
  this.saveRecentlyPlayedSong(currentSong); 
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
  if (!this.currentPlaylist || index >= this.currentPlaylist.songs.length)
    return;
  const song = this.currentPlaylist.songs[index];
  const entryId = song.entryId || "id_" + song.videoId;
  if (this.temporarilySkippedSongs.has(entryId)) {
    return;
  }
  this.currentSongIndex = index;
  this.saveRecentlyPlayedSong(song); 
  this.playSongById(song.videoId);
}
  async saveSetting(key, value) {
  if (!this.db) return;
  
  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(["settings"], "readwrite");
    const store = transaction.objectStore("settings");
    const request = store.put({ name: key, value: value });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
updatePlayerUI() {
    let currentSong;
    if (this.currentPlaylist && this.currentPlaylist.songs[this.currentSongIndex]) {
        currentSong = this.currentPlaylist.songs[this.currentSongIndex];
    } else if (this.songLibrary[this.currentSongIndex]) {
        currentSong = this.songLibrary[this.currentSongIndex];
    } else {
        if (this.ytPlayer && this.ytPlayer.getVideoData) {
            try {
                const videoData = this.ytPlayer.getVideoData();
                const currentVideoId = videoData.video_id;
                currentSong = this.songLibrary.find(s => s.videoId === currentVideoId) ||
                             (this.currentPlaylist && this.currentPlaylist.songs.find(s => s.videoId === currentVideoId));
            } catch (e) {
                console.warn('Could not get current video data:', e);
            }
        }
    }
    if (!currentSong) {
        this.elements.currentSongName.textContent = "No Song Playing";
        this.elements.nextSongName.textContent = "-";
        const playPauseIcon = this.elements.playPauseBtn.querySelector("i");
        if (playPauseIcon) {
            playPauseIcon.classList.remove("fa-play", "fa-pause");
            playPauseIcon.classList.add("fa-play");
        }
        this.updatePageTitle(); 
        return;
    }
    this.elements.currentSongName.textContent = currentSong.name;
    if (this.isLooping) {
        this.elements.nextSongName.textContent = currentSong.name;
    } else if (this.songQueue.length > 0) {
        this.elements.nextSongName.textContent = `Queue: ${this.songQueue[0].name}`;
    } else if (!this.isAutoplayEnabled) {
        this.elements.nextSongName.textContent = "Autoplay disabled";
    } else {
        const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
        if (this.currentPlaylist && this.temporarilySkippedSongs && this.temporarilySkippedSongs.size > 0) {
            const totalSongs = source.length;
            let nextIndex = (this.currentSongIndex + 1) % totalSongs;
            const startIndex = nextIndex;
            while (this.isSongTemporarilySkipped(source[nextIndex])) {
                nextIndex = (nextIndex + 1) % totalSongs;
                if (nextIndex === startIndex) {
                    this.elements.nextSongName.textContent = "No next song available";
                    break;
                }
                if (nextIndex === 0 && !this.isPlaylistLooping) {
                    this.elements.nextSongName.textContent = "End of playlist";
                    break;
                }
            }
            if (
                this.elements.nextSongName.textContent !== "No next song available" &&
                this.elements.nextSongName.textContent !== "End of playlist"
            ) {
                this.elements.nextSongName.textContent = source[nextIndex].name;
            }
        } else {
            const nextSongIndex = (this.currentSongIndex + 1) % source.length;
            const nextSong = source[nextSongIndex];
            if (
                this.currentSongIndex === source.length - 1 &&
                !this.isPlaylistLooping
            ) {
                this.elements.nextSongName.textContent = "End of playlist";
            } else {
                this.elements.nextSongName.textContent = nextSong.name;
            }
        }
    }
    const playPauseIcon = this.elements.playPauseBtn.querySelector("i");
    if (playPauseIcon) {
        playPauseIcon.classList.remove("fa-play", "fa-pause");
        playPauseIcon.classList.add(this.isPlaying ? "fa-pause" : "fa-play");
    }
    if (this.elements.autoplayBtn) {
        this.elements.autoplayBtn.classList.toggle("active", this.isAutoplayEnabled);
    }
    if (this.currentPlaylist && this.isSidebarVisible) {
        this.renderPlaylistSidebar();
    }
    this.updatePageTitle();
}
  escapeJsString(str) {
    if (!str) return "";
    return str
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
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
    this.elements.currentPlaylistSidebar.classList.add("visible");
    this.isSidebarVisible = true;
    this.renderPlaylistSidebar();
  }
  hideSidebar() {
    this.elements.currentPlaylistSidebar.classList.remove("visible");
    this.isSidebarVisible = false;
  }
  renderPlaylistSidebar() {
    if (!this.currentPlaylist) return;
    this.elements.sidebarPlaylistName.textContent = this.currentPlaylist.name;
    if (this.elements.playlistTotalDuration) {
      this.elements.playlistTotalDuration.textContent =
        this.getPlaylistDurationText();
    }
    this.updatePlaylistLoopButton();
    this.elements.sidebarPlaylistSongs.innerHTML = "";
    this.currentPlaylist.songs.forEach((song, index) => {
      const songElement = document.createElement("div");
      songElement.classList.add("sidebar-song-item");
      const entryId = song.entryId || "id_" + song.videoId;
      songElement.dataset.entryId = entryId;
      if (index === this.currentSongIndex) {
        songElement.classList.add("active");
      }
      if (this.temporarilySkippedSongs.has(entryId)) {
        songElement.classList.add("temporarily-skipped");
      }
      songElement.innerHTML = `
                <span>${index + 1}. ${song.name}</span>
            `;
      let clickHandler = (e) => {
        if (!this.isLongPressing) {
          this.playSongFromPlaylist(index);
        }
      };
      songElement.addEventListener("click", clickHandler);
      songElement.addEventListener("mousedown", (e) => {
        clearTimeout(this.longPressTimer);
        this.isLongPressing = false;
        this.longPressTimer = setTimeout(() => {
          this.isLongPressing = true;
          this.temporarilySkipSong(entryId);
          setTimeout(() => {
            this.isLongPressing = false;
          }, 300);
        }, 400);
      });
      const cancelLongPress = () => {
        clearTimeout(this.longPressTimer);
      };
      songElement.addEventListener("mouseup", cancelLongPress);
      songElement.addEventListener("mouseleave", cancelLongPress);
      songElement.addEventListener("touchstart", (e) => {
        clearTimeout(this.longPressTimer);
        this.isLongPressing = false;
        this.longPressTimer = setTimeout(() => {
          this.isLongPressing = true;
          this.temporarilySkipSong(entryId);
          setTimeout(() => {
            this.isLongPressing = false;
          }, 300);
          e.preventDefault();
        }, 400);
      });
      songElement.addEventListener("touchend", cancelLongPress);
      songElement.addEventListener("touchcancel", cancelLongPress);
      this.elements.sidebarPlaylistSongs.appendChild(songElement);
    });
    if (this.currentPlaylist.songs.length > 0) {
      const activeElement = this.elements.sidebarPlaylistSongs.querySelector(
        ".sidebar-song-item.active"
      );
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
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
  this.ytPlayer = new YT.Player("ytPlayer", {
    height: "1",
    width: "1",
    playerVars: {
      'rel': 0,          // Limit related videos to same channel
      'showinfo': 0,     // Don't show video info
      'controls': 0,     // Hide player controls
      'disablekb': 1,    // Disable keyboard controls
      'fs': 0,           // Disable fullscreen button
      'modestbranding': 1, // Remove YouTube logo
      'playsinline': 1,  // Play inline on mobile
      'autoplay': 0,     // Don't autoplay 
      'iv_load_policy': 3, // Don't show annotations
      'cc_load_policy': 0, // Don't show closed captions
      'cc_lang_pref': 'en', // Set caption language
      'hl': 'en',        // Set interface language
      'enablejsapi': 1,  // Enable JS API
      'origin': window.location.origin, // Set origin for security
      'widget_referrer': window.location.href // Set referrer
    },
    events: {
      onReady: this.onPlayerReady.bind(this),
      onStateChange: this.onPlayerStateChange.bind(this),
      onError: this.onPlayerError.bind(this)
    },
  });
}

// Add player ready handler
onPlayerReady(event) {
  console.log("YouTube player is ready");
  // Initialize autoplay state on player ready
  this.initializeAutoplay();
}
  // Add error handler
onPlayerError(event) {
  console.error("YouTube player error:", event.data);
  // Handle different error codes
  switch(event.data) {
    case 2:
      console.error("Invalid video ID");
      break;
    case 5:
      console.error("Video not available in HTML5 player");
      break;
    case 100:
      console.error("Video not found or private");
      break;
    case 101:
    case 150:
      console.error("Video not allowed to be played in embedded players");
      break;
  }
  
  // Try to play next song if current one fails
  if (this.isAutoplayEnabled) {
    setTimeout(() => {
      this.playNextSong();
    }, 1000);
  }
}

  
onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        console.log("Song ended - taking immediate action");
        
        // Immediately prevent YouTube from showing anything
        setTimeout(() => {
            if (this.isLooping) {
                const currentVideoId = this.getCurrentVideoId();
                if (currentVideoId) {
                    this.playSongById(currentVideoId);
                }
            } else if (this.isAutoplayEnabled) {
                this.playNextSong();
            } else {
                this.isPlaying = false;
                this.updatePlayerUI();
            }
        }, 0); // Execute immediately on next tick
        
        // Reset UI immediately
        if (this.elements.progressBar) {
            this.elements.progressBar.value = 0;
        }
        if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = "0:00/0:00";
        }
        
    } else if (event.data === YT.PlayerState.PAUSED) {
        this.isPlaying = false;
        this.updatePlayerUI();
        if (this.titleScrollInterval) {
            clearInterval(this.titleScrollInterval);
            this.titleScrollInterval = null;
        }
        this.updatePageTitle();
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        if (this.lyricsInterval) {
            clearInterval(this.lyricsInterval);
        }
        if (this.fullscreenLyricsInterval) {
            clearInterval(this.fullscreenLyricsInterval);
        }
        
    } else if (event.data === YT.PlayerState.PLAYING) {
        this.isPlaying = true;
        this.updatePlayerUI();
        if (this.currentSpeed !== 1) {
            this.ytPlayer.setPlaybackRate(this.currentSpeed);
        }
        this.updateProgressBar();
        this.startListeningTimeTracking();
        if (document.getElementById("lyrics") && document.getElementById("lyrics").classList.contains("active")) {
            this.renderLyricsTab();
        }
        if (this.isLyricsFullscreen) {
            this.renderFullscreenLyrics();
        }
    }
    
    if (event.data === YT.PlayerState.PLAYING) {
        this.visualizer.isActive = true;
    }
}
  handleSongEnd() {
  // Clear all intervals when song ends
  this.clearAllIntervals();
  
  // Reset progress bar immediately
  if (this.elements.progressBar) {
    this.elements.progressBar.value = 0;
  }
  if (this.elements.timeDisplay) {
    this.elements.timeDisplay.textContent = "0:00/0:00";
  }
  
  if (this.isLooping) {
    console.log("Looping current song");
    const currentVideoId = this.getCurrentVideoId();
    if (currentVideoId) {
      // Immediately start the same song again
      this.playSongById(currentVideoId);
    }
  } else if (this.isAutoplayEnabled) {
    console.log("Autoplay enabled - calling playNextSong()");
    // Immediately play next song
    this.playNextSong();
  } else {
    console.log("Autoplay disabled - stopping playback");
    this.isPlaying = false;
    // Force stop the player to prevent related videos
    if (this.ytPlayer) {
      try {
        this.ytPlayer.stopVideo();
      } catch (error) {
        console.warn("Error stopping video:", error);
      }
    }
    this.updatePlayerUI();
    this.updatePageTitle();
  }
}
  getCurrentVideoId() {
  if (!this.ytPlayer || !this.ytPlayer.getVideoData) return null;
  
  try {
    const videoData = this.ytPlayer.getVideoData();
    return videoData.video_id;
  } catch (error) {
    console.warn("Could not get current video ID:", error);
    
    // Fallback: get from current song
    if (this.currentPlaylist && this.currentPlaylist.songs[this.currentSongIndex]) {
      return this.currentPlaylist.songs[this.currentSongIndex].videoId;
    } else if (this.songLibrary[this.currentSongIndex]) {
      return this.songLibrary[this.currentSongIndex].videoId;
    }
    
    return null;
  }
}
  clearAllIntervals() {
  const intervals = [
    'progressInterval',
    'listeningTimeInterval', 
    'titleScrollInterval',
    'lyricsInterval',
    'fullscreenLyricsInterval'
  ];
  
  intervals.forEach(intervalName => {
    if (this[intervalName]) {
      clearInterval(this[intervalName]);
      this[intervalName] = null;
    }
  });
}

// Helper method to clear non-essential intervals (keep progress tracking)
clearNonEssentialIntervals() {
  const intervals = [
    'titleScrollInterval',
    'lyricsInterval', 
    'fullscreenLyricsInterval'
  ];
  
  intervals.forEach(intervalName => {
    if (this[intervalName]) {
      clearInterval(this[intervalName]);
      this[intervalName] = null;
    }
  });
}

  toggleLoop() {
    this.isLooping = !this.isLooping;
    this.elements.loopBtn.classList.toggle("active", this.isLooping);
    this.updatePlayerUI();
  }
  setVolume(volume) {
    if (this.ytPlayer) {
      this.ytPlayer.setVolume(volume);
    }
  }
   // Fixed autoplay toggle
toggleAutoplay() {
  this.isAutoplayEnabled = !this.isAutoplayEnabled;
  
  // Update button state immediately
  if (this.elements.autoplayBtn) {
    this.elements.autoplayBtn.classList.toggle("active", this.isAutoplayEnabled);
  }
  
  // Update UI
  this.updatePlayerUI();
  
  // Save setting to database
  if (this.db) {
    this.saveSetting("autoplay", this.isAutoplayEnabled).catch((error) => {
      console.error("Error saving autoplay setting:", error);
    });
  }
  
  console.log("Autoplay toggled:", this.isAutoplayEnabled);
}

// Fixed autoplay initialization
initializeAutoplay() {
  if (!this.db) {
    this.isAutoplayEnabled = true;
    if (this.elements.autoplayBtn) {
      this.elements.autoplayBtn.classList.toggle("active", this.isAutoplayEnabled);
    }
    return;
  }
  
  const transaction = this.db.transaction(["settings"], "readonly");
  const store = transaction.objectStore("settings");
  const request = store.get("autoplay");
  
  request.onsuccess = () => {
    const savedAutoplay = request.result ? request.result.value : true;
    this.isAutoplayEnabled = savedAutoplay;
    
    if (this.elements.autoplayBtn) {
      this.elements.autoplayBtn.classList.toggle("active", this.isAutoplayEnabled);
    }
    
    console.log("Autoplay initialized:", this.isAutoplayEnabled);
  };
  
  request.onerror = (event) => {
    console.error("Error loading autoplay setting:", event.target.error);
    this.isAutoplayEnabled = true;
    
    if (this.elements.autoplayBtn) {
      this.elements.autoplayBtn.classList.toggle("active", this.isAutoplayEnabled);
    }
  };
}
  switchTab(tabName) {
    this.elements.tabs.forEach((tab) => tab.classList.remove("active"));
    this.elements.tabPanes.forEach((pane) => pane.classList.remove("active"));
    document
      .querySelector(`.tab[data-tab="${tabName}"]`)
      .classList.add("active");
    document.getElementById(tabName).classList.add("active");
    if (tabName === "lyrics") {
      this.renderLyricsTab();
    }
  }
  savePlaylists() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }
      const transaction = this.db.transaction(["playlists"], "readwrite");
      const store = transaction.objectStore("playlists");
      store.clear();
      this.playlists.forEach((playlist) => {
        store.add(playlist);
      });
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (event) => {
        console.error("Error saving playlists:", event.target.error);
        reject("Could not save playlists");
      };
    });
  }
  saveSetting(name, value) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }
      const transaction = this.db.transaction(["settings"], "readwrite");
      const store = transaction.objectStore("settings");
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
        reject(new Error("Database not initialized"));
        return;
      }
      try {
        const transaction = this.db.transaction(["songLibrary"], "readwrite");
        const store = transaction.objectStore("songLibrary");
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
          console.error("Error saving song library:", event.target.error);
          reject(
            new Error(
              "Failed to save song library: " + event.target.error.message
            )
          );
        };
      } catch (error) {
        console.error("Exception in saveSongLibrary:", error);
        reject(error);
      }
    });
  }
  renderInitialState() {
    this.renderPlaylists();
    this.renderSongLibrary();
    this.updatePlaylistSelection();
    this.updateListeningTimeDisplay();
    this.renderAdditionalDetails();
    document.title = "Music";
    this.elements.speedBtn.textContent = this.currentSpeed + "x";
    const controlBarVisible = localStorage.getItem("controlBarVisible");
    if (controlBarVisible === "false") {
      setTimeout(() => {
        const controlBar =
          document
            .querySelector(".player-controls")
            .closest(".player-container") ||
          document.querySelector(".player-controls").parentElement;
        if (controlBar) {
          controlBar.style.visibility = "hidden";
          controlBar.style.position = "absolute";
          controlBar.style.pointerEvents = "none";
        }
        const toggleBtn = document.getElementById("toggleControlBarBtn");
      }, 100);
    }
    setTimeout(() => {
      this.showWelcomeModal();
    }, 1000);
  }
  extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /^([^"&?\/\s]{11})$/i,
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
  if (!this.elements.listeningTimeDisplay) return;
  const seconds = this.listeningTime % 60;
  const minutes = Math.floor(this.listeningTime / 60) % 60;
  const hours = Math.floor(this.listeningTime / 3600);
  const newText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  if (this.elements.listeningTimeDisplay.textContent !== newText) {
    this.elements.listeningTimeDisplay.textContent = newText;
  }
}
startListeningTimeTracking() {
  if (this.listeningTimeInterval) {
    clearInterval(this.listeningTimeInterval);
  }
  this.listeningTimeInterval = setInterval(() => {
    this.listeningTime++;
    if (this.listeningTime % 60 === 0) {
      this.updateListeningTimeDisplay();
      this.saveListeningTime();
    }
  }, 1000);
}
saveListeningTime() {
  if (this.saveTimeout) {
    clearTimeout(this.saveTimeout);
  }
  this.saveTimeout = setTimeout(() => {
    this.saveSetting("listeningTime", this.listeningTime).catch((error) =>
      console.error("Error saving listening time:", error)
    );
  }, 100);
}
  toggleSpeedOptions() {
    this.elements.speedOptions.classList.toggle("show");
    if (this.elements.speedOptions.classList.contains("show")) {
      setTimeout(() => {
        const closeSpeedMenu = (e) => {
          if (
            !this.elements.speedBtn.contains(e.target) &&
            !this.elements.speedOptions.contains(e.target)
          ) {
            this.elements.speedOptions.classList.remove("show");
            document.removeEventListener("click", closeSpeedMenu);
          }
        };
        document.addEventListener("click", closeSpeedMenu);
      }, 0);
    }
  }
  setPlaybackSpeed(speed) {
    this.currentSpeed = speed;
    this.elements.speedBtn.textContent = speed + "x";
    this.elements.speedOptions.classList.remove("show");
    if (this.ytPlayer) {
      this.ytPlayer.setPlaybackRate(speed);
    }
    this.saveSetting("playbackSpeed", speed).catch((error) => {
      console.error("Error saving playback speed:", error);
    });
  }
  exportLibrary() {
    let exportText = "";
    this.songLibrary.forEach((song) => {
      const author = song.author ? `, ${song.author}` : "";
      exportText += `${song.name}, https://www.youtube.com/watch?v=${song.videoId}${author}\n`;
    });
    this.copyToClipboardWithFallback(
      exportText,
      "Library exported to clipboard successfully!",
      "Export Library"
    );
  }
  exportPlaylist(playlistId) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) {
      alert("Playlist not found");
      return;
    }
    let exportText = `${playlist.name}{\n`;
    playlist.songs.forEach((playlistSong) => {
      const libraryMatch = this.songLibrary.find(
        (s) => s.videoId === playlistSong.videoId
      );
      const songName = libraryMatch ? libraryMatch.name : playlistSong.name;
      const author = libraryMatch
        ? libraryMatch.author
        : playlistSong.author || "";
      const authorText = author ? `, ${author}` : "";
      exportText += `    ${songName}, https://www.youtube.com/watch?v=${playlistSong.videoId}${authorText}\n`;
    });
    exportText += "}\n";
    this.copyToClipboardWithFallback(
      exportText,
      `"${playlist.name}" playlist exported to clipboard successfully!`,
      "Export Playlist"
    );
  }
  copyToClipboardWithFallback(text, successMessage, modalTitle) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(successMessage);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        this.showExportModal(text, modalTitle);
      });
  }
  showExportModal(exportText, title = "Export") {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "block";
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement("h2");
    heading.textContent = title;
    const instructions = document.createElement("p");
    instructions.textContent = "Copy the text below to share:";
    const textarea = document.createElement("textarea");
    textarea.value = exportText;
    textarea.style.width = "100%";
    textarea.style.height = "200px";
    textarea.readOnly = true;
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy to Clipboard";
    copyBtn.classList.add("copy-btn");
    copyBtn.onclick = () => {
      textarea.select();
      document.execCommand("copy");
      alert("Copied to clipboard!");
    };
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(instructions);
    modalContent.appendChild(textarea);
    modalContent.appendChild(copyBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  showExportDropdown(triggerElement) {
    this.hideExportDropdown();
    const dropdown = document.createElement("div");
    dropdown.id = "exportDropdown";
    dropdown.className = "export-dropdown";
    const rect = triggerElement.getBoundingClientRect();
    dropdown.style.position = "absolute";
    dropdown.style.top = rect.bottom + window.scrollY + "px";
    dropdown.style.left = rect.left + "px";
    dropdown.style.minWidth = rect.width + "px";
    dropdown.style.zIndex = "1000";
    const exportSongsBtn = document.createElement("button");
    exportSongsBtn.className = "dropdown-item";
    exportSongsBtn.textContent = "Export Songs";
    exportSongsBtn.onclick = () => {
      this.exportLibrary();
      this.hideExportDropdown();
    };
    const exportSongsWithPlaylistBtn = document.createElement("button");
    exportSongsWithPlaylistBtn.className = "dropdown-item";
    exportSongsWithPlaylistBtn.textContent = "Export Songs with Playlist";
    exportSongsWithPlaylistBtn.onclick = () => {
      this.exportSongsWithAllPlaylists();
      this.hideExportDropdown();
    };
    const exportPlaylistBtn = document.createElement("button");
    exportPlaylistBtn.className = "dropdown-item";
    exportPlaylistBtn.textContent = "Export Playlist";
    exportPlaylistBtn.onclick = () => {
      this.showPlaylistSelectionForExport();
      this.hideExportDropdown();
    };
    dropdown.appendChild(exportSongsBtn);
    dropdown.appendChild(exportSongsWithPlaylistBtn);
    dropdown.appendChild(exportPlaylistBtn);
    document.body.appendChild(dropdown);
    requestAnimationFrame(() => {
      dropdown.style.opacity = "1";
      dropdown.style.transform = "translateY(0)";
    });
  }
  showPlaylistSelectionForExport() {
    if (this.playlists.length === 0) {
      alert("No playlists available. Create a playlist first.");
      return;
    }
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "block";
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content", "playlist-export-modal");
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement("h2");
    heading.textContent = "Select Playlist to Export";
    heading.classList.add("modal-heading");
    const playlistContainer = document.createElement("div");
    playlistContainer.classList.add("playlist-selection-container");
    const sortedPlaylists = [...this.playlists].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    sortedPlaylists.forEach((playlist) => {
      const playlistButton = document.createElement("button");
      playlistButton.classList.add("playlist-selection-btn");
      const playlistName = document.createElement("div");
      playlistName.classList.add("playlist-name");
      playlistName.textContent = playlist.name;
      const playlistInfo = document.createElement("div");
      playlistInfo.classList.add("playlist-info");
      playlistInfo.textContent = `${playlist.songs.length} songs`;
      playlistButton.appendChild(playlistName);
      playlistButton.appendChild(playlistInfo);
      playlistButton.onclick = () => {
        this.exportPlaylist(playlist.id);
        modal.remove();
      };
      playlistContainer.appendChild(playlistButton);
    });
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(playlistContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  showPlaylistSelectionForSongsWithPlaylist() {
    if (this.playlists.length === 0) {
      alert("No playlists available. Create a playlist first.");
      return;
    }
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "block";
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement("h2");
    heading.textContent = "Select Playlist to Export with Songs";
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    const sortedPlaylists = [...this.playlists].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    sortedPlaylists.forEach((playlist) => {
      const playlistButton = document.createElement("button");
      playlistButton.className = "playlist-selection-btn";
      playlistButton.style.cssText = `
                display: block;
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
      playlistButton.textContent = `${playlist.name} (${playlist.songs.length} songs)`;
      playlistButton.onclick = () => {
        this.exportSongsWithPlaylist(playlist.id);
        modal.remove();
      };
      modalContent.appendChild(playlistButton);
    });
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  exportSongsWithAllPlaylists() {
    let exportText = "";
    this.songLibrary.forEach((song) => {
      const author = song.author ? `, ${song.author}` : "";
      exportText += `${song.name}, https://www.youtube.com/watch?v=${song.videoId}${author}\n`;
    });
    exportText += "\n";
    this.playlists.forEach((playlist) => {
      exportText += `${playlist.name}{\n`;
      playlist.songs.forEach((playlistSong) => {
        const libraryMatch = this.songLibrary.find(
          (s) => s.videoId === playlistSong.videoId
        );
        const songName = libraryMatch ? libraryMatch.name : playlistSong.name;
        const author = libraryMatch
          ? libraryMatch.author
          : playlistSong.author || "";
        const authorText = author ? `, ${author}` : "";
        exportText += `    ${songName}, https://www.youtube.com/watch?v=${playlistSong.videoId}${authorText}\n`;
      });
      exportText += "}\n";
    });
    this.copyToClipboardWithFallback(
      exportText,
      "Songs and all playlists exported to clipboard successfully!",
      "Export Songs with All Playlists"
    );
  }
  createPlaylistSubmenu(type) {
    const submenu = document.createElement("div");
    submenu.className = "playlist-submenu";
    submenu.style.cssText = `
            position: absolute;
            left: 100%;
            top: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            min-width: 200px;
            z-index: 1001;
            display: none;
        `;
    if (this.playlists.length === 0) {
      const emptyItem = document.createElement("div");
      emptyItem.className = "dropdown-item disabled";
      emptyItem.textContent = "No playlists available";
      emptyItem.style.color = "#999";
      submenu.appendChild(emptyItem);
    } else {
      const sortedPlaylists = [...this.playlists].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      sortedPlaylists.forEach((playlist) => {
        const playlistItem = document.createElement("button");
        playlistItem.className = "dropdown-item";
        playlistItem.textContent = `${playlist.name} (${playlist.songs.length} songs)`;
        playlistItem.onclick = () => {
          this.exportPlaylist(playlist.id);
          this.hideExportDropdown();
        };
        submenu.appendChild(playlistItem);
      });
    }
    return submenu;
  }
  importLibrary(importText) {
    if (!importText.trim()) {
      alert("Please enter songs to import.");
      return;
    }
    const lines = importText.split("\n").filter((line) => line.trim());
    const importedSongs = [];
    const failedImports = [];
    const duplicates = [];
    const existingIds = new Set(this.songLibrary.map((song) => song.id));
    const existingVideoIds = new Set(
      this.songLibrary.map((song) => song.videoId)
    );
    const currentImportVideoIds = new Set();
    const playlists = [];
    let currentPlaylist = null;
    let isPlaylistFormat = false;
    const generateUniqueId = () => {
      let newId;
      do {
        newId = Date.now() + Math.floor(Math.random() * 10000);
      } while (existingIds.has(newId));
      existingIds.add(newId);
      return newId;
    };
    const findExistingSongByVideoId = (videoId) => {
      return this.songLibrary.find((song) => song.videoId === videoId);
    };
    const findImportedSongByVideoId = (videoId) => {
      return importedSongs.find((song) => song.videoId === videoId);
    };
    const extractVideoId = (url) => {
      if (!url) return null;
      const vParam = url.match(/[?&]v=([^&]+)/);
      if (vParam && vParam[1]) {
        return vParam[1];
      }
      if (url.includes("youtu.be/")) {
        const parts = url.split("youtu.be/");
        if (parts.length > 1) {
          return parts[1].split("?")[0].split("&")[0].trim();
        }
      }
      return null;
    };
    for (const line of lines) {
      if (line.includes("{")) {
        isPlaylistFormat = true;
        break;
      }
    }
    if (isPlaylistFormat) {
      const playlistRegex = /^(.+?)\{$/;
      const closeBraceRegex = /^\}$/;
      lines.forEach((line) => {
        const playlistMatch = line.match(playlistRegex);
        if (playlistMatch) {
          const playlistName = playlistMatch[1].trim();
          currentPlaylist = {
            name: playlistName,
            songs: [],
          };
          playlists.push(currentPlaylist);
        } else if (closeBraceRegex.test(line)) {
          currentPlaylist = null;
        } else if (currentPlaylist) {
          try {
            const parsed = this.parseSongLine(line);
            if (!parsed) {
              failedImports.push(`${line} (invalid format)`);
              return;
            }
            const { songName, songUrl, author } = parsed;
            if (
              !songUrl.includes("youtube.com") &&
              !songUrl.includes("youtu.be")
            ) {
              failedImports.push(`${line} (not a YouTube URL)`);
              return;
            }
            const videoId = extractVideoId(songUrl);
            if (!videoId) {
              failedImports.push(`${line} (invalid YouTube URL)`);
              return;
            }
            const existingSong = findExistingSongByVideoId(videoId);
            const importedSong = findImportedSongByVideoId(videoId);
            if (existingSong) {
              duplicates.push(line);
              currentPlaylist.songs.push({
                videoId: videoId,
                name: existingSong.name,
                author: existingSong.author || "",
                entryId: Date.now() + Math.random() * 10000,
              });
            } else if (importedSong) {
              duplicates.push(line);
              currentPlaylist.songs.push({
                videoId: videoId,
                name: importedSong.name,
                author: importedSong.author || "",
                entryId: Date.now() + Math.random() * 10000,
              });
            } else {
              const newSong = {
                id: generateUniqueId(),
                name: songName,
                author: author || "",
                videoId: videoId,
                favorite: false,
                lyrics: "",
                addedOn: new Date().toISOString(),
              };
              importedSongs.push(newSong);
              existingVideoIds.add(videoId);
              currentImportVideoIds.add(videoId);
              currentPlaylist.songs.push({
                videoId: videoId,
                name: songName,
                author: author || "",
                entryId: Date.now() + Math.random() * 10000,
              });
            }
          } catch (error) {
            console.error("Error processing playlist song:", error);
            failedImports.push(`${line} (processing error)`);
          }
        }
      });
    } else {
      lines.forEach((line) => {
        try {
          const parsed = this.parseSongLine(line);
          if (!parsed) {
            failedImports.push(`${line} (invalid format)`);
            return;
          }
          const { songName, songUrl, author } = parsed;
          if (
            !songUrl.includes("youtube.com") &&
            !songUrl.includes("youtu.be")
          ) {
            failedImports.push(`${line} (not a YouTube URL)`);
            return;
          }
          const videoId = extractVideoId(songUrl);
          if (!videoId) {
            failedImports.push(`${line} (invalid YouTube URL)`);
            return;
          }
          if (
            existingVideoIds.has(videoId) ||
            currentImportVideoIds.has(videoId)
          ) {
            duplicates.push(line);
            return;
          }
          const newSong = {
            id: generateUniqueId(),
            name: songName,
            author: author || "",
            videoId: videoId,
            favorite: false,
            lyrics: "",
            addedOn: new Date().toISOString(),
          };
          importedSongs.push(newSong);
          existingVideoIds.add(videoId);
          currentImportVideoIds.add(videoId);
        } catch (error) {
          console.error("Error processing song:", error);
          failedImports.push(`${line} (processing error)`);
        }
      });
    }
    const processPromises = [];
    if (importedSongs.length > 0) {
      processPromises.push(this.addImportedSongsOneByOne(importedSongs));
    }
    if (playlists.length > 0) {
      processPromises.push(this.createImportedPlaylists(playlists));
    }
    Promise.all(processPromises)
      .then(() => {
        this.renderSongLibrary();
        if (typeof this.updatePlaylistSelection === "function") {
          this.updatePlaylistSelection();
        }
        this.renderPlaylists();
        let message = "";
        if (importedSongs.length > 0) {
          message += `Successfully imported ${importedSongs.length} new songs. `;
        }
        if (playlists.length > 0) {
          message += `Created ${playlists.length} playlists. `;
        }
        if (duplicates.length > 0) {
          message += `Skipped ${duplicates.length} duplicate songs. `;
        }
        if (failedImports.length > 0) {
          message += `Failed to import ${failedImports.length} songs.`;
          console.log("Failed imports:", failedImports);
        }
        if (!message) {
          message = "No new content was imported.";
        }
        alert(message);
      })
      .catch((error) => {
        console.error("Error processing imports:", error);
        alert(
          "An error occurred while importing. Please check the console for details."
        );
      });
  }
  createPlaylistSubmenu(type) {
    const submenu = document.createElement("div");
    submenu.className = "export-submenu";
    submenu.style.display = "none";
    if (this.playlists.length === 0) {
      const noPlaylistsItem = document.createElement("div");
      noPlaylistsItem.className = "dropdown-item disabled";
      noPlaylistsItem.textContent = "No playlists available";
      submenu.appendChild(noPlaylistsItem);
    } else {
      const sortedPlaylists = [...this.playlists].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      sortedPlaylists.forEach((playlist) => {
        const playlistItem = document.createElement("button");
        playlistItem.className = "dropdown-item";
        playlistItem.textContent = `${playlist.name} (${playlist.songs.length} songs)`;
        playlistItem.onclick = () => {
          if (type === "songs-with-playlist") {
            this.exportSongsWithPlaylist(playlist.id);
          } else {
            this.exportPlaylist(playlist.id);
          }
          this.hideExportDropdown();
        };
        submenu.appendChild(playlistItem);
      });
    }
    return submenu;
  }
  showSubmenu(submenu, parentButton) {
    submenu.style.display = "block";
  }
  hideSubmenu(submenu) {
    submenu.style.display = "none";
  }
  hideExportDropdown() {
    const existingDropdown = document.getElementById("exportDropdown");
    if (existingDropdown) {
      existingDropdown.remove();
    }
  }
  showSubmenu(submenu, triggerElement) {
    const rect = triggerElement.getBoundingClientRect();
    submenu.style.display = "block";
    submenu.style.position = "absolute";
    submenu.style.top = "0px";
    submenu.style.left = "100%";
    submenu.style.opacity = "1";
    submenu.style.transform = "translateX(0)";
  }
  hideSubmenu(submenu) {
    submenu.style.display = "none";
    submenu.style.opacity = "0";
    submenu.style.transform = "translateX(-10px)";
  }
  hideExportDropdown() {
    const existingDropdown = document.getElementById("exportDropdown");
    if (existingDropdown) {
      existingDropdown.remove();
    }
  }
  setupExportButtonListeners() {
    const exportButton = document.getElementById("exportLibraryBtn");
    if (exportButton) {
      let hoverTimeout;
      exportButton.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          this.showExportDropdown(exportButton);
        }, 200);
      });
      exportButton.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
        setTimeout(() => {
          const dropdown = document.getElementById("exportDropdown");
          if (
            dropdown &&
            !dropdown.matches(":hover") &&
            !exportButton.matches(":hover")
          ) {
            this.hideExportDropdown();
          }
        }, 100);
      });
      document.addEventListener("click", (e) => {
        if (
          !exportButton.contains(e.target) &&
          !document.getElementById("exportDropdown")?.contains(e.target)
        ) {
          this.hideExportDropdown();
        }
      });
    }
  }
  parseSongLine(line) {
    line = line.trim();
    if (!line) return null;
    const parts = line.split(",");
    if (parts.length < 2) {
      return null;
    }
    let songName = "";
    let songUrl = "";
    let author = "";
    const cleanParts = parts.map((part) => part.trim());
    if (cleanParts.length === 2) {
      songName = cleanParts[0];
      songUrl = cleanParts[1];
    } else if (cleanParts.length === 3) {
      songName = cleanParts[0];
      songUrl = cleanParts[1];
      author = cleanParts[2];
    } else {
      let urlIndex = -1;
      for (let i = 0; i < cleanParts.length; i++) {
        if (
          cleanParts[i].includes("youtube.com") ||
          cleanParts[i].includes("youtu.be")
        ) {
          urlIndex = i;
          break;
        }
      }
      if (urlIndex === -1) {
        urlIndex = cleanParts.length - 1;
      }
      songUrl = cleanParts[urlIndex];
      if (urlIndex < cleanParts.length - 1) {
        author = cleanParts[urlIndex + 1];
        songName = cleanParts.slice(0, urlIndex).join(",").trim();
      } else {
        songName = cleanParts.slice(0, urlIndex).join(",").trim();
      }
    }
    if (!songName || !songUrl) {
      return null;
    }
    return { songName, songUrl, author };
  }
  createImportedPlaylists(playlists) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }
      playlists.forEach((playlist) => {
        const existingPlaylist = this.playlists.find(
          (p) => p.name.toLowerCase() === playlist.name.toLowerCase()
        );
        if (existingPlaylist) {
          playlist.songs.forEach((newSong) => {
            const isDuplicate = existingPlaylist.songs.some(
              (existingSong) => existingSong.videoId === newSong.videoId
            );
            if (!isDuplicate) {
              existingPlaylist.songs.push(newSong);
            }
          });
        } else {
          const newPlaylist = {
            id: Date.now() + Math.floor(Math.random() * 10000),
            name: playlist.name,
            songs: playlist.songs,
            position: this.playlists.length,
          };
          this.playlists.push(newPlaylist);
        }
      });
      this.savePlaylists()
        .then(() => resolve())
        .catch((error) => {
          console.error("Error saving imported playlists:", error);
          reject(error);
        });
    });
  }
  addImportedSongsOneByOne(importedSongs) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }
      this.songLibrary = [...this.songLibrary, ...importedSongs];
      const transaction = this.db.transaction(["songLibrary"], "readwrite");
      const store = transaction.objectStore("songLibrary");
      let successCount = 0;
      importedSongs.forEach((song) => {
        try {
          const getRequest = store.get(song.id);
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              song.id =
                Date.now() + Math.floor(Math.random() * 10000) + successCount;
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
        console.error("Transaction error:", event.target.error);
        resolve();
      };
    });
  }
  showImportModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "block";
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement("h2");
    heading.textContent = "Import Songs";
    const selectContainer = document.createElement("div");
    selectContainer.classList.add("select-container");
    const selectLabel = document.createElement("label");
    selectLabel.textContent = "Select playlist: ";
    selectLabel.htmlFor = "preloadedLists";
    const preloadedSelect = document.createElement("select");
    preloadedSelect.id = "preloadedLists";
    preloadedSelect.classList.add("playlist-select");
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = "Custom";
    preloadedSelect.appendChild(customOption);
    selectContainer.appendChild(selectLabel);
    selectContainer.appendChild(preloadedSelect);
    const instructions = document.createElement("div");
    instructions.innerHTML = `
            <h3>Import Format Options:</h3>
            <p><strong>Simple format (one song per line):</strong></p>
            <ul>
                <li>Song Name, YouTube URL</li>
                <li>Song Name, YouTube URL, Author Name</li>
            </ul>
            <p><strong>Playlist format:</strong></p>
            <pre>Playlist Name{
        Song Name, YouTube URL
        Another Song, YouTube URL, Author Name
    }
    Another Playlist{
        Song Name, YouTube URL
    }</pre>
            <p><strong>Notes:</strong></p>
            <ul>
                <li>Author/Artist name is optional</li>
                <li>Duplicate songs (same YouTube video) are automatically skipped</li>
                <li>Songs with commas in the title are supported</li>
            </ul>
        `;
    instructions.style.fontSize = "14px";
    instructions.style.marginBottom = "15px";
    const textarea = document.createElement("textarea");
    textarea.id = "importSongsTextarea";
    textarea.placeholder = `Example formats:
    Song Name, https:
    Another Song, https:
    Song, with, commas, https:
    Or playlist format:
    My Playlist{
        Song Name, https:
        Another Song, https:
    }`;
    textarea.style.width = "100%";
    textarea.style.height = "200px";
    textarea.style.fontFamily = "monospace";
    const importBtn = document.createElement("button");
    importBtn.textContent = "Import Songs";
    importBtn.classList.add("import-btn");
    importBtn.onclick = () => {
      this.importLibrary(textarea.value);
      modal.remove();
    };
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(selectContainer);
    modalContent.appendChild(instructions);
    modalContent.appendChild(textarea);
    modalContent.appendChild(importBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    if (typeof this.loadFileList === "function") {
      this.loadFileList(preloadedSelect, textarea);
    }
  }
  handleDragStart(e) {
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.setData("text/plain", e.currentTarget.dataset.index);
    e.dataTransfer.effectAllowed = "move";
  }
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const draggingElement = document.querySelector(".dragging");
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
    const playlistId = parseInt(
      this.elements.currentPlaylistName.dataset.playlistId
    );
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const items = Array.from(
      this.elements.currentPlaylistSongs.querySelectorAll(".playlist-song-item")
    );
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
        .catch((error) => {
          console.error("Error reordering playlist:", error);
          alert("Failed to reorder playlist. Please try again.");
        });
    }
  }
  handleDragEnd(e) {
    e.currentTarget.classList.remove("dragging");
  }
  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".playlist-song-item:not(.dragging)"),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
  toggleFavorite(songId) {
    const songIndex = this.songLibrary.findIndex((song) => song.id === songId);
    if (songIndex === -1) return;
    const song = this.songLibrary[songIndex];
    const newFavoriteStatus = !song.favorite;
    song.favorite = newFavoriteStatus;
    const favoriteBtn = document.querySelector(
      `.favorite-btn[data-song-id="${songId}"]`
    );
    if (favoriteBtn) {
      const icon = favoriteBtn.querySelector("i");
      icon.className = `fa ${newFavoriteStatus ? "fa-star" : "fa-star-o"}`;
    }
    this.batchFavoriteUpdate(song, newFavoriteStatus);
  }
  syncFavoritesOnLoad() {
    return new Promise((resolve) => {
      try {
        const favoriteSongs = this.songLibrary.filter((song) => song.favorite);
        if (favoriteSongs.length === 0) {
          resolve();
          return;
        }
        let favoritesPlaylist = this.getFavoritesPlaylist();
        if (!favoritesPlaylist) {
          favoritesPlaylist = this.createFavoritesPlaylist();
        }
        const currentFavorites = favoriteSongs.map((song) => ({
          name: song.name,
          videoId: song.videoId,
          entryId: Date.now() + Math.random(),
        }));
        const needsUpdate =
          favoritesPlaylist.songs.length !== currentFavorites.length ||
          !currentFavorites.every((fav) =>
            favoritesPlaylist.songs.some(
              (existing) => existing.videoId === fav.videoId
            )
          );
        if (needsUpdate) {
          favoritesPlaylist.songs = currentFavorites;
          this.savePlaylists().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      } catch (error) {
        console.error("Error in syncFavoritesOnLoad:", error);
        resolve();
      }
    });
  }
  batchFavoriteUpdate(song, isFavorited) {
    clearTimeout(this.favoriteUpdateTimeout);
    this.favoriteUpdateTimeout = setTimeout(() => {
      Promise.all([
        this.saveSongLibrary(),
        this.updateFavoritesPlaylist(song, isFavorited),
      ])
        .then(() => {
          if (this.shouldReorderLibrary()) {
            this.renderSongLibrary();
          }
        })
        .catch((error) => {
          console.error("Error updating favorite:", error);
          song.favorite = !isFavorited;
          const favoriteBtn = document.querySelector(
            `.favorite-btn[data-song-id="${song.id}"]`
          );
          if (favoriteBtn) {
            const icon = favoriteBtn.querySelector("i");
            icon.className = `fa ${song.favorite ? "fa-star" : "fa-star-o"}`;
          }
        });
    }, 300);
  }
  shouldReorderLibrary() {
    const currentOrder = Array.from(this.elements.songLibrary.children);
    if (currentOrder.length <= 1) return false;
    const sortedLibrary = [...this.songLibrary].sort((a, b) => {
      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    for (let i = 0; i < Math.min(3, sortedLibrary.length); i++) {
      const expectedId = sortedLibrary[i].id.toString();
      const actualElement = currentOrder[i];
      const actualId =
        actualElement?.querySelector(".song-name")?.dataset.songId;
      if (expectedId !== actualId) {
        return true;
      }
    }
    return false;
  }
  updateFavoritesPlaylist(song, isFavorited) {
    return new Promise((resolve) => {
      let favoritesPlaylist = this.getFavoritesPlaylist();
      if (!favoritesPlaylist && isFavorited) {
        favoritesPlaylist = this.createFavoritesPlaylist();
      }
      if (!favoritesPlaylist) {
        resolve();
        return;
      }
      const songExists = favoritesPlaylist.songs.some(
        (s) => s.videoId === song.videoId
      );
      let playlistChanged = false;
      if (isFavorited && !songExists) {
        favoritesPlaylist.songs.push({
          name: song.name,
          videoId: song.videoId,
          entryId: Date.now() + Math.random(),
        });
        playlistChanged = true;
      } else if (!isFavorited && songExists) {
        const originalLength = favoritesPlaylist.songs.length;
        favoritesPlaylist.songs = favoritesPlaylist.songs.filter(
          (s) => s.videoId !== song.videoId
        );
        playlistChanged = originalLength !== favoritesPlaylist.songs.length;
      }
      if (playlistChanged) {
        this.savePlaylists()
          .then(() => {
            if (
              this.currentPlaylist &&
              this.currentPlaylist.id === favoritesPlaylist.id
            ) {
              this.renderPlaylistSidebar();
            }
            resolve();
          })
          .catch(resolve);
      } else {
        resolve();
      }
    });
  }
  getFavoritesPlaylist() {
    return this.playlists.find((p) =>
      ["favorites", "favourite", "favourite songs", "favorite songs"].includes(
        p.name.toLowerCase()
      )
    );
  }
  createFavoritesPlaylist() {
    const favoritesPlaylist = {
      id: Date.now(),
      name: "Favorites",
      songs: [],
    };
    this.playlists.push(favoritesPlaylist);
    return favoritesPlaylist;
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
    this.removeYouTubeThumbnailPreview();
    const previewContainer = document.createElement("div");
    previewContainer.id = "thumbnailPreview";
    previewContainer.classList.add("thumbnail-preview");
    const thumbnail = document.createElement("img");
    thumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    thumbnail.alt = "Video thumbnail";
    const videoTitle = document.createElement("div");
    videoTitle.classList.add("video-title");
    videoTitle.textContent = "Loading video title...";
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;";
    closeButton.classList.add("thumbnail-close-btn");
    closeButton.onclick = this.removeYouTubeThumbnailPreview.bind(this);
    previewContainer.appendChild(thumbnail);
    previewContainer.appendChild(videoTitle);
    previewContainer.appendChild(closeButton);
    document.querySelector(".add-song-section").appendChild(previewContainer);
    this.fetchYouTubeTitle(videoId)
        .then((title) => {
            if (title) {
                videoTitle.textContent = title;
            }
        })
        .catch((error) => {
            console.warn("Could not fetch YouTube title:", error);
            videoTitle.textContent = "Could not load video title";
        });
}
removeYouTubeThumbnailPreview() {
    const existingPreview = document.getElementById("thumbnailPreview");
    if (existingPreview) {
        existingPreview.remove();
    }
}
  checkVideoRestrictions(videoId) {
    const tempPlayer = document.createElement("div");
    tempPlayer.id = "tempYTPlayer";
    tempPlayer.style.display = "none";
    document.body.appendChild(tempPlayer);
    const player = new YT.Player("tempYTPlayer", {
      videoId: videoId,
      events: {
        onError: (event) => {
          if (event.data === 101 || event.data === 150) {
            alert(
              "This video cannot be played outside YouTube due to restrictions set by the content owner."
            );
          }
          player.destroy();
          document.getElementById("tempYTPlayer")?.remove();
        },
        onReady: () => {
          setTimeout(() => {
            player.destroy();
            document.getElementById("tempYTPlayer")?.remove();
          }, 1000);
        },
      },
    });
  }
parseVideoTitle(title) {
    if (!title) return { author: "", songName: "" };
    let cleanTitle = title.trim();
    const removePatterns = [
        /\(official\s+video\)/gi,
        /\(official\s+audio\)/gi,
        /\(official\)/gi,
        /\(music\s+video\)/gi,
        /\(lyric\s+video\)/gi,
        /\(lyrics\)/gi,
        /\[official\s+video\]/gi,
        /\[official\s+audio\]/gi,
        /\[official\]/gi,
        /\[music\s+video\]/gi,
        /\[lyric\s+video\]/gi,
        /\[lyrics\]/gi,
        /official\s+video/gi,
        /official\s+audio/gi,
        /music\s+video/gi,
        /lyric\s+video/gi,
        /\(hd\)/gi,
        /\[hd\]/gi,
        /\(4k\)/gi,
        /\[4k\]/gi,
        /\(remastered\)/gi,
        /\[remastered\]/gi
    ];
    removePatterns.forEach(pattern => {
        cleanTitle = cleanTitle.replace(pattern, "");
    });
    cleanTitle = cleanTitle.replace(/\s+/g, " ").trim();
    const hyphenIndex = cleanTitle.indexOf(" - ");
    if (hyphenIndex !== -1) {
        const author = cleanTitle.substring(0, hyphenIndex).trim();
        const songName = cleanTitle.substring(hyphenIndex + 3).trim();
        return { author, songName };
    }
    const byIndex = cleanTitle.toLowerCase().indexOf(" by ");
    if (byIndex !== -1) {
        const songName = cleanTitle.substring(0, byIndex).trim();
        const author = cleanTitle.substring(byIndex + 4).trim();
        return { author, songName };
    }
    return { author: "", songName: cleanTitle };
}
handleAutofill() {
    const songUrl = this.elements.songUrlInput.value.trim();
    if (!songUrl) return;
    const videoId = this.extractYouTubeId(songUrl);
    if (!videoId) return;
    this.fetchYouTubeTitle(videoId)
        .then((title) => {
            if (title) {
                const { author, songName } = this.parseVideoTitle(title);
                this.elements.songNameInput.value = songName;
                this.elements.songAuthorInput.value = author;
            }
        })
        .catch((error) => {
            console.error("Error fetching video title for autofill:", error);
            alert("Could not fetch video information for autofill");
        });
}
showGhostPreview(event) {
    const songUrl = this.elements.songUrlInput.value.trim();
    if (!songUrl) return;
    const videoId = this.extractYouTubeId(songUrl);
    if (!videoId) return;
    this.fetchYouTubeTitle(videoId)
        .then((title) => {
            if (title) {
                const { author, songName } = this.parseVideoTitle(title);
                this.createGhostPreview(songName, author, event);
            }
        })
        .catch((error) => {
            console.warn("Could not fetch title for ghost preview:", error);
        });
}
createGhostPreview(songName, author, event) {
    this.removeGhostPreview();
    const nameInput = this.elements.songNameInput;
    const authorInput = this.elements.songAuthorInput;
    if (songName && songName !== nameInput.value) {
        const nameRect = nameInput.getBoundingClientRect();
        const nameGhost = document.createElement("div");
        nameGhost.classList.add("ghost-preview");
        nameGhost.textContent = songName;
        nameGhost.style.left = nameRect.left + "px";
        nameGhost.style.top = nameRect.top + "px";
        nameGhost.style.width = nameRect.width + "px";
        nameGhost.style.height = nameRect.height + "px";
        nameGhost.id = "nameGhost";
        document.body.appendChild(nameGhost);
    }
    if (author && author !== authorInput.value) {
        const authorRect = authorInput.getBoundingClientRect();
        const authorGhost = document.createElement("div");
        authorGhost.classList.add("ghost-preview");
        authorGhost.textContent = author;
        authorGhost.style.left = authorRect.left + "px";
        authorGhost.style.top = authorRect.top + "px";
        authorGhost.style.width = authorRect.width + "px";
        authorGhost.style.height = authorRect.height + "px";
        authorGhost.id = "authorGhost";
        document.body.appendChild(authorGhost);
    }
}
removeGhostPreview() {
    const nameGhost = document.getElementById("nameGhost");
    const authorGhost = document.getElementById("authorGhost");
    if (nameGhost) nameGhost.remove();
    if (authorGhost) authorGhost.remove();
}
  openSongEditModal(songId) {
    const song = this.songLibrary.find((s) => s.id === songId);
    if (!song) return;
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "flex";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.7)";
    modal.style.zIndex = "1000";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    modalContent.style.backgroundColor = "var(--bg-secondary)";
    modalContent.style.color = "var(--text-primary)";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "5px";
    modalContent.style.width = "80%";
    modalContent.style.maxWidth = "500px";
    modalContent.style.maxHeight = "80vh";
    modalContent.style.overflowY = "auto";
    modalContent.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
    modalContent.style.position = "relative";
    const headerContainer = document.createElement("div");
    headerContainer.style.position = "sticky";
    headerContainer.style.top = "0";
    headerContainer.style.backgroundColor = "var(--bg-secondary)";
    headerContainer.style.paddingBottom = "10px";
    headerContainer.style.marginBottom = "10px";
    headerContainer.style.borderBottom = "1px solid var(--border-color)";
    headerContainer.style.display = "flex";
    headerContainer.style.justifyContent = "space-between";
    headerContainer.style.alignItems = "center";
    const header = document.createElement("h3");
    header.textContent = "Edit Song Details";
    header.style.margin = "0";
    header.style.color = "var(--text-primary)";
    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.fontSize = "24px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.color = "var(--text-primary)";
    closeBtn.style.lineHeight = "24px";
    closeBtn.onclick = () => modal.remove();
    headerContainer.appendChild(header);
    headerContainer.appendChild(closeBtn);
    const form = document.createElement("form");
    form.style.display = "grid";
    form.style.gap = "10px";
    const formGrid = document.createElement("div");
    formGrid.style.display = "grid";
    formGrid.style.gridTemplateColumns = "1fr 2fr";
    formGrid.style.gap = "10px";
    formGrid.style.alignItems = "center";
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Song Name:";
    nameLabel.style.color = "var(--text-primary)";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = song.name;
    const authorLabel = document.createElement("label");
    authorLabel.textContent = "Author:";
    authorLabel.style.color = "var(--text-primary)";
    const authorInput = document.createElement("input");
    authorInput.type = "text";
    authorInput.value = song.author || "";
    authorInput.style.padding = "8px";
    authorInput.style.borderRadius = "4px";
    authorInput.style.border = "1px solid var(--border-color)";
    authorInput.style.backgroundColor = "var(--bg-primary)";
    authorInput.style.color = "var(--text-primary)";
    authorInput.style.width = "140%";
    authorInput.placeholder = "Author name (optional)";
    nameInput.style.padding = "8px";
    nameInput.style.borderRadius = "4px";
    nameInput.style.border = "1px solid var(--border-color)";
    nameInput.style.backgroundColor = "var(--bg-primary)";
    nameInput.style.color = "var(--text-primary)";
    nameInput.style.width = "140%";
    nameInput.required = true;
    const urlLabel = document.createElement("label");
    urlLabel.textContent = "YouTube URL:";
    urlLabel.style.color = "var(--text-primary)";
    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.value = `https://www.youtube.com/watch?v=${song.videoId}`;
    urlInput.style.padding = "8px";
    urlInput.style.borderRadius = "4px";
    urlInput.style.border = "1px solid var(--border-color)";
    urlInput.style.backgroundColor = "var(--bg-primary)";
    urlInput.style.color = "var(--text-primary)";
    urlInput.style.width = "140%";
    urlInput.required = true;
    formGrid.appendChild(nameLabel);
    formGrid.appendChild(nameInput);
    formGrid.appendChild(authorLabel);
    formGrid.appendChild(authorInput);
    formGrid.appendChild(urlLabel);
    formGrid.appendChild(urlInput);
    const thumbnailContainer = document.createElement("div");
    thumbnailContainer.style.marginTop = "10px";
    thumbnailContainer.style.textAlign = "center";
    thumbnailContainer.style.gridColumn = "span 2";
    const thumbnail = document.createElement("img");
    thumbnail.src = `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`;
    thumbnail.alt = "Video thumbnail";
    thumbnail.style.maxWidth = "200px";
    thumbnail.style.height = "auto";
    thumbnail.style.borderRadius = "4px";
    thumbnailContainer.appendChild(thumbnail);
    urlInput.addEventListener("input", () => {
      const videoId = this.extractYouTubeId(urlInput.value);
      if (videoId) {
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        thumbnail.style.display = "block";
      } else {
        thumbnail.style.display = "none";
      }
    });
    const lyricsContainer = document.createElement("div");
    lyricsContainer.style.gridColumn = "span 2";
    lyricsContainer.style.marginTop = "10px";
    const lyricsLabel = document.createElement("label");
    lyricsLabel.textContent =
      'Lyrics (Format: "Lyric line [MM:SS]" - one per line):';
    lyricsLabel.style.color = "var(--text-primary)";
    lyricsLabel.style.display = "block";
    lyricsLabel.style.marginBottom = "5px";
    const lyricsInput = document.createElement("textarea");
    lyricsInput.style.padding = "8px";
    lyricsInput.style.borderRadius = "4px";
    lyricsInput.style.border = "1px solid var(--border-color)";
    lyricsInput.style.backgroundColor = "var(--bg-primary)";
    lyricsInput.style.color = "var(--text-primary)";
    lyricsInput.style.width = "100%";
    lyricsInput.style.height = "100px";
    lyricsInput.placeholder =
      "Enter lyrics with timestamps like:\nThis is the end [0:33]\nHold your breath and count to ten [0:38]";
    lyricsInput.value = song.lyrics || "";
    lyricsContainer.appendChild(lyricsLabel);
    lyricsContainer.appendChild(lyricsInput);
    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.textContent = "Save Changes";
    saveBtn.style.padding = "10px";
    saveBtn.style.backgroundColor = "var(--accent-color)";
    saveBtn.style.color = "white";
    saveBtn.style.border = "none";
    saveBtn.style.borderRadius = "4px";
    saveBtn.style.cursor = "pointer";
    saveBtn.style.marginTop = "15px";
    saveBtn.style.transition = "background-color 0.3s";
    saveBtn.style.width = "100%";
    saveBtn.style.gridColumn = "span 2";
    saveBtn.addEventListener("mouseover", () => {
      saveBtn.style.backgroundColor = "var(--hover-color)";
    });
    saveBtn.addEventListener("mouseout", () => {
      saveBtn.style.backgroundColor = "var(--accent-color)";
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newName = nameInput.value.trim();
      const newAuthor = authorInput.value.trim();
      const newUrl = urlInput.value.trim();
      const newVideoId = this.extractYouTubeId(newUrl);
      const newLyrics = lyricsInput.value.trim();
      if (!newName) {
        alert("Please enter a song name");
        return;
      }
      if (!newVideoId) {
        alert("Please enter a valid YouTube URL");
        return;
      }
      this.updateSongDetails(song.id, newName, newAuthor, newVideoId, newLyrics)
        .then(() => {
          modal.remove();
          this.renderSongLibrary();
        })
        .catch((error) => {
          console.error("Error updating song details:", error);
          alert("Failed to update song details. Please try again.");
        });
    });
    form.appendChild(formGrid);
    form.appendChild(thumbnailContainer);
    form.appendChild(lyricsContainer);
    form.appendChild(saveBtn);
    modalContent.appendChild(headerContainer);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modalContent.scrollTop = 0;
  }
  updateSongDetails(songId, newName, newAuthor, newVideoId, newLyrics = "") {
    return new Promise((resolve, reject) => {
      try {
        const songIndex = this.songLibrary.findIndex(
          (song) => song.id === songId
        );
        if (songIndex === -1) {
          reject(new Error("Song not found"));
          return;
        }
        const oldVideoId = this.songLibrary[songIndex].videoId;
        const wasFavorite = this.songLibrary[songIndex].favorite;
        this.songLibrary[songIndex].name = newName;
        this.songLibrary[songIndex].author = newAuthor;
        this.songLibrary[songIndex].videoId = newVideoId;
        this.songLibrary[songIndex].lyrics = newLyrics;
        this.playlists.forEach((playlist) => {
          const playlistSongIndex = playlist.songs.findIndex(
            (s) => s.id === songId
          );
          if (playlistSongIndex !== -1) {
            playlist.songs[playlistSongIndex].name = newName;
            playlist.songs[playlistSongIndex].author = newAuthor;
            playlist.songs[playlistSongIndex].videoId = newVideoId;
            playlist.songs[playlistSongIndex].lyrics = newLyrics;
          }
        });
        this.saveSongLibrary()
          .then(() => this.savePlaylists())
          .then(() => {
            if (
              this.currentPlaylist &&
              this.currentPlaylist.songs[this.currentSongIndex]?.id === songId
            ) {
              if (this.elements.currentSongName) {
                this.elements.currentSongName.textContent = newName;
              }
              if (
                document.getElementById("lyrics").classList.contains("active")
              ) {
                this.renderLyricsTab();
              }
            }
            if (this.isSidebarVisible && this.currentPlaylist) {
              this.renderCurrentPlaylistInSidebar();
            }
            resolve();
          })
          .catch((error) => {
            console.error("Error saving updated song details:", error);
            reject(error);
          });
      } catch (error) {
        console.error("Exception in updateSongDetails:", error);
        reject(error);
      }
    });
  }
  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  openLibraryModal() {
    this.elements.libraryModificationModal.style.display = "flex";
  }
  closeLibraryModal() {
    this.elements.libraryModificationModal.style.display = "none";
  }
  loadFileList(selectElement, textareaElement) {
    fetch("filelist.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load file list");
        }
        return response.text();
      })
      .then((fileList) => {
        const files = fileList.split("\n").filter((file) => file.trim() !== "");
        files.forEach((file) => {
          const option = document.createElement("option");
          option.value = file.trim();
          option.textContent = file.trim();
          selectElement.appendChild(option);
        });
        selectElement.addEventListener("change", () => {
          const selectedValue = selectElement.value;
          if (selectedValue === "custom") {
            textareaElement.value = "";
          } else {
            this.loadSongFile(selectedValue, textareaElement);
          }
        });
      })
      .catch((error) => {
        console.error("Error loading file list:", error);
        const errorMessage = document.createElement("p");
        errorMessage.textContent =
          "Could not load predefined song lists. You can still paste your songs manually.";
        errorMessage.style.color = "red";
        selectElement.parentNode.appendChild(errorMessage);
      });
  }
  loadSongFile(fileName, textareaElement) {
    textareaElement.value = "Loading...";
    fetch(`${fileName}.txt`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${fileName}.txt`);
        }
        return response.text();
      })
      .then((content) => {
        textareaElement.value = content;
      })
      .catch((error) => {
        console.error(`Error loading song file ${fileName}:`, error);
        textareaElement.value = "";
        alert(`Could not load the song list: ${fileName}`);
      });
  }
  adjustVolume(change) {
    if (!this.ytPlayer || !this.elements.volumeSlider) return;
    const currentVolume = parseFloat(this.elements.volumeSlider.value);
    let newVolume = Math.min(100, Math.max(0, currentVolume + change * 100));
    this.elements.volumeSlider.value = newVolume;
    this.setVolume(newVolume);
    this.showVolumeIndicator(newVolume);
  }
  showVolumeIndicator(volumeLevel) {
    let volumeIndicator = document.getElementById("volumeIndicator");
    if (!volumeIndicator) {
      volumeIndicator = document.createElement("div");
      volumeIndicator.id = "volumeIndicator";
      volumeIndicator.style.position = "fixed";
      volumeIndicator.style.bottom = "20px";
      volumeIndicator.style.left = "50%";
      volumeIndicator.style.transform = "translateX(-50%)";
      volumeIndicator.style.background = "rgba(0, 0, 0, 0.7)";
      volumeIndicator.style.color = "white";
      volumeIndicator.style.padding = "10px 20px";
      volumeIndicator.style.borderRadius = "5px";
      volumeIndicator.style.zIndex = "1000";
      volumeIndicator.style.opacity = "0";
      volumeIndicator.style.transition = "opacity 0.3s";
      document.body.appendChild(volumeIndicator);
    }
    volumeIndicator.textContent = `Volume: ${Math.round(volumeLevel)}%`;
    volumeIndicator.style.opacity = "1";
    clearTimeout(this.volumeIndicatorTimeout);
    this.volumeIndicatorTimeout = setTimeout(() => {
      volumeIndicator.style.opacity = "0";
    }, 1500);
  }
  toggleControlBar() {
    const controlBarContainer = document
      .querySelector(".player-controls")
      .closest(".player-container");
    const targetElement =
      controlBarContainer ||
      document.querySelector(".player-controls").parentElement;
    const layoutToggleBtn = document.querySelector(".layout-toggle-button");
    const isVisible = targetElement.style.visibility !== "hidden";
    const leftBanner = document.querySelector('.left-banner');
    const rightBanner = document.querySelector('.right-banner');
    if (isVisible) {
      targetElement.style.visibility = "hidden";
      targetElement.style.position = "absolute";
      targetElement.style.pointerEvents = "none";
      localStorage.setItem("controlBarVisible", "false");
      if (leftBanner) leftBanner.classList.add('expanded');
      if (rightBanner) rightBanner.classList.add('expanded');
      if (layoutToggleBtn && !targetElement.contains(layoutToggleBtn)) {
        layoutToggleBtn.style.visibility = "visible";
        layoutToggleBtn.style.position = "";
        layoutToggleBtn.style.pointerEvents = "auto";
      }
    } else {
      targetElement.style.visibility = "visible";
      targetElement.style.position = "";
      targetElement.style.pointerEvents = "auto";
      localStorage.setItem("controlBarVisible", "true");
      if (leftBanner) leftBanner.classList.remove('expanded');
      if (rightBanner) rightBanner.classList.remove('expanded');
    }
}
  togglePlaylistLoop() {
    this.isPlaylistLooping = !this.isPlaylistLooping;
    this.updatePlaylistLoopButton();
    localStorage.setItem("isPlaylistLooping", this.isPlaylistLooping);
  }
  updatePlaylistLoopButton() {
    if (this.elements.loopPlaylistBtn) {
      if (this.isPlaylistLooping) {
        this.elements.loopPlaylistBtn.classList.add("active");
      } else {
        this.elements.loopPlaylistBtn.classList.remove("active");
      }
    }
  }
  getPlaylistDurationText() {
    if (!this.currentPlaylist || !this.currentPlaylist.songs.length) {
      return "0 songs";
    }
    return `${this.currentPlaylist.songs.length} songs`;
  }
  temporarilySkipSong(entryId) {
    if (this.temporarilySkippedSongs.has(entryId)) {
      this.temporarilySkippedSongs.delete(entryId);
    } else {
      this.temporarilySkippedSongs.add(entryId);
    }
    this.renderPlaylistSidebar();
    if (this.currentPlaylist && this.isPlaying) {
      const currentSongEntryId =
        this.currentPlaylist.songs[this.currentSongIndex].entryId ||
        "id_" + this.currentPlaylist.songs[this.currentSongIndex].videoId;
      if (entryId === currentSongEntryId) {
        this.playNextNonSkippedSong();
      } else {
        this.updatePlayerUI();
      }
    } else {
      this.updatePlayerUI();
    }
  }
  playNextNonSkippedSong() {
    if (!this.currentPlaylist || !this.currentPlaylist.songs.length) return;
    const totalSongs = this.currentPlaylist.songs.length;
    let nextIndex = (this.currentSongIndex + 1) % totalSongs;
    const startIndex = nextIndex;
    while (
      this.isSongTemporarilySkipped(this.currentPlaylist.songs[nextIndex])
    ) {
      nextIndex = (nextIndex + 1) % totalSongs;
      if (nextIndex === startIndex) {
        return;
      }
      if (nextIndex === 0 && !this.isPlaylistLooping) {
        this.ytPlayer.stopVideo();
        this.isPlaying = false;
        this.updatePlayerUI();
        return;
      }
    }
    this.currentSongIndex = nextIndex;
    this.playSongById(this.currentPlaylist.songs[nextIndex].videoId);
  }
  isSongTemporarilySkipped(song) {
    const entryId = song.entryId || "id_" + song.videoId;
    return this.temporarilySkippedSongs.has(entryId);
  }
  updatePageTitle() {
    const defaultTitle = "Music";
    if (
      !this.isPlaying ||
      !this.elements.currentSongName.textContent ||
      this.elements.currentSongName.textContent === "No Song Playing"
    ) {
      document.title = defaultTitle;
      return;
    }
    const songName = this.elements.currentSongName.textContent;
    document.title = `Music - ${songName}`;
    if (songName.length > 30) {
      let currentPosition = 0;
      const fullTitle = `Music - ${songName} • `;
      if (this.titleScrollInterval) {
        clearInterval(this.titleScrollInterval);
      }
      this.titleScrollInterval = setInterval(() => {
        currentPosition = (currentPosition + 1) % fullTitle.length;
        const scrolledTitle =
          fullTitle.substring(currentPosition) +
          fullTitle.substring(0, currentPosition);
        document.title = scrolledTitle;
      }, 500);
    } else if (this.titleScrollInterval) {
      clearInterval(this.titleScrollInterval);
    }
  }
  changeFavicon(iconURL) {
    try {
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.parentNode.removeChild(existingFavicon);
      }
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      newFavicon.type = "image/png";
      newFavicon.href = iconURL;
      document.head.appendChild(newFavicon);
    } catch (e) {
      console.error("Error changing favicon:", e);
    }
  }
  startTitleMonitor(priorityTitle) {
    if (this.titleObserver) {
      this.titleObserver.disconnect();
    }
    const config = { childList: true, subtree: true };
    this.titleObserver = new MutationObserver((mutationsList) => {
      if (this.priorityModeActive && document.title !== priorityTitle) {
        document.title = priorityTitle;
      }
    });
    this.titleObserver.observe(document.querySelector("head"), config);
    document.title = priorityTitle;
  }
  stopTitleMonitor() {
    if (this.titleObserver) {
      this.titleObserver.disconnect();
      this.titleObserver = null;
    }
  }
  cycleFaviconAndTitle() {
    this.currentDisguiseIndex =
      (this.currentDisguiseIndex + 1) % (this.pageDisguises.length + 1);
    if (this.currentDisguiseIndex === this.pageDisguises.length) {
      this.changeFavicon(this.originalFavicon);
      document.title = this.originalTitle;
      this.priorityModeActive = false;
      this.stopTitleMonitor();
    } else {
      const currentDisguise = this.pageDisguises[this.currentDisguiseIndex];
      this.changeFavicon(currentDisguise.favicon);
      document.title = currentDisguise.title;
      this.priorityModeActive = currentDisguise.isPriority;
      if (this.priorityModeActive) {
        this.startTitleMonitor(currentDisguise.title);
      } else {
        this.stopTitleMonitor();
      }
    }
  }
  setupPlaylistNameEditing() {
    this.elements.currentPlaylistName.removeEventListener(
      "click",
      this.handlePlaylistNameClick
    );
    this.elements.currentPlaylistName.addEventListener(
      "click",
      (this.handlePlaylistNameClick = () => {
        const playlistId = parseInt(
          this.elements.currentPlaylistName.dataset.playlistId
        );
        const currentName = this.elements.currentPlaylistName.textContent;
        const nameElement = this.elements.currentPlaylistName;
        const styles = window.getComputedStyle(nameElement);
        const width = nameElement.offsetWidth;
        const height = nameElement.offsetHeight;
        const fontSize = styles.fontSize;
        const fontWeight = styles.fontWeight;
        const fontFamily = styles.fontFamily;
        const textAlign = styles.textAlign;
        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.value = currentName;
        inputElement.id = "editPlaylistNameInput";
        inputElement.style.width = width + "px";
        inputElement.style.height = height + "px";
        inputElement.style.fontSize = fontSize;
        inputElement.style.fontWeight = fontWeight;
        inputElement.style.fontFamily = fontFamily;
        inputElement.style.textAlign = textAlign;
        inputElement.style.margin = "0";
        inputElement.style.padding = "0";
        nameElement.innerHTML = "";
        nameElement.appendChild(inputElement);
        inputElement.focus();
        inputElement.select();
        inputElement.addEventListener("blur", () =>
          this.savePlaylistNameEdit(playlistId, inputElement)
        );
        inputElement.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            inputElement.blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            this.cancelPlaylistNameEdit(playlistId);
          }
        });
        inputElement.addEventListener("click", (e) => e.stopPropagation());
      })
    );
  }
  savePlaylistNameEdit(playlistId, inputElement) {
    const newName = inputElement.value.trim();
    if (!newName) {
      alert("Playlist name cannot be empty");
      this.cancelPlaylistNameEdit(playlistId);
      return;
    }
    const duplicatePlaylist = this.playlists.find(
      (p) =>
        p.id !== playlistId && p.name.toLowerCase() === newName.toLowerCase()
    );
    if (duplicatePlaylist) {
      alert("A playlist with this name already exists");
      this.cancelPlaylistNameEdit(playlistId);
      return;
    }
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.name = newName;
      this.savePlaylists()
        .then(() => {
          this.elements.currentPlaylistName.textContent = newName;
          this.renderPlaylists();
        })
        .catch((error) => {
          console.error("Error saving playlist name:", error);
          alert("Failed to save playlist name. Please try again.");
          this.cancelPlaylistNameEdit(playlistId);
        });
    }
  }
  cancelPlaylistNameEdit(playlistId) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      this.elements.currentPlaylistName.textContent = playlist.name;
    }
  }
  addHoldToDragHandler(nameElement, playlistElement) {
    let holdTimer;
    let isDragging = false;
    nameElement.addEventListener("mousedown", (e) => {
      holdTimer = setTimeout(() => {
        playlistElement.draggable = true;
        playlistElement.classList.add("draggable");
        isDragging = true;
      }, 50);
    });
    nameElement.addEventListener("mouseup", () => {
      clearTimeout(holdTimer);
      if (!isDragging) {
        playlistElement.draggable = false;
        playlistElement.classList.remove("draggable");
      }
    });
    nameElement.addEventListener("mouseleave", () => {
      clearTimeout(holdTimer);
    });
    nameElement.addEventListener("selectstart", (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    });
    playlistElement.addEventListener(
      "dragstart",
      this.handlePlaylistDragStart.bind(this)
    );
    playlistElement.addEventListener(
      "dragover",
      this.handlePlaylistDragOver.bind(this)
    );
    playlistElement.addEventListener(
      "drop",
      this.handlePlaylistDrop.bind(this)
    );
    playlistElement.addEventListener("dragend", (e) => {
      e.currentTarget.classList.remove("dragging");
      isDragging = false;
      setTimeout(() => {
        playlistElement.draggable = false;
        playlistElement.classList.remove("draggable");
      }, 100);
    });
  }
  handlePlaylistDragStart(e) {
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.setData("text/plain", e.currentTarget.dataset.playlistId);
    e.dataTransfer.effectAllowed = "move";
  }
  handlePlaylistDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const draggingElement = document.querySelector(".playlist-card.dragging");
    if (draggingElement !== e.currentTarget) {
      const container = this.elements.playlistContainer;
      const afterElement = this.getPlaylistDragAfterElement(
        container,
        e.clientY
      );
      if (afterElement) {
        container.insertBefore(draggingElement, afterElement);
      } else {
        container.appendChild(draggingElement);
      }
    }
  }
  handlePlaylistDrop(e) {
    e.preventDefault();
    const draggedPlaylistId = parseInt(e.dataTransfer.getData("text/plain"));
    const playlistElements = Array.from(
      this.elements.playlistContainer.querySelectorAll(".playlist-card")
    );
    playlistElements.forEach((element, index) => {
      const playlistId = parseInt(element.dataset.playlistId);
      const playlist = this.playlists.find((p) => p.id === playlistId);
      if (playlist) {
        playlist.position = index;
      }
    });
    this.savePlaylists().catch((error) => {
      console.error("Error saving playlist positions:", error);
      alert("Failed to save playlist order. Please try again.");
    });
  }
  getPlaylistDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".playlist-card:not(.dragging)"),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
  showWelcomeModal() {
    if (this.songLibrary.length > 0) return;
    const modal = document.createElement("div");
    modal.classList.add("modal", "welcome-modal");
    modal.style.display = "block";
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content", "welcome-content");
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement("h2");
    heading.textContent = "Welcome to Music Player!";
    const instructions = document.createElement("div");
    instructions.classList.add("welcome-instructions");
    this.loadInstructions(instructions);
    const selectContainer = document.createElement("div");
    selectContainer.classList.add("select-container");
    const selectLabel = document.createElement("label");
    selectLabel.textContent = "Choose a starter playlist: ";
    selectLabel.htmlFor = "welcomePresetList";
    const presetSelect = document.createElement("select");
    presetSelect.id = "welcomePresetList";
    presetSelect.classList.add("playlist-select");
    const defaultOption = document.createElement("option");
    defaultOption.value = "custom";
    defaultOption.textContent = "Choose a playlist...";
    presetSelect.appendChild(defaultOption);
    selectContainer.appendChild(selectLabel);
    selectContainer.appendChild(presetSelect);
    const textarea = document.createElement("textarea");
    textarea.id = "welcomeImportTextarea";
    textarea.placeholder = "Selected playlist songs will appear here...";
    textarea.style.width = "100%";
    textarea.style.height = "150px";
    textarea.readOnly = true;
    const importBtn = document.createElement("button");
    importBtn.textContent = "Import Selected Playlist";
    importBtn.classList.add("welcome-import-btn");
    importBtn.onclick = () => {
      this.importLibrary(textarea.value);
      modal.remove();
    };
    const skipBtn = document.createElement("button");
    skipBtn.textContent = "Didn't ask";
    skipBtn.classList.add("welcome-skip-btn");
    skipBtn.onclick = () => modal.remove();
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(instructions);
    modalContent.appendChild(selectContainer);
    modalContent.appendChild(textarea);
    modalContent.appendChild(importBtn);
    modalContent.appendChild(skipBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    this.loadFileList(presetSelect, textarea);
  }
  loadInstructions(instructionsElement) {
    fetch("instructions.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load instructions");
        }
        return response.text();
      })
      .then((text) => {
        instructionsElement.innerHTML = `<p>${text.replace(
          /\n\n/g,
          "</p><p>"
        )}</p>`;
      })
      .catch((error) => {
        console.error("Error loading instructions:", error);
        instructionsElement.innerHTML = `
                    <p>Welcome to your music player! Add songs from YouTube, create playlists, and enjoy your music.</p>
                    <p>Get started by importing a playlist below or add songs manually.</p>
                `;
      });
  }
  loadRecentlyPlayed() {
    return new Promise((resolve) => {
      if (!this.db) {
        console.warn("Database not initialized for recently played");
        this.recentlyPlayedSongs = [];
        this.recentlyPlayedPlaylists = [];
        resolve();
        return;
      }
      try {
        const transaction = this.db.transaction(["recentlyPlayed"], "readonly");
        const store = transaction.objectStore("recentlyPlayed");
        const songsRequest = store.get("songs");
        songsRequest.onsuccess = () => {
          if (songsRequest.result && Array.isArray(songsRequest.result.items)) {
            this.recentlyPlayedSongs = songsRequest.result.items;
          } else {
            this.recentlyPlayedSongs = [];
          }
        };
        const playlistsRequest = store.get("playlists");
        playlistsRequest.onsuccess = () => {
          if (
            playlistsRequest.result &&
            Array.isArray(playlistsRequest.result.items)
          ) {
            this.recentlyPlayedPlaylists = playlistsRequest.result.items;
          } else {
            this.recentlyPlayedPlaylists = [];
          }
        };
        transaction.oncomplete = () => {
          console.log("Successfully loaded recently played items:", {
            songs: this.recentlyPlayedSongs.length,
            playlists: this.recentlyPlayedPlaylists.length,
          });
          resolve();
        };
        transaction.onerror = (event) => {
          console.warn(
            "Error loading recently played items:",
            event.target.error
          );
          this.recentlyPlayedSongs = [];
          this.recentlyPlayedPlaylists = [];
          resolve();
        };
      } catch (error) {
        console.warn("Error in loadRecentlyPlayed:", error);
        this.recentlyPlayedSongs = [];
        this.recentlyPlayedPlaylists = [];
        resolve();
      }
    });
  }
  saveRecentlyPlayedSong(song) {
    if (!this.db || !song) return;
    const songData = {
      id: song.id,
      name: song.name,
      videoId: song.videoId,
      thumbnailUrl:
        song.thumbnailUrl ||
        `https://img.youtube.com/vi/${song.videoId}/default.jpg`,
      timestamp: Date.now(),
    };
    const transaction = this.db.transaction(["recentlyPlayed"], "readwrite");
    const store = transaction.objectStore("recentlyPlayed");
    const request = store.get("songs");
    request.onsuccess = () => {
      let recentlyPlayedSongs = [];
      if (request.result && Array.isArray(request.result.items)) {
        recentlyPlayedSongs = request.result.items;
      }
      recentlyPlayedSongs = recentlyPlayedSongs.filter(
        (item) => item.id !== song.id
      );
      recentlyPlayedSongs.unshift(songData);
      const limit = this.recentlyPlayedLimit || 20;
      if (recentlyPlayedSongs.length > limit) {
        recentlyPlayedSongs = recentlyPlayedSongs.slice(0, limit);
      }
      this.recentlyPlayedSongs = recentlyPlayedSongs;
      store.put({
        type: "songs",
        items: recentlyPlayedSongs,
      });
      this.renderAdditionalDetails();
    };
    request.onerror = (event) => {
      console.warn("Error updating recently played songs:", event.target.error);
    };
  }
  saveRecentlyPlayedPlaylist(playlist) {
    if (!this.db || !playlist) return;
    this.recentlyPlayedPlaylists = [];
    const playlistData = {
      id: playlist.id,
      name: playlist.name,
      timestamp: Date.now(),
    };
    this.recentlyPlayedPlaylists.push(playlistData);
    try {
      const transaction = this.db.transaction(["recentlyPlayed"], "readwrite");
      const store = transaction.objectStore("recentlyPlayed");
      store.put({
        type: "playlists",
        items: this.recentlyPlayedPlaylists,
      });
    } catch (error) {
      console.warn("Error saving recently played playlist:", error);
    }
    this.renderAdditionalDetails();
  }
  renderAdditionalDetails() {
    if (!this.elements.additionalDetails) return;
    
    this.elements.additionalDetails.innerHTML = "";
    
    const header = document.createElement("h2");
    header.textContent = "Discover More";
    header.classList.add("additional-details-header");
    this.elements.additionalDetails.appendChild(header);
    
    // Use the new display limits
    if (this.recentlyPlayedSongs.length > 0) {
        this.createDetailsSection(
            "Recently Listened To",
            this.recentlyPlayedSongs.slice(0, this.recentlyPlayedDisplayLimit || 3),
            "song"
        );
    }
    
    if (this.songLibrary.length > 0) {
        this.createDetailsSection(
            "Suggested",
            this.getRandomItems(this.songLibrary, this.suggestedSongsDisplayLimit || 2),
            "song"
        );
    }
    
    const favoriteSongs = this.songLibrary.filter((song) => song.favorite);
    if (favoriteSongs.length > 0) {
        this.createDetailsSection(
            "Your Picks",
            this.getRandomItems(favoriteSongs, this.yourPicksDisplayLimit || 2),
            "song"
        );
    }
    
    if (this.recentlyPlayedPlaylists.length > 0) {
        this.createDetailsSection(
            "Recently Played Playlists",
            this.recentlyPlayedPlaylists.slice(0, this.recentlyPlayedPlaylistsDisplayLimit || 1),
            "playlist"
        );
    }
}

  formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    }
  }
  getPlaylistDuration(playlist) {
    if (!playlist || !playlist.songs || playlist.songs.length === 0) {
      return "0:00";
    }
    let totalSeconds = 0;
    let hasAnyDuration = false;
    for (const song of playlist.songs) {
      if (
        this.ytPlayer &&
        this.ytPlayer.getVideoData &&
        this.ytPlayer.getVideoData().video_id === song.videoId &&
        this.ytPlayer.getDuration
      ) {
        const duration = this.ytPlayer.getDuration();
        if (duration && duration > 0) {
          totalSeconds += duration;
          hasAnyDuration = true;
        }
      } else {
        totalSeconds += 180;
      }
    }
    const formatted = this.formatDuration(totalSeconds);
    return hasAnyDuration ? formatted : `~${formatted}`;
  }
createDetailsSection(title, items, type) {
  if (!this.elements.additionalDetails || items.length === 0) return;
  const section = document.createElement("div");
  section.classList.add("additional-details-section");
  section.setAttribute("data-section-title", title);
  const sectionTitle = document.createElement("h3");
  sectionTitle.textContent = title;
  sectionTitle.classList.add("section-title");
  if (title === "Recently Listened To") {
    sectionTitle.style.cursor = "pointer";
    sectionTitle.addEventListener("click", () => {
      this.showRecentlyPlayedModal();
    });
  } else if (title === "Suggested") {
    sectionTitle.style.cursor = "pointer";
    sectionTitle.addEventListener("click", () => {
      this.refreshSpecificSection("Suggested");
    });
  } else if (title === "Your Picks") {
    sectionTitle.style.cursor = "pointer";
    sectionTitle.addEventListener("click", () => {
      this.refreshSpecificSection("Your Picks");
    });
  }
  section.appendChild(sectionTitle);
  const itemsList = document.createElement("div");
  itemsList.classList.add("details-items-list");
  items.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("details-item");
    if (type === "song") {
      itemElement.setAttribute("data-video-id", item.videoId);
      itemElement.setAttribute("data-song-id", item.id);
    }
    const thumbnail = document.createElement("div");
    thumbnail.classList.add("details-item-thumbnail");
    if (type === "song") {
      const thumbnailImg = document.createElement("img");
      thumbnailImg.src =
        item.thumbnailUrl ||
        `https://img.youtube.com/vi/${item.videoId}/default.jpg`;
      thumbnailImg.alt = item.name;
      thumbnailImg.onerror = function () {
        this.src = "https://placehold.it/120x90/333/fff?text=No+Image";
      };
      thumbnail.appendChild(thumbnailImg);
    } else {
      const playlistIcon = document.createElement("i");
      playlistIcon.classList.add("fa", "fa-list");
      thumbnail.appendChild(playlistIcon);
    }
    const itemInfo = document.createElement("div");
    itemInfo.classList.add("details-item-info");
    const itemName = document.createElement("div");
    itemName.classList.add("details-item-name");
    itemName.textContent = item.name;
    itemInfo.appendChild(itemName);
    itemElement.addEventListener("click", (e) => {
      e.preventDefault();
      if (type === "song") {
        this.playSong(item.id);
      } else {
        this.playPlaylist(item.id);
      }
    });
    if (type === "song") {
      itemElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.addToQueue(item);
      });
      itemElement.style.cursor = "pointer";
      itemElement.title = "Left click to play, right click to add to queue";
    }
    itemElement.appendChild(thumbnail);
    itemElement.appendChild(itemInfo);
    itemsList.appendChild(itemElement);
  });
  section.appendChild(itemsList);
  this.elements.additionalDetails.appendChild(section);
}
refreshSpecificSection(sectionTitle) {
    if (!this.elements.additionalDetails) return;
    
    const sectionToRefresh = this.elements.additionalDetails.querySelector(
        `[data-section-title="${sectionTitle}"]`
    );
    if (!sectionToRefresh) return;
    
    let newItems = [];
    let type = "song";
    
    if (sectionTitle === "Suggested") {
        if (this.songLibrary.length > 0) {
            newItems = this.getRandomItems(this.songLibrary, this.suggestedSongsDisplayLimit || 2);
        }
    } else if (sectionTitle === "Your Picks") {
        const favoriteSongs = this.songLibrary.filter((song) => song.favorite);
        if (favoriteSongs.length > 0) {
            newItems = this.getRandomItems(favoriteSongs, this.yourPicksDisplayLimit || 2);
        }
    }
    
    if (newItems.length === 0) return;
    
    const itemsList = sectionToRefresh.querySelector(".details-items-list");
    if (!itemsList) return;
    
    itemsList.innerHTML = "";
    
    newItems.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("details-item");
        if (type === "song") {
            itemElement.setAttribute("data-video-id", item.videoId);
            itemElement.setAttribute("data-song-id", item.id);
        }
        
        const thumbnail = document.createElement("div");
        thumbnail.classList.add("details-item-thumbnail");
        if (type === "song") {
            const thumbnailImg = document.createElement("img");
            thumbnailImg.src =
                item.thumbnailUrl ||
                `https://img.youtube.com/vi/${item.videoId}/default.jpg`;
            thumbnailImg.alt = item.name;
            thumbnailImg.onerror = function () {
                this.src = "https://placehold.it/120x90/333/fff?text=No+Image";
            };
            thumbnail.appendChild(thumbnailImg);
        } else {
            const playlistIcon = document.createElement("i");
            playlistIcon.classList.add("fa", "fa-list");
            thumbnail.appendChild(playlistIcon);
        }
        
        const itemInfo = document.createElement("div");
        itemInfo.classList.add("details-item-info");
        const itemName = document.createElement("div");
        itemName.classList.add("details-item-name");
        itemName.textContent = item.name;
        itemInfo.appendChild(itemName);
        
        itemElement.addEventListener("click", (e) => {
            e.preventDefault();
            if (type === "song") {
                this.playSong(item.id);
            } else {
                this.playPlaylist(item.id);
            }
        });
        
        if (type === "song") {
            itemElement.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.addToQueue(item);
            });
            itemElement.style.cursor = "pointer";
            itemElement.title = "Left click to play, right click to add to queue";
        }
        
        itemElement.appendChild(thumbnail);
        itemElement.appendChild(itemInfo);
        itemsList.appendChild(itemElement);
    });
}
  refreshSuggestedSongs() {
    if (this.songLibrary.length > 0) {
      this.renderAdditionalDetails();
    }
  }
  refreshYourPicks() {
    const favoriteSongs = this.songLibrary.filter((song) => song.favorite);
    if (favoriteSongs.length > 0) {
      this.renderAdditionalDetails();
    }
  }
  getRandomItems(array, count) {
    if (array.length <= count) {
      return [...array];
    }
    const result = [];
    const copyArray = [...array];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * copyArray.length);
      result.push(copyArray[randomIndex]);
      copyArray.splice(randomIndex, 1);
    }
    return result;
  }
  showRecentlyPlayedModal() {
    const modalBg = document.createElement("div");
    modalBg.classList.add("recently-played-modal-bg");
    const modalContent = document.createElement("div");
    modalContent.classList.add("recently-played-modal");
    const header = document.createElement("div");
    header.classList.add("recently-played-header");
    const title = document.createElement("h2");
    title.textContent = "Recently Listened To";
    const settingsSection = document.createElement("div");
    settingsSection.classList.add("recently-played-settings");
    const settingsLabel = document.createElement("label");
    settingsLabel.textContent = "Store last ";
    settingsLabel.classList.add("recently-played-settings-label");
    const settingsInput = document.createElement("input");
    settingsInput.type = "number";
    settingsInput.min = "1";
    settingsInput.max = "100";
    settingsInput.value = this.recentlyPlayedLimit || 20;
    settingsInput.classList.add("recently-played-settings-input");
    const settingsLabelEnd = document.createElement("span");
    settingsLabelEnd.textContent = " songs";
    settingsLabelEnd.classList.add("recently-played-settings-label");
    settingsSection.appendChild(settingsLabel);
    settingsSection.appendChild(settingsInput);
    settingsSection.appendChild(settingsLabelEnd);
    settingsInput.addEventListener("change", () => {
      const newLimit = parseInt(settingsInput.value) || 20;
      if (newLimit >= 1 && newLimit <= 100) {
        this.updateRecentlyPlayedLimit(newLimit);
      } else {
        settingsInput.value = this.recentlyPlayedLimit || 20;
      }
    });
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "×";
    closeBtn.classList.add("recently-played-close");
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(modalBg);
    });
    header.appendChild(title);
    header.appendChild(settingsSection);
    header.appendChild(closeBtn);
    const content = document.createElement("div");
    content.classList.add("recently-played-content");
    this.recentlyPlayedSongs.forEach((song, index) => {
      const songItem = document.createElement("div");
      songItem.classList.add("recently-played-item");
      const thumbnail = document.createElement("img");
      thumbnail.src =
        song.thumbnailUrl ||
        `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
      thumbnail.alt = song.name;
      thumbnail.classList.add("recently-played-thumbnail");
      thumbnail.onerror = function () {
        this.src = "https://placehold.it/120x90/333/fff?text=No+Image";
      };
      const info = document.createElement("div");
      info.classList.add("recently-played-info");
      const name = document.createElement("div");
      name.classList.add("recently-played-name");
      name.textContent = song.name;
      const time = document.createElement("div");
      time.classList.add("recently-played-time");
      const timeAgo = this.getTimeAgo(song.timestamp);
      time.textContent = timeAgo;
      info.appendChild(name);
      info.appendChild(time);
      songItem.appendChild(thumbnail);
      songItem.appendChild(info);
      songItem.addEventListener("click", () => {
        this.playSong(song.id);
        document.body.removeChild(modalBg);
      });
      content.appendChild(songItem);
    });
    modalContent.appendChild(header);
    modalContent.appendChild(content);
    modalBg.appendChild(modalContent);
    modalBg.addEventListener("click", (e) => {
      if (e.target === modalBg) {
        document.body.removeChild(modalBg);
      }
    });
    document.body.appendChild(modalBg);
  }
  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  updateRecentlyPlayedLimit(newLimit) {
    this.recentlyPlayedLimit = newLimit;
    this.saveSetting("recentlyPlayedLimit", newLimit)
      .then(() => {
        if (this.recentlyPlayedSongs.length > newLimit) {
          this.recentlyPlayedSongs = this.recentlyPlayedSongs.slice(
            0,
            newLimit
          );
          if (this.db) {
            const transaction = this.db.transaction(
              ["recentlyPlayed"],
              "readwrite"
            );
            const store = transaction.objectStore("recentlyPlayed");
            store.put({
              type: "songs",
              items: this.recentlyPlayedSongs,
            });
            this.renderAdditionalDetails();
          }
        }
      })
      .catch((error) => {
        console.error("Error saving recently played limit:", error);
        this.recentlyPlayedLimit = this.recentlyPlayedLimit || 20;
      });
  }
  renderLyricsTab() {
    if (!this.elements.lyricsPane) return;
    this.elements.lyricsPane.innerHTML = "";
    if (
        this.currentSongIndex === undefined ||
        (!this.songLibrary.length && !this.currentPlaylist)
    ) {
        const emptyMessage = document.createElement("div");
        emptyMessage.classList.add("empty-lyrics-message");
        emptyMessage.textContent = "No song is currently playing.";
        this.elements.lyricsPane.appendChild(emptyMessage);
        return;
    }
    const currentSong = this.currentPlaylist
        ? this.currentPlaylist.songs[this.currentSongIndex]
        : this.songLibrary[this.currentSongIndex];
    if (!currentSong) {
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        errorMessage.textContent = "Current song information could not be found.";
        this.elements.lyricsPane.appendChild(errorMessage);
        return;
    }
    let songWithLyrics = currentSong;
    if (this.currentPlaylist) {
        const libraryMatch = this.songLibrary.find(
            (libSong) => libSong.videoId === currentSong.videoId
        );
        if (libraryMatch && libraryMatch.lyrics) {
            songWithLyrics = libraryMatch;
        }
    }
    if (!songWithLyrics.lyrics || songWithLyrics.lyrics.trim() === "") {
        const noLyricsMessage = document.createElement("div");
        noLyricsMessage.classList.add("no-lyrics-message");
        noLyricsMessage.innerHTML = `
            <p>No lyrics available for "${this.escapeHtml(currentSong.name)}".</p>
            <p>You can add lyrics by double-clicking on this song in the library tab.</p>
        `;
        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.gap = "10px";
        buttonsContainer.style.marginTop = "10px";
        
        const addLyricsBtn = document.createElement("button");
        addLyricsBtn.textContent = "Transcribe lyrics";
        addLyricsBtn.classList.add("add-lyrics-btn");
        addLyricsBtn.style.backgroundColor = "var(--accent-color)";
        addLyricsBtn.style.color = "white";
        addLyricsBtn.style.border = "none";
        addLyricsBtn.style.borderRadius = "4px";
        addLyricsBtn.style.padding = "8px 16px";
        addLyricsBtn.style.cursor = "pointer";
        addLyricsBtn.style.flex = "1";
        
        const importSubtitlesBtn = document.createElement("button");
        importSubtitlesBtn.textContent = "Import subtitles as lyrics";
        importSubtitlesBtn.classList.add("import-subtitles-btn");
        importSubtitlesBtn.style.backgroundColor = "#17a2b8";
        importSubtitlesBtn.style.color = "white";
        importSubtitlesBtn.style.border = "none";
        importSubtitlesBtn.style.borderRadius = "4px";
        importSubtitlesBtn.style.padding = "8px 16px";
        importSubtitlesBtn.style.cursor = "pointer";
        importSubtitlesBtn.style.flex = "1";

        const librarySong = this.currentPlaylist
            ? this.songLibrary.find((s) => s.videoId === currentSong.videoId)
            : currentSong;
        if (librarySong) {
            addLyricsBtn.addEventListener("click", () => {
                this.openLyricsMakerModal(librarySong.id);
            });
            importSubtitlesBtn.addEventListener("click", () => {
                this.openImportSubtitlesModal(librarySong.id);
            });
            buttonsContainer.appendChild(addLyricsBtn);
            buttonsContainer.appendChild(importSubtitlesBtn);
        }
        noLyricsMessage.appendChild(buttonsContainer);
        this.elements.lyricsPane.appendChild(noLyricsMessage);
        return;
    }
    const lyricsPlayer = document.createElement("div");
    lyricsPlayer.classList.add("lyrics-player");
    const lyricsArray = [];
    const timingsArray = [];
    const lines = songWithLyrics.lyrics
        .split("\n")
        .filter((line) => line.trim() !== "");
    for (const line of lines) {
        const match = line.match(/(.*)\s*\[(\d+):(\d+)\]/);
        if (match) {
            const lyric = match[1].trim();
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const timeInSeconds = minutes * 60 + seconds;
            lyricsArray.push(lyric);
            timingsArray.push(timeInSeconds);
        }
    }
    const lyricsDisplay = document.createElement("div");
    lyricsDisplay.classList.add("lyrics-display");
    lyricsDisplay.style.margin = "20px 0";
    lyricsDisplay.style.padding = "15px";
    lyricsDisplay.style.border = "1px solid var(--border-color)";
    lyricsDisplay.style.borderRadius = "5px";
    lyricsDisplay.style.backgroundColor = "var(--bg-primary)";
    lyricsDisplay.style.height = "400px";
    lyricsDisplay.style.overflowY = "auto";
    for (let i = 0; i < lyricsArray.length; i++) {
        const lineElement = document.createElement("div");
        lineElement.classList.add("lyric-line");
        lineElement.textContent = lyricsArray[i];
        lineElement.id = `lyric-${i}`;
        lineElement.style.padding = "8px 10px";
        lineElement.style.margin = "5px 0";
        lineElement.style.borderRadius = "3px";
        lineElement.style.transition = "all 0.3s ease";
        lineElement.style.color = "var(--text-secondary)";
        lyricsDisplay.appendChild(lineElement);
    }
    lyricsPlayer.appendChild(lyricsDisplay);
    const expandButton = document.createElement("button");
    expandButton.classList.add("lyrics-expand-btn");
    expandButton.innerHTML = '<i class="fas fa-expand"></i>Expand';
    expandButton.addEventListener('click', () => this.enterLyricsFullscreen());
    lyricsPlayer.appendChild(expandButton);
    this.elements.lyricsPane.appendChild(lyricsPlayer);
    if (this.lyricsInterval) {
        clearInterval(this.lyricsInterval);
    }
    if (this.ytPlayer && this.isPlaying) {
        this.lyricsInterval = setInterval(() => {
            if (this.ytPlayer && this.ytPlayer.getCurrentTime) {
                const currentTime = this.ytPlayer.getCurrentTime();
                this.updateHighlightedLyric(currentTime, lyricsArray, timingsArray);
            }
        }, 100);
    }
}
  updateHighlightedLyric(currentTime, lyrics, timings) {
    if (!lyrics.length || !timings.length) return;
    let highlightIndex = -1;
    for (let i = 0; i < timings.length; i++) {
      if (currentTime >= timings[i]) {
        if (i === timings.length - 1 || currentTime < timings[i + 1]) {
          highlightIndex = i;
        }
      }
    }
    if (highlightIndex !== this.currentHighlightedLyricIndex) {
      const allLines = document.querySelectorAll(".lyric-line");
      allLines.forEach((line) => {
        line.classList.remove("active");
        line.style.backgroundColor = "";
        line.style.color = "var(--text-secondary)";
        line.style.fontWeight = "normal";
        line.style.fontSize = "";
        line.style.transform = "";
      });
      if (highlightIndex !== -1) {
        const currentElement = document.getElementById(
          `lyric-${highlightIndex}`
        );
        if (currentElement) {
          currentElement.classList.add("active");
          currentElement.style.backgroundColor = "var(--accent-color)";
          currentElement.style.color = "var(--text-primary)";
          currentElement.style.fontWeight = "bold";
          currentElement.style.fontSize = "1.1em";
          currentElement.style.transform = "scale(1.02)";
          currentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
      this.currentHighlightedLyricIndex = highlightIndex;
    }
  }
  openLyricsLibraryModal() {
    const modal = document.createElement("div");
    modal.classList.add("lyrics-library-modal");
    modal.style.display = "flex";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.7)";
    modal.style.zIndex = "1000";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    modalContent.style.backgroundColor = "var(--bg-secondary)";
    modalContent.style.color = "var(--text-primary)";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "5px";
    modalContent.style.width = "90%";
    modalContent.style.maxWidth = "800px";
    modalContent.style.maxHeight = "80vh";
    modalContent.style.overflowY = "auto";
    modalContent.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
    modalContent.style.position = "relative";
    const headerContainer = document.createElement("div");
    headerContainer.style.position = "sticky";
    headerContainer.style.top = "0";
    headerContainer.style.backgroundColor = "var(--bg-secondary)";
    headerContainer.style.paddingBottom = "10px";
    headerContainer.style.marginBottom = "10px";
    headerContainer.style.borderBottom = "1px solid var(--border-color)";
    headerContainer.style.display = "flex";
    headerContainer.style.justifyContent = "space-between";
    headerContainer.style.alignItems = "center";
    headerContainer.style.zIndex = "10";
    const header = document.createElement("h3");
    header.textContent = "Songs with Lyrics";
    header.style.margin = "0";
    header.style.color = "var(--text-primary)";
    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.fontSize = "24px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.color = "var(--text-primary)";
    closeBtn.style.lineHeight = "24px";
    closeBtn.onclick = () => modal.remove();
    headerContainer.appendChild(header);
    headerContainer.appendChild(closeBtn);
    const contentContainer = document.createElement("div");
    contentContainer.style.display = "flex";
    contentContainer.style.flexDirection = "column";
    contentContainer.style.gap = "10px";
    const songsWithLyrics = this.songLibrary.filter(
      (song) => song.lyrics && song.lyrics.trim() !== ""
    );
    if (songsWithLyrics.length === 0) {
      const noLyricsMessage = document.createElement("div");
      noLyricsMessage.textContent =
        "No songs with lyrics found. Add lyrics to your songs to see them here.";
      noLyricsMessage.style.textAlign = "center";
      noLyricsMessage.style.color = "var(--text-secondary)";
      noLyricsMessage.style.padding = "20px";
      contentContainer.appendChild(noLyricsMessage);
    } else {
      songsWithLyrics.forEach((song) => {
        const songItem = document.createElement("div");
        songItem.style.display = "flex";
        songItem.style.alignItems = "center";
        songItem.style.padding = "10px";
        songItem.style.backgroundColor = "var(--bg-primary)";
        songItem.style.borderRadius = "5px";
        songItem.style.border = "1px solid var(--border-color)";
        songItem.style.gap = "10px";
        const songInfo = document.createElement("div");
        songInfo.style.flex = "1";
        songInfo.style.minWidth = "0";
        const songName = document.createElement("div");
        songName.textContent = song.name;
        songName.style.fontWeight = "bold";
        songName.style.color = "var(--text-primary)";
        songName.style.overflow = "hidden";
        songName.style.textOverflow = "ellipsis";
        songName.style.whiteSpace = "nowrap";
        const lyricsPreview = document.createElement("div");
        const firstLine =
          song.lyrics
            .split("\n")[0]
            ?.replace(/\[.*?\]/g, "")
            .trim() || "No preview available";
        lyricsPreview.textContent =
          firstLine.length > 50
            ? firstLine.substring(0, 50) + "..."
            : firstLine;
        lyricsPreview.style.color = "var(--text-secondary)";
        lyricsPreview.style.fontSize = "0.9em";
        lyricsPreview.style.overflow = "hidden";
        lyricsPreview.style.textOverflow = "ellipsis";
        lyricsPreview.style.whiteSpace = "nowrap";
        songInfo.appendChild(songName);
        songInfo.appendChild(lyricsPreview);
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "5px";
        buttonContainer.style.flexShrink = "0";
        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.style.padding = "5px 10px";
        copyBtn.style.fontSize = "0.8em";
        copyBtn.style.backgroundColor = "var(--accent-color)";
        copyBtn.style.color = "white";
        copyBtn.style.border = "none";
        copyBtn.style.borderRadius = "3px";
        copyBtn.style.cursor = "pointer";
        copyBtn.style.transition = "background-color 0.3s";
        copyBtn.addEventListener("mouseover", () => {
          copyBtn.style.backgroundColor = "var(--hover-color)";
        });
        copyBtn.addEventListener("mouseout", () => {
          copyBtn.style.backgroundColor = "var(--accent-color)";
        });
        copyBtn.onclick = () => {
          navigator.clipboard
            .writeText(song.lyrics)
            .then(() => {
              const originalText = copyBtn.textContent;
              copyBtn.textContent = "Copied!";
              copyBtn.style.backgroundColor = "#4CAF50";
              setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = "var(--accent-color)";
              }, 1000);
            })
            .catch((err) => {
              console.error("Failed to copy lyrics:", err);
              alert("Failed to copy lyrics to clipboard");
            });
        };
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.padding = "5px 10px";
        editBtn.style.fontSize = "0.8em";
        editBtn.style.backgroundColor = "#6c757d";
        editBtn.style.color = "white";
        editBtn.style.border = "none";
        editBtn.style.borderRadius = "3px";
        editBtn.style.cursor = "pointer";
        editBtn.style.transition = "background-color 0.3s";
        editBtn.addEventListener("mouseover", () => {
          editBtn.style.backgroundColor = "#5a6268";
        });
        editBtn.addEventListener("mouseout", () => {
          editBtn.style.backgroundColor = "#6c757d";
        });
        editBtn.onclick = () => {
          modal.remove();
          this.openSongEditModal(song.id);
        };
        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(editBtn);
        songItem.appendChild(songInfo);
        songItem.appendChild(buttonContainer);
        contentContainer.appendChild(songItem);
      });
    }
    modalContent.appendChild(headerContainer);
    modalContent.appendChild(contentContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    };
  }
  setupLyricsTabContextMenu() {
    const lyricsTab = document.querySelector('.tab[data-tab="lyrics"]');
    if (!lyricsTab) return;
    lyricsTab.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.openLyricsLibraryModal();
    });
    lyricsTab.title = "rightclick to view lyric library";
  }
  openLyricsMakerModal(songId) {
  const song = this.songLibrary.find((s) => s.id === songId);
  if (!song) return;

  // Pause main player
  if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
    this.ytPlayer.pauseVideo();
    this.isPlaying = false;
    this.updatePlayerUI();
    this.clearAllIntervals();
  }

  // Show modal and set up
  const modal = document.getElementById('lyricsModal');
  const titleElement = document.getElementById('lyricsTitle');
  const youtubeLink = document.getElementById('youtubeLink');
  
  titleElement.textContent = `Lyrics Maker for: ${song.name}`;
  youtubeLink.value = `https://www.youtube.com/watch?v=${song.videoId}`;
  
  modal.classList.remove('hidden');
  this.initLyricMaker(song);
}

clearAllIntervals() {
  if (this.titleScrollInterval) {
    clearInterval(this.titleScrollInterval);
  }
  if (this.progressInterval) {
    clearInterval(this.progressInterval);
  }
  if (this.lyricsInterval) {
    clearInterval(this.lyricsInterval);
  }
}
initLyricMaker(song) {
  const modal = document.getElementById('lyricsModal');
  const closeBtn = document.getElementById('closeLyricsModal');
  
  const player = { ytPlayer: null };
  const state = {
    lyrics: [],
    timings: [],
    currentLineIndex: -1,
    isRecording: false,
    timeUpdateInterval: null,
  };

  // Close modal handler
  const closeModal = () => {
    modal.classList.add('hidden');
    if (state.timeUpdateInterval) {
      clearInterval(state.timeUpdateInterval);
    }
    if (player.ytPlayer) {
      player.ytPlayer.destroy();
    }
     // Reset all state
  state.lyrics = [];
  state.timings = [];
  state.currentLineIndex = -1;
  state.isRecording = false;
  
  // Reset UI elements
  document.getElementById("lyricsInput").value = '';
  document.getElementById("exportOutput").value = '';
  document.getElementById("progressContainer").innerHTML = '<h3>Progress</h3>';
  document.getElementById("previewContainer").innerHTML = '';
  document.getElementById("currentTime").textContent = '0:00';
  document.getElementById("prevLine").textContent = '';
  document.getElementById("currentLine").textContent = 'Press "Start Recording" when ready';
  document.getElementById("nextLine").textContent = '';
  
  // Reset button states
  document.getElementById("startRecording").disabled = false;
  document.getElementById("markLine").disabled = true;
  document.getElementById("finishRecording").disabled = true;
  
  // Reset to first tab
  showTab('setupTab');
};
  closeBtn.onclick = closeModal;

  // Tab switching
  const showTab = (tabId) => {
    document.querySelectorAll('.lyrics-tab, .lyrics-nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.lyrics-nav-item').forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add('active');
      }
    });
  };

  document.querySelectorAll('.lyrics-nav-item').forEach(tab => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
  });

  // Load video function
  const loadVideo = () => {
    const videoId = song.videoId;
    if (!videoId) return;

    if (player.ytPlayer) {
      player.ytPlayer.destroy();
    }

    if (typeof YT === "undefined" || typeof YT.Player === "undefined") {
      if (!document.getElementById("youtube-api")) {
        const tag = document.createElement("script");
        tag.id = "youtube-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => {
          createYouTubePlayer(videoId);
        };
      }
    } else {
      createYouTubePlayer(videoId);
    }
  };

  // Create YouTube player
  const createYouTubePlayer = (videoId) => {
    const container = document.getElementById("videoContainer");
    if (!container) return;

    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
      this.ytPlayer.pauseVideo();
    }

    player.ytPlayer = new YT.Player(container, {
      height: "360",
      width: "640",
      videoId: videoId,
      playerVars: {
        playsinline: 1,
        controls: 1,
      },
      events: {
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            clearInterval(state.timeUpdateInterval);
            state.timeUpdateInterval = setInterval(() => {
              if (player.ytPlayer && player.ytPlayer.getCurrentTime) {
                document.getElementById("currentTime").textContent = formatTime(
                  player.ytPlayer.getCurrentTime()
                );
              }
            }, 100);
          }
        },
      },
    });
  };

  // Format time helper
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Lyrics search functions
  const searchAZLyrics = () => {
    const songName = song.name ? song.name.replace(/\s+/g, '+') : '';
    const author = song.author ? '+' + song.author.replace(/\s+/g, '+') : '';
    const url = `https://search.azlyrics.com/search.php?q=${songName}${author}&x=acc029721e541ef4da92207eb06ba181719a67575dcaefe50b401ab43356fc32`;
    window.open(url, '_blank');
  };

  const searchLetras = () => {
    const songName = song.name ? song.name.replace(/\s+/g, '%20') : '';
    const author = song.author ? '%20' + song.author.replace(/\s+/g, '%20') : '';
    const url = `https://www.letras.com/?q=${songName}${author}`;
    window.open(url, '_blank');
  };

  const searchGenius = () => {
    const songName = song.name ? song.name.replace(/\s+/g, '%20') : '';
    const author = song.author ? '%20' + song.author.replace(/\s+/g, '%20') : '';
    const url = `https://genius.com/search?q=${songName}${author}`;
    window.open(url, '_blank');
  };

  const searchGoogle = () => {
    const songName = song.name ? song.name.replace(/\s+/g, '%20') : '';
    const author = song.author ? '%20' + song.author.replace(/\s+/g, '%20') : '';
    const url = `https://www.google.com/search?q=${songName}${author}%20lyrics`;
    window.open(url, '_blank');
  };

  // Prepare lyrics function
  const prepareLyrics = () => {
    const lyricsText = document.getElementById("lyricsInput").value.trim();
    if (!lyricsText) {
      alert("Please enter lyrics");
      return;
    }

    state.lyrics = lyricsText
      .split("\n")
      .filter((line) => line.trim() !== "");

    const progressContainer = document.getElementById("progressContainer");
    progressContainer.innerHTML = "<h3>Progress</h3>";

    state.lyrics.forEach((line, index) => {
      const lineElement = document.createElement("div");
      lineElement.className = "progress-item";
      lineElement.innerHTML = `
        <span>${index + 1}. ${line}</span>
        <span id="time-${index}">Not timed</span>
      `;
      progressContainer.appendChild(lineElement);
    });

    state.timings = Array(state.lyrics.length).fill(null);
    state.currentLineIndex = -1;
    updateLyricsDisplay();
    showTab("recordTab");
  };

  // Update lyrics display
  const updateLyricsDisplay = () => {
    const prevLineElement = document.getElementById("prevLine");
    const currentLineElement = document.getElementById("currentLine");
    const nextLineElement = document.getElementById("nextLine");

    if (!state.isRecording) {
      currentLineElement.textContent = 'Press "Start Recording" when ready';
      prevLineElement.textContent = "";
      nextLineElement.textContent = "";
      return;
    }

    if (state.currentLineIndex === -1) {
      currentLineElement.textContent = "[Click 'Mark Line' to start the first lyric]";
      prevLineElement.textContent = "";
      nextLineElement.textContent = state.lyrics[0] || "";
    } else if (state.currentLineIndex >= state.lyrics.length) {
      currentLineElement.textContent = "Recording complete!";
      prevLineElement.textContent = state.lyrics[state.lyrics.length - 1] || "";
      nextLineElement.textContent = "";
    } else {
      currentLineElement.textContent = state.lyrics[state.currentLineIndex];
      
      if (state.currentLineIndex > 0) {
        prevLineElement.textContent = state.lyrics[state.currentLineIndex - 1];
      } else {
        prevLineElement.textContent = "";
      }
      
      if (state.currentLineIndex < state.lyrics.length - 1) {
        nextLineElement.textContent = state.lyrics[state.currentLineIndex + 1];
      } else {
        nextLineElement.textContent = "";
      }
    }
  };

  // Start recording function
  const startRecording = () => {
    if (!player.ytPlayer || !state.lyrics.length) {
      alert("Please load a video and prepare lyrics first");
      return;
    }

    player.ytPlayer.playVideo();
    state.timings = Array(state.lyrics.length).fill(null);
    state.currentLineIndex = -1;
    state.isRecording = true;

    document.getElementById("startRecording").disabled = true;
    document.getElementById("markLine").disabled = false;
    document.getElementById("finishRecording").disabled = false;

    updateLyricsDisplay();
  };

  // Mark current line function - WORKS LIKE ORIGINAL WITH OVERWRITE
  const markCurrentLine = () => {
    if (!state.isRecording) return;

    const currentTime = player.ytPlayer.getCurrentTime();
    state.currentLineIndex++;

    if (state.currentLineIndex < state.lyrics.length) {
      // Check if we're overwriting by looking at current video time vs existing timings
      // If current time is before an already marked timing, find which line to overwrite
      let lineToMark = state.currentLineIndex;
      
      for (let i = 0; i < state.currentLineIndex; i++) {
        if (state.timings[i] !== null && currentTime < state.timings[i]) {
          lineToMark = i;
          break;
        }
      }

      state.timings[lineToMark] = currentTime;
      
      const timeElement = document.getElementById(`time-${lineToMark}`);
      if (timeElement) {
        timeElement.textContent = formatTime(currentTime);
      }

      const progressItem = timeElement.parentElement;
      if (progressItem) {
        progressItem.style.backgroundColor = "#4a4a4a";
      }

      updateLyricsDisplay();
    } else {
      finishRecording();
    }
  };

  // Finish recording function
  const finishRecording = () => {
    state.isRecording = false;
    clearInterval(state.timeUpdateInterval);

    document.getElementById("startRecording").disabled = false;
    document.getElementById("markLine").disabled = true;
    document.getElementById("finishRecording").disabled = true;

    updateLyricsDisplay();
    generateExport();
    showTab("exportTab");
  };

  // Generate export function
  const generateExport = () => {
    if (!state.lyrics.length || !state.timings.length) {
      alert("No lyrics or timings available");
      return;
    }

    const previewContainer = document.getElementById("previewContainer");
    const exportOutput = document.getElementById("exportOutput");

    previewContainer.innerHTML = "";
    let exportText = "";

    for (let i = 0; i < state.lyrics.length; i++) {
      if (state.timings[i] === null) continue;

      const timeString = formatTime(state.timings[i]);
      const formattedLine = `${state.lyrics[i]} [${timeString}]`;

      const lineElement = document.createElement("div");
      lineElement.className = "progress-item";
      lineElement.textContent = formattedLine;
      previewContainer.appendChild(lineElement);

      exportText += formattedLine + "\n";
    }

    exportOutput.value = exportText;
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    const exportOutput = document.getElementById("exportOutput");
    exportOutput.select();
    document.execCommand("copy");
    alert("Copied to clipboard!");
  };

  // Save lyrics function
  const saveLyrics = () => {
    const lyricsText = document.getElementById("exportOutput").value;
    if (!lyricsText) {
      alert("No lyrics to save");
      return;
    }

    this.updateSongDetails(song.id, song.name, song.author, song.videoId, lyricsText)
      .then(() => {
        alert("Lyrics saved successfully!");
        closeModal();
        if (document.getElementById("lyrics").classList.contains("active")) {
          this.renderLyricsTab();
        }
      })
      .catch((error) => {
        console.error("Error saving lyrics:", error);
        alert("Failed to save lyrics. Please try again.");
      });
  };

  // Event listeners
  document.getElementById('loadVideoBtn').addEventListener('click', loadVideo);
  document.getElementById('prepareLyricsBtn').addEventListener('click', prepareLyrics);
  document.getElementById('nextToRecordBtn').addEventListener('click', () => showTab('recordTab'));
  document.getElementById('startRecording').addEventListener('click', startRecording);
  document.getElementById('markLine').addEventListener('click', markCurrentLine);
  document.getElementById('finishRecording').addEventListener('click', finishRecording);
  document.getElementById('copyToClipboardBtn').addEventListener('click', copyToClipboard);
  document.getElementById('saveLyricsBtn').addEventListener('click', saveLyrics);
  document.getElementById('azlyricsBtn').addEventListener('click', searchAZLyrics);
  document.getElementById('letrasBtn').addEventListener('click', searchLetras);
  document.getElementById('geniusBtn').addEventListener('click', searchGenius);
  document.getElementById('googleBtn').addEventListener('click', searchGoogle);

  // Close on escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // Initialize by loading the video
  loadVideo();
}
  isMobileConnection() {
    if ("connection" in navigator) {
      const connection = navigator.connection;
      return (
        ["slow-2g", "2g", "3g"].includes(connection.effectiveType) ||
        connection.saveData === true
      );
    }
    return window.innerWidth <= 768;
  }
  toggleVideoFullscreen() {
    this.isVideoFullscreen = !this.isVideoFullscreen;
    if (this.isVideoFullscreen) {
      this.showVideoFullscreen();
    } else {
      this.hideVideoFullscreen();
    }
  }
  showVideoFullscreen() {
    const isCurrentlyPlaying =
      this.ytPlayer.getPlayerState() === YT.PlayerState.PLAYING;
    const currentTime = this.ytPlayer.getCurrentTime();
    document.querySelector(".main-container").style.display = "none";
    document.querySelector(".theme-toggle").style.display = "none";
    document.querySelector(".listening-stats").style.display = "none";
    document.querySelector(".control-bar-toggle").style.display = "none";
    document.querySelector(".layout-toggle").style.display = "none";
    document.querySelector(".watermark").style.display = "none";
    const ytPlayerEl = document.getElementById("ytPlayer");
    ytPlayerEl.classList.add("fullscreen-video");
    this.ytPlayer.setSize(window.innerWidth, window.innerHeight - 120);
    if (this.isMobileConnection()) {
      this.ytPlayer.setPlaybackQuality("small");
    }
    if (isCurrentlyPlaying) {
      setTimeout(() => {
        this.ytPlayer.seekTo(currentTime, true);
        this.ytPlayer.playVideo();
      }, 100);
    }
    this.showVideoHint();
  }
  hideVideoFullscreen() {
    const isCurrentlyPlaying =
      this.ytPlayer.getPlayerState() === YT.PlayerState.PLAYING;
    const currentTime = this.ytPlayer.getCurrentTime();
    document.querySelector(".main-container").style.display = "flex";
    document.querySelector(".theme-toggle").style.display = "flex";
    document.querySelector(".listening-stats").style.display = "flex";
    document.querySelector(".control-bar-toggle").style.display = "block";
    document.querySelector(".layout-toggle").style.display = "block";
    document.querySelector(".watermark").style.display = "block";
    const ytPlayerEl = document.getElementById("ytPlayer");
    ytPlayerEl.classList.remove("fullscreen-video");
    this.ytPlayer.setSize(1, 1);
    if (this.isMobileConnection()) {
      this.ytPlayer.setPlaybackQuality("small");
    }
    if (isCurrentlyPlaying) {
      setTimeout(() => {
        this.ytPlayer.seekTo(currentTime, true);
        this.ytPlayer.playVideo();
      }, 100);
    }
    this.hideVideoHint();
  }
  showVideoHint() {
    let hintEl = document.getElementById("videoHint");
    if (!hintEl) {
      hintEl = document.createElement("div");
      hintEl.id = "videoHint";
      hintEl.className = "video-hint";
      hintEl.innerHTML =
        '<i class="fas fa-keyboard"></i> Press U to exit video mode';
      document.body.appendChild(hintEl);
    }
    hintEl.style.display = "block";
    setTimeout(() => {
      if (hintEl) {
        hintEl.style.opacity = "0";
        setTimeout(() => {
          if (hintEl && this.isVideoFullscreen) {
            hintEl.style.display = "none";
          }
        }, 300);
      }
    }, 3000);
  }
  hideVideoHint() {
    const hintEl = document.getElementById("videoHint");
    if (hintEl) {
      hintEl.style.display = "none";
    }
  }
addToQueue(song) {
  console.log('Adding song to queue:', song);
  this.songQueue.push({
    ...song,
    queueId: Date.now() + Math.random()
  });
  this.saveQueue();
  this.updateQueueVisualIndicators();
  this.updatePlayerUI();
  this.showQueueNotification(`Added "${song.name}" to queue`);
}
removeFromQueue(queueId) {
  console.log('Removing song from queue with ID:', queueId);
  const removedSong = this.songQueue.find(item => item.queueId == queueId);
  this.songQueue = this.songQueue.filter(item => item.queueId != queueId);
  this.saveQueue();
  this.updateQueueVisualIndicators();
  this.updatePlayerUI();
  if (removedSong) {
    this.showQueueNotification(`Removed "${removedSong.name}" from queue`);
  }
}
saveQueue() {
  sessionStorage.setItem('musicPlayerQueue', JSON.stringify(this.songQueue));
}
loadQueue() {
  const saved = sessionStorage.getItem('musicPlayerQueue');
  this.songQueue = saved ? JSON.parse(saved) : [];
  this.updateQueueVisualIndicators();
}
updateQueueVisualIndicators() {
  document.querySelectorAll('.queue-indicator').forEach(el => el.remove());
  this.songQueue.forEach((queueSong, index) => {
    const songElements = [
      ...document.querySelectorAll(`[data-video-id="${queueSong.videoId}"]`),
      ...document.querySelectorAll(`[onclick*="playSong(${queueSong.id})"]`),
      ...document.querySelectorAll(`[onclick*="'${queueSong.videoId}'"]`)
    ];
    songElements.forEach(element => {
      if (element.querySelector('.queue-indicator')) return;
      const indicator = document.createElement('span');
      indicator.className = 'queue-indicator';
      indicator.textContent = `${index + 1}`;
      indicator.style.cssText = `
        position: absolute;
        top: 2px;
        right: 2px;
        background: #ff6b6b;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      element.style.position = 'relative';
      element.appendChild(indicator);
    });
  });
}
showQueueNotification(message) {
  const existing = document.querySelector('.queue-notification');
  if (existing) existing.remove();
  const notification = document.createElement('div');
  notification.className = 'queue-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-color);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    z-index: 1000;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}
showQueueOverlay() {
  const existing = document.querySelector('.queue-overlay');
  if (existing) {
    existing.remove();
    return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'queue-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  const queuePanel = document.createElement('div');
  queuePanel.className = 'queue-panel';
  queuePanel.style.cssText = `
    background: var(--bg-secondary);
    border-radius: 10px;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 70vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  `;
  let queueContent = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; color: var(--text-primary);">Queue (${this.songQueue.length} songs)</h3>
      <button onclick="this.closest('.queue-overlay').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-primary);">&times;</button>
    </div>
  `;
  if (this.songQueue.length === 0) {
    queueContent += '<p style="color: var(--text-secondary); text-align: center; margin: 20px 0;">No songs in queue</p>';
  } else {
    queueContent += '<div class="queue-songs">';
    this.songQueue.forEach((song, index) => {
      queueContent += `
        <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid var(--border-color); color: var(--text-primary);">
          <span style="margin-right: 10px; font-weight: bold; color: var(--accent-color);">${index + 1}</span>
          <div style="flex: 1;">
            <div style="font-weight: bold;">${this.escapeHtml(song.name)}</div>
            ${song.author ? `<div style="font-size: 12px; color: var(--text-secondary);">${this.escapeHtml(song.author)}</div>` : ''}
          </div>
          <button data-queue-id="${song.queueId}" class="remove-queue-btn" style="background: #ff6b6b; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">Remove</button>
        </div>
      `;
    });
    queueContent += '</div>';
    queueContent += `
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button onclick="musicPlayer.clearQueue()" style="background: #ff6b6b; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; flex: 1;">Clear Queue</button>
        <button onclick="musicPlayer.shuffleQueue()" style="background: var(--accent-color); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; flex: 1;">Shuffle Queue</button>
      </div>
    `;
  }
  queuePanel.innerHTML = queueContent;
  overlay.appendChild(queuePanel);
  document.body.appendChild(overlay);
  queuePanel.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-queue-btn')) {
      const queueId = e.target.getAttribute('data-queue-id');
      console.log('Remove button clicked for queue ID:', queueId);
      this.removeFromQueue(queueId);
      overlay.remove();
      this.showQueueOverlay();
    }
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}
clearQueue() {
  this.songQueue = [];
  this.saveQueue();
  this.updateQueueVisualIndicators();
  this.updatePlayerUI();
  this.showQueueNotification('Queue cleared');
  const overlay = document.querySelector('.queue-overlay');
  if (overlay) {
    overlay.remove();
    this.showQueueOverlay();
  }
}
shuffleQueue() {
  for (let i = this.songQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [this.songQueue[i], this.songQueue[j]] = [this.songQueue[j], this.songQueue[i]];
  }
  this.saveQueue();
  this.updateQueueVisualIndicators();
  this.updatePlayerUI();
  this.showQueueNotification('Queue shuffled');
  const overlay = document.querySelector('.queue-overlay');
  if (overlay) {
    overlay.remove();
    this.showQueueOverlay();
  }
}
addQueueStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .queue-panel::-webkit-scrollbar {
      width: 8px;
    }
    .queue-panel::-webkit-scrollbar-track {
      background: var(--bg-primary);
      border-radius: 4px;
    }
    .queue-panel::-webkit-scrollbar-thumb {
      background: var(--accent-color);
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
}
createWebEmbedOverlay() {
  if (this.webEmbedOverlay) return;
  this.webEmbedOverlay = document.createElement('div');
  this.webEmbedOverlay.id = 'web-embed-overlay';
  this.webEmbedOverlay.tabIndex = 0;
  this.webEmbedOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 9999;
    display: none;
    outline: none;
  `;
  const exitBtn = document.createElement('button');
  exitBtn.innerHTML = '×';
  exitBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    z-index: 10000;
    font-weight: bold;
  `;
  this.webEmbedExitHandler = () => this.toggleWebEmbedOverlay();
  this.webEmbedKeyHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.toggleWebEmbedOverlay();
    }
    if (e.key.toLowerCase() === 'c' && e.shiftKey) {
      e.preventDefault();
      this.cycleWebEmbedSite();
    }
  };
  exitBtn.addEventListener('click', this.webEmbedExitHandler);
  const iframe = document.createElement('iframe');
  iframe.id = 'web-embed-iframe';
  iframe.src = this.webEmbedSites[this.currentWebEmbedIndex];
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  this.webEmbedOverlay.appendChild(iframe);
  this.webEmbedOverlay.appendChild(exitBtn);
  document.body.appendChild(this.webEmbedOverlay);
  this.webEmbedOverlay.addEventListener('keydown', this.webEmbedKeyHandler);
}
toggleWebEmbedOverlay() {
  this.createWebEmbedOverlay();
  this.isWebEmbedVisible = !this.isWebEmbedVisible;
  this.webEmbedOverlay.style.display = this.isWebEmbedVisible ? 'block' : 'none';
  if (this.isWebEmbedVisible) {
    this.webEmbedOverlay.focus();
  }
}
destroyWebEmbedOverlay() {
  if (this.webEmbedOverlay) {
    if (this.webEmbedKeyHandler) {
      this.webEmbedOverlay.removeEventListener('keydown', this.webEmbedKeyHandler);
    }
    const exitBtn = this.webEmbedOverlay.querySelector('button');
    if (exitBtn && this.webEmbedExitHandler) {
      exitBtn.removeEventListener('click', this.webEmbedExitHandler);
    }
    this.webEmbedOverlay.remove();
    this.webEmbedOverlay = null;
    this.webEmbedKeyHandler = null;
    this.webEmbedExitHandler = null;
    this.isWebEmbedVisible = false;
  }
}
cycleWebEmbedSite() {
  this.currentWebEmbedIndex = (this.currentWebEmbedIndex + 1) % this.webEmbedSites.length;
  if (this.webEmbedOverlay) {
    const iframe = document.getElementById('web-embed-iframe');
    if (iframe) {
      iframe.src = this.webEmbedSites[this.currentWebEmbedIndex];
    }
  }
}
  setSpecificTimeTimer(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);
  if (targetTime < now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  const timeDiff = targetTime - now;
  const minutesDiff = (timeDiff / 60000).toFixed(2);
  this.setAppTimer(parseFloat(minutesDiff), targetTime);
}
setAppTimer(minutes, specificEndTime = null) {
  this.clearAppTimer();
  const milliseconds = minutes * 60000;
  if (specificEndTime) {
    this.timerEndTime = specificEndTime;
  } else {
    this.timerEndTime = new Date(Date.now() + milliseconds);
  }
  const timerStatus = document.getElementById("timerStatus");
  if (specificEndTime) {
    const formattedTime = this.timerEndTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    timerStatus.textContent = `App will close at ${formattedTime} (in ${minutes.toFixed(
      2
    )} minutes)`;
    const timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.textContent = formattedTime;
    timerDisplay.style.display = "inline";
  } else {
    timerStatus.textContent = `App will close in ${minutes.toFixed(2)} minutes`;
    const timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.textContent = `${Math.floor(minutes)}m`;
    timerDisplay.style.display = "inline";
  }
  document.getElementById("cancelTimer").style.display = "inline-block";
  this.appTimer = setTimeout(() => {
    try {
      window.close();
      window.open("", "_self").close();
    } catch (e) {
      console.log("Standard window close failed:", e);
    }
    try {
      window.location.replace("about:blank");
    } catch (e) {
      console.log("Navigation redirect failed:", e);
    }
    document.body.innerHTML =
      '<div style="text-align: center; padding: 50px; background: #1a1a1a; color: #fff; position: fixed; top: 0; left: 0; right: 0; bottom: 0;"><h1>Session Ended</h1><p>Your music session has ended. The app has been closed.</p><button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #3498db; border: none; color: white; border-radius: 4px; cursor: pointer;">Restart App</button></div>';
    const scripts = document.getElementsByTagName("script");
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].parentNode) {
        scripts[i].parentNode.removeChild(scripts[i]);
      }
    }
  }, milliseconds);
  document.getElementById("timerModal").style.display = "none";
  this.updateTimerCountdown();
}
clearAppTimer() {
  if (this.appTimer) {
    clearTimeout(this.appTimer);
    this.appTimer = null;
    this.timerEndTime = null;
    const timerStatus = document.getElementById("timerStatus");
    timerStatus.textContent = "No timer set";
    document.getElementById("cancelTimer").style.display = "none";
    const timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.textContent = "";
    timerDisplay.style.display = "none";
  }
}
updateTimerCountdown() {
  if (this.timerEndTime) {
    const now = new Date();
    const timeLeft = this.timerEndTime - now;
    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      const timerStatus = document.getElementById("timerStatus");
      timerStatus.textContent = `App will close in ${minutes}m ${seconds}s`;
      const timerDisplay = document.getElementById("timerDisplay");
      if (minutes > 0) {
        timerDisplay.textContent = `${minutes}m ${seconds}s`;
      } else {
        timerDisplay.textContent = `${seconds}s`;
      }
      setTimeout(() => this.updateTimerCountdown(), 1000);
    }
  }
}
openTimerModal() {
  document.getElementById("timerModal").style.display = "flex";
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("specificTimeInput").value = `${hours}:${minutes}`;
}
adjustLayoutTogglePosition() {
  const playlistSidebar = document.getElementById("currentPlaylistSidebar");
  if (playlistSidebar.classList.contains("open")) {
    document.querySelector(".layout-toggle").style.left = "300px";
  } else {
    document.querySelector(".layout-toggle").style.left = "15px";
  }
}
setupTimerEventListeners() {
  document.getElementById("timerButton").addEventListener("click", () => {
    this.openTimerModal();
  });
  document.getElementById("closeTimerModal").addEventListener("click", () => {
    document.getElementById("timerModal").style.display = "none";
  });
  document.querySelectorAll(".timer-options button").forEach((button) => {
    button.addEventListener("click", () => {
      const minutes = parseFloat(button.getAttribute("data-time"));
      this.setAppTimer(minutes);
    });
  });
  document.getElementById("setCustomTimer").addEventListener("click", () => {
    const customMinutes = parseFloat(
      document.getElementById("customTimerInput").value
    );
    if (customMinutes > 0) {
      this.setAppTimer(customMinutes);
    }
  });
  document.getElementById("cancelTimer").addEventListener("click", () => {
    this.clearAppTimer();
  });
  document.getElementById("setSpecificTime").addEventListener("click", () => {
    const timeInput = document.getElementById("specificTimeInput").value;
    if (timeInput) {
      this.setSpecificTimeTimer(timeInput);
    }
  });
  window.addEventListener("click", (event) => {
    if (event.target === document.getElementById("timerModal")) {
      document.getElementById("timerModal").style.display = "none";
    }
  });
}
setupLayoutEventListeners() {
  const layoutToggleBtn = document.getElementById("layoutToggleBtn");
  const nowPlayingSection = document.querySelector(".now-playing");
  const playlistSidebar = document.getElementById("currentPlaylistSidebar");
  layoutToggleBtn.addEventListener("click", () => {
    nowPlayingSection.classList.remove(
      "controls-left",
      "controls-center",
      "controls-right"
    );
    if (this.currentLayout === "center") {
      this.currentLayout = "left";
      nowPlayingSection.classList.add("controls-left");
      layoutToggleBtn.title = "Controls aligned left";
    } else if (this.currentLayout === "left") {
      this.currentLayout = "right";
      nowPlayingSection.classList.add("controls-right");
      layoutToggleBtn.title = "Controls aligned right";
    } else {
      this.currentLayout = "center";
      nowPlayingSection.classList.add("controls-center");
      layoutToggleBtn.title = "Controls aligned center";
    }
  });
  const savedLayout = localStorage.getItem("controlsLayout");
  if (savedLayout) {
    this.currentLayout = savedLayout;
    nowPlayingSection.classList.add(`controls-${this.currentLayout}`);
  } else {
    nowPlayingSection.classList.add("controls-center");
  }
  const showPlaylistBtn = document.getElementById("showPlaylistBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  showPlaylistBtn.addEventListener("click", () => {
    setTimeout(() => this.adjustLayoutTogglePosition(), 10);
  });
  closeSidebarBtn.addEventListener("click", () => {
    setTimeout(() => this.adjustLayoutTogglePosition(), 10);
  });
  this.adjustLayoutTogglePosition();
}
initializeFullscreenLyrics() {
    this.elements.lyricsFullscreenModal = document.getElementById('lyricsFullscreenModal');
    this.elements.fullscreenSongName = document.getElementById('fullscreenSongName');
    this.elements.fullscreenSongAuthor = document.getElementById('fullscreenSongAuthor');
    this.elements.fullscreenLyricsDisplay = document.getElementById('fullscreenLyricsDisplay');
    this.elements.exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    this.elements.exitFullscreenBtn.addEventListener('click', () => this.exitLyricsFullscreen());
}
enterLyricsFullscreen() {
    if (!this.elements.lyricsFullscreenModal) {
        this.initializeFullscreenLyrics();
    }
    this.isLyricsFullscreen = true;
    this.elements.lyricsFullscreenModal.classList.add('active');
    const currentSong = this.currentPlaylist
        ? this.currentPlaylist.songs[this.currentSongIndex]
        : this.songLibrary[this.currentSongIndex];
    if (currentSong) {
        this.elements.fullscreenSongName.textContent = currentSong.name;
        this.elements.fullscreenSongAuthor.textContent = currentSong.author || 'Unknown Artist';
    }
    this.renderFullscreenLyrics();
    this.hideMainUIForLyrics();
}
exitLyricsFullscreen() {
    this.isLyricsFullscreen = false;
    this.elements.lyricsFullscreenModal.classList.remove('active');
    if (this.fullscreenLyricsInterval) {
        clearInterval(this.fullscreenLyricsInterval);
        this.fullscreenLyricsInterval = null;
    }
    this.currentFullscreenHighlightedLyricIndex = -1;
    this.showMainUIFromLyrics();
    if (this.isPlaying && document.getElementById("lyrics") && document.getElementById("lyrics").classList.contains("active")) {
        this.renderLyricsTab();
    }
}
hideMainUIForLyrics() {
    document.querySelector(".main-container").style.display = "none";
    document.querySelector(".theme-toggle").style.display = "none";
    document.querySelector(".listening-stats").style.display = "none";
    document.querySelector(".control-bar-toggle").style.display = "none";
    document.querySelector(".layout-toggle").style.display = "none";
    document.querySelector(".watermark").style.display = "none";
}
showMainUIFromLyrics() {
    document.querySelector(".main-container").style.display = "flex";
    document.querySelector(".theme-toggle").style.display = "flex";
    document.querySelector(".listening-stats").style.display = "flex";
    document.querySelector(".control-bar-toggle").style.display = "block";
    document.querySelector(".layout-toggle").style.display = "block";
    document.querySelector(".watermark").style.display = "block";
}
renderFullscreenLyrics() {
    if (!this.elements.fullscreenLyricsDisplay) return;
    const currentSong = this.currentPlaylist
        ? this.currentPlaylist.songs[this.currentSongIndex]
        : this.songLibrary[this.currentSongIndex];
    if (!currentSong) return;
    let songWithLyrics = currentSong;
    if (this.currentPlaylist) {
        const libraryMatch = this.songLibrary.find(
            (libSong) => libSong.videoId === currentSong.videoId
        );
        if (libraryMatch && libraryMatch.lyrics) {
            songWithLyrics = libraryMatch;
        }
    }
    if (!songWithLyrics.lyrics || songWithLyrics.lyrics.trim() === "") {
        this.elements.fullscreenLyricsDisplay.innerHTML = '<div class="no-lyrics-message">No lyrics available</div>';
        return;
    }
    this.elements.fullscreenLyricsDisplay.innerHTML = '';
    const lyricsArray = [];
    const timingsArray = [];
    const lines = songWithLyrics.lyrics
        .split("\n")
        .filter((line) => line.trim() !== "");
    for (const line of lines) {
        const match = line.match(/(.*)\s*\[(\d+):(\d+)\]/);
        if (match) {
            const lyric = match[1].trim();
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const timeInSeconds = minutes * 60 + seconds;
            lyricsArray.push(lyric);
            timingsArray.push(timeInSeconds);
        }
    }
    for (let i = 0; i < lyricsArray.length; i++) {
        const lineElement = document.createElement("div");
        lineElement.classList.add("lyric-line");
        lineElement.textContent = lyricsArray[i];
        lineElement.id = `fullscreen-lyric-${i}`;
        lineElement.style.padding = "8px 10px";
        lineElement.style.margin = "5px 0";
        lineElement.style.borderRadius = "3px";
        lineElement.style.transition = "all 0.3s ease";
        lineElement.style.color = "var(--text-secondary)";
        this.elements.fullscreenLyricsDisplay.appendChild(lineElement);
    }
    if (this.fullscreenLyricsInterval) {
        clearInterval(this.fullscreenLyricsInterval);
        this.fullscreenLyricsInterval = null;
    }
    this.currentFullscreenHighlightedLyricIndex = -1;
    if (this.ytPlayer && this.isPlaying && this.ytPlayer.getCurrentTime) {
        this.fullscreenLyricsInterval = setInterval(() => {
            if (this.ytPlayer && this.ytPlayer.getCurrentTime && this.isPlaying && this.isLyricsFullscreen) {
                try {
                    const currentTime = this.ytPlayer.getCurrentTime();
                    this.updateFullscreenHighlightedLyric(currentTime, lyricsArray, timingsArray);
                } catch (error) {
                    console.warn("Error updating fullscreen lyrics:", error);
                }
            }
        }, 100);
    }
}
updateFullscreenHighlightedLyric(currentTime, lyrics, timings) {
    if (!lyrics.length || !timings.length) return;
    let highlightIndex = -1;
    for (let i = 0; i < timings.length; i++) {
        if (currentTime >= timings[i]) {
            if (i === timings.length - 1 || currentTime < timings[i + 1]) {
                highlightIndex = i;
            }
        }
    }
    if (highlightIndex !== this.currentFullscreenHighlightedLyricIndex) {
        const allLines = this.elements.fullscreenLyricsDisplay.querySelectorAll(".lyric-line");
        allLines.forEach((line) => {
            line.classList.remove("active");
            line.style.backgroundColor = "";
            line.style.color = "var(--text-secondary)";
            line.style.fontWeight = "normal";
            line.style.fontSize = "";
            line.style.transform = "";
        });
        if (highlightIndex !== -1) {
            const currentElement = document.getElementById(`fullscreen-lyric-${highlightIndex}`);
            if (currentElement) {
                currentElement.classList.add("active");
                currentElement.style.backgroundColor = "var(--accent-color)";
                currentElement.style.color = "var(--text-primary)";
                currentElement.style.fontWeight = "bold";
                currentElement.style.fontSize = "1.1em";
                currentElement.style.transform = "scale(1.02)";
                currentElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
        this.currentFullscreenHighlightedLyricIndex = highlightIndex;
    }
}
  async loadVersion() {
    try {
        const response = await fetch('changelog.md');
        const text = await response.text();
        const lines = text.trim().split('\n').filter(line => line.trim());
        if (lines.length > 0) {
            const lastLine = lines[lines.length - 1];
            const versionMatch = lastLine.match(/v\d+\.\d+\.\d+/);
            if (versionMatch) {
                const versionDisplay = document.getElementById('versionDisplay');
                const versionText = document.getElementById('versionText');
                if (versionDisplay && versionText) {
                    versionText.textContent = versionMatch[0];
                    const changeText = lastLine.replace(/v\d+\.\d+\.\d+/, '').replace(/^\*\s*/, '').trim();
                    versionDisplay.title = `Latest: ${changeText}`;
                    this.fullChangelog = text;
                    versionDisplay.addEventListener('click', () => {
                        this.showChangelogModal();
                    });
                }
            }
        }
    } catch (error) {
        console.warn('Could not load version:', error);
    }
}
showChangelogModal() {
    const modal = document.getElementById('changelogModal');
    const content = document.getElementById('changelogContent');
    if (modal && content && this.fullChangelog) {
        const lines = this.fullChangelog.trim().split('\n').filter(line => line.trim());
        const htmlContent = lines.map(line => {
            const versionMatch = line.match(/(v\d+\.\d+\.\d+)/);
            if (versionMatch) {
                const version = versionMatch[1];
                const change = line.replace(/^\*\s*/, '').replace(version, '').trim();
                return `<li><span class="changelog-version">${version}</span> - ${change}</li>`;
            }
            return `<li>${line.replace(/^\*\s*/, '')}</li>`;
        }).join('');
        content.innerHTML = `<ul>${htmlContent}</ul>`;
        modal.style.display = 'block';
    }
}
setupChangelogModal() {
    const modal = document.getElementById('changelogModal');
    const closeBtn = document.querySelector('.changelog-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}






















  

// Update your existing handleOpenSettings method to include setupCollapsibleSections
handleOpenSettings() {
    this.elements.settingsModal.style.display = "block";
    document.body.style.overflow = "hidden";
    this.initializeSettingsContent();
}
handleCloseSettings() {
    this.elements.settingsModal.style.display = "none";
    document.body.style.overflow = "auto";
}
handleSettingsModalClick(event) {
    if (event.target === this.elements.settingsModal) {
        this.handleCloseSettings();
    }
}
initializeSettingsContent() {
    this.loadThemeMode();
    this.loadCustomThemeColors();
    this.loadAdvertisementSettingsInModal(); 
    this.setupTabs();
    this.loadDiscoverMoreSettings();
    console.log("Settings modal opened - all settings loaded");
}

loadAdvertisementSettingsInModal() {
    if (this.elements.adsToggle) {
        this.elements.adsToggle.checked = this.adsEnabled;
    }
}
loadThemeMode() {
  if (!this.db) return;
  const transaction = this.db.transaction(["settings"], "readonly");
  const store = transaction.objectStore("settings");
  const request = store.get("themeMode");
  request.onsuccess = () => {
    const savedMode = request.result ? request.result.value : "dark";
    this.elements.themeMode.value = savedMode;
    this.elements.customThemeSection.style.display = savedMode === "custom" ? "block" : "none";
  };
}
initializeTheme() {
  if (!this.db) {
    document.documentElement.setAttribute("data-theme", "dark");
    this.updateThemeIcon("dark");
    return;
  }
  const transaction = this.db.transaction(["settings"], "readonly");
  const store = transaction.objectStore("settings");
  const request = store.get("themeMode"); 
  request.onsuccess = () => {
    const savedTheme = request.result ? request.result.value : "dark";
    if (savedTheme === "custom") {
      this.loadCustomTheme();
    } else {
      document.documentElement.setAttribute("data-theme", savedTheme);
      this.updateThemeIcon(savedTheme);
    }
  };
  request.onerror = (event) => {
    console.error("Error loading theme setting:", event.target.error);
    document.documentElement.setAttribute("data-theme", "dark");
    this.updateThemeIcon("dark");
  };
}
handleSaveCustomTheme() {
    const shadowColor = this.elements.shadowColorPicker.value;
    const shadowOpacity = this.elements.shadowOpacity.value;
    const shadowRgba = this.hexToRgba(shadowColor, shadowOpacity);
    const customColors = {
        primary: this.elements.primaryColorPicker.value,
        background: this.elements.backgroundColorPicker.value,
        secondary: this.elements.secondaryColorPicker?.value || '#334155',
        textPrimary: this.elements.textPrimaryColorPicker?.value || '#e2e8f0',
        textSecondary: this.elements.textSecondaryColorPicker?.value || '#94a3b8',
        hover: this.elements.hoverColorPicker?.value || '#2563eb',
        border: this.elements.borderColorPicker?.value || '#475569',
        accent: this.elements.accentColorPicker?.value || this.elements.primaryColorPicker.value,
        buttonText: this.elements.buttonTextColorPicker?.value || '#ffffff',
        shadow: shadowRgba,
        error: this.elements.errorColorPicker?.value || '#dc3545',
        errorHover: this.elements.errorHoverColorPicker?.value || '#c82333',
        youtubeRed: this.elements.youtubeRedColorPicker?.value || '#FF0000'
    };
    this.applyCustomColors(customColors);
    document.documentElement.setAttribute("data-theme", "custom");
    const savePromises = [
        this.saveSetting("customPrimary", customColors.primary),
        this.saveSetting("customBackground", customColors.background),
        this.saveSetting("customSecondary", customColors.secondary),
        this.saveSetting("customTextPrimary", customColors.textPrimary),
        this.saveSetting("customTextSecondary", customColors.textSecondary),
        this.saveSetting("customHover", customColors.hover),
        this.saveSetting("customBorder", customColors.border),
        this.saveSetting("customAccent", customColors.accent),
        this.saveSetting("customButtonText", customColors.buttonText),
        this.saveSetting("customShadow", customColors.shadow),
        this.saveSetting("customError", customColors.error),
        this.saveSetting("customErrorHover", customColors.errorHover),
        this.saveSetting("customYoutubeRed", customColors.youtubeRed),
        this.saveSetting("themeMode", "custom")
    ];
    Promise.all(savePromises).then(() => {
        console.log("Custom theme saved successfully");
        this.showNotification("Custom theme saved!", "success");
    }).catch((error) => {
        console.error("Error saving custom theme:", error);
        this.showNotification("Error saving theme", "error");
    });
}
applyCustomColors(colors) {
    document.documentElement.style.setProperty('--custom-primary', colors.primary);
    document.documentElement.style.setProperty('--custom-background', colors.background);
    document.documentElement.style.setProperty('--custom-secondary', colors.secondary);
    document.documentElement.style.setProperty('--custom-text-primary', colors.textPrimary);
    document.documentElement.style.setProperty('--custom-text-secondary', colors.textSecondary);
    document.documentElement.style.setProperty('--custom-hover', colors.hover);
    document.documentElement.style.setProperty('--custom-border', colors.border);
    document.documentElement.style.setProperty('--custom-accent', colors.accent);
    document.documentElement.style.setProperty('--custom-button-text', colors.buttonText);
    document.documentElement.style.setProperty('--custom-shadow', colors.shadow);
    document.documentElement.style.setProperty('--custom-error', colors.error);
    document.documentElement.style.setProperty('--custom-error-hover', colors.errorHover);
    document.documentElement.style.setProperty('--custom-youtube-red', colors.youtubeRed);
}
loadCustomTheme() {
  const transaction = this.db.transaction(["settings"], "readonly");
  const store = transaction.objectStore("settings");
  const colorKeys = [
    'customPrimary', 'customBackground', 'customSecondary',
    'customTextPrimary', 'customTextSecondary', 'customHover',
    'customBorder', 'customAccent', 'customButtonText',
    'customShadow', 'customError', 'customErrorHover', 'customYoutubeRed'
];
  const requests = colorKeys.map(key => {
    const request = store.get(key);
    return new Promise(resolve => {
      request.onsuccess = () => resolve({
        key: key,
        value: request.result?.value
      });
    });
  });
  Promise.all(requests).then((results) => {
    const colors = {};
    const defaults = {
      customPrimary: '#3b82f6',
      customBackground: '#1e293b',
      customSecondary: '#334155',
      customTextPrimary: '#e2e8f0',
      customTextSecondary: '#94a3b8',
      customHover: '#2563eb',
      customBorder: '#475569',
      customAccent: '#3b82f6'
    };
    results.forEach(result => {
      colors[result.key] = result.value || defaults[result.key];
    });
    this.applyCustomColors({
      primary: colors.customPrimary,
      background: colors.customBackground,
      secondary: colors.customSecondary,
      textPrimary: colors.customTextPrimary,
      textSecondary: colors.customTextSecondary,
      hover: colors.customHover,
      border: colors.customBorder,
      accent: colors.customAccent
    });
    this.updateColorPickerValues(colors);
    document.documentElement.setAttribute("data-theme", "custom");
    this.updateThemeIcon("custom");
  });
}
loadCustomThemeColors() {
  if (!this.db) return;
  const transaction = this.db.transaction(["settings"], "readonly");
  const store = transaction.objectStore("settings");
  const colorKeys = [
    'customPrimary', 'customBackground', 'customSecondary',
    'customTextPrimary', 'customTextSecondary', 'customHover',
    'customBorder', 'customAccent', 'customButtonText',
    'customShadow', 'customError', 'customErrorHover', 'customYoutubeRed'
];
  colorKeys.forEach(key => {
    const request = store.get(key);
    request.onsuccess = () => {
      if (request.result?.value) {
        this.updateColorPickerByKey(key, request.result.value);
      }
    };
  });
}
updateColorPickerByKey(key, value) {
  const pickerMap = {
    customPrimary: 'primaryColorPicker',
    customBackground: 'backgroundColorPicker',
    customSecondary: 'secondaryColorPicker',
    customTextPrimary: 'textPrimaryColorPicker',
    customTextSecondary: 'textSecondaryColorPicker',
    customHover: 'hoverColorPicker',
    customBorder: 'borderColorPicker',
    customAccent: 'accentColorPicker'
  };
  const elementKey = pickerMap[key];
  if (this.elements[elementKey]) {
    this.elements[elementKey].value = value;
  }
}
updateColorPickerValues(colors) {
  const pickerMap = {
    primaryColorPicker: colors.customPrimary,
    backgroundColorPicker: colors.customBackground,
    secondaryColorPicker: colors.customSecondary,
    textPrimaryColorPicker: colors.customTextPrimary,
    textSecondaryColorPicker: colors.customTextSecondary,
    hoverColorPicker: colors.customHover,
    borderColorPicker: colors.customBorder,
    accentColorPicker: colors.customAccent
  };
  Object.entries(pickerMap).forEach(([picker, value]) => {
    if (this.elements[picker]) {
      this.elements[picker].value = value;
    }
  });
}
handleColorChange(colorType, value) {
  const cssVarMap = {
    primary: '--custom-primary',
    background: '--custom-background',
    secondary: '--custom-secondary',
    textPrimary: '--custom-text-primary',
    textSecondary: '--custom-text-secondary',
    hover: '--custom-hover',
    border: '--custom-border',
    accent: '--custom-accent'
  };
  if (cssVarMap[colorType]) {
    document.documentElement.style.setProperty(cssVarMap[colorType], value);
  }
}
resetCustomTheme() {
  const defaultColors = {
    primary: '#3b82f6',
    background: '#1e293b',
    secondary: '#334155',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    hover: '#2563eb',
    border: '#475569',
    accent: '#3b82f6'
  };
  this.applyCustomColors(defaultColors);
  this.updateColorPickerValues({
    customPrimary: defaultColors.primary,
    customBackground: defaultColors.background,
    customSecondary: defaultColors.secondary,
    customTextPrimary: defaultColors.textPrimary,
    customTextSecondary: defaultColors.textSecondary,
    customHover: defaultColors.hover,
    customBorder: defaultColors.border,
    customAccent: defaultColors.accent
  });
}
handleThemeModeChange(event) {
  const mode = event.target.value;
  this.elements.customThemeSection.style.display = mode === "custom" ? "block" : "none";
  if (mode !== "custom") {
    document.documentElement.setAttribute("data-theme", mode);
    this.updateThemeIcon(mode);
    this.saveSetting("themeMode", mode);
  } else {
    this.loadCustomTheme();
  }
}
toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  let newTheme;
  switch (currentTheme) {
    case "light":
      newTheme = "dark";
      break;
    case "dark":
      newTheme = "custom";
      break;
    case "custom":
    default:
      newTheme = "light";
      break;
  }
  if (newTheme === "custom") {
    this.loadCustomTheme();
  } else {
    document.documentElement.setAttribute("data-theme", newTheme);
    this.updateThemeIcon(newTheme);
  }
  this.saveSetting("themeMode", newTheme).catch((error) => {
    console.error("Error saving theme:", error);
    document.documentElement.setAttribute("data-theme", currentTheme);
    this.updateThemeIcon(currentTheme);
  });
  if (this.elements.themeMode) {
    this.elements.themeMode.value = newTheme;
    this.elements.customThemeSection.style.display = newTheme === "custom" ? "block" : "none";
  }
}
updateThemeIcon(theme) {
  const icon = this.elements.themeToggle.querySelector("i");
  icon.classList.remove("fa-moon", "fa-sun", "fa-palette");
  if (theme === "custom") {
    icon.classList.add("fa-palette");
  } else {
    icon.classList.add(theme === "light" ? "fa-moon" : "fa-sun");
  }
}
showNotification(message, type = "info") {
  console.log(`${type.toUpperCase()}: ${message}`);
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    border-radius: 4px;
    color: white;
    background-color: ${type === 'success' ? 'var(--accent-color)' : '#f44336'};
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.style.opacity = '1', 10);
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}
exportTheme() {
    const themeData = {
        primary: this.elements.primaryColorPicker.value,
        background: this.elements.backgroundColorPicker.value,
        secondary: this.elements.secondaryColorPicker.value,
        textPrimary: this.elements.textPrimaryColorPicker.value,
        textSecondary: this.elements.textSecondaryColorPicker.value,
        hover: this.elements.hoverColorPicker.value,
        border: this.elements.borderColorPicker.value,
        accent: this.elements.accentColorPicker.value,
        buttonText: this.elements.buttonTextColorPicker.value,
        shadow: this.elements.shadowColorPicker.value,
        shadowOpacity: this.elements.shadowOpacity.value,
        error: this.elements.errorColorPicker.value,
        errorHover: this.elements.errorHoverColorPicker.value,
        youtubeRed: this.elements.youtubeRedColorPicker.value
    };
    const themeString = JSON.stringify(themeData, null, 2);
    navigator.clipboard.writeText(themeString).then(() => {
        this.showNotification("Theme exported to clipboard!", "success");
    }).catch(err => {
        console.error('Failed to copy theme: ', err);
        this.showNotification("Failed to copy theme", "error");
    });
}
importTheme() {
    const themeText = this.elements.themeImportText.value.trim();
    if (!themeText) {
        this.showNotification("Please paste a theme code first", "error");
        return;
    }
    try {
        const themeData = JSON.parse(themeText);
        this.applyImportedTheme(themeData);
        this.showNotification("Theme imported successfully!", "success");
        this.elements.themeImportText.value = '';
    } catch (error) {
        console.error('Failed to parse theme:', error);
        this.showNotification("Invalid theme format", "error");
    }
}
applyImportedTheme(themeData) {
    if (themeData.primary) this.elements.primaryColorPicker.value = themeData.primary;
    if (themeData.background) this.elements.backgroundColorPicker.value = themeData.background;
    if (themeData.secondary) this.elements.secondaryColorPicker.value = themeData.secondary;
    if (themeData.textPrimary) this.elements.textPrimaryColorPicker.value = themeData.textPrimary;
    if (themeData.textSecondary) this.elements.textSecondaryColorPicker.value = themeData.textSecondary;
    if (themeData.hover) this.elements.hoverColorPicker.value = themeData.hover;
    if (themeData.border) this.elements.borderColorPicker.value = themeData.border;
    if (themeData.accent) this.elements.accentColorPicker.value = themeData.accent;
    if (themeData.buttonText) this.elements.buttonTextColorPicker.value = themeData.buttonText;
    if (themeData.shadow) this.elements.shadowColorPicker.value = themeData.shadow;
    if (themeData.shadowOpacity) this.elements.shadowOpacity.value = themeData.shadowOpacity;
    if (themeData.error) this.elements.errorColorPicker.value = themeData.error;
    if (themeData.errorHover) this.elements.errorHoverColorPicker.value = themeData.errorHover;
    if (themeData.youtubeRed) this.elements.youtubeRedColorPicker.value = themeData.youtubeRed;
    this.handleSaveCustomTheme();
}
hexToRgba(hex, opacity) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return `rgba(0, 0, 0, ${opacity})`;
}
async loadAdvertisementSettings() {
    try {
        if (!this.db || !this.db.objectStoreNames.contains("settings")) {
            console.log("Settings store not found, using default advertisement settings");
            this.adsEnabled = false;
            this.updateAdvertisementDisplay();
            return;
        }
        const transaction = this.db.transaction(["settings"], "readonly");
        const store = transaction.objectStore("settings");
        const request = store.get("advertisementEnabled");
        return new Promise((resolve) => {
            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result && typeof result.value !== 'undefined') {
                    this.adsEnabled = result.value;
                } else {
                    this.adsEnabled = false; 
                }
                this.updateAdvertisementDisplay();
                resolve();
            };
            request.onerror = () => {
                console.log("Error reading advertisement settings, using default");
                this.adsEnabled = false;
                this.updateAdvertisementDisplay();
                resolve();
            };
        });
    } catch (error) {
        console.error("Error loading advertisement settings:", error);
        this.adsEnabled = false;
        this.updateAdvertisementDisplay();
    }
}
async saveAdvertisementSettings() {
    try {
        if (!this.db) {
            console.error("Database not available for saving advertisement settings");
            return;
        }
        if (!this.db.objectStoreNames.contains("settings")) {
            console.error("Settings store doesn't exist");
            return;
        }
        const transaction = this.db.transaction(["settings"], "readwrite");
        const store = transaction.objectStore("settings");
        const settingsData = {
            name: "advertisementEnabled",
            value: this.adsEnabled,
            lastUpdated: new Date().toISOString()
        };
        const request = store.put(settingsData);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log("Advertisement settings saved successfully:", this.adsEnabled);
                resolve();
            };
            request.onerror = (event) => {
                console.error("Error saving advertisement settings:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in saveAdvertisementSettings:", error);
    }
}
handleAdsToggle(event) {
    this.adsEnabled = event.target.checked;
    this.updateAdvertisementDisplay();
    this.saveAdvertisementSettings();
    console.log(`Advertisements ${this.adsEnabled ? 'enabled' : 'disabled'}`);
}
updateAdvertisementDisplay() {
    if (this.adsEnabled) {
        document.body.classList.add('ads-enabled');
    } else {
        document.body.classList.remove('ads-enabled');
    }
    if (this.elements.adsToggle) {
        this.elements.adsToggle.checked = this.adsEnabled;
    }
    if (this.adsEnabled) {
        this.refreshAdvertisements();
    }
}
refreshAdvertisements() {
    const adFrames = document.querySelectorAll('.left-banner iframe, .right-banner iframe');
    adFrames.forEach(frame => {
        const src = frame.src;
        frame.src = '';
        setTimeout(() => {
            frame.src = src;
        }, 100);
    });
}
initializeAdvertisementSettings() {
    this.loadAdvertisementSettings().catch(error => {
        console.error("Failed to load advertisement settings:", error);
        this.adsEnabled = false;
        this.updateAdvertisementDisplay();
    });
}
  loadVisualizerSettings() {
    if (!this.db) return;
    
    const transaction = this.db.transaction(["settings"], "readonly");
    const store = transaction.objectStore("settings");
    const request = store.get("visualizerEnabled");
    
    request.onsuccess = () => {
        const enabled = request.result ? request.result.value : true; // default to true
        if (this.elements.visualizerToggle) {
            this.elements.visualizerToggle.checked = enabled;
        }
        
        // Apply the setting
        if (enabled) {
            document.getElementById('musicVisualizer').style.display = 'block';
            this.visualizer.isActive = true;
        } else {
            document.getElementById('musicVisualizer').style.display = 'none';
            this.visualizer.isActive = false;
        }
    };
}





















setupTabs() {
    // Set first tab as active by default
    const firstTab = document.querySelector('.settings-tab-btn');
    const firstPanel = document.querySelector('.tab-panel');
    
    if (firstTab && firstPanel) {
        firstTab.classList.add('active');
        firstPanel.classList.add('active');
    }
}
handleTabSwitch(event) {
    const targetTab = event.target.closest('.settings-tab-btn').dataset.tab;
    
    // Remove active class from all tabs and panels
    document.querySelectorAll('.settings-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding panel
    event.target.closest('.settings-tab-btn').classList.add('active');
    document.getElementById(targetTab + 'Panel').classList.add('active');
}

// Add visualizer toggle handler
handleVisualizerToggle(event) {
    const isEnabled = event.target.checked;
    
    if (isEnabled) {
        this.visualizer.isActive = true;
        document.getElementById('musicVisualizer').style.display = 'block';
        if (!this.visualizer.animationId) {
            this.startVisualizer();
        }
    } else {
        this.visualizer.isActive = false;
        document.getElementById('musicVisualizer').style.display = 'none';
        if (this.visualizer.animationId) {
            cancelAnimationFrame(this.visualizer.animationId);
            this.visualizer.animationId = null;
        }
    }
    
    this.saveSetting("visualizerEnabled", isEnabled);
}

handleSectionToggle(event) {
    const header = event.currentTarget;
    const sectionType = header.dataset.section;
    const content = document.getElementById(`${sectionType}Content`);
    const arrow = header.querySelector('.section-arrow');
    
    if (!content || !arrow) {
        console.error(`Section content or arrow not found for: ${sectionType}`);
        return;
    }
    
    // Toggle the section
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse the section
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
    } else {
        // Expand the section
        content.classList.add('expanded');
        arrow.classList.add('rotated');
    }
    
    console.log(`Section ${sectionType} ${isExpanded ? 'collapsed' : 'expanded'}`);
}

// Optional: Method to expand a specific section programmatically
expandSection(sectionType) {
    const content = document.getElementById(`${sectionType}Content`);
    const header = document.querySelector(`[data-section="${sectionType}"]`);
    const arrow = header?.querySelector('.section-arrow');
    
    if (content && arrow) {
        content.classList.add('expanded');
        arrow.classList.add('rotated');
    }
}

// Optional: Method to collapse a specific section programmatically
collapseSection(sectionType) {
    const content = document.getElementById(`${sectionType}Content`);
    const header = document.querySelector(`[data-section="${sectionType}"]`);
    const arrow = header?.querySelector('.section-arrow');
    
    if (content && arrow) {
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
    }
}

// Optional: Method to collapse all sections
collapseAllSections() {
    const sectionTypes = ['feedback', 'advertisement', 'theme'];
    sectionTypes.forEach(sectionType => {
        this.collapseSection(sectionType);
    });
}
  async loadDiscoverMoreSettings() {
    try {
        // The values are already loaded on startup, just sync with DOM elements
        if (this.elements.recentlyPlayedStorageLimit) {
            this.elements.recentlyPlayedStorageLimit.value = this.recentlyPlayedLimit || 20;
        }
        if (this.elements.recentlyPlayedDisplayLimit) {
            this.elements.recentlyPlayedDisplayLimit.value = this.recentlyPlayedDisplayLimit || 3;
        }
        if (this.elements.suggestedSongsDisplayLimit) {
            this.elements.suggestedSongsDisplayLimit.value = this.suggestedSongsDisplayLimit || 2;
        }
        if (this.elements.yourPicksDisplayLimit) {
            this.elements.yourPicksDisplayLimit.value = this.yourPicksDisplayLimit || 2;
        }
        if (this.elements.recentlyPlayedPlaylistsLimit) {
            this.elements.recentlyPlayedPlaylistsLimit.value = this.recentlyPlayedPlaylistsDisplayLimit || 1;
        }

        console.log("Discover More settings synced with DOM elements");
        
    } catch (error) {
        console.error("Error syncing discover more settings with DOM:", error);
        this.setDefaultDiscoverMoreValues(); // Fallback to the original method with DOM
    }
}
  setDefaultDiscoverMoreValues() {
    this.recentlyPlayedLimit = this.recentlyPlayedLimit || 20;
    this.recentlyPlayedDisplayLimit = 3;
    this.suggestedSongsDisplayLimit = 2;
    this.yourPicksDisplayLimit = 2;
    this.recentlyPlayedPlaylistsDisplayLimit = 1;

    if (this.elements.recentlyPlayedStorageLimit) {
        this.elements.recentlyPlayedStorageLimit.value = this.recentlyPlayedLimit;
    }
    if (this.elements.recentlyPlayedDisplayLimit) {
        this.elements.recentlyPlayedDisplayLimit.value = this.recentlyPlayedDisplayLimit;
    }
    if (this.elements.suggestedSongsDisplayLimit) {
        this.elements.suggestedSongsDisplayLimit.value = this.suggestedSongsDisplayLimit;
    }
    if (this.elements.yourPicksDisplayLimit) {
        this.elements.yourPicksDisplayLimit.value = this.yourPicksDisplayLimit;
    }
    if (this.elements.recentlyPlayedPlaylistsLimit) {
        this.elements.recentlyPlayedPlaylistsLimit.value = this.recentlyPlayedPlaylistsDisplayLimit;
    }
}
setDefaultDiscoverMoreValuesOnStartup() {
    this.recentlyPlayedLimit = this.recentlyPlayedLimit || 20;
    this.recentlyPlayedDisplayLimit = 3;
    this.suggestedSongsDisplayLimit = 2;
    this.yourPicksDisplayLimit = 2;
    this.recentlyPlayedPlaylistsDisplayLimit = 1;
}
// Handle saving Discover More settings
async handleSaveDiscoverMoreSettings() {
    try {
        // Get values from inputs
        const recentlyPlayedStorageLimit = parseInt(this.elements.recentlyPlayedStorageLimit?.value) || 20;
        const recentlyPlayedDisplayLimit = parseInt(this.elements.recentlyPlayedDisplayLimit?.value) || 3;
        const suggestedSongsDisplayLimit = parseInt(this.elements.suggestedSongsDisplayLimit?.value) || 2;
        const yourPicksDisplayLimit = parseInt(this.elements.yourPicksDisplayLimit?.value) || 2;
        const recentlyPlayedPlaylistsDisplayLimit = parseInt(this.elements.recentlyPlayedPlaylistsLimit?.value) || 1;

        // Validate values
        if (recentlyPlayedStorageLimit < 1 || recentlyPlayedStorageLimit > 100) {
            this.showNotification("Recently played storage limit must be between 1 and 100", "error");
            return;
        }
        
        if (recentlyPlayedDisplayLimit < 1 || recentlyPlayedDisplayLimit > 10) {
            this.showNotification("Recently played display limit must be between 1 and 10", "error");
            return;
        }

        if (suggestedSongsDisplayLimit < 1 || suggestedSongsDisplayLimit > 10) {
            this.showNotification("Suggested songs display limit must be between 1 and 10", "error");
            return;
        }

        if (yourPicksDisplayLimit < 1 || yourPicksDisplayLimit > 10) {
            this.showNotification("Your picks display limit must be between 1 and 10", "error");
            return;
        }

        if (recentlyPlayedPlaylistsDisplayLimit < 1 || recentlyPlayedPlaylistsDisplayLimit > 5) {
            this.showNotification("Recently played playlists limit must be between 1 and 5", "error");
            return;
        }

        // Update instance variables
        const oldRecentlyPlayedLimit = this.recentlyPlayedLimit;
        this.recentlyPlayedLimit = recentlyPlayedStorageLimit;
        this.recentlyPlayedDisplayLimit = recentlyPlayedDisplayLimit;
        this.suggestedSongsDisplayLimit = suggestedSongsDisplayLimit;
        this.yourPicksDisplayLimit = yourPicksDisplayLimit;
        this.recentlyPlayedPlaylistsDisplayLimit = recentlyPlayedPlaylistsDisplayLimit;

        // Save to database
        const savePromises = [
            this.saveSetting("recentlyPlayedLimit", recentlyPlayedStorageLimit),
            this.saveSetting("recentlyPlayedDisplayLimit", recentlyPlayedDisplayLimit),
            this.saveSetting("suggestedSongsDisplayLimit", suggestedSongsDisplayLimit),
            this.saveSetting("yourPicksDisplayLimit", yourPicksDisplayLimit),
            this.saveSetting("recentlyPlayedPlaylistsDisplayLimit", recentlyPlayedPlaylistsDisplayLimit)
        ];

        await Promise.all(savePromises);

        // If recently played storage limit changed, trim the stored songs
        if (oldRecentlyPlayedLimit !== recentlyPlayedStorageLimit && this.recentlyPlayedSongs.length > recentlyPlayedStorageLimit) {
            this.recentlyPlayedSongs = this.recentlyPlayedSongs.slice(0, recentlyPlayedStorageLimit);
            
            if (this.db) {
                const transaction = this.db.transaction(["recentlyPlayed"], "readwrite");
                const store = transaction.objectStore("recentlyPlayed");
                store.put({
                    type: "songs",
                    items: this.recentlyPlayedSongs,
                });
            }
        }

        // Refresh the Discover More section to reflect new limits
        this.renderAdditionalDetails();

        this.showNotification("Discover More settings saved successfully!", "success");
        console.log("Discover More settings saved successfully");

    } catch (error) {
        console.error("Error saving Discover More settings:", error);
        this.showNotification("Error saving Discover More settings", "error");
    }
}

  async loadDiscoverMoreSettingsOnStartup() {
    try {
        if (!this.db || !this.db.objectStoreNames.contains("settings")) {
            console.log("Settings store not found, using default discover more settings");
            this.setDefaultDiscoverMoreValuesOnStartup();
            return;
        }

        const transaction = this.db.transaction(["settings"], "readonly");
        const store = transaction.objectStore("settings");
        
        const settingKeys = [
            "recentlyPlayedLimit",
            "recentlyPlayedDisplayLimit", 
            "suggestedSongsDisplayLimit",
            "yourPicksDisplayLimit",
            "recentlyPlayedPlaylistsDisplayLimit"
        ];

        const requests = settingKeys.map(key => {
            const request = store.get(key);
            return new Promise(resolve => {
                request.onsuccess = () => resolve({
                    key: key,
                    value: request.result?.value
                });
                request.onerror = () => resolve({
                    key: key,
                    value: null
                });
            });
        });

        const results = await Promise.all(requests);
        
        // Set values from database or defaults (without DOM manipulation)
        results.forEach(result => {
            switch(result.key) {
                case "recentlyPlayedLimit":
                    this.recentlyPlayedLimit = result.value || 20;
                    break;
                case "recentlyPlayedDisplayLimit":
                    this.recentlyPlayedDisplayLimit = result.value || 3;
                    break;
                case "suggestedSongsDisplayLimit":
                    this.suggestedSongsDisplayLimit = result.value || 2;
                    break;
                case "yourPicksDisplayLimit":
                    this.yourPicksDisplayLimit = result.value || 2;
                    break;
                case "recentlyPlayedPlaylistsDisplayLimit":
                    this.recentlyPlayedPlaylistsDisplayLimit = result.value || 1;
                    break;
            }
        });

        console.log("Discover More settings loaded on startup:", {
            recentlyPlayedLimit: this.recentlyPlayedLimit,
            recentlyPlayedDisplayLimit: this.recentlyPlayedDisplayLimit,
            suggestedSongsDisplayLimit: this.suggestedSongsDisplayLimit,
            yourPicksDisplayLimit: this.yourPicksDisplayLimit,
            recentlyPlayedPlaylistsDisplayLimit: this.recentlyPlayedPlaylistsDisplayLimit
        });
        
    } catch (error) {
        console.error("Error loading discover more settings on startup:", error);
        this.setDefaultDiscoverMoreValuesOnStartup();
    }
}
















 // Add these three methods to your AdvancedMusicPlayer class

openImportSubtitlesModal(songId) {
  const song = this.songLibrary.find((s) => s.id === songId);
  if (!song) return;

  // Create modal
  const modal = document.createElement("div");
  modal.classList.add("modal", "subtitles-import-modal");
  modal.style.display = "flex";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.8)";
  modal.style.zIndex = "1000";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  // Modal content
  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.style.backgroundColor = "var(--bg-secondary)";
  modalContent.style.color = "var(--text-primary)";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "8px";
  modalContent.style.width = "90%";
  modalContent.style.maxWidth = "800px";
  modalContent.style.maxHeight = "90vh";
  modalContent.style.overflowY = "auto";
  modalContent.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
  modalContent.style.position = "relative";

  // Header
  const headerContainer = document.createElement("div");
  headerContainer.style.position = "sticky";
  headerContainer.style.top = "0";
  headerContainer.style.backgroundColor = "var(--bg-secondary)";
  headerContainer.style.paddingBottom = "15px";
  headerContainer.style.marginBottom = "15px";
  headerContainer.style.borderBottom = "2px solid var(--accent-color)";
  headerContainer.style.display = "flex";
  headerContainer.style.justifyContent = "space-between";
  headerContainer.style.alignItems = "center";

  const header = document.createElement("h2");
  header.textContent = `Import Subtitles for: ${song.name}`;
  header.style.margin = "0";
  header.style.color = "var(--accent-color)";
  header.style.fontSize = "1.4em";

  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.fontSize = "28px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.color = "var(--text-primary)";
  closeBtn.style.lineHeight = "28px";
  closeBtn.style.transition = "color 0.2s";
  closeBtn.addEventListener("mouseover", () => {
    closeBtn.style.color = "var(--accent-color)";
  });
  closeBtn.addEventListener("mouseout", () => {
    closeBtn.style.color = "var(--text-primary)";
  });
  closeBtn.onclick = () => modal.remove();

  headerContainer.appendChild(header);
  headerContainer.appendChild(closeBtn);

  // Instructions and YouTube link
  const instructionsContainer = document.createElement("div");
  instructionsContainer.style.marginBottom = "20px";

  const instructions = document.createElement("div");
  instructions.style.padding = "15px";
  instructions.style.backgroundColor = "var(--bg-primary)";
  instructions.style.borderRadius = "5px";
  instructions.style.border = "1px solid var(--border-color)";
  instructions.style.marginBottom = "10px";
  instructions.innerHTML = `
    <p style="margin: 0 0 10px 0; font-weight: bold; color: var(--accent-color);">Instructions:</p>
    <p style="margin: 0 0 5px 0;">1. Click "Open YouTube Video" button below</p>
    <p style="margin: 0 0 5px 0;">2. Click the "..." menu → "Show transcript"</p>
    <p style="margin: 0 0 5px 0;">3. Copy the entire transcript and paste it below</p>
    <p style="margin: 0;">4. Click "Convert to Lyrics" to format it properly</p>
  `;

  const openYouTubeBtn = document.createElement("button");
  openYouTubeBtn.textContent = "Open YouTube Video";
  openYouTubeBtn.style.width = "100%";
  openYouTubeBtn.style.padding = "10px";
  openYouTubeBtn.style.backgroundColor = "#ff0000";
  openYouTubeBtn.style.color = "white";
  openYouTubeBtn.style.border = "none";
  openYouTubeBtn.style.borderRadius = "6px";
  openYouTubeBtn.style.cursor = "pointer";
  openYouTubeBtn.style.fontSize = "14px";
  openYouTubeBtn.style.fontWeight = "bold";
  openYouTubeBtn.style.transition = "all 0.3s ease";

  openYouTubeBtn.addEventListener("mouseover", () => {
    openYouTubeBtn.style.backgroundColor = "#cc0000";
  });
  openYouTubeBtn.addEventListener("mouseout", () => {
    openYouTubeBtn.style.backgroundColor = "#ff0000";
  });

  openYouTubeBtn.addEventListener("click", () => {
    window.open(`https://www.youtube.com/watch?v=${song.videoId}`, '_blank');
  });

  instructionsContainer.appendChild(instructions);
  instructionsContainer.appendChild(openYouTubeBtn);

  // Input textarea
  const inputLabel = document.createElement("label");
  inputLabel.textContent = "Paste YouTube transcript here:";
  inputLabel.style.display = "block";
  inputLabel.style.marginBottom = "8px";
  inputLabel.style.fontWeight = "bold";
  inputLabel.style.color = "var(--text-primary)";

  const transcriptInput = document.createElement("textarea");
  transcriptInput.style.width = "100%";
  transcriptInput.style.height = "200px";
  transcriptInput.style.padding = "12px";
  transcriptInput.style.backgroundColor = "var(--bg-primary)";
  transcriptInput.style.color = "var(--text-primary)";
  transcriptInput.style.border = "2px solid var(--border-color)";
  transcriptInput.style.borderRadius = "6px";
  transcriptInput.style.fontSize = "14px";
  transcriptInput.style.fontFamily = "monospace";
  transcriptInput.style.resize = "vertical";
  transcriptInput.style.lineHeight = "1.4";
  transcriptInput.placeholder = "Paste the YouTube transcript here...";

  // Convert button
  const convertBtn = document.createElement("button");
  convertBtn.textContent = "Convert to Lyrics";
  convertBtn.style.width = "100%";
  convertBtn.style.padding = "12px";
  convertBtn.style.backgroundColor = "var(--accent-color)";
  convertBtn.style.color = "white";
  convertBtn.style.border = "none";
  convertBtn.style.borderRadius = "6px";
  convertBtn.style.cursor = "pointer";
  convertBtn.style.fontSize = "16px";
  convertBtn.style.fontWeight = "bold";
  convertBtn.style.margin = "15px 0";
  convertBtn.style.transition = "all 0.3s ease";

  convertBtn.addEventListener("mouseover", () => {
    convertBtn.style.backgroundColor = "var(--hover-color)";
  });
  convertBtn.addEventListener("mouseout", () => {
    convertBtn.style.backgroundColor = "var(--accent-color)";
  });

  // Lyrics preview container
  const previewContainer = document.createElement("div");
  previewContainer.style.display = "none";

  const previewLabel = document.createElement("label");
  previewLabel.textContent = "Converted Lyrics (Edit if needed):";
  previewLabel.style.display = "block";
  previewLabel.style.marginBottom = "8px";
  previewLabel.style.fontWeight = "bold";
  previewLabel.style.color = "var(--text-primary)";

  const lyricsPreview = document.createElement("textarea");
  lyricsPreview.style.width = "100%";
  lyricsPreview.style.height = "300px";
  lyricsPreview.style.padding = "12px";
  lyricsPreview.style.backgroundColor = "var(--bg-primary)";
  lyricsPreview.style.color = "var(--text-primary)";
  lyricsPreview.style.border = "2px solid var(--border-color)";
  lyricsPreview.style.borderRadius = "6px";
  lyricsPreview.style.fontSize = "14px";
  lyricsPreview.style.fontFamily = "monospace";
  lyricsPreview.style.resize = "vertical";
  lyricsPreview.style.lineHeight = "1.4";

  previewContainer.appendChild(previewLabel);
  previewContainer.appendChild(lyricsPreview);

  // Action buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "none";
  buttonsContainer.style.flexDirection = "row";
  buttonsContainer.style.gap = "10px";
  buttonsContainer.style.marginTop = "15px";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Lyrics";
  saveBtn.style.flex = "1";
  saveBtn.style.padding = "12px";
  saveBtn.style.backgroundColor = "#28a745";
  saveBtn.style.color = "white";
  saveBtn.style.border = "none";
  saveBtn.style.borderRadius = "6px";
  saveBtn.style.cursor = "pointer";
  saveBtn.style.fontSize = "16px";
  saveBtn.style.fontWeight = "bold";
  saveBtn.style.transition = "all 0.3s ease";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.flex = "0 0 100px";
  cancelBtn.style.padding = "12px";
  cancelBtn.style.backgroundColor = "#6c757d";
  cancelBtn.style.color = "white";
  cancelBtn.style.border = "none";
  cancelBtn.style.borderRadius = "6px";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.style.fontSize = "16px";
  cancelBtn.style.transition = "all 0.3s ease";

  saveBtn.addEventListener("mouseover", () => {
    saveBtn.style.backgroundColor = "#218838";
  });
  saveBtn.addEventListener("mouseout", () => {
    saveBtn.style.backgroundColor = "#28a745";
  });

  cancelBtn.addEventListener("mouseover", () => {
    cancelBtn.style.backgroundColor = "#5a6268";
  });
  cancelBtn.addEventListener("mouseout", () => {
    cancelBtn.style.backgroundColor = "#6c757d";
  });

  buttonsContainer.appendChild(saveBtn);
  buttonsContainer.appendChild(cancelBtn);

  // Event handlers
  convertBtn.addEventListener("click", () => {
    const transcriptText = transcriptInput.value.trim();
    if (!transcriptText) {
      alert("Please paste a transcript first");
      return;
    }

    const convertedLyrics = this.convertTranscriptToLyrics(transcriptText);
    if (convertedLyrics) {
      lyricsPreview.value = convertedLyrics;
      previewContainer.style.display = "block";
      buttonsContainer.style.display = "flex";
      lyricsPreview.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      alert("Could not convert transcript. Please check the format.");
    }
  });

  saveBtn.addEventListener("click", async () => {
    const lyricsText = lyricsPreview.value.trim();
    if (!lyricsText) {
      alert("No lyrics to save");
      return;
    }

    try {
      await this.updateSongDetails(song.id, song.name, song.author, song.videoId, lyricsText);
      alert("Lyrics saved successfully!");
      modal.remove();
      if (document.getElementById("lyrics").classList.contains("active")) {
        this.renderLyricsTab();
      }
    } catch (error) {
      console.error("Error saving lyrics:", error);
      alert("Failed to save lyrics. Please try again.");
    }
  });

  cancelBtn.addEventListener("click", () => {
    modal.remove();
  });

  // Assemble modal
  modalContent.appendChild(headerContainer);
  modalContent.appendChild(instructionsContainer);
  modalContent.appendChild(inputLabel);
  modalContent.appendChild(transcriptInput);
  modalContent.appendChild(convertBtn);
  modalContent.appendChild(previewContainer);
  modalContent.appendChild(buttonsContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

convertTranscriptToLyrics(transcript) {
  try {
    const lines = transcript.split('\n');
    const lyrics = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if line contains timestamp (e.g., 0:24 or **0:24**)
      const timestampMatch = line.match(/^(\*\*)?(\d+):(\d+)(\*\*)?$/) || line.match(/^(\d+):(\d+)$/);
      if (timestampMatch) {
        const minutes = parseInt(timestampMatch[2] || timestampMatch[1]);
        const seconds = parseInt(timestampMatch[3] || timestampMatch[2]);
        
        // Look for lyric content in the next line(s)
        let lyricContent = '';
        let j = i + 1;
        
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          
          // Stop if we hit another timestamp
          if (nextLine.match(/^(\*\*)?(\d+):(\d+)(\*\*)?$/) || nextLine.match(/^(\d+):(\d+)$/)) {
            break;
          }
          
          // Skip empty lines
          if (!nextLine) {
            j++;
            continue;
          }
          
          // Extract lyric content
          if (nextLine.startsWith('♪') && nextLine.endsWith('♪')) {
            lyricContent = nextLine.slice(1, -1).trim();
          } else if (nextLine.match(/^\([^)]+\)$/) || nextLine.match(/^\*\*[^*]+\*\*$/)) {
            // Skip music descriptions like "(gentle rock music)" or "**intense rock music**"
            j++;
            continue;
          } else if (nextLine.startsWith('♪')) {
            // Handle lines that start with ♪ but don't end with it
            lyricContent = nextLine.slice(1).replace(/♪$/, '').trim();
          } else {
            lyricContent = nextLine;
          }
          
          if (lyricContent) {
            // Apply formatting
            lyricContent = this.formatLyricText(lyricContent);
            lyrics.push(`${lyricContent} [${minutes}:${seconds.toString().padStart(2, '0')}]`);
          }
          
          j++;
          break; // Only take the first lyric line after timestamp
        }
        
        i = j - 1; // Skip processed lines
      }
    }
    
    return lyrics.join('\n');
  } catch (error) {
    console.error('Error converting transcript:', error);
    return null;
  }
}

formatLyricText(text) {
  // Remove music symbols and extra characters
  text = text.replace(/♪/g, '').trim();
  
  // Convert to lowercase first
  text = text.toLowerCase();
  
  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);
  
  // Capitalize "I" when it's a standalone word
  text = text.replace(/\bi\b/g, 'I');
  
  // Capitalize after punctuation (. ! ?)
  text = text.replace(/([.!?]\s+)([a-z])/g, (match, punctuation, letter) => {
    return punctuation + letter.toUpperCase();
  });
  
  return text;
}



 initializeVisualizer() {
  this.visualizer.canvas = document.getElementById('visualizerCanvas');
  if (!this.visualizer.canvas) return;
  
  this.visualizer.ctx = this.visualizer.canvas.getContext('2d');
  this.resizeCanvas();
  this.createVisualizerBars();
  
  // Don't auto-start - let loadVisualizerSettings() handle this
  // this.startVisualizer(); // Remove this line
  
  // Resize canvas when window resizes
  window.addEventListener('resize', () => this.resizeCanvas());
}
resizeCanvas() {
    if (!this.visualizer.canvas) return;
    
    this.visualizer.canvas.width = window.innerWidth;
    this.visualizer.canvas.height = window.innerHeight;
}

createVisualizerBars() {
    const barsContainer = document.getElementById('visualizerBars');
    if (!barsContainer) return;
    
    // Create 50 bars
    for (let i = 0; i < 50; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '4px';
        barsContainer.appendChild(bar);
        this.visualizer.bars.push(bar);
    }
}

startVisualizer() {
    this.visualizer.isActive = true;
    this.animateVisualizer();
}

animateVisualizer() {
    if (!this.visualizer.isActive) return;
    
    // Animate bars
    this.animateBars();
    
    // Animate canvas particles
    this.animateParticles();
    
    this.visualizer.animationId = requestAnimationFrame(() => this.animateVisualizer());
}

animateBars() {
    this.visualizer.bars.forEach((bar, index) => {
        // Create more dynamic movement when music is playing
        let intensity = this.isPlaying ? 1.5 : 0.5;
        let baseHeight = Math.random() * 100 * intensity;
        
        // Add rhythm-like pattern
        let rhythmMultiplier = Math.sin(Date.now() * 0.01 + index * 0.3) * 0.5 + 0.5;
        let height = baseHeight * rhythmMultiplier + 4;
        
        // More movement when music is playing
        if (this.isPlaying) {
            height += Math.sin(Date.now() * 0.005 + index * 0.1) * 30;
        }
        
        bar.style.height = Math.max(4, height) + 'px';
    });
}

animateParticles() {
    const ctx = this.visualizer.ctx;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, this.visualizer.canvas.width, this.visualizer.canvas.height);
    
    // Create new particles occasionally
    if (Math.random() < (this.isPlaying ? 0.3 : 0.1)) {
        this.createParticle();
    }
    
    // Update and draw particles
    this.visualizer.particles = this.visualizer.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;
        particle.opacity = particle.life;
        
        if (particle.life <= 0) return false;
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity * 0.6;
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-color');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        return true;
    });
}

createParticle() {
    this.visualizer.particles.push({
        x: Math.random() * this.visualizer.canvas.width,
        y: Math.random() * this.visualizer.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        life: 1,
        opacity: 1
    });
}



// Add cleanup method (call this when needed)
destroyVisualizer() {
    this.visualizer.isActive = false;
    if (this.visualizer.animationId) {
        cancelAnimationFrame(this.visualizer.animationId);
    }
}






















  


  
cleanup() {
  console.log("Starting cleanup process");
  this.saveCurrentState();
  this.clearTimersAndIntervals();
  this.cleanupYouTubePlayer();
  this.restorePageAppearance();
  this.disconnectObservers();
  this.removeDynamicEventListeners();
  this.gracefulDatabaseClose();
  console.log("Cleanup process completed successfully");
}
saveCurrentState() {
  try {
    console.log("Saving current application state");
    if (this.listeningTime > 0) {
      localStorage.setItem('musicPlayer_listeningTime', this.listeningTime.toString());
      console.log(`Listening time persisted: ${this.listeningTime} seconds`);
    }
    if (this.elements?.volumeSlider?.value) {
      localStorage.setItem('musicPlayer_volume', this.elements.volumeSlider.value);
      console.log(`Volume level persisted: ${this.elements.volumeSlider.value}`);
    }
    if (this.currentSpeed !== 1) {
      localStorage.setItem('musicPlayer_speed', this.currentSpeed.toString());
      console.log(`Playback speed persisted: ${this.currentSpeed}x`);
    }
    if (this.ytPlayer && this.isPlaying) {
      try {
        const currentTime = this.ytPlayer.getCurrentTime();
        if (currentTime > 0) {
          localStorage.setItem('musicPlayer_lastPosition', currentTime.toString());
          console.log(`Current position persisted: ${currentTime} seconds`);
        }
      } catch (error) {
        console.warn("Failed to persist current playback position:", error.message);
      }
    }
    console.log("Application state saved successfully");
  } catch (error) {
    console.error("Critical error during state persistence:", error);
  }
}
clearTimersAndIntervals() {
  console.log("Clearing active timers and intervals");
  const timers = [
    { ref: 'progressInterval', timer: this.progressInterval },
    { ref: 'listeningTimeInterval', timer: this.listeningTimeInterval },
    { ref: 'longPressTimer', timer: this.longPressTimer },
    { ref: 'titleScrollInterval', timer: this.titleScrollInterval },
    { ref: 'appTimer', timer: this.appTimer }
  ];
  let clearedCount = 0;
  timers.forEach(({ ref, timer }) => {
    if (timer) {
      clearInterval(timer);
      clearTimeout(timer);
      this[ref] = null;
      clearedCount++;
      console.log(`Timer cleared: ${ref}`);
    }
  });
  console.log(`Successfully cleared ${clearedCount} active timers`);
}
cleanupYouTubePlayer() {
  this.destroyVisualizer();
  console.log("Initiating YouTube player cleanup");
  if (this.ytPlayer) {
    try {
      if (typeof this.ytPlayer.pauseVideo === "function") {
        this.ytPlayer.pauseVideo();
        console.log("YouTube player paused");
      }
      if (typeof this.ytPlayer.destroy === "function") {
        this.ytPlayer.destroy();
        console.log("YouTube player instance destroyed");
      }
      this.ytPlayer = null;
      this.isPlaying = false;
      console.log("YouTube player cleanup completed");
    } catch (error) {
      console.warn("Error during YouTube player cleanup:", error.message);
      this.ytPlayer = null;
      this.isPlaying = false;
    }
  } else {
    console.log("No YouTube player instance found for cleanup");
  }
}
restorePageAppearance() {
  console.log("Restoring original page appearance");
  try {
    if (this.originalTitle && document.title !== this.originalTitle) {
      document.title = this.originalTitle;
      console.log(`Page title restored: ${this.originalTitle}`);
    }
    const faviconLink = document.querySelector('link[rel="icon"]');
    if (faviconLink && this.originalFavicon && faviconLink.href !== this.originalFavicon) {
      faviconLink.href = this.originalFavicon;
      console.log(`Favicon restored: ${this.originalFavicon}`);
    }
    if (this.isWebEmbedVisible) {
      this.destroyWebEmbedOverlay();
    
      console.log("Web embed overlay destroyed");
    }
    console.log("Page appearance restoration completed");
  } catch (error) {
    console.warn("Error during page appearance restoration:", error.message);
  }
}
disconnectObservers() {
  console.log("Disconnecting mutation observers");
  if (this.titleObserver) {
    try {
      this.titleObserver.disconnect();
      this.titleObserver = null;
      console.log("Title observer disconnected successfully");
    } catch (error) {
      console.warn("Error disconnecting title observer:", error.message);
    }
  } else {
    console.log("No active observers found for disconnection");
  }
}
removeDynamicEventListeners() {
  console.log("Removing dynamic event listeners");
  let removedCount = 0;
  try {
    const contextMenuHandler = this.contextMenuHandler;
    if (contextMenuHandler) {
      document.removeEventListener('contextmenu', contextMenuHandler);
      removedCount++;
      console.log("Context menu event listener removed");
    }
  } catch (error) {
    console.warn("Error removing context menu listener:", error.message);
  }
  try {
    const keyboardHandler = this.keyboardHandler;
    if (keyboardHandler) {
      document.removeEventListener('keydown', keyboardHandler);
      removedCount++;
      console.log("Global keyboard event listener removed");
    }
  } catch (error) {
    console.warn("Error removing keyboard listener:", error.message);
  }
  try {
    if (this.elements?.autoplayBtn && this.handleToggleAutoplay) {
      this.elements.autoplayBtn.removeEventListener('click', this.handleToggleAutoplay);
      removedCount++;
      console.log("Autoplay button event listener removed");
    }
  } catch (error) {
    console.warn("Error removing autoplay button listener:", error.message);
  }
  try {
    const playlistItems = document.querySelectorAll(".playlist-item[draggable='true']");
    playlistItems.forEach((item) => {
      item.draggable = false;
      removedCount++;
    });
    if (playlistItems.length > 0) {
      console.log(`Drag functionality removed from ${playlistItems.length} playlist items`);
    }
  } catch (error) {
    console.warn("Error removing drag functionality:", error.message);
  }
  console.log(`Dynamic event listener removal completed: ${removedCount} listeners processed`);
}
gracefulDatabaseClose() {
  console.log("Initiating graceful database connection closure");
  if (this.db) {
    try {
      setTimeout(() => {
        if (this.db) {
          this.db.close();
          this.db = null;
          console.log("Database connection closed successfully");
        }
      }, 100);
    } catch (error) {
      console.warn("Error during database closure:", error.message);
      this.db = null;
    }
  } else {
    console.log("No active database connection found");
  }
}
}
let musicPlayer;
function initializeMusicPlayer() {
  musicPlayer = new AdvancedMusicPlayer();
}
window.addEventListener("beforeunload", () => {
  if (musicPlayer) {
    musicPlayer.cleanup();
  }
});
document.addEventListener("DOMContentLoaded", initializeMusicPlayer);
