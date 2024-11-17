class DynamicSidebar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }); // Shadow DOM 활성화
    }
  
    // 쿠키에서 특정 이름의 값을 가져오는 함수
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    }
  
    // 세션 유효성 검사
    checkSession() {
      return localStorage.getItem("isLoggedIn") === "true";
    }
  
    // 사이드바 파일 로드 함수
    async loadSidebar(role, name, location) {
      let sidebarFile = "";
      let roleDescription = "";
  
      switch (role) {
        case "ROLE_TEACHER":
          sidebarFile = "../teacher/teacher-sidebar.html";
          roleDescription = `${name} 선생님`;
          break;
        case "ROLE_USER":
          sidebarFile = "../student/student-sidebar.html";
          roleDescription = `${name} 학생`;
          break;
        case "ROLE_ADMIN":
          sidebarFile = "../manager/manager-sidebar.html";
          roleDescription = `관리자`;
          break;
        default:
          console.error("알 수 없는 역할:", role);
          return;
      }
  
      try {
        const response = await fetch(sidebarFile);
        if (!response.ok) {
          console.error("Sidebar 파일 로드 실패:", response.statusText);
          return;
        }
  
        const sidebarHtml = await response.text();
        this.render(sidebarHtml, roleDescription, location);
      } catch (error) {
        console.error("Sidebar 로드 중 오류 발생:", error);
      }
    }
  
    // 사이드바 렌더링
    render(sidebarHtml, roleDescription, location) {
      this.shadowRoot.innerHTML = `
        <style>
        * {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Noto Sans KR', sans-serif;
            line-height: 1.6;
            background-color: #f5f5f5;
        }
        .container {
            width:97.5vw;
            height:94vh;
            display: flex;
            padding-top:2.5vh;
            padding-bottom:2.5vh;
            padding-left:1vw;
            padding-right:1vw
        }
        /* 공통 스타일 */
        .sidebar {
            width: 18vw;
            height: 95vh;
            background-color: #ffffff;
            border-right: 1px solid #ddd;
            border-radius: 30px 0 0 30px;
            //overflow-y: auto; /* 스크롤 허용 */
            padding-top:20px;
        }
        .profile {
            width: 60%;
            text-align: center;
            margin: 10%;
            padding: 10%;
            background-color: #ddd;
            border-radius: 30px;
            margin-bottom:0;
        }
        .profile-image {
            width: 8vw;
            height: 8.3vw;
            border-radius: 50%;
            margin-bottom: 2vh;
            background-color: #ffffff;
        }
        .username {
            font-weight: bold;
            margin-bottom: 3px;
        }
        .location {
            color: gray;
        }
        .nav{
            width: 60%;
            margin:10%; 
            margin-top:10px;
            padding-left:10%;
        }
        .nav ul {
            width: 100%;
            list-style: none;
            padding:0;
            
        }
        .nav ul.basic-menu li{
            margin-bottom: 1.5vh;
            
        }
        .nav ul.basic-menu hr {
            margin-top: 3vh;
            margin-bottom: 3vh;

        }
        .sub-menu{
            margin-left: 10%;
            margin-top: 10%;
            visibility: hidden;
        }
        .sub-menu li a {
            margin-bottom: 1vh;
        }
        .nav ul li a {
            text-decoration: none;
            color: #333;
        }
        </style>
        <div class="sidebar">
          <div class="profile">
            <img src="../images/book_puppy.png" alt="프로필 사진" class="profile-image">
            <p class="username">${roleDescription}</p>
            <p class="location">${location ? `${location} 지역` : ''}</p>
          </div>
          ${sidebarHtml}
        </div>
      `;
  
      // 서브 메뉴 클릭 이벤트 연결
      this.attachSubMenuToggle();
    }
  
    // 서브 메뉴 클릭 시 서브 메뉴 표시 토글
    attachSubMenuToggle() {
      const activeMenuItem = this.shadowRoot.querySelector(".active");
      if (activeMenuItem) {
        activeMenuItem.addEventListener("click", this.toggleSubMenu.bind(this));
      }
    }
  
    // 서브 메뉴 표시 토글
    toggleSubMenu(event) {
      const li = event.target;
      const ul = li.nextElementSibling;
  
      if (ul && ul.classList.contains("sub-menu")) {
        if (getComputedStyle(ul).visibility === "hidden") {
          ul.style.visibility = "visible"; // 서브 메뉴 보이기
          li.style.fontWeight = "bolder"; // 메뉴 강조
        } else {
          ul.style.visibility = "hidden"; // 서브 메뉴 숨기기
          li.style.fontWeight = "normal"; // 메뉴 강조 해제
        }
      }
    }
  
     // 사용자 프로필 정보 가져오기
    async fetchUserProfile() {
        try {
        const response = await fetch("http://localhost:8080/user/main", {
            method: "GET",
            credentials: "include" // 세션 정보를 포함한 요청
        });

        if (response.status === 403) {
            alert("로그인이 필요합니다.");
            window.location.href = "../account/login.html";
            return;
        }

        const data = await response.json();
        console.log("서버 응답 데이터:", data); // 서버 응답 데이터 로그 추가
        if (data.status === "OK") {
            const role = localStorage.getItem("role");
            const { name, secondAddress: location} = data.data; // 서버 응답에서 role 가져오기
            this.loadSidebar(role, name, location); // 사이드바 로드
        } else {
            console.error("프로필 조회 실패:", data.message);
        }
        } catch (error) {
        console.error("프로필 조회 오류:", error);
        }
    }
  
    // DOM에 컴포넌트 추가 시 동작
    connectedCallback() {
      // 세션 체크 후 사이드바 로드
      if (this.checkSession()) {
        this.fetchUserProfile();
      } else {
        alert("로그인이 필요합니다.");
        window.location.href = "../account/login.html";
      }
    }
  }
  
  // 컴포넌트 정의
  customElements.define('dynamic-sidebar', DynamicSidebar);
  