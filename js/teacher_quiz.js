const quizData = {
    question: "한글을 만든 사람은 누구인가요?",
    options: ["①세종대왕", "②이순신", "③김유신", "④신사임당"],
    answer: "세종대왕"
};
document.addEventListener("DOMContentLoaded", function() {
    const quizQuestionInput = document.querySelector(".quiz-question");
    const quizOptionsInputs = document.querySelectorAll(".quiz-opt input[type='text']");
    const quizAnswerInput = document.querySelector(".quiz-answer");

    const quizContentsSection = document.querySelector(".quiz-contents");
    const quizResultsSection = document.querySelector(".quiz-results");
    const createButton = document.querySelector(".create-btn");
    const recreateButton = document.querySelector(".recreate-btn");

    // 페이지 로드 시 quiz-results 섹션 숨기기
    quizResultsSection.classList.add("hidden");

    // '퀴즈 생성' 버튼 클릭 시 다음 섹션으로 넘어가기 (+항목 선택 및 입력 필드 확인)
    createButton.addEventListener("click", function() {
        // 전체선택 체크박스를 제외한 개별 체크박스 중 하나라도 선택되어 있는지 확인
        const isAnyChecked = Array.from(rowCheckboxes).some(checkbox => checkbox.checked);
        // 'create' div 안의 학습 목적 input 필드 값 확인
        const createInput = document.querySelector(".create input[type='text']");
        const isInputFilled = createInput.value.trim() !== "";

        if (!isAnyChecked) {
            alert("퀴즈 생성에 활용할 자료를 선택해주세요"); // 항목이 선택되지 않았으면 알림창 표시
        } else if (!isInputFilled) {
            alert("학습 목적을 입력해주세요"); // 입력 필드가 비어 있으면 알림창 표시
        } else {
            quizContentsSection.classList.add("hidden");   // quiz-contents 숨기기
            quizResultsSection.classList.remove("hidden"); // quiz-results 표시
        }
    });

    // '다시 선택' 버튼 클릭 시 이전 섹션으로 돌아가기
    recreateButton.addEventListener("click", function() {
        quizContentsSection.classList.remove("hidden");  // quiz-contents 표시
        quizResultsSection.classList.add("hidden");      // quiz-results 숨기기
    });

    // 전체 선택 체크박스 기능
    const selectAllCheckbox = document.querySelector("thead input[type='checkbox']");
    const rowCheckboxes = document.querySelectorAll("tbody input[type='checkbox']");

    selectAllCheckbox.addEventListener("change", function() {
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });


    // quizData를 HTML 요소에 삽입
    if (quizQuestionInput) {
        quizQuestionInput.value = "Q. "+quizData.question;  // 질문 텍스트 입력
    }

    quizData.options.forEach((option, index) => {
        if (quizOptionsInputs[index]) {
            quizOptionsInputs[index].value = option;  // 각 옵션 텍스트 입력
        }
    });

    if (quizAnswerInput) {
        quizAnswerInput.value = "A. " + quizData.answer;  // 정답 텍스트 입력
    }

    //더 창의적인 퀴즈 - 예 버튼 기능

    //더 창의적인 퀴즈 - 아니오 버튼 기능
});