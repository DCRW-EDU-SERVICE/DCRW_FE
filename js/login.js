document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      /*
      // /csrf-token 엔드포인트를 통해 CSRF 토큰을 쿠키에 저장
       await fetchCsrfToken();
      console.log("모든 쿠키 확인:", document.cookie); // 쿠키 내용 확인
      
      // fetch 완료 후 쿠키에 저장된 CSRF 토큰을 가져옴
       const csrfToken = getCsrfTokenFromCookie();
       if (!csrfToken) {
         throw new Error("CSRF 토큰을 가져올 수 없습니다.");
       }
         */
      // 로그인 요청에 CSRF 토큰을 포함하여 요청
      const response = await sendLoginRequest();
      console.log("응답 헤더 확인:", [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 에러: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.message === "Login successful") {
        //document.cookie = `csrfToken=${data.csrfToken}; path=/; secure`; // 서버에서 받은 CSRF 토큰을 쿠키에 저장
        localStorage.setItem("role", data.role);
        localStorage.setItem("isLoggedIn", "true"); // 로그인 상태 저장
        window.location.href = "../../html/main/main.html"; // 메인 페이지로 이동
        console.log(document.cookie);
      } else {
        alert("로그인 실패: " + data.message);
      }
      console.log(response);
    } catch (error) {
      console.error("로그인 요청 중 오류:", error);
      alert(`로그인 요청에 실패했습니다: ${error.message}`);
    }
  });
});

/*
// /csrf-token 엔드포인트에서 CSRF 토큰을 가져오는 함수 (토큰 반환 없음)
 async function fetchCsrfToken() {
   try {
     const response = await fetch('http://localhost:8080/api/csrf-token', { 
       method: 'GET',
       credentials: 'include' // 세션 쿠키 포함
     });

     if (response.ok) {
       console.log("CSRF 토큰이 쿠키에 저장되었습니다.");
      

     } else {
       console.error("CSRF 토큰을 가져오는 데 실패했습니다.");
     }
   } catch (error) {
     console.error("CSRF 토큰 요청 중 오류 발생:", error);
   }
 }
*/

// 쿠키에서 XSRF-TOKEN 값을 가져오는 함수
function getCsrfTokenFromCookie() {
  console.log("모든 쿠키:", document.cookie); // 전체 쿠키를 출력해 확인

  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  console.log("CSRF Token from cookie:", csrfToken); // 쿠키에서 가져온 CSRF 토큰 확인

  return csrfToken;
}

// 로그인 요청을 보내는 함수 (CSRF 토큰을 파라미터로 받음)
async function sendLoginRequest() {
  //const csrfToken = getCsrfTokenFromCookie();
  const userId = document.getElementById("id").value;
  const password = document.getElementById("pw").value;

  // 서버의 로그인 경로 확인 후 정확하게 지정 필요
  const response = await fetch("http://localhost:8080/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 'X-XSRF-TOKEN': csrfToken
    },
    credentials: "include",
    body: JSON.stringify({ username: userId, password: password }),
  });
  console.log("Request sent:", response);
  const jsessionId = document.cookie
    .split("; ")
    .find((row) => row.startsWith("JSESSIONID="));
  console.log(jsessionId); // JSESSIONID=뒤의 값 확인

  return response;
}
