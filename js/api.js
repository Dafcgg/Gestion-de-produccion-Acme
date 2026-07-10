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


function getToastContainer() {

    let contenedor = document.getElementById("toastContainer");

    if (!contenedor) {

        contenedor = document.createElement("div");
        contenedor.id = "toastContainer";
        contenedor.style.position = "fixed";
        contenedor.style.top = "20px";
        contenedor.style.right = "20px";
        contenedor.style.zIndex = "9999";
        contenedor.style.display = "flex";
        contenedor.style.flexDirection = "column";
        contenedor.style.gap = "10px";
        contenedor.style.maxWidth = "90vw";

        document.body.appendChild(contenedor);

    }

    return contenedor;

}

function showMsg(mensaje, tipo = "info") {

    const colores = {
        success: { fondo: "#16a34a", texto: "#fff" },
        error:   { fondo: "#dc2626", texto: "#fff" },
        warning: { fondo: "#f59e0b", texto: "#fff" },
        info:    { fondo: "#1E3A8A", texto: "#fff" }
    };

    const color = colores[tipo] || colores.info;

    const contenedor = getToastContainer();

    const toast = document.createElement("div");

    toast.textContent = mensaje;
    toast.style.background = color.fondo;
    toast.style.color = color.texto;
    toast.style.padding = "14px 20px";
    toast.style.borderRadius = "10px";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,.25)";
    toast.style.fontSize = "15px";
    toast.style.fontWeight = "500";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "all .3s ease";
    toast.style.maxWidth = "380px";

    contenedor.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";

        setTimeout(() => toast.remove(), 300);

    }, 3500);

}



function setBtnLoading(boton, textoCargando = "Guardando...") {

    if (!boton) return () => {};

    const textoOriginal = boton.textContent;

    boton.disabled = true;
    boton.dataset.textoOriginal = textoOriginal;
    boton.textContent = textoCargando;

    return function restaurar(textoFinal) {

        boton.disabled = false;
        boton.textContent = textoFinal || boton.dataset.textoOriginal || textoOriginal;

    };

}

