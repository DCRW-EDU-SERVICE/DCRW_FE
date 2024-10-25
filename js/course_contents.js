document.addEventListener('DOMContentLoaded', function () {
    const accordionContainer = document.getElementById('accordion-container');
    const lectureTitleElement = document.getElementById('lecture-title');
    const progressRateElement = document.getElementById('progress-rate');

    // URL 파라미터에서 강의 제목과 서비스 이름을 가져옵니다.
    const params = new URLSearchParams(window.location.search);
    const lectureTitle = params.get('lecture'); // 강의 제목
    const serviceName = params.get('service'); // 서비스 이름

    // 강의 제목 설정
    lectureTitleElement.textContent = `${lectureTitle}`;

    // 주차 수는 강의계획서 등록에 따라 -> 컨텐츠 업로드에 따라 DB에서 불러오기(?)
    const weekCount = 3; // 주차 수 예시 (예: 3주차 강의)
    let progressRate = 0; // 초기 진도율 0%
    let completedWeeks = 0; // 완료된 주차 수

    // 진도율 업데이트 함수
    function updateProgressRate() {
        // 완료된 주차 수에 따라 진도율 계산 (예: 총 10%씩 상승)
        progressRate = (completedWeeks / weekCount) * 100;
        progressRateElement.textContent = `진도율 : ${progressRate.toFixed(0)}%`;
    }

    // 페이지 로드 시 초기 진도율 설정
    updateProgressRate();

    // '일지출력' 버튼 클릭 시 현재 진도율을 alert로 표시
    document.getElementById('daily-report').addEventListener('click', function () {
        // 진도율 값을 progress-rate 요소에서 가져옴
        const progressRate = document.getElementById('progress-rate').innerText;
        
        // alert로 진도율 표시 -> 추후 학습일지 출력 기능으로 재구현 필요
        alert(`현재 ${progressRate}`);
    });


    /*
    // DB에서 진도율 데이터를 가져오는 함수
    function fetchProgressRate() {
        // 진도율을 서버에서 가져오기 위한 fetch 요청 (실제 API URL과 경로로 대체)
        fetch(`/api/progress-rate?lecture=${lectureTitle}`)
            .then(response => response.json())
            .then(data => {
                // JSON 형식으로 받은 데이터에서 진도율 추출
                const progressRate = data.progressRate; // 예: 40%라는 값이 반환된다고 가정
                progressRateElement.textContent = `진도율 : ${progressRate}%`;
            })
            .catch(error => {
                console.error('Error fetching progress rate:', error);
                progressRateElement.textContent = '진도율 정보를 불러올 수 없습니다.';
            });
    }

    // 페이지 로드 시 진도율 불러오기
    fetchProgressRate();
    */

    // 아코디언 동적 생성
    for (let i = 1; i <= weekCount; i++) {
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');

        const headerButton = document.createElement('button');
        headerButton.classList.add('accordion-header');
        headerButton.setAttribute('aria-expanded', 'false');
        headerButton.textContent = `${i}주차`;

        const bodyDiv = document.createElement('div');
        bodyDiv.classList.add('accordion-body');

        // 강의 콘텐츠 div 생성
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('lecture-content');

        // 파일 형식에 따른 뷰어 생성 로직 추가
        // 예시: DB에서 파일 정보를 가져와 파일 형식에 맞게 처리
        const fileType = 'video/mp4'; // 예시로 파일 유형 설정, 실제로는 DB에서 가져옴
        const fileName = `lecture${i}`; // 주차별 파일 이름 예시

        if (fileType.includes('video')) {
            // 비디오 요소 생성
            const video = document.createElement('video');
            video.setAttribute('controls', true);
            video.innerHTML = `
                <source src="${fileName}.mp4" type="video/mp4">
                Your browser does not support the video tag.
            `;
            contentDiv.appendChild(video); // 강의 콘텐츠 div에 비디오 추가
        } else if (fileType.includes('pdf')) {
            // PDF 뷰어 (object를 사용한 방식)
            const pdfViewer = document.createElement('object');
            pdfViewer.setAttribute('data', `${fileName}.pdf`);
            pdfViewer.setAttribute('width', '90%');
            pdfViewer.setAttribute('height', '300px');
            pdfViewer.setAttribute('type', 'application/pdf');
            contentDiv.appendChild(pdfViewer); // 강의 콘텐츠 div에 PDF 뷰어 추가
        } else if (fileType.includes('image')) {
            // 이미지 뷰어
            const img = document.createElement('img');
            img.setAttribute('src', `${fileName}.jpg`);
            img.setAttribute('alt', 'Lecture Image');
            img.setAttribute('width', '90%');
            contentDiv.appendChild(img); // 강의 콘텐츠 div에 이미지 추가
        } else {
            // 기타 파일 다운로드 링크
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', `${fileName}`);
            downloadLink.setAttribute('download', `${fileName}`);
            downloadLink.textContent = 'Download Content';
            contentDiv.appendChild(downloadLink); // 강의 콘텐츠 div에 다운로드 링크 추가
        }

        /*
        //같은 폴더에 주차별 파일(lecture1.pdf, ...)이 존재하면 나타나도록 구현함
        // PDF 뷰어 (object를 사용한 방식)
        const pdfViewer = document.createElement('object');
        pdfViewer.setAttribute('data', `lecture${i}.pdf`);
        pdfViewer.setAttribute('width', '90%');
        pdfViewer.setAttribute('height', '300px');
        pdfViewer.setAttribute('type', 'application/pdf');
        
        contentDiv.appendChild(pdfViewer); // 강의 콘텐츠 div에 PDF 뷰어 추가
        */

        // "강의 완료" 버튼을 감쌀 div 생성
        //const buttonContainer = document.createElement('div');
        //buttonContainer.classList.add('button-container'); // 필요한 스타일을 적용하기 위해 클래스 추가

        // "강의 완료" 버튼 생성
        const finishButton = document.createElement('button');
        finishButton.classList.add('finish-btn');
        finishButton.textContent = '강의 완료';

        // 강의 완료 버튼 클릭 이벤트
        let isCompleted = false; // 주차별 강의 완료 여부를 저장
        finishButton.addEventListener('click', function () {
            if (!isCompleted) { // 이미 완료된 강의는 중복 카운트하지 않음
                completedWeeks++; // 완료된 주차 수 1 증가
                updateProgressRate(); // 진도율 업데이트
                alert(`${i}주차 강의가 완료되었습니다!`);
                isCompleted = true; // 완료 상태로 변경
                finishButton.disabled = true; // 버튼 비활성화 (중복 클릭 방지)
            } else {
                alert(`${i}주차 강의는 이미 완료되었습니다.`);
            }
        });

        // 버튼을 강의 콘텐츠 div에 추가
        contentDiv.appendChild(finishButton);

        // 콘텐츠 div를 아코디언 body에 추가
        bodyDiv.appendChild(contentDiv);

        // 아코디언 아이템을 부모에 추가
        accordionItem.appendChild(headerButton);
        accordionItem.appendChild(bodyDiv);
        accordionContainer.appendChild(accordionItem);

        // 아코디언 클릭 이벤트
        headerButton.addEventListener('click', function () {
            const expanded = headerButton.getAttribute('aria-expanded') === 'true';
            headerButton.setAttribute('aria-expanded', !expanded);
            bodyDiv.classList.toggle('show');

            // 아코디언이 열리면 콘텐츠가 표시됩니다.
            if (!expanded) {
                bodyDiv.style.display = 'block';
            } else {
                bodyDiv.style.display = 'none';
            }
        });
    }
});
