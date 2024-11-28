document.addEventListener("DOMContentLoaded", function () {
  // 로그아웃 처리
  async function logout() {
    try {
      const response = await fetch(`http://localhost:8080/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 세션 쿠키 포함
        body: JSON.stringify({ username: userId }),
      });

      if (!response.ok) {
        throw new Error(`로그아웃 실패: ${response.status}`);
      }

      // 성공적으로 로그아웃하면 로컬 스토리지 정리 후 로그인 페이지로 이동
      localStorage.clear();
      alert("로그아웃되었습니다.");
      window.location.href = "../account/login.html"; // 로그아웃 후 로그인 페이지로 이동
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      alert("로그아웃에 실패했습니다.");
    }
  }

  // 로그아웃 버튼 이벤트 연결
  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", function (event) {
    event.preventDefault();
    logout();
  });
});

// Swiper 설정
new Swiper(".swiper", {
  autoplay: {
    delay: 2000,
  },
  loop: true,
  slidesPerView: 1,
  spaceBetween: 10,
  centeredSlides: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    prevEl: ".swiper-button-prev",
    nextEl: ".swiper-button-next",
  },
});
