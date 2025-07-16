function openModal(imgSrc) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-image");
  modalImg.src = imgSrc;
  modal.classList.add("show");
  document.querySelector(".close-btn").style.display = "flex";
  document.body.classList.add("scroll_hidden");
}


//비디오 삽입
function openModalWithVideo(warningText, videoSrc, imageSrc, extraImg) {
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = ''; // 초기화

  if (warningText) {
    const warning = document.createElement('p');
    warning.className = 'modal-warning';
    warning.innerHTML = warningText;
    modalContent.appendChild(warning);
  }

  //유튜브 스타일 wrapper
  const playerWrapper = document.createElement('div');
  playerWrapper.className = 'youtube-style-player';

  //썸네일 이미지 (extraImg)
  const thumbnail = document.createElement('img');
  thumbnail.className = 'video-poster';
  thumbnail.src = extraImg;
  thumbnail.alt = '썸네일';
  playerWrapper.appendChild(thumbnail);

  //재생 아이콘
  const playIcon = document.createElement('div');
  playIcon.className = 'play-icon';
  playIcon.innerHTML = '▶';
  playerWrapper.appendChild(playIcon);

  //실제 영상 (초기 숨김)
  const video = document.createElement('video');
  video.src = videoSrc;
  video.controls = true;
  video.style.display = 'none';
  video.className = 'real-video-1';
  playerWrapper.appendChild(video);

  //클릭 시: 썸네일 & 아이콘 숨기고 영상 재생
  playerWrapper.onclick = () => {
  thumbnail.style.display = 'none';
  playIcon.style.display = 'none';
  video.style.display = 'block';
  video.play();
  };

  // 모달에 플레이어 삽입
  modalContent.appendChild(playerWrapper);

  if (imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = "modal image";
    img.className = "modal-extra-image";
    modalContent.appendChild(img);
  }

  modal.classList.add("show");
  document.querySelector(".close-btn").style.display = "flex";
  document.body.classList.add("scroll_hidden");
}


  // 비디오 2개 삽입
function openModalWithTwoVideos(text1, videoSrc1, text2, videoSrc2, imageSrc) {
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = ''; // 초기화

  // 텍스트 1
  if (text1) {
    const warning1 = document.createElement('p');
    warning1.className = 'modal-warning';
    warning1.innerHTML = text1;
    modalContent.appendChild(warning1);
  }

  // 비디오 1
  const video1 = document.createElement('video');
  video1.src = videoSrc1;
  video1.controls = true;
  video1.className = 'real-video';
  modalContent.appendChild(video1);

  // 텍스트 2
  if (text2) {
    const warning2 = document.createElement('p');
    warning2.className = 'modal-warning';
    warning2.innerHTML = text2;
    modalContent.appendChild(warning2);
  }

  // 비디오 2
  const video2 = document.createElement('video');
  video2.src = videoSrc2;
  video2.controls = true;
  video2.className = 'real-video';
  modalContent.appendChild(video2);

  // 마지막 이미지
  if (imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = "modal image";
    img.className = "modal-extra-image";
    modalContent.appendChild(img);
  }

  modal.classList.add("show");
  document.querySelector(".close-btn").style.display = "flex";
  document.body.classList.add("scroll_hidden");
}



// function openModalWithVideo(imgSrc, videoSrc) {
//   const modal = document.getElementById("modal");
//   const modalContent = document.getElementById("modal-content");
//   modalContent.innerHTML = '';

//   if (imgSrc) {
//     const img = document.createElement('img');
//     img.src = imgSrc;
//     img.alt = "modal image";
//     modalContent.appendChild(img);
//   }

//   if (videoSrc) {
//     const video = document.createElement('video');
//     video.controls = true;
//     video.autoplay = true;
//     const source = document.createElement('source');
//     source.src = videoSrc;
//     source.type = 'video/mp4';
//     video.appendChild(source);
//     modalContent.appendChild(video);
//   }
  // if (videoSrc) {
  //   const video = document.createElement('video');
  //   video.controls = true;
  //   video.autoplay = false;
  //   video.poster = extraImg;
  //   video.style.margin = "20px 0";
  //   const source = document.createElement('source');
  //   source.src = videoSrc;
  //   source.type = 'video/mp4';
  //   video.appendChild(source);
  //   modalContent.appendChild(video);
  // }
//   modal.classList.add("show");
//   document.querySelector(".close-btn").style.display = "flex";
//   document.body.classList.add("scroll_hidden");
// }

function closeModal() {
  const modal = document.getElementById("modal");

  //영상 멈추기 + 리셋
  const videos = modal.querySelectorAll('video');
  videos.forEach(video => {
    video.pause();
    video.currentTime = 0;
    video.remove();
  });

  modal.classList.remove("show");
  document.querySelector(".close-btn").style.display = "none";
  document.body.classList.remove("scroll_hidden");
}


// 탭 전환 기능
const tabButtons = document.querySelectorAll('.tab-button');
const sections = {
  game: document.getElementById("game"),
  webapp: document.getElementById("webapp"),
  contact: document.getElementById("contact"),
};

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    for (const key in sections) {
      sections[key].style.display = "none";
    }
    sections[button.dataset.tab].style.display = "flex";
    // const tab = button.dataset.tab;
    // alert(`"${tab}" 탭은 현재 준비 중입니다 :)`);
  });
});