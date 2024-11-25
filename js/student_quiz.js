const quizData = {
    한글: [
        {
            question: "한글을 만든 사람은 누구인가요?",
            options: ["세종대왕", "이순신", "김유신", "신사임당"],
            answer: "세종대왕"
        },{
            question: "'ㄱ'은 어떻게 읽나요?",
            options: ["기윽", "기역", "기억", "기옥"],
            answer: "기역"
        },
    ],
};

let currentTopic = "한글";
let currentQuestionIndex = 0;
let score = 0;
const totalQuestions = 10; // 총 문제 수

document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelector('.tab-link.current').classList.remove('current');
        tab.classList.add('current');

        currentTopic = e.target.innerText;
        currentQuestionIndex = 0;
        score = 0;
        loadQuestion();
    });
});

function loadQuestion() {
    const questionBox = document.querySelector('.question-box');
    const answerBox = document.querySelector('.answer-box');
    const nextBtn = document.querySelector('.next-btn');

    if (currentQuestionIndex >= quizData[currentTopic].length) {
        questionBox.innerHTML = `<h3>퀴즈가 완료되었습니다!</h3><div class="btn-container"><button class="restart-btn" onclick="restartQuiz()">다시 풀기</button></div>`;
        answerBox.innerHTML = '';
        nextBtn.style.display = 'none';
        return;
    }

    const currentQuestion = quizData[currentTopic][currentQuestionIndex];
    questionBox.innerHTML = `<h3>${currentQuestion.question}</h3>`;
    answerBox.innerHTML = currentQuestion.options.map((option) => `
        <button class="answer-btn" data-answer="${option}">${option}</button>
    `).join('');

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
    loadQuestion();
}

document.querySelector('.next-btn').addEventListener('click', () => {
    const resultPopup = document.getElementById('result-popup');
    resultPopup.style.display = 'none';
    currentQuestionIndex++; // 다음 문제로 이동
    loadQuestion(); // 다음 문제 로드
});

loadQuestion();