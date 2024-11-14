document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = document.getElementById("id").value;
    const password = document.getElementById("pw").value;

    // CSRF 토큰 추출
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");
    console.log("CSRF Token:", csrfToken); // 토큰확인(서버 토큰이 안들어가는것 같은디..)

    try {
      const response = await fetch("http://13.209.48.39/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //"X-CSRF-Token": csrfToken, // CSRF 토큰을 헤더에 추가
        },
        body: JSON.stringify({ username: userId, password: password }),
        credentials: "include", // 세션 쿠키 포함 설정
      });

      if (!response.ok) {
        throw new Error(
          `서버 에러: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.message === "Login successful") {
        alert("로그인 성공!");
        window.location.href = "../../html/account/profile.html";
      } else {
        alert("로그인 실패: " + data.message);
      }
    } catch (error) {
      console.error("로그인 요청 중 오류:", error);
      alert(`로그인 요청에 실패했습니다: ${error.message}`);
    }
  });
});
