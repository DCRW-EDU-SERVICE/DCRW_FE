document.addEventListener("DOMContentLoaded", function () {
    loadLectures();

    const addWeekButton = document.getElementById('add-week');
    const weekContainer = document.getElementById('week-container');
    let weekCount = 1;
    let isLectureSelected = false; // 강의가 선택되었는지 여부를 추적

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

    addWeekButton.addEventListener('click', function () {
        // 강의가 선택되지 않았을 때 경고 메시지 표시
        if (!isLectureSelected) {
            alert("수정할 강의를 먼저 선택하세요.");
            return;
        }

        const newWeekDiv = createWeekPlanElement("", weekCount);
        weekContainer.appendChild(newWeekDiv);
        weekCount++;
    });

    

    // 강의 저장 버튼 이벤트
    const saveLectureButton = document.getElementById('save-lecture');
    saveLectureButton.addEventListener('click', function () {
        const lectureTitle = document.getElementById('lecture-title').value;

        if (!lectureTitle) {
            alert("강의 제목을 입력해 주세요.");
            return;
        }

        const weekPlans = document.querySelectorAll('.week-plan textarea');
        const lectureData = {
            title: lectureTitle,
            weeks: []
        };

        weekPlans.forEach((textarea, index) => {
            lectureData.weeks.push({
                week: index + 1,
                content: textarea.value
            });
        });

        lectures[lectureTitle] = lectureData; // 메모리 내에 저장

        console.log("저장된 강의 데이터:", lectures);
        alert("강의가 저장되었습니다!");
    });

    // 수정 버튼 클릭 시 강의 제목과 주차별 강의계획서 로드
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const item = event.target.closest('.lecture-item');
            const lectureName = item.querySelector('.lecture-name').textContent;

            // lecture-title에 강의 이름 설정
            const lectureTitleInput = document.getElementById('lecture-title');
            lectureTitleInput.value = lectureName;

            // 저장된 강의 계획서 로드
            const weekPlans = lectures[lectureName]?.weeks || [];
            weekCount = 1; // 주차 카운트 초기화
            weekContainer.innerHTML = ''; // 기존 주차 내용 제거

            weekPlans.forEach(week => {
                const newWeekDiv = createWeekPlanElement(week.content, weekCount);
                weekContainer.appendChild(newWeekDiv);
                weekCount++;
            });

            // 강의가 선택되었음을 표시
            isLectureSelected = true;
            alert("강의가 선택되었습니다."); // 강의 선택 메시지 표시
        });
    });
});
// 주차 추가를 위한 함수
function createWeekPlanElement(content, weekNumber) {
    const newWeekDiv = document.createElement('div');
    newWeekDiv.classList.add('week-plan');
    newWeekDiv.setAttribute('data-week', `week-${weekNumber}`);

    const newLabel = document.createElement('label');
    newLabel.textContent = `${weekNumber}주차`;
    
    // 강의계획서 입력창을 위한 컨테이너
    const planContainer = document.createElement('div');
    planContainer.classList.add('plan-container');

    const planTitle = document.createElement('h3');
    planTitle.textContent = '강의계획서';
    planTitle.style.margin = 0;

    const newTextarea = document.createElement('textarea');
    newTextarea.setAttribute('name', `week-plan-${weekNumber}`);
    newTextarea.value = content;  // 저장된 내용을 로드

    const planButtonsDiv = document.createElement('div');
    planButtonsDiv.classList.add('plan-buttons');
    planButtonsDiv.style.display = 'flex';
    planButtonsDiv.style.justifyContent = 'flex-end';

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = '저장';
    saveButton.classList.add('save-plan-btn');

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = '수정';
    editButton.classList.add('edit-plan-btn');

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = '삭제';
    deleteButton.classList.add('delete-plan-btn');

    // 버튼 기능 추가
    saveButton.addEventListener('click', () => {
        newTextarea.disabled = true; // 텍스트 필드 비활성화
    });

    editButton.addEventListener('click', () => {
        newTextarea.disabled = false; // 텍스트 필드 수정 가능하게
    });

    deleteButton.addEventListener('click', () => {
        weekContainer.removeChild(newWeekDiv); // 주차 삭제

        // 삭제된 주차 이후, 주차 번호를 재조정
        const allWeeks = weekContainer.querySelectorAll('.week-plan');
        allWeeks.forEach((weekDiv, index) => {
            const newWeekNumber = index + 1; // 주차 번호 재조정
            const weekLabel = weekDiv.querySelector('label');
            weekLabel.textContent = `${newWeekNumber}주차`;
            weekDiv.setAttribute('data-week', `week-${newWeekNumber}`);
        });

        // weekCount 조정 (뒤의 주차들이 삭제되었으므로)
        weekCount--;
    });

    planButtonsDiv.appendChild(saveButton);
    planButtonsDiv.appendChild(editButton);
    planButtonsDiv.appendChild(deleteButton);

    // 구성 요소를 계획 컨테이너에 추가
    planContainer.appendChild(planTitle);
    planContainer.appendChild(planButtonsDiv);
    planContainer.appendChild(newTextarea);

    // 최종적으로 weekDiv에 모든 요소 추가
    newWeekDiv.appendChild(newLabel);
    newWeekDiv.appendChild(planContainer);

    return newWeekDiv;
}
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
    console.log("Response data:", data);
    return data;
  }
  
  // 강의 목록을 HTML에 표시하는 함수
  async function loadLectures() {
    const lectureList = document.querySelector('.lecture-list');
    const responseData = await sendRequest();
  
    if (responseData && responseData.status === "OK" && responseData.data && responseData.data.course) {
      const courses = responseData.data.course;
  
      courses.forEach(course => {
        const lectureItem = document.createElement('div');
        lectureItem.classList.add('lecture-item');
  
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('name');
  
        const serviceSpan = document.createElement('span');
        serviceSpan.classList.add('service-name');
        serviceSpan.textContent = `${responseData.data.teacherName}님의 강의`;
  
        const lectureNameSpan = document.createElement('span');
        lectureNameSpan.classList.add('lecture-name');
        lectureNameSpan.textContent = course.title;
  
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
        editButton.addEventListener('click', () => loadLectureDetails(course));

        // 강의 항목 클릭 이벤트 리스너 추가
        lectureItem.addEventListener('click', (event) => {
          if (event.target.classList.contains('edit-btn') || event.target.classList.contains('more-btn') || event.target.closest('.dropdown')) {
              return;
          }

          const lectureName = lectureItem.querySelector('.lecture-name').textContent;
          const serviceName = lectureItem.querySelector('.service-name').textContent;

          // contents.html로 강의 정보를 쿼리 파라미터로 전달
          const params = new URLSearchParams({
              lecture: lectureName,
              service: serviceName
          });
          window.location.href = `../course/contents.html?${params.toString()}`;
        });
      });
    } else {
      alert("강의 목록을 불러오지 못했습니다.");
    }
  }
  
  // 강의 상세 정보를 로드하는 함수 (수정 이벤트 핸들러)
  function loadLectureDetails(course) {
    const lectureTitleInput = document.getElementById('lecture-title');
    lectureTitleInput.value = course.title;
  
    const weekContainer = document.getElementById('week-container');
    weekContainer.innerHTML = ''; // 기존 주차 내용 제거
  
    course.student.forEach((student, index) => {
      const newWeekDiv = createWeekPlanElement(`Week ${index + 1} - ${student.studentName}`, index + 1);
      weekContainer.appendChild(newWeekDiv);
    });
  
    alert("강의가 선택되었습니다.");
  }
  