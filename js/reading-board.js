document.addEventListener("DOMContentLoaded", function () {
  const pageSize = 8; // 한 페이지에 표시할 게시글 수
  let currentPage = 0; // 현재 페이지 (0부터 시작)
  const maxVisiblePages = 5; // 한 번에 보이는 페이징 버튼 수

  // 현재 boardType을 동적으로 가져오기 (URL 파라미터 활용)
  const urlParams = new URLSearchParams(window.location.search);
  const boardType = urlParams.get("boardType") || 0; // 기본값: 전체 게시판 (boardType = 0)

  console.log("현재 boardType:", boardType);

  // 게시판 데이터 가져오기
  async function fetchBoardData(page) {
    try {
      const response = await fetch(
        `http://localhost:8080/boards?type=${boardType}&page=${page}&size=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `서버 에러: ${response.status} - ${response.statusText}`
        );
      }

      const result = await response.json(); // 응답을 JSON으로 파싱
      console.log(`페이지 ${page} 데이터:`, result);

      if (result.status === "OK") {
        const organizedData = organizeBoardContent(result.data.content); // 공지사항 분리
        renderBoardContent(organizedData);
        renderPagination(result.data.totalPages, page);
      } else {
        console.error("Failed to load board data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching board data:", error);
    }
  }

  // 공지사항 상단 고정
  function organizeBoardContent(contents) {
    const notices = contents.filter((content) => content.categoryId === 1); // 공지사항 필터링
    const otherPosts = contents.filter((content) => content.categoryId !== 1);
    return [...notices, ...otherPosts]; // 공지사항 + 나머지 게시글
  }

  // 게시글 데이터 렌더링
  function renderBoardContent(contents) {
    const boardContent = document.getElementById("board-content");
    boardContent.innerHTML = ""; // 기존 내용 지우기

    if (contents.length === 0) {
      boardContent.innerHTML = `<tr><td colspan="4">게시글이 없습니다.</td></tr>`;
      return;
    }

    contents.forEach((content) => {
      const {
        title,
        content: postContent,
        postDate,
        userName,
        categoryId,
      } = content;
      const row = document.createElement("tr");

      // 공지사항인지 확인하고 스타일 적용
      if (content.categoryId === 1) {
        row.classList.add("notice"); // 공지사항 스타일 클래스 추가
      }

      row.innerHTML = `
     <td>
        <a href="./board-read.html" class="post-link">${content.title}</a>
      </td>
      <td class="post-link">${new Date(
        content.postDate
      ).toLocaleDateString()}</td>
      <td class="post-link">${content.userName}</td>
      <td class="post-link">${getCategoryName(content.categoryId)}</td>
    `;

      row.querySelector(".post-link").addEventListener("click", (event) => {
        event.preventDefault();
        const postId = content.id; // 게시글 ID
        const boardType = 0; // 현재 게시판 타입
        window.location.href = `./board-read.html?boardType=${boardType}&postId=${postId}`;
      });

      boardContent.appendChild(row);
    });
  }

  // 카테고리 이름을 가져오는 함수
  function getCategoryName(categoryId) {
    const categories = {
      1: "공지사항",
      2: "오류신고",
      3: "자료공유",
      4: "자유글",
      5: "QnA",
    };

    if (!categories[categoryId]) {
      console.warn("알 수 없는 카테고리 ID:", categoryId); // 잘못된 카테고리 ID 디버깅
    }

    return categories[categoryId] || "기타";
  }

  // 페이징 버튼 렌더링
  function renderPagination(totalPages, activePage) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (totalPages <= 1) return; // 한 페이지만 있을 경우 페이징 표시 안 함

    const startPage =
      Math.floor(activePage / maxVisiblePages) * maxVisiblePages;
    const endPage = Math.min(startPage + maxVisiblePages, totalPages);

    // 이전 버튼 추가
    if (startPage > 0) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "이전";
      prevButton.addEventListener("click", () => {
        fetchBoardData(startPage - 1);
      });
      pagination.appendChild(prevButton);
    }

    // 페이징 버튼 추가
    for (let i = startPage; i < endPage; i++) {
      const button = document.createElement("button");
      button.textContent = i + 1; // 페이지 번호는 1부터 시작
      button.classList.add("pagination-button");
      if (i === activePage) {
        button.classList.add("active");
      }

      button.addEventListener("click", () => {
        currentPage = i;
        fetchBoardData(currentPage); // 선택한 페이지 데이터 로드
      });

      pagination.appendChild(button);
    }

    // 다음 버튼 추가
    if (endPage < totalPages) {
      const nextButton = document.createElement("button");
      nextButton.textContent = "다음";
      nextButton.addEventListener("click", () => {
        fetchBoardData(endPage);
      });
      pagination.appendChild(nextButton);
    }
  }

  // 초기 데이터 로드
  fetchBoardData(currentPage);
});
