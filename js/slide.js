const overlay = document.querySelector(".slide-overlay");
let slides = document.querySelectorAll(".slides > li");
let slidePhoto = document.querySelectorAll(".slides > img");
const slide = document.querySelector(".slides");
const body = document.querySelector("body");
const thumbnails = document.querySelectorAll(".box__gallery > li > img");
const photoCount = slides.length;
const duration = 200;
let bullets = 0;
let photoIndex = 0;

// 갤러리 모달창 이벤트
thumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", (e) => {
    e.preventDefault();
    body.classList.add("scroll_hidden")
    overlay.style.display = "block";
    // 썸네일 원본 사진과 갤러리 슬라이드 이미지 소스 링크 연결
    for (let i = 0; i < thumbnails.length; i++) {
      let photo = thumbnails[i].lastElementChild;
      slidePhoto[i].src = photo.href;
    }
  });
});
document.querySelector(".close-btn").addEventListener("click", ()=> {
    overlay.style.display = "none";
    body.classList.remove("scroll_hidden")
});

// bullet 이미지 개수에 맞게 생성하는 함수
function createBullets() {
  // bullet들의 리스트를 생성
  const bulletsList = document.createElement("ul");
  bulletsList.setAttribute("id", "bullets");
  overlay.appendChild(bulletsList);
  // 이미지 개수대로 bullet를 생성
  slides.forEach((slide, index) => {
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    // 이미지의 index를 a의 html에 집어넣음 (나중에 이미지 이동할 때 주소 역할이 되어줌)
    a.innerHTML = `${index}`;
    const li = document.createElement("li");
    li.appendChild(a);
    bulletsList.appendChild(li);
  });
  return (bullets = document.querySelectorAll("#bullets > li > a"));
}
createBullets();
bulletLink();


// bullet을 클릭하면 해당하는 번호의 이미지로 슬라이드 되는 함수
function bulletLink() {
  bullets.forEach((bullet, index) => {
    bullet.addEventListener("click", (e) => {
      e.preventDefault();
      // 클릭된 bullet의 인덱스
      const clickedIndex = index;
      // 현재 bullet과 클릭된 bullet의 차이
      let step = clickedIndex - photoIndex;
      photoIndex = clickedIndex;
      //모든 bullet의 클래스를 없애고 클릭된 bullet에만 on 클래스 추가
      bulletClassReset();
      bullets[clickedIndex].classList.add("on");

      // 클릭할 때마다 순서가 바뀌는 slides들 업뎃
      slides = document.querySelectorAll(".slides>li")
      let currentSlides = [...slides];
      //step이 양수: 현재 요소보다 뒤에 오는 요소로 이동
      if (step > 0) {
        // 이미지 슬라이드 step의 수 만큼 앞에서 자른다
        let sliceSlides = currentSlides.slice(undefined, step);
        slide.style.transition = duration+"ms";
        slide.style.left=step * -100+"%";
        window.setTimeout(() => {
          slide.removeAttribute("style");
          // 잘린 요소들을 맨 뒤로 집어넣기..
          slide.append(...sliceSlides);
        }, duration);
      } else {
        // step이 음수: 현재 요소보다 앞에 있는 요소로 이동
        sliceSlides = currentSlides.slice(step);
        // 잘린 요소들을 맨 앞으로 집어넣기
        slide.prepend(...sliceSlides);
        slide.style.left = step * 100 + "%";
        window.setTimeout(()=>{ 
            slide.style.left = 0;
            slide.style.transition = duration+"ms";
        })
      }
      //서로 같은 경우 이동할 필요가 없기 때문에 함수 즉시 종료
      if (step==0) return;
    });
  });
}
//썸네일을 클릭하면 해당하는 사진으로 점프
thumbnails.forEach((thumbnail, index) => {
    // 클릭 이벤트 추가
    thumbnail.addEventListener("click", (e) => {
      e.preventDefault();
      const clickedIndex = index;
      let step = clickedIndex - photoIndex;
      photoIndex = clickedIndex;
      bulletClassReset();
      bullets[clickedIndex].classList.add("on");
      // 클릭할 때마다 순서가 바뀌는 slides들 업뎃
      slides = document.querySelectorAll(".slides>li");
      let currentSlides = [...slides];
      if (step > 0) {
        // 이미지 슬라이드 step의 수 만큼 앞에서 자른다
        let sliceSlides = currentSlides.slice(undefined, step);
          // 잘린 슬라이드들 맨 뒤로 집어넣기..
        slide.append(...sliceSlides);
      } else {
        sliceSlides = currentSlides.slice(step);
        // 잘린 슬라이드들 맨 앞으로 집어넣기
        slide.prepend(...sliceSlides);
      }
    });
  });





// 슬라이드 버튼 클릭 이벤트
document.querySelector(".--next").addEventListener("click", nextSlideImage);
document.querySelector(".--prev").addEventListener("click", prevSlideImage);

// 다음 사진으로 슬라이드
function nextSlideImage() {
  photoIndex++;
  photoIndex %= photoCount;
  slide.style.left = "-100%";
  slide.style.transition = duration + "ms";
  window.setTimeout(() => {
    slide.appendChild(slide.firstElementChild);
    slide.removeAttribute("style");
  }, duration);
  bulletClassReset();
  //해당하는 bullet에 on 클래스 넣기
  bulletIndex();
}
// 이전 사진으로 슬라이드
function prevSlideImage() {
  photoIndex--;
  photoIndex %= photoCount;
  slide.insertBefore(slide.lastElementChild, slide.firstChild);
  slide.style.left = "-100%";
  slide.style.transition = "0ms";
  window.setTimeout(() => {
    slide.style.left = 0;
    slide.style.transition = duration+"ms";
  });
  bulletClassReset();
  //해당하는 bullet에 on 클래스 넣기
  bulletIndex();
}

// 모든 bullet의 on 클래스를 삭제
function bulletClassReset() {
  bullets.forEach((bullet) => {
    bullet.classList.remove("on");
  });
}
//해당하는 bullet에 on 클래스 넣기
function bulletIndex() {
  // photoIndex가 음수일 때를 고려
  let index = photoIndex + bullets.length;
  index %= bullets.length;
  bullets[index].classList.add("on");
}

// if (isOpen) {
//     document.body.style.overflow = 'hidden';
//   } else {
//     document.body.style.overflow = 'auto';
//   }
