let quizData = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;
async function fetchQuizData(n) {
    try {
        const response = await fetch(`http://localhost:8080/quiz/word/${n}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
        const result = await response.json();

        if (result.status === "OK") {
            quizData = result.data.map(item => ({
                question: item.question,
                options: [item.option1, item.option2, item.option3, item.option4],
                answer: item.answer,
            }));
            totalQuestions = quizData.length;
            loadQuestion(); // 첫 번째 퀴즈 로드
        } else {
            console.error("퀴즈 데이터를 가져오는데 실패했습니다:", result.message);
        }
    } catch (error) {
        console.error("서버 요청 중 에러 발생:", error);
    }
}
function loadQuestion() {
    const questionBox = document.querySelector('.question-box');
    const answerBox = document.querySelector('.answer-box');
    const nextBtn = document.querySelector('.next-btn');
    const progressText = document.getElementById('progress-text'); // 진행 상황 요소

    if (currentQuestionIndex >= quizData.length) {
        questionBox.innerHTML = `<h3>퀴즈가 완료되었습니다!</h3><div class="btn-container"><button class="restart-btn" onclick="restartQuiz()">다시 풀기</button></div>`;
        answerBox.innerHTML = '';
        nextBtn.style.display = 'none';
        progressText.textContent = `${totalQuestions} / ${totalQuestions}`; // 진행 상황 업데이트
        return;
    }

    // 현재 퀴즈 데이터
    const currentQuestion = quizData[currentQuestionIndex];

    // 문제와 선택지를 화면에 표시
    questionBox.innerHTML = `<h3>${currentQuestion.question}</h3>`;
    answerBox.innerHTML = currentQuestion.options.map(option => `
        <button class="answer-btn" data-answer="${option}">${option}</button>
    `).join('');

    // 진행 상황 업데이트
    progressText.textContent = `${currentQuestionIndex + 1} / ${totalQuestions}`;

    document.querySelectorAll('.answer-btn').forEach(button => {
        button.addEventListener('click', () => {
            const isCorrect = button.getAttribute('data-answer') === currentQuestion.answer;
            showResultPopup(isCorrect, currentQuestion.answer);
        });
    });
    nextBtn.style.display = 'block'; // 다음 버튼 보이기
}

function showResultPopup(isCorrect, correctAnswer) {
    const resultPopup = document.getElementById('result-popup');
    const resultMessage = document.getElementById('result-message');

    resultMessage.textContent = isCorrect ? '정답입니다!' : `오답입니다! 정답은 "${correctAnswer}"입니다.`;
    
    resultPopup.style.display = 'block'; // 팝업 표시
}

function rateQuiz(rating) {
    const likeButton = document.querySelector('.like-btn');

    if (rating === 'like') {
        likeButton.classList.add('like-animation');
        setTimeout(() => {
            likeButton.classList.remove('like-animation');
        }, 500);
    }

    const resultPopup = document.getElementById('result-popup');
    resultPopup.style.display = 'none'; // 팝업 닫기
    currentQuestionIndex++; // 다음 문제로 이동
    loadQuestion(); // 다음 문제 로드
}

document.querySelector('.close-btn').addEventListener('click', () => {
    const resultPopup = document.getElementById('result-popup');
    resultPopup.style.display = 'none';
});

document.getElementById('reanswer-btn').addEventListener('click', () => {
    const resultPopup = document.getElementById('result-popup');
    resultPopup.style.display = 'none';
    loadQuestion();
});

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.querySelector('.next-btn').style.display = 'block'; // 버튼 다시 보이기
    document.getElementById('progress-text').textContent = `0 / ${totalQuestions}`; // 진행 상황 초기화
    loadQuestion();
}

document.querySelector('.next-btn').addEventListener('click', () => {
    const resultPopup = document.getElementById('result-popup');
    resultPopup.style.display = 'none';
    currentQuestionIndex++; // 다음 문제로 이동
    loadQuestion(); // 다음 문제 로드
});

fetchQuizData(5);