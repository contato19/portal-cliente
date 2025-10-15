/**
 * Utilidades para navegar entre seções e atualizar estados de exibição.
 */
export function showSection(sectionId) {
  document.querySelectorAll(".card").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });
}

export function enableDashboardNav(callback) {
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => callback(button.dataset.target));
  });
}

export function enableBackButtons(callback) {
  document.querySelectorAll('[data-action="back"]').forEach((button) => {
    button.addEventListener("click", callback);
  });
}