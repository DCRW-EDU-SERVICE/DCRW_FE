document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const boardType = urlParams.get("boardType");
  const postId = urlParams.get("postId");

  // `sessionStorage`에서 게시글 데이터 가져오기
  const post = JSON.parse(sessionStorage.getItem("editPost"));

  // 게시글 데이터 렌더링
  function renderEditPost(post) {
    document.getElementById("title").value = post.title;
    document.getElementById("category").value = post.category; // 카테고리 ID 그대로 사용
    document.getElementById("content").value = post.content;

    const fileListContainer = document.getElementById("file-list");
    fileListContainer.innerHTML = "";

    if (post.file && post.file.length > 0) {
      post.file.forEach((file) => {
        const fileLink = document.createElement("a");
        fileLink.href = file.fileUrl;
        fileLink.textContent = file.fileName;
        fileLink.target = "_blank";
        fileListContainer.appendChild(fileLink);
        fileListContainer.appendChild(document.createElement("br"));
      });
    } else {
      fileListContainer.innerHTML = "<p>첨부된 파일이 없습니다.</p>";
    }
  }

  // 파일 첨부 리스트 업데이트
  function updateFileList(event) {
    const fileListContainer = document.getElementById("file-list");
    fileListContainer.innerHTML = "";

    const files = Array.from(event.target.files);
    if (files.length > 0) {
      files.forEach((file) => {
        const fileItem = document.createElement("p");
        fileItem.textContent = file.name;
        fileListContainer.appendChild(fileItem);
      });
    } else {
      fileListContainer.innerHTML = "<p>첨부된 파일이 없습니다.</p>";
    }
  }

  // 파일 첨부 리스너 추가
  document
    .getElementById("file-upload")
    .addEventListener("change", updateFileList);

  // 저장 버튼 클릭 이벤트
  document
    .getElementById("btn-save")
    .addEventListener("click", async function (event) {
      event.preventDefault();

      const updatedTitle = document.getElementById("title").value;
      const updatedCategory = parseInt(
        document.getElementById("category").value,
        10
      );
      const updatedContent = document.getElementById("content").value;

      // 파일 첨부 정보 가져오기
      const fileInput = document.getElementById("file-upload");
      const files = fileInput ? Array.from(fileInput.files) : [];

      // 게시글 데이터 생성
      const formData = new FormData();
      formData.append(
        "post",
        new Blob(
          [
            JSON.stringify({
              title: updatedTitle,
              category: updatedCategory,
              content: updatedContent,
              boardId: parseInt(boardType, 10), // boardType을 boardId로 사용
            }),
          ],
          { type: "application/json" }
        )
      );

      // 파일 추가 (여러 파일 지원)
      files.forEach((file) => {
        formData.append("file", file);
      });

      try {
        const response = await fetch(
          `http://localhost:8080/boards/${boardType}/posts/${postId}`,
          {
            method: "PATCH",
            credentials: "include",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`게시글 수정 실패: ${response.status}`);
        }

        alert("게시글이 성공적으로 수정되었습니다.");
        window.location.href = `./board-read.html?boardType=${boardType}&postId=${postId}`;
      } catch (error) {
        console.error("게시글 수정 중 오류:", error);
        alert("게시글 수정에 실패했습니다.");
      }
    });

  // 게시글 데이터 렌더링 호출
  renderEditPost(post);
});
