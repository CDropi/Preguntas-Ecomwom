const API_URL = "https://script.google.com/macros/s/AKfycbw7ojlM5LaoFMYs7lgel4hkixTakj4pIw9VJvBj3CR_uPpFjIM1sMqozoR1OTW12-6r/exec"; 

let listaPreguntas = []; // Guardará TODAS las preguntas traídas de Google Sheets
let seleccionadas = [];  // Guardará los índices [0, 1, 2] de las 3 preguntas en pantalla

async function iniciarCarga() {
    const ponente = document.getElementById("select-ponente").value;
    const container = document.getElementById("pantalla-preguntas");
    
    container.innerHTML = "<p>Consultando base de datos...</p>";

    try {
        // Hacemos un GET a la misma URL, pasando el nombre del ponente en el enlace
        const response = await fetch(`${API_URL}?ponente=${ponente}`);
        listaPreguntas = await response.json();

        // Validamos que haya al menos 4 preguntas para jugar
        if(listaPreguntas.length < 4) {
            container.innerHTML = `<p>Aún no hay suficientes preguntas para ${ponente}. (Hay ${listaPreguntas.length}/4)</p>`;
            return;
        }

        // Si hay 4 o más, procedemos a seleccionar
        seleccionarAleatorias();
        
    } catch (error) {
        console.error("Error al cargar:", error);
        container.innerHTML = "<p>Error al conectar con Google Sheets.</p>";
    }
}

function seleccionarAleatorias() {
    seleccionadas = [];
    // Creamos un arreglo con las posiciones posibles [0, 1, 2, 3...]
    let indicesDisponibles = Array.from({length: listaPreguntas.length}, (_, i) => i);
    
    // Desordenamos el arreglo (Shuffle)
    indicesDisponibles.sort(() => Math.random() - 0.5);
    
    // Tomamos los primeros 4
    seleccionadas = indicesDisponibles.slice(0, 4);
    
    renderizarPantalla();
}

function cambiarPregunta(posicionEnPantalla) {
    // Si tenemos exactamente 4 preguntas en total, no hay por qué cambiar
    if (listaPreguntas.length <= 4) {
        alert("No hay más preguntas disponibles en la base de datos para sustituir.");
        return;
    }

    let nuevoIndex;
    let intentos = 0;
    
    // Buscamos un índice aleatorio que NO esté actualmente en la pantalla
    do {
        nuevoIndex = Math.floor(Math.random() * listaPreguntas.length);
        intentos++;
        if(intentos > 100) break; // Seguridad para evitar bucles infinitos
    } while (seleccionadas.includes(nuevoIndex));

    // Reemplazamos la pregunta que no nos gustó por la nueva
    seleccionadas[posicionEnPantalla] = nuevoIndex;
    
    // Volvemos a dibujar
    renderizarPantalla();
}

function renderizarPantalla() {
    const container = document.getElementById("pantalla-preguntas");
    container.innerHTML = ""; // Limpiamos la pantalla

    // Recorremos los 3 índices elegidos para dibujar las tarjetas
    seleccionadas.forEach((indexOriginal, i) => {
        const p = listaPreguntas[indexOriginal];
        const div = document.createElement("div");
        div.className = "pregunta-card";
        
        // i es la posición en la pantalla (0, 1 o 2). Se lo pasamos al botón de cambiar.
        div.innerHTML = `
            <h3>${p.nombre} pregunta:</h3>
            <p>"${p.pregunta}"</p>
            <button class="btn-cambiar" onclick="cambiarPregunta(${i})">🔄 Cambiar</button>
        `;
        container.appendChild(div);
    });
}

async function proyectarAPantalla() {
    const preguntasAEnviar = seleccionadas.map(index => listaPreguntas[index]);
    
    const payload = {
        type: "update_screen",
        preguntas: preguntasAEnviar
    };

    const btn = document.getElementById("btn-proyectar");
    btn.innerText = "Enviando...";
    
    await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    btn.innerText = "🚀 Proyectar en Pantalla";
    alert("¡Las preguntas ya están en la pantalla principal!");
}