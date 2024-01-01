export function saveAssistant(id, obj) {
  let prompts = {};
  try {
    prompts = JSON.parse(localStorage.getItem("prompts")) || {};
  } catch (e) {
    alert("Error parsing prompts from localStorage!");
  }
  prompts[id] = obj;
  localStorage.setItem("prompts", JSON.stringify(prompts));
}
export function loadAssistant(id = null) {
  let prompts = {};
  try {
    prompts = JSON.parse(localStorage.getItem("prompts")) || {};
  } catch (e) {
    alert("Error parsing prompts from localStorage!");
  }
  if (id === null) {
    return prompts;
  } else {
    return prompts[id];
  }
}
export function deleteAssistant(id) {
  let prompts = {};
  try {
    prompts = JSON.parse(localStorage.getItem("prompts")) || {};
  } catch (e) {
    alert("Error parsing prompts from localStorage!");
  }
  delete prompts[id];
  localStorage.setItem("prompts", JSON.stringify(prompts));
}
