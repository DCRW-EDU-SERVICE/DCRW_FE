// loadLectures.js

// 서버로부터 강의 목록을 불러오는 함수
export async function sendRequest() {
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
    const response = await fetch('http://localhost:8080/teacher/course', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
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

// 강의 상세 정보를 로드하는 함수
export function loadLectureDetails(course) {
    const lectureTitleInput = document.getElementById('lecture-title');
    lectureTitleInput.value = course.title;

    const weekContainer = document.getElementById('week-container');
    weekContainer.innerHTML = ''; // 기존 주차 내용 제거

    course.student.forEach((student, index) => {
        const newWeekDiv = createWeekPlanElement(`Week ${index + 1}`, index + 1);
        weekContainer.appendChild(newWeekDiv);
    });

    isLectureSelected = true;
    alert("강의가 선택되었습니다.");
}

// 강의 목록을 HTML에 표시하는 함수
export async function loadLectures() {
    const lectureList = document.querySelector('.lecture-list');
    lectureList.innerHTML = '<h2>강의 목록</h2>';
    const responseData = await sendRequest();

    if (responseData && responseData.status === "OK" && responseData.data && responseData.data.course) {
        const courses = responseData.data.course;

        courses.forEach(course => {
            course.student.forEach(student => {
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
                    loadLectureDetails(course);
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
    } else {
        alert("강의 목록을 불러오지 못했습니다.");
    }
}
