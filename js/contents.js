document.addEventListener("DOMContentLoaded", function () {
  loadLectures();
  const accordionContainer = document.getElementById("accordion-container");
  const lectureItems = document.querySelectorAll(".lecture-item"); // 모든 강의 항목 선택
  let selectedLecture = ""; // 선택된 강의명 저장 변수
  let activeLectureItem = null; // 현재 수정 중인 강의 항목
  let courseId = null; // 선택한 강의의 courseId 저장
  isLectureSelected = false;

  // 주차 수 (예시: 3주차 강의)
  const weekCount = 3;

  // 수정 버튼 클릭 시 배경색 변경 및 강의 제목 설정
  // 아래 부분에서 event delegation 방식으로 수정
  document
    .querySelector(".lecture-list")
    .addEventListener("click", function (event) {
      if (event.target && event.target.matches(".edit-btn")) {
        const item = event.target.closest(".lecture-item");
        const lectureName = item.querySelector(".lecture-name").textContent;

        // lecture-title에 강의 이름 설정
        const lectureTitleInput = document.getElementById("lecture-title");
        lectureTitleInput.value = lectureName;
        loadExistingContent(courseId); // 기존 콘텐츠 불러오기

        // 강의가 선택되었음을 표시
        isLectureSelected = true;
        alert("강의가 선택되었습니다."); // 강의 선택 메시지 표시
      }
    });
  // 아코디언 동적 생성
  for (let i = 1; i <= weekCount; i++) {
    const accordionItem = document.createElement("div");
    accordionItem.classList.add("accordion-item");

    const headerButton = document.createElement("button");
    headerButton.classList.add("accordion-header");
    headerButton.setAttribute("aria-expanded", "false");
    headerButton.textContent = `${i}주차`;

    const bodyDiv = document.createElement("div");
    bodyDiv.classList.add("accordion-body");

    // 파일 업로드 폼 생성
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("lecture-content");

    const dropArea = document.createElement("div");
    dropArea.classList.add("drop-area");
    dropArea.textContent = "클릭하거나 드래그하여 파일을 업로드할 수 있습니다.";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/*,application/pdf,image/*,.ppt,.pptx";
    fileInput.classList.add("file-upload");
    fileInput.style.display = "block";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "저장";
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";

    saveBtn.classList.add("save-btn");
    deleteBtn.classList.add("delete-btn");

    const viewerDiv = document.createElement("div");
    viewerDiv.classList.add("file-viewer");

    // 드래그 앤 드롭, 파일 선택 이벤트 처리
    dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropArea.classList.add("dragging");
    });

    dropArea.addEventListener("dragleave", () => {
      dropArea.classList.remove("dragging");
    });

    dropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      dropArea.classList.remove("dragging");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        displayViewer(files[0], viewerDiv);
      }
    });

    dropArea.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      const uploadedFile = fileInput.files[0];
      if (uploadedFile) {
        displayViewer(uploadedFile, viewerDiv);
      }
    });

    // 저장 버튼 클릭 이벤트
    saveBtn.addEventListener("click", () => {
      const uploadedFile = fileInput.files[0];
      if (uploadedFile && courseId) {
        uploadContent(courseId, i, uploadedFile);
      } else if (!courseId) {
        alert("강의를 먼저 선택해주세요.");
      } else {
        alert("파일을 업로드해주세요.");
      }
    });

    // 삭제 버튼 클릭 이벤트
    deleteBtn.addEventListener("click", () => {
      deleteContent(courseId, i);
      fileInput.value = "";
      viewerDiv.innerHTML = "";
    });

    // 아코디언 항목에 구성 요소 추가
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(deleteBtn);

    contentDiv.appendChild(buttonContainer);
    contentDiv.appendChild(dropArea);
    contentDiv.appendChild(fileInput);
    contentDiv.appendChild(viewerDiv);

    bodyDiv.appendChild(contentDiv);
    accordionItem.appendChild(headerButton);
    accordionItem.appendChild(bodyDiv);
    accordionContainer.appendChild(accordionItem);

    // 아코디언 클릭 이벤트
    headerButton.addEventListener("click", () => {
      const expanded = headerButton.getAttribute("aria-expanded") === "true";
      headerButton.setAttribute("aria-expanded", !expanded);
      bodyDiv.classList.toggle("show");
    });
  }

  // 콘텐츠 업로드 함수
  function uploadContent(courseId, week, file) {
    const formData = new FormData();
    formData.append("content.courseId", courseId);
    formData.append("content.contentWeek", week);
    formData.append("file.fileName", file.name);
    formData.append("file.fileType", file.type);
    formData.append("file", file);

    fetch("http://localhost:8080/teacher/course", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "OK") {
          alert("파일이 성공적으로 업로드되었습니다.");
        } else {
          alert("파일 업로드에 실패했습니다.");
        }
      });
  }

  // 콘텐츠 삭제 함수
  function deleteContent(courseId, week) {
    fetch(`http://localhost:8080/teacher/contents/${courseId}-${week}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "OK") {
          alert("파일이 성공적으로 삭제되었습니다.");
        } else {
          alert("파일 삭제에 실패했습니다.");
        }
      });
  }
  // 모든 강의 항목의 배경색을 초기화하는 함수
  function clearLectureHighlights() {
    lectureItems.forEach((item) => {
      item.style.backgroundColor = ""; // 배경색 초기화
    });
  }

  // 모든 주차의 파일 입력 필드와 뷰어를 초기화하는 함수
  function clearAllWeekData() {
    const fileInputs = document.querySelectorAll(".file-upload");
    const viewerDivs = document.querySelectorAll(".file-viewer");
    fileInputs.forEach((input) => {
      input.value = "";
    });
    viewerDivs.forEach((viewer) => {
      viewer.innerHTML = "";
    });
  }

  // 파일에 맞는 뷰어를 생성하는 함수
  function displayViewer(file, container) {
    container.innerHTML = "";
    const fileURL = URL.createObjectURL(file);

    if (file.type.includes("video")) {
      const videoViewer = document.createElement("video");
      videoViewer.src = fileURL;
      videoViewer.controls = true;
      videoViewer.width = 320;
      container.appendChild(videoViewer);
    } else if (file.type.includes("pdf")) {
      const pdfViewer = document.createElement("iframe");
      pdfViewer.src = fileURL;
      pdfViewer.width = "100%";
      pdfViewer.height = "300px";
      container.appendChild(pdfViewer);
    } else if (file.type.includes("image")) {
      const imgViewer = document.createElement("img");
      imgViewer.src = fileURL;
      imgViewer.width = 320;
      container.appendChild(imgViewer);
    } else if (file.name.endsWith(".ppt") || file.name.endsWith(".pptx")) {
      const downloadLink = document.createElement("a");
      downloadLink.href = fileURL;
      downloadLink.textContent = "다운로드하여 PPT 파일을 확인하세요";
      downloadLink.download = file.name;
      container.appendChild(downloadLink);
    }
  }
});
// 서버로부터 강의 목록을 불러오는 함수
async function sendRequest() {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
  const response = await fetch("http://localhost:8080/teacher/course", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      //'X-XSRF-TOKEN' : csrfToken
    },
    credentials: "include",
  });

  if (!response.ok) {
    alert("서버에서 강의 목록을 불러오지 못했습니다. 다시 시도해주세요.");
    return null;
  }

  const data = await response.json();
  console.log("Response data:", data);
  return data;
}

// 강의 목록을 HTML에 표시하는 함수
async function loadLectures() {
  const lectureList = document.querySelector(".lecture-list");
  const responseData = await sendRequest();

  if (
    responseData &&
    responseData.status === "OK" &&
    responseData.data &&
    responseData.data.course
  ) {
    const courses = responseData.data.course;

    courses.forEach((course) => {
      const lectureItem = document.createElement("div");
      lectureItem.classList.add("lecture-item");

      const nameDiv = document.createElement("div");
      nameDiv.classList.add("name");

      const serviceSpan = document.createElement("span");
      serviceSpan.classList.add("service-name");
      serviceSpan.textContent = `${responseData.data.teacherName}님의 강의`;

      const lectureNameSpan = document.createElement("span");
      lectureNameSpan.classList.add("lecture-name");
      lectureNameSpan.textContent = course.title;

      nameDiv.appendChild(serviceSpan);
      nameDiv.appendChild(lectureNameSpan);

      const dropdownDiv = document.createElement("div");
      dropdownDiv.classList.add("more-dropdown");

      const moreButton = document.createElement("button");
      moreButton.classList.add("more-btn");
      moreButton.textContent = "⋮";

      const dropdownMenu = document.createElement("div");
      dropdownMenu.classList.add("dropdown", "hidden");

      const editButton = document.createElement("button");
      editButton.classList.add("edit-btn");
      editButton.textContent = "수정";

      dropdownMenu.appendChild(editButton);
      dropdownDiv.appendChild(moreButton);
      dropdownDiv.appendChild(dropdownMenu);

      lectureItem.appendChild(nameDiv);
      lectureItem.appendChild(dropdownDiv);
      lectureList.appendChild(lectureItem);

      // lecture-list에서 이벤트 위임을 사용하여 edit-btn 클릭 이벤트 처리
      document
        .querySelector(".lecture-list")
        .addEventListener("click", function (event) {
          if (event.target.classList.contains("edit-btn")) {
            const item = event.target.closest(".lecture-item");
            const lectureName = item.querySelector(".lecture-name").textContent;
            courseId = item.getAttribute("data-course-id"); // 강의 항목에 courseId 속성 추가

            // lecture-title에 강의 이름 설정
            const lectureTitleInput = document.getElementById("lecture-title");
            lectureTitleInput.value = lectureName;
            loadExistingContent(courseId); // 기존 콘텐츠 불러오기
            isLectureSelected = true;
          }
        });
      // 강의 항목 클릭 이벤트 리스너 추가
      lectureItem.addEventListener("click", (event) => {
        if (
          event.target.classList.contains("edit-btn") ||
          event.target.classList.contains("more-btn") ||
          event.target.closest(".dropdown")
        ) {
          return;
        }

        const lectureName =
          lectureItem.querySelector(".lecture-name").textContent;
        const serviceName =
          lectureItem.querySelector(".service-name").textContent;

        // contents.html로 강의 정보를 쿼리 파라미터로 전달
        const params = new URLSearchParams({
          lecture: lectureName,
          service: serviceName,
        });
        window.location.href = `../course/contents.html?${params.toString()}`;
      });
    });
  } else {
    alert("강의 목록을 불러오지 못했습니다.");
  }
}

// 강의 상세 정보를 로드하는 함수 (수정 이벤트 핸들러)
function loadLectureDetails(course) {
  const lectureTitleInput = document.getElementById("lecture-title");
  lectureTitleInput.value = course.title;

  const weekContainer = document.getElementById("week-container");
  weekContainer.innerHTML = ""; // 기존 주차 내용 제거

  course.student.forEach((student, index) => {
    const newWeekDiv = createWeekPlanElement(
      `Week ${index + 1} - ${student.studentName}`,
      index + 1
    );
    weekContainer.appendChild(newWeekDiv);
  });
}
// 서버에서 기존 콘텐츠를 불러오는 함수
function loadExistingContent(courseId) {
  fetch(`http://localhost:8080/teacher/course/${courseId}/contents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("서버 오류 발생");
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === "OK") {
        data.data.forEach((content) => {
          const week = content.week;
          const viewerDiv = document.querySelector(`#week${week} .file-viewer`);
          displayViewer(
            {
              name: content.fileName,
              type: content.fileType,
              url: content.fileUrl,
            },
            viewerDiv
          );
        });
      } else {
        alert("콘텐츠 불러오기 실패");
      }
    });
}
// 모든 강의 항목의 배경색을 초기화하는 함수
function clearLectureHighlights() {
  const lectureItems = document.querySelectorAll(".lecture-item");
  lectureItems.forEach((item) => {
    item.style.backgroundColor = ""; // 배경색 초기화
  });
}
