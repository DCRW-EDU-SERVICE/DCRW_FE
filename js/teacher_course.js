document.addEventListener("DOMContentLoaded", function () {
  loadLectures();

  const addWeekButton = document.getElementById("add-week");
  const weekContainer = document.getElementById("week-container");
  let weekCount = 1; // 기본 주차 번호

  // 강의 목록 항목 클릭 이벤트
  const lectureItems = document.querySelectorAll(".lecture-item");
  lectureItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      if (
        event.target.classList.contains("edit-btn") ||
        event.target.classList.contains("more-btn") ||
        event.target.closest(".dropdown")
      ) {
        return;
      }

      const lectureName = item.querySelector(".lecture-name").textContent;
      const serviceName = item.querySelector(".service-name").textContent;

      // contents.html로 강의 정보를 쿼리 파라미터로 전달
      const params = new URLSearchParams({
        lecture: lectureName,
        service: serviceName,
      });
      window.location.href = `../course/contents.html?${params.toString()}`;
    });
  });

  // 강의 저장 버튼 이벤트
  const saveLectureButton = document.getElementById("save-lecture");
  saveLectureButton.addEventListener("click", function () {
    const lectureTitle = document.getElementById("lecture-title").value;

    if (!lectureTitle) {
      alert("강의 제목을 입력해 주세요.");
      return;
    }

    const weekPlans = document.querySelectorAll(".week-plan textarea");
    const lectureData = {
      title: lectureTitle,
      weeks: [],
    };

    weekPlans.forEach((textarea, index) => {
      lectureData.weeks.push({
        week: index + 1,
        content: textarea.value,
      });
    });

    lectures[lectureTitle] = lectureData; // 메모리 내에 저장

    console.log("저장된 강의 데이터:", lectures);
    alert("강의가 저장되었습니다!");
  });

  // 수정 버튼 클릭 시 강의 제목과 주차별 강의계획서 로드
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const item = event.target.closest(".lecture-item");
      const lectureName = item.querySelector(".lecture-name").textContent;

      // courseId 가져오기 (responseData에서 필요한 데이터를 찾음)
      const course = findCourseByLectureName(lectureName);
      if (!course) {
        alert("해당 강의를 찾을 수 없습니다.");
        return;
      }

      const courseId = course.courseId;

      // lecture-title에 강의 이름 설정
      const lectureTitleInput = document.getElementById("lecture-title");
      lectureTitleInput.value = lectureName;

      // 서버에서 강의 데이터를 가져오기
      const courseData = await fetchCourseData(courseId);

      if (courseData) {
        const weekContainer = document.getElementById("week-container");
        weekContainer.innerHTML = ""; // 기존 주차 내용 제거

        // 서버에서 가져온 강의 계획 데이터를 기반으로 아코디언 생성
        courseData.coursePlanList.forEach((plan) => {
          const newWeekDiv = createWeekPlanElement(plan.content, plan.week);
          weekContainer.appendChild(newWeekDiv);
        });
      }
      // 강의가 선택되었음을 표시
      isLectureSelected = true;
      alert("강의가 선택되었습니다."); // 강의 선택 메시지 표시
    });
  });

  // 주차 추가 버튼 클릭 이벤트
  addWeekButton.addEventListener("click", function () {
    /*
        if (!isLectureSelected) {
            alert("수정할 강의를 먼저 선택하세요.");
            return;
        }
            */
    const newWeekDiv = createWeekPlanElement("", weekCount);
    weekContainer.appendChild(newWeekDiv);
    weekCount++; // 주차 번호 증가
  });
});

// 강의 이름으로 course 데이터를 찾는 함수
function findCourseByLectureName(lectureName) {
  const responseData = window.responseData; // 서버에서 받은 데이터
  const courses = responseData?.data?.course || [];

  for (const course of courses) {
    const foundStudent = course.student.find((student) => {
      const studentLectureName = `${student.studentName} (${student.studentId}) 학생의 강의`;
      return studentLectureName === lectureName;
    });

    if (foundStudent) {
      return course; // 해당 강의(course)를 반환
    }
  }
  console.error("해당 강의를 찾을 수 없습니다:", lectureName);
  return null;
}

// 주차 추가를 위한 함수
function createWeekPlanElement(content, weekNumber) {
  const newWeekDiv = document.createElement("div");
  newWeekDiv.classList.add("week-plan");
  newWeekDiv.setAttribute("data-week", `week-${weekNumber}`);

  const newLabel = document.createElement("label");
  newLabel.textContent = `${weekNumber}주차`;

  // 강의계획서 입력창을 위한 컨테이너
  const planContainer = document.createElement("div");
  planContainer.classList.add("plan-container");

  const planTitle = document.createElement("h3");
  planTitle.textContent = "강의계획서";
  planTitle.style.margin = 0;

  const newTextarea = document.createElement("textarea");
  newTextarea.setAttribute("name", `week-plan-${weekNumber}`);
  newTextarea.value = content; // 저장된 내용을 로드

  const planButtonsDiv = document.createElement("div");
  planButtonsDiv.classList.add("plan-buttons");
  planButtonsDiv.style.display = "flex";
  planButtonsDiv.style.justifyContent = "flex-end";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "저장";
  saveButton.classList.add("save-plan-btn");

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "수정";
  editButton.classList.add("edit-plan-btn");

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "삭제";
  deleteButton.classList.add("delete-plan-btn");

  // 버튼 기능 추가
  saveButton.addEventListener("click", () => {
    newTextarea.disabled = true; // 텍스트 필드 비활성화
  });

  editButton.addEventListener("click", () => {
    newTextarea.disabled = false; // 텍스트 필드 수정 가능하게
  });

  deleteButton.addEventListener("click", () => {
    weekContainer.removeChild(newWeekDiv); // 주차 삭제

    // 삭제된 주차 이후, 주차 번호를 재조정
    const allWeeks = weekContainer.querySelectorAll(".week-plan");
    allWeeks.forEach((weekDiv, index) => {
      const newWeekNumber = index + 1; // 주차 번호 재조정
      const weekLabel = weekDiv.querySelector("label");
      weekLabel.textContent = `${newWeekNumber}주차`;
      weekDiv.setAttribute("data-week", `week-${newWeekNumber}`);
    });

    // weekCount 조정 (뒤의 주차들이 삭제되었으므로)
    weekCount--;
  });

  planButtonsDiv.appendChild(saveButton);
  planButtonsDiv.appendChild(editButton);
  planButtonsDiv.appendChild(deleteButton);

  // 구성 요소를 계획 컨테이너에 추가
  planContainer.appendChild(planTitle);
  planContainer.appendChild(planButtonsDiv);
  planContainer.appendChild(newTextarea);

  // 최종적으로 weekDiv에 모든 요소 추가
  newWeekDiv.appendChild(newLabel);
  newWeekDiv.appendChild(planContainer);

  return newWeekDiv;
}

// 서버로부터 강의 목록을 불러오는 함수
async function sendRequest() {
  const response = await fetch("http://localhost:8080/teacher/course", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      //'X-XSRF-TOKEN' : csrfToken
    },
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  window.responseData = data;
  return data;
}

// 강의 목록을 HTML에 표시하는 함수
async function loadLectures() {
  const lectureList = document.querySelector(".lecture-list");
  lectureList.innerHTML = "<h2>강의 목록</h2>";
  const responseData = await sendRequest();

  if (
    responseData &&
    responseData.status === "OK" &&
    responseData.data &&
    responseData.data.course
  ) {
    const courses = responseData.data.course;

    courses.forEach((course) => {
      course.student.forEach((student) => {
        const lectureItem = document.createElement("div");
        lectureItem.classList.add("lecture-item");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("name");

        const serviceSpan = document.createElement("span");
        serviceSpan.classList.add("service-name");
        serviceSpan.textContent = course.title;

        const lectureNameSpan = document.createElement("span");
        lectureNameSpan.classList.add("lecture-name");
        lectureNameSpan.textContent = `${student.studentName} (${student.studentId}) 학생의 강의`;

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
        // 편집 버튼 클릭 이벤트 추가
        editButton.addEventListener("click", async (event) => {
          const item = event.target.closest(".lecture-item");
          const serviceName = item.querySelector(".service-name").textContent;
          const lectureName = item.querySelector(".lecture-name").textContent;
          const course = findCourseByLectureName(lectureName);
          if (!course) {
            alert("해당 강의를 찾을 수 없습니다.");
            return;
          }
          const courseId = course.courseId;

          // courseId를 받아서 강의 세부 사항을 불러옵니다
          loadLectureDetails(courseId, serviceName);
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
          const lectureTitle = `${student.studentName} 학생의 강의`;
          const params = new URLSearchParams({
            course: course.courseId,
            studentId: student.studentId,
            lectureName: lectureTitle,
          });
          window.location.href = `../course/contents.html?${params.toString()}`;
        });
      });
    });
  } else {
    alert("강의 목록을 불러오지 못했습니다.");
  }
}
// 강의 세부 사항을 불러오는 함수
function loadLectureDetails(courseId, serviceName) {
  fetch(`http://localhost:8080/teacher/course/${courseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK") {
        // 성공적으로 데이터를 받으면
        const coursePlans = data.data.coursePlanDto; // 강의계획서 목록
        displayCoursePlans(coursePlans, serviceName);
      } else {
        console.error("강의 수정 실패:", data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch 요청 중 오류 발생:", error);
    });
}

function displayCoursePlans(coursePlans, serviceName) {
  //제목 표시
  const lectureTitleInput = document.getElementById("lecture-title");
  lectureTitleInput.value = serviceName;

  const weekContainer = document.querySelector("#week-container"); // 아코디언을 추가할 컨테이너

  // 기존의 내용을 지우고 새로 추가
  weekContainer.innerHTML = "";

  if (!coursePlans || coursePlans.length === 0) {
    console.error("강의 계획서 데이터가 없습니다.");
    return;
  }
  coursePlans.forEach((plan) => {
    const weekNumber = plan.week; // 주차
    const content = plan.content; // 해당 주차의 내용

    // 새로운 주차 정보를 담을 div 생성
    const newWeekDiv = document.createElement("div");
    newWeekDiv.classList.add("week-plan");
    newWeekDiv.setAttribute("data-week", `week-${weekNumber}`);

    // 주차 레이블 생성
    const newLabel = document.createElement("label");
    newLabel.textContent = `${weekNumber}주차`;

    // 강의계획서 입력창을 위한 컨테이너 생성
    const planContainer = document.createElement("div");
    planContainer.classList.add("plan-container");

    const planTitle = document.createElement("h3");
    planTitle.textContent = "강의계획서";
    planTitle.style.margin = 0;

    const newTextarea = document.createElement("textarea");
    newTextarea.setAttribute("name", `week-plan-${weekNumber}`);
    newTextarea.value = content; // 저장된 내용 로드

    const planButtonsDiv = document.createElement("div");
    planButtonsDiv.classList.add("plan-buttons");
    planButtonsDiv.style.display = "flex";
    planButtonsDiv.style.justifyContent = "flex-end";

    // 저장, 수정, 삭제 버튼 추가
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "저장";
    saveButton.classList.add("save-plan-btn");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "수정";
    editButton.classList.add("edit-plan-btn");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "삭제";
    deleteButton.classList.add("delete-plan-btn");

    // 버튼 기능 추가
    saveButton.addEventListener("click", () => {
      newTextarea.disabled = true; // 텍스트 필드 비활성화
    });

    editButton.addEventListener("click", () => {
      newTextarea.disabled = false; // 텍스트 필드 수정 가능하게
    });

    deleteButton.addEventListener("click", () => {
      weekContainer.removeChild(newWeekDiv); // 주차 삭제

      // 삭제된 주차 이후, 주차 번호 재조정
      const allWeeks = weekContainer.querySelectorAll(".week-plan");
      allWeeks.forEach((weekDiv, index) => {
        const newWeekNumber = index + 1; // 주차 번호 재조정
        const weekLabel = weekDiv.querySelector("label");
        weekLabel.textContent = `${newWeekNumber}주차`;
        weekDiv.setAttribute("data-week", `week-${newWeekNumber}`);
      });
    });

    planButtonsDiv.appendChild(saveButton);
    planButtonsDiv.appendChild(editButton);
    planButtonsDiv.appendChild(deleteButton);

    // 구성 요소를 계획 컨테이너에 추가
    planContainer.appendChild(planTitle);
    planContainer.appendChild(planButtonsDiv);
    planContainer.appendChild(newTextarea);

    // 최종적으로 weekDiv에 모든 요소 추가
    newWeekDiv.appendChild(newLabel);
    newWeekDiv.appendChild(planContainer);

    // 아코디언 컨테이너에 새로운 주차 계획서 추가
    weekContainer.appendChild(newWeekDiv);
  });
}
