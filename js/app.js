// app.js - orquestração do protótipo, integrando dados mockados, UI e lógica simulada
import {
  mockUsers,
  mockDocuments,
  mockBoarding,
  mockTrailControl,
  mockWeather,
  chatKnowledgeBase,
  quickResponses
} from './data.js';

import {
  renderLogin,
  renderDashboard,
  renderDocuments,
  renderBoarding,
  renderTrail,
  renderWeather,
  renderGeneralInfo
} from './ui.js';

const viewContainer = document.getElementById('viewContainer');
const navButtons = document.querySelectorAll('.nav-item');
const backButton = document.getElementById('backButton');
const chatWidget = document.getElementById('chatWidget');
const toggleChatButton = document.getElementById('toggleChat');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const appTitle = document.getElementById('appTitle');

// Estado centralizado da aplicação
const appState = {
  currentUser: null,
  currentView: 'login',
  trailState: { ...deepClone(mockTrailControl), trackingAtivo: false },
  chatLog: [],
  intervals: []
};

// Inicialização do aplicativo
init();

function init() {
  // Esconde itens que só fazem sentido após login
  document.querySelector('.bottom-nav').classList.add('hidden');
  backButton.classList.add('hidden');
  chatWidget.classList.add('hidden');

  renderLogin(viewContainer, { onSubmit: handleLogin, error: null });
  setupNavigation();
  setupChat();
  backButton.addEventListener('click', () => navigate('dashboard'));
}

// --- Gestão de navegação e layout ---
function setupNavigation() {
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      navigate(target);
    });
  });
}

function setActiveNav(target) {
  navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.target === target));
}

function navigate(target) {
  if (!appState.currentUser && target !== 'login') {
    renderLogin(viewContainer, { onSubmit: handleLogin, error: 'Faça login para acessar o portal.' });
    return;
  }

  appState.currentView = target;
  setActiveNav(target);

  switch (target) {
    case 'dashboard':
      appTitle.textContent = 'Painel principal';
      renderDashboard(viewContainer, {
        user: appState.currentUser,
        onNavigate: (section) => {
          if (section === 'documents') navigate('documents');
          if (section === 'boarding') navigate('boarding');
          if (section === 'messages') toggleChatVisibility(true);
        },
        onShowInfo: () => navigate('general-info')
      });
      break;
    case 'documents':
      appTitle.textContent = 'Documentos';
      renderDocuments(viewContainer, {
        documentos: getDocumentsForUser(),
        onDownload: simulateDownload
      });
      break;
    case 'boarding':
      appTitle.textContent = 'Informações de embarque';
      renderBoarding(viewContainer, {
        boarding: mockBoarding[appState.currentUser.codigoReserva],
        onViewMap: () => alert('Abrindo mapa interativo (simulado).'),
        onAlert: () => alert('Envio de instruções por e-mail (simulado).')
      });
      break;
    case 'trail':
      appTitle.textContent = 'MeSegTrail';
      renderTrail(viewContainer, {
        trailState: appState.trailState,
        userRole: appState.currentUser.role === 'acompanhante' ? 'participante' : 'titular',
        onToggleTracking: handleToggleTracking,
        onStartActivity: handleStartActivity,
        onQuickAction: handleQuickAction,
        onParticipantFocus: handleParticipantFocus,
        onTriggerAlert: handleAlertAcknowledgement
      });
      break;
    case 'weather':
      appTitle.textContent = 'MeSeg Clima';
      renderWeather(viewContainer, { weather: mockWeather });
      break;
    case 'general-info':
      appTitle.textContent = 'Informações gerais';
      renderGeneralInfo(viewContainer, {
        user: appState.currentUser,
        onDownloadEbook: () => simulateDownload('ebook')
      });
      break;
    default:
      appTitle.textContent = 'Portal do Cliente';
      renderLogin(viewContainer, { onSubmit: handleLogin, error: null });
  }

  backButton.classList.toggle('hidden', target === 'dashboard' || target === 'login');
}

// --- Login e dados do usuário ---
function handleLogin({ codigo, senha }) {
  const user = mockUsers.find((u) => u.codigoReserva === codigo && u.senha === senha);
  if (!user) {
    renderLogin(viewContainer, {
      onSubmit: handleLogin,
      error: 'Código ou senha inválidos. Tente novamente.'
    });
    return;
  }

  appState.currentUser = user;
  enterPortal();
}

function enterPortal() {
  document.querySelector('.bottom-nav').classList.remove('hidden');
  chatWidget.classList.remove('hidden');
  appTitle.textContent = 'Painel principal';
  navigate('dashboard');
  setupTrailSimulation();
  appendChatMessage('ai', 'Olá! Sou sua assistente virtual da expedição. Em que posso ajudar hoje?');
}

function getDocumentsForUser() {
  const docs = deepClone(mockDocuments[appState.currentUser.codigoReserva]);
  if (appState.currentUser.roteiro.status === 'Finalizado') {
    const certificado = docs.find((doc) => doc.id === 'certificado');
    if (certificado) certificado.disponivel = true;
  }
  if (appState.currentUser.role === 'acompanhante') {
    return docs.filter((doc) => doc.id !== 'contrato');
  }
  return docs;
}

// --- Módulo de trilha ---
function setupTrailSimulation() {
  clearIntervals();
  const intervalId = setInterval(() => {
    appState.trailState.participantes = appState.trailState.participantes.map((p, index) => {
      if (index === 0) return p; // guia principal permanece referência
      const fluctuation = (Math.random() * 0.1).toFixed(2);
      const newDistance = Math.max(0, p.distancia + Number(fluctuation));
      const status = newDistance > 0.4 ? 'fora-rota' : newDistance > 0.25 ? 'parado' : 'movimento';
      return {
        ...p,
        distancia: Number(newDistance.toFixed(2)),
        status,
        tempoEstimado: status === 'movimento' ? `${Math.ceil(newDistance * 10)} min` : '—'
      };
    });

    if (appState.currentView === 'trail') {
      navigate('trail');
    }
  }, 12000);

  appState.intervals.push(intervalId);
}

function handleToggleTracking() {
  appState.trailState.trackingAtivo = !appState.trailState.trackingAtivo;
  alert(`Rastreamento ${appState.trailState.trackingAtivo ? 'ativado' : 'desativado'} (simulação).`);
  if (appState.currentView === 'trail') navigate('trail');
}

function handleStartActivity() {
  alert('Atividade iniciada! Tracklog será salvo ao final (simulação).');
}

function handleQuickAction(actionId) {
  const response = quickResponses.find((item) => item.id === actionId);
  if (!response) return;
  alert(`${response.label} • ${response.descricao}`);
  appendChatMessage('ai', `Registro atualizado: ${response.label}. Informei a equipe de apoio.`);
}

function handleParticipantFocus(participantId) {
  const participant = appState.trailState.participantes.find((p) => p.id === participantId);
  if (!participant) return;
  alert(`${participant.nome} está ${participant.status} a ${participant.distancia} km do guia. Última posição: ${participant.ultimaPosicao}.`);
}

function handleAlertAcknowledgement(alertId) {
  alert(`Alerta ${alertId} marcado como tratado (simulação).`);
}

// --- Documentos e downloads ---
function simulateDownload(documentId) {
  const doc = getDocumentsForUser().find((d) => d.id === documentId);
  if (!doc || !doc.disponivel) {
    alert('Documento indisponível no momento.');
    return;
  }
  alert(`Baixando ${doc.nome} (${doc.tipo}) - simulação.`);
}

// --- Chat IA ---
function setupChat() {
  toggleChatButton.addEventListener('click', () => toggleChatVisibility());
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    chatInput.value = '';
    appendChatMessage('user', message);
    respondToMessage(message);
  });
}

function toggleChatVisibility(forceOpen = false) {
  if (forceOpen) {
    chatWidget.classList.remove('minimized');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    toggleChatButton.textContent = '−';
    return;
  }
  chatWidget.classList.toggle('minimized');
  toggleChatButton.textContent = chatWidget.classList.contains('minimized') ? '+' : '−';
}

function appendChatMessage(sender, text, type = 'portal') {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message', sender);
  if (sender === 'ai') {
    messageEl.dataset.type = type;
  }
  messageEl.innerHTML = text;
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  appState.chatLog.push({ sender, text, type, timestamp: new Date().toISOString() });
}

function respondToMessage(message) {
  const classification = classifyMessage(message);
  appendChatMessage('ai', classification.response, classification.type);
  if (classification.type === 'critico') {
    chatWidget.classList.add('shake');
    setTimeout(() => chatWidget.classList.remove('shake'), 600);
    alert('Equipe de atendimento notificada (simulado).');
  }
}

function classifyMessage(message) {
  const categories = ['critico', 'portal', 'trivial'];
  for (const category of categories) {
    const rules = chatKnowledgeBase[category];
    for (const rule of rules) {
      if (rule.pergunta.test(message)) {
        return { type: category, response: rule.resposta };
      }
    }
  }
  return {
    type: 'portal',
    response: 'Estou aqui para ajudar com dúvidas sobre o seu roteiro. Você pode perguntar sobre documentos, clima ou embarque.'
  };
}

// --- Utilitários ---
function clearIntervals() {
  appState.intervals.forEach((id) => clearInterval(id));
  appState.intervals = [];
}

// Garante que os intervalos sejam limpos ao recarregar a página
window.addEventListener('beforeunload', clearIntervals);

function deepClone(data) {
  if (typeof structuredClone === 'function') {
    return structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
}
