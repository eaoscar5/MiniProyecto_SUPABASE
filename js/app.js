const tablaClientes = document.getElementById("tablaClientes");
const totalClientes = document.getElementById("totalClientes");

const inputClave = document.getElementById("clave");
const inputNombre = document.getElementById("nombre");
const inputEdad = document.getElementById("edad");
const inputFechaNacimiento = document.getElementById("fechaNacimiento");

const clienteForm = document.getElementById("clienteForm");
const btnNuevo = document.getElementById("btnNuevo");
const btnEliminar = document.getElementById("btnEliminar");

const estadoCliente = document.getElementById("estadoCliente");

let clienteExiste = false;

// Listar clientes

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
// Consultar info de cliente
        fila.addEventListener("click", () => {

            document
    .querySelectorAll("#tablaClientes tr")
    .forEach(f => f.classList.remove("seleccionado"));

fila.classList.add("seleccionado");

    inputClave.value = cliente.clave;
    inputNombre.value = cliente.nombre;
    inputEdad.value = cliente.edad;
    inputFechaNacimiento.value = cliente.fecha_nacimiento;

    clienteExiste = true;

    estadoCliente.textContent = "Cliente seleccionado.";
    estadoCliente.style.color = "#15803d";
});

        tablaClientes.appendChild(fila);
    });

    totalClientes.textContent =
        `${clientes.length} ${clientes.length === 1 ? "registro" : "registros"}`;
}


cargarClientes();

// Buscar cliente

async function buscarClientePorClave(clave) {

    if (clave.trim() === "") {
        clienteExiste = false;
        estadoCliente.textContent = "";
        return;
    }

    try {

        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/clientes?clave=eq.${encodeURIComponent(clave)}&select=*`,
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

        if (clientes.length > 0) {

            const cliente = clientes[0];

            inputNombre.value = cliente.nombre;
            inputEdad.value = cliente.edad;
            inputFechaNacimiento.value = cliente.fecha_nacimiento;

            clienteExiste = true;

            estadoCliente.textContent = "Cliente encontrado.";
            estadoCliente.style.color = "#15803d";

        } else {

            inputNombre.value = "";
            inputEdad.value = "";
            inputFechaNacimiento.value = "";

            clienteExiste = false;

            estadoCliente.textContent =
                "Clave disponible. Puedes registrar un nuevo cliente.";

            estadoCliente.style.color = "#2563eb";
        }

    } catch (error) {

        console.error("Error al buscar cliente:", error);

        estadoCliente.textContent =
            "No fue posible consultar el cliente.";

        estadoCliente.style.color = "#dc2626";
    }
}

inputClave.addEventListener("blur", () => {

    const clave = inputClave.value.trim();

    buscarClientePorClave(clave);
});

// Limpiar cliente

function limpiarFormulario() {

    clienteForm.reset();

    clienteExiste = false;

    estadoCliente.textContent = "";

    inputClave.focus();
}

btnNuevo.addEventListener("click", () => {
    limpiarFormulario();
});

// Verificar campos completos

function validarFormulario() {

    const clave = inputClave.value.trim();
    const nombre = inputNombre.value.trim();
    const edad = inputEdad.value;
    const fechaNacimiento = inputFechaNacimiento.value;

    if (
        clave === "" ||
        nombre === "" ||
        edad === "" ||
        fechaNacimiento === ""
    ) {

        estadoCliente.textContent =
            "Completa todos los campos.";

        estadoCliente.style.color = "#dc2626";

        return false;
    }

    const edadNumero = Number(edad);

    if (edadNumero < 0 || edadNumero > 120) {

        estadoCliente.textContent =
            "La edad debe estar entre 0 y 120 años.";

        estadoCliente.style.color = "#dc2626";

        return false;
    }

    return true;
}

// Crear cliente

async function insertarCliente(cliente) {

    const respuesta = await fetch(
        `${SUPABASE_URL}/rest/v1/clientes`,
        {
            method: "POST",

            headers: {
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },

            body: JSON.stringify(cliente)
        }
    );

    if (!respuesta.ok) {

        const error = await respuesta.text();

        throw new Error(
            `Error ${respuesta.status}: ${error}`
        );
    }

    return await respuesta.json();
}

// Actualizar cliente

async function actualizarCliente(clave, cliente) {

    const respuesta = await fetch(
        `${SUPABASE_URL}/rest/v1/clientes?clave=eq.${encodeURIComponent(clave)}`,
        {
            method: "PATCH",

            headers: {
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },

            body: JSON.stringify(cliente)
        }
    );

    if (!respuesta.ok) {

        const error = await respuesta.text();

        throw new Error(
            `Error ${respuesta.status}: ${error}`
        );
    }

    return await respuesta.json();
}

clienteForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const clave = inputClave.value.trim();

    const cliente = {
        clave: clave,
        nombre: inputNombre.value.trim(),
        edad: Number(inputEdad.value),
        fecha_nacimiento: inputFechaNacimiento.value
    };

    try {

        if (clienteExiste) {

            await actualizarCliente(clave, cliente);

            estadoCliente.textContent =
                "Cliente actualizado correctamente.";

        } else {

            await insertarCliente(cliente);

            clienteExiste = true;

            estadoCliente.textContent =
                "Cliente guardado correctamente.";
        }

        estadoCliente.style.color = "#15803d";

        await cargarClientes();

    } catch (error) {

        console.error("Error al guardar cliente:", error);

        estadoCliente.textContent =
            "Ocurrió un error al guardar el cliente.";

        estadoCliente.style.color = "#dc2626";
    }
});

// Comprobar si existe una clave antes de actualizar/cambiar ese campo 
// para evitar errores en caso de "clave nueva = clave existente"
inputClave.addEventListener("input", () => {

    clienteExiste = false;

    estadoCliente.textContent = "";
});

// Eliminar cliente

async function eliminarCliente(clave) {

    const respuesta = await fetch(
        `${SUPABASE_URL}/rest/v1/clientes?clave=eq.${encodeURIComponent(clave)}`,
        {
            method: "DELETE",

            headers: {
                "apikey": SUPABASE_KEY
            }
        }
    );

    if (!respuesta.ok) {

        const error = await respuesta.text();

        throw new Error(
            `Error ${respuesta.status}: ${error}`
        );
    }
}

btnEliminar.addEventListener("click", async () => {

    const clave = inputClave.value.trim();

    if (clave === "") {

        estadoCliente.textContent =
            "Selecciona un cliente para eliminar.";

        estadoCliente.style.color = "#dc2626";

        return;
    }

    if (!clienteExiste) {

        estadoCliente.textContent =
            "El cliente indicado no existe.";

        estadoCliente.style.color = "#dc2626";

        return;
    }

    const confirmar = confirm(
        `¿Deseas eliminar el cliente con clave ${clave}?`
    );

    if (!confirmar) {
        return;
    }

    try {

        await eliminarCliente(clave);

        limpiarFormulario();

        estadoCliente.textContent =
            "Cliente eliminado correctamente.";

        estadoCliente.style.color = "#15803d";

        await cargarClientes();

    } catch (error) {

        console.error("Error al eliminar cliente:", error);

        estadoCliente.textContent =
            "Ocurrió un error al eliminar el cliente.";

        estadoCliente.style.color = "#dc2626";
    }
});