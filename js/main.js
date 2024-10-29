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
/*  if (getComputedStyle(show_flag).display === "none") {
    show_flag.style.display = "block";
  } else {
    show_flag.style.display = "none";
  }*/
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
