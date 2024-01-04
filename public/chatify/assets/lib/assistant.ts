export interface CustomPrompt {
  system: string;
  temp: string;
  id?: string;
  avatar: string | false;
  name: string | false;
}

export function saveAssistant(
  id: string | number,
  obj: { system: any; temp: any; avatar: any; name: any }
) {
  let prompts: Record<string, CustomPrompt> = {};
  try {
    let p = localStorage.getItem("prompts");
    if (p === null) p = "{}";
    prompts = JSON.parse(p);
  } catch (e) {
    alert("Error parsing prompts from localStorage!");
  }
  prompts[id] = obj;
  localStorage.setItem("prompts", JSON.stringify(prompts));
}
export function loadAssistant(
  id = null
): Record<string, CustomPrompt> | CustomPrompt {
  let prompts: Record<string, CustomPrompt> = {};
  try {
    let p = localStorage.getItem("prompts");
    if (p === null) p = "{}";
    prompts = JSON.parse(p);
  } catch (e) {
    alert("Error parsing prompts from localStorage!");
  }
  if (id === null) {
    return prompts;
  } else {
    return prompts[id];
  }
}
export function deleteAssistant(id: string) {
  let prompts: Record<string, CustomPrompt> = {};
  try {
    let p = localStorage.getItem("prompts");
    if (p === null) p = "{}";
    prompts = JSON.parse(p);
  } catch (e) {
    alert("Error parsing prompts from localStorage!");
  }
  delete prompts[id];
  localStorage.setItem("prompts", JSON.stringify(prompts));
}
