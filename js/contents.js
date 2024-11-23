document.addEventListener('DOMContentLoaded', async function () {
    loadLectures(); // 강의 목록 불러오기
    const accordionContainer = document.getElementById('accordion-container');
    const lectureTitleElement = document.getElementById('lecture-title');
    
    const addWeekButton = document.getElementById('add-week');
    const weekContainer = document.getElementById('week-container');
    let weekCount = 1;  // 기본 주차 번호
    let isLectureSelected = false; // 강의가 선택되었는지 여부를 추적
    let cachedCourseData = null;

    // 강의 목록 항목 클릭 이벤트
    const lectureItems = document.querySelectorAll('.lecture-item');
    lectureItems.forEach(item => {
        item.addEventListener('click', (event) => {
            if (event.target.classList.contains('edit-btn') || event.target.classList.contains('more-btn') || event.target.closest('.dropdown')) {
                return;
            }

            const lectureName = item.querySelector('.lecture-name').textContent;
            const serviceName = item.querySelector('.service-name').textContent;

            // contents.html로 강의 정보를 쿼리 파라미터로 전달
            const params = new URLSearchParams({
                lecture: lectureName,
                service: serviceName
            });
            window.location.href = `../course/contents.html?${params.toString()}`;
        });
    });
    // 수정 버튼 클릭 시 강의 제목과 주차별 강의계획서 로드
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const item = event.target.closest('.lecture-item');
            const lectureName = item.querySelector('.lecture-name').textContent;

            // courseId 가져오기 (responseData에서 필요한 데이터를 찾음)
            const course = findCourseByLectureName(lectureName);
            if (!course) {
                alert("해당 강의를 찾을 수 없습니다.");
                return;
            }

            const courseId = course.courseId;

            // lecture-title에 강의 이름 설정
            const lectureTitleInput = document.getElementById('lecture-title');
            lectureTitleInput.value = lectureName;

            // 서버에서 강의 데이터를 가져오기
            const courseData = await fetchContentsData(courseId);

            if (courseData) {
                const weekContainer = document.getElementById('week-container');
                weekContainer.innerHTML = ''; // 기존 주차 내용 제거

                // 서버에서 가져온 강의 계획 데이터를 기반으로 아코디언 생성
                //courseData.coursePlanList.forEach(plan => {
                //});
            }
            // 강의가 선택되었음을 표시
            isLectureSelected = true;
            alert("강의가 선택되었습니다."); // 강의 선택 메시지 표시
        });
    });
    // 강의 이름으로 course 데이터를 찾는 함수
    function findCourseByLectureName(lectureName) {
        const responseData = window.responseData; // 서버에서 받은 데이터
        const courses = responseData?.data?.course || [];

        for (const course of courses) {
            const foundStudent = course.student.find(student => {
                const studentLectureName = `${student.studentName} (${student.studentId}) 학생의 강의`;
                return studentLectureName === lectureName;
            });

            if (foundStudent) {
                return course; // 해당 강의(course)를 반환
            }
        }
        console.error("해당 강의를 찾을 수 없습니다:", lectureName);
        return null;
    }
    // 서버로부터 강의 목록을 불러오는 함수
    async function sendRequest() {
        const response = await fetch('http://localhost:8080/teacher/course', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'X-XSRF-TOKEN' : csrfToken
        },
        credentials: 'include'
        });
    
        if (!response.ok) {
        return null;
        }
    
        const data = await response.json();
        window.responseData = data;
        return data;
    }
    // 강의 목록을 HTML에 표시하는 함수
    async function loadLectures() {
        const lectureList = document.querySelector('.lecture-list');
        lectureList.innerHTML = '<h2>강의 목록</h2>';
        const responseData = await sendRequest();
    
        if (responseData && responseData.status === "OK" && responseData.data && responseData.data.course) {
        const courses = responseData.data.course;
    
        courses.forEach(course => {
            course.student.forEach(student =>{
                const lectureItem = document.createElement('div');
                lectureItem.classList.add('lecture-item');
        
                const nameDiv = document.createElement('div');
                nameDiv.classList.add('name');
        
                const serviceSpan = document.createElement('span');
                serviceSpan.classList.add('service-name');
                serviceSpan.textContent = course.title;

                const lectureNameSpan = document.createElement('span');
                lectureNameSpan.classList.add('lecture-name');
                lectureNameSpan.textContent = `${student.studentName} (${student.studentId}) 학생의 강의`;

                nameDiv.appendChild(serviceSpan);
                nameDiv.appendChild(lectureNameSpan);

                const dropdownDiv = document.createElement('div');
                dropdownDiv.classList.add('more-dropdown');
        
                const moreButton = document.createElement('button');
                moreButton.classList.add('more-btn');
                moreButton.textContent = '⋮';
        
                const dropdownMenu = document.createElement('div');
                dropdownMenu.classList.add('dropdown', 'hidden');
        
                const editButton = document.createElement('button');
                editButton.classList.add('edit-btn');
                editButton.textContent = '수정';
        
                dropdownMenu.appendChild(editButton);
                dropdownDiv.appendChild(moreButton);
                dropdownDiv.appendChild(dropdownMenu);
                lectureItem.appendChild(nameDiv);
                lectureItem.appendChild(dropdownDiv);
                lectureList.appendChild(lectureItem);
                // 편집 버튼 클릭 이벤트 추가
                editButton.addEventListener('click', async (event) => {
                    const item = event.target.closest('.lecture-item');
                    const serviceName = item.querySelector('.service-name').textContent;
                    const lectureName = item.querySelector('.lecture-name').textContent;
                    const course = findCourseByLectureName(lectureName);
                    if (!course) {
                        alert("해당 강의를 찾을 수 없습니다.");
                        return;
                    }
                    const courseId = course.courseId;
                    const studentId = student.studentId;
                    console.log("수정 버튼 클릭: courseId:", courseId, "studentId:", studentId);
        
                    // courseId를 받아서 강의 세부 사항을 불러옵니다
                    loadLectureDetails(courseId, studentId, serviceName);
                });
                // 강의 항목 클릭 이벤트 리스너 추가
                lectureItem.addEventListener('click', (event) => {
                    if (event.target.classList.contains('edit-btn') || event.target.classList.contains('more-btn') || event.target.closest('.dropdown')) {
                        return;
                    }
                    const lectureTitle = `${student.studentName} 학생의 강의`;
                    const params = new URLSearchParams({
                        course: course.courseId,
                        studentId: student.studentId,
                        lectureName: lectureTitle
                    });
                    window.location.href = `../course/contents.html?${params.toString()}`;
                });
            });
        });
        } else {
            alert("강의 목록을 불러오지 못했습니다.");
        }
    }
    // 기존 강의컨텐츠를 불러오는 함수
    function loadLectureDetails(courseId, studentId, serviceName) {
        fetch(`http://localhost:8080/teacher/course/contents`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                courseId: courseId,     // 필요 시 courseId 값 설정
                studentId: studentId, // 필요 시 사용, 현재 null로 설정
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('서버 응답 데이터:', data);
            if (data.status === "OK") {
                // 성공적으로 데이터를 받으면
                const { contentList } = data.data; // 서버 데이터 구조에 맞게 변수 추출
                globalContentList = contentList; // 전역 변수에 강의 콘텐츠 저장
                displayContents(contentList, serviceName); // 콘텐츠 표시
            } else {
                console.error('강의컨텐츠 로드 실패:', data.message);
                alert("강의 데이터를 불러오는 데 실패했습니다.");
            }
        })
        .catch(error => {
            console.error('Fetch 요청 중 오류 발생:', error);
        });
    }
    // 콘텐츠 업로드
    function uploadContent(courseId, week, file) {
        const formData = new FormData();
        formData.append('content', JSON.stringify({ courseId: courseId, contentWeek: week }));
        formData.append('file', file);

        fetch('http://localhost:8080/teacher/contents', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                alert('강의 콘텐츠 추가 성공');
                loadLectureDetails(courseId); // 강의 세부 내용을 다시 불러와서 갱신
            } else {
                alert('강의 콘텐츠 추가 실패');
            }
        })
        .catch(error => {
            console.error('강의 콘텐츠 추가 중 오류 발생:', error);
            alert('강의 콘텐츠 추가 중 문제가 발생했습니다.');
        });
    }

    // 콘텐츠 삭제
    function deleteContent(contentId) {
        fetch(`http://localhost:8080/teacher/contents/${contentId}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                alert('강의 콘텐츠 삭제 성공');
                loadLectureDetails(courseData.courseId); // 강의 세부 내용을 다시 불러와서 갱신
            } else {
                alert('강의 콘텐츠 삭제 실패');
            }
        })
        .catch(error => {
            console.error('강의 콘텐츠 삭제 중 오류 발생:', error);
            alert('강의 콘텐츠 삭제 중 문제가 발생했습니다.');
        });
    }

    // 아코디언 동적 생성
    function displayContents(contentList, serviceName) {
        const lectureTitleInput = document.getElementById('lecture-title');
        lectureTitleInput.value = serviceName;
        
        accordionContainer.innerHTML = '';
        contentList.forEach((plan, i) => {
            const week = plan.week;
            const accordionItem = document.createElement('div');
            accordionItem.classList.add('accordion-item');
    
            const headerButton = document.createElement('button');
            headerButton.classList.add('accordion-header');
            headerButton.setAttribute('aria-expanded', i === 0 ? 'true' : 'false'); // 첫 번째 항목만 열린 상태
            headerButton.textContent = `${week}주차`;  // 주차 제목
    
            const bodyDiv = document.createElement('div');
            bodyDiv.classList.add('accordion-body');
    
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
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '삭제';
    
            saveBtn.classList.add('save-btn');
            deleteBtn.classList.add('delete-btn');
    
            const viewer = displayViewer(plan.fileType,plan.fileUrl);
    
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
                    updateViewer(files[0], viewer);
                }
            });
    
            dropArea.addEventListener('click', () => {
                fileInput.click();
            });
    
            fileInput.addEventListener('change', () => {
                const uploadedFile = fileInput.files[0];
                if (uploadedFile) {
                    updateViewer(uploadedFile, viewer);
                }
            });
    
            // 저장 버튼 클릭 이벤트
            saveBtn.addEventListener('click', () => {
                const uploadedFile = fileInput.files[0];
                if (uploadedFile) {
                    uploadContent(courseData.courseId, i + 1, uploadedFile);  // week은 1부터 시작하므로 i+1
                } else {
                    alert('파일을 업로드해주세요.');
                }
            });
    
            // 삭제 버튼 클릭 이벤트
            deleteBtn.addEventListener('click', () => {
                const contentId = plan.contentId; // 서버에서 받은 콘텐츠 ID 사용
                deleteContent(contentId);
                fileInput.value = '';
                viewer.innerHTML = '';
            });
    
            buttonContainer.appendChild(saveBtn);
            buttonContainer.appendChild(deleteBtn);
    
            contentDiv.appendChild(buttonContainer);
            contentDiv.appendChild(dropArea);
            contentDiv.appendChild(fileInput);
            //contentDiv.appendChild(viewer);
    
            bodyDiv.appendChild(contentDiv);
            bodyDiv.appendChild(viewer); 
            accordionItem.appendChild(headerButton);
            accordionItem.appendChild(bodyDiv);

            // 컨테이너에 추가
            accordionContainer.appendChild(accordionItem);
    
            // 주차에 저장된 강의 콘텐츠가 있는 경우 뷰어로 표시
            if (plan.filePath) {
                displayViewer(plan.fileType,plan.fileUrl);
            }
    
            // 아코디언 클릭 이벤트
            headerButton.addEventListener('click', () => {
                const expanded = headerButton.getAttribute('aria-expanded') === 'true';
                headerButton.setAttribute('aria-expanded', !expanded);
                bodyDiv.classList.toggle('show');
            });
        });
    }
    // 파일 선택 시 뷰어 업데이트
    function updateViewer(file, viewerElement) {
        const fileType = file.type || file.name.split('.').pop(); // 파일 타입 추출
        const fileUrl = URL.createObjectURL(file); // 선택한 파일에 대한 URL 생성

        // 뷰어 업데이트
        viewerElement.innerHTML = ''; // 기존 뷰어 내용 제거
        const newViewer = displayViewer(fileType, fileUrl); // 새 파일에 대한 뷰어 생성
        viewerElement.appendChild(newViewer); // 뷰어 추가
    }
    // 파일 뷰어 생성
    function displayViewer(fileType, fileUrl) {
        let viewerElement = '';
        if (fileType.includes('pdf')) {
            // PDF 파일 뷰어
            viewerElement = document.createElement('embed');
            viewerElement.src = fileUrl;
            viewerElement.type = 'application/pdf';
            viewerElement.width = '100%';
            viewerElement.height = '500px';
        } else if (fileType.includes('image')) {
            // 이미지 파일 뷰어
            viewerElement = document.createElement('img');
            viewerElement.src = fileUrl;
            viewerElement.alt = '강의 이미지';
            viewerElement.style.width = '100%';
        } else if (fileType.includes('video')) {
            // 비디오 파일 뷰어
            viewerElement = document.createElement('video');
            viewerElement.src = fileUrl;
            viewerElement.controls = true;
            viewerElement.style.width = '100%';
        } else {
            // 기타 파일의 경우 다운로드 링크 제공
            viewerElement = document.createElement('a');
            viewerElement.href = fileUrl;
            viewerElement.textContent = '강의 파일 다운로드';
            viewerElement.target = '_blank';
        }
        return viewerElement;
    }
});