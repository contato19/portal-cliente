/**
 * Renderiza informações de embarque e interações do módulo.
 */
export function renderBoarding(boarding) {
  const container = document.getElementById("boarding-details");
  container.innerHTML = `
        <section>
            <strong>Local de Embarque</strong>
            <p>${boarding.location}</p>
        </section>
        <section>
            <strong>Endereço</strong>
            <p>${boarding.address}</p>
            <small class="label">Referência: ${boarding.reference}</small>
        </section>
        <section class="boarding__map-info">
            <strong>Mapa ilustrativo</strong>
            <p>${boarding.mapHint}</p>
        </section>
        <section>
            <strong>Data e Horário</strong>
            <p>${boarding.datetime}</p>
        </section>
        <section>
            <strong>Observações importantes</strong>
            <p>${boarding.observations}</p>
        </section>
        <section>
            <strong>Alertas rápidos</strong>
            <ul class="list">
                ${boarding.alerts.map((alert) => `<li>• ${alert}</li>`).join("")}
            </ul>
        </section>
    `;
}

export function setupBoardingInteractions() {
  const mapButton = document.getElementById("view-map");
  const alertsButton = document.getElementById("view-alerts");
  const mockMap = document.getElementById("mock-map");

  if (!mapButton.dataset.bound) {
    mapButton.addEventListener("click", () => {
      mockMap.textContent = "📍 Terminal Rodoviário - Entrada Norte";
      mockMap.classList.toggle("active");
    });
    mapButton.dataset.bound = "true";
  }

  if (!alertsButton.dataset.bound) {
    alertsButton.addEventListener("click", () => {
      alert(
        "Alerta sonoro simulado: equipe avisada sobre conferência de documentos!",
      );
    });
    alertsButton.dataset.bound = "true";
  }
}