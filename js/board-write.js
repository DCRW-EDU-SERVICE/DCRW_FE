document.addEventListener("DOMContentLoaded", function () {
  // URL에서 boardType 추출
  const urlParams = new URLSearchParams(window.location.search);
  const boardType = urlParams.get("boardType") || 0; // 기본값으로 0(전체 게시판)

  // 사용자 역할 확인용 (role: 1이 관리자)
  const userRole = parseInt(localStorage.getItem("userRole"), 10) || 0; // 로컬 스토리지에서 역할 정보 가져오기
  console.log("현재 사용자 역할:", userRole);

  // 공지사항 카테고리 선택 제한
  const categorySelect = document.getElementById("category");
  categorySelect.addEventListener("change", function () {
    const selectedCategory = parseInt(categorySelect.value, 10);
    if (selectedCategory === 1 && userRole !== 1) {
      alert("공지사항은 관리자만 작성할 수 있습니다.");
      categorySelect.value = ""; // 선택 해제
    }
  });

  // 여러 이미지 미리보기
  function previewImages(event) {
    const previewContainer = document.getElementById("image-preview");
    previewContainer.innerHTML = ""; // 기존 미리보기 초기화

    const files = Array.from(event.target.files); // 파일 배열 생성
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();

        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.alt = "첨부 이미지";
          img.style.margin = "5px";
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          previewContainer.appendChild(img);
        };

        reader.readAsDataURL(file);
      });
    } else {
      previewContainer.innerHTML = "<p>첨부한 이미지가 여기에 표시됩니다.</p>";
    }
  }

  // 파일 첨부 리스트 업데이트
  function updateFileList(event) {
    const fileListContainer = document.getElementById("file-list");
    fileListContainer.innerHTML = ""; // 기존 리스트 초기화

    const files = Array.from(event.target.files); // 파일 배열 생성
    if (files.length > 0) {
      files.forEach((file) => {
        const fileItem = document.createElement("p");
        fileItem.textContent = file.name;
        fileListContainer.appendChild(fileItem);
      });
    } else {
      fileListContainer.innerHTML = "<p>첨부된 파일이 여기에 표시됩니다.</p>";
    }
  }

  // 여러 비디오 미리보기
  function previewVideos(event) {
    const previewContainer = document.getElementById("video-preview");
    previewContainer.innerHTML = ""; // 기존 미리보기 초기화

    const files = Array.from(event.target.files); // 파일 배열 생성
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();

        reader.onload = function (e) {
          const video = document.createElement("video");
          video.src = e.target.result;
          video.controls = true;
          video.style.margin = "5px";
          previewContainer.appendChild(video);
        };

        reader.readAsDataURL(file);
      });
    } else {
      previewContainer.innerHTML = "<p>첨부한 비디오가 여기에 표시됩니다.</p>";
    }
  }

  // 파일 이벤트 리스너 추가
  document
    .getElementById("file-upload")
    .addEventListener("change", updateFileList);

  // 저장 버튼 클릭 이벤트
  document
    .getElementById("btn-save")
    .addEventListener("click", async function (event) {
      event.preventDefault(); // 폼 기본 제출 막기

      const title = document.getElementById("title").value;
      const category = parseInt(document.getElementById("category").value, 10); // 카테고리 값 정수로 변환
      const content = document.getElementById("content").value;

      // 공지사항 제한 검증
      if (category === 1 && userRole !== 1) {
        alert("공지사항은 관리자만 작성할 수 있습니다.");
        return;
      }

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
              title: title,
              content: content,
              category: category,
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
          `http://localhost:8080/boards/${boardType}/posts`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`게시글 등록 실패: ${response.status}`);
        }

        const result = await response.json();
        console.log("게시글 등록 성공:", result);
        alert("게시글 등록 성공!");
        window.location.href = `./bulletin-board.html?boardType=${boardType}`; // 성공 후 이동
      } catch (error) {
        console.error("게시글 등록 중 오류:", error);
        alert("게시글 등록에 실패했습니다.");
      }
    });
});
