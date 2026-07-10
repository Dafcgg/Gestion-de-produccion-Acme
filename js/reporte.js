document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("reportForm")) {
        initReporte();
    }

});

function initReporte() {

    const reportForm = document.getElementById("reportForm");
    const reportYear = document.getElementById("reportYear");
    const reportMonth = document.getElementById("reportMonth");
    const reportTableBody = document.getElementById("reportTableBody");
    const reportSummary = document.getElementById("reportSummary");
    const btnReportSubmit = document.getElementById("btnReportSubmit");

    const meses = [
        { value: "01", label: "Enero" },
        { value: "02", label: "Febrero" },
        { value: "03", label: "Marzo" },
        { value: "04", label: "Abril" },
        { value: "05", label: "Mayo" },
        { value: "06", label: "Junio" },
        { value: "07", label: "Julio" },
        { value: "08", label: "Agosto" },
        { value: "09", label: "Septiembre" },
        { value: "10", label: "Octubre" },
        { value: "11", label: "Noviembre" },
        { value: "12", label: "Diciembre" }
    ];

    iniciar();

    reportForm.addEventListener("submit", generarReporte);
    reportYear.addEventListener("change", generarReporteSiCompleto);
    reportMonth.addEventListener("change", generarReporteSiCompleto);

    function generarReporteSiCompleto() {

        if (reportYear.value && reportMonth.value) {
            generarReporte();
        }

    }

    async function iniciar() {

        cargarMeses();
        await cargarAnios();

    }

    function cargarMeses() {

        reportMonth.innerHTML = `
            <option value="">
                Seleccione un mes
            </option>
        `;

        meses.forEach((mes) => {

            const option = document.createElement("option");

            option.value = mes.value;
            option.textContent = mes.label;

            reportMonth.appendChild(option);

        });

    }

    async function cargarAnios() {

        reportYear.innerHTML = `
            <option value="">
                Seleccione un año
            </option>
        `;

        try {

            const response = await httpClient(
                `${URL_BASE}produccion.json`,
                null,
                "GET"
            );

            const producciones = await response.json();

            const anios = new Set();

            if (producciones) {

                for (const key in producciones) {

                    const produccion = producciones[key];
                    const fechaProduccion = obtenerAnioMesProduccion(produccion);

                    if (fechaProduccion) {
                        anios.add(Number(fechaProduccion.anio));
                    }

                }

            }

            anios.add(new Date().getFullYear());

            Array.from(anios)
                .sort((a, b) => b - a)
                .forEach((anio) => {

                    const option = document.createElement("option");

                    option.value = anio;
                    option.textContent = anio;

                    reportYear.appendChild(option);

                });

        } catch (error) {

            console.error(error);
            showMsg("Error al cargar los años disponibles.", "error");

        }

    }

    async function generarReporte(e) {

        if (e) {
            e.preventDefault();
        }

        const anio = reportYear.value;
        const mes = reportMonth.value;

        if (!anio || !mes) {
            showMsg("Seleccione un año y un mes.", "warning");
            return;
        }

        const restaurarBoton = setBtnLoading(btnReportSubmit, "Generando...");

        reportTableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    Generando reporte...
                </td>
            </tr>
        `;

        reportSummary.classList.add("hidden");

        try {

            const [responseProducciones, responseProductos] = await Promise.all([

                httpClient(`${URL_BASE}produccion.json`, null, "GET"),
                httpClient(`${URL_BASE}productos.json`, null, "GET")

            ]);

            const producciones = await responseProducciones.json();
            const productos = await responseProductos.json();

            const consumo = calcularConsumo(producciones, anio, mes);

            mostrarConsumo(consumo, productos, anio, mes);

        } catch (error) {

            console.error(error);

            reportTableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        Error al generar el reporte.
                    </td>
                </tr>
            `;

            showMsg("Error al generar el reporte.", "error");

        } finally {

            restaurarBoton();

        }

    }

    function obtenerAnioMesProduccion(produccion) {

        if (produccion.fechaISO) {

            const fecha = new Date(produccion.fechaISO);

            if (!isNaN(fecha.getTime())) {

                return {
                    anio: String(fecha.getFullYear()),
                    mes: String(fecha.getMonth() + 1).padStart(2, "0")
                };

            }

        }

        if (produccion.fecha) {

            const coincidencia = produccion.fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);

            if (coincidencia) {

                return {
                    anio: coincidencia[3],
                    mes: coincidencia[2].padStart(2, "0")
                };

            }

        }

        return null;

    }

    function calcularConsumo(producciones, anio, mes) {

        const consumo = {};

        if (!producciones) return consumo;

        for (const key in producciones) {

            const produccion = producciones[key];

            if (!produccion.receta || !produccion.receta.materiales) {
                continue;
            }

            const fechaProduccion = obtenerAnioMesProduccion(produccion);

            if (!fechaProduccion) {
                continue;
            }

            if (fechaProduccion.anio !== String(anio) || fechaProduccion.mes !== mes) {
                continue;
            }

            produccion.receta.materiales.forEach((materia) => {

                const cantidadConsumida = materia.cantidad * produccion.cantidad;

                if (!consumo[materia.id]) {

                    consumo[materia.id] = {
                        nombre: materia.nombre,
                        cantidad: 0
                    };

                }

                consumo[materia.id].cantidad += cantidadConsumida;

            });

        }

        return consumo;

    }

    function mostrarConsumo(consumo, productos, anio, mes) {

        const idsMateriales = Object.keys(consumo);

        reportTableBody.innerHTML = "";

        if (idsMateriales.length === 0) {

            reportTableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No se registró consumo de materia prima en el período seleccionado.
                    </td>
                </tr>
            `;

            return;

        }

        idsMateriales
            .sort((a, b) => consumo[a].nombre.localeCompare(consumo[b].nombre))
            .forEach((id) => {

                const item = consumo[id];
                const codigo = (productos && productos[id]) ? productos[id].codigo : "N/D";

                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${codigo}</td>
                    <td>${item.nombre}</td>
                    <td>${item.cantidad}</td>
                `;

                reportTableBody.appendChild(fila);

            });

        const mesEncontrado = meses.find((m) => m.value === mes);
        const nombreMes = mesEncontrado ? mesEncontrado.label : mes;

        reportSummary.textContent =
            `Se encontraron ${idsMateriales.length} materia(s) prima(s) utilizada(s) en ${nombreMes} de ${anio}.`;

        reportSummary.classList.remove("hidden");

    }

}
