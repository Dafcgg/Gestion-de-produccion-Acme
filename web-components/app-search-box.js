
class AppSearchBox extends HTMLElement {

    connectedCallback() {

        const placeholder = this.getAttribute("placeholder") || "Buscar...";
        const targetId = this.getAttribute("target");

        this.innerHTML = `
            <div class="search-box">
                <input
                    type="text"
                    class="app-search-input"
                    placeholder="${placeholder}">
            </div>
        `;

        const input = this.querySelector(".app-search-input");

        input.addEventListener("keyup", () => {

            const filtro = input.value.toLowerCase();
            const tbody = document.getElementById(targetId);

            if (!tbody) return;

            tbody.querySelectorAll("tr").forEach((fila) => {

                fila.style.display = fila.textContent
                    .toLowerCase()
                    .includes(filtro)
                    ? ""
                    : "none";

            });

        });

    }

}

customElements.define("app-search-box", AppSearchBox);
