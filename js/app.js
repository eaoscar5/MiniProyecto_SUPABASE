const tablaClientes = document.getElementById("tablaClientes");
const totalClientes = document.getElementById("totalClientes");

async function cargarClientes() {

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/clientes?select=*&order=clave.asc`,
            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!respuesta.ok) {
            throw new Error(
                `Error ${respuesta.status}: ${respuesta.statusText}`
            );
        }

        const clientes = await respuesta.json();

        mostrarClientes(clientes);

    } catch (error) {

        console.error("Error al obtener clientes:", error);

    }
}


function mostrarClientes(clientes) {

    tablaClientes.innerHTML = "";

    clientes.forEach(cliente => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${cliente.clave}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.edad}</td>
            <td>${cliente.fecha_nacimiento}</td>
        `;

        tablaClientes.appendChild(fila);
    });

    totalClientes.textContent =
        `${clientes.length} ${clientes.length === 1 ? "registro" : "registros"}`;
}


cargarClientes();