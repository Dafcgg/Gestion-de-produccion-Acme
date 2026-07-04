const URL_BASE = "https://gestion-de-produccion---acme-default-rtdb.firebaseio.com/";

async function httpClient(url, payload, method) {

    const config = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (payload !== null && method !== "GET" && method !== "DELETE") {
        config.body = JSON.stringify(payload);
    }

    return await fetch(url, config);

}

document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("productForm")) {
        initInventario();
    }

    const btnLogout = document.getElementById("btnLogout");

    if (btnLogout) {

        btnLogout.addEventListener("click", () => {

            if (confirm("¿Desea cerrar sesión?")) {
                window.location.href = "login.html";
            }

        });

    }

});

function initInventario() {

    const productForm = document.getElementById("productForm");
    const productsTableBody = document.getElementById("productsTableBody");
    const btnCancelProductEdit = document.getElementById("btnCancelProductEdit");
    const formProductTitle = document.getElementById("formProductTitle");
    const btnProductSubmit = document.getElementById("btnProductSubmit");

    cargarProductos();

    productForm.addEventListener("submit", guardarProducto);

    btnCancelProductEdit.addEventListener("click", resetProductForm);
}
    async function guardarProducto(e) {

        e.preventDefault();

        const id = document.getElementById("productId").value;
        const codigo = document.getElementById("productCodigo").value.trim();
        const nombre = document.getElementById("productNombre").value.trim();
        const proveedor = document.getElementById("productProveedor").value.trim();
        const cantidad = Number(document.getElementById("productCantidad").value);
        const precio = Number(document.getElementById("productPrecio").value);

        if (!codigo || !nombre || !proveedor || cantidad < 0 || precio < 0) {
            showMsg("Complete correctamente todos los campos.");
            return;
        }

        try {

            const response = await httpClient(
                `${URL_BASE}productos.json`,
                null,
                "GET"
            );

            const productos = await response.json();

            let duplicado = false;

            if (productos) {

                for (const key in productos) {

                    if (key === id) continue;

                    if (
                        productos[key].codigo.toLowerCase() === codigo.toLowerCase() ||
                        productos[key].nombre.toLowerCase() === nombre.toLowerCase()
                    ) {
                        duplicado = true;
                        break;
                    }

                }

            }

            if (duplicado) {
                showMsg("Ya existe un producto con ese código o nombre.");
                return;
            }

            const producto = {
                codigo,
                nombre,
                proveedor,
                cantidad,
                precio
            };

            if (id === "") {

                await httpClient(
                    `${URL_BASE}productos.json`,
                    producto,
                    "POST"
                );

                showMsg("Producto agregado correctamente.");

            } else {

                await httpClient(
                    `${URL_BASE}productos/${id}.json`,
                    producto,
                    "PUT"
                );

                showMsg("Producto actualizado correctamente.");

            }

            await cargarProductos();
            resetProductForm();

        } catch (error) {

            console.error(error);
            showMsg("Error al guardar el producto.");

        }

    }

        async function cargarProductos() {

        productsTableBody.innerHTML =
            "<tr><td colspan='6'>Cargando productos...</td></tr>";

        try {

            const response = await httpClient(
                `${URL_BASE}productos.json`,
                null,
                "GET"
            );

            const productos = await response.json();

            productsTableBody.innerHTML = "";

            if (!productos) {

                productsTableBody.innerHTML =
                    "<tr><td colspan='6'>No hay productos registrados.</td></tr>";

                return;
            }

            for (const key in productos) {

                const producto = productos[key];

                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${producto.codigo}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.proveedor}</td>
                    <td>${producto.cantidad}</td>
                    <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>
                    <td>
                        <button
                            class="btn btn-warning btn-sm btnEditar"
                            data-id="${key}">
                            Editar
                        </button>

                        <button
                            class="btn btn-danger btn-sm btnEliminar"
                            data-id="${key}">
                            Eliminar
                        </button>
                    </td>
                `;

                productsTableBody.appendChild(fila);

            }

            document.querySelectorAll(".btnEditar").forEach((btn) => {

                btn.addEventListener("click", () => {
                    editarProducto(btn.dataset.id);
                });

            });

            document.querySelectorAll(".btnEliminar").forEach((btn) => {

                btn.addEventListener("click", () => {
                    eliminarProducto(btn.dataset.id);
                });

            });

        } catch (error) {

            console.error(error);

            productsTableBody.innerHTML =
                "<tr><td colspan='6'>Error al cargar productos.</td></tr>";

        }

    }

        async function editarProducto(id) {

        try {

            const response = await httpClient(
                `${URL_BASE}productos/${id}.json`,
                null,
                "GET"
            );

            const producto = await response.json();

            document.getElementById("productId").value = id;
            document.getElementById("productCodigo").value = producto.codigo;
            document.getElementById("productNombre").value = producto.nombre;
            document.getElementById("productProveedor").value = producto.proveedor;
            document.getElementById("productCantidad").value = producto.cantidad;
            document.getElementById("productPrecio").value = producto.precio;

            formProductTitle.textContent = "Editar Producto";
            btnProductSubmit.textContent = "Actualizar Producto";
            btnCancelProductEdit.classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(error);
            showMsg("Error al cargar el producto.");

        }

    }

    async function eliminarProducto(id) {

        if (!confirm("¿Desea eliminar este producto?")) return;

        try {

            await httpClient(
                `${URL_BASE}productos/${id}.json`,
                null,
                "DELETE"
            );

            if (document.getElementById("productId").value === id) {
                resetProductForm();
            }

            await cargarProductos();

            showMsg("Producto eliminado correctamente.");

        } catch (error) {

            console.error(error);
            showMsg("Error al eliminar el producto.");

        }

    }

    function resetProductForm() {

        productForm.reset();

        document.getElementById("productId").value = "";

        formProductTitle.textContent = "Registrar Producto";
        btnProductSubmit.textContent = "Agregar Producto";

        btnCancelProductEdit.classList.add("hidden");

    }

function showMsg(mensaje) {

    alert(mensaje);

}