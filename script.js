document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const startScreen = document.getElementById('start-screen');
    const instruccionesAprendizajeScreen = document.getElementById('instrucciones-aprendizaje-screen');
    const instruccionesHabilidadScreen = document.getElementById('instrucciones-habilidad-screen');
    const instruccionesDestrezaScreen = document.getElementById('instrucciones-destreza-screen');
    const gameScreen = document.getElementById('game-screen');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const modoTitulo = document.getElementById('modo-titulo');
    const puntosContainer = document.getElementById('puntos-container');
    const puntosValor = document.getElementById('puntos-valor');
    const backToStartBtn = document.getElementById('back-to-start-btn');
    const gameUi = document.getElementById('game-ui');

    // --- Variables y funciones de reinicio global ---
    let animationFrameId;
    let modoActual = null; // 'aprendizaje', 'habilidad' o 'destreza'

    function reiniciarJuego() {
        // Detener cualquier animación pendiente
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        // Reiniciar modo actual
        modoActual = null;

        // Restaurar estado visual básico
        canvas.style.boxShadow = 'none';
        plantaImagen.src = imagenes.pequena;
        puntosContainer.style.display = 'none';
        puntosValor.innerText = '0';

        // Cerrar posibles popups de mensaje que hayan quedado abiertos
        document.querySelectorAll('.popup.mensaje-popup').forEach(p => p.remove());

        // Limpiar intervalos heredados (por compatibilidad con versiones anteriores)
        if (window.modoInterval) {
            clearInterval(window.modoInterval);
            window.modoInterval = null;
        }

        // Reestablecer estados de los modos
        aprendizajeState = {
            emojisActivos: [],
            buenosColocados: 0,
            etapa: 0,
            plantaImg: 'pequena',
            esperandoPopup: false,
            ultimoEmoji: null,
            buenosPorEtapa: [[], [], []]
        };

        habilidadState = {
            puntos: 0,
            etapa: 0,
            emojisEnCola: [],
            velocidad: 2,
            frame: 0,
            plantaImg: 'pequena',
            esperandoPopup: false,
            ultimoNombre: null,
            ultimoEsBueno: null
        };

        destrezaState = {
            barraIzq: 50,
            barraDer: 50,
            etapa: 0,
            emojisColaIzq: [],
            emojisColaDer: [],
            velocidad: VELOCIDAD_BAJADA_DESTREZA,
            esperandoPopup: false,
            ultimoNombre: null,
            ultimoEsBueno: null
        };
    }

    // --- Botones de navegación ---
    document.getElementById('instrucciones-aprendizaje-btn').addEventListener('click', () => {
        startScreen.classList.remove('active');
        instruccionesAprendizajeScreen.classList.add('active');
    });
    document.getElementById('instrucciones-habilidad-btn').addEventListener('click', () => {
        startScreen.classList.remove('active');
        instruccionesHabilidadScreen.classList.add('active');
    });
    document.getElementById('jugar-aprendizaje-btn').addEventListener('click', () => {
        instruccionesAprendizajeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        iniciarModoAprendizaje();
    });
    document.getElementById('jugar-habilidad-btn').addEventListener('click', () => {
        instruccionesHabilidadScreen.classList.remove('active');
        gameScreen.classList.add('active');
        iniciarModoHabilidad();
    });
    document.getElementById('instrucciones-destreza-btn').addEventListener('click', () => {
        startScreen.classList.remove('active');
        instruccionesDestrezaScreen.classList.add('active');
    });
    document.getElementById('jugar-destreza-btn').addEventListener('click', () => {
        instruccionesDestrezaScreen.classList.remove('active');
        gameScreen.classList.add('active');
        iniciarModoDestreza();
    });
    backToStartBtn.addEventListener('click', () => {
        // Reiniciar todo y volver al inicio
        reiniciarJuego();
        gameScreen.classList.remove('active');
        startScreen.classList.add('active');
    });

    // --- Variables globales del juego ---
    let plantaImagen = new Image();
    let plantaActual = 'pequena'; // pequena, mediana, grande
    const imagenes = {
        pequena: 'Planta pequeña.png',
        mediana: 'Planta mediana.png',
        grande: 'Planta grande.png'
    };
    plantaImagen.src = imagenes.pequena;

    // --- Emojis y sus mensajes (para ambos modos) ---
    const emojisBuenos = [
        { emoji: '💧', nombre: 'Agua', mensaje: '💧 El agua es vida. ¡Gracias por hidratarme! Así como agradecemos por el agua que bebemos.' },
        { emoji: '🪴', nombre: 'Tierra', mensaje: '🪴 Rica tierra me da hogar y comida. Demos gracias por la tierra que nos sostiene.' },
        { emoji: '🌬️', nombre: 'Aire', mensaje: '🌬️ El aire me ayuda a respirar. ¡Gracias por el aire limpio! Agradece cada respiro.' },
        { emoji: '☀️', nombre: 'Sol', mensaje: '☀️ El sol me da energía. Agradezcamos por sus cálidos rayos cada día.' },
        { emoji: '💩', nombre: 'Abono', mensaje: '💩 El abono me nutre fuerte. ¡Gracias por este regalo de la naturaleza! Agradece por lo que la tierra nos da.' },
        { emoji: '🐝', nombre: 'Abeja', mensaje: '🐝 Las abejas me ayudan a dar flores y frutos. ¡Gracias, abejitas! Agradece por los polinizadores.' },
        { emoji: '❤️', nombre: 'Amor', mensaje: '❤️ El amor me hace sentir cuidada. Dar las gracias con amor hace crecer el corazón.' },
        { emoji: '👀', nombre: 'Cuidado', mensaje: '👀 Me observas y cuidas. La gratitud es poner atención a lo que nos rodea.' },
        { emoji: '🐞', nombre: 'Mariquita', mensaje: '🐞 Las mariquitas me protegen de plagas. ¡Gracias, amiguita! Agradece a los pequeños ayudantes.' },
        { emoji: '⏰', nombre: 'Tiempo', mensaje: '⏰ El tiempo y la paciencia me hacen crecer. Agradece por el tiempo que tienes para aprender.' },
        { emoji: '🤝', nombre: 'Protección', mensaje: '🤝 Manos que protegen. Gracias por cuidarme de los peligros. Agradece a quienes te protegen.' },
        { emoji: '🗣️', nombre: 'Palabras', mensaje: '🗣️ Las palabras bonitas me alegran. Dar las gracias con palabras mágicas es muy poderoso.' }
    ];
    const emojisMalos = [
        { emoji: '🪨', nombre: 'Piedra', mensaje: '🪨 Las piedras aplastan mis raíces. Cuidado por dónde pisas. Agradece por los caminos despejados.' },
        { emoji: '🔥', nombre: 'Fuego', mensaje: '🔥 El fuego me quema. ¡Qué peligro! Agradece por la seguridad y la calma.' },
        { emoji: '🪵', nombre: 'Tronco Seco', mensaje: '🪵 La falta de agua me seca. No olvides hidratarme. Agradece por el agua que nos quita la sed.' },
        { emoji: '👟', nombre: 'Zapato', mensaje: '👟 Cuidado no me pisotees. Agradece por respetar a los seres vivos.' }
    ];
    const todosLosEmojis = [...emojisBuenos, ...emojisMalos];

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    // --- Modo Aprendizaje ---
    let aprendizajeState = {
        emojisActivos: [],
        buenosColocados: 0,
        etapa: 0, // 0: pequeña, 1: mediana, 2: grande (última etapa es victoria)
        plantaImg: null,
        esperandoPopup: false,
        ultimoEmoji: null,
        buenosPorEtapa: [[], [], []] // 3 grupos de 4 emojis buenos, todos distintos
    };

    function iniciarModoAprendizaje() {
        reiniciarJuego();
        modoActual = 'aprendizaje';
        puntosContainer.style.display = 'none';
        modoTitulo.innerText = '🌱 Modo Aprendizaje';

        aprendizajeState = {
            emojisActivos: [],
            buenosColocados: 0,
            etapa: 0,
            plantaImg: 'pequena',
            esperandoPopup: false,
            ultimoEmoji: null,
            buenosPorEtapa: [[], [], []]
        };

        plantaImagen.src = imagenes.pequena;
        canvas.style.pointerEvents = 'auto';

        inicializarBuenosPorEtapa();
        aprendizajeState.emojisActivos = generarEmojisParaEtapa(aprendizajeState.etapa);

        dibujarCanvasAprendizaje();
    }

    // Crea 3 grupos de 4 emojis buenos, todos distintos entre sí (12 en total)
    function inicializarBuenosPorEtapa() {
        const buenosMezclados = [...emojisBuenos].sort(() => Math.random() - 0.5);
        const seleccion = buenosMezclados.slice(0, 12); // tenemos exactamente 12 buenos definidos
        aprendizajeState.buenosPorEtapa = [
            seleccion.slice(0, 4),
            seleccion.slice(4, 8),
            seleccion.slice(8, 12)
        ];
    }

    // Velocidad base y factor de etapa para que el cambio sea sutil y controlado
    const VELOCIDAD_BASE_APRENDIZAJE = 1;
    const FACTOR_ETAPA_APRENDIZAJE = 1; // cada etapa aumenta un 8% aprox

    // Velocidad suave para que los emojis "floten" lentamente (se ajusta por etapa)
    function velocidadAleatoriaSuave() {
        const angulo = Math.random() * Math.PI * 2;
        const velocidad =
            VELOCIDAD_BASE_APRENDIZAJE *
            (1 + FACTOR_ETAPA_APRENDIZAJE * (aprendizajeState.etapa || 0)) *
            (0.8 + Math.random() * 0.4); // pequeña variación aleatoria
        return {
            vx: Math.cos(angulo) * velocidad,
            vy: Math.sin(angulo) * velocidad
        };
    }

    // Crea un emoji físico (con posición, radio y velocidad) sin chocar con la planta ni con otros emojis existentes
    function crearEmojiSinColisiones(baseData, existentes, idSuffix) {
        const radio = 30;
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const radioPlantaSeguro = 90 + radio; // radio aproximado de la planta + emoji
        const paddingBorde = radio + 10;

        let x, y, dx, dy, distancia;
        let valido = false;
        let intentos = 0;

        while (!valido && intentos < 60) {
            intentos++;
            x = Math.random() * (canvas.width - paddingBorde * 2) + paddingBorde;
            y = Math.random() * (canvas.height - paddingBorde * 2) + paddingBorde;

            dx = x - centroX;
            dy = y - centroY;
            distancia = Math.sqrt(dx * dx + dy * dy);

            // No debe estar sobre la planta
            if (distancia < radioPlantaSeguro) continue;

            // No debe nacer solapado con otros emojis
            let chocaConOtro = false;
            for (let otro of existentes) {
                const rOtro = otro.radio || radio;
                const distOtro = Math.hypot(x - otro.x, y - otro.y);
                if (distOtro < radio + rOtro + 8) {
                    chocaConOtro = true;
                    break;
                }
            }
            if (!chocaConOtro) {
                valido = true;
            }
        }

        const { vx, vy } = velocidadAleatoriaSuave();

        return {
            ...baseData,
            x,
            y,
            radio,
            vx,
            vy,
            id: `emoji-${idSuffix}-${Date.now()}-${intentos}`
        };
    }

    // Genera emojis para una etapa concreta:
    // - 4 buenos específicos de esa etapa (todos distintos respecto a las otras etapas)
    // - varios malos de distracción
    function generarEmojisParaEtapa(etapa) {
        const buenosEtapa = aprendizajeState.buenosPorEtapa[etapa] || [];
        const emojis = [];

        // Añadir buenos de la etapa
        buenosEtapa.forEach((data, index) => {
            emojis.push(crearEmojiSinColisiones(data, emojis, `b-${etapa}-${index}`));
        });

        // Añadir la misma cantidad de malos para que haya distracción
        const cantidadMalos = buenosEtapa.length;
        for (let i = 0; i < cantidadMalos; i++) {
            const baseData = emojisMalos[Math.floor(Math.random() * emojisMalos.length)];
            emojis.push(crearEmojiSinColisiones(baseData, emojis, `m-${etapa}-${i}`));
        }

        return emojis;
    }

    // Rellena con algunos malos extra si quedan muy pocos emojis visibles
    function rellenarEmojisMalosSiPocos() {
        const activos = aprendizajeState.emojisActivos;
        if (activos.length >= 4) return;

        const faltan = 4 - activos.length;
        for (let i = 0; i < faltan; i++) {
            const baseData = emojisMalos[Math.floor(Math.random() * emojisMalos.length)];
            const nuevo = crearEmojiSinColisiones(baseData, activos, `extra-${i}`);
            activos.push(nuevo);
        }
    }

    function actualizarFisicaEmojisAprendizaje() {
        const emojis = aprendizajeState.emojisActivos;
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const radioPlanta = 80; // radio aproximado del área de la planta
        const padding = 10;

        // Calcular límite superior teniendo en cuenta la UI (botones de arriba)
        let limiteSuperior = padding;
        if (gameUi) {
            const canvasRect = canvas.getBoundingClientRect();
            const uiRect = gameUi.getBoundingClientRect();
            // Distancia desde la parte superior del canvas hasta la parte inferior de la UI
            const alturaUiEnCanvas = uiRect.bottom - canvasRect.top;
            if (!isNaN(alturaUiEnCanvas) && alturaUiEnCanvas > 0) {
                limiteSuperior = Math.max(limiteSuperior, alturaUiEnCanvas + padding);
            }
        }

        // Movimiento básico y rebotes con bordes y planta
        emojis.forEach(e => {
            if (draggedEmoji && e.id === draggedEmoji.id) return;

            const radio = e.radio || 30;
            if (typeof e.vx !== 'number' || typeof e.vy !== 'number') {
                const vel = velocidadAleatoriaSuave();
                e.vx = vel.vx;
                e.vy = vel.vy;
            }

            e.x += e.vx;
            e.y += e.vy;

            // Rebote con bordes del contenedor del juego
            if (e.x - radio < padding) {
                e.x = padding + radio;
                e.vx = Math.abs(e.vx);
            } else if (e.x + radio > canvas.width - padding) {
                e.x = canvas.width - padding - radio;
                e.vx = -Math.abs(e.vx);
            }

            if (e.y - radio < limiteSuperior) {
                e.y = limiteSuperior + radio;
                e.vy = Math.abs(e.vy);
            } else if (e.y + radio > canvas.height - padding) {
                e.y = canvas.height - padding - radio;
                e.vy = -Math.abs(e.vy);
            }

            // Evitar que pasen por encima de la planta central
            const dx = e.x - centroX;
            const dy = e.y - centroY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const distanciaMinima = radioPlanta + radio + 5;
            if (dist > 0 && dist < distanciaMinima) {
                const nx = dx / dist;
                const ny = dy / dist;
                const solape = distanciaMinima - dist;
                e.x += nx * solape;
                e.y += ny * solape;

                const dot = e.vx * nx + e.vy * ny;
                e.vx = e.vx - 2 * dot * nx;
                e.vy = e.vy - 2 * dot * ny;
            }
        });

        // Colisiones entre emojis (rebote simple)
        for (let i = 0; i < emojis.length; i++) {
            for (let j = i + 1; j < emojis.length; j++) {
                const a = emojis[i];
                const b = emojis[j];
                if (draggedEmoji && (a.id === draggedEmoji.id || b.id === draggedEmoji.id)) continue;

                const radioA = a.radio || 30;
                const radioB = b.radio || 30;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const distanciaMinima = radioA + radioB;

                if (dist > 0 && dist < distanciaMinima) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const solape = distanciaMinima - dist;

                    // Separar los emojis para que no se solapen
                    a.x -= nx * solape / 2;
                    a.y -= ny * solape / 2;
                    b.x += nx * solape / 2;
                    b.y += ny * solape / 2;

                    // Rebote elástico simple (masas iguales)
                    const dvx = b.vx - a.vx;
                    const dvy = b.vy - a.vy;
                    const p = (2 * (dvx * nx + dvy * ny)) / 2;

                    a.vx += p * nx;
                    a.vy += p * ny;
                    b.vx -= p * nx;
                    b.vy -= p * ny;
                }
            }
        }
    }

    function dibujarCanvasAprendizaje() {
        if (modoActual !== 'aprendizaje') return;

        actualizarFisicaEmojisAprendizaje();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar planta en el centro
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        if (plantaImagen.complete) {
            const size = 150;
            ctx.drawImage(plantaImagen, centroX - size/2, centroY - size/2, size, size);
        } else {
            plantaImagen.onload = () => dibujarCanvasAprendizaje();
        }
        
        // Dibujar emojis flotantes (centrados en su círculo)
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        aprendizajeState.emojisActivos.forEach(e => {
            const radio = e.radio || 30;

            // Emoji
            ctx.fillText(e.emoji, e.x, e.y);

            // Círculo alrededor
            ctx.beginPath();
            ctx.arc(e.x, e.y, radio, 0, 2 * Math.PI);
            ctx.strokeStyle = '#f0b27a';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        animationFrameId = requestAnimationFrame(dibujarCanvasAprendizaje);
    }

    // --- Modo Habilidad ---
    let habilidadState = {
        puntos: 0,
        etapa: 0,
        emojisEnCola: [],
        velocidad: 2,
        frame: 0,
        plantaImg: 'pequena',
        esperandoPopup: false,
        ultimoNombre: null,
        ultimoEsBueno: null
    };

    function iniciarModoHabilidad() {
        reiniciarJuego();
        modoActual = 'habilidad';
        puntosContainer.style.display = 'inline-block';
        puntosValor.innerText = '0';
        modoTitulo.innerText = '⚡ Modo Habilidad';
        habilidadState = {
            puntos: 0,
            etapa: 0,
            emojisEnCola: [],
            velocidad: 2,
            frame: 0,
            plantaImg: 'pequena',
            esperandoPopup: false,
            ultimoNombre: null,
            ultimoEsBueno: null
        };
        plantaImagen.src = imagenes.pequena;
        canvas.style.pointerEvents = 'auto';
        generarColaEmojis();
        dibujarCanvasHabilidad();
    }

    // Radio de la zona de impacto de la planta (círculo amarillo)
    const RADIO_ZONA_IMPACTO = 60;
    // Espacio entre emojis en la cinta: igual al diámetro del círculo
    const ESPACIO_ENTRE_EMOJIS = RADIO_ZONA_IMPACTO * 2;
    // Centro vertical único: emojis y círculo usan el mismo para que crucen por el centro
    function getCentroYHabilidad() { return canvas.height / 2; }

    function generarColaEmojis() {
        const centroY = getCentroYHabilidad();
        const cola = [];
        // 50% buenos, 50% malos, orden mezclado para que no estén todos juntos
        const tipos = [];
        for (let i = 0; i < 15; i++) tipos.push('bueno');
        for (let i = 0; i < 15; i++) tipos.push('malo');
        shuffleArray(tipos);

        let emojiAnterior = null;
        for (let i = 0; i < 30; i++) {
            const esBueno = tipos[i] === 'bueno';
            const arr = esBueno ? emojisBuenos : emojisMalos;
            const opciones = emojiAnterior ? arr.filter(d => d.emoji !== emojiAnterior) : arr;
            const data = opciones.length ? opciones[Math.floor(Math.random() * opciones.length)] : arr[Math.floor(Math.random() * arr.length)];
            emojiAnterior = data.emoji;
            cola.push({
                ...data,
                x: -50 - i * ESPACIO_ENTRE_EMOJIS,
                y: centroY,
                activo: true
            });
        }
        habilidadState.emojisEnCola = cola;
    }

    function dibujarCanvasHabilidad() {
        if (modoActual !== 'habilidad') return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centroX = canvas.width / 2;
        const centroY = getCentroYHabilidad();

        // Área de impacto (círculo semitransparente) centrado en la planta
        ctx.beginPath();
        ctx.arc(centroX, centroY, RADIO_ZONA_IMPACTO, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Dibujar planta
        if (plantaImagen.complete) {
            const size = 130;
            ctx.drawImage(plantaImagen, centroX - size/2, centroY - size/2, size, size);
        }

        // Dibujar emojis en movimiento: misma Y que el centro para que crucen por el centro
        habilidadState.emojisEnCola.forEach(e => {
            e.x += habilidadState.velocidad;
            if (e.activo) {
                ctx.save();
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#000000';
                ctx.font = '50px Arial';
                ctx.textBaseline = 'middle'; // centro vertical del emoji en e.y
                ctx.fillText(e.emoji, e.x, e.y);
                ctx.restore();
            }
        });

        // Nombre del último emoji pulsado, debajo de la planta (verde = bueno, rojo = malo)
        if (habilidadState.ultimoNombre) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = habilidadState.ultimoEsBueno ? '#0a7d0a' : '#c00';
            ctx.fillText(habilidadState.ultimoNombre, centroX, centroY + 85);
            ctx.restore();
        }

        // Reciclar emojis que salieron de la pantalla: 50/50 bueno/malo, distinto al vecino
        const margenSalida = 80;
        let minX = Infinity;
        habilidadState.emojisEnCola.forEach(em => {
            if (em.x < minX) minX = em.x;
        });
        const emojiVecinoDerecha = habilidadState.emojisEnCola.find(em => Math.abs(em.x - minX) < 0.5);
        let evitarEmoji = emojiVecinoDerecha ? emojiVecinoDerecha.emoji : null;
        let nuevoMinX = minX;
        habilidadState.emojisEnCola.forEach(e => {
            if (e.x > canvas.width + margenSalida) {
                const esBueno = Math.random() < 0.5;
                const arr = esBueno ? emojisBuenos : emojisMalos;
                const opciones = evitarEmoji ? arr.filter(d => d.emoji !== evitarEmoji) : arr;
                const data = opciones.length ? opciones[Math.floor(Math.random() * opciones.length)] : arr[Math.floor(Math.random() * arr.length)];
                Object.assign(e, data);
                e.x = nuevoMinX - ESPACIO_ENTRE_EMOJIS;
                e.y = getCentroYHabilidad();
                e.activo = true;
                nuevoMinX = e.x;
                evitarEmoji = e.emoji;
            }
        });

        // Detectar colisiones con clics (se hace en evento de canvas)
        
        animationFrameId = requestAnimationFrame(dibujarCanvasHabilidad);
    }

    // --- Modo Destreza ---
    const RADIO_DESTREZA = 60;
    const ESPACIO_VERTICAL_DESTREZA = RADIO_DESTREZA * 2; // mismo diámetro que el círculo (ref. Modo habilidad)
    const VELOCIDAD_BAJADA_DESTREZA = 2;
    const SUBIDA_BARRA_BUENO = 18;
    const BAJADA_BARRA_MALO = 30;
    const DECAY_BARRA_POR_FRAME = 0.04;
    const UMBRAL_DESTREZA = 90; // porcentaje a partir del cual cuenta para el cambio de planta

    let destrezaState = {
        barraIzq: 50,
        barraDer: 50,
        etapa: 0, // 0: Planta 1 -> 2, 1: Planta 2 -> 3, 2: Planta 3 -> victoria
        emojisColaIzq: [],
        emojisColaDer: [],
        velocidad: VELOCIDAD_BAJADA_DESTREZA,
        esperandoPopup: false,
        ultimoNombre: null,
        ultimoEsBueno: null,
        terminado: false // indica victoria final para no mostrar derrota después
    };

    function getCentrosDestreza() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const centroYPlanta = cy;  // planta en el centro, igual que Modo Aprendizaje
        const centroYCirculos = cy + canvas.height * 0.28;  // círculos debajo de la planta
        const separacion = canvas.width * 0.22;
        return {
            planta: { x: cx, y: centroYPlanta },
            izq: { x: cx - separacion, y: centroYCirculos },
            der: { x: cx + separacion, y: centroYCirculos }
        };
    }

    function generarColaVerticalDestreza(centroX, esIzq) {
        const centros = getCentrosDestreza();
        const columnaY = esIzq ? centros.izq.y : centros.der.y;
        const tipos = [];
        for (let i = 0; i < 12; i++) tipos.push('bueno');
        for (let i = 0; i < 12; i++) tipos.push('malo');
        shuffleArray(tipos);
        const cola = [];
        let emojiAnterior = null;
        for (let i = 0; i < 24; i++) {
            const esBueno = tipos[i] === 'bueno';
            const arr = esBueno ? emojisBuenos : emojisMalos;
            const opciones = emojiAnterior ? arr.filter(d => d.emoji !== emojiAnterior) : arr;
            const data = opciones.length ? opciones[Math.floor(Math.random() * opciones.length)] : arr[Math.floor(Math.random() * arr.length)];
            emojiAnterior = data.emoji;
            cola.push({
                ...data,
                x: centroX,
                y: -80 - i * ESPACIO_VERTICAL_DESTREZA,
                activo: true,
                id: `d-${esIzq ? 'L' : 'R'}-${i}-${Date.now()}`
            });
        }
        return cola;
    }

    function iniciarModoDestreza() {
        reiniciarJuego();
        modoActual = 'destreza';
        puntosContainer.style.display = 'none';
        modoTitulo.innerText = '🎯 Modo Destreza';
        const centros = getCentrosDestreza();
        destrezaState = {
            barraIzq: 50,
            barraDer: 50,
            etapa: 0,
            emojisColaIzq: generarColaVerticalDestreza(centros.izq.x, true),
            emojisColaDer: generarColaVerticalDestreza(centros.der.x, false),
            velocidad: VELOCIDAD_BAJADA_DESTREZA,
            esperandoPopup: false,
            ultimoNombre: null,
            ultimoEsBueno: null,
            terminado: false
        };
        plantaImagen.src = imagenes.pequena;
        canvas.style.pointerEvents = 'auto';
        dibujarCanvasDestreza();
    }

    function dibujarCanvasDestreza() {
        if (modoActual !== 'destreza') return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centros = getCentrosDestreza();
        const R = RADIO_DESTREZA;

        // Planta en el centro arriba
        if (plantaImagen.complete) {
            const size = 130;
            ctx.drawImage(plantaImagen, centros.planta.x - size / 2, centros.planta.y - size / 2, size, size);
        }

        // Actualización de barras y movimiento SOLO si no hay popup en pantalla
        if (!destrezaState.esperandoPopup) {
            // Decay de barras (lento si no tocas buenos)
            destrezaState.barraIzq = Math.max(0, destrezaState.barraIzq - DECAY_BARRA_POR_FRAME);
            destrezaState.barraDer = Math.max(0, destrezaState.barraDer - DECAY_BARRA_POR_FRAME);

            // Si alguna barra llega a 0, la planta "muere" y se pierde la partida
            // (solo si aún no se ha ganado el juego)
            if (!destrezaState.terminado && (destrezaState.barraIzq <= 0 || destrezaState.barraDer <= 0)) {
                destrezaState.esperandoPopup = true;
                mostrarPopupDerrotaDestreza();
            }

            // Mover emojis hacia abajo (izq y der)
            destrezaState.emojisColaIzq.forEach(e => {
                e.y += destrezaState.velocidad;
            });
            destrezaState.emojisColaDer.forEach(e => {
                e.y += destrezaState.velocidad;
            });

            // Reciclar emojis que salieron por abajo: recolocar arriba
            const margenAbajo = 100;
            const techo = -80;
            function reciclarColumna(columna, centroX) {
                let minY = Infinity;
                columna.forEach(em => { if (em.y < minY) minY = em.y; });
                let nuevoMinY = minY;
                columna.forEach(e => {
                    if (e.y > canvas.height + margenAbajo) {
                        const esBueno = Math.random() < 0.5;
                        const arr = esBueno ? emojisBuenos : emojisMalos;
                        const data = arr[Math.floor(Math.random() * arr.length)];
                        Object.assign(e, data);
                        e.y = nuevoMinY - ESPACIO_VERTICAL_DESTREZA;
                        e.activo = true;
                        nuevoMinY = e.y;
                    }
                });
            }
            reciclarColumna(destrezaState.emojisColaIzq, centros.izq.x);
            reciclarColumna(destrezaState.emojisColaDer, centros.der.x);
        }

        // Dibujar círculo izquierdo + barra alrededor
        ctx.save();
        ctx.beginPath();
        ctx.arc(centros.izq.x, centros.izq.y, R + 12, 0, 2 * Math.PI);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 8;
        ctx.stroke();
        // Barra de progreso
        ctx.beginPath();
        ctx.arc(
            centros.izq.x,
            centros.izq.y,
            R + 12,
            -Math.PI / 2,
            -Math.PI / 2 + (destrezaState.barraIzq / 100) * 2 * Math.PI
        );
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 8;
        ctx.stroke();
        // Marca visual del umbral (pequeño arco resaltado)
        const angUmbral = -Math.PI / 2 + (UMBRAL_DESTREZA / 100) * 2 * Math.PI;
        const anchoUmbral = 0.3;
        ctx.beginPath();
        ctx.arc(
            centros.izq.x,
            centros.izq.y,
            R + 16,
            angUmbral - anchoUmbral / 2,
            angUmbral + anchoUmbral / 2
        );
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centros.izq.x, centros.izq.y, R, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // Círculo derecho + barra
        ctx.save();
        ctx.beginPath();
        ctx.arc(centros.der.x, centros.der.y, R + 12, 0, 2 * Math.PI);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 8;
        ctx.stroke();
        // Barra de progreso
        ctx.beginPath();
        ctx.arc(
            centros.der.x,
            centros.der.y,
            R + 12,
            -Math.PI / 2,
            -Math.PI / 2 + (destrezaState.barraDer / 100) * 2 * Math.PI
        );
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 8;
        ctx.stroke();
        // Marca visual del umbral (pequeño arco resaltado)
        ctx.beginPath();
        ctx.arc(
            centros.der.x,
            centros.der.y,
            R + 16,
            angUmbral - anchoUmbral / 2,
            angUmbral + anchoUmbral / 2
        );
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centros.der.x, centros.der.y, R, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // Mantener emojis alineados al centro de cada círculo (por si se redimensiona)
        destrezaState.emojisColaIzq.forEach(e => { e.x = centros.izq.x; });
        destrezaState.emojisColaDer.forEach(e => { e.x = centros.der.x; });

        // Dibujar emojis (izq y der)
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        destrezaState.emojisColaIzq.forEach(e => {
            if (e.activo) ctx.fillText(e.emoji, e.x, e.y);
        });
        destrezaState.emojisColaDer.forEach(e => {
            if (e.activo) ctx.fillText(e.emoji, e.x, e.y);
        });

        // Texto del último emoji pulsado bajo la planta (+/- y color)
        if (destrezaState.ultimoNombre) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = destrezaState.ultimoEsBueno ? '#0a7d0a' : '#c00';
            const signo = destrezaState.ultimoEsBueno ? '+' : '-';
            ctx.fillText(`${signo} ${destrezaState.ultimoNombre}`, centros.planta.x, centros.planta.y + 85);
            ctx.restore();
        }

        // Comprobar si las dos barras han superado el umbral para avanzar de etapa
        if (
            !destrezaState.esperandoPopup &&
            destrezaState.barraIzq >= UMBRAL_DESTREZA &&
            destrezaState.barraDer >= UMBRAL_DESTREZA
        ) {
            destrezaState.esperandoPopup = true;
            if (destrezaState.etapa === 0) {
                // Nueva ronda con Planta 2: congelar barras donde están y ajustarlas a 40
                // solo después de cerrar el mensaje de crecimiento.
                destrezaState.etapa = 1;
                iluminarPlanta(() => {
                    plantaImagen.src = imagenes.mediana;
                    mostrarMensajeCrecimientoDestreza(
                        '¡Felicidades! Has ayudado a la planta a crecer a mediana. 🌿 Sigue así, 4 elementos buenos más y será grande.',
                        { from: 'pequena', to: 'mediana' },
                        () => {
                            destrezaState.barraIzq = 40;
                            destrezaState.barraDer = 40;
                            destrezaState.esperandoPopup = false;
                        }
                    );
                });
            } else if (destrezaState.etapa === 1) {
                // Nueva ronda con Planta 3: congelar barras donde están y ajustarlas a 30
                // solo después de cerrar el mensaje de crecimiento.
                destrezaState.etapa = 2;
                iluminarPlanta(() => {
                    plantaImagen.src = imagenes.grande;
                    mostrarMensajeCrecimientoDestreza(
                        '¡Guau! Ya es una planta mediana. Con 4 más será grande y ganarás.',
                        { from: 'mediana', to: 'grande' },
                        () => {
                            destrezaState.barraIzq = 30;
                            destrezaState.barraDer = 30;
                            destrezaState.esperandoPopup = false;
                        }
                    );
                });
            } else if (destrezaState.etapa === 2) {
                // Victoria final: aquí no hay una nueva ronda, solo se dispara el festejo
                destrezaState.terminado = true;
                destrezaState.barraIzq = 0;
                destrezaState.barraDer = 0;
                iluminarPlanta(() => {
                    plantaImagen.src = imagenes.grande;
                    estallarPlanta(true);
                    mostrarPopupVictoria();
                    destrezaState.esperandoPopup = false;
                });
            }
        }

        animationFrameId = requestAnimationFrame(dibujarCanvasDestreza);
    }

    function mostrarMensajeCrecimientoDestreza(mensaje, opcionesCambio, onClose) {
        const popupDiv = document.createElement('div');
        popupDiv.className = 'popup mensaje-popup';
        popupDiv.style.position = 'absolute';
        popupDiv.style.top = '50%';
        popupDiv.style.left = '50%';
        popupDiv.style.transform = 'translate(-50%, -50%)';
        popupDiv.style.zIndex = '100';
        let htmlCambio = '';
        if (opcionesCambio && opcionesCambio.from && opcionesCambio.to) {
            const srcFrom = opcionesCambio.from === 'pequena' ? imagenes.pequena : opcionesCambio.from === 'mediana' ? imagenes.mediana : imagenes.grande;
            const srcTo = opcionesCambio.to === 'pequena' ? imagenes.pequena : opcionesCambio.to === 'mediana' ? imagenes.mediana : imagenes.grande;
            htmlCambio = `
                <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin:12px 0;">
                    <img src="${srcFrom}" alt="Planta antes" style="height:70px;width:auto;border-radius:12px;box-shadow:0 0 6px rgba(0,0,0,0.3);background:#fff4d1;padding:4px;">
                    <span style="font-size:2rem;">➡️</span>
                    <img src="${srcTo}" alt="Planta después" style="height:90px;width:auto;border-radius:12px;box-shadow:0 0 6px rgba(0,0,0,0.35);background:#fffbee;padding:4px;">
                </div>
            `;
        }
        popupDiv.innerHTML = `
            <h3>🌱 ¡Crecer! 🌱</h3>
            <p>${mensaje}</p>
            ${htmlCambio}
            <button class="btn btn-primary" id="continuar-popup-destreza">Continuar</button>
        `;
        document.querySelector('.game-container').appendChild(popupDiv);
        document.getElementById('continuar-popup-destreza').addEventListener('click', () => {
            popupDiv.remove();
            if (typeof onClose === 'function') onClose();
        });
    }

    function mostrarPopupDerrotaDestreza() {
        const popupDiv = document.createElement('div');
        popupDiv.className = 'popup mensaje-popup';
        popupDiv.style.position = 'absolute';
        popupDiv.style.top = '50%';
        popupDiv.style.left = '50%';
        popupDiv.style.transform = 'translate(-50%, -50%)';
        popupDiv.style.zIndex = '100';
        popupDiv.innerHTML = `
            <h2>💔 ¡Oh no!</h2>
            <p>La plantita se ha quedado sin energía porque una de las barras llegó a cero. Eso significa que la descuidaste y se murió.</p>
            <p>Puedes volver a intentarlo, cuidando bien los dos lados y tocando más elementos buenos.</p>
            <button class="btn btn-primary" id="reiniciar-destreza">Iniciar de nuevo</button>
        `;
        document.querySelector('.game-container').appendChild(popupDiv);
        document.getElementById('reiniciar-destreza').addEventListener('click', () => {
            popupDiv.remove();
            destrezaState.esperandoPopup = false;
            iniciarModoDestreza();
        });
    }

    function procesarTapDestreza(clientX, clientY) {
        if (modoActual !== 'destreza' || destrezaState.esperandoPopup) return;
        const { x: tapX, y: tapY } = getPosicionEnCanvasEscalada(clientX, clientY);
        const centros = getCentrosDestreza();
        const R = RADIO_DESTREZA;
        const margenToque = 25;
        const radioTap = R + margenToque;

        const distIzq = Math.sqrt((tapX - centros.izq.x) ** 2 + (tapY - centros.izq.y) ** 2);
        const distDer = Math.sqrt((tapX - centros.der.x) ** 2 + (tapY - centros.der.y) ** 2);
        const enIzq = distIzq <= radioTap;
        const enDer = distDer <= radioTap;
        if (!enIzq && !enDer) return;

        const columna = enIzq ? destrezaState.emojisColaIzq : destrezaState.emojisColaDer;
        const centro = enIzq ? centros.izq : centros.der;
        let mejorEmoji = null;
        let mejorDist = Infinity;
        columna.forEach(e => {
            if (!e.activo) return;
            const dist = Math.sqrt((e.x - centro.x) ** 2 + (e.y - centro.y) ** 2);
            if (dist <= R && dist < mejorDist) {
                mejorDist = dist;
                mejorEmoji = e;
            }
        });
        if (!mejorEmoji) return;

        const esBueno = emojisBuenos.some(b => b.emoji === mejorEmoji.emoji);
        mejorEmoji.activo = false;
        // Guardar último emoji pulsado para mostrar bajo la planta
        destrezaState.ultimoNombre = mejorEmoji.nombre || '';
        destrezaState.ultimoEsBueno = esBueno;
        if (enIzq) {
            if (esBueno) destrezaState.barraIzq = Math.min(100, destrezaState.barraIzq + SUBIDA_BARRA_BUENO);
            else destrezaState.barraIzq = Math.max(0, destrezaState.barraIzq - BAJADA_BARRA_MALO);
        } else {
            if (esBueno) destrezaState.barraDer = Math.min(100, destrezaState.barraDer + SUBIDA_BARRA_BUENO);
            else destrezaState.barraDer = Math.max(0, destrezaState.barraDer - BAJADA_BARRA_MALO);
        }
    }

    // --- Eventos de Canvas (Drag & Drop para Aprendizaje, Click para Habilidad) ---
    let draggedEmoji = null;
    let offsetX, offsetY;

    function getPosicionEnCanvas(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // Coordenadas en espacio del canvas (por si el canvas está escalado, ej. en móvil)
    function getPosicionEnCanvasEscalada(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    // Eventos de ratón para modo aprendizaje
    canvas.addEventListener('mousedown', (e) => {
        if (modoActual !== 'aprendizaje' || aprendizajeState.esperandoPopup) return;
        const { x: mouseX, y: mouseY } = getPosicionEnCanvas(e.clientX, e.clientY);
        
        for (let emoji of aprendizajeState.emojisActivos) {
            // Colisión con el círculo centrado del emoji
            const radio = emoji.radio || 30;
            const dx = mouseX - emoji.x;
            const dy = mouseY - emoji.y;
            if (Math.sqrt(dx*dx + dy*dy) < radio) {
                draggedEmoji = emoji;
                offsetX = mouseX - emoji.x;
                offsetY = mouseY - emoji.y;
                // Mientras se arrastra, detenemos su movimiento automático
                emoji.vx = 0;
                emoji.vy = 0;
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!draggedEmoji || modoActual !== 'aprendizaje') return;
        const { x: mouseX, y: mouseY } = getPosicionEnCanvas(e.clientX, e.clientY);
        
        draggedEmoji.x = mouseX - offsetX;
        draggedEmoji.y = mouseY - offsetY;
    });

    canvas.addEventListener('mouseup', () => {
        if (!draggedEmoji || modoActual !== 'aprendizaje' || aprendizajeState.esperandoPopup) return;
        
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const dx = draggedEmoji.x - centroX;
        const dy = draggedEmoji.y - centroY;
        const distancia = Math.sqrt(dx*dx + dy*dy);
        
        if (distancia < 80) { // Soltó sobre la planta
            const esBueno = emojisBuenos.some(e => e.emoji === draggedEmoji.emoji);
            const eraCuartoBueno = esBueno && (aprendizajeState.buenosColocados + 1 >= 4);

            mostrarPopupEmoji(draggedEmoji, esBueno, () => {
                if (eraCuartoBueno) {
                    // Tras leer el beneficio del cuarto emoji, iluminar y luego mostrar crecimiento/victoria
                    if (aprendizajeState.etapa === 0) {
                        aprendizajeState.buenosColocados = 0;
                        aprendizajeState.etapa = 1;
                        iluminarPlanta(() => {
                            plantaImagen.src = imagenes.mediana;
                            mostrarMensajeCrecimiento(
                                '¡Felicidades! Has ayudado a la planta a crecer a mediana. 🌿 Sigue así, 4 elementos buenos más y será grande.',
                                { from: 'pequena', to: 'mediana' }
                            );
                            aprendizajeState.emojisActivos = generarEmojisParaEtapa(aprendizajeState.etapa);
                        });
                    } else if (aprendizajeState.etapa === 1) {
                        aprendizajeState.buenosColocados = 0;
                        aprendizajeState.etapa = 2;
                        iluminarPlanta(() => {
                            plantaImagen.src = imagenes.grande;
                            mostrarMensajeCrecimiento(
                                '¡Guau! Ya es una planta mediana. Con 4 más será grande y ganarás.',
                                { from: 'mediana', to: 'grande' }
                            );
                            aprendizajeState.emojisActivos = generarEmojisParaEtapa(aprendizajeState.etapa);
                        });
                    } else if (aprendizajeState.etapa === 2) {
                        aprendizajeState.buenosColocados = 0;
                        iluminarPlanta(() => {
                            plantaImagen.src = imagenes.grande;
                            estallarPlanta(true);
                            mostrarPopupVictoria();
                        });
                    }
                }
            });
            
            // Efecto destello
            if (esBueno) {
                canvas.style.boxShadow = 'inset 0 0 50px #7cfc00';
                aprendizajeState.buenosColocados++;
            } else {
                canvas.style.boxShadow = 'inset 0 0 50px #ff4444';
            }
            setTimeout(() => canvas.style.boxShadow = 'none', 300);
            
            // Eliminar el emoji usado
            aprendizajeState.emojisActivos = aprendizajeState.emojisActivos.filter(e => e.id !== draggedEmoji.id);
            
            // Si no es bueno, solo asustamos, sin afectar el contador de buenos
            if (!esBueno) {
                // No restamos buenos colocados, solo asustamos
            }
            
            // Rellenar con algunos emojis malos si quedan muy pocos en pantalla
            rellenarEmojisMalosSiPocos();
        }

        // Si el emoji no se entregó (sigue en la lista), le devolvemos una velocidad suave
        if (draggedEmoji && aprendizajeState.emojisActivos.some(e => e.id === draggedEmoji.id)) {
            const vel = velocidadAleatoriaSuave();
            draggedEmoji.vx = vel.vx;
            draggedEmoji.vy = vel.vy;
        }

        draggedEmoji = null;
    });

    // Soporte táctil para modo aprendizaje (móviles/tablets)
    canvas.addEventListener('touchstart', (e) => {
        if (modoActual !== 'aprendizaje' || aprendizajeState.esperandoPopup) return;
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        const { x: touchX, y: touchY } = getPosicionEnCanvas(touch.clientX, touch.clientY);

        for (let emoji of aprendizajeState.emojisActivos) {
            const radio = emoji.radio || 30;
            const dx = touchX - emoji.x;
            const dy = touchY - emoji.y;
            if (Math.sqrt(dx * dx + dy * dy) < radio) {
                draggedEmoji = emoji;
                offsetX = touchX - emoji.x;
                offsetY = touchY - emoji.y;
                emoji.vx = 0;
                emoji.vy = 0;
                e.preventDefault(); // evita que se desplace la pantalla
                break;
            }
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!draggedEmoji || modoActual !== 'aprendizaje') return;
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        const { x: touchX, y: touchY } = getPosicionEnCanvas(touch.clientX, touch.clientY);

        draggedEmoji.x = touchX - offsetX;
        draggedEmoji.y = touchY - offsetY;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (!draggedEmoji || modoActual !== 'aprendizaje' || aprendizajeState.esperandoPopup) return;

        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const dx = draggedEmoji.x - centroX;
        const dy = draggedEmoji.y - centroY;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < 80) { // Soltó sobre la planta
            const esBueno = emojisBuenos.some(e => e.emoji === draggedEmoji.emoji);
            const eraCuartoBueno = esBueno && (aprendizajeState.buenosColocados + 1 >= 4);

            mostrarPopupEmoji(draggedEmoji, esBueno, () => {
                if (eraCuartoBueno) {
                    if (aprendizajeState.etapa === 0) {
                        aprendizajeState.buenosColocados = 0;
                        aprendizajeState.etapa = 1;
                        iluminarPlanta(() => {
                            plantaImagen.src = imagenes.mediana;
                            mostrarMensajeCrecimiento(
                                '¡Felicidades! Has ayudado a la planta a crecer a mediana. 🌿 Sigue así, 4 elementos buenos más y será grande.',
                                { from: 'pequena', to: 'mediana' }
                            );
                            aprendizajeState.emojisActivos = generarEmojisParaEtapa(aprendizajeState.etapa);
                        });
                    } else if (aprendizajeState.etapa === 1) {
                        aprendizajeState.buenosColocados = 0;
                        aprendizajeState.etapa = 2;
                        iluminarPlanta(() => {
                            plantaImagen.src = imagenes.grande;
                            mostrarMensajeCrecimiento(
                                '¡Guau! Ya es una planta mediana. Con 4 más será grande y ganarás.',
                                { from: 'mediana', to: 'grande' }
                            );
                            aprendizajeState.emojisActivos = generarEmojisParaEtapa(aprendizajeState.etapa);
                        });
                    } else if (aprendizajeState.etapa === 2) {
                        aprendizajeState.buenosColocados = 0;
                        iluminarPlanta(() => {
                            plantaImagen.src = imagenes.grande;
                            estallarPlanta(true);
                            mostrarPopupVictoria();
                        });
                    }
                }
            });

            if (esBueno) {
                canvas.style.boxShadow = 'inset 0 0 50px #7cfc00';
                aprendizajeState.buenosColocados++;
            } else {
                canvas.style.boxShadow = 'inset 0 0 50px #ff4444';
            }
            setTimeout(() => canvas.style.boxShadow = 'none', 300);

            aprendizajeState.emojisActivos = aprendizajeState.emojisActivos.filter(e => e.id !== draggedEmoji.id);

            if (!esBueno) {
                // No restamos buenos colocados, solo asustamos
            }

            rellenarEmojisMalosSiPocos();
        }

        if (draggedEmoji && aprendizajeState.emojisActivos.some(e => e.id === draggedEmoji.id)) {
            const vel = velocidadAleatoriaSuave();
            draggedEmoji.vx = vel.vx;
            draggedEmoji.vy = vel.vy;
        }

        draggedEmoji = null;
        e.preventDefault();
    }, { passive: false });

    // Procesar tap (clic o toque) en modo habilidad: tap dentro del círculo + emoji dentro = efecto
    function procesarTapHabilidad(clientX, clientY) {
        if (modoActual !== 'habilidad' || habilidadState.esperandoPopup) return;
        const { x: tapX, y: tapY } = getPosicionEnCanvasEscalada(clientX, clientY);
        const centroX = canvas.width / 2;
        const centroY = getCentroYHabilidad();
        const margenToque = 25; // más tolerante en móvil
        const radioTap = RADIO_ZONA_IMPACTO + margenToque;
        const distTapAlCentro = Math.sqrt((tapX - centroX) ** 2 + (tapY - centroY) ** 2);
        if (distTapAlCentro > radioTap) return; // tap fuera del círculo

        // Centro del emoji dibujado (font 50px, textBaseline middle): aprox mitad del ancho
        const anchoEmojiAprox = 50;
        let mejorEmoji = null;
        let mejorDist = Infinity;
        for (const emoji of habilidadState.emojisEnCola) {
            if (!emoji.activo) continue;
            const cx = emoji.x + anchoEmojiAprox / 2;
            const cy = emoji.y;
            const distEmojiAlCentro = Math.sqrt((cx - centroX) ** 2 + (cy - centroY) ** 2);
            if (distEmojiAlCentro <= RADIO_ZONA_IMPACTO && distEmojiAlCentro < mejorDist) {
                mejorDist = distEmojiAlCentro;
                mejorEmoji = emoji;
            }
        }
        if (!mejorEmoji) return;

        const esBueno = emojisBuenos.some(e => e.emoji === mejorEmoji.emoji);
        habilidadState.ultimoNombre = mejorEmoji.nombre;
        habilidadState.ultimoEsBueno = esBueno;
        if (esBueno) {
            habilidadState.puntos += 2;
            mostrarPopupFlash('💚 +2', '#7cfc00');
        } else {
            habilidadState.puntos -= 2;
            mostrarPopupFlash('💔 -2', '#ff4444');
        }
        puntosValor.innerText = habilidadState.puntos;
        mejorEmoji.activo = false;
        habilidadState.velocidad += 0.2;

        if (habilidadState.puntos >= 10 && habilidadState.etapa === 0) {
            habilidadState.etapa = 1;
            plantaImagen.src = imagenes.mediana;
            mostrarMensajeCrecimiento('🎉 ¡Has llegado a 10! La planta es mediana. Sigue para los 20.');
            habilidadState.velocidad = 3;
        } else if (habilidadState.puntos >= 20 && habilidadState.etapa === 1) {
            habilidadState.etapa = 2;
            plantaImagen.src = imagenes.grande;
            mostrarPopupVictoria();
        }
    }

    let touchHabilidadUsado = false;
    canvas.addEventListener('click', (e) => {
        if (modoActual === 'destreza') {
            procesarTapDestreza(e.clientX, e.clientY);
            return;
        }
        if (touchHabilidadUsado) {
            touchHabilidadUsado = false;
            return;
        }
        procesarTapHabilidad(e.clientX, e.clientY);
    });

    canvas.addEventListener('touchstart', (e) => {
        if (modoActual === 'destreza') {
            if (e.touches && e.touches.length > 0) {
                const t = e.touches[0];
                procesarTapDestreza(t.clientX, t.clientY);
                e.preventDefault();
            }
            return;
        }
        if (modoActual !== 'habilidad' || habilidadState.esperandoPopup) return;
        if (e.touches && e.touches.length > 0) {
            const t = e.touches[0];
            procesarTapHabilidad(t.clientX, t.clientY);
            touchHabilidadUsado = true;
            setTimeout(() => { touchHabilidadUsado = false; }, 400);
            e.preventDefault();
        }
    }, { passive: false });

    // Funciones auxiliares de popups
    function mostrarPopupEmoji(emoji, esBueno, onClose) {
        aprendizajeState.esperandoPopup = true;
        const mensajeData = esBueno ? emojisBuenos.find(e => e.emoji === emoji.emoji) : emojisMalos.find(e => e.emoji === emoji.emoji);
        if (!mensajeData) return;
        
        const popupDiv = document.createElement('div');
        popupDiv.className = 'popup mensaje-popup';
        popupDiv.style.position = 'absolute';
        popupDiv.style.top = '50%';
        popupDiv.style.left = '50%';
        popupDiv.style.transform = 'translate(-50%, -50%)';
        popupDiv.style.zIndex = '100';
        popupDiv.innerHTML = `
            <h3>${mensajeData.emoji} ${mensajeData.nombre}</h3>
            <p>${mensajeData.mensaje}</p>
            <button class="btn btn-primary" id="continuar-popup">Continuar</button>
        `;
        document.querySelector('.game-container').appendChild(popupDiv);
        
        document.getElementById('continuar-popup').addEventListener('click', () => {
            popupDiv.remove();
            aprendizajeState.esperandoPopup = false;
            if (typeof onClose === 'function') {
                onClose();
            }
        });
    }

    function mostrarPopupFlash(texto, color) {
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '30%';
        flash.style.left = '50%';
        flash.style.transform = 'translate(-50%, -50%)';
        flash.style.fontSize = '3rem';
        flash.style.fontWeight = 'bold';
        flash.style.color = color;
        flash.style.textShadow = '2px 2px 4px black';
        flash.style.zIndex = '100';
        flash.innerText = texto;
        document.querySelector('.game-container').appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }

    function mostrarMensajeCrecimiento(mensaje, opcionesCambio) {
        aprendizajeState.esperandoPopup = true;
        const popupDiv = document.createElement('div');
        popupDiv.className = 'popup mensaje-popup';
        popupDiv.style.position = 'absolute';
        popupDiv.style.top = '50%';
        popupDiv.style.left = '50%';
        popupDiv.style.transform = 'translate(-50%, -50%)';
        popupDiv.style.zIndex = '100';
        let htmlCambio = '';
        if (opcionesCambio && opcionesCambio.from && opcionesCambio.to) {
            const srcFrom = opcionesCambio.from === 'pequena'
                ? imagenes.pequena
                : opcionesCambio.from === 'mediana'
                ? imagenes.mediana
                : imagenes.grande;
            const srcTo = opcionesCambio.to === 'pequena'
                ? imagenes.pequena
                : opcionesCambio.to === 'mediana'
                ? imagenes.mediana
                : imagenes.grande;

            htmlCambio = `
                <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin:12px 0;">
                    <img src="${srcFrom}" alt="Planta antes" style="height:70px;width:auto;border-radius:12px;box-shadow:0 0 6px rgba(0,0,0,0.3);background:#fff4d1;padding:4px;">
                    <span style="font-size:2rem;">➡️</span>
                    <img src="${srcTo}" alt="Planta después" style="height:90px;width:auto;border-radius:12px;box-shadow:0 0 6px rgba(0,0,0,0.35);background:#fffbee;padding:4px;">
                </div>
            `;
        }

        popupDiv.innerHTML = `
            <h3>🌱 ¡Crecer! 🌱</h3>
            <p>${mensaje}</p>
            ${htmlCambio}
            <button class="btn btn-primary" id="continuar-popup">Continuar</button>
        `;
        document.querySelector('.game-container').appendChild(popupDiv);
        
        document.getElementById('continuar-popup').addEventListener('click', () => {
            popupDiv.remove();
            aprendizajeState.esperandoPopup = false;
        });
    }

    // Iluminación especial de la planta antes de cambiar de etapa
    function iluminarPlanta(callback) {
        const duracionTotal = 1200; // 1.2s en total para que se note
        const paso = 80;
        let tiempo = 0;

        function aplicarFase(fase) {
            if (fase === 0) {
                // Resplandor grande alrededor
                canvas.style.boxShadow = '0 0 50px 25px rgba(255, 255, 180, 0.95) inset';
            } else if (fase === 1) {
                // Resplandor más concentrado "dentro" de la planta
                canvas.style.boxShadow = '0 0 35px 10px rgba(255, 255, 220, 0.95) inset';
            }
        }

        aplicarFase(0);

        const intervalo = setInterval(() => {
            tiempo += paso;
            if (tiempo >= duracionTotal / 2 && tiempo < duracionTotal) {
                aplicarFase(1);
            }
            if (tiempo >= duracionTotal) {
                clearInterval(intervalo);
                canvas.style.boxShadow = 'none';
                if (typeof callback === 'function') {
                    callback();
                }
            }
        }, paso);
    }

    // Efecto de "explosión" festiva alrededor de la planta (confeti de emojis)
    function estallarPlanta(esVictoria = false) {
        const contenedor = document.querySelector('.game-container');
        if (!contenedor) return;

        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;

        const emojisConfeti = esVictoria
            ? ['✨', '🌟', '🎉', '💚']
            : ['✨', '🌟', '💚', '🌱'];

        const cantidad = esVictoria ? 24 : 16;
        const duracion = esVictoria ? 1200 : 900;

        for (let i = 0; i < cantidad; i++) {
            const span = document.createElement('span');
            span.textContent = emojisConfeti[Math.floor(Math.random() * emojisConfeti.length)];
            span.style.position = 'absolute';
            span.style.left = '50%';
            span.style.top = '50%';
            span.style.transform = 'translate(-50%, -50%)';
            span.style.fontSize = esVictoria ? '2.4rem' : '2rem';
            span.style.pointerEvents = 'none';
            span.style.zIndex = '90';

            contenedor.appendChild(span);

            const angulo = (Math.PI * 2 * i) / cantidad + Math.random() * 0.4;
            const distancia = 60 + Math.random() * 80;

            const destinoX = centroX + Math.cos(angulo) * distancia;
            const destinoY = centroY + Math.sin(angulo) * distancia;

            // Convertir coordenadas de canvas a porcentaje del contenedor
            const rect = contenedor.getBoundingClientRect();
            const xPx = (destinoX / canvas.width) * rect.width;
            const yPx = (destinoY / canvas.height) * rect.height;

            // Animación básica con transición CSS
            requestAnimationFrame(() => {
                span.style.transition = `transform ${duracion}ms ease-out, opacity ${duracion}ms ease-out`;
                span.style.transform = `translate(${xPx - rect.width / 2}px, ${yPx - rect.height / 2}px) scale(1.2)`;
                span.style.opacity = '0';
            });

            setTimeout(() => {
                span.remove();
            }, duracion + 100);
        }
    }

    function mostrarPopupVictoria() {
        const popupDiv = document.createElement('div');
        popupDiv.className = 'popup mensaje-popup';
        popupDiv.style.position = 'absolute';
        popupDiv.style.top = '50%';
        popupDiv.style.left = '50%';
        popupDiv.style.transform = 'translate(-50%, -50%)';
        popupDiv.style.zIndex = '100';
        popupDiv.innerHTML = `
            <h2>🎉 ¡Felicidades, Campeón! 🎉</h2>
            <p>La planta te da las gracias: "Gracias por cuidarme y ayudarme a crecer. ¡Tú también creces cuando agradeces!"</p>
            <p>Recuerda siempre dar las gracias por lo que tienes, por lo que llega a tu vida y por cada cosa que vives. ¡Eso es la gratitud! 🌟</p>
            <button class="btn btn-primary" id="volver-inicio">Volver al inicio</button>
        `;
        document.querySelector('.game-container').appendChild(popupDiv);
        
        document.getElementById('volver-inicio').addEventListener('click', () => {
            popupDiv.remove();
            backToStartBtn.click(); // Vuelve al inicio
        });
    }

    // Ajustar tamaño del canvas cuando cambia el tamaño de la pantalla
    window.addEventListener('resize', () => {
        const container = document.querySelector('.game-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight - 80; // Restar footer
        if (modoActual === 'aprendizaje') {
            reajustarPosicionesEmojisAprendizaje();
        }
    });

    // Inicializar tamaño
    const container = document.querySelector('.game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight - 80;

    function reajustarPosicionesEmojisAprendizaje() {
        const padding = 40;
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const radioPlanta = 80;

        aprendizajeState.emojisActivos.forEach(e => {
            const radio = e.radio || 30;

            // Mantener dentro de los nuevos límites del canvas
            e.x = Math.min(canvas.width - padding - radio, Math.max(padding + radio, e.x));
            e.y = Math.min(canvas.height - padding - radio, Math.max(padding + radio, e.y));

            // Asegurar que sigan fuera de la planta
            const dx = e.x - centroX;
            const dy = e.y - centroY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const distanciaMinima = radioPlanta + radio + 5;

            if (dist > 0 && dist < distanciaMinima) {
                const factor = distanciaMinima / dist;
                e.x = centroX + dx * factor;
                e.y = centroY + dy * factor;
            }
        });
    }
});