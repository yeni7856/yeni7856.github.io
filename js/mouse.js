// window.addEventListener("mousemove", function(event){
//     document.querySelector(".clientX").innerHTML = event.clientX;
//     document.querySelector(".clientY").innerHTML = event.clientY;
//     document.querySelector(".offsetX").innerHTML = event.offsetX;
//     document.querySelector(".offsetY").innerHTML = event.offsetY;
//     document.querySelector(".pageX").innerHTML = event.pageX;
//     document.querySelector(".pageY").innerHTML = event.pageY;
//     document.querySelector(".screenX").innerHTML = event.screenX;
//     document.querySelector(".screenY").innerHTML = event.screenY;
// });

// 선택자
// const cursor = document.querySelector(".mouse__cursor");
// const mouseinfo = document.querySelectorAll(".mouse__text ul li span");

// window.addEventListener("mousemove", function(e){
//     cursor.style.left = e.clientX -25 + "px";
//     cursor.style.top = e.clientY -25 + "px";
// });

// // document.querySelectorAll(".mouse__text span").forEach(function(span){
// //     let attr = span.getAttribute("class");
// //     //attr = s1 s2 s3 s4 s5 s6 s7 s8
// //     span.addEventListener("mouseover", function(){
// //         cursor.classList.add(attr);
// //     });
// //     span.addEventListener("mouseout", function(){
// //         cursor.classList.remove(attr);
// //     });
// // });

const mouse__cursor = document.querySelector(".mouse__cursor");

document.addEventListener("mousemove", function(e){
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  mouse__cursor.style.left = mouseX -25 + "px";
  mouse__cursor.style.top = mouseY -25 + "px";
});