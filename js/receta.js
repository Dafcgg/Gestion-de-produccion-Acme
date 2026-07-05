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

    cargarProductos();
    cargarRecetas();

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
                    Seleccione un producto
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

                const optionProducto = document.createElement("option");
                optionProducto.value = key;
                optionProducto.textContent = producto.nombre;
                recipeProduct.appendChild(optionProducto);

                const optionMaterial = document.createElement("option");
                optionMaterial.value = key;
                optionMaterial.textContent = producto.nombre;
                recipeMaterial.appendChild(optionMaterial);

            }

        } catch (error) {

            console.error(error);

            showMsg("Error al cargar los productos.");

        }

    }

        function agregarMaterial() {

        const idMaterial = recipeMaterial.value;
        const nombreMaterial = recipeMaterial.options[
            recipeMaterial.selectedIndex
        ].text;

        const cantidad = Number(recipeQuantity.value);

        if (idMaterial === "") {

            showMsg("Seleccione una materia prima.");
            return;

        }

        if (cantidad <= 0) {

            showMsg("Ingrese una cantidad válida.");
            return;

        }

        const existe = materiales.find(
            (item) => item.id === idMaterial
        );

        if (existe) {

            showMsg("Esta materia prima ya fue agregada.");
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

            showMsg("Seleccione un producto.");

            return;

        }

        if (materiales.length === 0) {

            showMsg("Debe agregar al menos una materia prima.");

            return;

        }

        try {

            const receta = {

                productoId: idProducto,

                producto: recipeProduct.options[
                    recipeProduct.selectedIndex
                ].text,

                materiales: materiales

            };

            if (id === "") {

                await httpClient(

                    `${URL_BASE}recetas/${idProducto}.json`,

                    receta,

                    "PUT"

                );

                showMsg("Receta registrada correctamente.");

            } else {

                await httpClient(

                    `${URL_BASE}recetas/${idProducto}.json`,

                    receta,

                    "PUT"

                );

                showMsg("Receta actualizada correctamente.");

            }

            resetRecipeForm();

            cargarRecetas();

        } catch (error) {

            console.error(error);

            showMsg("Error al guardar la receta.");

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

            showMsg("Error al cargar las recetas.");

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

            showMsg("Error al cargar la receta.");

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

            cargarRecetas();

            showMsg("Receta eliminada correctamente.");

        } catch (error) {

            console.error(error);

            showMsg("Error al eliminar la receta.");

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

    function showMsg(mensaje) {

        alert(mensaje);

    }
}
