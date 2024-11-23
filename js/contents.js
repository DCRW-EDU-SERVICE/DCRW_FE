document.addEventListener('DOMContentLoaded', async function () {
    loadLectures(); // 강의 목록 불러오기
    const accordionContainer = document.getElementById('accordion-container');
    let courseId = null; // 선택한 강의의 courseId 저장
    //let teacherId = null;
    //const weekCount = 3; // 주차 수 (예시: 3주차 강의)

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
    /*
    let courseDataCache = null;
    // 강의 목록 클릭 이벤트 처리
    document.querySelector('.lecture-list').addEventListener('click', async function (event) {
        if (event.target && event.target.matches('.edit-btn')) {
            const item = event.target.closest('.lecture-item');
            const lectureName = item.querySelector('.lecture-name').textContent;
            courseId = item.getAttribute('data-course-id'); // courseId 가져오기
            
            courseDataCache = await loadCourseData();

            // courseId로 teacherId 찾기
            //const course = courseDataCache.find(course => course.courseId === parseInt(courseId));
            //teacherId = course ? course.teacherId : null;

            if (!teacherId) {
                alert('교사 정보를 가져올 수 없습니다.');
                return;
            }
            // 강의 제목 설정
            const lectureTitleInput = document.getElementById('lecture-title');
            lectureTitleInput.value = lectureName;
            console.log(`선택된 courseId: ${courseId}, teacherId: ${teacherId}`);

            // 기존 콘텐츠 불러오기
            //loadExistingContent(courseId, teacherId);
        }
    });
    */

    // 강의 데이터 불러오기 함수
    async function loadCourseData() {
        try {
            const response = await fetch(`http://localhost:8080/teacher/course`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'OK' && data.data) {
                console.log('강의 데이터를 성공적으로 로드했습니다.');
                return data.data; // [{ courseId, teacherId }, ...]
            } else {
                throw new Error('강의 데이터를 가져오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('강의 데이터 로드 중 오류 발생:', error.message);
            return [];
        }
    }
    async function fetchCourseDetails(courseId) {
        const course = responseData.data.course;
        try {
            const response = await fetch(`http://localhost:8080/teacher/course/contents`, { //{courseId}
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    studentId:course.studentId,
                    courseId:course.courseId,
                    week:null
                },
                credentials: 'include',
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            if (data.status === 'OK' && data.data) {
                return data.data.teacherId;  // 강의 정보에서 teacherId를 추출
            } else {
                throw new Error('teacherId를 가져오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('teacherId를 가져오는 중 오류 발생:', error.message);
            return null;
        }
    }
    
    // 학생 목록 불러오기 함수
    async function loadLectures() {
        const lectureList = document.querySelector('.lecture-list');
        lectureList.innerHTML = '<h2>강의 목록</h2>'; // 기존 목록 초기화
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
                      const lectureName = item.querySelector('.lecture-name').textContent;
                      const course = findCourseByLectureName(lectureName);
                      if (!course) {
                          alert("해당 강의를 찾을 수 없습니다.");
                          return;
                      }
                      const courseId = course.courseId;
          
                      // courseId를 받아서 강의 세부 사항을 불러옵니다
                      fetchCourseDetails(courseId);
                      isLectureSelected = true;
                  });
                  // 강의 항목 클릭 이벤트 리스너 추가
                  lectureItem.addEventListener('click', (event) => {
                      if (event.target.classList.contains('edit-btn') || event.target.classList.contains('more-btn') || event.target.closest('.dropdown')) {
                          return;
                      }
                      const lectureTitle = `${student.studentName} 학생의 강의`;
                      const params = new URLSearchParams({
                          lecture: lectureTitle,
                          studentId: student.studentId
                      });
                      window.location.href = `../course/contents.html?${params.toString()}`;
                  });
              });
          });
        }
    }
    // 서버로부터 강의 목록을 불러오는 함수
    async function sendRequest() {
        const csrfToken = document.cookie.split('; ').find(row=>row.startsWith('XSRF-TOKEN='))?.split('=')[1];
        const response = await fetch('http://localhost:8080/teacher/course', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'X-XSRF-TOKEN' : csrfToken
        },
        credentials: 'include'
        });
    
        if (!response.ok) {
        alert("서버에서 강의 목록을 불러오지 못했습니다. 다시 시도해주세요.");
        return null;
        }
    
        const data = await response.json();
        window.responseData = data;
        console.log("Response data:", data);
        return data;
    }
    // 강의 이름으로 course 데이터를 찾는 함수
    function findCourseByLectureName(lectureName) {
        const responseData = window.responseData; // 서버에서 받은 데이터
        const courses = responseData?.data?.course || [];
        console.log("전체 강의 목록:", courses);

        for (const course of courses) {
            const foundStudent = course.student.find(student => {
                const studentLectureName = `${student.studentName} (${student.studentId}) 학생의 강의`;
                return studentLectureName === lectureName;
            });

            if (foundStudent) {
                console.log("찾은 강의 데이터:", course);
                return course; // 해당 강의(course)를 반환
            }
        }
        console.error("해당 강의를 찾을 수 없습니다:", lectureName);
        return null;
    }
    /*
    // 기존 강의 콘텐츠 불러오기
    function loadExistingContent(courseId, teacherId) {
        if (!courseId || !teacherId) {
            alert('강의 또는 교사 정보를 확인할 수 없습니다.');
            return;
        }
        fetch(`http://localhost:8080/teacher/course/contents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                courseId: courseId,
                teacherId: teacherId,
            }),
        })
        .then(async response => {
            if (!response.ok) {
                const errorDetails = await response.text();
                console.error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'OK' && data.data) {
                data.data.contentList.forEach(content => {
                    const week = content.week; // 주차 정보 가져오기
                    const viewerDiv = document.querySelector(`#week${week} .file-viewer`);
                    displayViewer({
                        name: content.file_name,
                        type: content.file_type,
                        url: content.file_url,
                    }, viewerDiv);
                });
            } else {
                alert('강의 콘텐츠가 없습니다.');
            }
        })
        .catch(error => {
            console.error('콘텐츠 로드 중 오류 발생:', error.message);
            alert(`콘텐츠 로드 중 문제가 발생했습니다: ${error.message}`);
        });
    }
        */
    // 콘텐츠 업로드
    function uploadContent(courseId, week, file) {
        const formData = new FormData();
        formData.append('content.courseId', courseId);
        formData.append('content.contentWeek', week);
        formData.append('file', file);

        fetch('http://localhost:8080/teacher/contents', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                alert('파일 업로드 성공');
                //loadExistingContent(courseId);
            } else {
                alert('파일 업로드 실패');
            }
        })
        .catch(error => {
            console.error('파일 업로드 중 오류 발생:', error);
            alert('파일 업로드 중 문제가 발생했습니다.');
        });
    }

    // 콘텐츠 삭제
    function deleteContent(courseId, week) {
        fetch(`http://localhost:8080/teacher/contents/${courseId}-${week}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                alert('콘텐츠 삭제 성공');
                //loadExistingContent(courseId);
            } else {
                alert('콘텐츠 삭제 실패');
            }
        })
        .catch(error => {
            console.error('콘텐츠 삭제 중 오류 발생:', error);
            alert('콘텐츠 삭제 중 문제가 발생했습니다.');
        });
    }

    // 아코디언 동적 생성
    for (let i = 1; i <= weekCount; i++) {
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');
        accordionItem.setAttribute('id', `week${i}`); // 주차별 ID 설정

        const headerButton = document.createElement('button');
        headerButton.classList.add('accordion-header');
        headerButton.setAttribute('aria-expanded', 'false');
        headerButton.textContent = `${i}주차`;

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
            if (uploadedFile && courseId) {
                uploadContent(courseId, i, uploadedFile);
            } else if (!courseId) {
                alert('강의를 먼저 선택해주세요.');
            } else {
                alert('파일을 업로드해주세요.');
            }
        });

        // 삭제 버튼 클릭 이벤트
        deleteBtn.addEventListener('click', () => {
            if (courseId) {
                deleteContent(courseId, i);
                fileInput.value = '';
                viewerDiv.innerHTML = '';
            } else {
                alert('강의를 먼저 선택해주세요.');
            }
        });

        buttonContainer.appendChild(saveBtn);
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
    // 파일 뷰어 생성
    function displayViewer(file, container) {
        container.innerHTML = '';
        const fileURL = file.url;

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
        } else {
            const unsupportedMessage = document.createElement('p');
            unsupportedMessage.textContent = '지원되지 않는 파일 형식입니다.';
            container.appendChild(unsupportedMessage);
        }
    }
    // 강좌 이름에 해당하는 강좌 ID 반환 함수
    function getCourseId(courseName) {
        const courses = {
            '한국어 교육 서비스': 1,
            '자녀생활 서비스': 2,
            '부모교육 서비스': 3
        };
        return courses[courseName] || 0;
    }
});