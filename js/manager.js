document.addEventListener("DOMContentLoaded", function () {
    const userList = [
        { role: '학생', name: '홍길동', user_id: 'hong123', birthdate: '1995-01-01', address: '서울시 강남구', joindate: '2023-10-01', teacherCode: '' },
        { role: '학생', name: '김철수', user_id: 'kim456', birthdate: '1980-05-12', address: '부산시 해운대구', joindate: '2023-08-15', teacherCode: '' },
        { role: '학생', name: '이영희', user_id: 'lee789', birthdate: '1990-02-20', address: '대전시 중구', joindate: '2023-07-20', teacherCode: '' }
    ];

    // 회원 목록 테이블 업데이트 함수
    function updateUserTable(users) {
        const tbody = document.querySelector('.user-table tbody');
        tbody.innerHTML = '';  // 테이블 초기화

        users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="user-checkbox" data-index="${index}"></td>
                <td>${user.role}</td>
                <td>${user.name}</td>
                <td>${user.user_id}</td>
                <td>${user.birthdate}</td>
                <td>${user.address}</td>
                <td>${user.joindate}</td>
                <td class="teacher-code">${user.teacherCode || ''}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // 초기 회원 목록 표시
    updateUserTable(userList);

    // 전체 선택/해제 기능 구현
    document.getElementById('check').querySelector('input').addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // 검색 기능 구현
    document.getElementById('search-user').addEventListener('click', function () {
        const searchValue = document.getElementById('user-id').value.toLowerCase();
        const filteredUsers = userList.filter(user => 
            user.name.toLowerCase().includes(searchValue) || user.user_id.toLowerCase().includes(searchValue)
        );
        updateUserTable(filteredUsers);
    });

    // 정렬 기능 구현
    document.getElementById('sort').addEventListener('change', function () {
        const sortValue = this.value;
        let sortedUsers;

        if (sortValue === '최근 가입') {
            sortedUsers = [...userList].sort((a, b) => new Date(b.joindate) - new Date(a.joindate));
        } else if (sortValue === '가나다') {
            sortedUsers = [...userList].sort((a, b) => a.name.localeCompare(b.name));
        }

        updateUserTable(sortedUsers);
    });

    // 교사 코드 발급 기능
    document.querySelector('.code-btn').addEventListener('click', function () {
        const selectedUsers = getSelectedUsers();
        if (selectedUsers.length > 0) {
            const usersWithTeacherCode = selectedUsers.filter(user => user.teacherCode !== '');
            const usersWithoutTeacherCode = selectedUsers.filter(user => user.teacherCode === '');

            if (usersWithTeacherCode.length > 0) {
                const namesWithTeacherCode = usersWithTeacherCode.map(user => user.name).join(', ');
                showPopup(`${namesWithTeacherCode}의 교사코드는 이미 발급되어 있습니다.`, () => {
                    if (usersWithoutTeacherCode.length > 0) {
                        confirmIssueTeacherCodes(usersWithoutTeacherCode);
                    }
                });
            } else if (usersWithoutTeacherCode.length > 0) {
                confirmIssueTeacherCodes(usersWithoutTeacherCode);
            }
        } else {
            showPopup('교사코드를 발급할 회원을 선택해주세요.');
        }
    });

    // 교사 코드 발급 여부를 확인하는 팝업창
    function confirmIssueTeacherCodes(usersWithoutTeacherCode) {
        let index = 0;

        function showNextConfirmation() {
            if (index < usersWithoutTeacherCode.length) {
                const user = usersWithoutTeacherCode[index];
                showConfirmationPopup(`${user.name} 회원의 교사코드를 발급하시겠습니까?`, () => {
                    issueTeacherCode(user); // '예' 선택 시 교사 코드 발급
                    showPopup(`${user.name} 회원의 교사코드 : ${user.teacherCode}`, () => { // 발급된 교사코드 확인 팝업
                        index++;
                        showNextConfirmation(); // 다음 회원 확인 팝업 표시
                    });
                }, () => {
                    index++; // '아니오' 선택 시 다음 사용자로 이동
                    showNextConfirmation();
                });
            } else {
                updateUserTable(userList); // 모든 확인 과정 완료 후 테이블 업데이트
            }
        }

        showNextConfirmation(); // 첫 번째 회원에 대한 팝업 표시
    }

    // 교사 코드 발급 함수
    function issueTeacherCode(user) {
        const teacherCode = generateTeacherCode();
        user.teacherCode = teacherCode;
        user.role = '교사';
    }

    // '예' 또는 '아니오' 버튼이 있는 팝업창 표시 함수
    function showConfirmationPopup(message, yesCallback, noCallback) {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.innerHTML = `
            <div class="popup-content">
                <p>${message}</p>
                <button id="yes-button">예</button>
                <button id="no-button">아니오</button>
            </div>
        `;
        document.body.appendChild(popup);

        document.getElementById('yes-button').addEventListener('click', function () {
            document.body.removeChild(popup);
            if (yesCallback) yesCallback();
        });

        document.getElementById('no-button').addEventListener('click', function () {
            document.body.removeChild(popup);
            if (noCallback) noCallback();
        });
    }

    // 기존 팝업창 표시 함수
    function showPopup(message, callback) {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.innerHTML = `
            <div class="popup-content">
                <p>${message}</p>
                <button id="close-popup">확인</button>
            </div>
        `;
        document.body.appendChild(popup);

        document.getElementById('close-popup').addEventListener('click', function () {
            document.body.removeChild(popup);
            if (callback) callback();
        });
    }

    // 교사 코드 생성 함수
    function generateTeacherCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 7; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // 회원 탈퇴 기능
    document.querySelector('.withdraw-btn').addEventListener('click', function () {
        const selectedUsers = getSelectedUsers();
        if (selectedUsers.length > 0) {
            const confirmation = confirm(`정말로 ${selectedUsers.map(user => user.name).join(', ')} 회원을 탈퇴시키겠습니까?`);
            if (confirmation) {
                selectedUsers.forEach(user => removeUser(user.user_id));
                updateUserTable(userList);
                alert(`${selectedUsers.map(user => user.name).join(', ')} 회원이 목록에서 삭제되었습니다.`);
            }
        } else {
            alert('탈퇴할 회원을 선택해주세요.');
        }
    });

    // 회원 목록에서 삭제하는 함수
    function removeUser(userId) {
        const index = userList.findIndex(user => user.user_id === userId);
        if (index !== -1) {
            userList.splice(index, 1);
        }
    }

    // 선택된 회원 가져오기
    function getSelectedUsers() {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        const selectedUsers = [];

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedUsers.push(userList[checkbox.getAttribute('data-index')]);
            }
        });

        return selectedUsers;
    }
});
