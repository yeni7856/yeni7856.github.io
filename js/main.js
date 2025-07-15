function openModal(imgSrc) {
      const modal = document.getElementById("modal");
      const modalImg = document.getElementById("modal-image");
      modalImg.src = imgSrc;
      modal.classList.add("show");
      document.querySelector(".close-btn").style.display = "flex";
      document.body.classList.add("scroll_hidden");
    }

    function openModalWithVideo(imgSrc, videoSrc = '') {
      const modal = document.getElementById("modal");
      const modalContent = document.getElementById("modal-content");
      modalContent.innerHTML = '';

      if (imgSrc) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = "modal image";
        modalContent.appendChild(img);
      }

      if (videoSrc) {
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        const source = document.createElement('source');
        source.src = videoSrc;
        source.type = 'video/mp4';
        video.appendChild(source);
        modalContent.appendChild(video);
      }

      modal.classList.add("show");
      document.querySelector(".close-btn").style.display = "flex";
      document.body.classList.add("scroll_hidden");
    }

    function closeModal() {
      const modal = document.getElementById("modal");
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