const modal = document.getElementById("playlist-card-modal");
const span = document.getElementsByClassName("close")[0];

function renderHeaderContent() {
  document.getElementById(
    "header-partial"
  ).innerHTML = `<h1 id="page-title">Music Playlist Explorer</h1>
      <nav>
        <ul>
            <li>
                <a href="featured.html" class = "nav-link-data">Featured</a>
            </li>
            <li>
                <a href="index.html" class = "nav-link-data">All</a>
            </li>
        </ul>
      </nav>`;
}

function populateHTMLData(element, id, className, innerHTML) {
  return {
    element: element,
    id: id,
    className: className,
    innerHTML: innerHTML,
  };
}

function createHTMLElement(data) {
  let element = document.createElement(data["element"]);
  for (let [key, value] of Object.entries(data)) {
    element[key] = value;
  }
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
  document.getElementById("playlist-title").innerText = playlist.playlist_name;
  document.getElementById("playlist-cover-image").src = playlist.playlist_art;
  document.getElementById("playlist-creator-name").innerText =
    playlist.playlist_creator;
  let songsCardsElement = document.getElementById("song-cards");
  songsCardsElement.replaceChildren();
  playlist.songs.forEach((song) =>
    songsCardsElement.append(createSongElement(song))
  );
  modal.style.display = "block";
}

function renderPlaylists(playlists) {
  let playlistContainer = document.getElementById("playlist-cards");
  playlists.forEach((playlist) => {
    playlistContainer.appendChild(createPlaylistElement(playlist));
    mountLikeButton(playlist, false);
  });
}

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

document.body.onload = () => {
  renderHeaderContent();
  renderPlaylists(playlists);
};
