document.addEventListener('DOMContentLoaded', () => {
    const students = JSON.parse(localStorage.getItem('students')) || []; // 로컬 스토리지에서 학생 목록 불러오기
    const maxStudents = 5;
    let selectedStudentDiv = null; // 선택된 학생 div 저장

    // 고정된 학생 목록 (DB 대신 프론트엔드에서 사용)
    const studentDatabase = [
        { id: 'rlakfrl0520', name: '김민기', course: '한국어 교육 서비스' },
        { id: 'aaa123', name: '이재훈', course: '수학 교육 서비스' },
        { id: 'aaa456', name: '박지수', course: '과학 교육 서비스' },
        { id: 'aab789', name: '최지우', course: '영어 교육 서비스' },
        { id: 'aac001', name: '정세린', course: '과학 교육 서비스' }
    ];

    let selectedStudent = null; // 현재 선택된 학생 객체 저장

    // 학생 검색
    document.getElementById('search-student').addEventListener('click', function () {
        const studentId = document.getElementById('student-id').value;

        // 고정된 학생 목록에서 검색
        const searchResults = searchStudentsFromDatabase(studentId);

        // 검색 결과를 표시
        displaySearchResults(searchResults);
    });

    // 고정된 데이터에서 학생 검색 함수 (아이디에 입력된 문자열이 포함된 학생 검색)
    function searchStudentsFromDatabase(studentId) {
        return studentDatabase.filter(student => student.id.includes(studentId));
    }

    // 검색 결과를 화면에 표시
    function displaySearchResults(students) {
        const searchResultDiv = document.getElementById('search-result');
        searchResultDiv.innerHTML = ''; // 이전 결과 초기화

        if (students.length === 0) {
            searchResultDiv.textContent = '검색 결과가 없습니다.';
            return;
        }

        students.forEach(student => {
            const studentDiv = document.createElement('div');
            studentDiv.classList.add('search-item');
            studentDiv.innerHTML = `
                <span>${student.name} (${student.id})</span>
                <button type="button" class="select-btn" data-id="${student.id}">선택</button>
            `;

            // "선택" 버튼 클릭 시 처리
            studentDiv.querySelector('.select-btn').addEventListener('click', function () {
                selectStudent(student, studentDiv);
            });

            searchResultDiv.appendChild(studentDiv);
        });
    }

    // 학생 선택 시 처리 (선택된 학생의 div 강조 및 input 필드에 아이디 표시)
    function selectStudent(student, studentDiv) {
        // 이전에 선택된 학생의 테두리 제거
        if (selectedStudentDiv) {
            selectedStudentDiv.style.border = 'none';
        }

        selectedStudent = student; // 선택한 학생 객체 저장
        selectedStudentDiv = studentDiv; // 선택된 div 저장
        studentDiv.style.border = '2px solid #327cd3'; // 선택된 학생 div 테두리 강조
        studentDiv.style.borderRadius = '5px';

        // 선택된 학생의 아이디를 input 필드에 표시
        document.getElementById('student-id').value = student.id;
    }

    // 중복 체크 함수
    function isDuplicateStudent(studentId) {
        return students.some(existingStudent => existingStudent.id === studentId);
    }

    // 학생 저장 버튼 클릭 시 처리
    document.getElementById('student-form').addEventListener('submit', function (e) {
        e.preventDefault(); // 폼 제출 방지 (리로드 방지)

        // 학생을 선택하지 않았을 때 경고
        if (!selectedStudent) {
            alert('학생을 선택해주세요.');
            return;
        }

        // 교육과정을 선택하지 않았을 때 경고
        const selectedCourse = document.getElementById('course').value;
        if (!selectedCourse) {
            alert('교육과정을 선택해주세요.');
            return;
        }

        // 최대 학생 수 제한 확인
        if (students.length >= maxStudents) {
            alert('최대 5명의 학생만 등록할 수 있습니다.');
            return;
        }

        // 중복 학생 여부 체크
        if (isDuplicateStudent(selectedStudent.id)) {
            alert('이 학생 정보는 이미 등록되어 있습니다.'); // 중복 알림
            return; // 중복일 경우 저장하지 않음
        }

        // 학생 목록에 추가
        const studentToAdd = { 
            id: selectedStudent.id, 
            name: selectedStudent.name, 
            course: selectedCourse 
        };

        students.push(studentToAdd); // 학생 목록에 추가
        localStorage.setItem('students', JSON.stringify(students)); // 로컬 스토리지에 저장
        updateStudentList(); // 학생 목록 업데이트

        // 선택 초기화
        selectedStudent = null;
        selectedStudentDiv = null;

        // 폼 초기화
        document.getElementById('student-id').value = '';
        document.getElementById('search-result').innerHTML = '';
        document.getElementById('course').value = '';
    });

    // 학생 목록 업데이트
    function updateStudentList() {
        const studentList = document.getElementById('student-list');
        studentList.innerHTML = ''; // 기존 목록 초기화

        students.forEach(student => {
            const div = document.createElement('div');
            div.classList.add('student-item');
            div.innerHTML = `
                <span>${student.name} | ${student.course}</span>
                <div class="more-dropdown">
                    <button class="more-btn">⋮</button>
                    <div class="dropdown hidden">
                        <button class="edit-btn">수정</button>
                        <button class="delete-btn">삭제</button>
                    </div>
                </div>
            `;

            // 수정 및 삭제 기능
            div.querySelector('.edit-btn').addEventListener('click', function () {
                const newCourse = prompt('새 교육과정을 입력하세요', student.course);
                if (newCourse) {
                    student.course = newCourse;
                    localStorage.setItem('students', JSON.stringify(students)); // 로컬 스토리지 업데이트
                    updateStudentList();
                }
            });

            div.querySelector('.delete-btn').addEventListener('click', function () {
                const index = students.indexOf(student);
                students.splice(index, 1);
                localStorage.setItem('students', JSON.stringify(students)); // 로컬 스토리지에서 삭제 후 업데이트
                updateStudentList();
            });

            // 더보기 버튼 클릭 시 드롭다운 표시
            div.querySelector('.more-btn').addEventListener('click', function () {
                const dropdown = div.querySelector('.dropdown');
                dropdown.classList.toggle('hidden');
            });

            studentList.appendChild(div);
        });
    }

    // 페이지 로드 시 학생 목록을 업데이트
    updateStudentList();
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