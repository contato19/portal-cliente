import { mockUsers, mockEvents, mockWeather, mockTrail } from "./data.js";
import {
  showSection,
  enableDashboardNav,
  enableBackButtons,
} from "./modules/navigation.js";
import { renderDocuments } from "./modules/documents.js";
import {
  renderBoarding,
  setupBoardingInteractions,
} from "./modules/boarding.js";
import { renderGeneralInfo } from "./modules/info.js";
import { renderTrail, destroyTrailSimulation } from "./modules/trail.js";
import { renderWeather } from "./modules/weather.js";
import { setupChat } from "./modules/chat.js";

let currentUser = null;
let currentEvent = null;
let trailSnapshot = null;
let activeTrailRole = "principal";
let trailTabsInitialized = false;

const rolePermissions = {
  titular: new Set([
    "documents",
    "boarding",
    "trail",
    "weather",
    "info",
    "chat",
  ]),
  acompanhante: new Set(["documents", "boarding", "weather", "info", "chat"]),
};

const loginForm = document.getElementById("login-form");
const bookingCodeField = document.getElementById("booking-code");
const passwordField = document.getElementById("password");
const loginFeedback = document.getElementById("login-feedback");
const logoutButton = document.getElementById("logout-btn");

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", handleLogout);

enableDashboardNav(handleNavigation);
enableBackButtons(() => {
  destroyTrailSimulation();
  showSection("dashboard");
});
setupBoardingInteractions();

/**
 * Realiza autenticação mock validando código e senha padrão.
 */
function handleLogin(event) {
  event.preventDefault();
  const code = bookingCodeField.value.trim();
  const password = passwordField.value.trim();

  const user = mockUsers[code];
  if (!user || user.password !== password) {
    loginFeedback.textContent = "Código ou senha inválidos. Tente novamente.";
    return;
  }

  currentUser = user;
  currentEvent = mockEvents[user.eventId];
  trailSnapshot = JSON.parse(JSON.stringify(mockTrail));
  activeTrailRole =
    currentUser.role === "titular" ? "principal" : "participante";

  populateDashboard();
  setupChat(currentUser);
  renderGeneralInfo(currentEvent);
  renderBoarding(currentEvent.boarding);
  renderWeather(mockWeather);
  initTrailTabs();
  highlightTrailTab();

  loginForm.reset();
  loginFeedback.textContent = "";
  showSection("dashboard");
}

/**
 * Atualiza cards e botões do painel principal com dados mockados.
 */
function populateDashboard() {
  document.getElementById("client-name").textContent = currentUser.name;
  document.getElementById("event-date").textContent = currentEvent.date;

  const statusEl = document.getElementById("event-status");
  statusEl.textContent = currentEvent.status;
  statusEl.dataset.status = currentEvent.status;

  document.getElementById("event-participants").textContent =
    `${currentEvent.participants.length} pessoas`;

  document.querySelectorAll(".nav-btn").forEach((button) => {
    const allowed = rolePermissions[currentUser.role].has(
      button.dataset.target,
    );
    button.disabled = !allowed;
    button.classList.toggle("nav-btn--disabled", !allowed);
  });
}

/**
 * Controla a navegação entre módulos aplicando permissões por perfil.
 */
function handleNavigation(target) {
  if (!rolePermissions[currentUser.role].has(target)) {
    alert("Recurso disponível apenas para o titular da reserva.");
    return;
  }

  destroyTrailSimulation();

  switch (target) {
    case "documents":
      renderDocuments(currentEvent.documents, currentEvent.status);
      break;
    case "boarding":
      renderBoarding(currentEvent.boarding);
      break;
    case "trail":
      highlightTrailTab();
      renderTrail(activeTrailRole, trailSnapshot);
      break;
    case "weather":
      renderWeather(mockWeather);
      break;
    case "info":
      renderGeneralInfo(currentEvent);
      break;
    case "chat":
      break;
    default:
      return;
  }

  showSection(target);
}

/**
 * Limpa estado da sessão mock e retorna para a tela de login.
 */
function handleLogout() {
  destroyTrailSimulation();
  currentUser = null;
  currentEvent = null;
  trailSnapshot = null;
  activeTrailRole = "principal";
  showSection("login-section");
}

/**
 * Configura as abas de papéis do módulo de trilha para simulações.
 */
function initTrailTabs() {
  if (trailTabsInitialized) return;
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activeTrailRole = button.dataset.role;
      highlightTrailTab();
      renderTrail(activeTrailRole, trailSnapshot);
    });
  });
  trailTabsInitialized = true;
}

function highlightTrailTab() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === activeTrailRole);
  });
}