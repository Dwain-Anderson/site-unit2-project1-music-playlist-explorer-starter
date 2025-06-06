const PAGE_TABLE = {
  ALL: {
    path: "index.html",
    runnable: AllPage,
  },
  FEATURED: {
    path: "featured.html",
    runnable: FeaturedPage,
  },
};

const ASSET_URLS = {
  trash: "https://img.icons8.com/material-outlined/24/ffffff/trash--v1.png",
  edit: "https://img.icons8.com/material-outlined/24/ffffff/edit--v1.png",
  defaultPlaylistCover: "/assets/img/playlist.png",
  defaultSongCover: "/assets/img/song.png",
};

const modal = document.getElementById("playlist-card-modal");
const span = document.getElementsByClassName("close")[0];

let currentPageID = "ALL";

// 5/6: If I had more time I would change this to a variable sized cache of max cardinality equal to Floor(|Playlists|*Average(|Playlists.songs|))//3
// I would use an eviction policy, possibly LRU or Round-Robin, and lastly I would change the hash function in order to make it easier to copy over & write backthe
// elements of the map to localStorage on page reload.
let elementCache = new Map();

/**
 * Renders the header content with navigation links.
 * Updates the active state based on currentPageID.
 */
function renderHeaderContent() {
  setElementFields(document.getElementById("header-partial"), {
    innerHTML: `<h1 id="page-title">Music Playlist Explorer</h1>
      <nav>
        <ul>
            <li>
                <a href="featured.html" class="nav-link ${
                  currentPageID === "FEATURED" ? "active" : ""
                }" id="FEATURED">Featured</a>
            </li>
            <li>
                <a href="index.html" class="nav-link ${
                  currentPageID === "ALL" ? "active" : ""
                }" id="ALL">All</a>
            </li>
        </ul>
      </nav>`,
  });

  for (let pageID of Object.keys(PAGE_TABLE)) {
    document.getElementById(pageID).addEventListener("click", () => {
      currentPageID = pageID;
    });
  }
}

/**
 * Renders the footer content with copyright information.
 */
function renderFooter() {
  setElementFields(document.getElementById("footer-partial"), {
    innerHTML: `<p>© ${new Date().getFullYear()} Music Playlist Explorer | <a href="#">Terms</a> | <a href="#">Privacy</a></p>`,
  });
}

/**
 * Creates an object with HTML element properties.
 * @param {string} element - The HTML element tag name
 * @param {string} id - The element ID
 * @param {string} className - The element class name
 * @param {string} innerHTML - The inner HTML content
 * @returns {Object} Object with element properties
 */
function populateHTMLData(element, id, className, innerHTML) {
  return {
    element: element,
    id: id,
    className: className,
    innerHTML: innerHTML,
  };
}

/**
 * Sets multiple properties on an HTML element.
 * @param {HTMLElement} element - The element to modify
 * @param {Object} data - Key-value pairs of properties to set
 */
function setElementFields(element, data) {
  for (let [key, value] of Object.entries(data)) {
    element[key] = value;
  }
}

function hash(data) {
  return Object.entries(data)
    .map(([key, value]) => `${key}:${value}|`)
    .join("");
}

/**
 * Creates an HTML element with specified properties.
 * @param {Object} data - Element properties from populateHTMLData
 * @returns {HTMLElement} The created HTML element
 */
function createHTMLElement(data) {
  let cacheKey = hash(data);
  if (elementCache.has(cacheKey)) {
    return elementCache.get(cacheKey);
  } else {
    let element = document.createElement(data["element"]);
    setElementFields(element, data);
    elementCache.set(cacheKey, element);
    return element;
  }
}

/**
 * Creates a song card element.
 * @param {Object} song - Song data object
 * @returns {HTMLElement} Song card element
 */
function createSongElement(song) {
  return createHTMLElement(
    populateHTMLData(
      "div",
      `song-card-${song.songID}`,
      "song song-grid",
      `<img class="song-img" src="${song.cover_art}" alt="Cover art of ${song.title}" />
            <p class="card-title">${song.title}</p>
            <p class="card-subtitle">${song.artist}</p>
            <p class="card-subtitle">${song.album}</p>
            <p class="card-subtitle">${song.duration}</p>
   `
    )
  );
}

/**
 * Creates and mounts a like button for a playlist using CSS-based heart icon.
 * @param {Object} playlist - Playlist data object
 * @param {boolean} previousLikeState - Initial like state
 */
function mountLikeButton(playlist, previousLikeState) {
  let container = document.getElementById(
    `playlist-likes-flex-container-${playlist.playlistID}`
  );
  let likeButtonElement = createHTMLElement(
    populateHTMLData(
      "button",
      `playlist-like-button-${playlist.playlistID}`,
      "btn-icon",
      `<span class="heart-icon ${
        previousLikeState ? "liked" : ""
      }" id="playlist-like-heart-icon-${playlist.playlistID}"></span>`
    )
  );
  let likeCountElement = createHTMLElement(
    populateHTMLData(
      "span",
      `playlist-like-count-${playlist.playlistID}`,
      "",
      `${playlist.likeCount}`
    )
  );

  container.appendChild(likeButtonElement);
  container.appendChild(likeCountElement);
  likeButtonElement.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (previousLikeState) {
      playlist.likeCount--;
    } else {
      playlist.likeCount++;
    }
    likeCountElement.innerText = playlist.likeCount;
    previousLikeState = !previousLikeState;
    const heartIcon = document.getElementById(
      `playlist-like-heart-icon-${playlist.playlistID}`
    );
    if (previousLikeState) {
      heartIcon.classList.add("liked");
    } else {
      heartIcon.classList.remove("liked");
    }
  });
}

/**
 * Generates a random integer between 0 and k.
 * @param {number} k - Upper bound (inclusive)
 * @returns {number} Random integer
 */
const randomInt = (k) => Math.floor(Math.random() * (k + 1));

/**
 * Shuffles an array in-place using Fisher-Yates algorithm, (https://en.wikipedia.org/wiki/Fisher–Yates_shuffle)
 * @param {Array} lst - Array to shuffle
 */
const shuffleList = (lst) => {
  for (let i = lst.length - 1; i >= 1; i--) {
    const j = randomInt(i);
    [lst[i], lst[j]] = [lst[j], lst[i]];
  }
};

/**
 * Clears a container and applies a function to each item in an iterable.
 * @param {HTMLElement} container - Container element to clear and populate
 * @param {Array} iterable - Items to iterate over
 * @param {Function} func - Function to apply to each item
 */
function iterateList(container, iterable, func) {
  container.replaceChildren();
  iterable.forEach((element) => func(container, element));
}

/**
 * Creates and mounts a shuffle button for a playlist's songs.
 * @param {Object} playlist - Playlist data object
 * @param {HTMLElement} songsContainer - Container for song elements
 */
function mountShuffleButton(playlist, songsContainer) {
  const shuffleButtonElement = document.getElementById("shuffle-button-modal");
  shuffleButtonElement.addEventListener("click", () => {
    shuffleList(playlist.songs);
    iterateList(songsContainer, playlist.songs, (container, element) =>
      container.append(createSongElement(element))
    );
  });
}

/**
 * Creates a playlist card element.
 * @param {Object} playlist - Playlist data object
 * @returns {HTMLElement} Playlist card element
 */
function createPlaylistElement(playlist) {
  let playlistElement = createHTMLElement(
    populateHTMLData(
      "div",
      `playlist-card-${playlist.playlistID}`,
      "card",
      `
      <img src="${playlist.playlist_art}" alt="" />
          <h3 class="card-title">${playlist.playlist_name}</h3>
          <p class="card-subtitle">${playlist.playlist_creator}</p>
          <div class="card-footer" id="playlist-likes-flex-container-${playlist.playlistID}">
          </div>
        </div>
      `
    )
  );
  playlistElement.addEventListener("click", () => openModal(playlist));
  return playlistElement;
}

/**
 * Opens a modal with playlist details and songs.
 * @param {Object} playlist - Playlist data object to display
 */
function openModal(playlist) {
  modalFields = {
    "playlist-title": { innerText: playlist.playlist_name },
    "playlist-cover-image": { src: playlist.playlist_art },
    "playlist-creator-name": { innerText: playlist.playlist_creator },
  };
  for (let [elementId, elementAttributes] of Object.entries(modalFields)) {
    setElementFields(document.getElementById(elementId), elementAttributes);
  }
  let songsContainer = document.getElementById("song-cards");
  iterateList(songsContainer, playlist.songs, (container, element) => {
    container.append(createSongElement(element));
  });
  mountShuffleButton(playlist, songsContainer);
  modal.style.display = "block";
  document.body.classList.add("modal-open");
}

/**
 * Renders a randomly selected featured playlist.
 * Displays the playlist image, title, creator, and songs.
 */
function renderFeaturedPlaylist() {
  let chosenPlaylist = playlists[randomInt(playlists.length - 1)];
  featuredPlaylistFields = {
    "playlist-title": { innerText: chosenPlaylist.playlist_name },
    "playlist-cover-image": {
      src: chosenPlaylist.playlist_art,
      className: "featured-img",
    },
    "playlist-creator-name": { innerText: chosenPlaylist.playlist_creator },
  };
  for (let [elementId, elementAttributes] of Object.entries(
    featuredPlaylistFields
  )) {
    setElementFields(document.getElementById(elementId), elementAttributes);
  }
  let songsContainer = document.getElementById("song-cards");
  songsContainer.className = "featured-songs";
  iterateList(songsContainer, chosenPlaylist.songs, (container, element) => {
    container.append(createSongElement(element));
  });
}

/**
 * Adds an event listener with a guard clause for target checking.
 * @param {HTMLElement} element - Element to attach the listener to
 * @param {string} eventType - Type of event to listen for
 * @param {Function} handler - Event handler function
 */
function addEventWithGuard(element, eventType, handler) {
  element.addEventListener(eventType, (e) => {
    if (e.target !== e.currentTarget) return;
    handler(e);
  });
}

/**
 * Sets up a modal with open/close functionality.
 * @param {HTMLElement} modalElement - The modal element
 * @param {HTMLElement} openTrigger - Element that opens the modal
 * @param {HTMLElement} closeTrigger - Element that closes the modal
 */
function setupModal(modalElement, openTrigger, closeTrigger) {
  modalElement.style.display = "none";

  addEventWithGuard(openTrigger, "click", () => {
    modalElement.style.display = "block";
    document.body.classList.add("modal-open");
  });

  addEventWithGuard(closeTrigger, "click", () => {
    modalElement.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  window.addEventListener("click", (event) => {
    if (event.target === modalElement) {
      modalElement.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });
}

/**
 * Renders a list of playlists with their controls.
 * @param {Array} playlists - Array of playlist objects to render
 */
function renderPlaylists(playlists) {
  let playlistsContainer = document.getElementById("playlist-cards");
  iterateList(playlistsContainer, playlists, (container, element) => {
    const playlistElement = createPlaylistElement(element);
    container.append(playlistElement);
    mountLikeButton(element, false);
    mountDeleteButton(element, playlistElement);
    mountEditButton(element, playlistElement);
  });
}

/**
 * Sets up the sort functionality for playlists.
 * Allows sorting by name, creator, likes, or date added.
 */
function mountSort() {
  let sortMenuForm = document.getElementById("sort-form");
  addEventWithGuard(sortMenuForm, "submit", (e) => {
    e.preventDefault();
    const sortBy = document.getElementById("sort-select").value;
    let sortedPlaylists = [...playlists];
    switch (sortBy) {
      case "date":
        sortedPlaylists.sort((a, b) => b.dateAdded - a.dateAdded);
        break;
      case "likes":
        sortedPlaylists.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case "name":
        sortedPlaylists.sort((a, b) =>
          a.playlist_name.localeCompare(b.playlist_name)
        );
        break;
      case "creator":
        sortedPlaylists.sort((a, b) =>
          a.playlist_creator.localeCompare(b.playlist_creator)
        );
        break;
      case "default":
      default:
        sortedPlaylists.sort((a, b) => b.playlistID - a.playlistID);
        break;
    }
    renderPlaylists(sortedPlaylists);
  });
}

/**
 * Sets up the add playlist functionality.
 * Creates a form for adding new playlists to the collection.
 */
function mountAddButton() {
  const addButtonElement = document.getElementById("add-playlist-button");
  const addMenuElement = document.getElementById("add-playlist-modal");
  const closeAddModal = addMenuElement.querySelector(".close-add-modal");
  const addMenuForm = document.getElementById("add-form");
  setupModal(addMenuElement, addButtonElement, closeAddModal);
  addEventWithGuard(addMenuForm, "submit", (e) => {
    e.preventDefault();
    const [nameEl, creatorEl, artEl] = [
      "playlist-name",
      "playlist-creator",
      "playlist-art",
    ].map((id) => document.getElementById(id));
    const newPlaylist = {
      playlistID: playlists.length + 1,
      playlist_name: nameEl.value,
      playlist_creator: creatorEl.value,
      playlist_art: artEl.value,
      likeCount: 0,
      dateAdded: new Date(),
      songs: [],
    };
    playlists.push(newPlaylist);
    renderPlaylists(playlists);
    addMenuForm.reset();
    addMenuElement.style.display = "none";
  });
}

/**
 * Creates and mounts an action button (delete or edit) for a playlist.
 * @param {string} type - Button type ("delete" or "edit")
 * @param {Object} playlist - Playlist data object
 * @param {HTMLElement} playlistElement - Playlist card element
 */
function mountActionButton(type, playlist, playlistElement) {
  const config = {
    delete: {
      className: "btn-delete",
      text: `<img src="${ASSET_URLS.trash}" class="icon" alt="Delete playlist">`,
      action: () => {
        playlists = playlists.filter(
          (p) => p.playlistID !== playlist.playlistID
        );
        renderPlaylists(playlists);
      },
    },
    edit: {
      className: "btn-icon btn-edit",
      text: "Edit",
      action: () => {
        const editForm = createHTMLElement(
          populateHTMLData(
            "form",
            `playlist-edit-form-${playlist.playlistID}`,
            "form",
            `
              <h3>Edit Playlist</h3>
              <label for="edit-playlist-name-${playlist.playlistID}">Playlist Name</label>
              <input type="text" class="input" id="edit-playlist-name-${playlist.playlistID}" value="${playlist.playlist_name}" required />
              <label for="edit-playlist-creator-${playlist.playlistID}">Creator Name</label>
              <input type="text" class="input" id="edit-playlist-creator-${playlist.playlistID}" value="${playlist.playlist_creator}" required />
              <label for="edit-playlist-art-${playlist.playlistID}">Cover Art URL</label>
              <input type="text" class="input" id="edit-playlist-art-${playlist.playlistID}" value="${playlist.playlist_art}" required />
              <div class="btn-container">
                <button type="submit" class="btn">Save Changes</button>
                <button type="button" class="btn cancel-edit">Cancel</button>
              </div>
            `
          )
        );

        playlistElement.style.display = "none";
        playlistElement.parentNode.insertBefore(
          editForm,
          playlistElement.nextSibling
        );
        editForm.addEventListener("submit", (e) => {
          e.preventDefault();
          playlist.playlist_name = document.getElementById(
            `edit-playlist-name-${playlist.playlistID}`
          ).value;
          playlist.playlist_creator = document.getElementById(
            `edit-playlist-creator-${playlist.playlistID}`
          ).value;
          playlist.playlist_art = document.getElementById(
            `edit-playlist-art-${playlist.playlistID}`
          ).value;

          editForm.remove();
          playlistElement.style.display = "block";
          renderPlaylists(playlists);
        });
        editForm.querySelector(".cancel-edit").addEventListener("click", () => {
          editForm.remove();
          playlistElement.style.display = "block";
        });
      },
    },
  };

  const { className, text, action } = config[type];
  const buttonElement = createHTMLElement(
    populateHTMLData(
      "button",
      `playlist-${type}-button-${playlist.playlistID}`,
      className,
      text
    )
  );

  if (type === "edit") {
    const likesContainer = document.getElementById(
      `playlist-likes-flex-container-${playlist.playlistID}`
    );
    likesContainer.appendChild(buttonElement);
  } else {
    playlistElement.appendChild(buttonElement);
  }

  buttonElement.addEventListener("click", (e) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    action();
  });
}

/**
 * Creates and mounts a delete button for a playlist.
 * @param {Object} playlist - Playlist data object
 * @param {HTMLElement} playlistElement - Playlist card element
 */
function mountDeleteButton(playlist, playlistElement) {
  mountActionButton("delete", playlist, playlistElement);
}

/**
 * Creates and mounts an edit button for a playlist.
 * @param {Object} playlist - Playlist data object
 * @param {HTMLElement} playlistElement - Playlist card element
 */
function mountEditButton(playlist, playlistElement) {
  mountActionButton("edit", playlist, playlistElement);
}

/**
 * Calculates the Levenshtein edit distance between two strings using the space-efficient version of the algorithm. (https://en.wikipedia.org/wiki/Levenshtein_distance)
 * @param {string} s - First string
 * @param {string} t - Second string
 * @returns {number} Edit distance
 */
function editDistance(s, t) {
  const m = s.length;
  const n = t.length;
  let v0 = new Array(n);
  let v1 = new Array(n);
  for (let i = 0; i <= n; i++) {
    v0[i] = i;
  }
  for (let i = 0; i < m; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < n; j++) {
      let cost = s[i] === t[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    [v0, v1] = [v1, v0];
  }
  return v0[n];
}

/**
 * Sets up the search functionality for playlists.
 * Allows searching by name or creator with edit distance sorting.
 */
function mountSearch() {
  const searchBarForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchType = document.getElementById("search-type");
  const clearButton = document.getElementById("clear-search");
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    renderPlaylists(playlists);
  });
  addEventWithGuard(searchBarForm, "submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.toLowerCase();
    if (!query.trim()) {
      renderPlaylists(playlists);
      return;
    }
    const searchByType = searchType.value;
    let searchPlaylists = [...playlists];
    let editDistances = new Map();
    for (let playlist of searchPlaylists) {
      const compareValue =
        searchByType === "name"
          ? playlist.playlist_name.toLowerCase()
          : playlist.playlist_creator.toLowerCase();
      let dist = editDistance(query, compareValue);
      editDistances.set(playlist.playlistID, dist);
    }
    searchPlaylists.sort((a, b) => {
      return editDistances.get(a.playlistID) - editDistances.get(b.playlistID);
    });
    renderPlaylists(searchPlaylists);
  });
}

/**
 * Initializes the main page with all playlists.
 * Sets up all UI components and renders playlists.
 */
function AllPage() {
  renderHeaderContent();
  if (span) {
    span.onclick = function () {
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
          document.body.classList.remove("modal-open");
        }
      };
    };
  }
  mountSort();
  mountAddButton();
  renderPlaylists(playlists);
  renderFooter();
  mountSearch();
}

/**
 * Initializes the featured playlist page.
 * Renders header and a randomly selected featured playlist.
 */
function FeaturedPage() {
  renderHeaderContent();
  renderFeaturedPlaylist();
}

/**
 * Routes to the appropriate page based on the URL.
 * Determines which page function to run based on the path.
 */
function pageRouter() {
  let pageRunnable = null;
  let candidatePageID = document.querySelector("body").id.substring(7);
  for (let [pageID, pageData] of Object.entries(PAGE_TABLE)) {
    if (pageID == candidatePageID) {
      pageRunnable = pageData.runnable;
    }
  }
  if (pageRunnable) {
    pageRunnable();
  }
}

pageRouter();
