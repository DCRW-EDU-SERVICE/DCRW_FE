document.addEventListener("DOMContentLoaded", () => {
  const usernameElement = document.querySelector(".username");
  if (usernameElement) {
    const username = localStorage.getItem("username");
    if (username) {
      usernameElement.textContent = `${username} 선생님`;
    }
  }

  // 세션 유효성 검사 함수
  function checkSession() {
    return localStorage.getItem("isLoggedIn") === "true";
  }

  // 페이지 로드 시 세션 유효성 확인
  if (!checkSession()) {
    alert("로그인이 필요합니다.");
    window.location.href = "../account/login.html";
    return;
  }

  /*
    // CSRF 토큰 추출: 메타 태그에서 추출하고 없을 시 localStorage에서 가져오기
    let csrfToken = document.querySelector('meta[name="csrf-token"]');
    csrfToken = csrfToken ? csrfToken.getAttribute("content") : localStorage.getItem("csrfToken");

    console.log("CSRF Token:", csrfToken);  // 디버깅용

    if (!csrfToken) {
        alert("CSRF 토큰이 누락되었습니다. 다시 로그인해주세요.");
        window.location.href = "../account/login.html";
        return;
    }else {
        localStorage.setItem("csrfToken", csrfToken); // 추출된 토큰 저장
    }
        */
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const maxStudents = 5;
  let selectedStudentDiv = null;
  let selectedStudent = null;

  // 학생 검색
  document
    .getElementById("search-student")
    .addEventListener("click", function () {
      const studentId = document.getElementById("student-id").value;
      const selectedCourse = document.getElementById("course").value;
      const courseId = getCourseId(selectedCourse);

      fetch("http://localhost:8080/teacher/student-management", {
        method: "POST",
        credentials: "include", // 로그인된 세션 정보를 포함
        headers: {
          "Content-Type": "application/json",
          //'X-CSRF-Token': csrfToken // CSRF 토큰 포함
        },
        body: JSON.stringify({ studentId, courseId }),
      })
        .then((response) => {
          if (response.status === 403) {
            throw new Error("접근이 거부되었습니다. (403)");
          }
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("API 응답 데이터:", data); // 응답 데이터 구조 확인
          if (data.status === "OK" && data.data) {
            // 배열 형태로 전달
            const students = [
              {
                id: data.data.studentId,
                name: data.data.studentName,
              },
            ];
            displaySearchResults(students);
          } else {
            displaySearchResults([]); // 빈 배열을 전달하여 "검색 결과가 없습니다" 메시지 표시
          }
        })
        .catch((error) => {
          console.error("학생 검색 오류:", error);
          alert(`오류 발생: ${error.message}`);
        });
    });

  // 검색 결과를 화면에 표시
  function displaySearchResults(students) {
    console.log("Displaying search results:", students); // 디버깅용
    const searchResultDiv = document.getElementById("search-result");
    searchResultDiv.innerHTML = "";

    if (students.length === 0) {
      searchResultDiv.textContent = "검색 결과가 없습니다.";
      return;
    }

    students.forEach((student) => {
      const studentDiv = document.createElement("div");
      studentDiv.classList.add("search-item");
      studentDiv.innerHTML = `<span>${student.name} (${student.id})</span>
                <button type="button" class="select-btn" data-id="${student.id}">선택</button>`;

      studentDiv
        .querySelector(".select-btn")
        .addEventListener("click", function () {
          selectStudent(student, studentDiv);
        });

      searchResultDiv.appendChild(studentDiv);
    });
  }

  // 학생 선택 함수 - 선택된 학생과 UI 상태를 업데이트
  function selectStudent(student, studentDiv) {
    if (selectedStudentDiv) {
      selectedStudentDiv.style.border = "none";
    }

    // 선택된 학생 정보 저장
    selectedStudent = student;
    selectedStudentDiv = studentDiv;

    // 선택된 학생 표시
    studentDiv.style.border = "2px solid #327cd3";
    studentDiv.style.borderRadius = "5px";

    document.getElementById("student-id").value = student.id;
    console.log("선택된 학생 ID:", student.id);
  }

  document
    .getElementById("student-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      if (!selectedStudent) {
        alert("학생을 선택해주세요.");
        return;
      }

      const selectedCourse = document.getElementById("course").value;
      const courseId = getCourseId(selectedCourse);

      if (!courseId) {
        alert("올바른 강의를 선택해주세요.");
        return;
      }

      if (students.length >= maxStudents) {
        alert("최대 5명의 학생만 등록할 수 있습니다.");
        return;
      }

      if (isDuplicateStudent(selectedStudent.id)) {
        alert("이 학생 정보는 이미 등록되어 있습니다.");
        return;
      }

      // 현재 날짜를 "YYYY-MM-DD" 형식으로 설정하여 completionDate로 사용
      const completionDate = new Date().toISOString().split("T")[0];
      // 로그로 날짜 값 확인
      console.log("Generated completionDate:", completionDate); // 여기서 completionDate 확인

      console.log("Sending data:", {
        studentId: selectedStudent.id,
        courseId,
        completionDate,
        progressRate: 0,
      });

      fetch("http://localhost:8080/teacher/student-management/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          courseId,
          completionDate, // 완료 날짜 필드 추가
          progressRate: 0, // 초기 진행률 설정
        }),
      })
        .then((response) => {
          if (response.status === 403) {
            throw new Error("접근이 거부되었습니다. (403)");
          }
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then((data) => {
          if (data.status === "OK") {
            const studentToAdd = {
              id: selectedStudent.id,
              name: selectedStudent.name,
              course: selectedCourse,
            };

            students.push(studentToAdd);
            localStorage.setItem("students", JSON.stringify(students));
            updateStudentList();

            selectedStudent = null;
            selectedStudentDiv = null;

            document.getElementById("student-id").value = "";
            document.getElementById("course").value = "";
            const searchResultDiv = document.getElementById("search-result");
            searchResultDiv.innerHTML = "";

            alert("학생이 성공적으로 등록되었습니다.");
          } else {
            alert("학생 등록 실패: " + data.message);
          }
        })
        .catch((error) => {
          console.error("학생 등록 오류:", error.message);
          alert(`오류 발생: ${error.message}`);
        });
    });

  // 저장된 학생 목록 업데이트
  function updateStudentList() {
    const studentListDiv = document.getElementById("student-list");
    studentListDiv.innerHTML = "";

    students.forEach((student, index) => {
      const studentDiv = document.createElement("div");
      studentDiv.classList.add("student-item");
      studentDiv.innerHTML = `<span>${student.name} (${student.id}) - ${student.course}</span>
                <button type="button" class="delete-btn" data-index="${index}">Ⅹ</button>`;

      studentDiv
        .querySelector(".delete-btn")
        .addEventListener("click", function () {
          deleteStudent(index);
        });

      studentListDiv.appendChild(studentDiv);
    });
  }

  // 학생 삭제 처리
  function deleteStudent(index) {
    const studentToDelete = students[index];
    const studentId = studentToDelete.id;

    const requestData = {
      message: "학생 강의 삭제",
      studentId: studentId,
    };

    fetch("http://localhost:8080/teacher/student-management", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (response.status === 204) {
          students.splice(index, 1);
          localStorage.setItem("students", JSON.stringify(students));
          updateStudentList();
          alert("학생이 성공적으로 삭제되었습니다.");
        } else {
          return response.text().then((text) => {
            throw new Error(text || "학생 삭제 오류");
          });
        }
      })
      .catch((error) => {
        alert(`오류 발생: ${error.message}`);
      });
  }

  // 중복 학생 검사 함수
  function isDuplicateStudent(studentId) {
    return students.some((student) => student.id === studentId);
  }

  // 강좌 이름에 해당하는 강좌 ID 반환 함수
  function getCourseId(courseName) {
    const courses = {
      "한국어 교육 서비스": 1,
      "자녀생활 서비스": 2,
      "부모교육 서비스": 3,
    };
    return courses[courseName] || 0;
  }

  updateStudentList();
});
