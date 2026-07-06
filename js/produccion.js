document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("productionForm")) {
        initProduccion();
    }

});

function initProduccion() {

    const productionForm = document.getElementById("productionForm");
    const productionProduct = document.getElementById("productionProduct");
    const productionQuantity = document.getElementById("productionQuantity");
    const productionCode = document.getElementById("productionCode");
    const productionTableBody = document.getElementById("productionTableBody");
    const formulaTableBody = document.getElementById("formulaTableBody");
    const productionSummary = document.getElementById("productionSummary");
    const btnProductionSubmit = document.getElementById("btnProductionSubmit");

    cargarProductos();
    cargarHistorial();
    generarCodigo();

    productionProduct.addEventListener("change", () => {
        cargarFormula(productionProduct.value);
    });

    productionForm.addEventListener("submit", fabricarProducto);


    async function cargarProductos() {

        try {

            const response = await httpClient(
                `${URL_BASE}productos.json`,
                null,
                "GET"
            );

            const productos = await response.json();

            productionProduct.innerHTML = `
                <option value="">
                    Seleccione un producto
                </option>
            `;

            if (!productos) return;

            for (const key in productos) {

                const producto = productos[key];

                // Solo los productos marcados como "producto_terminado"
                // se pueden fabricar.
                if (producto.tipo !== "producto_terminado") continue;

                const option = document.createElement("option");

                option.value = key;
                option.textContent = producto.nombre;

                productionProduct.appendChild(option);

            }

        } catch (error) {

            console.error(error);
            showMsg("Error al cargar los productos.", "error");

        }

    }


    // Calcula cuál sería el siguiente código de producción consecutivo,
    // basándose en el máximo código existente en el historial.
    async function calcularSiguienteCodigo() {

        const response = await httpClient(
            `${URL_BASE}produccion.json`,
            null,
            "GET"
        );

        const producciones = await response.json();

        if (!producciones) return 1;

        const codigosExistentes = Object.values(producciones)
            .map((produccion) => Number(produccion.codigo) || 0);

        return Math.max(...codigosExistentes) + 1;

    }

    async function generarCodigo() {

        try {

            productionCode.value = await calcularSiguienteCodigo();

        } catch (error) {

            console.error(error);
            productionCode.value = 1;

        }

    }


   async function cargarFormula(idProducto) {
    formulaTableBody.innerHTML = "";

    if (idProducto === "") {
        formulaTableBody.innerHTML = `
            <tr>
                <td colspan="2">
                    Seleccione un producto para visualizar su fórmula.
                </td>
            </tr>
        `;
        return;
    }

    try {
        const response = await httpClient(
            `${URL_BASE}recetas/${idProducto}.json`,
            null,
            "GET"
        );

        const receta = await response.json();

        // Validar si la receta existe o si tiene el listado de materiales
        if (!receta || !receta.materiales) {
            formulaTableBody.innerHTML = `
                <tr>
                    <td colspan="2">
                        Este producto no tiene fórmula registrada.
                    </td>
                </tr>
            `;
            return;
        }

        // CORRECCIÓN: Iterar sobre el array correcto de materiales
        receta.materiales.forEach(materia => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${materia.nombre}</td>
                <td>${materia.cantidad}</td>
            `;

            formulaTableBody.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
        showMsg("Error al cargar la fórmula.", "error");
    }
}

        async function fabricarProducto(e) {

        e.preventDefault();

        const idProducto = productionProduct.value;
        const cantidadInput = productionQuantity.value;
        const cantidadFabricar = Number(cantidadInput);

        if (idProducto === "") {
            showMsg("Seleccione un producto.", "warning");
            return;
        }

        if (cantidadInput === "" || !Number.isInteger(cantidadFabricar) || cantidadFabricar <= 0) {
            showMsg("Ingrese una cantidad entera válida (mayor a 0).", "warning");
            return;
        }

        const restaurarBoton = setBtnLoading(btnProductionSubmit, "Fabricando...");

        try {

            const responseProducto = await httpClient(
                `${URL_BASE}productos/${idProducto}.json`,
                null,
                "GET"
            );

            const producto = await responseProducto.json();

            if (!producto) {
                showMsg("El producto no existe.", "warning");
                return;
            }

            const responseReceta = await httpClient(
                `${URL_BASE}recetas/${idProducto}.json`,
                null,
                "GET"
            );

            const receta = await responseReceta.json();

            if (!receta || !receta.materiales || receta.materiales.length === 0) {
                showMsg("Este producto no tiene fórmula registrada.", "warning");
                return;
            }

            const responseProductos = await httpClient(
                `${URL_BASE}productos.json`,
                null,
                "GET"
            );

            const inventario = await responseProductos.json();

            let stockSuficiente = true;

            for (const materia of receta.materiales) {

                const materiaId = materia.id;

                const cantidadNecesaria =
                    materia.cantidad * cantidadFabricar;

                if (
                    !inventario[materiaId] ||
                    inventario[materiaId].cantidad < cantidadNecesaria
                ) {

                    stockSuficiente = false;
                    break;

                }

            }

            if (!stockSuficiente) {

                showMsg("No hay suficiente materia prima para fabricar.", "warning");

                return;

            }

            for (const materia of receta.materiales) {

                const materiaId = materia.id;

                const cantidadNecesaria =
                    materia.cantidad * cantidadFabricar;

                inventario[materiaId].cantidad -= cantidadNecesaria;

                await httpClient(

                    `${URL_BASE}productos/${materiaId}.json`,

                    inventario[materiaId],

                    "PUT"

                );

            }

            producto.cantidad += cantidadFabricar;

            await httpClient(

                `${URL_BASE}productos/${idProducto}.json`,

                producto,

                "PUT"

            );

            await guardarProduccion(

                idProducto,

                producto.nombre,

                cantidadFabricar,

                receta

            );

        } catch (error) {

            console.error(error);

            showMsg("Error al realizar la producción.", "error");

        } finally {

            restaurarBoton();

        }

    }

        async function guardarProduccion(idProducto, nombreProducto, cantidadFabricada, receta) {

        try {

            // El inventario ya se descontó/incrementó en este punto. Para
            // evitar que dos fabricaciones casi simultáneas obtengan el
            // mismo código consecutivo (Firebase REST no ofrece bloqueo ni
            // transacciones aquí), se recalcula el código justo antes de
            // guardar y, si por alguna razón ya existe ese código en el
            // historial, se reintenta unas pocas veces con el siguiente.
            let codigo = await calcularSiguienteCodigo();
            let intentos = 0;
            let guardadoOk = false;
            let produccion = null;

            while (!guardadoOk && intentos < 5) {

                produccion = {
                    codigo: codigo,
                    producto: nombreProducto,
                    productoId: idProducto,
                    cantidad: cantidadFabricada,
                    receta: receta,
                    fecha: new Date().toLocaleString("es-CO")
                };

                const responseVerif = await httpClient(
                    `${URL_BASE}produccion.json`,
                    null,
                    "GET"
                );

                const produccionesActuales = await responseVerif.json();

                const codigoOcupado = produccionesActuales
                    ? Object.values(produccionesActuales).some(
                          (p) => Number(p.codigo) === codigo
                      )
                    : false;

                if (codigoOcupado) {

                    codigo += 1;
                    intentos += 1;
                    continue;

                }

                await httpClient(
                    `${URL_BASE}produccion.json`,
                    produccion,
                    "POST"
                );

                guardadoOk = true;

            }

            if (!guardadoOk) {
                showMsg("No se pudo generar un código único de producción, intente de nuevo.", "error");
                return;
            }

            productionSummary.innerHTML = `
                <h4>Producción realizada correctamente</h4>

                <p>
                    <strong>Código:</strong>
                    ${produccion.codigo}
                </p>

                <p>
                    <strong>Producto:</strong>
                    ${nombreProducto}
                </p>

                <p>
                    <strong>Cantidad Fabricada:</strong>
                    ${cantidadFabricada}
                </p>

                <hr>

                <h5>Materia Prima Utilizada</h5>
            `;

            receta.materiales.forEach((materia) => {

                productionSummary.innerHTML += `
                    <p>
                        ${materia.nombre} :
                        ${materia.cantidad * cantidadFabricada}
                    </p>
                `;

            });

            showMsg("Producción registrada correctamente.", "success");

            productionForm.reset();

            formulaTableBody.innerHTML = `
                <tr>
                    <td colspan="2">
                        Seleccione un producto para visualizar su fórmula.
                    </td>
                </tr>
            `;

            await cargarHistorial();

            await generarCodigo();

        } catch (error) {

            console.error(error);

            showMsg("Error al guardar la producción.", "error");

        }

    }

        async function cargarHistorial() {

        try {

            const response = await httpClient(
                `${URL_BASE}produccion.json`,
                null,
                "GET"
            );

            const producciones = await response.json();

            productionTableBody.innerHTML = "";

            if (!producciones) {

                productionTableBody.innerHTML = `
                    <tr>
                        <td colspan="5">
                            No hay producciones registradas.
                        </td>
                    </tr>
                `;

                return;

            }

            for (const key in producciones) {

                const produccion = producciones[key];

                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${produccion.codigo}</td>
                    <td>${produccion.producto}</td>
                    <td>${produccion.cantidad}</td>
                    <td>${produccion.fecha}</td>
                    <td>
                        <button
                            class="btn btn-danger btnEliminar"
                            data-id="${key}">
                            Eliminar
                        </button>
                    </td>
                `;

                productionTableBody.appendChild(fila);

            }

            document.querySelectorAll(".btnEliminar").forEach((btn) => {

                btn.addEventListener("click", () => {
                    eliminarProduccion(btn.dataset.id);
                });

            });

        } catch (error) {

            console.error(error);

            showMsg("Error al cargar el historial.", "error");

        }

    }

    async function eliminarProduccion(id) {

        // Eliminar el historial NO revierte por sí solo el inventario, ya
        // que fue una operación real. Se le pregunta al usuario si además
        // de eliminar el registro desea devolver la materia prima usada y
        // restar el producto terminado que se fabricó, para dejar el
        // inventario como estaba antes de esa producción.
        const revertir = confirm(
            "¿Desea eliminar este registro de producción?\n\n" +
            "Presione ACEPTAR para eliminar el registro Y devolver el " +
            "inventario a como estaba antes de esta producción " +
            "(se restará el producto fabricado y se devolverá la materia prima usada).\n\n" +
            "Presione CANCELAR para no eliminar nada."
        );

        if (!revertir) return;

        try {

            const responseProduccion = await httpClient(
                `${URL_BASE}produccion/${id}.json`,
                null,
                "GET"
            );

            const produccion = await responseProduccion.json();

            if (produccion && produccion.receta && produccion.receta.materiales) {

                // Devolver la materia prima utilizada.
                for (const materia of produccion.receta.materiales) {

                    const responseMateria = await httpClient(
                        `${URL_BASE}productos/${materia.id}.json`,
                        null,
                        "GET"
                    );

                    const productoMateria = await responseMateria.json();

                    if (productoMateria) {

                        productoMateria.cantidad += materia.cantidad * produccion.cantidad;

                        await httpClient(
                            `${URL_BASE}productos/${materia.id}.json`,
                            productoMateria,
                            "PUT"
                        );

                    }

                }

                // Restar el producto terminado que se había fabricado.
                if (produccion.productoId) {

                    const responseTerminado = await httpClient(
                        `${URL_BASE}productos/${produccion.productoId}.json`,
                        null,
                        "GET"
                    );

                    const productoTerminado = await responseTerminado.json();

                    if (productoTerminado) {

                        productoTerminado.cantidad = Math.max(
                            0,
                            productoTerminado.cantidad - produccion.cantidad
                        );

                        await httpClient(
                            `${URL_BASE}productos/${produccion.productoId}.json`,
                            productoTerminado,
                            "PUT"
                        );

                    }

                }

            }

            await httpClient(
                `${URL_BASE}produccion/${id}.json`,
                null,
                "DELETE"
            );

            await cargarHistorial();

            showMsg("Producción eliminada e inventario revertido correctamente.", "success");

        } catch (error) {

            console.error(error);

            showMsg("Error al eliminar la producción.", "error");

        }

    }

}
