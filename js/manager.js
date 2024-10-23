document.addEventListener("DOMContentLoaded", function () {
    const userList = [
        { role: '학생', name: '홍길동', user_id: 'hong123', birthdate: '1995-01-01', address: '서울시 강남구', joindate: '2023-10-01', teacherCode: '' },
        { role: '교사', name: '김철수', user_id: 'kim456', birthdate: '1980-05-12', address: '부산시 해운대구', joindate: '2023-08-15', teacherCode: '' },
        { role: '교사', name: '이영희', user_id: 'lee789', birthdate: '1990-02-20', address: '대전시 중구', joindate: '2023-07-20', teacherCode: '' }
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
            checkbox.checked = this.checked;  // 전체 체크박스 상태에 따라 선택/해제
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
            let isValid = true;

            // 모든 선택된 회원이 '교사'인지 확인
            selectedUsers.forEach(user => {
                if (user.role !== '교사') {
                    isValid = false;
                }
            });

            if (isValid) {
                // 기존 교사 코드가 있는지 확인
                const usersWithExistingCodes = selectedUsers.filter(user => user.teacherCode !== '');
                if (usersWithExistingCodes.length > 0) {
                    const namesWithExistingCodes = usersWithExistingCodes.map(user => user.name).join(', ');
                    showPopup(`${namesWithExistingCodes}의 교사코드는 이미 발급되어 있습니다.`);
                } else {
                    // 교사 코드 발급 및 팝업 표시
                    issueTeacherCodes(selectedUsers);
                }
            } else {
                showPopup('교사코드는 교사에게만 발급 가능합니다.');
            }
        } else {
            showPopup('교사코드를 발급할 회원을 선택해주세요.');
        }
    });

    // 교사 코드 발급 및 팝업 표시 함수
    function issueTeacherCodes(selectedUsers) {
        let index = 0;

        function showNextPopup() {
            if (index < selectedUsers.length) {
                const user = selectedUsers[index];
                const teacherCode = generateTeacherCode();
                user.teacherCode = teacherCode;  // 교사 코드 저장
                showPopup(`회원 ${user.name}에게 발급된 교사 코드: ${teacherCode}`, () => {
                    updateUserTable(userList);  // 업데이트된 회원 목록 표시
                    index++; // 다음 교사로 이동
                    showNextPopup(); // 다음 팝업 표시
                });
            }
        }

        showNextPopup(); // 첫 번째 팝업 표시
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

    // 팝업창 띄우기
    function showPopup(message, callback) {
        // 팝업창 생성
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.innerHTML = `
            <div class="popup-content">
                <p>${message}</p>
                <button id="close-popup">확인</button>
            </div>
        `;
        document.body.appendChild(popup);

        // 팝업 닫기 기능
        document.getElementById('close-popup').addEventListener('click', function () {
            document.body.removeChild(popup);
            if (callback) callback();  // 다음 동작 실행
        });
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

    // 회원 목록에서 삭제하는 함수
    function removeUser(userId) {
        const index = userList.findIndex(user => user.user_id === userId);
        if (index !== -1) {
            userList.splice(index, 1);
        }
    }

    // 모든 회원 선택 해제 함수
    function deselectAllUsers() {
        document.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
});
