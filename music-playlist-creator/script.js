const modal = document.getElementById("playlist-card-modal");
const span = document.getElementsByClassName("close")[0];

function openModal(playlistDetails) {
   document.getElementById('playlist-title').innerText = playlistDetails.title;
   document.getElementById('playlist-cover-image').src = playlistDetails.imageUrl;
   document.getElementById('playlist-creator-name').innerText = playlistDetails.creatorName;
   
   // change later today/tommorow to get collection of elements by class for when we dynamically render the songs list.
   // iterate over the list of dom element pointers and assignment them to each attribute

   document.getElementById('song-title').innerText =  playlistDetails.songs[0].title;
   document.getElementById('song-image').src = playlistDetails.songs[0].imageUrl;
   document.getElementById('song-artist-name').innerText =  playlistDetails.songs[0].artistName;
   document.getElementById('song-album-name').innerText = playlistDetails.songs[0].albumName;
   document.getElementById('song-duration').innerText =  playlistDetails.songs[0].duration;
   modal.style.display = "block";

}

span.onclick = function() {
   modal.style.display = "none";
}

window.onclick = function(event) {
   if (event.target == modal) {
      modal.style.display = "none";
   }
}





