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

    // 주차 수와 진도율 정보 초기화 (서버에서 불러옴)
    let weekCount = 0; // 주차 수는 서버에서 받아옴
    let progressRate = 0; // 초기 진도율 0%
    let completedWeeks = 0; // 완료된 주차 수는 서버에서 받아옴

    // 진도율 업데이트 함수
    function updateProgressRate() {
        progressRate = (completedWeeks / weekCount) * 100;
        progressRateElement.textContent = `진도율 : ${progressRate.toFixed(0)}%`;
    }

    // 서버에서 주차 수 및 완료된 주차 수 불러오는 함수
    function fetchLectureData() {
        // 서버에서 강의 주차 및 진도율 데이터를 가져오기 위한 fetch 요청
        fetch(`/api/lecture-data?lecture=${lectureTitle}`)
            .then(response => response.json())
            .then(data => {
                weekCount = data.weekCount; // 서버에서 받아온 주차 수
                completedWeeks = data.completedWeeks; // 서버에서 받아온 완료된 주차 수

                // 진도율 업데이트
                updateProgressRate();

                // 주차 수만큼 아코디언 생성
                createAccordionItems();
            })
            .catch(error => {
                console.error('Error fetching lecture data:', error);
                progressRateElement.textContent = '강의 데이터를 불러올 수 없습니다.';
            });
    }

    // 주차 수에 따라 아코디언 동적 생성
    function createAccordionItems() {
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

            // 파일 형식에 따른 뷰어 생성 로직 (예: 서버에서 파일 정보를 받아옴)
            const fileType = 'video/mp4'; // 예시로 파일 유형 설정, 실제로는 서버에서 가져옴
            const fileName = `lecture${i}`; // 주차별 파일 이름 예시

            if (fileType.includes('video')) {
                const video = document.createElement('video');
                video.setAttribute('controls', true);
                video.innerHTML = `
                    <source src="${fileName}.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                `;
                contentDiv.appendChild(video);
            } else if (fileType.includes('pdf')) {
                const pdfViewer = document.createElement('object');
                pdfViewer.setAttribute('data', `${fileName}.pdf`);
                pdfViewer.setAttribute('width', '90%');
                pdfViewer.setAttribute('height', '300px');
                pdfViewer.setAttribute('type', 'application/pdf');
                contentDiv.appendChild(pdfViewer);
            } else if (fileType.includes('image')) {
                const img = document.createElement('img');
                img.setAttribute('src', `${fileName}.jpg`);
                img.setAttribute('alt', 'Lecture Image');
                img.setAttribute('width', '90%');
                contentDiv.appendChild(img);
            } else {
                const downloadLink = document.createElement('a');
                downloadLink.setAttribute('href', `${fileName}`);
                downloadLink.setAttribute('download', `${fileName}`);
                downloadLink.textContent = 'Download Content';
                contentDiv.appendChild(downloadLink);
            }

            // "강의 완료" 버튼 생성
            const finishButton = document.createElement('button');
            finishButton.classList.add('finish-btn');
            finishButton.textContent = '강의 완료';

            let isCompleted = false;
            finishButton.addEventListener('click', function () {
                if (!isCompleted) {
                    completedWeeks++;
                    updateProgressRate();
                    alert(`${i}주차 강의가 완료되었습니다!`);
                    isCompleted = true;
                    finishButton.disabled = true;
                } else {
                    alert(`${i}주차 강의는 이미 완료되었습니다.`);
                }
            });

            contentDiv.appendChild(finishButton);
            bodyDiv.appendChild(contentDiv);
            accordionItem.appendChild(headerButton);
            accordionItem.appendChild(bodyDiv);
            accordionContainer.appendChild(accordionItem);

            // 아코디언 클릭 이벤트
            headerButton.addEventListener('click', function () {
                const expanded = headerButton.getAttribute('aria-expanded') === 'true';
                headerButton.setAttribute('aria-expanded', !expanded);
                bodyDiv.classList.toggle('show');
                bodyDiv.style.display = expanded ? 'none' : 'block';
            });
        }
    }

    // 페이지 로드 시 강의 데이터 불러오기
    fetchLectureData();
    
    // '일지출력' 버튼 클릭 시 현재 진도율을 alert로 표시
    document.getElementById('daily-report').addEventListener('click', function () {
        const progressRate = document.getElementById('progress-rate').innerText;
        alert(`현재 ${progressRate}`);
    });
});

function click_role_menu() {
    var li = document.getElementsByClassName("active")[0];
    var ul = document.getElementsByClassName("sub-menu")[0];
    console.log(li, ul);
    console.log(getComputedStyle(ul).visibility);
    if (getComputedStyle(ul).visibility == "hidden") {
        ul.style.visibility = "visible";
        li.style.cssText = "font-weight: bolder;";
    } else {
        ul.style.visibility = "hidden";
        li.style.cssText = "font-weight: normal;";
    }
}
