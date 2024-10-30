function execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      // 팝업을 통한 검색 결과 항목 클릭 시 실행
      var addr = ""; // 주소_결과값이 없을 경우 공백
      var extraAddr = ""; // 참고항목

      //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
      if (data.userSelectedType === "R") {
        // 도로명 주소를 선택
        addr = data.roadAddress;
      } else {
        // 지번 주소를 선택
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
      } else {
        document.getElementById("UserAdd1").value = "";
      }

      // 선택된 우편번호와 주소 정보를 input 박스에 넣는다.
      document.getElementById("zipp_code_id").value = data.zonecode;
      document.getElementById("UserAdd1").value = addr;
      document.getElementById("UserAdd1").value += extraAddr;
      document.getElementById("UserAdd2").focus(); // 우편번호 + 주소 입력이 완료되었음으로 상세주소로 포커스 이동
    },
  }).open();
}

//날짜제한(현재 날짜 이후 불가)
var now_utc = Date.now(); // 지금 날짜를 밀리초로
// getTimezoneOffset()은 현재 시간과의 차이를 분 단위로 반환
var timeOff = new Date().getTimezoneOffset() * 60000; // 분단위를 밀리초로 변환
// new Date(now_utc-timeOff).toISOString()은 '2024-10-01T18:09:38.134Z'를 반환
var today = new Date(now_utc - timeOff).toISOString().split("T")[0];
document.getElementById("birth").setAttribute("max", today);
