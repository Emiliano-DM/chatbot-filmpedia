import { procesarPregunta } from "./chatbot.js";

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", async () => {
  const pregunta = input.value.trim();
  if (!pregunta) return;

  messages.textContent += `\n\n🧑‍💬 ${pregunta}`;
  input.value = "";

  messages.textContent += `\n🤖 Pensando...`;

  const respuesta = await procesarPregunta(pregunta);
  messages.textContent += `\n🤖 ${respuesta}`;
});
