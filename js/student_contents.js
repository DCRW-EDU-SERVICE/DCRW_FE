document.addEventListener('DOMContentLoaded', function () {
    const accordionContainer = document.getElementById('accordion-container');
    const lectureTitleElement = document.getElementById('lecture-title');
    const progressRateElement = document.getElementById('progress-rate');
    // 강의 ID와 콘텐츠를 가져오는 함수
    async function fetchCourseAndContents() {
        try {
            // 강의 정보 요청
            const courseResponse = await fetch('http://localhost:8080/teacher/course', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if (!courseResponse.ok) {
                throw new Error(`서버 오류: ${courseResponse.statusText}`);
            }
            const courseResult = await courseResponse.json();

            if (courseResult.status !== 'OK') {
                throw new Error(courseResult.message || '강의 정보를 불러오는 중 오류 발생');
            }

            const courseData = courseResult.data.course;
            if (!courseData || courseData.length === 0) {
                throw new Error('강의 데이터가 없습니다.');
            }

            const course = courseData[0]; // 학생의 단일 강의를 가정
            const courseId = course.courseId;
            lectureTitleElement.textContent = course.title;
            
            // 강의 콘텐츠 요청
            await fetchContents(courseId);
        } catch (error) {
            console.error('강의 데이터를 불러오는 중 오류:', error);
            lectureTitleElement.textContent = '강의 데이터를 불러올 수 없습니다.';
            progressRateElement.textContent = '';
            accordionContainer.innerHTML = '<p>강의 콘텐츠를 불러올 수 없습니다.</p>';
        }
    }

    // 강의 콘텐츠 데이터를 가져오는 함수
    async function fetchContents(courseId) {
        try {
            const response = await fetch(`http://localhost:8080/teacher/course/1/contents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`서버 오류: ${response.statusText}`);
            }
            const result = await response.json();

            if (result.status !== 'OK') {
                throw new Error(result.message || '데이터를 불러오는 중 오류 발생');
            }

            const { progressRate, contentList } = result.data;
            renderContents(progressRate, contentList);
        } catch (error) {
            console.error('강의 콘텐츠를 불러오는 중 오류:', error);
            progressRateElement.textContent = '진도율 정보를 불러올 수 없습니다.';
        }
    }

    // 콘텐츠 렌더링 함수
    function renderContents(progressRate, contentList) {
        // 기존 콘텐츠 초기화
        accordionContainer.innerHTML = '';

        // 진도율 업데이트
        progressRateElement.textContent = `진도율 : ${progressRate.toFixed(0)}%`;

        // 콘텐츠 목록 동적 생성
        contentList.forEach(content => {
            const { week, filePath, fileType } = content;

            const accordionItem = document.createElement('div');
            accordionItem.classList.add('accordion-item');

            const headerButton = document.createElement('button');
            headerButton.classList.add('accordion-header');
            headerButton.setAttribute('aria-expanded', 'false');
            headerButton.textContent = `${week}주차`;

            const bodyDiv = document.createElement('div');
            bodyDiv.classList.add('accordion-body');

            // 강의 콘텐츠 뷰어 생성
            const contentDiv = createViewer(fileType, filePath);
            bodyDiv.appendChild(contentDiv);

            // 퀴즈 버튼 추가
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('btn-container');

            const quizButton = document.createElement('button');
            quizButton.classList.add('quiz-button');
            quizButton.textContent = '퀴즈 풀기';
            quizButton.addEventListener('click', function () {
                alert(`${week}주차 퀴즈로 이동합니다!`);
                window.location.href = `../student/quiz.html?week=${week}`;
            });
            buttonContainer.appendChild(quizButton);
            bodyDiv.appendChild(buttonContainer);

            // 아코디언 아이템 구성
            accordionItem.appendChild(headerButton);
            accordionItem.appendChild(bodyDiv);
            accordionContainer.appendChild(accordionItem);

            // 아코디언 클릭 이벤트
            headerButton.addEventListener('click', function () {
                const expanded = headerButton.getAttribute('aria-expanded') === 'true';
                headerButton.setAttribute('aria-expanded', !expanded);
                bodyDiv.classList.toggle('show');

                if (!expanded) {
                    bodyDiv.style.display = 'block';
                } else {
                    bodyDiv.style.display = 'none';
                }
            });
        });
    }

    // 파일 형식에 맞는 뷰어를 동적으로 생성하는 함수
    function createViewer(fileType, filePath) {
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('lecture-content');

        if (fileType === 'video/mp4') {
            // 비디오 요소 생성
            const video = document.createElement('video');
            video.setAttribute('controls', true);
            video.innerHTML = `<source src="${filePath}" type="video/mp4">Your browser does not support the video tag.`;
            contentDiv.appendChild(video);
        } else if (fileType === 'application/pdf') {
            // PDF 뷰어 생성
            const pdfViewer = document.createElement('object');
            pdfViewer.setAttribute('data', filePath);
            pdfViewer.setAttribute('width', '90%');
            pdfViewer.setAttribute('height', '300px');
            pdfViewer.setAttribute('type', 'application/pdf');
            contentDiv.appendChild(pdfViewer);
        } else {
            // 기타 파일 형식에 대한 다운로드 링크
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', filePath);
            downloadLink.textContent = `Download ${filePath}`;
            contentDiv.appendChild(downloadLink);
        }

        return contentDiv;
    }

    // 페이지 로드 시 강의 콘텐츠 데이터 불러오기
    fetchCourseAndContents();
});