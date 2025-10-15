import { chatIntents } from "../data.js";

/**
 * Processa mensagens do chat simulando IA contextual.
 */
export function setupChat(user) {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const windowEl = document.getElementById("chat-window");

  windowEl.innerHTML = "";
  appendMessage(
    windowEl,
    "assistant",
    "MeSeg IA",
    `Olá ${user.name.split(" ")[0]}! Como posso ajudar hoje?`,
  );

  if (form.dataset.bound) {
    return;
  }

  form.addEventListener("submit", (eventSubmit) => {
    eventSubmit.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage(windowEl, "user", user.name, message);
    input.value = "";

    const { classification, response } = classifyMessage(message.toLowerCase());
    const assistantName =
      classification === "critical" ? "Equipe de Plantão" : "MeSeg IA";
    appendMessage(
      windowEl,
      "assistant",
      assistantName,
      response,
      classification === "critical",
    );

    if (classification === "critical") {
      alert("🔔 Alerta crítico: equipe humana notificada (mock).");
    }
  });

  form.dataset.bound = "true";
}

function appendMessage(container, author, name, message, alert = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat__message chat__message--${author}`;
  if (alert) wrapper.classList.add("chat__message--alert");

  wrapper.innerHTML = `
        <strong>${name}</strong>
        <span class="chat__bubble">${message}</span>
    `;

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function classifyMessage(message) {
  const searchIntent = (intent) =>
    intent.find(({ keywords }) =>
      keywords.some((keyword) => message.includes(keyword)),
    );

  const portalIntent = searchIntent(chatIntents.portal);
  if (portalIntent) {
    return { classification: "portal", response: portalIntent.response };
  }

  const criticalIntent = searchIntent(chatIntents.critical);
  if (criticalIntent) {
    return {
      classification: "critical",
      response: `${criticalIntent.response} (registro automático no painel).`,
    };
  }

  const trivialIntent = searchIntent(chatIntents.trivial);
  if (trivialIntent) {
    return {
      classification: "trivial",
      response: `${trivialIntent.response} Consulte também o Painel Principal.`,
    };
  }

  return {
    classification: "portal",
    response:
      "Estou aqui para ajudar. Você pode perguntar sobre documentos, embarque, clima ou apoio durante a trilha!",
  };
}