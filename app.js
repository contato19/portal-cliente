// ==========================
// Dados simulados do portal
// ==========================
const mockData = {
  users: {
    "TREK-1234": {
      name: "Ana Rodrigues",
      password: "montanha",
      role: "titular",
      event: {
        date: "20/07/2024",
        status: "Confirmado",
        participants: [
          { id: "G1", name: "Ana Rodrigues", role: "Guia Principal", status: "moving" },
          { id: "A1", name: "Lucas Andrade", role: "Guia Auxiliar", status: "moving" },
          { id: "P1", name: "Marina", role: "Participante", status: "moving" },
          { id: "P2", name: "Henrique", role: "Participante", status: "idle" },
          { id: "P3", name: "Sofia", role: "Participante", status: "offtrack" }
        ],
        route: {
          title: "Travessia Serra Verde",
          difficulty: "Moderada",
          distance: "18 km",
          duration: "2 dias",
          highlights: [
            "Mirante Pedra do Sol",
            "Cachoeira Escondida",
            "Camping noturno com observação de estrelas"
          ],
          ebook: "Guia de Preparação - Serra Verde.pdf"
        },
        boarding: {
          location: "Terminal Rodoviário Trekking Point",
          address: "Av. das Montanhas, 450 - Centro",
          reference: "Em frente à loja Alpina",
          dateTime: "20/07/2024 às 05h30",
          map: {
            description: "Mapa de embarque",
            // Coordenadas fictícias para animação simples
            anchor: { x: 65, y: 40 }
          },
          notes: [
            "Chegar com 30 minutos de antecedência",
            "Levar documento com foto e ficha médica assinada",
            "Bagagens identificadas com etiqueta do evento"
          ]
        }
      },
      documents: [
        { id: "voucher", name: "Voucher de Embarque", available: true },
        { id: "contract", name: "Contrato de Participação", available: true },
        { id: "ebook", name: "E-book Serra Verde", available: true }
      ]
    },
    "TREK-5678": {
      name: "Marina Souza",
      password: "trilha",
      role: "acompanhante",
      event: {
        date: "20/07/2024",
        status: "Confirmado",
        participants: [
          { id: "G1", name: "Ana Rodrigues", role: "Guia Principal", status: "moving" },
          { id: "A1", name: "Lucas Andrade", role: "Guia Auxiliar", status: "moving" },
          { id: "P1", name: "Marina", role: "Participante", status: "moving" }
        ],
        route: {
          title: "Travessia Serra Verde",
          difficulty: "Moderada",
          distance: "18 km",
          duration: "2 dias",
          highlights: [
            "Mirante Pedra do Sol",
            "Cachoeira Escondida",
            "Camping noturno com observação de estrelas"
          ],
          ebook: "Guia de Preparação - Serra Verde.pdf"
        },
        boarding: {
          location: "Terminal Rodoviário Trekking Point",
          address: "Av. das Montanhas, 450 - Centro",
          reference: "Em frente à loja Alpina",
          dateTime: "20/07/2024 às 05h30",
          map: {
            description: "Mapa de embarque",
            anchor: { x: 65, y: 40 }
          },
          notes: [
            "Chegar com 30 minutos de antecedência",
            "Levar documento com foto e ficha médica assinada",
            "Bagagens identificadas com etiqueta do evento"
          ]
        }
      },
      documents: [
        { id: "voucher", name: "Voucher de Embarque", available: true },
        { id: "contract", name: "Contrato de Participação", available: false },
        { id: "ebook", name: "E-book Serra Verde", available: true }
      ]
    }
  },
  weather: {
    location: "Serra Verde - Base Refúgio",
    max: 22,
    min: 12,
    humidity: 78,
    wind: 18,
    rainChance: 35,
    moonPhase: "Lua Crescente",
    trend: [12, 14, 18, 20, 22, 19],
    interpretation:
      "Tempo estável com chance moderada de chuva no fim da tarde. Ventos constantes exigem atenção com abrigos e camadas térmicas."
  },
  chat: {
    portal: [
      {
        keywords: ["documento", "voucher", "contrato"],
        response:
          "Seus documentos estão disponíveis na aba Documentos. Basta tocar no botão desejado para simular o download."
      },
      {
        keywords: ["embarque", "ônibus", "ponto"],
        response:
          "O embarque será no Terminal Trekking Point às 05h30. Confira as instruções detalhadas na aba Embarque."
      }
    ],
    trivial: [
      {
        keywords: ["roupa", "vestir", "clima"],
        response:
          "Confira o e-book e a aba MeSeg Clima para recomendações completas de vestuário e camadas térmicas."
      }
    ],
    critical: [
      {
        keywords: ["ajuda", "socorro", "perdido"],
        response:
          "Estou notificando nossa equipe imediatamente. Permaneça visível e compartilhe sua localização se possível."
      }
    ]
  }
};

// ============================
// Estado global da aplicação
// ============================
let currentUser = null;
let alertTimeout = null;
let trackingInterval = null;
let activityLog = [];

// ============================
// Elementos de interface
// ============================
const screens = document.querySelectorAll(".screen");
const tiles = document.querySelectorAll(".button.tile");
const backButtons = document.querySelectorAll(".icon-button.back");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const reservationCodeInput = document.getElementById("reservationCode");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logoutBtn");
const dashboardScreen = document.getElementById("dashboard");

// Módulos
const documentList = document.getElementById("documentList");
const boardingInfo = document.getElementById("boardingInfo");
const generalInfoContent = document.getElementById("generalInfoContent");
const trailMap = document.getElementById("trailMap");
const connectedParticipants = document.getElementById("connectedParticipants");
const auxParticipants = document.getElementById("auxParticipants");
const participantAlerts = document.getElementById("participantAlerts");
const activitySummary = document.getElementById("activitySummary");
const weatherContent = document.getElementById("weatherContent");
const chatHistory = document.getElementById("chatHistory");
const chatForm = document.getElementById("chatForm");
const chatMessage = document.getElementById("chatMessage");
const alertOverlay = document.getElementById("alertOverlay");
const alertMessage = document.getElementById("alertMessage");
const closeAlert = document.getElementById("closeAlert");

// ============================
// Funções utilitárias
// ============================
function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === id);
  });
}

function formatStatus(status) {
  const map = {
    Confirmado: "🟢 Confirmado",
    Pendente: "🟡 Pendente",
    Finalizado: "🔵 Finalizado"
  };
  return map[status] || status;
}

function showAlert(message) {
  alertMessage.textContent = message;
  alertOverlay.hidden = false;
  if (alertTimeout) clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    alertOverlay.hidden = true;
  }, 4000);
}

function renderDocuments() {
  if (!currentUser) return;
  documentList.innerHTML = "";
  const certAvailable = currentUser.event.status === "Finalizado";
  const documents = [...currentUser.documents];
  if (certAvailable) {
    documents.push({ id: "certificate", name: "Certificado de Conclusão", available: true });
  } else {
    documents.push({ id: "certificate", name: "Certificado de Conclusão", available: false });
  }

  documents.forEach((doc) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="meta">
        <strong>${doc.name}</strong>
        <span class="badge ${doc.available ? "available" : "unavailable"}">
          ${doc.available ? "Disponível" : "Indisponível"}
        </span>
      </div>
      <button class="button secondary" ${doc.available ? "" : "disabled"}>
        Baixar
      </button>
    `;
    const button = item.querySelector("button");
    button.addEventListener("click", () => {
      if (doc.available) {
        showAlert(`Download simulado: ${doc.name}`);
      } else {
        showAlert("Este documento ficará disponível após a conclusão do evento.");
      }
    });
    documentList.appendChild(item);
  });
}

function renderBoardingInfo() {
  if (!currentUser) return;
  const { boarding } = currentUser.event;
  boardingInfo.innerHTML = `
    <h3>${boarding.location}</h3>
    <p><strong>Endereço:</strong> ${boarding.address}</p>
    <p><strong>Ponto de referência:</strong> ${boarding.reference}</p>
    <p><strong>Data e horário:</strong> ${boarding.dateTime}</p>
    <div class="mock-map" aria-label="Mapa de embarque">
      <div class="participant-icon guide" style="left:${boarding.map.anchor.x}%; top:${boarding.map.anchor.y}%">🚌</div>
    </div>
    <div class="list" style="margin-top:1rem;">
      ${boarding.notes
        .map((note) => `<div class="badge available" style="justify-content:flex-start">${note}</div>`)
        .join("")}
    </div>
    <div class="actions" style="margin-top:1rem; display:flex; gap:0.5rem;">
      <button class="button secondary" id="viewMap">Visualizar mapa</button>
      <button class="button secondary" id="viewAlerts">Ver alertas</button>
      <button class="button secondary" id="viewInstructions">Instruções</button>
    </div>
  `;

  boardingInfo.querySelector("#viewMap").addEventListener("click", () =>
    showAlert("Abrindo mapa interativo (simulado).")
  );
  boardingInfo.querySelector("#viewAlerts").addEventListener("click", () =>
    showAlert("Alertas de trânsito atualizados (mock).")
  );
  boardingInfo.querySelector("#viewInstructions").addEventListener("click", () =>
    showAlert("Checklist enviado para seu e-mail (simulado).")
  );
}

function renderGeneralInfo() {
  if (!currentUser) return;
  const { route } = currentUser.event;
  generalInfoContent.innerHTML = `
    <h3>${route.title}</h3>
    <p><strong>Dificuldade:</strong> ${route.difficulty}</p>
    <p><strong>Distância total:</strong> ${route.distance}</p>
    <p><strong>Duração prevista:</strong> ${route.duration}</p>
    <h4>Destaques</h4>
    <ul>
      ${route.highlights.map((item) => `<li>${item}</li>`).join("")}
    </ul>
    <button class="button primary" id="openEbook">Abrir e-book</button>
  `;

  generalInfoContent.querySelector("#openEbook").addEventListener("click", () => {
    showAlert(`Abrindo ${route.ebook} (mock).`);
  });
}

function getStatusIcon(status) {
  switch (status) {
    case "moving":
      return "🟢";
    case "idle":
      return "🟡";
    case "offtrack":
      return "🔴";
    default:
      return "⚪";
  }
}

function renderTrailParticipants(listElement, participants) {
  listElement.innerHTML = "";
  participants.forEach((participant) => {
    const li = document.createElement("li");
    li.className = "participant-item";
    li.innerHTML = `
      <div>
        <strong>${participant.name}</strong>
        <small>${participant.role}</small>
      </div>
      <span class="status-indicator">${getStatusIcon(participant.status)}</span>
    `;
    li.addEventListener("click", () => {
      showAlert(
        `${participant.name}: distância ~${participant.distance || 0} m, última atualização ${
          participant.lastUpdate || "há instantes"
        }.`
      );
    });
    listElement.appendChild(li);
  });
}

function renderTrailMap(participants) {
  trailMap.innerHTML = "";
  participants.forEach((participant) => {
    const icon = document.createElement("div");
    icon.className = "participant-icon";
    if (participant.role.includes("Guia")) icon.classList.add("guide");
    icon.textContent = getStatusIcon(participant.status).replace("🟢", "G").replace("🟡", "A").replace("🔴", "!");
    icon.style.left = `${participant.position.x}%`;
    icon.style.top = `${participant.position.y}%`;
    icon.title = `${participant.name} - ${participant.role}`;
    icon.addEventListener("click", () => {
      showAlert(
        `${participant.name}: ${participant.statusText || "Em movimento"}. Distância do guia: ${
          participant.distance || "-"
        } m.`
      );
    });
    trailMap.appendChild(icon);
  });
}

function simulateMovement(participants, alertDistance) {
  // Atualiza posição e status de forma randômica para simulação
  return participants.map((participant) => {
    const updated = { ...participant };
    const deltaX = Math.random() * 4 - 2;
    const deltaY = Math.random() * 4 - 2;
    updated.position = {
      x: Math.min(90, Math.max(10, (participant.position?.x || 50) + deltaX)),
      y: Math.min(90, Math.max(10, (participant.position?.y || 50) + deltaY))
    };

    const distance = Math.round(Math.abs(updated.position.x - 50) * 8);
    updated.distance = distance;
    if (distance > alertDistance) {
      updated.status = "offtrack";
      updated.statusText = "Fora da rota";
      activityLog.push({
        type: "alert",
        message: `${updated.name} ultrapassou o limite de ${alertDistance} m`,
        timestamp: new Date()
      });
      participantAlerts.innerHTML = `<p>⚠️ ${updated.name} está afastado do grupo (${distance} m).</p>`;
      showAlert(`${updated.name} recebeu alerta de afastamento.`);
    } else if (Math.random() > 0.7) {
      updated.status = "idle";
      updated.statusText = "Parado para descanso";
    } else {
      updated.status = "moving";
      updated.statusText = "Em movimento";
    }
    updated.lastUpdate = "há instantes";
    return updated;
  });
}

function startTracking() {
  if (!currentUser) return;
  stopTracking();
  const alertDistance = Number(document.getElementById("alertDistance").value) || 200;
  let participants = currentUser.event.participants.map((p, index) => ({
    ...p,
    position: { x: 30 + index * 15, y: 40 + index * 5 }
  }));

  renderTrailMap(participants);
  renderTrailParticipants(connectedParticipants, participants);
  renderTrailParticipants(auxParticipants, participants);

  trackingInterval = setInterval(() => {
    if (!document.getElementById("trackingToggle").checked) return;
    participants = simulateMovement(participants, alertDistance);
    renderTrailMap(participants);
    renderTrailParticipants(connectedParticipants, participants);
    renderTrailParticipants(auxParticipants, participants);
  }, 5000);
}

function stopTracking() {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
}

function finalizeActivity() {
  const logText = activityLog
    .slice(-5)
    .map((log) => `• ${log.message} (${log.timestamp.toLocaleTimeString()})`)
    .join("<br>");
  activitySummary.innerHTML = `
    <h4>Resumo da atividade</h4>
    <p>Tempo total estimado: 5h20</p>
    <p>Distância percorrida: 17,4 km</p>
    <p>Alertas gerados: ${activityLog.length}</p>
    <div class="summary-log">${logText || "Sem alertas críticos."}</div>
    <button class="button secondary" id="sendLog">Enviar log para central</button>
  `;
  document.getElementById("sendLog").addEventListener("click", () => {
    showAlert("Log enviado para central de segurança (mock). ");
  });
}

function renderWeather() {
  const weather = mockData.weather;
  weatherContent.innerHTML = `
    <h3>${weather.location}</h3>
    <div class="weather-grid">
      <div class="weather-card">
        <span class="label">Máxima</span>
        <span class="value">${weather.max}°C</span>
      </div>
      <div class="weather-card">
        <span class="label">Mínima</span>
        <span class="value">${weather.min}°C</span>
      </div>
      <div class="weather-card">
        <span class="label">Umidade</span>
        <span class="value">${weather.humidity}%</span>
      </div>
      <div class="weather-card">
        <span class="label">Vento</span>
        <span class="value">${weather.wind} km/h</span>
      </div>
      <div class="weather-card">
        <span class="label">Prob. chuva</span>
        <span class="value">${weather.rainChance}%</span>
      </div>
      <div class="weather-card">
        <span class="label">Fase da Lua</span>
        <span class="value">${weather.moonPhase}</span>
      </div>
    </div>
    <div class="mini-chart">
      ${weather.trend
        .map((temp) => `<span class="bar" style="height:${temp * 3}px" title="${temp}°C"></span>`)
        .join("")}
    </div>
    <p style="margin-top:1rem;">${weather.interpretation}</p>
  `;
}

function appendMessage(content, type = "bot") {
  const bubble = document.createElement("div");
  bubble.className = `message ${type}`;
  bubble.innerHTML = content;
  chatHistory.appendChild(bubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function classifyMessage(message) {
  const text = message.toLowerCase();
  const datasets = [
    { type: "critical", data: mockData.chat.critical },
    { type: "portal", data: mockData.chat.portal },
    { type: "trivial", data: mockData.chat.trivial }
  ];
  for (const dataset of datasets) {
    for (const item of dataset.data) {
      if (item.keywords.some((keyword) => text.includes(keyword))) {
        return { type: dataset.type, response: item.response };
      }
    }
  }
  return {
    type: "portal",
    response:
      "Estou aqui para ajudar! Posso orientar sobre documentos, embarque, clima e navegação."
  };
}

function handleChatSubmit(event) {
  event.preventDefault();
  const message = chatMessage.value.trim();
  if (!message) return;
  appendMessage(message, "user");
  chatMessage.value = "";
  const { type, response } = classifyMessage(message);
  setTimeout(() => {
    appendMessage(response, "bot");
    if (type === "critical") {
      showAlert("Equipe de prontidão alertada. Entraremos em contato.");
    }
    if (type === "trivial") {
      activityLog.push({
        type: "chat",
        message: `Usuário recebeu orientação trivial: ${message}`,
        timestamp: new Date()
      });
    }
  }, 600);
}

function applyRoleRestrictions() {
  if (!currentUser) return;
  const isCompanion = currentUser.role === "acompanhante";
  const trailTab = document.querySelector('[data-target="trail"]');
  const documentItems = documentList.querySelectorAll(".list-item");

  if (isCompanion) {
    trailTab.setAttribute("disabled", "true");
    trailTab.classList.add("disabled");
    showAlert("Você está em modo acompanhante. Algumas funções estão limitadas.");
    documentItems.forEach((item) => {
      if (item.textContent.includes("Contrato")) {
        item.querySelector("button").disabled = true;
      }
    });
  } else {
    trailTab.removeAttribute("disabled");
    trailTab.classList.remove("disabled");
  }
}

// ============================
// Eventos
// ============================
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const code = reservationCodeInput.value.trim();
  const pass = passwordInput.value.trim();
  const user = mockData.users[code];
  if (user && user.password === pass) {
    currentUser = JSON.parse(JSON.stringify(user));
    loginError.textContent = "";
    showScreen("dashboard");
    renderDashboard();
  } else {
    loginError.textContent = "Código ou senha inválidos. Tente novamente.";
  }
});

logoutBtn.addEventListener("click", () => {
  stopTracking();
  currentUser = null;
  reservationCodeInput.value = "";
  passwordInput.value = "";
  showScreen("loginScreen");
});

tiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    const target = tile.dataset.target;
    if (tile.hasAttribute("disabled")) {
      showAlert("Função exclusiva para o titular.");
      return;
    }
    showScreen(target);
    if (target === "documents") renderDocuments();
    if (target === "boarding") renderBoardingInfo();
    if (target === "generalInfo") renderGeneralInfo();
    if (target === "trail") startTracking();
    if (target === "weather") renderWeather();
    if (target === "chat" && !chatHistory.dataset.greeted) {
      appendMessage("Como posso ajudar hoje?", "bot");
      chatHistory.dataset.greeted = "true";
    }
  });
});

backButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showScreen("dashboard");
    if (button.dataset.target === "dashboard") {
      finalizeActivity();
    }
  });
});

chatForm.addEventListener("submit", handleChatSubmit);
closeAlert.addEventListener("click", () => {
  alertOverlay.hidden = true;
  if (alertTimeout) clearTimeout(alertTimeout);
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

document.querySelectorAll(".quick-actions .button").forEach((button) => {
  button.addEventListener("click", () => {
    const status = button.dataset.status;
    let message = "";
    if (status === "ok") message = "Status enviado: Estou bem.";
    if (status === "tired") message = "Status enviado: preciso de um ritmo mais leve.";
    if (status === "help") message = "Status enviado: preciso de ajuda imediata!";
    showAlert(message);
    activityLog.push({ type: "quick-action", message, timestamp: new Date() });
  });
});

// ============================
// Renderização do painel
// ============================
function renderDashboard() {
  if (!currentUser) return;
  document.getElementById("clientName").textContent = `Olá, ${currentUser.name}`;
  document.getElementById("routeDate").textContent = `Data do roteiro: ${currentUser.event.date}`;
  document.getElementById("eventStatus").textContent = formatStatus(currentUser.event.status);
  document.getElementById("participantCount").textContent = currentUser.event.participants.length;
  renderDocuments();
  renderBoardingInfo();
  renderGeneralInfo();
  renderWeather();
  activitySummary.innerHTML = "";
  participantAlerts.innerHTML = "";
  activityLog = [];
  applyRoleRestrictions();
  chatHistory.innerHTML = "";
  delete chatHistory.dataset.greeted;
  appendMessage(
    `Olá ${currentUser.name.split(" ")[0]}! Estou aqui para apoiar durante a expedição.`,
    "bot"
  );
}

// ============================
// Rotinas extras simuladas
// ============================
document.getElementById("startActivity").addEventListener("click", () => {
  showAlert("Atividade iniciada. Rastreamento ativo!");
  const startTimeInput = document.getElementById("startTime");
  if (!startTimeInput.value) {
    const now = new Date();
    startTimeInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  }
  activityLog.push({ type: "system", message: "Atividade iniciada", timestamp: new Date() });
});

document.getElementById("markOccurrence").addEventListener("click", () => {
  showAlert("Ocorrência marcada e registrada no log (mock).");
  activityLog.push({ type: "occurrence", message: "Ocorrência registrada", timestamp: new Date() });
});

document.getElementById("sendAlert").addEventListener("click", () => {
  showAlert("Alerta geral enviado a todos os dispositivos (mock).");
  activityLog.push({ type: "alert", message: "Alerta geral emitido", timestamp: new Date() });
});

document.getElementById("takeControl").addEventListener("click", () => {
  showAlert("Controle temporário assumido pelo guia auxiliar (mock).");
  activityLog.push({
    type: "control",
    message: "Guia auxiliar assumiu controle",
    timestamp: new Date()
  });
});

// Inicialização
showScreen("loginScreen");