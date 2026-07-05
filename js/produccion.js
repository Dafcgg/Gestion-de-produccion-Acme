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

                const option = document.createElement("option");

                option.value = key;
                option.textContent = producto.nombre;

                productionProduct.appendChild(option);

            }

        } catch (error) {

            console.error(error);
            showMsg("Error al cargar los productos.");

        }

    }


    async function generarCodigo() {

        try {

            const response = await httpClient(
                `${URL_BASE}produccion.json`,
                null,
                "GET"
            );

            const producciones = await response.json();

            let codigo = 1;

            if (producciones) {

                codigo = Object.keys(producciones).length + 1;

            }

            productionCode.value = codigo;

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
        if (typeof showMsg === "function") {
            showMsg("Error al cargar la fórmula.");
        } else {
            alert("Error al cargar la fórmula.");
        }
    }
}

        async function fabricarProducto(e) {

        e.preventDefault();

        const idProducto = productionProduct.value;
        const cantidadFabricar = Number(productionQuantity.value);

        if (idProducto === "") {
            showMsg("Seleccione un producto.");
            return;
        }

        if (cantidadFabricar <= 0) {
            showMsg("Ingrese una cantidad válida.");
            return;
        }

        try {

            const responseProducto = await httpClient(
                `${URL_BASE}productos/${idProducto}.json`,
                null,
                "GET"
            );

            const producto = await responseProducto.json();

            if (!producto) {
                showMsg("El producto no existe.");
                return;
            }

            const responseReceta = await httpClient(
                `${URL_BASE}recetas/${idProducto}.json`,
                null,
                "GET"
            );

            const receta = await responseReceta.json();

            if (!receta || !receta.materiales || receta.materiales.length === 0) {
                showMsg("Este producto no tiene fórmula registrada.");
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

                showMsg("No hay suficiente materia prima para fabricar.");

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

            guardarProduccion(

                producto.nombre,

                cantidadFabricar,

                receta

            );

        } catch (error) {

            console.error(error);

            showMsg("Error al realizar la producción.");

        }

    }

        async function guardarProduccion(nombreProducto, cantidadFabricada, receta) {

        try {

            const produccion = {
                codigo: Number(productionCode.value),
                producto: nombreProducto,
                cantidad: cantidadFabricada,
                receta: receta,
                fecha: new Date().toLocaleString("es-CO")
            };

            await httpClient(
                `${URL_BASE}produccion.json`,
                produccion,
                "POST"
            );

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

            showMsg("Producción registrada correctamente.");

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

            showMsg("Error al guardar la producción.");

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

            showMsg("Error al cargar el historial.");

        }

    }

    async function eliminarProduccion(id) {

        if (!confirm("¿Desea eliminar esta producción?")) return;

        try {

            await httpClient(
                `${URL_BASE}produccion/${id}.json`,
                null,
                "DELETE"
            );

            await cargarHistorial();

            showMsg("Producción eliminada correctamente.");

        } catch (error) {

            console.error(error);

            showMsg("Error al eliminar la producción.");

        }

    }

    function showMsg(mensaje) {

        alert(mensaje);

    }

}
