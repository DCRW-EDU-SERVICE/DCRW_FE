document.addEventListener("DOMContentLoaded", function () {
  // CSRF 토큰 가져오기
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  // 저장 버튼 클릭 이벤트
  document
    .getElementById("btn-save")
    .addEventListener("click", async function (event) {
      event.preventDefault(); // 폼 기본 제출 막기

      const title = document.getElementById("title").value;
      const category = document.getElementById("category").value;
      const content = $("#summernote").summernote("code"); // Summernote에서 HTML 내용 가져오기

      // 파일을 추가할 경우 파일 객체 생성
      const fileInput = document.getElementById("file-input"); // 파일 input 필드가 있다고 가정
      const file = fileInput ? fileInput.files[0] : null;

      // 게시글 데이터 생성
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", parseInt(category));
      formData.append("boardId", 1); // 게시판 타입 설정 (예: 전체 게시판 = 1)
      formData.append("postDate", new Date().toISOString().split("T")[0]); // 오늘 날짜
      if (file) {
        formData.append("file", file);
      }

      // 게시글 API 요청
      try {
        const response = await fetch("http://13.209.48.39/boards/1/posts", {
          method: "POST",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          body: formData,
          credentials: "include", // 세션 정보 포함
        });

        if (!response.ok) {
          throw new Error(
            `서버 에러: ${response.status} - ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log("API 응답:", result);

        if (result.status === "OK") {
          alert("게시글이 성공적으로 등록되었습니다.");
          window.location.href = "/html/bulletin-board.html"; // 전체 게시판 페이지로 이동
        } else {
          alert("게시글 등록 실패: " + result.message);
        }
      } catch (error) {
        console.error("게시글 등록 중 오류:", error);
        alert(`게시글 등록에 실패했습니다: ${error.message}`);
      }
    });
});
