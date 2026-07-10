window.addEventListener("pageshow", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.reset();
    }

});

document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("loginForm")) initLogin();
    if (document.getElementById("userForm")) initUsuarios();

});

function initLogin() {

    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const btnSubmit = document.getElementById("btnLoginSubmit");

    loginForm.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const identificacion = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        loginError.classList.add("hidden");

        if (!identificacion || !password) {
            mostrarErrorLogin("Complete todos los campos.");
            return;
        }

        btnSubmit.disabled = true;
        btnSubmit.textContent = "Verificando...";

        try {

            const response = await httpClient(`${URL_BASE}usuarios.json`, null, "GET");
            const usuarios = await response.json();

            let acceso = false;

            if (usuarios) {

                for (const clave in usuarios) {

                    const usuario = usuarios[clave];

                    if (
                        String(usuario.identificacion) === identificacion &&
                        String(usuario.password) === password
                    ) {
                        acceso = true;
                        break;
                    }

                }

            }

            if (acceso) {
                sessionStorage.setItem("sesionActiva", "true");
                window.location.replace("usuarios.html");
            } else {
                mostrarErrorLogin("Identificación o contraseña incorrecta.");
            }

        } catch (error) {
            console.error(error);
            mostrarErrorLogin("Error al conectar con Firebase.");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Ingresar";
        }

    });

    function mostrarErrorLogin(texto) {
        loginError.textContent = texto;
        loginError.classList.remove("hidden");
    }

}

function initUsuarios() {

    const userForm = document.getElementById("userForm");
    const usersTableBody = document.getElementById("usersTableBody");
    const btnCancelUserEdit = document.getElementById("btnCancelUserEdit");
    const formUserTitle = document.getElementById("formUserTitle");
    const btnUserSubmit = document.getElementById("btnUserSubmit");

    cargarUsuarios();

    userForm.addEventListener("submit", guardarUsuario);
    btnCancelUserEdit.addEventListener("click", resetUserForm);

    async function guardarUsuario(e){

        e.preventDefault();

        const id = document.getElementById("userId").value;
        const identificacion = document.getElementById("userCedula").value.trim();
        const nombre = document.getElementById("userNombre").value.trim();
        const cargo = document.getElementById("userCargo").value;
        const password = document.getElementById("userPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if(
            !identificacion ||
            !nombre ||
            !cargo ||
            !password ||
            !confirmPassword
        ){
            showMsg("Complete todos los campos.", "warning");
            return;
        }

        if(!/^\d+$/.test(identificacion)){
            showMsg("La identificación debe contener solo números.", "warning");
            return;
        }

        if(password !== confirmPassword){
            showMsg("Las contraseñas no coinciden.", "warning");
            return;
        }

        if(/\s/.test(password)){
            showMsg("La contraseña no puede contener espacios.", "warning");
            return;
        }

        const restaurarBoton = setBtnLoading(btnUserSubmit, "Guardando...");

        try{

            const response = await httpClient(`${URL_BASE}usuarios.json`,null,"GET");
            const usuarios = await response.json();

            if(existeUsuarioDuplicado(usuarios,id,identificacion,nombre)){
                showMsg("Ya existe un usuario con esa identificación o nombre.", "warning");
                return;
            }

            const usuario={
                identificacion,
                nombre,
                cargo,
                password
            };

            if(id===""){

                const res=await httpClient(`${URL_BASE}usuarios.json`,usuario,"POST");
                const data=await res.json();

                usuario.id=data.name;

                await httpClient(`${URL_BASE}usuarios/${data.name}.json`,usuario,"PUT");

                showMsg("Usuario registrado correctamente.", "success");

            }else{

                usuario.id=id;

                await httpClient(`${URL_BASE}usuarios/${id}.json`,usuario,"PUT");

                showMsg("Usuario actualizado correctamente.", "success");

            }

            resetUserForm();
            cargarUsuarios();

        }catch(error){

            console.error(error);
            showMsg("Error al guardar el usuario.", "error");

        }finally{

            restaurarBoton();

        }

    }

    function existeUsuarioDuplicado(usuarios,idActual,identificacion,nombre){

        if(!usuarios) return false;

        for(const key in usuarios){

            if(key===idActual) continue;

            if(
                usuarios[key].identificacion===identificacion ||
                usuarios[key].nombre.toLowerCase()===nombre.toLowerCase()
            ){
                return true;
            }

        }

        return false;

    }

    async function cargarUsuarios(){

        usersTableBody.innerHTML="<tr><td colspan='4'>Cargando...</td></tr>";

        try{

            const response=await httpClient(`${URL_BASE}usuarios.json`,null,"GET");
            const usuarios=await response.json();

            usersTableBody.innerHTML="";

            if(!usuarios){

                usersTableBody.innerHTML="<tr><td colspan='4'>No hay usuarios registrados.</td></tr>";
                return;

            }

            for(const key in usuarios){

                const usuario=usuarios[key];

                usersTableBody.innerHTML+=`
                    <tr>
                        <td>${usuario.identificacion}</td>
                        <td>${usuario.nombre}</td>
                        <td>${usuario.cargo}</td>
                        <td>
                            <button class="btn btn-warning btnEditar" data-id="${key}">
                                Editar
                            </button>

                            <button class="btn btn-danger btnEliminar" data-id="${key}">
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `;

            }

            document.querySelectorAll(".btnEditar").forEach(btn=>{
                btn.addEventListener("click",()=>editarUsuario(btn.dataset.id));
            });

            document.querySelectorAll(".btnEliminar").forEach(btn=>{
                btn.addEventListener("click",()=>eliminarUsuario(btn.dataset.id));
            });

        }catch(error){

            console.error(error);

            usersTableBody.innerHTML="<tr><td colspan='4'>Error al cargar usuarios.</td></tr>";

        }

    }

    async function editarUsuario(id){

        try{

            const response=await httpClient(`${URL_BASE}usuarios/${id}.json`,null,"GET");
            const usuario=await response.json();

            document.getElementById("userId").value=id;
            document.getElementById("userCedula").value=usuario.identificacion;
            document.getElementById("userNombre").value=usuario.nombre;
            document.getElementById("userCargo").value=usuario.cargo;
            document.getElementById("userPassword").value=usuario.password;
            document.getElementById("confirmPassword").value=usuario.password;

            formUserTitle.textContent="Editar Usuario";
            btnUserSubmit.textContent="Actualizar Usuario";
            btnCancelUserEdit.classList.remove("hidden");

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

        }catch(error){

            console.error(error);
            showMsg("Error al cargar el usuario.", "error");

        }

    }

async function eliminarUsuario(id){

    if(!confirm("¿Desea eliminar este usuario?")) return;

    try{

        await httpClient(`${URL_BASE}usuarios/${id}.json`, null, "DELETE");

        if(document.getElementById("userId").value === id){
            resetUserForm();
        }

        cargarUsuarios();

        showMsg("Usuario eliminado correctamente.", "success");

    }catch(error){

        console.error(error);

        showMsg("Error al eliminar el usuario.", "error");

    }

}

    function resetUserForm(){

        userForm.reset();

        document.getElementById("userId").value="";

        formUserTitle.textContent="Registrar Usuario";

        btnUserSubmit.textContent="Guardar Usuario";

        btnCancelUserEdit.classList.add("hidden");

    }

}
