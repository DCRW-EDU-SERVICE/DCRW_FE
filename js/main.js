// Swiper 설정
new Swiper(".swiper", {
  autoplay: {
    delay: 2000,
  },
  loop: true,
  slidesPerView: 1,
  spaceBetween: 10,
  centeredSlides: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    prevEl: ".swiper-button-prev",
    nextEl: ".swiper-button-next",
  },
});
