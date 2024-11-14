document.addEventListener("DOMContentLoaded", function () {
  const boardType = 4; // 부모게시판타입을 3으로 설정
  const pageSize = 8;
  let currentPage = 0; // 페이지 번호를 0으로 시작

  // CSRF 토큰 가져오기
  // CSRF 토큰 추출
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");
  console.log("CSRF Token:", csrfToken); // 토큰확인

  // 게시판 목록 불러오기
  async function fetchBoardData(page) {
    try {
      const response = await fetch(
        `http://13.209.48.39/boards?type=${boardType}&page=${page}&size=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken, // CSRF 토큰을 헤더에 추가
          },
          credentials: "include", // 세션 정보 포함 (필요한 경우)
        }
      );

      if (!response.ok) {
        throw new Error(
          `서버 에러: ${response.status} - ${response.statusText}`
        );
      }

      const result = await response.json(); // 응답을 JSON으로 파싱
      console.log("API 응답:", result);

      if (result.status === "OK") {
        renderBoardContent(result.data.content);
        renderPagination(result.data.totalPages, page);
      } else {
        console.error("Failed to load board data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching board data:", error);
    }
  }

  function renderBoardContent(contents) {
    const boardContent = document.getElementById("board-content");
    boardContent.innerHTML = ""; // 기존 내용 지우기

    // 공지사항(카테고리 ID가 1인 글)과 나머지 글로 분리
    const notices = contents.filter((content) => content.catagoryId === 1);
    const otherPosts = contents.filter((content) => content.catagoryId !== 1);

    // 공지사항을 먼저 렌더링
    notices.forEach((content) => {
      const row = document.createElement("tr");
      row.classList.add("notice"); // 공지사항 스타일을 위한 클래스 추가 (선택 사항)

      row.innerHTML = `
                  <td>${content.title}</td>
                  <td>${new Date(content.postDate).toLocaleDateString()}</td>
                  <td>${content.userName}</td>
                  <td>${getCategoryName(content.catagoryId)}</td>
              `;
      boardContent.appendChild(row);
    });

    // 그 외 나머지 글을 렌더링
    otherPosts.forEach((content) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                  <td>${content.title}</td>
                  <td>${new Date(content.postDate).toLocaleDateString()}</td>
                  <td>${content.userName}</td>
                  <td>${getCategoryName(content.catagoryId)}</td>
              `;
      boardContent.appendChild(row);
    });
  }

  // 카테고리 이름을 가져오는 함수 (기존에 사용한 코드)
  function getCategoryName(categoryId) {
    const categories = {
      1: "공지사항",
      2: "자료공유",
      3: "자유글",
      4: "QnA",
      5: "오류신고",
    };
    return categories[categoryId] || "기타";
  }

  // 페이징 렌더링 함수
  function renderPagination(totalPages, activePage) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.classList.add(i === activePage ? "active" : "");
      button.addEventListener("click", () => {
        currentPage = i;
        fetchBoardData(currentPage);
      });
      pagination.appendChild(button);
    }
  }

  // 초기 데이터 로드
  fetchBoardData(currentPage);
});
