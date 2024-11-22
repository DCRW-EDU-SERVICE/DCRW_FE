document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signupForm");

  // 날짜 제한 (현재 날짜 이후 불가)
  const nowUtc = Date.now();
  const timeOffset = new Date().getTimezoneOffset() * 60000;
  const today = new Date(nowUtc - timeOffset).toISOString().split("T")[0];
  document.getElementById("birth").setAttribute("max", today);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // 폼 데이터 가져오기
    const userId = document.getElementById("id").value;
    const userIdWarning = document.getElementById("id_warning");
    const password = document.getElementById("pw").value;
    const checkPassword = document.getElementById("checkpw").value;
    const passwordWarning = document.getElementById("pw_warning");
    const checkPasswordWarning = document.getElementById("check-pw-warning");
    const name = document.getElementById("name").value;
    const zippCode = document.getElementById("zipp_code_id").value;
    const address1 = document.getElementById("UserAdd1").value;
    const address2 = document.getElementById("UserAdd2").value;
    const address2Warning = document.getElementById("zip_warning");
    const address = `${address1} ${address2} (${zippCode})`;

    const birth = document.getElementById("birth").value;
    const joinDate = new Date().toISOString().split("T")[0];

    // 유효성 검사
    const userIdPattern = /^[a-z0-9]{4,20}$/;
    const passwordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,16}$/;
    const namePattern = /^[가-힣a-zA-Z0-9]{2,10}$/;

    if (!userIdPattern.test(userId)) {
      //alert("아이디는 영문 소문자와 숫자 4~20자리여야 합니다.");
      userIdWarning.style.visibility = "visible";
      return;
    }

    if (!passwordPattern.test(password)) {
      //alert("비밀번호는 8~16자리, 영문 대소문자, 숫자, 특수문자 1개 이상을 포함해야 합니다.");
      passwordWarning.style.visibility = "visible";
      return;
    }

    if (password !== checkPassword) {
      //alert("비밀번호가 일치하지 않습니다.");
      checkPasswordWarning.style.visibility = "visible";
      return;
    }

    if (!namePattern.test(name)) {
      alert("이름은 특수문자를 포함하지 않은 2~10자리여야 합니다.");
      return;
    }

    if (!zippCode) {
      //alert("주소를 입력해주세요.");
      address2Warning.style.visibility = "visible";
      return;
    }

    // CSRF 토큰 가져오기
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");

    try {
      // 회원가입 API 요청
      const response = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //"X-CSRF-Token": csrfToken, // CSRF 토큰을 헤더에 추가
        },
        credentials: "include",
        body: JSON.stringify({
          userId: userId,
          password: password,
          name: name,
          address: address,
          birthdate: birth, // yyyy-MM-dd 형식으로 전달
          //teacherCode: teacherCode,
          //joinDate: joinDate, // yyyy-MM-dd 형식으로 전달
        }),
      });
      if (!response.ok) {
        throw new Error(
          `서버 에러: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.message === "가입 성공") {
        alert("회원가입 성공!");
        window.location.href = "./Profile.html"; // 회원가입 후 프로필 페이지로 이동
      } else {
        alert("회원가입 실패: " + data.message);
      }
    } catch (error) {
      console.error("회원가입 요청 중 오류:", error);
      alert(`회원가입 요청에 실패했습니다: ${error.message}`);
    }
  });
});

// 다음 주소 API 연동
function execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = "";
      let extraAddr = "";

      if (data.userSelectedType === "R") {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
      }

      document.getElementById("zipp_code_id").value = data.zonecode;
      document.getElementById("UserAdd1").value = addr + extraAddr;
      document.getElementById("UserAdd2").focus();
    },
  }).open();
}
