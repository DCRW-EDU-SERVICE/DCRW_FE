document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const boardType = urlParams.get("boardType");
  const postId = urlParams.get("postId");
  let varflag = 1;

  // 게시글 데이터 가져오기
  async function fetchPostData() {
    varflag = 1;
    try {
      const response = await fetch(
        `http://localhost:8080/boards/posts/${postId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`게시글 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("게시글 조회 결과:", result);

      if (result.status === "OK") {
        renderPost(result.data);
      } else {
        alert("게시글을 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error("게시글 조회 중 오류:", error);
      alert("게시글 조회에 실패했습니다.");
    }
  }

  async function deletePost() {
    varflag = 0;
    const confirmDelete = confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8080/boards/${boardType}/posts/${postId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`게시글 삭제 실패: ${response.status}`);
      }

      alert("게시글이 삭제되었습니다.");
      // 게시글 삭제 후 게시판 목록 페이지로 리다이렉트
      window.location.href = `./bulletin-board.html?boardType=${boardType}`;
    } catch (error) {
      console.error("게시글 삭제 중 오류:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  }

  // 댓글 목록 가져오기
  async function fetchComments() {
    varflag = 1;
    try {
      const response = await fetch(
        `http://localhost:8080/boards/posts/${postId}/comments`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`댓글 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("댓글 조회 결과:", result);

      if (result.status === "OK") {
        renderComments(result.data);
      } else {
        alert("댓글을 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error("댓글 조회 중 오류:", error);
      alert("댓글 조회에 실패했습니다.");
    }
  }

  // 댓글 등록
  async function postComment() {
    varflag = 0;
    const commentInput = document.getElementById("comment-input");
    const commentContent = commentInput.value.trim();

    if (!commentContent) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/boards/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            content: commentContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`댓글 등록 실패: ${response.status}`);
      }

      alert("댓글이 등록되었습니다.");
      // 댓글 등록 후 현재 페이지 새로고침
      window.location.href = `./board-read.html?boardType=${boardType}&postId=${postId}`;
    } catch (error) {
      console.error("댓글 등록 중 오류:", error);
      alert("댓글 등록에 실패했습니다.");
    }
  }

  // 댓글 삭제
  async function deleteComment(commentId) {
    varflag = 0;
    try {
      const response = await fetch(
        `http://localhost:8080/boards/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            commentId: commentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`댓글 삭제 실패: ${response.status}`);
      }
      alert("댓글이 삭제되었습니다.");
      window.location.href = `./board-read.html?boardType=${boardType}&postId=${postId}`;
    } catch (error) {
      console.error("댓글 삭제 중 오류:", error);
      console.error("commentId:", commentId);
      alert("댓글 삭제에 실패했습니다.");
    }
  }

  // 게시글 데이터 렌더링
  function renderPost(post) {
    document.getElementById("title").value = post.title;
    document.getElementById("category").value = getCategoryName(post.category);
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

    const editButton = document.getElementById("edit-button");
    if (post.myPost) {
      editButton.classList.remove("hidden");
      editButton.addEventListener("click", (event) => {
        event.preventDefault();
        redirectToEditPage(post);
      });
    } else {
      editButton.classList.add("hidden");
    }

    const deleteButton = document.getElementById("delete-button");
    if (post.myPost) {
      deleteButton.classList.remove("hidden");
      deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        deletePost();
      });
    } else {
      deleteButton.classList.add("hidden");
    }

    // 수정 페이지로 리다이렉트
    function redirectToEditPage(post) {
      const editUrl = `./board-update.html?boardType=${boardType}&postId=${postId}`;
      sessionStorage.setItem("editPost", JSON.stringify(post)); // 게시글 데이터 저장
      location.assign(editUrl);
    }
  }

  // 댓글 데이터 렌더링
  function renderComments(comments) {
    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = "";

    if (comments.length === 0) {
      commentList.innerHTML = "<p>댓글이 없습니다.</p>";
      return;
    }

    comments.forEach((comment) => {
      const commentItem = document.createElement("div");
      commentItem.classList.add("comment-item");

      commentItem.innerHTML = `
      <p><strong>${comment.userName}</strong> (${new Date(
        comment.commentDate
      ).toLocaleString()}):</p>
      <p>${comment.content}</p>
    `;

      if (comment.myComment) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.addEventListener("click", () =>
          deleteComment(comment.commentId)
        );
        commentItem.appendChild(deleteButton);
      }

      commentList.appendChild(commentItem);
    });
  }

  // 카테고리 이름 변환
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

  if (varflag != 0) {
    // 초기 데이터 가져오기
    await fetchPostData();
    await fetchComments();
    varflag = 1;
  }

  // 댓글 등록 이벤트 연결
  document
    .getElementById("comment-submit")
    .addEventListener("click", postComment);
});
