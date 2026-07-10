document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("productForm")) {
        initInventario();
    }

});

function initInventario() {

    const productForm = document.getElementById("productForm");
    const productsTableBody = document.getElementById("productsTableBody");
    const btnCancelProductEdit = document.getElementById("btnCancelProductEdit");
    const formProductTitle = document.getElementById("formProductTitle");
    const btnProductSubmit = document.getElementById("btnProductSubmit");
    const stockForm = document.getElementById("stockForm");
    const btnStockSubmit = document.getElementById("btnStockSubmit");

    cargarProductos();

    productForm.addEventListener("submit", guardarProducto);

    btnCancelProductEdit.addEventListener("click", resetProductForm);

    if (stockForm) {
        stockForm.addEventListener("submit", aumentarStock);
    }

    const productTipoSelect = document.getElementById("productTipo");
    const productCantidadInput = document.getElementById("productCantidad");

    if (productTipoSelect && productCantidadInput) {

        productTipoSelect.addEventListener("change", () => {

            if (productTipoSelect.value === "producto_terminado") {
                productCantidadInput.min = "0";
                productCantidadInput.placeholder = "Ej. 0 (aún sin fabricar)";
            } else {
                productCantidadInput.min = "1";
                productCantidadInput.placeholder = "Ej. 100";
            }

        });

    }

    function etiquetaTipo(tipo) {

        if (tipo === "materia_prima") return "Materia Prima";
        if (tipo === "producto_terminado") return "Producto Terminado";

        return "Sin definir";

    }

    async function guardarProducto(e) {

        e.preventDefault();

        const id = document.getElementById("productId").value;
        const codigo = document.getElementById("productCodigo").value.trim();
        const nombre = document.getElementById("productNombre").value.trim();
        const tipo = document.getElementById("productTipo").value;
        const proveedor = document.getElementById("productProveedor").value.trim();
        const cantidadInput = document.getElementById("productCantidad").value;
        const precioInput = document.getElementById("productPrecio").value;

        const cantidad = Number(cantidadInput);
        const precio = Number(precioInput);

        if (!codigo || !nombre || !tipo || !proveedor || cantidadInput === "" || precioInput === "") {
            showMsg("Complete correctamente todos los campos, incluyendo el tipo de producto.", "warning");
            return;
        }

        const cantidadMinima = tipo === "producto_terminado" ? 0 : 1;

        if (!Number.isInteger(cantidad) || cantidad < cantidadMinima) {

            const mensaje = tipo === "producto_terminado"
                ? "La cantidad debe ser un número entero mayor o igual a 0."
                : "La cantidad debe ser un número entero mayor o igual a 1 para una materia prima.";

            showMsg(mensaje, "warning");
            return;

        }

        if (!(precio > 0)) {
            showMsg("El precio debe ser mayor a 0.", "warning");
            return;
        }

        const restaurarBoton = setBtnLoading(btnProductSubmit, "Guardando...");

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
                showMsg("Ya existe un producto con ese código o nombre.", "warning");
                restaurarBoton();
                return;
            }

            if (id !== "" && productos && productos[id] && productos[id].tipo !== tipo) {

                const usoEnRecetas = await verificarUsoEnRecetas(id);

                if (usoEnRecetas.enUso) {

                    const continuar = confirm(
                        `Este producto está usado en ${usoEnRecetas.detalle}. ` +
                        `Cambiar su tipo puede dejar esas recetas inconsistentes. ` +
                        `¿Desea continuar de todas formas?`
                    );

                    if (!continuar) {
                        restaurarBoton();
                        return;
                    }

                }

            }

            const producto = {
                codigo,
                nombre,
                tipo,
                proveedor,
                cantidad,
                precio,
                fechaRegistro: new Date().toISOString()
            };

            if (id === "") {

                await httpClient(
                    `${URL_BASE}productos.json`,
                    producto,
                    "POST"
                );

                showMsg("Producto agregado correctamente.", "success");

            } else {

                await httpClient(
                    `${URL_BASE}productos/${id}.json`,
                    producto,
                    "PUT"
                );

                showMsg("Producto actualizado correctamente.", "success");

            }

            await cargarProductos();
            resetProductForm();

        } catch (error) {

            console.error(error);
            showMsg("Error al guardar el producto.", "error");

        } finally {

            restaurarBoton();

        }

    }

    async function verificarUsoEnRecetas(idProducto) {

        try {

            const response = await httpClient(
                `${URL_BASE}recetas.json`,
                null,
                "GET"
            );

            const recetas = await response.json();

            if (!recetas) {
                return { enUso: false, detalle: "" };
            }

            const motivos = [];

            for (const key in recetas) {

                const receta = recetas[key];

                if (receta.productoId === idProducto) {
                    motivos.push(`la receta de "${receta.producto}" (como producto terminado)`);
                    continue;
                }

                const usadoComoMateria = (receta.materiales || []).some(
                    (materia) => materia.id === idProducto
                );

                if (usadoComoMateria) {
                    motivos.push(`la receta de "${receta.producto}" (como materia prima)`);
                }

            }

            return {
                enUso: motivos.length > 0,
                detalle: motivos.join(", ")
            };

        } catch (error) {

            console.error(error);
            return { enUso: false, detalle: "" };

        }

    }

        async function cargarProductos() {

        productsTableBody.innerHTML =
            "<tr><td colspan='8'>Cargando productos...</td></tr>";

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
                    "<tr><td colspan='8'>No hay productos registrados.</td></tr>";

                return;
            }

            for (const key in productos) {

                const producto = productos[key];

                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${producto.codigo}</td>
                    <td>${producto.nombre}</td>
                    <td>
                        <span class="badge ${producto.tipo === 'materia_prima' ? 'badge-warning' : 'badge-success'}">
                            ${etiquetaTipo(producto.tipo)}
                        </span>
                    </td>
                    <td>${producto.proveedor}</td>
                    <td>${producto.cantidad}</td>
                    <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>
                    <td>${formatearFecha(producto.fechaRegistro)}</td>
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
                "<tr><td colspan='8'>Error al cargar productos.</td></tr>";

        }

    }

    function formatearFecha(fechaISO) {

        if (!fechaISO) return "Sin fecha";

        const fecha = new Date(fechaISO);

        if (isNaN(fecha.getTime())) return "Sin fecha";

        const fechaTexto = fecha.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        const horaTexto = fecha.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        return `${fechaTexto}, ${horaTexto}`;

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
            document.getElementById("productTipo").value = producto.tipo || "";
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
            showMsg("Error al cargar el producto.", "error");

        }

    }

    async function eliminarProducto(id) {

        const usoEnRecetas = await verificarUsoEnRecetas(id);

        let mensajeConfirmacion = "¿Desea eliminar este producto?";

        if (usoEnRecetas.enUso) {

            mensajeConfirmacion =
                `Este producto está usado en ${usoEnRecetas.detalle}. ` +
                `Si lo elimina, esas recetas quedarán inconsistentes y la ` +
                `producción de ese/esos productos podría fallar. ` +
                `¿Desea eliminarlo de todas formas?`;

        }

        if (!confirm(mensajeConfirmacion)) return;

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

            showMsg("Producto eliminado correctamente.", "success");

        } catch (error) {

            console.error(error);
            showMsg("Error al eliminar el producto.", "error");

        }

    }

    function resetProductForm() {

        productForm.reset();

        document.getElementById("productId").value = "";

        formProductTitle.textContent = "Registrar Producto";
        btnProductSubmit.textContent = "Agregar Producto";

        btnCancelProductEdit.classList.add("hidden");

    }

    async function aumentarStock(e) {

        e.preventDefault();

        const codigo = document.getElementById("stockCodigo").value.trim();
        const cantidadInput = document.getElementById("stockCantidad").value;
        const cantidadAumentar = Number(cantidadInput);

        if (!codigo || cantidadInput === "" || !Number.isInteger(cantidadAumentar) || cantidadAumentar <= 0) {
            showMsg("Ingrese un código y una cantidad entera válida (mayor a 0).", "warning");
            return;
        }

        const restaurarBoton = setBtnLoading(btnStockSubmit, "Aumentando...");

        try {

            const response = await httpClient(
                `${URL_BASE}productos.json`,
                null,
                "GET"
            );

            const productos = await response.json();

            let idEncontrado = null;

            if (productos) {

                for (const key in productos) {

                    if (productos[key].codigo.toLowerCase() === codigo.toLowerCase()) {
                        idEncontrado = key;
                        break;
                    }

                }

            }

            if (!idEncontrado) {
                showMsg("No se encontró ningún producto con ese código.", "warning");
                return;
            }

            const producto = productos[idEncontrado];

            producto.cantidad += cantidadAumentar;

            await httpClient(
                `${URL_BASE}productos/${idEncontrado}.json`,
                producto,
                "PUT"
            );

            showMsg("Stock aumentado correctamente.", "success");

            stockForm.reset();

            await cargarProductos();

        } catch (error) {

            console.error(error);
            showMsg("Error al aumentar el stock.", "error");

        } finally {

            restaurarBoton();

        }

    }

}
