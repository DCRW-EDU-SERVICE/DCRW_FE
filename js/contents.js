document.addEventListener('DOMContentLoaded', function () {
    const accordionContainer = document.getElementById('accordion-container');
    const lectureItems = document.querySelectorAll('.lecture-item'); // 모든 강의 항목 선택
    let selectedLecture = ''; // 선택된 강의명 저장 변수
    let activeLectureItem = null; // 현재 수정 중인 강의 항목

    // 수정 버튼 클릭 시 배경색 변경 및 강의 제목 설정
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            clearLectureHighlights(); // 기존 하이라이트 제거

            const lectureItem = event.target.closest('.lecture-item');
            lectureItem.style.backgroundColor = '#ffeb3b'; // 배경색을 노란색으로 변경
            activeLectureItem = lectureItem; // 현재 수정 중인 항목 저장

            const lectureName = lectureItem.querySelector('.lecture-name').textContent;
            const lectureTitleInput = document.getElementById('lecture-title');
            lectureTitleInput.value = lectureName;

            selectedLecture = lectureName;
            isLectureSelected = true;
            clearAllWeekData(); // 모든 주차의 파일 입력 필드 및 뷰어 초기화
        });
    });

    // 주차 수 (예시: 3주차 강의)
    const weekCount = 3;

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

        // 파일 업로드 폼 생성
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('lecture-content');

        const dropArea = document.createElement('div');
        dropArea.classList.add('drop-area');
        dropArea.textContent = '클릭하거나 드래그하여 파일을 업로드할 수 있습니다.';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*,application/pdf,image/*,.ppt,.pptx';
        fileInput.classList.add('file-upload');
        fileInput.style.display = 'block';

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '저장';
        const editBtn = document.createElement('button');
        editBtn.textContent = '수정';
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '삭제';

        saveBtn.classList.add('save-btn');
        editBtn.classList.add('edit-btn');
        deleteBtn.classList.add('delete-btn');

        const viewerDiv = document.createElement('div');
        viewerDiv.classList.add('file-viewer');

        // 드래그 앤 드롭, 파일 선택 이벤트 처리
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('dragging');
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragging');
        });

        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragging');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                displayViewer(files[0], viewerDiv);
            }
        });

        dropArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            const uploadedFile = fileInput.files[0];
            if (uploadedFile) {
                displayViewer(uploadedFile, viewerDiv);
            }
        });

        // 저장 버튼 클릭 이벤트
        saveBtn.addEventListener('click', () => {
            const uploadedFile = fileInput.files[0];
            if (uploadedFile && selectedLecture) {
                const storageKey = `${selectedLecture}-week${i}-file`;
                localStorage.setItem(storageKey, uploadedFile.name);
                alert(`'${selectedLecture}'의 ${i}주차 파일이 저장되었습니다.`);
                clearLectureHighlights(); // 저장 후 모든 배경색 초기화
            } else if (!selectedLecture) {
                alert('강의를 먼저 선택해주세요.');
            } else {
                alert('파일을 업로드해주세요.');
            }
        });

        // 기타 버튼 이벤트 처리
        editBtn.addEventListener('click', () => {
            const storageKey = `${selectedLecture}-week${i}-file`;
            const savedFile = localStorage.getItem(storageKey);
            if (savedFile) {
                dropArea.textContent = '여기에 새로운 파일을 끌어오세요 또는 클릭하여 파일 선택';
                displayViewer(new File([savedFile], savedFile), viewerDiv);
            } else {
                alert('저장된 파일이 없습니다.');
            }
        });

        deleteBtn.addEventListener('click', () => {
            const storageKey = `${selectedLecture}-week${i}-file`;
            localStorage.removeItem(storageKey);
            fileInput.value = '';
            viewerDiv.innerHTML = '';
            alert('파일이 삭제되었습니다.');
        });

        // 아코디언 항목에 구성 요소 추가
        buttonContainer.appendChild(saveBtn);
        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);

        contentDiv.appendChild(buttonContainer);
        contentDiv.appendChild(dropArea);
        contentDiv.appendChild(fileInput);
        contentDiv.appendChild(viewerDiv);

        bodyDiv.appendChild(contentDiv);
        accordionItem.appendChild(headerButton);
        accordionItem.appendChild(bodyDiv);
        accordionContainer.appendChild(accordionItem);

        // 아코디언 클릭 이벤트
        headerButton.addEventListener('click', () => {
            const expanded = headerButton.getAttribute('aria-expanded') === 'true';
            headerButton.setAttribute('aria-expanded', !expanded);
            bodyDiv.classList.toggle('show');
        });
    }

    // 모든 강의 항목의 배경색을 초기화하는 함수
    function clearLectureHighlights() {
        lectureItems.forEach(item => {
            item.style.backgroundColor = ''; // 배경색 초기화
        });
    }

    // 모든 주차의 파일 입력 필드와 뷰어를 초기화하는 함수
    function clearAllWeekData() {
        const fileInputs = document.querySelectorAll('.file-upload');
        const viewerDivs = document.querySelectorAll('.file-viewer');
        fileInputs.forEach(input => {
            input.value = '';
        });
        viewerDivs.forEach(viewer => {
            viewer.innerHTML = '';
        });
    }

    // 파일에 맞는 뷰어를 생성하는 함수
    function displayViewer(file, container) {
        container.innerHTML = '';
        const fileURL = URL.createObjectURL(file);

        if (file.type.includes('video')) {
            const videoViewer = document.createElement('video');
            videoViewer.src = fileURL;
            videoViewer.controls = true;
            videoViewer.width = 320;
            container.appendChild(videoViewer);
        } else if (file.type.includes('pdf')) {
            const pdfViewer = document.createElement('iframe');
            pdfViewer.src = fileURL;
            pdfViewer.width = '100%';
            pdfViewer.height = '300px';
            container.appendChild(pdfViewer);
        } else if (file.type.includes('image')) {
            const imgViewer = document.createElement('img');
            imgViewer.src = fileURL;
            imgViewer.width = 320;
            container.appendChild(imgViewer);
        } else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
            const downloadLink = document.createElement('a');
            downloadLink.href = fileURL;
            downloadLink.textContent = '다운로드하여 PPT 파일을 확인하세요';
            downloadLink.download = file.name;
            container.appendChild(downloadLink);
        }
    }
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