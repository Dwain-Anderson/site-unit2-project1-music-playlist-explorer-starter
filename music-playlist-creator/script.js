const modal = document.getElementById("playlist-card-modal");
const span = document.getElementsByClassName("close")[0];

function createSongElement(song) {
  let div = document.createElement("div");
  div.className = "song-card";
  div.innerHTML = `<img id="song-image" src="${song.cover_art}" alt="Cover art of ${song.title}" />
            <p class="song-title">${song.title}</p>
            <p class="song-artist-name">${song.artist}</p>
            <p class="song-album-name">${song.album}</p>
            <p class="song-duration">${song.duration}</p>
   `;
  return div;
}

function createPlaylistElement(playlist) {
  let div = document.createElement("div");
  div.className = "playlist-card";
  div.addEventListener('click', () => openModal(playlist));
  div.innerHTML = `
      <img class="playlist-cover-image" src=${playlist.playlist_art} alt="" />
          <h3 class="playlist-title">${playlist.playlist_name}</h3>
          <p class="playlist-creator-name">${playlist.playlist_creator}</p>
          <div class="playlist-likes-flex-container">
            <button class="playlist-like-button">
              <img src="#" class="playlist-like-heart-icon" />
            </button>
             <p class="playlist-like-count">${playlist.likeCount}</p>
          </div>
        </div>
      `;
  return div;
}

function openModal(playlist) {
  document.getElementById("playlist-title").innerText = playlist.playlist_name;
  document.getElementById("playlist-cover-image").src = playlist.playlist_art;
  document.getElementById("playlist-creator-name").innerText = playlist.playlist_creator;
  let songsCardsElement = document.getElementById("song-cards");
  songsCardsElement.replaceChildren();
  playlist.songs.forEach((song) => songsCardsElement.append(createSongElement(song)));
  modal.style.display = "block";
}



function loadPlaylists(playlists) {
  let playlistContainer = document.getElementById("playlist-cards");
  playlists.forEach((playlist) =>
    playlistContainer.appendChild(createPlaylistElement(playlist))
  );
}

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};



document.body.onload = () => {loadPlaylists(playlists);}
