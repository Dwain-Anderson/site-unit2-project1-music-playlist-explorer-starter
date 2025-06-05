const PAGE_TABLE = [
  ["ALL", "index.html", AllPage],
  ["FEATURED", "featured.html", FeaturedPage],
];
let currentPageID = PAGE_TABLE[0][0];

const modal = document.getElementById("playlist-card-modal");
const span = document.getElementsByClassName("close")[0];

function renderHeaderContent() {
  document.getElementById(
    "header-partial"
  ).innerHTML = `<h1 id="page-title">Music Playlist Explorer</h1>
      <nav>
        <ul>
            <li>
                <a href="featured.html" class = "nav-link" id ="${PAGE_TABLE[0][0]}">Featured</a>
            </li>
            <li>
                <a href="index.html" class = "nav-link" id = "${PAGE_TABLE[1][0]}">All</a>
            </li>
        </ul>
      </nav>`;
  for (let [pageID, _, __] of PAGE_TABLE) {
    console.log(pageID);

    document.getElementById(pageID).addEventListener("click", () => {
      currentPageID = pageID;
    });
  }
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

  // set html class to update icon
}

let randomInt = (k) => Math.floor(Math.random() * (k + 1));
/**
 * fisher yates shuffle algorithm from wikipedia
 */
function shuffeList(lst) {
  for (let i = lst.length - 1; i >= 1; i--) {
    let j = randomInt(i);
    let tmp = lst[i];
    lst[i] = lst[j];
    lst[j] = tmp;
  }
}

function sortList() {
  return 0;
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
  let chosenPlaylist = playlists.at(randomInt(playlists.length - 1));
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
  renderPlaylists(playlists);
}

function FeaturedPage() {
  renderHeaderContent();
  renderFeaturedPlaylist();
}

function render404Page() {
  renderHeaderContent();
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
  let runnable = render404Page;
  candidatePath = parsePagePath(window.location.pathname);
  for (let [pageID, pageBasePath, pageRunnable] of PAGE_TABLE) {
    console.log([pageID, pageBasePath, pageRunnable]);
    console.log(candidatePath);
    if (candidatePath == pageBasePath) {
      runnable = pageRunnable;
      break;
    }
  }
  console.log(runnable);
  runnable();
}

pageRouter();
