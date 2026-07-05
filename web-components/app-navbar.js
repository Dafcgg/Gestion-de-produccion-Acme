
class AppNavbar extends HTMLElement {

    connectedCallback() {

        const brand = this.getAttribute("brand") || "Gestión de Producción";
        const active = this.getAttribute("active") || "";

        const links = [
            { key: "usuarios", href: "usuarios.html", label: "Usuarios", clase: "btn-secondary" },
            { key: "inventario", href: "inventario.html", label: "Inventario", clase: "btn-secondary" },
            { key: "receta", href: "receta.html", label: "Receta", clase: "btn-production" },
            { key: "produccion", href: "produccion.html", label: "Producción", clase: "btn-production" }
        ];

        const enlacesHtml = links
            .filter((link) => link.key !== active)
            .map((link) => `
                <a href="${link.href}" class="btn ${link.clase}">
                    ${link.label}
                </a>
            `)
            .join("");

        this.innerHTML = `
            <nav class="navbar">
                <div class="navbar-brand">
                    ${brand}
                </div>
                <div class="navbar-nav">
                    ${enlacesHtml}
                    <button type="button" id="btnLogout" class="btn btn-danger">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>
        `;

        const btnLogout = this.querySelector("#btnLogout");

        btnLogout.addEventListener("click", () => {

            if (confirm("¿Desea cerrar sesión?")) {

                document.dispatchEvent(new CustomEvent("app-logout"));

                window.location.href = "login.html";

            }

        });

    }

}

customElements.define("app-navbar", AppNavbar);
