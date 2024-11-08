// 로그인 성공 시 메인 페이지로 이동하는 코드
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      const response = await sendRequest();
      console.log("응답 헤더 확인:", [...response.headers.entries()]); // 응답 헤더 확인


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 에러: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.message === "Login successful") {
        console.log(data.csrfToken); //토큰 확인
        document.cookie = `csrfToken=${data.csrfToken}; path=/; secure`;  // CSRF 토큰을 쿠키에 저장
        localStorage.setItem("isLoggedIn", "true"); // 로그인 상태 저장
        window.location.href = "../../html/main/main.html"; // 메인 페이지로 이동
      } else {
        alert("로그인 실패: " + data.message);
      }
    } catch (error) {
      console.error("로그인 요청 중 오류:", error);
      alert(`로그인 요청에 실패했습니다: ${error.message}`);
    }
  });
});

async function sendRequest() {
  const userId = document.getElementById("id").value;
  const password = document.getElementById("pw").value;

  const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
  const csrfToken = csrfTokenMeta ? csrfTokenMeta.getAttribute("content") : null;
  console.log("CSRF Token:", csrfToken);

  if (!csrfToken) {
    console.error("CSRF token is missing");
    throw new Error("CSRF 토큰이 존재하지 않습니다. 서버 설정을 확인하세요.");
  }

  // 서버의 로그인 경로 확인 후 정확하게 지정 필요
  const response = await fetch('http://13.209.48.39/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify({ username: userId, password: password })
  });
  console.log("Request sent:", response);
  return response;
}
