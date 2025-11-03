// chatbot.js OPTIMIZADO

const GEMINI_API_KEY = "AIzaSyAKjHv8Vtwj0SwMyeIGXN63QOiCaFesdpo";

/**
 * Carga los datos multimedia desde un archivo JSON local.
 */
export async function cargarDatosJSON() {
  const response = await fetch("./json_filmpedia.json");
  if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");
  return await response.json();
}

/**
 * Simplifica un contenido para enviar solo campos esenciales
 */
function simplificarContenido(item) {
  return {
    ID: item.ID,
    Titulo: item.Titulo,
    Excerpt: item.Excerpt,
    "Duración minutos": item["Duración minutos"],
    tema: item.tema,
    edat: item.edat,
    cicle_educatiu: item.cicle_educatiu,
    filtros: item.filtros,
    "Calificación Filmpedia": item["Calificación Filmpedia"],
    durada: item.durada,
    Link: item.Link
  };
}

/**
 * Filtra contenidos relevantes basándose en palabras clave de la pregunta
 */
function filtrarContenidosRelevantes(pregunta, contenidos, limite = 15) {
  const preguntaLower = pregunta.toLowerCase();
  
  // Extrae palabras clave significativas (más de 3 caracteres)
  const palabrasClave = preguntaLower
    .replace(/[^\w\sáéíóúñü]/gi, ' ')
    .split(/\s+/)
    .filter(palabra => palabra.length > 3);
  
  // Si no hay palabras clave, devuelve una muestra aleatoria
  if (palabrasClave.length === 0) {
    return contenidos
      .sort(() => Math.random() - 0.5)
      .slice(0, limite);
  }
  
  // Puntúa cada contenido por relevancia
  const contenidosPuntuados = contenidos.map(item => {
    let puntos = 0;
    
    // Convierte campos a texto para búsqueda
    const titulo = (item.Titulo || '').toLowerCase();
    const excerpt = (item.Excerpt || '').toLowerCase();
    const tema = (item.tema || '').toLowerCase();
    const filtros = (item.filtros || '').toLowerCase();
    const edat = (item.edat || '').toLowerCase();
    const contexto = (item["Contextualización texto"] || '').toLowerCase();
    
    palabrasClave.forEach(palabra => {
      // Coincidencia exacta en título vale más
      if (titulo.includes(palabra)) puntos += 15;
      if (excerpt.includes(palabra)) puntos += 8;
      if (tema.includes(palabra)) puntos += 10;
      if (filtros.includes(palabra)) puntos += 10;
      if (edat.includes(palabra)) puntos += 5;
      if (contexto.includes(palabra)) puntos += 3;
    });
    
    return { item, puntos };
  });
  
  // Devuelve los más relevantes que tengan al menos 1 punto
  const filtrados = contenidosPuntuados
    .filter(c => c.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, limite)
    .map(c => c.item);
  
  // Si no hay coincidencias, devuelve una muestra aleatoria
  if (filtrados.length === 0) {
    return contenidos
      .sort(() => Math.random() - 0.5)
      .slice(0, limite);
  }
  
  return filtrados;
}

/**
 * Envía la pregunta del usuario y los datos filtrados a Gemini.
 */
export async function obtenerRecomendacion(pregunta, contenidos) {
  // 1. FILTRAR contenidos relevantes
  const contenidosFiltrados = filtrarContenidosRelevantes(pregunta, contenidos, 5);
  
  // 2. SIMPLIFICAR estructura (solo campos importantes)
  const contenidosSimplificados = contenidosFiltrados.map(simplificarContenido);
  
  console.log(`📊 Contenidos totales: ${contenidos.length}`);
  console.log(`✂️ Contenidos filtrados: ${contenidosFiltrados.length}`);
  
  const prompt = `
Eres un asistente experto en cine y contenido audiovisual educativo.
Tienes acceso a una selección de contenidos relevantes de la base de datos Filmpedia:

${JSON.stringify(contenidosSimplificados, null, 2)}

El usuario pregunta:
"${pregunta}"

Tu tarea:
- Recomienda entre 2 y 3 títulos de los proporcionados que mejor se ajusten a la pregunta.
- Explica brevemente (1-2 líneas) por qué recomiendas cada uno.
- Si ninguno encaja perfectamente, recomienda los más cercanos y explica por qué.
- Menciona el título, duración, edad recomendada y tema principal.
- Incluye el enlace al final de cada recomendación.

Responde en español de forma clara y concisa.
`;

  const modelName = "models/gemini-2.0-flash-exp";
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

  console.log("🟦 Enviando a Gemini...");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const result = await response.json();

  console.log("🟩 Respuesta recibida de Gemini");

  if (result.error) {
    throw new Error(result.error.message || "Error desconocido de Gemini");
  }

  const texto =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No se obtuvo texto en la respuesta.";

  return texto;
}

/**
 * Función principal que conecta la interfaz con la IA.
 */
export async function procesarPregunta(pregunta) {
  try {
    const contenidos = await cargarDatosJSON();
    const respuesta = await obtenerRecomendacion(pregunta, contenidos);
    return respuesta;
  } catch (error) {
    console.error("❌ Error:", error);
    return "⚠️ Error: " + error.message;
  }
}