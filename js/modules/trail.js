const STATUS_ICON = {
  moving: "🟢",
  stopped: "🟡",
  "off-track": "🔴",
};

let simulationInterval;

/**
 * Renderiza a experiência da trilha conforme o perfil do usuário logado.
 */
export function renderTrail(role, trailData) {
  const container = document.getElementById("trail-content");
  container.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "trail__panel";
  panel.innerHTML = getPanelMarkup(role, trailData);

  const map = document.createElement("div");
  map.className = "trail__map";
  map.appendChild(createMapMock());

  const participants = document.createElement("div");
  participants.className = "trail__participants";
  participants.innerHTML = `
        <h3>Participantes Conectados</h3>
        <div id="participant-list" class="trail__list"></div>
    `;

  const tracklog = document.createElement("div");
  tracklog.className = "trail__panel";
  tracklog.innerHTML = `
        <h3>Tracklog</h3>
        <ul class="list">
            ${trailData.tracklog.map((item) => `<li>${item.time} · ${item.detail}</li>`).join("")}
        </ul>
    `;

  container.append(panel, map, participants, tracklog);

  renderParticipants(trailData.connected);
  startSimulation(trailData);
  setupTrailActions(role);
}

function getPanelMarkup(role, trailData) {
  const baseControls = `
        <h3>Painel de Controle</h3>
        <div class="trail__controls">
            <label>
                Importar rota (mock)
                <button class="btn btn--secondary" type="button" id="import-route">Importar GPX/KML</button>
            </label>
            <label>
                Janela de atividade
                <div class="trail__actions">
                    <button class="btn btn--ghost" type="button" id="set-start">Definir início às 07h30</button>
                    <button class="btn btn--ghost" type="button" id="set-end">Definir fim às 17h30</button>
                </div>
            </label>
            <label>
                Alertas de distância
                <input type="range" min="50" max="250" value="${trailData.alertDistance}" id="distance-alert" />
                <small class="label">Disparar alerta a partir de ${trailData.alertDistance} metros</small>
            </label>
            <button class="btn btn--primary" type="button" id="toggle-tracking">Ativar rastreamento</button>
        </div>
    `;

  if (role === "principal") {
    return `
            ${baseControls}
            <div class="trail__actions">
                <button class="btn btn--primary" type="button" id="start-activity">Iniciar atividade</button>
                <button class="btn btn--secondary" type="button" id="send-alert">Enviar alerta ao grupo</button>
                <button class="btn btn--ghost" type="button" id="report-incident">Marcar ocorrência</button>
            </div>
        `;
  }

  if (role === "auxiliar") {
    return `
            <h3>Visão do Guia Auxiliar</h3>
            ${baseControls}
            <div class="trail__actions">
                <button class="btn btn--secondary" type="button" id="assist-control">Assumir controle temporário</button>
                <button class="btn btn--ghost" type="button" id="send-warning">Emitir alerta ao Guia</button>
            </div>
        `;
  }

  return `
        <h3>Visão do Participante</h3>
        <p>Você segue a rota indicada pelo guia. Ative sua localização para compartilhar o progresso.</p>
        <div class="trail__actions">
            <button class="btn btn--primary" type="button" id="share-location">Ativar minha localização</button>
            <button class="btn btn--secondary" type="button" id="status-ok">🟢 Estou bem</button>
            <button class="btn btn--secondary" type="button" id="status-tired">🟠 Estou cansado</button>
            <button class="btn btn--secondary" type="button" id="status-help">🔴 Preciso de ajuda</button>
        </div>
        <section class="trail__panel">
            <h4>Resumo da atividade</h4>
            <p>Tempo em trilha: 1h45 · Distância percorrida: 6,4 km</p>
            <p>Alertas emitidos: 1 (distância do grupo)</p>
            <p>Feedback: "Trilha exigente, porém segura com apoio dos guias."</p>
        </section>
    `;
}

function createMapMock() {
  const route = document.createElement("div");
  route.className = "route-line";

  trailDots().forEach((dot) => route.appendChild(dot));
  return route;
}

function trailDots() {
  return [
    createDot("guide", "guide", "Guia", "moving", 5),
    createDot("aux1", "aux", "Aux", "moving", 25),
    createDot("hiker1", "P1", "Ana", "moving", 45),
    createDot("hiker2", "P2", "João", "stopped", 65),
    createDot("hiker3", "P3", "Camila", "off-track", 82),
  ];
}

function createDot(id, label, name, status, position) {
  const dot = document.createElement("span");
  dot.className = "participant-dot";
  dot.dataset.id = id;
  dot.dataset.status = status;
  dot.style.left = `${position}%`;
  dot.title = `${name} (${STATUS_ICON[status]})`;
  dot.textContent = label;
  dot.addEventListener("click", () => showParticipantDetail(id));
  return dot;
}

function renderParticipants(participants) {
  const list = document.getElementById("participant-list");
  list.innerHTML = participants
    .map(
      (participant) => `
            <article class="list__item">
                <div>
                    <strong>${participant.name}</strong>
                    <small class="label">${participant.role.toUpperCase()}</small>
                </div>
                <div>
                    <p>${STATUS_ICON[participant.status]} ${formatStatus(participant.status)}</p>
                    <small class="label">Distância: ${participant.distance} m · ETA ${participant.eta}</small>
                </div>
            </article>
        `,
    )
    .join("");
}

function formatStatus(status) {
  switch (status) {
    case "moving":
      return "Em movimento";
    case "stopped":
      return "Parado";
    default:
      return "Fora da rota";
  }
}

function startSimulation(trailData) {
  clearInterval(simulationInterval);
  simulationInterval = setInterval(() => {
    trailData.connected = trailData.connected.map((participant) => {
      const delta = Math.round(Math.random() * 20);
      const updatedDistance = Math.max(
        0,
        participant.distance + (Math.random() > 0.5 ? delta : -delta),
      );
      let status = participant.status;

      if (updatedDistance > trailData.alertDistance) {
        status = "off-track";
      } else if (delta < 5) {
        status = "stopped";
      } else {
        status = "moving";
      }

      return {
        ...participant,
        distance: updatedDistance,
        status,
        eta:
          status === "moving"
            ? `${Math.max(1, Math.round(updatedDistance / 15))} min`
            : "--",
        lastUpdate: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    renderParticipants(trailData.connected);
    updateDots(trailData.connected);
  }, 7000);
}

function updateDots(participants) {
  participants.forEach((participant) => {
    const dot = document.querySelector(
      `.participant-dot[data-id="${participant.id}"]`,
    );
    if (!dot) return;
    dot.dataset.status = participant.status;
    dot.title = `${participant.name} (${STATUS_ICON[participant.status]})`;
  });
}

function showParticipantDetail(participantId) {
  const participant = document
    .getElementById("participant-list")
    .querySelectorAll(".list__item")[
    Array.from(document.querySelectorAll(".participant-dot")).findIndex(
      (dot) => dot.dataset.id === participantId,
    )
  ];

  if (participant) {
    alert(
      `Detalhes enviados para o painel: ${participant.querySelector("strong").textContent}.`,
    );
  }
}

function setupTrailActions(role) {
  const trackerButton = document.getElementById("toggle-tracking");
  if (trackerButton) {
    trackerButton.addEventListener("click", () => {
      const active = trackerButton.dataset.active === "true";
      trackerButton.dataset.active = (!active).toString();
      trackerButton.textContent = active
        ? "Ativar rastreamento"
        : "Desativar rastreamento";
    });
  }

  const distanceInput = document.getElementById("distance-alert");
  if (distanceInput) {
    distanceInput.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      const helper = event.target.parentElement.querySelector(".label");
      if (helper) {
        helper.textContent = `Disparar alerta a partir de ${value} metros`;
      }
    });
  }

  const routeButton = document.getElementById("import-route");
  if (routeButton) {
    routeButton.addEventListener("click", () => {
      alert("Importação de rota simulada (arquivo GPX/KML).");
    });
  }

  const startButton = document.getElementById("set-start");
  if (startButton) {
    startButton.addEventListener("click", () => {
      alert("Horário de início configurado para 07h30 (mock).");
    });
  }

  const endButton = document.getElementById("set-end");
  if (endButton) {
    endButton.addEventListener("click", () => {
      alert("Horário de término configurado para 17h30 (mock).");
    });
  }

  if (role === "principal") {
    document.getElementById("start-activity").addEventListener("click", () => {
      alert("Atividade iniciada. Rastreamento em tempo real ativado (mock).");
    });
    document.getElementById("send-alert").addEventListener("click", () => {
      alert("Alerta visual enviado para todos os dispositivos.");
    });
    document.getElementById("report-incident").addEventListener("click", () => {
      alert("Ocorrência registrada e repassada para a central MeSeg.");
    });
  }

  if (role === "auxiliar") {
    document.getElementById("assist-control").addEventListener("click", () => {
      alert("Controle temporário assumido por 10 minutos.");
    });
    document.getElementById("send-warning").addEventListener("click", () => {
      alert("Alerta ao guia principal enviado (mock).");
    });
  }

  if (role === "participante") {
    document.getElementById("share-location").addEventListener("click", () => {
      alert("Sua localização está sendo compartilhada com os guias (mock).");
    });
    document.getElementById("status-ok").addEventListener("click", () => {
      alert("Status enviado: Estou bem.");
    });
    document.getElementById("status-tired").addEventListener("click", () => {
      alert("Status enviado: Estou cansado.");
    });
    document.getElementById("status-help").addEventListener("click", () => {
      alert("Status enviado: Preciso de ajuda. Guia notificado!");
    });
  }
}

export function destroyTrailSimulation() {
  clearInterval(simulationInterval);
}