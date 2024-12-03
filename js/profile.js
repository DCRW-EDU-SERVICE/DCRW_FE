document.addEventListener("DOMContentLoaded", async function () {
  const apiEndpoint = "http://localhost:8080/user/profile"; // 프로필 데이터 API 엔드포인트
  const form = document.querySelector(".profile-form form");

  // **1. 프로필 데이터 가져오기**
  async function fetchProfile() {
    try {
      const response = await fetch(apiEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 세션 쿠키 포함
      });

      if (!response.ok) {
        throw new Error(`프로필 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("프로필 데이터 조회 결과:", result);

      if (result.status === "OK") {
        renderProfile(result.data);
      } else {
        alert("프로필 데이터를 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error("프로필 데이터 조회 중 오류:", error);
      alert("프로필 데이터를 불러오는 중 문제가 발생했습니다.");
    }
  }

  // **2. 프로필 데이터 렌더링**
  function renderProfile(profile) {
    let arr = profile.address.split(",");
    document.getElementById("name").value = profile.userName || "";
    document.getElementById("zipp_code_id").value = arr[0];
    document.getElementById("UserAdd1").value = arr[1];
    document.getElementById("UserAdd2").value = arr[2];
    document.getElementById("birth").value = profile.birthDate || "";

    // 사용자 표시 정보 업데이트
    document.querySelector(".username").textContent =
      profile.userName || "이름 없음";
    document.querySelector(".userrole").textContent = selectRole(profile.role);
    document.querySelector(".service").textContent = serviceSelect(
      serviceSelect(profile.role)
    );
  }

  function serviceSelect(role) {
    if (role == 0) return "다채로와 서비스 관리";
    if (role == 1) return "한국어 교육 서비스";
    if (role == 2) return "서비스 수혜자(학생)";
  }

  // 역할에 따른 텍스트 반환
  function selectRole(role) {
    if (role === 0) return "관리자";
    if (role === 1) return "선생님";
    return "학생";
  }

  // **3. 프로필 데이터 저장**
  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // 기본 제출 방지

    // 폼 데이터 수집
    const userName = document.getElementById("name").value.trim();
    const zipCode = document.getElementById("zipp_code_id").value.trim();
    const address1 = document.getElementById("UserAdd1").value.trim();
    const address2 = document.getElementById("UserAdd2").value.trim();
    const address = `${address1} ${address2} (${zipCode})`;
    const birthDate = document.getElementById("birth").value;

    if (!userName || !zipCode || !address1 || !address2 || !birthDate) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: "PATCH", // 프로필 업데이트 요청
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userName: userName,
          address: `${zipCode},${address1},${address2}`,
          birthDate: birthDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`프로필 업데이트 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("프로필 업데이트 성공:", result);

      if (result.status === "OK") {
        alert("프로필이 성공적으로 업데이트되었습니다.");
        window.location.href = `../main/main.html`; // 페이지 새로고침
      } else {
        alert("프로필 업데이트 실패: " + result.message);
      }
    } catch (error) {
      console.error("프로필 업데이트 중 오류:", error);
      alert("프로필 업데이트에 실패했습니다.");
    }
  });

  // **4. 주소 찾기 (다음 API 연동)**
  document
    .getElementById("zipp_btn")
    .addEventListener("click", function (event) {
      event.preventDefault();
      execDaumPostcode();
    });

  function execDaumPostcode() {
    new daum.Postcode({
      oncomplete: function (data) {
        let addr = ""; // 기본 주소
        let extraAddr = ""; // 참고 항목

        // 도로명 주소 또는 지번 주소
        addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        // 참고 항목 추가
        if (data.userSelectedType === "R") {
          if (data.bname && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname;
          }
          if (data.buildingName && data.apartment === "Y") {
            extraAddr +=
              extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
          }
          if (extraAddr !== "") {
            extraAddr = ` (${extraAddr})`;
          }
        }

        // 입력 필드에 값 세팅
        document.getElementById("zipp_code_id").value = data.zonecode;
        document.getElementById("UserAdd1").value = addr + extraAddr;
        document.getElementById("UserAdd2").focus(); // 상세주소로 포커스 이동
      },
    }).open();
  }

  // **5. 날짜 제한 (현재 날짜 이후 불가)**
  const nowUtc = Date.now(); // 현재 시간
  const timeOffset = new Date().getTimezoneOffset() * 60000; // 시간 차이 보정
  const today = new Date(nowUtc - timeOffset).toISOString().split("T")[0];
  document.getElementById("birth").setAttribute("max", today);

  // **초기 프로필 데이터 가져오기**
  await fetchProfile();
});
