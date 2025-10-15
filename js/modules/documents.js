/**
 * Renderização e interação com documentos mockados.
 */
export function renderDocuments(documents, status) {
  const list = document.getElementById("document-list");
  list.innerHTML = "";

  documents.forEach((document) => {
    const item = document.createElement("li");
    item.className = "list__item";

    const info = document.createElement("div");
    info.innerHTML = `<strong>${document.name}</strong><small class="label">Formato: PDF</small>`;

    const badge = document.createElement("span");
    badge.className = `badge ${document.available ? "badge--available" : "badge--locked"}`;
    badge.textContent = document.available ? "Disponível" : "Indisponível";

    const button = document.createElement("button");
    button.className = "btn btn--secondary";
    button.type = "button";
    button.textContent = "Download";
    button.disabled = !document.available;
    button.addEventListener("click", () => {
      alert(`Iniciando download do ${document.name} (mock).`);
    });

    if (document.id === "certificate" && status !== "Finalizado") {
      badge.textContent = "Liberado após conclusão";
      button.disabled = true;
    }

    item.append(info, badge, button);
    list.appendChild(item);
  });
}