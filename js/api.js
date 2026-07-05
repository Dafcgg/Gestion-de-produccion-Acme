
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

function showMsg(mensaje) {
    alert(mensaje);
}
