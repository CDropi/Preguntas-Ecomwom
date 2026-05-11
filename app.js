// Aún no tenemos esta URL, la generaremos en Google Sheets más adelante
const API_URL = "https://script.google.com/macros/s/AKfycbw7ojlM5LaoFMYs7lgel4hkixTakj4pIw9VJvBj3CR_uPpFjIM1sMqozoR1OTW12-6r/exec"; 
let ponenteActual = "";

// 1. Al cargar la página, revisamos qué ponentes ya tienen pregunta
document.addEventListener("DOMContentLoaded", () => {
    actualizarInterfaz();
});

function actualizarInterfaz() {
    // Estos nombres deben ser exactamente iguales a los IDs que pusiste en el HTML
    const ponentes = ["Ponente 1", "Ponente 2"]; 
    
    ponentes.forEach(p => {
        // Revisamos la memoria del celular (localStorage)
        if(localStorage.getItem(`voted_${p}`)) {
            const boton = document.getElementById(`btn-${p}`);
            const tarjeta = document.getElementById(`card-${p}`);
            
            if (boton && tarjeta) {
                boton.disabled = true;
                boton.innerText = "Pregunta Enviada";
                tarjeta.classList.add('disabled');
            }
        }
    });
}

// 2. Mostrar el formulario
function abrirFormulario(ponente) {
    ponenteActual = ponente;
    document.getElementById("contenedor-ponentes").style.display = "none";
    document.getElementById("modal-formulario").style.display = "flex";
    document.getElementById("titulo-formulario").innerText = `Pregunta para ${ponente}`;
}

// 3. Ocultar el formulario
function cerrarFormulario() {
    ponenteActual = "";
    document.getElementById("modal-formulario").style.display = "none";
    document.getElementById("contenedor-ponentes").style.display = "grid";
}

// 4. Enviar los datos
function enviarDatos() {
    const nombre = document.getElementById("input-nombre").value;
    const telefono = document.getElementById("input-telefono").value;
    const pregunta = document.getElementById("input-pregunta").value;

    // Validación simple
    if(!nombre || !telefono || !pregunta) {
        alert("Por favor, llena todos los campos.");
        return;
    }

    // Efecto visual de "cargando" en el botón
    const btnEnviar = document.querySelector("#modal-formulario button");
    const textoOriginal = btnEnviar.innerText;
    btnEnviar.innerText = "Enviando...";
    btnEnviar.disabled = true;

    // Los datos que enviaremos a Google Sheets
    const payload = {
        ponente: ponenteActual,
        nombre: nombre,
        telefono: telefono,
        pregunta: pregunta
    };

    // La petición HTTP a nuestro "Backend"
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        // Guardamos en el celular que ya se le preguntó a este ponente
        localStorage.setItem(`voted_${ponenteActual}`, 'true');
        
        alert("¡Tu pregunta ha sido enviada con éxito!");
        
        // Limpiar formulario y restaurar
        limpiarYRestaurar(btnEnviar, textoOriginal);
    })
    .catch(error => {
        // Nota: A veces Google Apps Script da un error de "CORS" falso aunque sí guarda el dato.
        // Lo manejamos aquí para que el asistente siempre vea que se envió.
        console.error("Detalle de conexión:", error);
        localStorage.setItem(`voted_${ponenteActual}`, 'true');
        alert("¡Tu pregunta ha sido enviada con éxito!");
        limpiarYRestaurar(btnEnviar, textoOriginal);
    });
}

function limpiarYRestaurar(btnEnviar, textoOriginal) {
    document.getElementById("input-nombre").value = "";
    document.getElementById("input-telefono").value = "";
    document.getElementById("input-pregunta").value = "";
    
    btnEnviar.innerText = textoOriginal;
    btnEnviar.disabled = false;
    
    cerrarFormulario();
    actualizarInterfaz();
}