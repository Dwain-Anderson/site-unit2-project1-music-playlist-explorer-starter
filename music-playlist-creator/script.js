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

const modal = document.getElementById("playlist-card-modal");
const span = document.getElementsByClassName("close")[0];

let currentPageID = "ALL";

function renderHeaderContent() {
  setElementFields(document.getElementById("header-partial"), {
    innerHTML: `<h1 id="page-title">Music Playlist Explorer</h1>
      <nav>
        <ul>
            <li>
                <a href="featured.html" class = "nav-link" id ="FEATURED">Featured</a>
            </li>
            <li>
                <a href="index.html" class = "nav-link" id = "ALL">All</a>
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

function renderFooter() {
  setElementFields(document.getElementById("footer-partial"), {
    innerHTML: `<p>Placeholder for footer, you are currently on PAGE=${PAGE_TABLE[currentPageID].path}</p>`,
  });
}

function populateHTMLData(element, id, className, innerHTML) {
  return {
    element: element,
    id: id,
    className: className,
    innerHTML: innerHTML,
  };
}

function setElementFields(element, data) {
  for (let [key, value] of Object.entries(data)) {
    element[key] = value;
  }
}

function createHTMLElement(data) {
  let element = document.createElement(data["element"]);
  setElementFields(element, data);
  return element;
}

function createSongElement(song) {
  return createHTMLElement(
    populateHTMLData(
      "div",
      `song-card-${song.songID}}`,
      "song-card",
      `<img id="song-image" src="${song.cover_art}" alt="Cover art of ${song.title}" />
            <p class="song-title">${song.title}</p>
            <p class="song-artist-name">${song.artist}</p>
            <p class="song-album-name">${song.album}</p>
            <p class="song-duration">${song.duration}</p>
   `
    )
  );
}

function mountLikeButton(playlist, previousLikeState) {
  let container = document.getElementById(
    `playlist-likes-flex-container-${playlist.playlistID}`
  );
  let likeButtonElement = createHTMLElement(
    populateHTMLData(
      "button",
      `playlist-like-button-${playlist.playlistID}`,
      "playlist-like-button",
      `<img src="#" class="playlist-like-heart-icon" />`
    )
  );

  let likeCountElement = createHTMLElement(
    populateHTMLData(
      "p",
      `playlist-like-count-${playlist.playlistID}`,
      "playlist-like-button",
      `<p class="playlist-like-count" id="playlist-like-count-${playlist.playlistID}">${playlist.likeCount}</p>`
    )
  );

  container.appendChild(likeButtonElement);
  container.appendChild(likeCountElement);

  likeButtonElement.addEventListener("click", () => {
    if (previousLikeState) {
      playlist.likeCount--;
    } else {
      playlist.likeCount++;
    }
    likeCountElement.innerText = playlist.likeCount;
    previousLikeState = !previousLikeState;
  });
}

/**
 * fisher yates shuffle algorithm from wikipedia
 */
const randomInt = (k) => Math.floor(Math.random() * (k + 1));
function shuffeList(lst) {
  for (let i = lst.length - 1; i >= 1; i--) {
    let j = randomInt(i);
    let tmp = lst[i];
    lst[i] = lst[j];
    lst[j] = tmp;
  }
}

function iterateList(container, iterable, func) {
  container.replaceChildren();
  iterable.forEach((element) => func(container, element));
}

function mountShuffleButton(playlist, songsContainer) {
  let shuffleButtonElement = document.getElementById("shuffle-button-modal");
  shuffleButtonElement.addEventListener("click", () => {
    shuffeList(playlist.songs);
    iterateList(songsContainer, playlist.songs, (container, element) => {
      container.append(createSongElement(element));
    });
  });
}

function createPlaylistElement(playlist) {
  let playlistElement = createHTMLElement(
    populateHTMLData(
      "div",
      `playlist-card-${playlist.playlistID}}`,
      "playlist-card",
      `
      <img class="playlist-cover-image" src=${playlist.playlist_art} alt="" />
          <h3 class="playlist-title">${playlist.playlist_name}</h3>
          <p class="playlist-creator-name">${playlist.playlist_creator}</p>
          <div class="playlist-likes-flex-container" id="playlist-likes-flex-container-${playlist.playlistID}">
          </div>
        </div>
      `
    )
  );
  playlistElement.addEventListener("click", () => openModal(playlist));
  return playlistElement;
}

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
}

function renderFeaturedPlaylist() {
  let chosenPlaylist = playlists[randomInt(playlists.length - 1)];
  featuredPlaylistFields = {
    "playlist-title": { innerText: chosenPlaylist.playlist_name },
    "playlist-cover-image": { src: chosenPlaylist.playlist_art },
    "playlist-creator-name": { innerText: chosenPlaylist.playlist_creator },
  };
  for (let [elementId, elementAttributes] of Object.entries(
    featuredPlaylistFields
  )) {
    setElementFields(document.getElementById(elementId), elementAttributes);
  }
  let songsContainer = document.getElementById("song-cards");
  iterateList(songsContainer, chosenPlaylist.songs, (container, element) => {
    container.append(createSongElement(element));
  });
}

function renderPlaylists(playlists) {
  let playlistsContainer = document.getElementById("playlist-cards");
  iterateList(playlistsContainer, playlists, (container, element) => {
    container.append(createPlaylistElement(element));
    mountLikeButton(element, false);
  });
}

function mountSort() {
  let sortMenuElement = createHTMLElement(populateHTMLData("div", "sort-container", "sort-container", `<form id="sort-form" class="sort-form">
    <label id="sort-label" class="sort-label" for="sort-select">Sort playlists by: </label>
      <select id="sort-select" class="sort-select">
        <option id="sort-option-default" class="sort-option" value="default">Default</option>
        <option id="sort-option-name" class="sort-option" value="name">Playlist Name</option>
        <option id="sort-option-creator" class="sort-option" value="creator">Creator</option>
        <option id="sort-option-likes" class="sort-option" value="likes">Likes</option>
      </select>
      <button id="sort-button" class="sort-button" type="submit">Sort</button>
    </form>
  `));
  let sortMenuContainer = document.getElementById("sort-partial");
  sortMenuContainer.appendChild(sortMenuElement);
  let sortMenuForm = document.getElementById("sort-form");


  sortMenuForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const sortBy = document.getElementById("sort-select").value;
    let sortedPlaylists = [...playlists];
    if (sortBy === "name") {
      sortedPlaylists.sort((a, b) =>
        a.playlist_name.localeCompare(b.playlist_name)
      );
    } else if (sortBy === "creator") {
      sortedPlaylists.sort((a, b) =>
        a.playlist_creator.localeCompare(b.playlist_creator)
      );
    } else if (sortBy === "likes") {
      sortedPlaylists.sort((a, b) => b.likeCount - a.likeCount);
    }
    renderPlaylists(sortedPlaylists);
  });
}

function editDistance(s, t) {
  const m = s.length;
  const n = t.length;
  let v0 = new Array(n);
  let v1 = new Array(n);
  for (let i = 0; i <= n; i++) {
    v0[i] = i
  }
  for (let i = 0; i < m; i++) {
    v1[0] = i + 1
    for (let j = 0; j < n; j++) {
     let cost = s[i] === t[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1,v0[j + 1] + 1, v0[j] + cost);
    }
    [v0, v1] = [v1, v0];
  }
  return v0[n]
}
function mountSearch() {
  let searchBarElement = createHTMLElement(populateHTMLData("search", "search-container", "search-container", `<form id="search-form" class="search-form">
<label for="playlists">Search for playlists</label>
      <input type="search" id="search-input" name="" />
      <button type="submit">Search</button>
  `));
  let searchBarContainer = document.getElementById("search-partial");
  searchBarContainer.appendChild(searchBarElement);
  let searchBarForm = document.getElementById("search-form");

  searchBarForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let query = (document.getElementById("search-input").value).toLowerCase()
    let searchPlaylists = [...playlists];
    let editDistances = new Map();
    for (let playlist of searchPlaylists) {
      let dist = editDistance(query, playlist.playlist_name.toLowerCase())
      editDistances.set(playlist.playlist_name, dist)
    }
  
    searchPlaylists.sort((a, b) => {
      return editDistances.get(a.playlist_name) - editDistances.get(b.playlist_name)
    })
    console.log(editDistances)
 
    renderPlaylists(searchPlaylists)
})}


function AllPage() {
  renderHeaderContent();
  if (span) {
    span.onclick = function () {
      modal.style.display = "none";
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      };
    };
  }
  mountSort();
  renderPlaylists(playlists);
  renderFooter();
  mountSearch();
}

function FeaturedPage() {
  renderHeaderContent();
  renderFeaturedPlaylist();
}

function parsePagePath(pathname) {
  const match = pathname.match(/\/([^\/?#]+)$/);
  let baseName = "";
  if (match && match[1]) {
    baseName = match[1];
  }
  return baseName;
}

function pageRouter() {
  let pageRunnable = null;
  candidatePath = parsePagePath(window.location.pathname);
  for (let [_, pageData] of Object.entries(PAGE_TABLE)) {
    if (candidatePath == pageData.path) {
      pageRunnable = pageData.runnable;
      break;
    }
  }
  if (pageRunnable) {
    pageRunnable();
  }
}

pageRouter();
