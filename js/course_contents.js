document.addEventListener('DOMContentLoaded', function () {
  const accordionContainer = document.getElementById('accordion-container');
  const lectureTitleElement = document.getElementById('lecture-title');
  const progressRateElement = document.getElementById('progress-rate');

  // URL 파라미터에서 강의 제목과 서비스 이름을 가져옵니다.
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course'); // 강의ID
  const studentId = params.get('studentId'); // 학생ID
  const lectureName = params.get('lectureName');

  // 강의 제목 설정
  lectureTitleElement.textContent = `${lectureName}`;

  // 주차 수와 진도율 정보 초기화 (서버에서 불러옴)
  let completedWeeks = 0; // 완료된 주차 수는 서버에서 받아옴
  let globalContentList = []; // 전역 변수로 선언하여 강의 콘텐츠를 저장

  // 진도율 업데이트 함수
  function updateProgressRate(progressRate) {
      progressRateElement.textContent = `진도율 : ${progressRate.toFixed(0)}%`;
  }

  // 서버에서 주차 수 및 완료된 주차 수 불러오는 함수
  function fetchLectureContents(courseId, studentId) {
  // 강의 콘텐츠를 요청하기 위한 POST 요청
  fetch(`http://localhost:8080/teacher/course/contents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 인증 정보 포함
          body: JSON.stringify({ 
              courseId: courseId,     // 필요 시 courseId 값 설정
              studentId: studentId, // 필요 시 사용, 현재 null로 설정
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.status === "OK" && data.data) {
              const { progressRate, contentList } = data.data; // 서버 데이터 구조에 맞게 변수 추출
              globalContentList = contentList; // 전역 변수에 강의 콘텐츠 저장
              updateProgressRate(progressRate); // 초기 진도율 설정
              displayLectureContents(contentList); // 콘텐츠 표시
          } else {
              console.error("Failed to fetch lecture contents:", data.message);
              alert("강의 데이터를 불러오는 데 실패했습니다.");
          }
      })
      .catch(error => {
          console.error("Error fetching lecture contents:", error);
          alert("서버 요청 중 문제가 발생했습니다.");
      });
  }
  // 파일 타입에 따라 적절한 뷰어를 생성하는 함수
  function createViewer(fileType, fileUrl) {
      let viewerElement;
      if (fileType.includes('pdf')) {
          // PDF 파일 뷰어
          viewerElement = document.createElement('embed');
          viewerElement.src = fileUrl;
          viewerElement.type = 'application/pdf';
          viewerElement.width = '100%';
          viewerElement.height = '500px';
      } else if (fileType.includes('image')) {
          // 이미지 파일 뷰어
          viewerElement = document.createElement('img');
          viewerElement.src = fileUrl;
          viewerElement.alt = '강의 이미지';
          viewerElement.style.width = '100%';
      } else if (fileType.includes('video')) {
          // 비디오 파일 뷰어
          viewerElement = document.createElement('video');
          viewerElement.src = fileUrl;
          viewerElement.controls = true;
          viewerElement.style.width = '100%';
      } else {
          // 기타 파일의 경우 다운로드 링크 제공
          viewerElement = document.createElement('a');
          viewerElement.href = fileUrl;
          viewerElement.textContent = '강의 파일 다운로드';
          viewerElement.target = '_blank';
      }
      return viewerElement;
  }
  function displayLectureContents(contentList) {
      // 아코디언 내용 생성
      accordionContainer.innerHTML = ''; // 기존 내용 초기화
      contentList.forEach((content, index) => {
          const week = content.week;
          const accordionItem = document.createElement('div');
          accordionItem.classList.add('accordion-item');

          // 아코디언 헤더 생성
          const headerButton = document.createElement('button');
          headerButton.classList.add('accordion-header');
          headerButton.setAttribute('aria-expanded', index === 0 ? 'true' : 'false'); // 첫 번째 항목만 열린 상태
          headerButton.textContent = `${week}주차`;

          // 아코디언 바디 생성
          const bodyDiv = document.createElement('div');
          bodyDiv.classList.add('accordion-body');

          // 콘텐츠 표시
          const contentDiv = document.createElement('div');
          contentDiv.textContent = `강의 파일: ${content.fileName}`;

          // 파일 형식에 따라 뷰어 생성
          const viewer = createViewer(content.fileType, content.fileUrl);

          // 버튼 컨테이너 생성
          const buttonContainer = document.createElement('div');
          buttonContainer.classList.add('button-container');
          
          // "강의 완료" 버튼 생성
          const finishButton = document.createElement('button');
          finishButton.classList.add('finish-btn');
          finishButton.textContent = '강의 완료';

          let isCompleted = false;
          finishButton.addEventListener('click', function () {
              if (!isCompleted) {
                  completedWeeks++;
                  const newProgressRate = (completedWeeks / contentList.length) * 100;
                  updateProgressRate(newProgressRate);
                  alert(`${week}주차 강의가 완료되었습니다!`);
                  isCompleted = true;
                  finishButton.disabled = true;
              } else {
                  alert(`${week}주차 강의는 이미 완료되었습니다.`);
              }
          });

          // 버튼 컨테이너에 "강의 완료" 버튼 추가
          buttonContainer.appendChild(finishButton);
          
          // 바디에 요소 추가
          bodyDiv.appendChild(contentDiv);
          bodyDiv.appendChild(viewer);
          bodyDiv.appendChild(buttonContainer);

          // 아코디언 아이템 구성
          accordionItem.appendChild(headerButton);
          accordionItem.appendChild(bodyDiv);

          // 컨테이너에 추가
          accordionContainer.appendChild(accordionItem);

          // 아코디언 클릭 이벤트
          headerButton.addEventListener('click', function () {
              const expanded = headerButton.getAttribute('aria-expanded') === 'true';
              headerButton.setAttribute('aria-expanded', !expanded);
              bodyDiv.classList.toggle('show');
              bodyDiv.style.display = expanded ? 'none' : 'block';
          });
      });
  }
  // 텍스트 파일을 생성하고 다운로드하는 함수
  function downloadDailyReport() {
      if (!globalContentList || globalContentList.length === 0) {
          alert('강의 콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
          return;
      }

      let reportContent = `강의 제목: ${lectureName}\n\n현재 ${progressRateElement.textContent}\n\n강의 콘텐츠:\n`;
      globalContentList.forEach((content) => {
          reportContent += `- ${content.week}주차\n  ${content.fileName} 내용 학습 완료\n\n`;
      });

      // Blob 생성
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      // 다운로드 링크 생성 및 클릭
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lectureName}_일지.txt`;
      a.click();

      // 메모리 해제
      URL.revokeObjectURL(url);
  }

  // 서버에서 강의 데이터 불러오기
  fetchLectureContents(courseId, studentId);
  
  // '일지출력' 버튼 클릭 시 현재 진도율을 alert로 표시
 /* document.getElementById('daily-report').addEventListener('click', function () {
      const progressRate = document.getElementById('progress-rate').innerText;
      alert(`현재 ${progressRate}`);
  });
  */
 // '일지출력' 버튼 클릭 시 일지 텍스트 파일 다운로드
 document.getElementById('daily-report').addEventListener('click', downloadDailyReport);

});