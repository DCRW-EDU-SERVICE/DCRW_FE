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

//모달
const modal = document.querySelector(".modal");
const modalOpen1 = document.querySelector(".team-member1");
const modalOpen2 = document.querySelector(".team-member2");
const modalOpen3 = document.querySelector(".team-member3");
const modalClose = document.querySelector(".close-btn");
let member = document.getElementById("member1");

//열기 버튼을 눌렀을 때 모달팝업이 열림
modalOpen1.addEventListener("click", function () {
  document.getElementById("member-name").innerText = "이은비";
  document.getElementById("role1").innerText = "DB설계";
  document.getElementById("role2").innerText = "DB구현";
  document.getElementById("role3").innerText = "화면구현";
  modal.style.display = "block";
});
modalOpen2.addEventListener("click", function () {
  document.getElementById("member-name").innerText = "권다은";
  document.getElementById("role1").innerText = "DB 설계 및 구현";
  document.getElementById("role2").innerText = "UX/UI디자인";
  document.getElementById("role3").innerText = "화면구현";
  modal.style.display = "block";
});
modalOpen3.addEventListener("click", function () {
  document.getElementById("role1").innerText = "DB 설계 및 구현";
  document.getElementById("role2").innerText = "프롬프팅";
  document.getElementById("role3").innerText = "서버구현";
  modal.style.display = "block";
});

//닫기 버튼을 눌렀을 때 모달팝업이 닫힘
modalClose.addEventListener("click", function () {
  //display 속성을 none으로 변경
  modal.style.display = "none";
});

//콘텐츠 내용
const why = document.querySelector(".team-introduce-why");
const why_content = document.querySelector(".team-introduce-why-content");
var flag1 = 0;
why.addEventListener("click", function () {
  if (flag1 == 0) {
    why_content.style.display = "block";
    document.getElementById("why-subject").innerText =
      " 1. 왜 이 프로젝트를 시작했나요? 🔼";
    flag1 = 1;
  } else {
    document.getElementById("why-subject").innerText =
      " 1. 왜 이 프로젝트를 시작했나요? 🔽";
    why_content.style.display = "none";
    flag1 = 0;
  }
});

const purpose = document.querySelector(".team-introduce-purpose");
const purpose_content = document.querySelector(
  ".team-introduce-purpose-content"
);
var flag2 = 0;
purpose.addEventListener("click", function () {
  if (flag2 == 0) {
    document.getElementById("purpose-subject").innerText =
      "2. 다채로와의 목적은 무엇인가요? 🔼";
    purpose_content.style.display = "block";
    flag2 = 1;
  } else {
    document.getElementById("purpose-subject").innerText =
      "2. 다채로와의 목적은 무엇인가요? 🔽";
    purpose_content.style.display = "none";
    flag2 = 0;
  }
});

const service = document.querySelector(".team-introduce-service");
const service_content = document.querySelector(
  ".team-introduce-service-content"
);
var flag3 = 0;
service.addEventListener("click", function () {
  if (flag3 == 0) {
    document.getElementById("service-subject").innerText =
      " 3. 다채로와에는 어떤 서비스가 있나요? 🔼";
    service_content.style.display = "block";
    flag3 = 1;
  } else {
    document.getElementById("service-subject").innerText =
      " 3. 다채로와에는 어떤 서비스가 있나요? 🔽";
    service_content.style.display = "none";
    flag3 = 0;
  }
});
