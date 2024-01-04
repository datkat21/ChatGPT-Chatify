// // To be implemented

// export function saveConvo(id, obj) {
//   let convos = {};
//   try {
//     convos = JSON.parse(localStorage.getItem("convos")) || {};
//   } catch (e) {
//     alert("Error parsing prompts from localStorage!");
//   }
//   convos[id] = obj;
//   localStorage.setItem("convos", JSON.stringify(convos));
// }
// export function loadConvo(id = null) {
//   let convos = {};
//   try {
//     convos = JSON.parse(localStorage.getItem("convos")) || {};
//   } catch (e) {
//     alert("Error parsing convos from localStorage!");
//   }
//   if (id === null) {
//     return convos;
//   } else {
//     return convos[id];
//   }
// }
// export function deleteConvo(id) {
//   let convos = {};
//   try {
//     convos = JSON.parse(localStorage.getItem("convos")) || {};
//   } catch (e) {
//     alert("Error parsing convos from localStorage!");
//   }
//   delete convos[id];
//   localStorage.setItem("convos", JSON.stringify(convos));
// }