// 세션 유효성 검사 함수
function checkSession() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// CSRF 토큰 검사 함수 추가
function checkCsrfToken() {
  const csrfToken = localStorage.getItem("csrfToken");
  if (!csrfToken) {
      alert("CSRF 토큰이 누락되었습니다. 다시 로그인해주세요.");
      window.location.href = "../account/login.html";
  }
  return csrfToken;
}

document.addEventListener("DOMContentLoaded", function () {
  const studentManagementLink = document.querySelector("a[href='../teacher/student-management.html']");

  // CSRF 토큰 체크
  const csrfToken = checkCsrfToken();

  if (studentManagementLink) {
      studentManagementLink.addEventListener("click", function (event) {
          if (!checkSession()) {
              event.preventDefault();
              alert("로그인이 필요합니다.");
              window.location.href = "../account/login.html";
          }
      });
  }

  // 세션이 유효하면 사용자 이름 표시
  if (checkSession()) {
      const username = localStorage.getItem("username");
      if (username) {
          document.querySelector(".username").textContent = `${username} 선생님`;
      }
  }
});
function click_role_menu() {
  var li = document.getElementsByClassName("active")[0];
  var ul = document.getElementsByClassName("sub-menu")[0];
  if (getComputedStyle(ul).visibility == "hidden") {
      ul.style.visibility = "visible";
      li.style.cssText = "font-weight: bolder;";
  } else {
      ul.style.visibility = "hidden";
      li.style.cssText = "font-weight: normal;";
  }
}

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