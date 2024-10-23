document.addEventListener('DOMContentLoaded', function () {
    const accordionContainer = document.getElementById('accordion-container');
    const lectureTitleElement = document.getElementById('lecture-title');
    const progressRateElement = document.getElementById('progress-rate');

    // URL 파라미터에서 강의 제목과 서비스 이름을 가져옵니다.
    // 현재 teacher_contents.js와 같은 내용입니다. 강의 제목을 어떤 방법으로 가져와야 할지...
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
    // 학생화면에서도 진도율 표시할지? (화면 설계에는 없었음)
    function updateProgressRate() {
        // 완료된 주차 수에 따라 진도율 계산 (예: 총 10%씩 상승)
        progressRate = (completedWeeks / weekCount) * 100;
        progressRateElement.textContent = `진도율 : ${progressRate.toFixed(0)}%`;
    }

    // 페이지 로드 시 초기 진도율 설정
    updateProgressRate();

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

    // 파일 형식에 맞는 뷰어를 동적으로 생성하는 함수
    function createViewer(fileExtension, fileName) {
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('lecture-content');
        
        if (fileExtension === 'mp4') {
            // 비디오 요소 생성
            const video = document.createElement('video');
            video.setAttribute('controls', true);
            video.innerHTML = `<source src="${fileName}" type="video/mp4">Your browser does not support the video tag.`;
            contentDiv.appendChild(video);
        } else if (fileExtension === 'pdf') {
            // PDF 뷰어 (object를 사용한 방식)
            const pdfViewer = document.createElement('object');
            pdfViewer.setAttribute('data', fileName);
            pdfViewer.setAttribute('width', '90%');
            pdfViewer.setAttribute('height', '300px');
            pdfViewer.setAttribute('type', 'application/pdf');
            contentDiv.appendChild(pdfViewer);
        } else {
            // 기타 파일 형식에 대한 다운로드 링크
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', fileName);
            downloadLink.textContent = `Download ${fileName}`;
            contentDiv.appendChild(downloadLink);
        }

        return contentDiv;
    }

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

        // 파일 이름 및 확장자
        const fileName = `lecture${i}`; // 예시: lecture1.mp4, lecture1.pdf, etc.
        const fileExtension = 'mp4'; // 파일 확장자를 실제로 가져오거나 지정 (예시: mp4, pdf)

        // 강의 콘텐츠 div 생성 및 파일 뷰어 추가
        const contentDiv = createViewer(fileExtension, `${fileName}.${fileExtension}`);
        bodyDiv.appendChild(contentDiv);

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

function click_role_menu() {
    var li = document.getElementsByClassName("active")[0];
    var ul = document.getElementsByClassName("sub-menu")[0];
    if (getComputedStyle(ul).visibility == "hidden") {
        ul.style.visibility = "visible";
        li.style.cssText = "font-weight: bolder;";
    } else {
        ul.style.visibility = "hidden";
        li.style.cssText = "font-weight: normal;";
    }
}
