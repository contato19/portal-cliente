// ui.js - funções de interface para montar cada tela do portal

/**
 * Renderiza a tela de login com suporte a mensagens de erro.
 * @param {HTMLElement} container
 * @param {{ onSubmit: Function, error?: string }} props
 */
export function renderLogin(container, { onSubmit, error }) {
  container.innerHTML = `
    <section class="login-screen fade-in">
      <div class="login-card" role="form">
        <h2>Boas-vindas ao MeSeg Trekking</h2>
        <p class="helper-text">Insira o código de reserva e sua senha para acessar o portal.</p>
        ${error ? `<div class="alert-banner" role="alert">${error}</div>` : ''}
        <div class="input-group">
          <label for="codigoReserva">Código de reserva</label>
          <input id="codigoReserva" name="codigo" type="text" placeholder="Ex.: TRK-78421" required>
        </div>
        <div class="input-group">
          <label for="senhaAcesso">Senha</label>
          <input id="senhaAcesso" name="senha" type="password" placeholder="Digite sua senha" required>
        </div>
        <button id="btnLogin" class="btn btn-primary">Entrar</button>
        <p class="helper-text">Dica: use <strong>TRK-78421</strong> com senhas <strong>trek2024</strong> ou <strong>amigo2024</strong>.</p>
      </div>
    </section>
  `;

  container.querySelector('#btnLogin').addEventListener('click', () => {
    const codigo = container.querySelector('#codigoReserva').value.trim();
    const senha = container.querySelector('#senhaAcesso').value.trim();
    onSubmit({ codigo, senha });
  });
}

/**
 * Renderiza o painel principal com dados do usuário e atalhos.
 */
export function renderDashboard(container, { user, onNavigate, onShowInfo }) {
  const { roteiro } = user;
  const statusClass = roteiro.status === 'Confirmado' ? 'status-confirmed' : roteiro.status === 'Pendente' ? 'status-pending' : 'status-finished';

  container.innerHTML = `
    <section class="fade-in">
      <article class="card">
        <div class="card-header">
          <div>
            <p class="helper-text">Olá,</p>
            <h2 class="card-title">${user.nome}</h2>
          </div>
          <span class="badge">${user.role === 'titular' ? 'Titular' : 'Acompanhante'}</span>
        </div>
        <div class="info-row"><span>Roteiro</span><span>${roteiro.nome}</span></div>
        <div class="info-row"><span>Data</span><span>${formatDate(roteiro.data)}</span></div>
        <div class="info-row"><span>Status</span><span class="status-tag ${statusClass}">${roteiro.status}</span></div>
        <div class="info-row"><span>Participantes</span><span>${roteiro.participantes}</span></div>
      </article>

      <div class="grid-two-columns">
        <button class="btn btn-primary" data-action="documents">📄 Documentos</button>
        <button class="btn btn-secondary" data-action="boarding">🧭 Embarque</button>
        <button class="btn btn-secondary" data-action="messages">💬 Mensagens</button>
        <button class="btn btn-outline" data-action="info">ℹ️ Informações gerais</button>
      </div>

      <article class="card">
        <h3 class="card-title">Resumo do roteiro</h3>
        <p>${roteiro.resumo}</p>
      </article>
    </section>
  `;

  container.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'info') {
        onShowInfo();
      } else {
        onNavigate(action);
      }
    });
  });
}

/**
 * Renderiza a seção de documentos com simulação de download.
 */
export function renderDocuments(container, { documentos, onDownload }) {
  container.innerHTML = `
    <section class="fade-in">
      <h2 class="section-title">Documentos</h2>
      <div class="document-list">
        ${documentos
          .map((doc) => `
            <div class="document-item" data-id="${doc.id}">
              <div class="document-meta">
                <strong>${doc.nome}</strong>
                <span class="document-status">${doc.disponivel ? 'Disponível para download' : 'Disponível após conclusão'}</span>
              </div>
              <button class="btn btn-secondary" ${!doc.disponivel ? 'disabled' : ''}>Baixar</button>
            </div>
          `)
          .join('')}
      </div>
    </section>
  `;

  container.querySelectorAll('.document-item').forEach((item) => {
    item.querySelector('button').addEventListener('click', () => {
      const id = item.dataset.id;
      onDownload(id);
    });
  });
}

/**
 * Renderiza as informações de embarque.
 */
export function renderBoarding(container, { boarding, onViewMap, onAlert }) {
  container.innerHTML = `
    <section class="fade-in">
      <article class="card">
        <h2 class="card-title">Ponto de encontro</h2>
        <p><strong>${boarding.local}</strong></p>
        <p>${boarding.endereco}</p>
        <p class="helper-text">Referência: ${boarding.referencia}</p>
        <p class="helper-text">Data e horário: ${boarding.dataHora}</p>
        <div class="boarding-map" role="img" aria-label="Mapa ilustrativo do ponto de encontro"></div>
        <div class="timeline">
          ${boarding.observacoes
            .map((obs) => `<div class="timeline-item"><p>${obs}</p></div>`)
            .join('')}
        </div>
        <div class="grid-two-columns" style="margin-top: 1rem;">
          <button class="btn btn-primary" data-action="mapa">Ver mapa</button>
          <button class="btn btn-secondary" data-action="alertas">Alertas e instruções</button>
        </div>
      </article>
    </section>
  `;

  container.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'mapa') onViewMap();
      if (action === 'alertas') onAlert();
    });
  });
}

/**
 * Renderiza o módulo de trilha MeSegTrail, adaptado conforme o papel do usuário.
 */
export function renderTrail(container, { trailState, userRole, onToggleTracking, onStartActivity, onQuickAction, onParticipantFocus, onTriggerAlert }) {
  const { rota, participantes, historicoAlertas } = trailState;

  container.innerHTML = `
    <section class="fade-in">
      <article class="card">
        <div class="card-header">
          <h2 class="card-title">Controle da Rota</h2>
          <span class="badge">${rota.nomeArquivo}</span>
        </div>
        <div class="info-row"><span>Distância total</span><span>${rota.distanciaTotalKm} km</span></div>
        <div class="info-row"><span>Alerta de afastamento</span><span>${rota.alertaDistanciaMetros} m</span></div>
        ${userRole === 'titular' ? `
          <div class="grid-two-columns" style="margin-top: 1rem;">
            <button class="btn btn-secondary" data-action="toggle-tracking">${trailState.trackingAtivo ? 'Desativar rastreamento' : 'Ativar rastreamento'}</button>
            <button class="btn btn-primary" data-action="start-activity">Iniciar atividade</button>
          </div>
        ` : ''}
      </article>

      <article class="card">
        <h3 class="card-title">Mapa colaborativo</h3>
        <div class="trail-map" role="img" aria-label="Mapa ilustrativo com posição dos participantes">
          ${participantes
            .map((p, index) => {
              const positionClass = index === 0 ? 'guide' : '';
              return `<div class="trail-node ${positionClass}" data-label="${p.nome.split(' ')[0]}">${statusEmoji(p.status)}</div>`;
            })
            .join('')}
        </div>
        <div class="participant-status">
          ${participantes
            .map(
              (p) => `
              <div class="participant-card" data-id="${p.id}">
                <div class="status-dot ${statusColor(p.status)}"></div>
                <div>
                  <strong>${p.nome}</strong>
                  <small>${p.papel} • Última posição: ${p.ultimaPosicao}</small>
                </div>
                <button class="btn btn-secondary" ${userRole === 'participante' ? 'disabled' : ''}>Ver</button>
              </div>
            `
            )
            .join('')}
        </div>
      </article>

      ${userRole !== 'participante'
        ? `
        <article class="card">
          <h3 class="card-title">Alertas recentes</h3>
          <div class="alert-list">
            ${historicoAlertas
              .map(
                (alert) => `
                <div class="document-item">
                  <div>
                    <strong>${alert.descricao}</strong>
                    <p class="helper-text">${alert.horario} • ${alert.severidade === 'alto' ? '🔴' : '🟡'} Severidade ${alert.severidade}</p>
                  </div>
                  <button class="btn btn-outline" data-alert="${alert.id}">Acusar recebimento</button>
                </div>
              `
              )
              .join('')}
          </div>
        </article>
      `
        : ''}

      <article class="card">
        <h3 class="card-title">Interações rápidas</h3>
        <div class="quick-actions">
          ${quickActionButtons(userRole)}
        </div>
      </article>
    </section>
  `;

  if (userRole === 'titular') {
    container.querySelector('[data-action="toggle-tracking"]').addEventListener('click', onToggleTracking);
    container.querySelector('[data-action="start-activity"]').addEventListener('click', onStartActivity);
  }

  container.querySelectorAll('.participant-card').forEach((card) => {
    const btn = card.querySelector('button');
    if (btn) {
      btn.addEventListener('click', () => onParticipantFocus(card.dataset.id));
    }
  });

  container.querySelectorAll('.quick-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => onQuickAction(btn.dataset.id));
  });

  container.querySelectorAll('[data-alert]').forEach((btn) => {
    btn.addEventListener('click', () => onTriggerAlert(btn.dataset.alert));
  });
}

/**
 * Renderiza o módulo de clima MeSeg Clima.
 */
export function renderWeather(container, { weather }) {
  container.innerHTML = `
    <section class="fade-in">
      <article class="card">
        <h2 class="card-title">Previsão para ${weather.destino}</h2>
        <div class="weather-grid">
          <div class="weather-card">
            <div class="weather-icon">🌤️</div>
            <div class="weather-details">
              <p><strong>Máx:</strong> ${weather.previsao.maxima}°C • <strong>Mín:</strong> ${weather.previsao.minima}°C</p>
              <p>Umidade: ${weather.previsao.umidade}% • Vento: ${weather.previsao.vento} km/h</p>
              <p>Prob. chuva: ${weather.previsao.probabilidadeChuva}% • Lua: ${weather.previsao.faseLua}</p>
            </div>
          </div>
          <div class="weather-chart">
            ${weather.tendenciaHoras
              .map(
                (item) => `
                <div class="weather-bar" style="height: ${item.temp * 3}px">
                  <span>${item.hora}</span>
                </div>
              `
              )
              .join('')}
          </div>
        </div>
      </article>
      <article class="card">
        <h3 class="card-title">Leitura do guia</h3>
        <p>${weather.comentarioGuia}</p>
      </article>
    </section>
  `;
}

/**
 * Renderiza um painel com informações gerais e materiais.
 */
export function renderGeneralInfo(container, { user, onDownloadEbook }) {
  container.innerHTML = `
    <section class="fade-in">
      <article class="card">
        <h2 class="card-title">Informações gerais</h2>
        <p>${user.roteiro.resumo}</p>
        <ul>
          <li>Duração: 4 dias / 3 noites</li>
          <li>Nível de esforço: Moderado</li>
          <li>Checklist incluso no e-book oficial</li>
        </ul>
        <button class="btn btn-primary" id="btnEbook">Baixar e-book</button>
      </article>
    </section>
  `;

  container.querySelector('#btnEbook').addEventListener('click', onDownloadEbook);
}

// Utilitários -------------------------------

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function statusEmoji(status) {
  if (status === 'fora-rota') return '🔴';
  if (status === 'parado') return '🟡';
  return '🟢';
}

function statusColor(status) {
  if (status === 'fora-rota') return 'red';
  if (status === 'parado') return 'yellow';
  return 'green';
}

function quickActionButtons(role) {
  if (role === 'participante') {
    return `
      <button class="quick-action quick-action-btn" data-id="ok">🟢 Estou bem</button>
      <button class="quick-action quick-action-btn" data-id="tired">🟠 Estou cansado</button>
      <button class="quick-action quick-action-btn" data-id="help">🔴 Preciso de ajuda</button>
    `;
  }
  return `
    <button class="quick-action quick-action-btn" data-id="ok">Confirmar grupo</button>
    <button class="quick-action quick-action-btn" data-id="tired">Planejar pausa</button>
    <button class="quick-action quick-action-btn" data-id="help">Emitir alerta</button>
  `;
}