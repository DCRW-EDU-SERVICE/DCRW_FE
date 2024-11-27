document.addEventListener("DOMContentLoaded", function () {
  const quizContentsSection = document.querySelector(".quiz-contents");
  const quizResultsSection = document.querySelector(".quiz-results");
  const createButton = document.querySelector(".create-btn");
  const tableBody = document.querySelector(".con-table tbody");
  const quizListContainer = document.querySelector(".quiz-list");
  const btnContainer = document.querySelector(".btn-container"); // 기존 HTML에 정의된 .btn-container

  // 페이지 로드 시 quiz-results 섹션 숨기기
  quizResultsSection.classList.add("hidden");

  // PDF 파일 목록 가져오기
  async function fetchPdfContents() {
    try {
      const response = await fetch(
        "http://localhost:8080/teacher/course/contents/list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("PDF 목록을 불러오는 데 실패했습니다.");
      }

      const result = await response.json();

      if (result && result.data) {
        populateTable(result.data);
      } else {
        alert("불러올 데이터가 없습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("PDF 목록을 불러오는 중 오류가 발생했습니다.");
    }
  }

  // 테이블에 데이터 삽입
  function populateTable(data) {
    tableBody.innerHTML = ""; // 기존 내용을 초기화

    data.forEach((course) => {
      const { courseName, contentList } = course;

      contentList.forEach((content) => {
        const { contentId, week, fileName } = content;

        const row = document.createElement("tr");
        row.innerHTML = `
                    <td><input type="checkbox" value="${contentId}" id="file-${contentId}"></td>
                    <td class="lectureName">${courseName}</td>
                    <td class="week">${week}</td>
                    <td class="fileName">${fileName}</td>
                `;
        tableBody.appendChild(row);
      });
    });
  }
  // 퀴즈 결과 섹션에 데이터 표시
  function displayQuizResults(data) {
    quizListContainer.innerHTML = ""; // 기존 결과 초기화

    data.quizList.forEach((quiz, index) => {
      const quizDiv = document.createElement("div");
      quizDiv.classList.add("one-quiz-div");

      quizDiv.innerHTML = `
                <div class="qna-div">
                    <input type="text" class="quiz-question" value="Q. ${quiz.question}">
                    <div class="quiz-opt">
                        <input type="text" value="① ${quiz.option1}">
                        <input type="text" value="② ${quiz.option2}">
                        <input type="text" value="③ ${quiz.option3}">
                        <input type="text" value="④ ${quiz.option4}">
                    </div>
                    <input type="text" class="quiz-answer" value="A. ${quiz.answer}">
                </div>
                <div class="check-div">
                    <input type="checkbox" id="check-${index}" class="quiz-select">
                    <label for="check-${index}"></label>
                </div>
            `;

      quizListContainer.appendChild(quizDiv);
    });

    // '저장' 버튼 클릭 이벤트 핸들러 추가
    const saveButton = btnContainer.querySelector(".save-btn");
    saveButton.addEventListener("click", async function () {
      const selectedQuizzes = quizListContainer.querySelectorAll(
        ".quiz-select:checked"
      );
      if (selectedQuizzes.length === 0) {
        alert("저장할 퀴즈를 선택하세요.");
        return;
      }
      // 강의 및 콘텐츠 정보 가져오기
      const selectedCheckbox = tableBody.querySelector(
        "input[type='checkbox']:checked"
      );
      if (!selectedCheckbox) {
        alert("저장할 콘텐츠를 선택하세요.");
        return;
      }

      const row = selectedCheckbox.closest("tr");
      const courseName = row.querySelector(".lectureName").textContent.trim();
      const week = row.querySelector(".week").textContent.trim();
      const fileName = row.querySelector(".fileName").textContent.trim();
      const contentId = selectedCheckbox.value;

      const quizzesToSave = Array.from(selectedQuizzes).map((checkbox) => {
        const quizDiv = checkbox.closest(".one-quiz-div");
        const question = quizDiv.querySelector(".quiz-question").value.trim();
        const options = Array.from(
          quizDiv.querySelectorAll(".quiz-opt input")
        ).map((input) => input.value.trim());
        const answer = quizDiv.querySelector(".quiz-answer").value.trim();

        return {
          id: null,
          question,
          option1: options[0],
          option2: options[1],
          option3: options[2],
          option4: options[3],
          answer,
        };
      });
      const requestData = {
        courseId: 1, // 하드코딩된 강의 ID, 필요 시 수정해야 함
        courseName,
        contentId: parseInt(contentId, 10), // 콘텐츠 ID
        contentName: fileName,
        week: parseInt(week, 10), // 주차 정보
        quizList: quizzesToSave,
      };
      try {
        const response = await fetch(
          "http://localhost:8080/teacher/quiz/generate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("퀴즈를 저장하는 데 실패했습니다.");
        }

        const result = await response.json();
        alert(result.message || "퀴즈가 성공적으로 저장되었습니다!");
      } catch (error) {
        console.error(error);
        alert("퀴즈 저장 중 오류가 발생했습니다.");
      }
    });

    // '다시 선택' 버튼 클릭 이벤트 핸들러 추가
    const recreateButton = btnContainer.querySelector(".recreate-btn");
    recreateButton.addEventListener("click", function () {
      quizContentsSection.classList.remove("hidden"); // quiz-contents 표시
      quizResultsSection.classList.add("hidden"); // quiz-results 숨기기
    });
  }

  // '퀴즈 생성' 버튼 클릭 시 다음 섹션으로 넘어가는 이벤트
  createButton.addEventListener("click", async function () {
    const selectedCheckbox = tableBody.querySelector(
      "input[type='checkbox']:checked"
    );
    const createInput = document.querySelector(".create input[type='text']");
    const isInputFilled = createInput.value.trim() !== "";

    if (!selectedCheckbox) {
      alert("퀴즈 생성에 활용할 자료를 선택해주세요");
      return;
    }

    if (!isInputFilled) {
      alert("학습 목적을 입력해주세요");
      return;
    }

    const contentId = selectedCheckbox.value;
    const subject = createInput.value;
    const count = 10;

    // 로딩 화면 표시
    showLoading();

    try {
      const response = await fetch(
        `http://localhost:8080/teacher/quiz/generate?content=${contentId}&subject=${encodeURIComponent(
          subject
        )}&count=${count}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("퀴즈를 생성하는 데 실패했습니다.");
      }

      const result = await response.json();

      if (result && result.data) {
        quizContentsSection.classList.add("hidden");
        quizResultsSection.classList.remove("hidden");
        displayQuizResults(result.data);
      } else {
        alert("퀴즈 데이터를 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("퀴즈 생성 중 오류가 발생했습니다.");
    } finally {
      // 로딩 화면 숨기기
      hideLoading();
    }
  });

  // 전체 선택 체크박스 기능
  const selectAllCheckbox = document.querySelector(
    "thead input[type='checkbox']"
  );
  selectAllCheckbox.addEventListener("change", function () {
    const rowCheckboxes = tableBody.querySelectorAll("input[type='checkbox']");
    rowCheckboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });

  // 초기 PDF 파일 목록 로드
  fetchPdfContents();

  //더 창의적인 퀴즈 - 예 버튼 기능

  //더 창의적인 퀴즈 - 아니오 버튼 기능
});
// 로딩 화면 표시 함수
function showLoading() {
  const loadingSpinner = document.querySelector(".loading-spinner");
  loadingSpinner.classList.remove("hidden");
}

// 로딩 화면 숨기기 함수
function hideLoading() {
  const loadingSpinner = document.querySelector(".loading-spinner");
  loadingSpinner.classList.add("hidden");
}
