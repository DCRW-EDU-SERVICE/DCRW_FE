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

/*
// CSRF 토큰 검사 함수 (주석 처리)
// function checkCsrfToken() {
//     const csrfToken = getCookie("csrfToken");
//     if (!csrfToken) {
//         alert("CSRF 토큰이 누락되었습니다. 다시 로그인해주세요.");
//         window.location.href = "../account/login.html";
//     }
//     return csrfToken;
// }
*/

// 역할별 사이드바를 동적으로 로드하는 함수
async function loadSidebar(role, name, location) {
  const sidebarContainer = document.getElementById("dynamic-sidebar");
  let sidebarFile = "";

  switch (role) {
      case "ROLE_TEACHER":
          sidebarFile = "../teacher/teacher-sidebar.html";
          break;
      case "ROLE_USER":
          sidebarFile = "../student/student-sidebar.html";
          break;
      case "ROLE_ADMIN":
          sidebarFile = "../manager/manager-sidebar.html";
          break;
      default:
          console.error("알 수 없는 역할:", role);
          return;
  }

  try {
      const response = await fetch(sidebarFile);
      const sidebarHtml = await response.text();

      sidebarContainer.innerHTML = sidebarHtml;
      document.querySelector(".username").textContent = `${name} ${role === "ROLE_USER" ? "학생" : "선생님"}`;
      document.querySelector(".location").textContent = `${location} 지역`;
  } catch (error) {
      console.error("사이드바 로드 오류:", error);
  }
}

// 사용자 정보를 서버에서 가져오는 함수
async function fetchUserProfile() {
  try {
      const response = await fetch("http://localhost:8080/user/main", {
        method: "GET",
        credentials: "include" // 쿠키에 포함된 세션 정보 (JSESSIONID) 포함
      });

      // 서버 응답이 403 Forbidden일 때 에러 메시지 표시
      if (response.status === 403) {
          console.error("접근이 거부되었습니다. 서버에 접근 권한이 없습니다.");
          alert("로그인 후 접근해 주세요.");
          window.location.href = "../account/login.html";
          return;
      }

      // 응답이 정상적일 때 JSON 파싱 및 데이터 처리
      const data = await response.json();
      if (data.status === "OK") {
          const name = data.data.name;
          const location = data.data.secondAddress;
          const role = localStorage.getItem("role"); // 역할을 로컬스토리지에서 가져옴

          loadSidebar(role, name, location); // 사이드바 로드
      } else {
          console.error("프로필 조회 실패:", data.message);
      }
  } catch (error) {
      console.error("프로필 조회 오류:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // CSRF 토큰 체크 (주석 처리)
  // const csrfToken = checkCsrfToken();

  // 세션이 유효한 경우 사용자 프로필을 로드
  if (checkSession()) {
      fetchUserProfile(); // 프로필 조회 함수 호출
  } else {
      alert("로그인이 필요합니다.");
      window.location.href = "../account/login.html"; // 로그인 페이지로 이동
  }
});

// 사이드 메뉴 클릭 시 서브 메뉴 표시 기능
function click_role_menu() {
  var li = document.getElementsByClassName("active")[0];
  var ul = document.getElementsByClassName("sub-menu")[0];
  if (getComputedStyle(ul).visibility == "hidden") {
      ul.style.visibility = "visible"; // 서브 메뉴 보이기
      li.style.cssText = "font-weight: bolder;";
  } else {
      ul.style.visibility = "hidden"; // 서브 메뉴 숨기기
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
