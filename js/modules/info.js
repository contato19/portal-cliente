/**
 * Renderiza informações gerais do roteiro.
 */
export function renderGeneralInfo(event) {
  const container = document.getElementById("general-info");
  container.innerHTML = `
        <section>
            <h3>Resumo do Roteiro</h3>
            <p>${event.overview.description}</p>
        </section>
        <section>
            <h3>Destaques</h3>
            <ul>
                ${event.overview.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
            </ul>
        </section>
        <section>
            <h3>${event.overview.ebook.title}</h3>
            <p>${event.overview.ebook.summary}</p>
            <button class="btn btn--secondary" type="button" id="ebook-btn">Abrir e-book</button>
        </section>
    `;

  const ebookButton = document.getElementById("ebook-btn");
  ebookButton.addEventListener("click", () => {
    alert("Abertura simulada do e-book MeSeg (mock).");
  });
}