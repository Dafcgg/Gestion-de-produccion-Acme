document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("recipeForm")) {
        initRecetas();
    }

});

function initRecetas() {

    const recipeForm = document.getElementById("recipeForm");
    const recipeProduct = document.getElementById("recipeProduct");
    const recipeMaterial = document.getElementById("recipeMaterial");
    const recipeQuantity = document.getElementById("recipeQuantity");

    const recipeTableBody = document.getElementById("recipeTableBody");
    const recipesTableBody = document.getElementById("recipesTableBody");

    const btnAddMaterial = document.getElementById("btnAddMaterial");
    const btnRecipeSubmit = document.getElementById("btnRecipeSubmit");
    const btnCancelRecipe = document.getElementById("btnCancelRecipe");
    const formRecipeTitle = document.getElementById("formRecipeTitle");

    let materiales = [];

    // Se cargan los productos primero y solo cuando terminan se cargan
    // las recetas, para evitar que "Editar" intente seleccionar un producto
    // en un <select> que todavía no tiene opciones (race condition).
    iniciar();

    async function iniciar() {
        await cargarProductos();
        await cargarRecetas();
    }

    btnAddMaterial.addEventListener("click", agregarMaterial);
    recipeForm.addEventListener("submit", guardarReceta);
    btnCancelRecipe.addEventListener("click", resetRecipeForm);



    async function cargarProductos() {

        try {

            const response = await httpClient(
                `${URL_BASE}productos.json`,
                null,
                "GET"
            );

            const productos = await response.json();

            recipeProduct.innerHTML = `
                <option value="">
                    Seleccione un producto terminado
                </option>
            `;

            recipeMaterial.innerHTML = `
                <option value="">
                    Seleccione una materia prima
                </option>
            `;

            if (!productos) return;

            for (const key in productos) {

                const producto = productos[key];

                // Solo los productos marcados como "producto_terminado"
                // aparecen como producto a fabricar.
                if (producto.tipo === "producto_terminado") {

                    const optionProducto = document.createElement("option");
                    optionProducto.value = key;
                    optionProducto.textContent = producto.nombre;
                    recipeProduct.appendChild(optionProducto);

                }

                // Solo los productos marcados como "materia_prima"
                // aparecen como materia prima seleccionable.
                if (producto.tipo === "materia_prima") {

                    const optionMaterial = document.createElement("option");
                    optionMaterial.value = key;
                    optionMaterial.textContent = producto.nombre;
                    recipeMaterial.appendChild(optionMaterial);

                }

            }

        } catch (error) {

            console.error(error);

            showMsg("Error al cargar los productos.", "error");

        }

    }

        function agregarMaterial() {

        const idMaterial = recipeMaterial.value;
        const nombreMaterial = recipeMaterial.options[
            recipeMaterial.selectedIndex
        ].text;

        const cantidadInput = recipeQuantity.value;
        const cantidad = Number(cantidadInput);

        if (idMaterial === "") {

            showMsg("Seleccione una materia prima.", "warning");
            return;

        }

        if (cantidadInput === "" || !Number.isInteger(cantidad) || cantidad <= 0) {

            showMsg("Ingrese una cantidad entera válida (mayor a 0).", "warning");
            return;

        }

        const existe = materiales.find(
            (item) => item.id === idMaterial
        );

        if (existe) {

            showMsg("Esta materia prima ya fue agregada.", "warning");
            return;

        }

        materiales.push({

            id: idMaterial,
            nombre: nombreMaterial,
            cantidad: cantidad

        });

        mostrarMateriales();

        recipeMaterial.value = "";
        recipeQuantity.value = "";

    }

    function mostrarMateriales() {

        recipeTableBody.innerHTML = "";

        if (materiales.length === 0) {

            recipeTableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No hay materias primas agregadas.
                    </td>
                </tr>
            `;

            return;

        }

        materiales.forEach((material, index) => {

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${material.nombre}</td>

                <td>${material.cantidad}</td>

                <td>

                    <button
                        type="button"
                        class="btn btn-danger btnEliminarMaterial"
                        data-index="${index}">

                        Eliminar

                    </button>

                </td>
            `;

            recipeTableBody.appendChild(fila);

        });

        document.querySelectorAll(".btnEliminarMaterial").forEach((btn) => {

            btn.addEventListener("click", () => {

                materiales.splice(btn.dataset.index, 1);

                mostrarMateriales();

            });

        });

    }

        async function guardarReceta(e) {

        e.preventDefault();

        const id = document.getElementById("recipeId").value;

        const idProducto = recipeProduct.value;

        if (idProducto === "") {

            showMsg("Seleccione un producto.", "warning");

            return;

        }

        if (materiales.length === 0) {

            showMsg("Debe agregar al menos una materia prima.", "warning");

            return;

        }

        const restaurarBoton = setBtnLoading(btnRecipeSubmit, "Guardando...");

        try {

            const receta = {

                productoId: idProducto,

                producto: recipeProduct.options[
                    recipeProduct.selectedIndex
                ].text,

                materiales: materiales

            };

            // La receta siempre se guarda usando el id del producto terminado
            // como clave (recetas/{idProducto}), tanto al crear como al editar,
            // así que no existe una diferencia real entre ambos casos.
            await httpClient(

                `${URL_BASE}recetas/${idProducto}.json`,

                receta,

                "PUT"

            );

            showMsg(
                id === ""
                    ? "Receta registrada correctamente."
                    : "Receta actualizada correctamente.",
                "success"
            );

            resetRecipeForm();

            await cargarRecetas();

        } catch (error) {

            console.error(error);

            showMsg("Error al guardar la receta.", "error");

        } finally {

            restaurarBoton();

        }

    }

        async function cargarRecetas() {

        try {

            const response = await httpClient(
                `${URL_BASE}recetas.json`,
                null,
                "GET"
            );

            const recetas = await response.json();

            recipesTableBody.innerHTML = "";

            if (!recetas) {

                recipesTableBody.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No hay recetas registradas.
                        </td>
                    </tr>
                `;

                return;

            }

            for (const key in recetas) {

                const receta = recetas[key];

                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${receta.producto}</td>

                    <td>${receta.materiales.length}</td>

                    <td>

                        <button
                            class="btn btn-warning btnEditar"
                            data-id="${key}">
                            Editar
                        </button>

                        <button
                            class="btn btn-danger btnEliminar"
                            data-id="${key}">
                            Eliminar
                        </button>

                    </td>
                `;

                recipesTableBody.appendChild(fila);

            }

            document.querySelectorAll(".btnEditar").forEach((btn) => {

                btn.addEventListener("click", () => {
                    editarReceta(btn.dataset.id);
                });

            });

            document.querySelectorAll(".btnEliminar").forEach((btn) => {

                btn.addEventListener("click", () => {
                    eliminarReceta(btn.dataset.id);
                });

            });

        } catch (error) {

            console.error(error);

            showMsg("Error al cargar las recetas.", "error");

        }

    }

        async function editarReceta(id) {

        try {

            const response = await httpClient(
                `${URL_BASE}recetas/${id}.json`,
                null,
                "GET"
            );

            const receta = await response.json();

            document.getElementById("recipeId").value = id;

            recipeProduct.value = receta.productoId;

            // Si el producto ya no existe en el select (fue eliminado o
            // cambió de tipo desde Inventario), se avisa al usuario en
            // lugar de dejarlo con un select vacío sin explicación.
            if (recipeProduct.value !== receta.productoId) {

                showMsg(
                    "El producto original de esta receta ya no está disponible " +
                    "como producto terminado (fue eliminado o cambió de tipo). " +
                    "Seleccione uno nuevo antes de guardar.",
                    "warning"
                );

            }

            materiales = receta.materiales || [];

            mostrarMateriales();

            formRecipeTitle.textContent = "Editar Fórmula";

            btnRecipeSubmit.textContent = "Actualizar Fórmula";

            btnCancelRecipe.classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(error);

            showMsg("Error al cargar la receta.", "error");

        }

    }

    async function eliminarReceta(id) {

        if (!confirm("¿Desea eliminar esta receta?")) return;

        try {

            await httpClient(
                `${URL_BASE}recetas/${id}.json`,
                null,
                "DELETE"
            );

            await cargarRecetas();

            showMsg("Receta eliminada correctamente.", "success");

        } catch (error) {

            console.error(error);

            showMsg("Error al eliminar la receta.", "error");

        }

    }

    function resetRecipeForm() {

        recipeForm.reset();

        document.getElementById("recipeId").value = "";

        materiales = [];

        mostrarMateriales();

        formRecipeTitle.textContent = "Registrar Fórmula";

        btnRecipeSubmit.textContent = "Guardar Fórmula";

        btnCancelRecipe.classList.add("hidden");

    }

}
