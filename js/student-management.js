document.addEventListener('DOMContentLoaded', () => {
    const maxStudents = 5;
    let selectedStudent = null;
    let selectedStudentDiv = null;

    // 페이지 로드 시 강좌 데이터 로드
    fetchCourses();

    // 학생 검색
    document.getElementById('search-student').addEventListener('click', function () {
        const studentId = document.getElementById('student-id').value;
        const selectedCourse = document.getElementById('course').value;
        const courseId = getCourseId(selectedCourse);

        fetch('http://localhost:8080/teacher/student-management', {
            method: 'POST',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId, courseId })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            console.log("검색 응답 데이터:", data);
            if (data.status === "OK" && data.data) {
                displaySearchResults([{ 
                    id: data.data.studentId, 
                    name: data.data.studentName 
                }]);
            } else {
                displaySearchResults([]);
            }
        })
        .catch(error => {
            console.error('학생 검색 오류:', error);
            alert(`오류 발생: ${error.message}`);
        });
    });

    // 검색 결과 표시
    function displaySearchResults(students) {
        const searchResultDiv = document.getElementById('search-result');
        searchResultDiv.innerHTML = '';

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
            studentDiv.querySelector('.select-btn').addEventListener('click', function () {
                selectStudent(student, studentDiv);
            });
            searchResultDiv.appendChild(studentDiv);
        });
    }

    // 학생 선택
    function selectStudent(student, studentDiv) {
        if (selectedStudentDiv) {
            selectedStudentDiv.style.border = 'none';
        }

        selectedStudent = student;
        selectedStudentDiv = studentDiv;

        studentDiv.style.border = '2px solid #327cd3';
        studentDiv.style.borderRadius = '5px';

        document.getElementById('student-id').value = student.id;
        console.log("선택된 학생:", student.id);
    }

    // 학생 저장 (DB 오류로 abcd5678에게만 등록 가능)
    document.getElementById('student-form').addEventListener('submit', function (e) {
        e.preventDefault();

        if (!selectedStudent) {
            alert('학생을 선택해주세요.');
            return;
        }

        const selectedCourse = document.getElementById('course').value;
        const courseId = getCourseId(selectedCourse);

        if (!courseId) {
            alert('올바른 강의를 선택해주세요.');
            return;
        }

        const requestData = {
            studentId: selectedStudent.id,
            courseId: courseId
        };

        console.log("학생 저장 요청 데이터:", requestData);

        fetch('http://localhost:8080/teacher/student-management/register', {
            method: 'POST',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "OK") {
                alert("학생이 성공적으로 등록되었습니다.");
                fetchCourses(); // 강의 목록 업데이트
                resetForm(); // 폼 초기화
            } else {
                alert(`학생 등록 실패: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('학생 등록 오류:', error.message);
            alert(`오류 발생: ${error.message}`);
        });
    });

    // 강의 데이터 가져오기 및 학생 목록 업데이트
    function fetchCourses() {
        fetch('http://localhost:8080/teacher/course', {
            method: 'GET',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "OK" && data.data) {
                console.log("강의 목록 응답 데이터:", data.data);
                updateStudentList(data);
            } else {
                alert('강의 목록 불러오기 실패');
            }
        })
        .catch(error => {
            console.error('강의 목록 불러오기 오류:', error.message);
            alert(`오류 발생: ${error.message}`);
        });
    }

    // 학생 목록 업데이트
    function updateStudentList(responseData) {
        const studentListDiv = document.getElementById('student-list');
        studentListDiv.innerHTML = '';

        const students = [];
        responseData.data.course.forEach(course => {
            course.student.forEach(student => {
                students.push({
                    courseTitle: course.title,
                    studentName: student.studentName,
                    studentId: student.studentId,
                    age: student.age
                });
            });
        });

        students.forEach(student => {
            const studentDiv = document.createElement('div');
            studentDiv.classList.add('student-item');
            studentDiv.innerHTML = `
                <div class="name">
                    <span class="service-name">${student.courseTitle}</span>
                    <span class="student-info">${student.studentName} (${student.studentId}, ${student.age}세)</span>
                </div>
                <button type="button" class="delete-btn" data-id="${student.studentId}">Ⅹ</button>
            `;
            studentDiv.querySelector('.delete-btn').addEventListener('click', function () {
                deleteStudent(student.studentId);
            });
            studentListDiv.appendChild(studentDiv);
        });
    }

    // 학생 삭제 (DB 오류)
    function deleteStudent(studentId) {
        fetch(`http://localhost:8080/teacher/student-management`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            alert("학생이 성공적으로 삭제되었습니다.");
            fetchCourses(); // 강의 목록 업데이트
        })
        .catch(error => {
            console.error('학생 삭제 오류:', error.message);
            alert(`오류 발생: ${error.message}`);
        });
    }

    // 강좌 이름 -> 강좌 ID 매핑
    function getCourseId(courseName) {
        const courses = {
            '한국어 교육 서비스': 1,
            '자녀생활 서비스': 2,
            '부모교육 서비스': 3
        };
        return courses[courseName] || null;
    }

    // 폼 초기화
    function resetForm() {
        selectedStudent = null;
        selectedStudentDiv = null;
        document.getElementById('student-id').value = '';
        document.getElementById('course').value = '';
        document.getElementById('search-result').innerHTML = '';
    }
});
