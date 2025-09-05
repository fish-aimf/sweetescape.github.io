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
    this.currentSong = null;
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
    this.timerAction = 'stopMusic';
    this.globalLibrarySupabase = null;
    this.globalLibraryCurrentUser = null;
    this.globalLibraryArtists = [];
    this.GEMINI_API_KEY = 'AIzaSyAGa1IpwVMUmNo-YH9JyWStpWprkpkhGWk';
    this.YOUTUBE_API_KEYS = [
        'AIzaSyDPT2lmIab9DPC-ltZh4sWrlhapwp0mgTA', 
        'AIzaSyAENxiCNCZPHgPt2-ip4-GUWcLTkxge8tc',
        'AIzaSyCDKrOQyGllinvpfd-WxT-GLk-0fqeBPg4',
        'AIzaSyC4j5HXlRifuJr-1kjxbNVxzu_xvVxniqs',
        'AIzaSyBTm9f2GN9fu1sBnvq9gEW4Scck3-0NIP0',
        'AIzaSyAxyLInnmvbWI9AnX9kOIHdSsaZFwfEpX4',
        'AIzaSyBgNN14Ql_9ZzyNed0mS-KLt1l1ucieI9s'
    ];
    this.activeYoutubeKeyIndex = 0;
    this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
    this.supabase = null;
    this.supadataApiKey = 'sd_b3095aebbee9e4a7e6333bca9027b4cc'; 
  this.currentSongForImport = null;
this.globalLibrarySearchFilter = '';
    this.allArtists = [];
    this.searchTimeout = null;

    this.importModal = null;
    this.closeImportModalBtn = null;
    this.importSongsBtn = null;
    this.importSongsTextarea = null;
    this.filteredPlaylists = [];
    this.currentSearchTerm = "";
    this.webEmbedSites = [
      'https://www.desmos.com/calculator',
      'https://i2.res.24o.it/pdf2010/Editrice/ILSOLE24ORE/ILSOLE24ORE/Online/_Oggetti_Embedded/Documenti/2025/07/12/Preliminary%20Report%20VT.pdf' ,
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
          this.loadVisualizerSettings(),
          this.loadLibrarySortSetting(),
          this.loadLibraryReverseSetting()
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
        this.initializeVisualizer(); 
        this.loadVisualizerSettings();
        this.initializeGlobalLibrary();
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
      visualizerToggle: document.getElementById("visualizerToggle"),
      findSongsBtn: document.getElementById("findSongsBtn"),
closeFindSongs: document.getElementById("closeFindSongs"),
findSongsDiv: document.getElementById("findSongsDiv"),
findSongsSearch: document.getElementById("findSongsSearch"),
findSongsResults: document.getElementById("findSongsResults"),
      librarySortToggle: document.getElementById("librarySortToggle"),
      libraryReverseToggle: document.getElementById("libraryReverseToggle"),
      aiImportGlobalBtn: document.getElementById("aiImportGlobalBtn"),
      importModal: document.getElementById("importModal"),
        closeImportModalBtn: document.getElementById("closeImportModal"),
        importSongsBtn: document.getElementById("importSongsBtn"),
        importSongsTextarea: document.getElementById("importSongsTextarea"),
      playlistSearch: document.getElementById("playlistSearch"),
toggleCreatePlaylistBtn: document.getElementById("toggleCreatePlaylistBtn"),
createPlaylistDiv: document.getElementById("createPlaylistDiv"),
    };
    this.elements.aiGeneratorDiv = document.getElementById("aiGeneratorDiv");
    this.elements.closeAiGenerator = document.getElementById("closeAiGenerator");
    this.elements.aiArtistName = document.getElementById("aiArtistName");
    this.elements.aiSongCount = document.getElementById("aiSongCount");
    this.elements.aiGenerateBtn = document.getElementById("aiGenerateBtn");
    this.elements.aiRequiredSongs = document.getElementById("aiRequiredSongs");
    this.elements.aiCopyBtn = document.getElementById("aiCopyBtn");
    this.elements.aiImportBtn = document.getElementById("aiImportBtn");
    this.elements.aiOutputSection = document.getElementById("aiOutputSection");
    this.elements.aiOutput = document.getElementById("aiOutput");
    this.elements.openAiGeneratorBtn = document.getElementById("openAiGeneratorBtn");
    this.elements.notFindingSection = document.getElementById("notFindingSection");
this.elements.findSongsDiv = document.getElementById("findSongsDiv");
this.elements.findSongsSearch = document.getElementById("findSongsSearch");
this.elements.findSongsResults = document.getElementById("findSongsResults");
this.elements.notFindingSection = document.getElementById("notFindingSection");
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
    if (e.key === "Enter") {
        const searchTerm = this.elements.librarySearch.value.trim();
        const videoId = this.extractYouTubeId(searchTerm);
        if (videoId && this.elements.youtubeSearchSuggestion.style.display !== "none") {
            this.autofillFromUrl(searchTerm);
        } else if (this.elements.youtubeSearchSuggestion.style.display !== "none") {
            this.searchYouTube(searchTerm);
        } else {
            this.playFirstVisibleSong();
        }
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

    this.handleCloseImportModal = this.closeImportModal.bind(this);
    this.handleImportSongs = () => {
        this.importLibrary(this.elements.importSongsTextarea.value);
        this.closeImportModal();
    };
    this.elements.aiImportGlobalBtn.addEventListener('click', this.handleImportToGlobalLibrary.bind(this));
document.getElementById('refreshRandomBtn').addEventListener('click', () => this.refreshRandomRecommendations());
    const tabButtons = document.querySelectorAll('.settings-tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => this.handleTabSwitch(e));
    });
    if (this.elements.openAiGeneratorBtn) {
        this.elements.openAiGeneratorBtn.addEventListener("click", () => this.openAiGenerator());
    }
    if (this.elements.closeAiGenerator) {
        this.elements.closeAiGenerator.addEventListener("click", () => this.closeAiGenerator());
    }
    if (this.elements.aiGenerateBtn) {
        this.elements.aiGenerateBtn.addEventListener("click", () => this.generateAiSongs());
    }
    if (this.elements.aiCopyBtn) {
        this.elements.aiCopyBtn.addEventListener("click", () => this.copyAiResults());
    }
    if (this.elements.aiImportBtn) {
        this.elements.aiImportBtn.addEventListener("click", () => this.importAiResults());
    }
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
    this.elements.findSongsBtn?.addEventListener("click", this.openFindSongs.bind(this));
this.elements.closeFindSongs?.addEventListener("click", this.closeFindSongs.bind(this));
    this.elements.findSongsSearch?.addEventListener("input", () => {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
        this.filterResults();
    }, 300);
});
    const currentSongName = document.getElementById('currentSongName');
    if (currentSongName) {
        currentSongName.addEventListener('contextmenu', (event) => {
            this.handleSongNameRightClick(event);
        });
        currentSongName.style.cursor = 'pointer';
        currentSongName.title = 'Right-click to copy song name';
    }
    this.initializeCurrentSongSection();
    this.addQueueStyles();
    this.setupTimerEventListeners();
    this.setupLayoutEventListeners();
    this.setupGlobalLibraryEventListeners();
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
      [this.elements.discordButton, "click", this.handleDiscordClick],
      [this.elements.librarySortToggle, "change", this.handleLibrarySortToggle.bind(this)],
      [this.elements.libraryReverseToggle, "change", this.handleLibraryReverseToggle.bind(this)],
      [this.elements.closeImportModalBtn, "click", this.handleCloseImportModal],
        [this.elements.importSongsBtn, "click", this.handleImportSongs],
      [this.elements.playlistSearch, "input", this.filterPlaylists.bind(this)],
[this.elements.toggleCreatePlaylistBtn, "click", this.toggleCreatePlaylistDiv.bind(this)],
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
        this.filteredPlaylists = [...this.playlists];
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
        let sortedLibrary;
        if (this.librarySortAlphabetically !== false) {
            sortedLibrary = [...this.songLibrary].sort((a, b) => {
                if (a.favorite !== b.favorite) {
                    return a.favorite ? -1 : 1;
                }
                const result = a.name.localeCompare(b.name);
                return this.libraryReverseOrder ? -result : result;
            });
        } else {
            sortedLibrary = [...this.songLibrary].sort((a, b) => {
                if (a.favorite !== b.favorite) {
                    return a.favorite ? -1 : 1;
                }
                return this.libraryReverseOrder ? -1 : 0;
            });
        }
        const fragment = document.createDocumentFragment();
        if (sortedLibrary.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("empty-library-message");
            emptyMessage.textContent = "Your library is empty.";
            const addSongsButton = document.createElement("button");
            addSongsButton.classList.add("add-songs-button");
            addSongsButton.textContent = "Add Songs";
            addSongsButton.addEventListener("click", () => {
                this.openFindSongs();
            });
            emptyMessage.appendChild(document.createElement("br"));
            emptyMessage.appendChild(addSongsButton);
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
    const searchTerm = this.elements.librarySearch.value.toLowerCase().trim();
    const songItems = this.elements.songLibrary.querySelectorAll(".song-item");
    let resultsFound = false;
    const videoId = this.extractYouTubeId(searchTerm);
    if (videoId) {
        this.showAddToLibrarySuggestion(searchTerm);
        songItems.forEach((item) => {
            item.style.display = "none";
        });
        return;
    }
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
    if (!resultsFound && searchTerm !== "") {
        this.showYouTubeSearchSuggestion(searchTerm);
    } else {
        this.hideYouTubeSearchSuggestion();
    }
}
  showAddToLibrarySuggestion(youtubeUrl) {
    const querySpan = this.elements.youtubeSearchSuggestion.querySelector(".search-query");
    querySpan.textContent = `Add this song to library`;
    this.elements.youtubeSearchSuggestion.style.display = "block";
    this.elements.youtubeSearchSuggestion.onclick = null;
    this.elements.youtubeSearchSuggestion.onclick = () => {
        this.autofillFromUrl(youtubeUrl);
    };
}
  autofillFromUrl(youtubeUrl) {
    this.openLibraryModal();
    this.elements.songUrlInput.value = youtubeUrl;
    this.handleUrlPaste();
    this.elements.librarySearch.value = "";
    this.hideYouTubeSearchSuggestion();
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
  playFirstVisibleSong() {
    const visibleSongItems = Array.from(this.elements.songLibrary.querySelectorAll(".song-item"))
        .filter(item => item.style.display !== "none");
    if (visibleSongItems.length > 0) {
        const firstSongElement = visibleSongItems[0].querySelector(".song-name");
        const songId = firstSongElement.dataset.songId;
        if (songId) {
            this.playSong(parseInt(songId));
        }
    }
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
        
        this.hideCreatePlaylistDiv();
        this.filterPlaylists();
      })
      .catch((error) => {
        console.error("Error creating playlist:", error);
        alert("Failed to create playlist. Please try again.");
      });
  }
  renderPlaylists() {
    this.elements.playlistContainer.innerHTML = "";
    
    const playlistsToRender = this.currentSearchTerm ? this.filteredPlaylists : this.playlists;
    const sortedPlaylists = [...playlistsToRender].sort((a, b) => {
        if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position;
        }
        return 0;
    });
    
    if (sortedPlaylists.length === 0 && this.currentSearchTerm) {
        const noResultsElement = document.createElement("div");
        noResultsElement.classList.add("no-results-message");
        noResultsElement.innerHTML = `<p>No playlists found matching "${this.currentSearchTerm}"</p>`;
        this.elements.playlistContainer.appendChild(noResultsElement);
        return;
    }
    
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
  filterPlaylists() {
    this.currentSearchTerm = this.elements.playlistSearch.value.toLowerCase().trim();
    
    if (this.currentSearchTerm === "") {
        this.filteredPlaylists = [...this.playlists];
    } else {
        this.filteredPlaylists = this.playlists.filter(playlist => 
            playlist.name.toLowerCase().includes(this.currentSearchTerm)
        );
    }
    
    this.renderPlaylists();
}

toggleCreatePlaylistDiv() {
    const createDiv = this.elements.createPlaylistDiv;
    const isVisible = createDiv.style.display !== "none";
    
    if (isVisible) {
        createDiv.style.display = "none";
        this.elements.toggleCreatePlaylistBtn.textContent = "+";
        this.elements.toggleCreatePlaylistBtn.style.transform = "rotate(0deg)";
    } else {
        createDiv.style.display = "block";
        this.elements.toggleCreatePlaylistBtn.textContent = "×";
        this.elements.toggleCreatePlaylistBtn.style.transform = "rotate(45deg)";
        setTimeout(() => {
            this.elements.newPlaylistName.focus();
        }, 100);
    }
}

hideCreatePlaylistDiv() {
    this.elements.createPlaylistDiv.style.display = "none";
    this.elements.toggleCreatePlaylistBtn.textContent = "+";
    this.elements.toggleCreatePlaylistBtn.style.transform = "rotate(0deg)";
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
    this.currentSong = song; 
    this.playSongById(song.videoId);
    this.hideSidebar();
    this.saveRecentlyPlayedSong(song);
    this.updateCurrentSongDisplay();
    if (
        document.getElementById("lyrics") &&
        document.getElementById("lyrics").classList.contains("active")
    ) {
        this.renderLyricsTab();
    }
}
  handleSongNameRightClick(event) {
    event.preventDefault();
    const songName = this.elements.currentSongName?.textContent || 
                    document.getElementById('currentSongName')?.textContent;
    if (songName && songName !== "No Song Playing" && songName !== "Unknown Title") {
        navigator.clipboard.writeText(songName).then(() => {
            const targetElement = this.elements.currentSongName || 
                                 document.getElementById('currentSongName');
            if (targetElement) {
                const originalText = targetElement.textContent;
                targetElement.textContent = "Copied!";
                setTimeout(() => {
                    targetElement.textContent = originalText;
                }, 1000);
            }
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
    setTimeout(() => {
      try {
        this.ytPlayer.setPlaybackQuality("small");
      } catch (error) {
        console.warn("Failed to set video quality:", error);
      }
    }, 200);
    this.isPlaying = true;
    this.updatePlayerUI();
    if (this.elements.progressBar) {
      this.elements.progressBar.value = 0;
    }
    if (this.currentPlaylist && this.isSidebarVisible) {
      this.renderPlaylistSidebar();
    }
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
  if (this.songQueue.length > 0) {
    const nextSong = this.songQueue.shift();
    this.saveQueue();
    this.updateQueueVisualIndicators();
    const songInLibrary = this.songLibrary.find(s => s.videoId === nextSong.videoId);
    if (songInLibrary) {
      this.currentSongIndex = this.songLibrary.findIndex(s => s.id === songInLibrary.id);
      this.currentPlaylist = null;
    }
    this.currentSong = nextSong; 
    this.saveRecentlyPlayedSong(nextSong);
    this.playSongById(nextSong.videoId);
    this.updatePlayerUI();
    this.updateCurrentSongDisplay(); 
    return;
  }
  const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
  if (!source.length) return;
  if (this.currentPlaylist && this.temporarilySkippedSongs && this.temporarilySkippedSongs.size > 0) {
    this.playNextNonSkippedSong();
    return;
  }
  if (this.currentSongIndex === source.length - 1 && !this.isPlaylistLooping) {
    if (this.ytPlayer) {
      this.ytPlayer.stopVideo();
      this.isPlaying = false;
      this.updatePlayerUI();
    }
    return;
  }
  this.currentSongIndex = (this.currentSongIndex + 1) % source.length;
  const currentSong = source[this.currentSongIndex];
  this.currentSong = currentSong; 
  this.saveRecentlyPlayedSong(currentSong);
  if (this.currentPlaylist) {
    this.playSongById(currentSong.videoId);
  } else {
    this.playCurrentSong();
  }
  this.updateCurrentSongDisplay(); 
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
    this.currentSong = source[this.currentSongIndex]; 
    this.saveRecentlyPlayedSong(source[this.currentSongIndex]); 
    this.playSongById(source[this.currentSongIndex].videoId);
    this.updateCurrentSongDisplay(); 
    return;
  }
  this.currentSongIndex =
    (this.currentSongIndex - 1 + source.length) % source.length;
  const currentSong = source[this.currentSongIndex];
  this.currentSong = currentSong; 
  this.saveRecentlyPlayedSong(currentSong); 
  if (this.currentPlaylist) {
    this.playSongById(source[this.currentSongIndex].videoId);
  } else {
    this.playCurrentSong();
  }
  this.updateCurrentSongDisplay(); 
}
playCurrentSong() {
    if (!this.songLibrary.length) return;
    const currentSong = this.songLibrary[this.currentSongIndex];
    this.currentSong = currentSong; 
    if (this.ytPlayer) {
      this.ytPlayer.loadVideoById(currentSong.videoId);
      this.ytPlayer.playVideo();
      this.isPlaying = true;
      this.updatePlayerUI();
    }
    this.updateCurrentSongDisplay(); 
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
  this.currentSong = song; 
  this.saveRecentlyPlayedSong(song); 
  this.playSongById(song.videoId);
  this.updateCurrentSongDisplay(); 
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
      'rel': 0,          
      'showinfo': 0,     
      'controls': 0,     
      'disablekb': 1,    
      'fs': 0,           
      'modestbranding': 1, 
      'playsinline': 1,  
      'autoplay': 0,     
      'iv_load_policy': 3, 
      'cc_load_policy': 0, 
      'cc_lang_pref': 'en', 
      'hl': 'en',        
      'enablejsapi': 1,  
      'origin': window.location.origin, 
      'widget_referrer': window.location.href 
    },
    events: {
      onReady: this.onPlayerReady.bind(this),
      onStateChange: this.onPlayerStateChange.bind(this),
      onError: this.onPlayerError.bind(this)
    },
  });
}
onPlayerReady(event) {
  console.log("YouTube player is ready");
  this.initializeAutoplay();
}
onPlayerError(event) {
  console.error("YouTube player error:", event.data);
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
  if (this.isAutoplayEnabled) {
    setTimeout(() => {
      this.playNextSong();
    }, 1000);
  }
}
onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        console.log("Song ended - taking immediate action");
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
        }, 0); 
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
  this.clearAllIntervals();
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
      this.playSongById(currentVideoId);
    }
  } else if (this.isAutoplayEnabled) {
    console.log("Autoplay enabled - calling playNextSong()");
    this.playNextSong();
  } else {
    console.log("Autoplay disabled - stopping playback");
    this.isPlaying = false;
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
toggleAutoplay() {
  this.isAutoplayEnabled = !this.isAutoplayEnabled;
  if (this.elements.autoplayBtn) {
    this.elements.autoplayBtn.classList.toggle("active", this.isAutoplayEnabled);
  }
  this.updatePlayerUI();
  if (this.db) {
    this.saveSetting("autoplay", this.isAutoplayEnabled).catch((error) => {
      console.error("Error saving autoplay setting:", error);
    });
  }
  console.log("Autoplay toggled:", this.isAutoplayEnabled);
}
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
    const modal = document.getElementById("importModal");
    modal.style.display = "block";
}

  closeImportModal() {
    const modal = document.getElementById("importModal");
    modal.style.display = "none";
    this.elements.importSongsTextarea.value = "";
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
    const spacerDiv = document.getElementById("controlBarSpacer");
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
      if (spacerDiv) spacerDiv.style.display = "none";
    } else {
      targetElement.style.visibility = "visible";
      targetElement.style.position = "";
      targetElement.style.pointerEvents = "auto";
      localStorage.setItem("controlBarVisible", "true");
      if (leftBanner) leftBanner.classList.remove('expanded');
      if (rightBanner) rightBanner.classList.remove('expanded');
      if (spacerDiv) spacerDiv.style.display = "block";
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
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("welcome-buttons");
    const skipBtn = document.createElement("button");
    skipBtn.textContent = "Get Started";
    skipBtn.classList.add("welcome-skip-btn");
    skipBtn.onclick = () => modal.remove();
    const addSongsBtn = document.createElement("button");
    addSongsBtn.textContent = "Add Songs to Get Started";
    addSongsBtn.classList.add("welcome-add-songs-btn");
    addSongsBtn.onclick = () => {
        this.openFindSongs();
        modal.remove();
    };
    buttonContainer.appendChild(skipBtn);
    buttonContainer.appendChild(addSongsBtn);
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(instructions);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
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
    const header = this.elements.additionalDetails.querySelector('.additional-details-header');
    const currentSongSection = this.elements.additionalDetails.querySelector('#currentSongSection');
    this.elements.additionalDetails.innerHTML = '';
    if (header) {
        this.elements.additionalDetails.appendChild(header);
    }
    if (!currentSongSection) {
        const currentSongDiv = document.createElement('div');
        currentSongDiv.id = 'currentSongSection';
        currentSongDiv.className = 'current-song-section';
        currentSongDiv.style.display = 'none';
        currentSongDiv.innerHTML = `
            <h4 class="current-song-title">Now Playing</h4>
            <div class="current-song-container">
                <div class="current-song-thumbnail">
                    <img id="currentSongThumbnail" src="" alt="Current Song" />
                </div>
                <div class="current-song-info">
                    <div class="current-song-name" id="currentSongName"></div>
                    <div class="current-song-author" id="currentSongAuthor"></div>
                </div>
            </div>
        `;
        this.elements.additionalDetails.appendChild(currentSongDiv);
    } else {
        this.elements.additionalDetails.appendChild(currentSongSection);
    }
    this.updateCurrentSongDisplay();
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
  updateCurrentSongDisplay() {
    if (!this.currentSong) {
        this.hideCurrentSongSection();
        return;
    }
    this.showCurrentSongSection();
    const thumbnailElement = document.getElementById('currentSongThumbnail');
    const nameElement = document.getElementById('currentSongName');
    const authorElement = document.getElementById('currentSongAuthor');
    if (thumbnailElement) {
        thumbnailElement.src = this.currentSong.thumbnailUrl || 
            `https://img.youtube.com/vi/${this.currentSong.videoId}/default.jpg`;
        thumbnailElement.alt = this.currentSong.name || 'Current Song';
    }
    if (nameElement) {
        nameElement.textContent = this.currentSong.name || '';
    }
    if (authorElement) {
        authorElement.textContent = this.currentSong.author || '';
    }
}
showCurrentSongSection() {
    const currentSongSection = document.getElementById('currentSongSection');
    if (currentSongSection) {
        currentSongSection.style.display = 'block';
    }
}
hideCurrentSongSection() {
    const currentSongSection = document.getElementById('currentSongSection');
    if (currentSongSection) {
        currentSongSection.style.display = 'none';
    }
}
initializeCurrentSongSection() {
    this.updateCurrentSongDisplay();
}
getCurrentSongData() {
    if (!this.currentSong) return null;
    return {
        id: this.currentSong.id,
        name: this.currentSong.name,
        author: this.currentSong.author,
        videoId: this.currentSong.videoId,
        thumbnailUrl: this.currentSong.thumbnailUrl,
        duration: this.currentSong.duration,
    };
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
    if (!items || items.length === 0) return;
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
  const modal = document.getElementById("recentlyPlayedModal");
  const limitInput = document.getElementById("recentlyPlayedLimitInput");
  
  // Set the current limit value
  limitInput.value = this.recentlyPlayedLimit || 20;
  
  // Show the modal
  modal.style.display = "flex";
  
  // Populate the content
  this.renderRecentlyPlayedContent();
  
  // Setup event listeners if not already done
  this.setupRecentlyPlayedModalListeners();
}

  setupRecentlyPlayedModalListeners() {
  // Prevent multiple event listeners
  if (this.recentlyPlayedListenersSetup) return;
  this.recentlyPlayedListenersSetup = true;
  
  const modal = document.getElementById("recentlyPlayedModal");
  const closeBtn = document.getElementById("closeRecentlyPlayedModal");
  const limitInput = document.getElementById("recentlyPlayedLimitInput");
  
  // Close button
  closeBtn.addEventListener("click", () => {
    this.hideRecentlyPlayedModal();
  });
  
  // Click outside modal to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      this.hideRecentlyPlayedModal();
    }
  });
  
  // Limit input change
  limitInput.addEventListener("change", () => {
    const newLimit = parseInt(limitInput.value) || 20;
    if (newLimit >= 1 && newLimit <= 100) {
      this.updateRecentlyPlayedLimit(newLimit);
    } else {
      limitInput.value = this.recentlyPlayedLimit || 20;
    }
  });
  
  // Escape key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      this.hideRecentlyPlayedModal();
    }
  });
}
renderRecentlyPlayedContent() {
  const content = document.getElementById("recentlyPlayedContent");
  content.innerHTML = "";
  
  if (this.recentlyPlayedSongs.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.style.cssText = `
      text-align: center;
      color: var(--text-secondary);
      padding: 40px 20px;
      font-style: italic;
    `;
    emptyMessage.textContent = "No recently played songs";
    content.appendChild(emptyMessage);
    return;
  }
  
  this.recentlyPlayedSongs.forEach((song, index) => {
    const songItem = document.createElement("div");
    songItem.classList.add("recently-played-item");
    
    const thumbnail = document.createElement("img");
    thumbnail.src = song.thumbnailUrl || `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
    thumbnail.alt = song.name;
    thumbnail.classList.add("recently-played-thumbnail");
    thumbnail.onerror = function() {
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
    
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("recently-played-remove");
    removeBtn.innerHTML = "×";
    removeBtn.title = "Remove from recently played";
    
    // Remove button click handler
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent song from playing
      this.removeFromRecentlyPlayed(song.id, index);
    });
    
    info.appendChild(name);
    info.appendChild(time);
    songItem.appendChild(thumbnail);
    songItem.appendChild(info);
    songItem.appendChild(removeBtn);
    
    // Song item click handler (play song)
    songItem.addEventListener("click", () => {
      this.playSong(song.id);
      this.hideRecentlyPlayedModal();
    });
    
    content.appendChild(songItem);
  });
}
hideRecentlyPlayedModal() {
  const modal = document.getElementById("recentlyPlayedModal");
  modal.style.display = "none";
}
  
removeFromRecentlyPlayed(songId, index) {
  // Remove from array
  this.recentlyPlayedSongs.splice(index, 1);
  
  // Immediately update UI
  this.renderRecentlyPlayedContent();
  this.renderAdditionalDetails();
  
  // Update database
  if (this.db) {
    try {
      const transaction = this.db.transaction(["recentlyPlayed"], "readwrite");
      const store = transaction.objectStore("recentlyPlayed");
      
      store.put({
        type: "songs",
        items: this.recentlyPlayedSongs,
      });
      
      transaction.onerror = (event) => {
        console.error("Error removing from recently played:", event.target.error);
      };
    } catch (error) {
      console.error("Error updating recently played in database:", error);
    }
  }
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
        this.recentlyPlayedSongs = this.recentlyPlayedSongs.slice(0, newLimit);
        if (this.db) {
          const transaction = this.db.transaction(["recentlyPlayed"], "readwrite");
          const store = transaction.objectStore("recentlyPlayed");
          store.put({
            type: "songs",
            items: this.recentlyPlayedSongs,
          });
          
          // Re-render content after limit change
          this.renderRecentlyPlayedContent();
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
    let hasTimestamps = false;
    const lines = songWithLyrics.lyrics
        .split("\n")
        .filter((line) => line.trim() !== "");
    for (const line of lines) {
        if (line.match(/.*\s*\[(\d+):(\d+)\]/)) {
            hasTimestamps = true;
            break;
        }
    }
    for (const line of lines) {
        if (hasTimestamps) {
            const match = line.match(/(.*)\s*\[(\d+):(\d+)\]/);
            if (match) {
                const lyric = match[1].trim();
                const minutes = parseInt(match[2]);
                const seconds = parseInt(match[3]);
                const timeInSeconds = minutes * 60 + seconds;
                lyricsArray.push(lyric);
                timingsArray.push(timeInSeconds);
            }
        } else {
            lyricsArray.push(line.trim());
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
    if (hasTimestamps && this.ytPlayer && this.isPlaying) {
        this.lyricsInterval = setInterval(() => {
            if (this.ytPlayer && this.ytPlayer.getCurrentTime) {
                const currentTime = this.ytPlayer.getCurrentTime();
                this.updateHighlightedLyric(currentTime, lyricsArray, timingsArray);
            }
        }, 100);
    }
}
  updateHighlightedLyric(currentTime, lyrics, timings) {
    if (!lyrics.length || !timings.length || timings.length !== lyrics.length) return;
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
            const currentElement = document.getElementById(`lyric-${highlightIndex}`);
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
  }
  openLyricsMakerModal(songId) {
  const song = this.songLibrary.find((s) => s.id === songId);
  if (!song) return;
  if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
    this.ytPlayer.pauseVideo();
    this.isPlaying = false;
    this.updatePlayerUI();
    this.clearAllIntervals();
  }
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
  const closeModal = () => {
    modal.classList.add('hidden');
    if (state.timeUpdateInterval) {
      clearInterval(state.timeUpdateInterval);
    }
    if (player.ytPlayer) {
      player.ytPlayer.destroy();
    }
  state.lyrics = [];
  state.timings = [];
  state.currentLineIndex = -1;
  state.isRecording = false;
  document.getElementById("lyricsInput").value = '';
  document.getElementById("exportOutput").value = '';
  document.getElementById("progressContainer").innerHTML = '<h3>Progress</h3>';
  document.getElementById("previewContainer").innerHTML = '';
  document.getElementById("currentTime").textContent = '0:00';
  document.getElementById("prevLine").textContent = '';
  document.getElementById("currentLine").textContent = 'Press "Start Recording" when ready';
  document.getElementById("nextLine").textContent = '';
  document.getElementById("startRecording").disabled = false;
  document.getElementById("markLine").disabled = true;
  document.getElementById("finishRecording").disabled = true;
  showTab('setupTab');
};
  closeBtn.onclick = closeModal;
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
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };
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
  const markCurrentLine = () => {
    if (!state.isRecording) return;
    const currentTime = player.ytPlayer.getCurrentTime();
    state.currentLineIndex++;
    if (state.currentLineIndex < state.lyrics.length) {
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
  const copyToClipboard = () => {
    const exportOutput = document.getElementById("exportOutput");
    exportOutput.select();
    document.execCommand("copy");
    alert("Copied to clipboard!");
  };
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
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
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
  const actionText = this.timerAction === 'stopMusic' ? 'Music will stop' : 'App will close';
  
  if (specificEndTime) {
    const formattedTime = this.timerEndTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    timerStatus.textContent = `${actionText} at ${formattedTime} (in ${minutes.toFixed(2)} minutes)`;
    const timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.textContent = formattedTime;
    timerDisplay.style.display = "inline";
  } else {
    timerStatus.textContent = `${actionText} in ${minutes.toFixed(2)} minutes`;
    const timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.textContent = `${Math.floor(minutes)}m`;
    timerDisplay.style.display = "inline";
  }
  
  document.getElementById("cancelTimer").style.display = "inline-block";
  
  this.appTimer = setTimeout(() => {
    if (this.timerAction === 'stopMusic') {
      this.stopMusic();
    } else {
      this.closeApp();
    }
  }, milliseconds);
  
  document.getElementById("timerModal").style.display = "none";
  this.updateTimerCountdown();
}
  stopMusic() {
  if (this.ytPlayer) {
    try {
      this.ytPlayer.pauseVideo();
      this.isPlaying = false;
      this.updatePlayerUI();
      if (this.titleScrollInterval) {
        clearInterval(this.titleScrollInterval);
        this.titleScrollInterval = null;
        document.title = "Music Player";
      }
    } catch (error) {
      console.error("Error stopping music:", error);
    }
  }
  this.clearAppTimer();
}

closeApp() {
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
      const actionText = this.timerAction === 'stopMusic' ? 'Music will stop' : 'App will close';
      timerStatus.textContent = `${actionText} in ${minutes}m ${seconds}s`;
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
  
  // Timer action selection
  document.getElementById("stopMusicAction").addEventListener("click", () => {
    this.timerAction = 'stopMusic';
    document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById("stopMusicAction").classList.add('active');
  });

  document.getElementById("closeAppAction").addEventListener("click", () => {
    this.timerAction = 'closeApp';
    document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById("closeAppAction").classList.add('active');
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
    let hasTimestamps = false;
    const lines = songWithLyrics.lyrics
        .split("\n")
        .filter((line) => line.trim() !== "");
    for (const line of lines) {
        if (line.match(/.*\s*\[(\d+):(\d+)\]/)) {
            hasTimestamps = true;
            break;
        }
    }
    for (const line of lines) {
        if (hasTimestamps) {
            const match = line.match(/(.*)\s*\[(\d+):(\d+)\]/);
            if (match) {
                const lyric = match[1].trim();
                const minutes = parseInt(match[2]);
                const seconds = parseInt(match[3]);
                const timeInSeconds = minutes * 60 + seconds;
                lyricsArray.push(lyric);
                timingsArray.push(timeInSeconds);
            }
        } else {
            lyricsArray.push(line.trim());
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
    if (hasTimestamps && this.ytPlayer && this.isPlaying && this.ytPlayer.getCurrentTime) {
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
    if (!lyrics.length || !timings.length || timings.length !== lyrics.length) return;
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
  this.loadLibrarySortSetting();
  this.loadLibraryReverseSetting();
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
    updateFaviconTheme();
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
      updateFaviconTheme();
    }
  };
  request.onerror = (event) => {
    console.error("Error loading theme setting:", event.target.error);
    document.documentElement.setAttribute("data-theme", "dark");
    this.updateThemeIcon("dark");
    updateFaviconTheme();
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
    updateFaviconTheme();
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
    updateFaviconTheme();
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
    updateFaviconTheme();
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
    updateFaviconTheme();
  }
  this.saveSetting("themeMode", newTheme).catch((error) => {
    console.error("Error saving theme:", error);
    document.documentElement.setAttribute("data-theme", currentTheme);
    this.updateThemeIcon(currentTheme);
    updateFaviconTheme();
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
// Add this function anywhere in your JavaScript (outside any class)
async function updateFaviconTheme() {
    try {
        // Get the current accent color from CSS custom properties
        const accentColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-color')
            .trim()
            .replace(/`/g, ''); // Remove backticks if present

        // Only proceed if we have a valid color
        if (!accentColor || accentColor === '') {
            return;
        }

        // Fetch the SVG file
        const response = await fetch('favicon.svg');
        if (!response.ok) {
            console.warn('Could not fetch favicon.svg');
            return;
        }
        
        const svgText = await response.text();
        
        // Replace the fill color with current theme color
        const updatedSvg = svgText.replace(/fill="#000000"/g, `fill="${accentColor}"`);
        
        // Create a blob and object URL
        const blob = new Blob([updatedSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        // Find existing favicon
        let favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            // Clean up previous object URL to prevent memory leaks
            if (favicon.href && favicon.href.startsWith('blob:')) {
                URL.revokeObjectURL(favicon.href);
            }
            favicon.href = url;
        }
        
    } catch (error) {
        // Silently fail to avoid breaking anything
        console.warn('Could not update favicon:', error.message);
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
  try {
    const themeData = {
      primary: this.elements.primaryColorPicker?.value || '#000000',
      background: this.elements.backgroundColorPicker?.value || '#ffffff',
      secondary: this.elements.secondaryColorPicker?.value || '#cccccc',
      textPrimary: this.elements.textPrimaryColorPicker?.value || '#000000',
      textSecondary: this.elements.textSecondaryColorPicker?.value || '#666666',
      hover: this.elements.hoverColorPicker?.value || '#eeeeee',
      border: this.elements.borderColorPicker?.value || '#dddddd',
      accent: this.elements.accentColorPicker?.value || '#007bff',
      buttonText: this.elements.buttonTextColorPicker?.value || '#ffffff',
      shadow: this.elements.shadowColorPicker?.value || '#000000',
      shadowOpacity: this.elements.shadowOpacity?.value || '0.1',
      error: this.elements.errorColorPicker?.value || '#f44336',
      errorHover: this.elements.errorHoverColorPicker?.value || '#d32f2f',
      youtubeRed: this.elements.youtubeRedColorPicker?.value || '#ff0000'
    };
    const themeString = JSON.stringify(themeData, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(themeString).then(() => {
        this.showNotification("Theme exported to clipboard!", "success");
      }).catch(err => {
        console.error('Failed to copy theme: ', err);
        this.fallbackCopyToClipboard(themeString);
      });
    } else {
      this.fallbackCopyToClipboard(themeString);
    }
  } catch (error) {
    console.error('Export error:', error);
    this.showNotification("Failed to export theme", "error");
  }
}
importTheme() {
  const themeText = this.elements.themeImportText?.value?.trim();
  if (!themeText) {
    this.showNotification("Please paste a theme code first", "error");
    return;
  }
  try {
    const themeData = JSON.parse(themeText);
    if (typeof themeData !== 'object' || themeData === null) {
      throw new Error('Invalid theme format: not an object');
    }
    const expectedProps = ['primary', 'background', 'secondary', 'textPrimary'];
    const hasValidProps = expectedProps.some(prop => themeData.hasOwnProperty(prop));
    if (!hasValidProps) {
      throw new Error('Invalid theme format: missing expected properties');
    }
    this.applyImportedTheme(themeData);
    this.showNotification("Theme imported successfully! Press save theme buttom.", "success");
    this.elements.themeImportText.value = '';
  } catch (error) {
    console.error('Failed to parse theme:', error);
    this.showNotification("Invalid theme format", "error");
  }
}
applyImportedTheme(themeData) {
  try {
    const isValidHex = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    if (themeData.primary && isValidHex(themeData.primary)) {
      this.elements.primaryColorPicker.value = themeData.primary;
    }
    if (themeData.background && isValidHex(themeData.background)) {
      this.elements.backgroundColorPicker.value = themeData.background;
    }
    if (themeData.secondary && isValidHex(themeData.secondary)) {
      this.elements.secondaryColorPicker.value = themeData.secondary;
    }
    if (themeData.textPrimary && isValidHex(themeData.textPrimary)) {
      this.elements.textPrimaryColorPicker.value = themeData.textPrimary;
    }
    if (themeData.textSecondary && isValidHex(themeData.textSecondary)) {
      this.elements.textSecondaryColorPicker.value = themeData.textSecondary;
    }
    if (themeData.hover && isValidHex(themeData.hover)) {
      this.elements.hoverColorPicker.value = themeData.hover;
    }
    if (themeData.border && isValidHex(themeData.border)) {
      this.elements.borderColorPicker.value = themeData.border;
    }
    if (themeData.accent && isValidHex(themeData.accent)) {
      this.elements.accentColorPicker.value = themeData.accent;
    }
    if (themeData.buttonText && isValidHex(themeData.buttonText)) {
      this.elements.buttonTextColorPicker.value = themeData.buttonText;
    }
    if (themeData.shadow && isValidHex(themeData.shadow)) {
      this.elements.shadowColorPicker.value = themeData.shadow;
    }
    if (themeData.shadowOpacity && !isNaN(parseFloat(themeData.shadowOpacity))) {
      this.elements.shadowOpacity.value = themeData.shadowOpacity;
    }
    if (themeData.error && isValidHex(themeData.error)) {
      this.elements.errorColorPicker.value = themeData.error;
    }
    if (themeData.errorHover && isValidHex(themeData.errorHover)) {
      this.elements.errorHoverColorPicker.value = themeData.errorHover;
    }
    if (themeData.youtubeRed && isValidHex(themeData.youtubeRed)) {
      this.elements.youtubeRedColorPicker.value = themeData.youtubeRed;
    }
    if (typeof this.handleSaveCustomTheme === 'function') {
      this.handleSaveCustomTheme();
    }
  } catch (error) {
    console.error('Error applying imported theme:', error);
    this.showNotification("Error applying theme", "error");
  }
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
        const enabled = request.result ? request.result.value : true; 
        if (this.elements.visualizerToggle) {
            this.elements.visualizerToggle.checked = enabled;
        }
        if (enabled) {
            document.getElementById('musicVisualizer').style.display = 'block';
            this.visualizer.isActive = true;
            if (!this.visualizer.animationId) {
                this.startVisualizer();
            }
        } else {
            document.getElementById('musicVisualizer').style.display = 'none';
            this.visualizer.isActive = false;
            if (this.visualizer.animationId) {
                cancelAnimationFrame(this.visualizer.animationId);
                this.visualizer.animationId = null;
            }
        }
    };
}
setupTabs() {
    const firstTab = document.querySelector('.settings-tab-btn');
    const firstPanel = document.querySelector('.tab-panel');
    if (firstTab && firstPanel) {
        firstTab.classList.add('active');
        firstPanel.classList.add('active');
    }
}
handleTabSwitch(event) {
    const targetTab = event.target.closest('.settings-tab-btn').dataset.tab;
    document.querySelectorAll('.settings-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    event.target.closest('.settings-tab-btn').classList.add('active');
    document.getElementById(targetTab + 'Panel').classList.add('active');
}
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
    const isExpanded = content.classList.contains('expanded');
    if (isExpanded) {
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
    } else {
        content.classList.add('expanded');
        arrow.classList.add('rotated');
    }
    console.log(`Section ${sectionType} ${isExpanded ? 'collapsed' : 'expanded'}`);
}
expandSection(sectionType) {
    const content = document.getElementById(`${sectionType}Content`);
    const header = document.querySelector(`[data-section="${sectionType}"]`);
    const arrow = header?.querySelector('.section-arrow');
    if (content && arrow) {
        content.classList.add('expanded');
        arrow.classList.add('rotated');
    }
}
collapseSection(sectionType) {
    const content = document.getElementById(`${sectionType}Content`);
    const header = document.querySelector(`[data-section="${sectionType}"]`);
    const arrow = header?.querySelector('.section-arrow');
    if (content && arrow) {
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
    }
}
collapseAllSections() {
    const sectionTypes = ['feedback', 'advertisement', 'theme'];
    sectionTypes.forEach(sectionType => {
        this.collapseSection(sectionType);
    });
}
  async loadDiscoverMoreSettings() {
    try {
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
        this.setDefaultDiscoverMoreValues(); 
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
async handleSaveDiscoverMoreSettings() {
    try {
        const recentlyPlayedStorageLimit = parseInt(this.elements.recentlyPlayedStorageLimit?.value) || 20;
        const recentlyPlayedDisplayLimit = parseInt(this.elements.recentlyPlayedDisplayLimit?.value) || 3;
        const suggestedSongsDisplayLimit = parseInt(this.elements.suggestedSongsDisplayLimit?.value) || 2;
        const yourPicksDisplayLimit = parseInt(this.elements.yourPicksDisplayLimit?.value) || 2;
        const recentlyPlayedPlaylistsDisplayLimit = parseInt(this.elements.recentlyPlayedPlaylistsLimit?.value) || 1;
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
        const oldRecentlyPlayedLimit = this.recentlyPlayedLimit;
        this.recentlyPlayedLimit = recentlyPlayedStorageLimit;
        this.recentlyPlayedDisplayLimit = recentlyPlayedDisplayLimit;
        this.suggestedSongsDisplayLimit = suggestedSongsDisplayLimit;
        this.yourPicksDisplayLimit = yourPicksDisplayLimit;
        this.recentlyPlayedPlaylistsDisplayLimit = recentlyPlayedPlaylistsDisplayLimit;
        const savePromises = [
            this.saveSetting("recentlyPlayedLimit", recentlyPlayedStorageLimit),
            this.saveSetting("recentlyPlayedDisplayLimit", recentlyPlayedDisplayLimit),
            this.saveSetting("suggestedSongsDisplayLimit", suggestedSongsDisplayLimit),
            this.saveSetting("yourPicksDisplayLimit", yourPicksDisplayLimit),
            this.saveSetting("recentlyPlayedPlaylistsDisplayLimit", recentlyPlayedPlaylistsDisplayLimit)
        ];
        await Promise.all(savePromises);
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
openImportSubtitlesModal(songId) {
  const song = this.songLibrary.find((s) => s.id === songId);
  if (!song) return;
  this.currentSongForImport = song;
  const modalTitle = document.getElementById('subtitlesImportModalTitle');
  modalTitle.textContent = `Import Subtitles for: ${song.name}`;
  this.resetSubtitlesImportForm();
  const modal = document.getElementById('subtitlesImportModal');
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('subtitles-import-modal-show');
  }, 10);
  this.setupSubtitlesImportEventListeners();
}
  setupSubtitlesImportEventListeners() {
  if (this.subtitlesModalListenersSetup) return;
  this.subtitlesModalListenersSetup = true;
  const modal = document.getElementById('subtitlesImportModal');
  const closeBtn = document.querySelector('.subtitles-import-modal-close');
  const autoFetchBtn = document.getElementById('autoFetchTranscriptBtn');
  const openYouTubeBtn = document.getElementById('openYouTubeBtn');
  const convertBtn = document.getElementById('convertBtn');
  const saveLyricsBtn = document.getElementById('saveLyricsBtn');
  const cancelImportBtn = document.getElementById('cancelImportBtn');
  closeBtn.addEventListener('click', () => this.closeSubtitlesImportModal());
  cancelImportBtn.addEventListener('click', () => this.closeSubtitlesImportModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      this.closeSubtitlesImportModal();
    }
  });
  autoFetchBtn.addEventListener('click', () => this.autoFetchTranscript());
  openYouTubeBtn.addEventListener('click', () => {
    if (this.currentSongForImport) {
      window.open(`https://www.youtube.com/watch?v=${this.currentSongForImport.videoId}`, '_blank');
    }
  });
  convertBtn.addEventListener('click', () => this.convertTranscriptToLyricsHandler());
  saveLyricsBtn.addEventListener('click', () => this.saveLyricsFromModal());
}
closeSubtitlesImportModal() {
  const modal = document.getElementById('subtitlesImportModal');
  modal.classList.remove('subtitles-import-modal-show');
  setTimeout(() => {
    modal.style.display = 'none';
    this.currentSongForImport = null;
  }, 300);
}
  resetSubtitlesImportForm() {
  document.getElementById('transcriptInput').value = '';
  document.getElementById('lyricsPreview').value = '';
  document.getElementById('lyricsPreviewSection').style.display = 'none';
  document.getElementById('loadingIndicator').style.display = 'none';
}
 convertTranscriptToLyricsHandler() {
  const transcriptInput = document.getElementById('transcriptInput');
  const lyricsPreview = document.getElementById('lyricsPreview');
  const previewSection = document.getElementById('lyricsPreviewSection');
  const transcriptText = transcriptInput.value.trim();
  if (!transcriptText) {
    this.showNotification('Please paste a transcript first', 'error');
    return;
  }
  const convertedLyrics = this.convertTranscriptToLyrics(transcriptText);
  if (convertedLyrics) {
    lyricsPreview.value = convertedLyrics;
    previewSection.style.display = 'block';
    setTimeout(() => {
      lyricsPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    this.showNotification('Transcript converted successfully!', 'success');
  } else {
    this.showNotification('Could not convert transcript. Please check the format.', 'error');
  }
}
async saveLyricsFromModal() {
  const lyricsPreview = document.getElementById('lyricsPreview');
  const lyricsText = lyricsPreview.value.trim();
  if (!lyricsText) {
    this.showNotification('No lyrics to save', 'error');
    return;
  }
  if (!this.currentSongForImport) {
    this.showNotification('No song selected', 'error');
    return;
  }
  try {
    await this.updateSongDetails(
      this.currentSongForImport.id, 
      this.currentSongForImport.name, 
      this.currentSongForImport.author, 
      this.currentSongForImport.videoId, 
      lyricsText
    );
    this.showNotification('Lyrics saved successfully!', 'success');
    this.closeSubtitlesImportModal();
    if (document.getElementById('lyrics')?.classList.contains('active')) {
      this.renderLyricsTab();
    }
  } catch (error) {
    console.error('Error saving lyrics:', error);
    this.showNotification('Failed to save lyrics. Please try again.', 'error');
  }
}
async saveLyricsFromModal() {
  const lyricsPreview = document.getElementById('lyricsPreview');
  const lyricsText = lyricsPreview.value.trim();
  if (!lyricsText) {
    this.showNotification('No lyrics to save', 'error');
    return;
  }
  if (!this.currentSongForImport) {
    this.showNotification('No song selected', 'error');
    return;
  }
  try {
    await this.updateSongDetails(
      this.currentSongForImport.id, 
      this.currentSongForImport.name, 
      this.currentSongForImport.author, 
      this.currentSongForImport.videoId, 
      lyricsText
    );
    this.showNotification('Lyrics saved successfully!', 'success');
    this.closeSubtitlesImportModal();
    if (document.getElementById('lyrics')?.classList.contains('active')) {
      this.renderLyricsTab();
    }
  } catch (error) {
    console.error('Error saving lyrics:', error);
    this.showNotification('Failed to save lyrics. Please try again.', 'error');
  }
}
convertTranscriptToLyrics(transcript) {
  try {
    const lines = transcript.split('\n');
    const lyrics = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const timestampMatch = line.match(/^(\*\*)?(\d+):(\d+)(\*\*)?$/) || line.match(/^(\d+):(\d+)$/);
      if (timestampMatch) {
        const minutes = parseInt(timestampMatch[2] || timestampMatch[1]);
        const seconds = parseInt(timestampMatch[3] || timestampMatch[2]);
        const lyricLines = [];
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          if (nextLine.match(/^(\*\*)?(\d+):(\d+)(\*\*)?$/) || nextLine.match(/^(\d+):(\d+)$/)) {
            break;
          }
          if (!nextLine) {
            j++;
            continue;
          }
          if (nextLine.match(/^\[[^\]]+\]$/)) {
            j++;
            continue;
          }
          let lyricContent = '';
          if (nextLine.startsWith('♪') && nextLine.endsWith('♪')) {
            lyricContent = nextLine.slice(1, -1).trim();
          } else if (nextLine.match(/^\([^)]+\)$/) || nextLine.match(/^\*\*[^*]+\*\*$/)) {
            j++;
            continue;
          } else if (nextLine.startsWith('♪')) {
            lyricContent = nextLine.slice(1).replace(/♪$/, '').trim();
          } else {
            lyricContent = nextLine;
          }
          if (lyricContent) {
            lyricContent = lyricContent.replace(/\[[^\]]+\]/g, '').trim();
            if (lyricContent) {
              lyricContent = this.formatLyricText(lyricContent);
              lyricLines.push(lyricContent);
            }
          }
          j++;
        }
        if (lyricLines.length > 0) {
          const combinedLyrics = lyricLines.join(' ');
          lyrics.push(`${combinedLyrics} [${minutes}:${seconds.toString().padStart(2, '0')}]`);
        }
        i = j - 1; 
      }
    }
    return lyrics.join('\n');
  } catch (error) {
    console.error('Error converting transcript:', error);
    return null;
  }
}
async autoFetchTranscript() {
  if (!this.currentSongForImport) return;
  const loadingIndicator = document.getElementById('loadingIndicator');
  const autoFetchBtn = document.getElementById('autoFetchTranscriptBtn');
  const transcriptInput = document.getElementById('transcriptInput');
  try {
    loadingIndicator.style.display = 'flex';
    autoFetchBtn.disabled = true;
    autoFetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
    const videoUrl = `https://www.youtube.com/watch?v=${this.currentSongForImport.videoId}`;
    const apiUrl = `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(videoUrl)}&text=false`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': this.supadataApiKey,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Supadata API Response:', data); 
    let transcriptText = '';
    if (data.content) {
      if (Array.isArray(data.content)) {
        transcriptText = this.formatSupadataTranscriptForConversion(data.content);
      } else if (typeof data.content === 'string') {
        transcriptText = this.addTimestampsToPlainText(data.content);
      } else {
        throw new Error('Unexpected transcript format');
      }
      if (!transcriptText.trim()) {
        throw new Error('Empty transcript received');
      }
      transcriptInput.value = transcriptText;
      console.log('Formatted transcript:', transcriptText.substring(0, 200) + '...'); 
      this.showNotification('Transcript fetched successfully!', 'success');
      setTimeout(() => {
        this.convertTranscriptToLyricsHandler();
      }, 500);
    } else {
      throw new Error('No transcript content received');
    }
  } catch (error) {
    console.error('Error fetching transcript:', error);
    let errorMessage = 'Failed to fetch transcript. ';
    if (error.message.includes('401')) {
      errorMessage += 'Invalid API key.';
    } else if (error.message.includes('404')) {
      errorMessage += 'Video not found or no transcript available.';
    } else if (error.message.includes('429')) {
      errorMessage += 'Rate limit exceeded. Please try again later.';
    } else {
      errorMessage += 'This probably means this song does not have transcripts.';
    }
    this.showNotification(errorMessage, 'error');
  } finally {
    loadingIndicator.style.display = 'none';
    autoFetchBtn.disabled = false;
    autoFetchBtn.innerHTML = '<i class="fas fa-magic"></i> Auto-Fetch Transcript';
  }
}
addTimestampsToPlainText(plainText) {
  try {
    const lines = plainText.split('\n').filter(line => line.trim());
    const formattedLines = [];
    let currentTime = 0;
    const secondsPerLine = 3.5;
    for (const line of lines) {
      if (line.trim()) {
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        formattedLines.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        formattedLines.push(line.trim());
        formattedLines.push('');
        const wordCount = line.split(' ').length;
        currentTime += Math.max(secondsPerLine, wordCount * 0.5);
      }
    }
    return formattedLines.join('\n');
  } catch (error) {
    console.error('Error adding timestamps to plain text:', error);
    return plainText; 
  }
}
formatSupadataTranscriptForConversion(transcriptArray) {
  try {
    const formattedLines = [];
    for (const segment of transcriptArray) {
      if (segment.offset !== undefined && segment.text) {
        const totalSeconds = Math.floor(segment.offset / 1000); 
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        formattedLines.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        formattedLines.push(segment.text.trim());
        formattedLines.push('');
      }
    }
    return formattedLines.join('\n');
  } catch (error) {
    console.error('Error formatting Supadata transcript:', error);
    return '';
  }
}
formatLyricText(text) {
  text = text.replace(/♪/g, '').trim();
  text = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  text = text.toLowerCase();
  text = text.charAt(0).toUpperCase() + text.slice(1);
  text = text.replace(/\bi\b/g, 'I');
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
    this.animateBars();
    this.animateParticles();
    this.visualizer.animationId = requestAnimationFrame(() => this.animateVisualizer());
}
animateBars() {
    this.visualizer.bars.forEach((bar, index) => {
        let intensity = this.isPlaying ? 1.5 : 0.15; 
        let baseHeight = Math.random() * 100 * intensity;
        let rhythmMultiplier = Math.sin(Date.now() * 0.01 + index * 0.3) * 0.5 + 0.5;
        let height = baseHeight * rhythmMultiplier + 4;
        if (this.isPlaying) {
            height += Math.sin(Date.now() * 0.005 + index * 0.1) * 30;
        } else {
            height += Math.sin(Date.now() * 0.002 + index * 0.1) * 5; 
        }
        bar.style.height = Math.max(4, height) + 'px';
    });
}
animateParticles() {
    const ctx = this.visualizer.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.visualizer.canvas.width, this.visualizer.canvas.height);
    if (Math.random() < (this.isPlaying ? 0.3 : 0.05)) { 
        this.createParticle();
    }
    this.visualizer.particles = this.visualizer.particles.filter(particle => {
        let speedMultiplier = this.isPlaying ? 1 : 0.3;
        particle.x += particle.vx * speedMultiplier;
        particle.y += particle.vy * speedMultiplier;
        particle.life -= 0.01;
        particle.opacity = particle.life;
        if (particle.life <= 0) return false;
        ctx.save();
        ctx.globalAlpha = particle.opacity * (this.isPlaying ? 0.6 : 0.3); 
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
destroyVisualizer() {
    this.visualizer.isActive = false;
    if (this.visualizer.animationId) {
        cancelAnimationFrame(this.visualizer.animationId);
    }
}
 initSupabaseForFindSongs() {
    if (!this.supabase) {
        const supabaseUrl = 'https://cwhxanbpymkngzpbsshh.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aHhhbmJweW1rbmd6cGJzc2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTQzMTksImV4cCI6MjA2OTQzMDMxOX0.6K3eM1XoWaPmyMHsLYgw0mAnSxYjME4clflL4PxQalQ';
        this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
}
initializeGlobalLibrary() {
    this.initSupabaseForFindSongs();
    this.globalLibrarySupabase = this.supabase;
}
setupGlobalLibraryEventListeners() {
    document.getElementById('globalLibraryEditBtn').addEventListener('click', () => this.openGlobalLibraryModal());
    document.getElementById('globalLibraryCloseBtn').addEventListener('click', () => this.closeGlobalLibraryModal());
    document.getElementById('globalLibraryLoginBtn').addEventListener('click', () => this.globalLibraryLogin());
    document.getElementById('globalLibraryLogoutBtn').addEventListener('click', () => this.globalLibraryLogout());
    document.getElementById('globalLibraryCreateBtn').addEventListener('click', () => this.globalLibraryCreatePlaylist());
    document.getElementById('globalLibraryAddSongBtn').addEventListener('click', () => this.globalLibraryAddSong());
    document.getElementById('globalLibraryMassImportBtn').addEventListener('click', () => this.globalLibraryMassImport());
    document.getElementById('globalLibrarySearchBar').addEventListener('input', (e) => this.globalLibrarySearch(e.target.value));
    document.getElementById('globalLibraryPlaylistSearch').addEventListener('input', (e) => this.filterPlaylistSelect(e.target.value));
}
openGlobalLibraryModal() {
    document.getElementById('globalLibraryModal').style.display = 'block';
    if (this.globalLibraryCurrentUser) {
        this.showGlobalLibraryMainSection();
    } else {
        this.showGlobalLibraryLoginSection();
    }
    if (this.globalLibraryCurrentUser && this.pendingGlobalImport) {
        setTimeout(() => this.autofillGlobalLibraryImport(), 100);
    }
}
closeGlobalLibraryModal() {
    document.getElementById('globalLibraryModal').style.display = 'none';
}
showGlobalLibraryLoginSection() {
    document.getElementById('globalLibraryLoginSection').style.display = 'block';
    document.getElementById('globalLibraryMainSection').style.display = 'none';
}
showGlobalLibraryMainSection() {
    document.getElementById('globalLibraryLoginSection').style.display = 'none';
    document.getElementById('globalLibraryMainSection').style.display = 'block';
    document.getElementById('globalLibraryUserInfo').textContent = `Welcome, ${this.globalLibraryCurrentUser.email}`;
    this.loadGlobalLibraryData();
    this.loadTopSongsManagement(); 
    this.autofillGlobalLibraryImport();
}
 handleImportToGlobalLibrary() {
    if (!this.currentAiResults) {
        this.showAiError('No results to import');
        return;
    }
    const artistName = this.elements.aiArtistName.value.trim();
    this.pendingGlobalImport = {
        playlistName: artistName,
        importText: this.currentAiResults
    };
    console.log('Storing pending import:', this.pendingGlobalImport);
    this.closeAiGenerator();
    this.openGlobalLibraryModal();
}
autofillGlobalLibraryImport() {
    if (!this.pendingGlobalImport) return;
    console.log('Pending import data:', this.pendingGlobalImport);
    document.getElementById('globalLibraryNewPlaylistName').value = this.pendingGlobalImport.playlistName;
    const textArea = document.getElementById('globalLibraryMassImportText');
    textArea.value = this.pendingGlobalImport.importText;
    console.log('TextArea value set to:', textArea.value);
    this.pendingGlobalImport = null;
}
  filterPlaylistSelect(searchQuery) {
    const select = document.getElementById('globalLibrarySongPlaylistSelect');
    const massImportSelect = document.getElementById('globalLibraryMassImportSelect');
    const filteredOptions = this.globalLibraryArtists.filter(artist => 
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const optionsHTML = '<option value="">Select Playlist</option>' + 
        filteredOptions.map(artist => `<option value="${artist.id}">🎵 ${artist.name}</option>`).join('');
    select.innerHTML = optionsHTML;
    massImportSelect.innerHTML = '<option value="">Select Playlist for Import</option>' + 
        filteredOptions.map(artist => `<option value="${artist.id}">🎵 ${artist.name}</option>`).join('');
}
async globalLibraryLogin() {
    const email = document.getElementById('globalLibraryEmail').value;
    const password = document.getElementById('globalLibraryPassword').value;
    if (!email || !password) {
        this.showGlobalLibraryMessage('Please enter email and password', 'error');
        return;
    }
    const { data, error } = await this.globalLibrarySupabase.auth.signInWithPassword({ email, password });
    if (error) {
        this.showGlobalLibraryMessage(error.message, 'error');
    } else {
        this.globalLibraryCurrentUser = data.user;
        this.showGlobalLibraryMainSection();
        this.showGlobalLibraryMessage('Login successful!', 'success');
    }
}
async globalLibraryLogout() {
    await this.globalLibrarySupabase.auth.signOut();
    this.globalLibraryCurrentUser = null;
    this.showGlobalLibraryLoginSection();
}
async loadGlobalLibraryData() {
    try {
        const { data: artists, error } = await this.globalLibrarySupabase
            .from('artists')
            .select(`id, name, songs(id, name, author, youtube_url)`)
            .order('name');
        if (error) throw error;
        this.globalLibraryArtists = artists || [];
        this.displayGlobalLibraryArtists();
        this.updateGlobalLibraryPlaylistSelects();
    } catch (error) {
        this.showGlobalLibraryMessage('Error loading data: ' + error.message, 'error');
    }
}
displayGlobalLibraryArtists() {
    const container = document.getElementById('globalLibraryArtistsContainer');
    const searchFilter = (this.globalLibrarySearchFilter || '').toLowerCase();
    const filteredArtists = this.globalLibraryArtists.filter(artist => {
        const artistName = (artist.name || '').toLowerCase();
        if (artistName.includes(searchFilter)) return true;
        return artist.songs && artist.songs.some(song => {
            const songName = (song.name || '').toLowerCase();
            const songAuthor = (song.author || '').toLowerCase();
            return songName.includes(searchFilter) || songAuthor.includes(searchFilter);
        });
    });
    container.innerHTML = filteredArtists.map(artist => `
        <div class="global-library-artist-card">
            <div class="global-library-artist-header">
                <div class="global-library-artist-name">🎵 ${artist.name || 'Unnamed Playlist'}</div>
                <button onclick="musicPlayer.deleteGlobalLibraryPlaylist(${artist.id})" class="global-library-btn-small global-library-btn-danger">Delete</button>
            </div>
            <div>
                ${(artist.songs || []).map(song => `
                    <div class="global-library-song-item">
                        <div class="global-library-song-content">
                            <div class="global-library-song-name">${song.name || 'Unnamed Song'}</div>
                            <div class="global-library-song-author">by ${song.author || 'Unknown Artist'}</div>
                        </div>
                        <div class="global-library-song-actions">
                            <button onclick="window.open('${song.youtube_url || ''}', '_blank')" class="global-library-btn-small">▶️</button>
                            <button onclick="musicPlayer.deleteGlobalLibrarySong(${song.id})" class="global-library-btn-small global-library-btn-danger">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="text-align: right; margin-top: 10px; color: var(--text-secondary); font-size: 12px;">
                ${(artist.songs || []).length} songs
            </div>
        </div>
    `).join('');
}
updateGlobalLibraryPlaylistSelects() {
    const select = document.getElementById('globalLibrarySongPlaylistSelect');
    const massImportSelect = document.getElementById('globalLibraryMassImportSelect');
    select.innerHTML = '<option value="">Select Playlist</option>' + 
        this.globalLibraryArtists.map(artist => `<option value="${artist.id}">🎵 ${artist.name}</option>`).join('');
    massImportSelect.innerHTML = '<option value="">Select Playlist for Import</option>' + 
        this.globalLibraryArtists.map(artist => `<option value="${artist.id}">🎵 ${artist.name}</option>`).join('');
}
async globalLibraryMassImport() {
    const artistId = document.getElementById('globalLibraryMassImportSelect').value;
    const importText = document.getElementById('globalLibraryMassImportText').value.trim();
    if (!artistId) {
        this.showGlobalLibraryMessage('Please select a playlist', 'error');
        return;
    }
    if (!importText) {
        this.showGlobalLibraryMessage('Please enter songs to import', 'error');
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
            created_by: this.globalLibraryCurrentUser.id
        });
    });
    if (errors.length > 0) {
        this.showGlobalLibraryMessage('Import errors: ' + errors.join(', '), 'error');
        return;
    }
    const { error } = await this.globalLibrarySupabase
        .from('songs')
        .insert(songsToImport);
    if (error) {
        this.showGlobalLibraryMessage('Error importing songs: ' + error.message, 'error');
    } else {
        this.showGlobalLibraryMessage(`Successfully imported ${songsToImport.length} songs!`, 'success');
        document.getElementById('globalLibraryMassImportText').value = '';
        document.getElementById('globalLibraryMassImportSelect').value = '';
        this.loadGlobalLibraryData();
    }
}
async globalLibraryCreatePlaylist() {
    const name = document.getElementById('globalLibraryNewPlaylistName').value.trim();
    if (!name) {
        this.showGlobalLibraryMessage('Please enter a playlist name', 'error');
        return;
    }
    const { error } = await this.globalLibrarySupabase
        .from('artists')
        .insert([{ name, created_by: this.globalLibraryCurrentUser.id }]);
    if (error) {
        this.showGlobalLibraryMessage('Error creating playlist: ' + error.message, 'error');
    } else {
        this.showGlobalLibraryMessage('Playlist created successfully!', 'success');
        document.getElementById('globalLibraryNewPlaylistName').value = '';
        this.loadGlobalLibraryData();
    }
}
async globalLibraryAddSong() {
    const artistId = document.getElementById('globalLibrarySongPlaylistSelect').value;
    const name = document.getElementById('globalLibraryNewSongName').value.trim();
    const author = document.getElementById('globalLibraryNewSongAuthor').value.trim();
    const youtubeUrl = document.getElementById('globalLibraryNewSongUrl').value.trim();
    if (!artistId || !name || !author || !youtubeUrl) {
        this.showGlobalLibraryMessage('Please fill in all fields', 'error');
        return;
    }
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
        this.showGlobalLibraryMessage('Please enter a valid YouTube URL', 'error');
        return;
    }
    const { error } = await this.globalLibrarySupabase
        .from('songs')
        .insert([{ name, author, youtube_url: youtubeUrl, artist_id: parseInt(artistId), created_by: this.globalLibraryCurrentUser.id }]);
    if (error) {
        this.showGlobalLibraryMessage('Error adding song: ' + error.message, 'error');
    } else {
        this.showGlobalLibraryMessage('Song added successfully!', 'success');
        document.getElementById('globalLibrarySongPlaylistSelect').value = '';
        document.getElementById('globalLibraryNewSongName').value = '';
        document.getElementById('globalLibraryNewSongAuthor').value = '';
        document.getElementById('globalLibraryNewSongUrl').value = '';
        this.loadGlobalLibraryData();
    }
}
async deleteGlobalLibraryPlaylist(artistId) {
    if (!confirm('Delete this playlist and all its songs?')) return;
    const { error } = await this.globalLibrarySupabase
        .from('artists')
        .delete()
        .eq('id', artistId);
    if (error) {
        this.showGlobalLibraryMessage('Error deleting playlist: ' + error.message, 'error');
    } else {
        this.showGlobalLibraryMessage('Playlist deleted successfully!', 'success');
        this.loadGlobalLibraryData();
    }
}
async deleteGlobalLibrarySong(songId) {
    if (!confirm('Delete this song?')) return;
    const { error } = await this.globalLibrarySupabase
        .from('songs')
        .delete()
        .eq('id', songId);
    if (error) {
        this.showGlobalLibraryMessage('Error deleting song: ' + error.message, 'error');
    } else {
        this.showGlobalLibraryMessage('Song deleted successfully!', 'success');
        this.loadGlobalLibraryData();
    }
}
globalLibrarySearch(query) {
    this.globalLibrarySearchFilter = query || '';
    this.displayGlobalLibraryArtists();
}
showGlobalLibraryMessage(message, type) {
    const messagesDiv = document.getElementById('globalLibraryMessages');
    messagesDiv.innerHTML = `<div class="global-library-${type}">${message}</div>`;
    setTimeout(() => messagesDiv.innerHTML = '', 3000);
}
async openFindSongs() {
    if (!this.supabase) {
        this.initSupabaseForFindSongs();
    }
    this.elements.findSongsDiv.style.display = "flex";
    this.elements.findSongsSearch.focus();
    await this.loadAllArtists();
    this.displaySearchResults(this.allArtists, [], 'playlists');
    await this.loadRecommendations();
}
closeFindSongs() {
    this.elements.findSongsDiv.style.display = "none";
    this.elements.findSongsResults.innerHTML = "";
    this.elements.findSongsSearch.value = "";
    this.currentViewMode = 'playlists'; 
}
displaySearchResults(artists, individualSongs = [], mode = 'mixed') {
    let resultsHTML = '';
    const limitedSongs = individualSongs.slice(0, 10);
    if (limitedSongs && limitedSongs.length > 0) {
        resultsHTML += `
            <div class="search-section">
                <div class="individual-songs-results">
                    ${limitedSongs.map(song => `
                        <div class="individual-song-result">
                            <div class="song-info">
                                <div class="song-name">${song.name}</div>
                                <div class="song-author">by ${song.author || 'Unknown Artist'}</div>
                                <div class="song-playlist">from playlist: ${song.playlist_name}</div>
                            </div>
                            <div class="song-actions">
                                <button class="preview-btn" onclick="window.open('${song.youtube_url}', '_blank')" title="Open in YouTube">
                                    ▶️
                                </button>
                                <button class="add-single-song-btn" onclick="musicPlayer.addSingleSongToLibrary('${song.name}', '${song.author || ''}', '${song.youtube_url}')">
                                    Add Song
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    const limitedArtists = artists.slice(0, 10);
    if (limitedArtists && limitedArtists.length > 0) {
        resultsHTML += `
            <div class="search-section">
                <div class="playlist-results">
                    ${limitedArtists.map(artist => {
                        const songsPreview = artist.songs.slice(0, 3); 
                        const remainingSongs = artist.songs.length - 3;
                        return `
                            <div class="playlist-result">
                                <div class="playlist-header">
                                    <div class="playlist-name">${artist.name}</div>
                                    <div class="song-count">${artist.songs.length} songs</div>
                                </div>
                                <div class="playlist-songs">
                                    ${songsPreview.map(song => `
                                        <div class="song-preview">${song.name} ${song.author ? `- ${song.author}` : ''}</div>
                                    `).join('')}
                                    ${remainingSongs > 0 ? `<div class="song-preview">... and ${remainingSongs} more songs</div>` : ''}
                                </div>
                                <div class="playlist-actions">
                                    <button class="view-all-btn" onclick="musicPlayer.openDetailedPlaylistView(${artist.id}, '${artist.name.replace(/'/g, "\\'")}')">
                                        View All
                                    </button>
                                    <button class="add-to-library-btn" onclick="musicPlayer.addPlaylistToLibrary(${artist.id}, '${artist.name.replace(/'/g, "\\'")}')">
                                        Add to Library
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    if (resultsHTML === '') {
        this.elements.findSongsResults.innerHTML = '<div class="loading-spinner">No results found</div>';
    } else {
        this.elements.findSongsResults.innerHTML = resultsHTML;
    }
    this.elements.notFindingSection.style.display = "block";
}
async viewAllSongs(artistId, artistName) {
    try {
        const { data: songs, error } = await this.supabase
            .from('songs')
            .select('*')
            .eq('artist_id', artistId);
        if (error) throw error;
        alert(`${artistName} - All Songs:\n\n${songs.map(song => `${song.name} ${song.author ? `- ${song.author}` : ''}`).join('\n')}`);
    } catch (error) {
        console.error('Error fetching all songs:', error);
        alert('Error loading all songs');
    }
}
async addPlaylistToLibrary(artistId, artistName) {
    try {
        const { data: songs, error } = await this.supabase
            .from('songs')
            .select('*')
            .eq('artist_id', artistId);
        if (error) throw error;
        const importText = songs.map(song => `${song.name}, ${song.youtube_url}, ${song.author || ''}`).join('\n');
        const playlistImportText = `${artistName}{\n${importText}\n}`;
        this.importLibrary(playlistImportText);
        this.closeFindSongs();
    } catch (error) {
        console.error('Error adding playlist to library:', error);
        alert('Error adding playlist to library');
    }
}
async loadAllArtists() {
    if (this.allArtists.length > 0) return; 
    this.elements.findSongsResults.innerHTML = '<div class="loading-spinner">Loading playlists...</div>';
    try {
        const { data: artists, error } = await this.supabase
            .from('artists')
            .select(`
                id,
                name,
                songs (
                    id,
                    name,
                    author,
                    youtube_url
                )
            `)
            .order('id', { ascending: true })
            .limit(50); 
        if (error) throw error;
        this.allArtists = artists || [];
        this.allSongs = [];
        artists.forEach(artist => {
            const limitedSongs = artist.songs.slice(0, 20);
            limitedSongs.forEach(song => {
                this.allSongs.push({
                    ...song,
                    playlist_name: artist.name,
                    playlist_id: artist.id
                });
            });
        });
    } catch (error) {
        console.error('Error loading artists:', error);
        this.elements.findSongsResults.innerHTML = '<div class="loading-spinner">Error loading playlists</div>';
    }
}
filterResults() {
    const searchTerm = this.elements.findSongsSearch.value.trim().toLowerCase();
    if (!searchTerm) {
        this.displaySearchResults(this.allArtists.slice(0, 10), [], 'playlists');
        return;
    }
    const filteredArtists = this.allArtists.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm) ||
        artist.songs.some(song => 
            song.name.toLowerCase().includes(searchTerm) ||
            (song.author && song.author.toLowerCase().includes(searchTerm))
        )
    ).slice(0, 10);
    const filteredSongs = this.allSongs.filter(song =>
        song.name.toLowerCase().includes(searchTerm) ||
        (song.author && song.author.toLowerCase().includes(searchTerm)) ||
        song.playlist_name.toLowerCase().includes(searchTerm)
    ).slice(0, 10);
    this.displaySearchResults(filteredArtists, filteredSongs, 'mixed');
}
async openDetailedPlaylistView(artistId, artistName) {
    try {
        const { data: songs, error } = await this.supabase
            .from('songs')
            .select('*')
            .eq('artist_id', artistId)
            .order('name');
        if (error) throw error;
        const detailModal = document.createElement('div');
        detailModal.className = 'detailed-playlist-modal';
        detailModal.innerHTML = `
            <div class="detailed-playlist-content">
                <div class="detailed-playlist-header">
                    <h2>${artistName}</h2>
                    <div class="detailed-playlist-stats">${songs.length} songs total</div>
                    <button class="close-detailed-view" onclick="this.closest('.detailed-playlist-modal').remove()">×</button>
                </div>
                <div class="detailed-playlist-actions">
                    <button class="add-all-songs-btn" onclick="musicPlayer.addPlaylistToLibrary(${artistId}, '${artistName.replace(/'/g, "\\'")}'); this.closest('.detailed-playlist-modal').remove();">
                        Add All to Library
                    </button>
                </div>
                <div class="detailed-songs-list">
                    ${songs.map((song, index) => `
                        <div class="detailed-song-item">
                            <div class="song-index">${index + 1}</div>
                            <div class="detailed-song-info">
                                <div class="detailed-song-name">${song.name}</div>
                                <div class="detailed-song-author">by ${song.author || 'Unknown Artist'}</div>
                            </div>
                            <div class="detailed-song-actions">
                                <button class="preview-btn" onclick="window.open('${song.youtube_url}', '_blank')" title="Open in YouTube">
                                    ▶️
                                </button>
                                <button class="add-single-song-btn" onclick="musicPlayer.addSingleSongToLibrary('${song.name.replace(/'/g, "\\'")}', '${(song.author || '').replace(/'/g, "\\'")}', '${song.youtube_url}')">
                                    Add Song
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(detailModal);
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                detailModal.remove();
            }
        });
    } catch (error) {
        console.error('Error fetching detailed playlist:', error);
        alert('Error loading playlist details');
    }
}
async addSingleSongToLibrary(songName, songAuthor, youtubeUrl) {
    const videoId = this.extractYouTubeId(youtubeUrl);
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
    try {
        await this.saveSongLibrary();
        this.renderSongLibrary();
        this.updatePlaylistSelection();
        const successMsg = document.createElement('div');
        successMsg.className = 'success-toast';
        successMsg.textContent = `Added "${songName}" to library!`;
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
    } catch (error) {
        console.error("Error adding song to library:", error);
        alert("Failed to save song. Please try again.");
    }
}
 handleLibrarySortToggle(event) {
    this.librarySortAlphabetically = event.target.checked;
    this.renderSongLibrary();
    this.saveSetting("librarySortAlphabetically", this.librarySortAlphabetically);
}
loadLibrarySortSetting() {
    if (!this.db) return;
    const transaction = this.db.transaction(["settings"], "readonly");
    const store = transaction.objectStore("settings");
    const request = store.get("librarySortAlphabetically");
    request.onsuccess = () => {
        this.librarySortAlphabetically = request.result ? request.result.value : true;
        if (this.elements.librarySortToggle) {
            this.elements.librarySortToggle.checked = this.librarySortAlphabetically;
        }
        if (this.elements.songLibrary) {
            this.renderSongLibrary();
        }
    };
    request.onerror = () => {
        this.librarySortAlphabetically = true;
        if (this.elements.librarySortToggle) {
            this.elements.librarySortToggle.checked = true;
        }
    };
}
  handleLibraryReverseToggle(event) {
    this.libraryReverseOrder = event.target.checked;
    this.renderSongLibrary();
    this.saveSetting("libraryReverseOrder", this.libraryReverseOrder);
}
loadLibraryReverseSetting() {
    if (!this.db) return;
    const transaction = this.db.transaction(["settings"], "readonly");
    const store = transaction.objectStore("settings");
    const request = store.get("libraryReverseOrder");
    request.onsuccess = () => {
        this.libraryReverseOrder = request.result ? request.result.value : false;
        if (this.elements.libraryReverseToggle) {
            this.elements.libraryReverseToggle.checked = this.libraryReverseOrder;
        }
        if (this.elements.songLibrary) {
            this.renderSongLibrary();
        }
    };
    request.onerror = () => {
        this.libraryReverseOrder = false;
        if (this.elements.libraryReverseToggle) {
            this.elements.libraryReverseToggle.checked = false;
        }
    };
}
  openAiGenerator() {
    this.elements.aiGeneratorDiv.style.display = "flex";
    const searchTerm = this.elements.findSongsSearch.value.trim();
    if (searchTerm) {
        this.elements.aiArtistName.value = searchTerm;
    }
    this.elements.aiArtistName.focus();
}
closeAiGenerator() {
    this.elements.aiGeneratorDiv.style.display = "none";
    this.elements.aiOutputSection.style.display = "none";
    this.elements.aiOutput.innerHTML = "";
    this.elements.aiCopyBtn.style.display = "none";
    this.elements.aiImportGlobalBtn.style.display = "none";
    this.elements.aiImportBtn.style.display = "none";
    this.elements.aiRequiredSongs.value = "";
    this.currentAiResults = '';
    this.removeAiMessages();
}
async generateAiSongs() {
    const artist = this.elements.aiArtistName.value.trim();
    const quantity = this.elements.aiSongCount.value;
    const generateBtn = this.elements.aiGenerateBtn;
    const outputContainer = this.elements.aiOutput;
    if (!artist) {
        this.showAiError('Please enter an artist name');
        return;
    }
    if (!quantity || quantity < 1 || quantity > 50) {
        this.showAiError('Please enter a valid number of songs (1-50)');
        return;
    }
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    this.elements.aiCopyBtn.style.display = 'none';
    this.elements.aiImportGlobalBtn.style.display = 'none';
    this.elements.aiImportBtn.style.display = 'none';
    this.elements.aiOutputSection.style.display = 'block';
    outputContainer.innerHTML = '<div class="ai-loading">Analyzing query type...</div>';
    try {
        outputContainer.innerHTML = '<div class="ai-loading">Getting song list from AI...</div>';
        const songData = await this.getSongTitlesFromGemini(artist, quantity);
        const queryType = songData[0]?.queryType || 'UNKNOWN';
        const typeMessage = queryType === 'SPECIFIC_ARTIST' ? 
            `Detected: Songs by ${artist}` : 
            `Detected: Broad music request`;
        outputContainer.innerHTML = `<div class="ai-loading">${typeMessage}<br>Searching YouTube for official videos...</div>`;
        const songsWithLinks = await this.searchYouTubeForSongs(songData, artist);
        const formattedOutput = songsWithLinks
            .map(song => `${song.title},${song.url},${song.artist}`)
            .join('\n');
        outputContainer.textContent = formattedOutput;
        this.currentAiResults = formattedOutput;
        this.elements.aiCopyBtn.style.display = 'inline-block';
        this.elements.aiImportGlobalBtn.style.display = 'inline-block';
        this.elements.aiImportBtn.style.display = 'inline-block';
        const detectionInfo = queryType === 'SPECIFIC_ARTIST' ? 
            `Found ${songsWithLinks.length} songs by ${artist}!` :
            `Found ${songsWithLinks.length} songs matching your request!`;
        this.showAiSuccess(`${detectionInfo} All have verified YouTube links.`);
    } catch (error) {
        console.error('Error:', error);
        outputContainer.innerHTML = '';
        this.elements.aiOutputSection.style.display = 'none';
        this.showAiError(`Failed to generate song list: ${error.message}`);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Regenerate Song List';
    }
}
async getSongTitlesFromGemini(author, quantity) {
    const requiredSongs = this.elements.aiRequiredSongs.value.trim();
    const requiredSongsList = requiredSongs ? requiredSongs.split(',').map(s => s.trim()).filter(s => s) : [];
    const currentDate = new Date().toISOString().split('T')[0];
    const classificationPrompt = `Analyze this music query and respond with only "SPECIFIC_ARTIST" or "BROAD_REQUEST":
Query: "${author}"
SPECIFIC_ARTIST = songs by one artist/band
BROAD_REQUEST = category/genre/trend request`;
    const classificationResponse = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: classificationPrompt }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 20
            }
        })
    });
    if (!classificationResponse.ok) {
        throw new Error(`Classification API error: ${classificationResponse.status}`);
    }
    const classificationData = await classificationResponse.json();
    const classification = classificationData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "BROAD_REQUEST";
    console.log(`AI Classification for "${author}": ${classification}`);
    const isSpecificArtist = classification === "SPECIFIC_ARTIST";
    let prompt;
    if (isSpecificArtist) {
        prompt = `Return exactly ${quantity} real song titles by ${author}. 
${requiredSongsList.length > 0 ? `Include these required songs if they exist:\n${requiredSongsList.join('\n')}\n\n` : ''}Format: One song title per line, no numbers, no bullets, no extra text.
Only song titles, nothing else.
Include recent 2024-2025 releases and popular tracks.
Song titles:`;
    } else {
        prompt = `Return exactly ${quantity} real songs matching "${author}".
${requiredSongsList.length > 0 ? `Include these required songs if they match:\n${requiredSongsList.join('\n')}\n\n` : ''}Format: "Song Title by Artist Name" (one per line)
No numbers, no bullets, no extra text.
Include current trending songs from 2024-2025.
Song list:`;
    }
    const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 800,
                topP: 0.8,
                topK: 10,
                stopSequences: ["Here is", "Here are", "I found", "Based on", "According to"]
            }
        })
    });
    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const result = data.candidates[0].content.parts[0].text;
        const lines = result.split('\n')
            .map(line => line.trim())
            .filter(line => {
                if (!line) return false;
                if (line.match(/^\d+\.?\s*/)) return false; 
                if (line.startsWith('-') || line.startsWith('*')) return false; 
                if (line.toLowerCase().includes('here is') || 
                    line.toLowerCase().includes('here are') ||
                    line.toLowerCase().includes('i found') ||
                    line.toLowerCase().includes('based on') ||
                    line.toLowerCase().includes('according to') ||
                    line.toLowerCase().includes('verified') ||
                    line.toLowerCase().includes('discography') ||
                    line.toLowerCase().includes('internet search')) return false;
                return true;
            })
            .slice(0, quantity);
        if (isSpecificArtist) {
            return lines.map(title => ({ 
                title: title.replace(/^[\d\.\-\*\s]+/, '').trim(), 
                artist: author,
                queryType: 'SPECIFIC_ARTIST'
            }));
        } else {
            return lines.map(line => {
                const cleanLine = line.replace(/^[\d\.\-\*\s]+/, '').trim();
                const byMatch = cleanLine.match(/^(.+?)\s+by\s+(.+)$/i);
                if (byMatch) {
                    const songTitle = byMatch[1].trim();
                    const artistInfo = byMatch[2].trim();
                    return {
                        title: songTitle,
                        artist: artistInfo,
                        queryType: 'BROAD_REQUEST'
                    };
                } else {
                    return {
                        title: cleanLine,
                        artist: 'Unknown',
                        queryType: 'BROAD_REQUEST'
                    };
                }
            });
        }
    } else {
        throw new Error('No valid response from Gemini API');
    }
}
async searchYouTubeForSongs(songData, authorQuery) {
    const songsWithLinks = [];
    const usedVideoIds = new Set();
    for (let i = 0; i < songData.length; i++) {
        const { title, artist } = songData[i];
        try {
            const outputContainer = this.elements.aiOutput;
            outputContainer.innerHTML = `<div class="ai-loading">Searching YouTube for "${title}" by ${artist} (${i + 1}/${songData.length}) - Using API key ${this.activeYoutubeKeyIndex + 1}</div>`;
            const mainArtist = artist.split(/\s+(?:ft\.?|feat\.?|featuring)\s+/i)[0].trim();
            const searchQueries = [
                `"${title}" "${mainArtist}"`,
                `"${title}" "${artist}"`,
                `${title} ${mainArtist} official`,
                `${title} ${artist}`,
                `${mainArtist} ${title}`,
                `${title}`
            ];
            let bestMatch = null;
            for (const searchQuery of searchQueries) {
                try {
                    const data = await this.searchYouTubeWithRotation(searchQuery);
                    if (data.items && data.items.length > 0) {
                        const availableItems = data.items.filter(item => !usedVideoIds.has(item.id.videoId));
                        if (availableItems.length > 0) {
                            bestMatch = this.findBestYouTubeMatch(availableItems, title, artist, mainArtist);
                            if (bestMatch) {
                                usedVideoIds.add(bestMatch.id.videoId);
                                break;
                            }
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (searchError) {
                    console.error(`Error with search query "${searchQuery}":`, searchError);
                    if (searchError.message.includes('All API keys failed')) {
                        throw searchError;
                    }
                    continue;
                }
            }
            if (bestMatch) {
                songsWithLinks.push({
                    title: title,
                    artist: artist,
                    url: `https://www.youtube.com/watch?v=${bestMatch.id.videoId}`
                });
            } else {
                console.log(`No suitable YouTube video found for: "${title}" by ${artist}`);
                songsWithLinks.push({
                    title: title,
                    artist: artist,
                    url: `# No YouTube link found`
                });
            }
        } catch (error) {
            console.error(`Error searching for "${title}" by ${artist}:`, error);
            if (error.message.includes('All API keys failed')) {
                outputContainer.innerHTML = `<div class="ai-loading">All API keys exhausted for today. Returning results found so far...</div>`;
                break;
            }
            songsWithLinks.push({
                title: title,
                artist: artist,
                url: `# API Error: ${error.message}`
            });
            continue;
        }
    }
    return songsWithLinks;
}
getCurrentAPIKey() {
    return this.YOUTUBE_API_KEYS[this.activeYoutubeKeyIndex];
}
rotateToNextAPIKey() {
    this.activeYoutubeKeyIndex = (this.activeYoutubeKeyIndex + 1) % this.YOUTUBE_API_KEYS.length;
    console.log(`Rotated to API key index: ${this.activeYoutubeKeyIndex}`);
}
async searchYouTubeWithRotation(searchQuery) {
    for (let keyAttempt = 0; keyAttempt < this.YOUTUBE_API_KEYS.length; keyAttempt++) {
        const currentKey = this.getCurrentAPIKey();
        try {
            const response = await fetch(
                `${this.YOUTUBE_API_URL}?part=snippet&maxResults=8&q=${encodeURIComponent(searchQuery)}&type=video&key=${currentKey}`
            );
            if (!response.ok) {
                const errorData = await response.text();
                console.error(`YouTube API error with key ${this.activeYoutubeKeyIndex + 1}:`, response.status, errorData);
                if (response.status === 403) {
                    console.log(`Key ${this.activeYoutubeKeyIndex + 1} quota exceeded, trying next key...`);
                    this.rotateToNextAPIKey();
                    continue;
                } else {
                    this.rotateToNextAPIKey();
                    continue;
                }
            }
            const data = await response.json();
            if (data.error && data.error.code === 403) {
                console.log(`Key ${this.activeYoutubeKeyIndex + 1} quota exceeded, trying next key...`);
                this.rotateToNextAPIKey();
                continue;
            }
            return data;
        } catch (fetchError) {
            console.error(`Network error with key ${this.activeYoutubeKeyIndex + 1}:`, fetchError);
            this.rotateToNextAPIKey();
            continue;
        }
    }
    throw new Error('All API keys failed - try again later when quotas reset');
}
findBestYouTubeMatch(items, songTitle, artist) {
    const scoredItems = items.map(item => {
        const title = item.snippet.title.toLowerCase();
        const channelTitle = item.snippet.channelTitle.toLowerCase();
        const description = (item.snippet.description || '').toLowerCase();
        let score = 0;
        const songTitleLower = songTitle.toLowerCase();
        const artistLower = artist.toLowerCase();
        if (title === songTitleLower) {
            score += 50;
        } else if (title.includes(songTitleLower)) {
            score += 25;
        }
        if (title.includes(artistLower)) {
            score += 20;
        }
        if (channelTitle === artistLower || 
            channelTitle === `${artistLower}vevo` ||
            channelTitle === `${artistLower}official` ||
            channelTitle.includes(`${artistLower} `)) {
            score += 30;
        }
        if (title.includes('official') || 
            channelTitle.includes('official') || 
            channelTitle.includes('vevo')) {
            score += 15;
        }
        if (title.includes('music video') || 
            title.includes('official video') || 
            title.includes('mv')) {
            score += 10;
        }
        if ((title.includes('cover') || title.includes('remix') || title.includes('live')) && 
            !channelTitle.includes(artistLower)) {
            score -= 20;
        }
        if (!channelTitle.includes(artistLower) && 
            !channelTitle.includes('vevo') && 
            !channelTitle.includes('official') &&
            !description.includes(artistLower)) {
            score -= 10;
        }
        const songWords = songTitleLower.split(/\s+/).filter(word => word.length > 2);
        const matchedWords = songWords.filter(word => title.includes(word));
        score += (matchedWords.length / songWords.length) * 15;
        return { ...item, score };
    });
    scoredItems.sort((a, b) => b.score - a.score);
    console.log(`Scoring results for "${songTitle}" by ${artist}:`);
    scoredItems.slice(0, 3).forEach(item => {
        console.log(`- Score: ${item.score}, Title: "${item.snippet.title}", Channel: "${item.snippet.channelTitle}"`);
    });
    return scoredItems[0]?.score > 15 ? scoredItems[0] : null;
}
validateSongResults(songData, artist) {
    return songData.filter(song => {
        const title = song.title.toLowerCase();
        if (title.length < 2 || title.length > 100) return false;
        if (title.includes('song ') && title.includes('by ')) return false; 
        if (title.match(/^\d+\./)) return false; 
        if (title.includes('verse') && title.includes('chorus')) return false; 
        return true;
    });
}
async copyAiResults() {
    try {
        await navigator.clipboard.writeText(this.currentAiResults);
        this.showAiSuccess('Copied to clipboard!');
    } catch (error) {
        const textArea = document.createElement('textarea');
        textArea.value = this.currentAiResults;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showAiSuccess('Copied to clipboard!');
    }
}
importAiResults() {
    if (!this.currentAiResults) {
        this.showAiError('No results to import');
        return;
    }
    const artistName = this.elements.aiArtistName.value.trim();
    const playlistImportText = `${artistName}{\n${this.currentAiResults}\n}`;
    this.importLibrary(playlistImportText);
    this.closeAiGenerator();
    this.closeFindSongs();
}
showAiError(message) {
    this.removeAiMessages();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ai-error';
    errorDiv.textContent = message;
    this.elements.aiGeneratorDiv.querySelector('.ai-generator-form').appendChild(errorDiv);
    setTimeout(() => this.removeAiMessages(), 5000);
}
showAiSuccess(message) {
    this.removeAiMessages();
    const successDiv = document.createElement('div');
    successDiv.className = 'ai-success';
    successDiv.textContent = message;
    this.elements.aiGeneratorDiv.querySelector('.ai-generator-form').appendChild(successDiv);
    setTimeout(() => this.removeAiMessages(), 3000);
}
removeAiMessages() {
    const messages = this.elements.aiGeneratorDiv.querySelectorAll('.ai-error, .ai-success');
    messages.forEach(msg => msg.remove());
}
  async loadRecommendations() {
    await this.loadTopSongs();
    await this.loadRandomRecommendations();
}
async loadTopSongs() {
    try {
        const { data: topSongs, error } = await this.supabase
            .from('top_songs_of_week')
            .select(`
                position,
                songs (
                    id,
                    name,
                    author,
                    youtube_url
                )
            `)
            .order('position');
        if (error) throw error;
        this.displayTopSongs(topSongs || []);
    } catch (error) {
        console.error('Error loading top songs:', error);
        document.getElementById('topSongsContainer').innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">Unable to load top songs</div>';
    }
}
async loadRandomRecommendations() {
    try {
        const { data: randomSongs, error } = await this.supabase
            .from('songs')
            .select('id, name, author, youtube_url')
            .limit(100); 
        if (error) throw error;
        const shuffled = randomSongs.sort(() => 0.5 - Math.random());
        const selectedSongs = shuffled.slice(0, 3);
        this.displayRandomRecommendations(selectedSongs);
    } catch (error) {
        console.error('Error loading random recommendations:', error);
        document.getElementById('randomSongsContainer').innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">Unable to load recommendations</div>';
    }
}
displayTopSongs(topSongs) {
    const container = document.getElementById('topSongsContainer');
    if (!topSongs || topSongs.length === 0) {
        container.innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">No top songs set for this week</div>';
        return;
    }
    container.innerHTML = topSongs.map(item => {
        const song = item.songs;
        const thumbnailUrl = this.getYouTubeThumbnail(song.youtube_url);
        return `
            <div class="recommendation-song-item">
                <img src="${thumbnailUrl}" alt="Thumbnail" class="song-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'30\\' viewBox=\\'0 0 40 30\\'%3E%3Crect fill=\\'%23ddd\\' width=\\'40\\' height=\\'30\\'/%3E%3Ctext x=\\'20\\' y=\\'18\\' text-anchor=\\'middle\\' font-size=\\'8\\' fill=\\'%23666\\'%3E♪%3C/text%3E%3C/svg%3E'">
                <div class="recommendation-song-info">
                    <div class="recommendation-song-name">${song.name}</div>
                    <div class="recommendation-song-author">by ${song.author || 'Unknown'}</div>
                </div>
            </div>
        `;
    }).join('');
}
displayRandomRecommendations(songs) {
    const container = document.getElementById('randomSongsContainer');
    if (!songs || songs.length === 0) {
        container.innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">No recommendations available</div>';
        return;
    }
    container.innerHTML = songs.map(song => {
        const thumbnailUrl = this.getYouTubeThumbnail(song.youtube_url);
        return `
            <div class="recommendation-song-item">
                <img src="${thumbnailUrl}" alt="Thumbnail" class="song-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'30\\' viewBox=\\'0 0 40 30\\'%3E%3Crect fill=\\'%23ddd\\' width=\\'40\\' height=\\'30\\'/%3E%3Ctext x=\\'20\\' y=\\'18\\' text-anchor=\\'middle\\' font-size=\\'8\\' fill=\\'%23666\\'%3E♪%3C/text%3E%3C/svg%3E'">
                <div class="recommendation-song-info">
                    <div class="recommendation-song-name">${song.name}</div>
                    <div class="recommendation-song-author">by ${song.author || 'Unknown'}</div>
                </div>
            </div>
        `;
    }).join('');
}
getYouTubeThumbnail(youtubeUrl) {
    const videoId = this.extractYouTubeId(youtubeUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
}
async loadTopSongsManagement() {
    if (!this.globalLibraryCurrentUser) return;
    try {
        const { data: currentTopSongs, error: topError } = await this.globalLibrarySupabase
            .from('top_songs_of_week')
            .select(`
                position,
                song_id,
                songs (
                    id,
                    name,
                    author
                )
            `)
            .order('position');
        if (topError) throw topError;
        const { data: allSongs, error: songsError } = await this.globalLibrarySupabase
            .from('songs')
            .select('id, name, author')
            .order('name');
        if (songsError) throw songsError;
        this.displayTopSongsManagement(currentTopSongs || [], allSongs || []);
    } catch (error) {
        console.error('Error loading top songs management:', error);
    }
}
displayTopSongsManagement(currentTopSongs, allSongs) {
    const container = document.getElementById('topSongsManagement');
    const songsOptionsHTML = allSongs.map(song => 
        `<option value="${song.id}">${song.name} - ${song.author || 'Unknown'}</option>`
    ).join('');
    const managementHTML = [1, 2, 3].map(position => {
        const currentSong = currentTopSongs.find(item => item.position === position);
        const selectedSongId = currentSong ? currentSong.song_id : '';
        return `
            <div class="top-song-management-item">
                <div class="top-song-position">#${position}</div>
                <select class="top-song-select" data-position="${position}">
                    <option value="">Select a song...</option>
                    ${songsOptionsHTML}
                </select>
            </div>
        `;
    }).join('');
    container.innerHTML = managementHTML + `
        <button class="update-top-songs-btn" onclick="musicPlayer.updateTopSongs()">
            Update Top Songs
        </button>
    `;
    currentTopSongs.forEach(item => {
        const select = container.querySelector(`[data-position="${item.position}"]`);
        if (select) {
            select.value = item.song_id;
        }
    });
}
async updateTopSongs() {
    const selects = document.querySelectorAll('.top-song-select');
    const updates = [];
    selects.forEach(select => {
        const position = parseInt(select.dataset.position);
        const songId = select.value;
        if (songId) {
            updates.push({
                position: position,
                song_id: parseInt(songId),
                created_by: this.globalLibraryCurrentUser.id
            });
        }
    });
    try {
        await this.globalLibrarySupabase
            .from('top_songs_of_week')
            .delete()
            .neq('id', 0); 
        if (updates.length > 0) {
            const { error } = await this.globalLibrarySupabase
                .from('top_songs_of_week')
                .insert(updates);
            if (error) throw error;
        }
        this.showGlobalLibraryMessage('Top songs updated successfully!', 'success');
        this.loadTopSongsManagement(); 
    } catch (error) {
        this.showGlobalLibraryMessage('Error updating top songs: ' + error.message, 'error');
    }
}
async refreshRandomRecommendations() {
    await this.loadRandomRecommendations();
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
