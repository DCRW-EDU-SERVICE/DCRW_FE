// 쿠키에서 특정 이름의 값을 가져오는 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  // 세션 유효성 검사 함수
  function checkSession() {
    return localStorage.getItem("isLoggedIn") === "true";
  }
  
  // 쿠키에서 CSRF 토큰 검사 함수
  function checkCsrfToken() {
    const csrfToken = getCookie("csrfToken");
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
  
  // 사이드 메뉴 클릭 시 서브 메뉴 표시 기능
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
  
  // 로그인 요청 함수 (기존 코드와 동일)
  async function sendRequest() {
    const userId = document.getElementById("id").value;
    const password = document.getElementById("pw").value;
  
    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfTokenMeta ? csrfTokenMeta.getAttribute("content") : null;
  
    if (!csrfToken) {
      throw new Error("CSRF 토큰이 존재하지 않습니다. 서버 설정을 확인하세요.");
    }
  
    return await fetch('http://13.209.48.39/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({ username: userId, password: password })
    });
  }
  