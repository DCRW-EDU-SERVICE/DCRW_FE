document.addEventListener("DOMContentLoaded", function () {
  const boardType = 0; // 전체 게시판 타입
  const pageSize = 8; // 한 페이지에 표시할 게시글 수
  let currentPage = 0; // 현재 페이지 (0부터 시작)
  const maxVisiblePages = 5; // 한 번에 보이는 페이징 버튼 수

  const searchInput = document.getElementById("search-input");
  const searchButton = document.querySelector(".search-button");

  // 게시판 데이터 가져오기 (검색어 포함)
  async function fetchBoardData(page, query = "") {
    try {
      // 검색어가 있으면 query 파라미터 추가
      const url = query
        ? `http://localhost:8080/boards/search?type=${boardType}&query=${encodeURIComponent(
            query
          )}&page=${page}&size=${pageSize}`
        : `http://localhost:8080/boards?type=${boardType}&page=${page}&size=${pageSize}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `서버 에러: ${response.status} - ${response.statusText}`
        );
      }

      const result = await response.json(); // 응답을 JSON으로 파싱
      console.log(`페이지 ${page} 데이터:`, result);

      if (result.status === "OK") {
        renderBoardContent(result.data.content);
        renderPagination(result.data.totalPages, page, query);
      } else {
        console.error("Failed to load board data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching board data:", error);
    }
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
      const { title, postDate, userName, category } = content;
      const row = document.createElement("tr");

      row.innerHTML = `
      <td>
        <a href="./board-read.html?boardType=${boardType}&postId=${
        content.postId
      }" class="post-link">${title}</a>
      </td>
      <td>${new Date(postDate).toLocaleDateString()}</td>
      <td>${userName}</td>
      <td>${getCategoryName(category)}</td>
    `;

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
    return categories[categoryId] || "기타";
  }

  // 페이징 버튼 렌더링
  function renderPagination(totalPages, activePage, query = "") {
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
        fetchBoardData(startPage - 1, query);
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
        fetchBoardData(currentPage, query); // 선택한 페이지 데이터 로드
      });

      pagination.appendChild(button);
    }

    // 다음 버튼 추가
    if (endPage < totalPages) {
      const nextButton = document.createElement("button");
      nextButton.textContent = "다음";
      nextButton.addEventListener("click", () => {
        fetchBoardData(endPage, query);
      });
      pagination.appendChild(nextButton);
    }
  }

  // 검색 버튼 클릭 이벤트
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      fetchBoardData(0, query); // 검색 시 첫 페이지부터 시작
    } else {
      alert("검색어를 입력하세요.");
    }
  });

  // 초기 데이터 로드
  fetchBoardData(currentPage);
});
