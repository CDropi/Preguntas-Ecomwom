const API_URL = "https://script.google.com/macros/s/AKfycbw7ojlM5LaoFMYs7lgel4hkixTakj4pIw9VJvBj3CR_uPpFjIM1sMqozoR1OTW12-6r/exec"; 

// Creamos una variable para guardar las preguntas que se están mostrando actualmente
let datosAnteriores = ""; 

async function actualizarPantalla() {
    try {
        const res = await fetch(`${API_URL}?type=get_screen`);
        const textoRespuesta = await res.text(); 
        
        try {
            const preguntas = JSON.parse(textoRespuesta);
            
            // Convertimos el arreglo de preguntas en texto para compararlo fácilmente
            const datosActuales = JSON.stringify(preguntas);

            // ¡LA MAGIA AQUÍ! Solo redibujamos la pantalla si hay cambios
            if (datosActuales !== datosAnteriores) {
                
                // Actualizamos nuestra memoria
                datosAnteriores = datosActuales; 
                
                const container = document.getElementById("container");
                container.innerHTML = ""; 
                
                preguntas.forEach(p => {
                    if(p.nombre && p.pregunta) {
                        container.innerHTML += `
                            <div class="tarjeta-pantalla">
                                <h3 class="nombre-pregunta">${p.nombre}</h3>
                                <div class="recuadro-gris">
                                    <p>"${p.pregunta}"</p>
                                </div>
                            </div>`;
                    }
                });
            }
        } catch (jsonError) {
            console.error("Error al procesar los datos:", textoRespuesta);
        }

    } catch (e) { 
        console.error("Error de conexión:", e); 
    }
}

// Se mantiene la consulta cada 3 segundos, pero ya no parpadeará
setInterval(actualizarPantalla, 3000);
actualizarPantalla();