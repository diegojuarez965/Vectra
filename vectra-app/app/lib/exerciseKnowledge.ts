export interface ExerciseKnowledge {
  name: string;
  dbKey: string;
  keywords: string[];
  setup: string;
  execution: {
    concentric: string;
    eccentric: string;
    breathing: string;
  };
  keyPoints: string[];
  commonMistakes: string[];
}

export const EXERCISE_KNOWLEDGE_BASE: Record<string, ExerciseKnowledge> = {
  biceps_curl: {
    name: "Curl de Bíceps (con mancuernas / barra)",
    dbKey: "BICEP_CURL",
    keywords: ["biceps", "bíceps", "curl de biceps", "curl de bíceps", "curl"],
    setup: "De pie o sentado con la espalda recta, torso erguido y escapulas retraídas. Sujeta las mancuernas o barra con agarre supino (palmas mirando al frente). Codos alineados cerca de las costillas y pies a la anchura de los hombros.",
    execution: {
      concentric: "Flexiona los codos concentrando el esfuerzo en el bíceps sin mover ni adelantar los codos. Sube hasta la máxima contracción del bíceps sin elevar los hombros.",
      eccentric: "Desciende el peso de forma controlada (2-3 segundos) hasta extender los codos casi por completo, manteniendo tensión constante.",
      breathing: "Exhala durante la flexión (fase concéntrica) e inhala durante el descenso controlado (fase excéntrica)."
    },
    keyPoints: [
      "Los codos deben actuar como pivote fijo pegados al torso, no deben desplazarse hacia adelante.",
      "Evita el balanceo del torso o el impulso con la zona lumbar.",
      "Mantén la muñeca neutra durante todo el recorrido para no trasladar la carga a los antebrazos."
    ],
    commonMistakes: [
      "Balancear la espalda para elevar la carga (usar inercia).",
      "Separar o adelantar los codos excesivamente reduciendo el trabajo biomecánico del bíceps.",
      "Realizar rangos de movimiento incompletos (no descender del todo o cortar arriba)."
    ]
  },
  squat: {
    name: "Sentadilla (Squat)",
    dbKey: "SQUAT",
    keywords: ["sentadilla", "sentadillas", "squat", "squats", "cuadriceps", "cuádriceps"],
    setup: "Pies abiertos a la anchura de los hombros o ligeramente más, con las puntas apuntando hacia afuera unos 15-30°. Barra apoyada firmemente sobre el trapecio (barra alta) o deltoides posterior (barra baja). Abdomen activado (bracing) y mirada al frente/abajo en diagonal.",
    execution: {
      concentric: "Empuja el suelo firmemente extendiendo rodillas y caderas simultáneamente. Mantén el pecho arriba y las rodillas orientadas hacia afuera en la misma dirección que las puntas de los pies.",
      eccentric: "Inicia el descenso flexionando simultáneamente rodillas y cadera como si te sentaras. Rompe el paralelo (cadera levemente por debajo de la parte superior de la rodilla) manteniendo la columna vertebral en posición neutra.",
      breathing: "Inhala profundamente antes de descender, realiza maniobra de Valsalva (bracing) para estabilizar el core y exhala al superar el punto estancado en el ascenso."
    },
    keyPoints: [
      "Distribución del peso uniforme sobre el 'trípode del pie' (talón, base del primer metatarso y base del quinto metatarso).",
      "Mantener la barra alineada verticalmente sobre el medio del pie durante todo el recorrido.",
      "Las rodillas deben alinearse con la dirección de los dedos del pie."
    ],
    commonMistakes: [
      "Valgo de rodilla (las rodillas colapsan hacia adentro al subir).",
      "Guiño de cadera / Butt wink (pérdida de la curvatura neutra de la espalda en la zona lumbar al fondo de la sentadilla).",
      "Elevar los talones del suelo durante el descenso."
    ]
  },
  deadlift: {
    name: "Peso Muerto (Deadlift)",
    dbKey: "DEADLIFT",
    keywords: ["peso muerto", "deadlift", "isquios", "isquiotibiales"],
    setup: "Barra sobre el medio del pie (a unos 2-3 cm de las espinillas). Pies a la anchura de las caderas. Inclínate en bisagra de cadera y sujeta la barra justo por fuera de las piernas. Flexiona rodillas hasta tocar la barra con las espinillas sin empujarla hacia adelante. Activa los dorsales ('encajar los hombros en los bolsillos') y tensiona la barra antes de despegar.",
    execution: {
      concentric: "Empuja el suelo con las piernas (fase de empuje) manteniendo el ángulo del torso estable hasta que la barra pase las rodillas. A partir de las rodillas, extiende la cadera fuertemente hacia adelante hasta bloquear en bipedestación erguida sin hiperextender la espalda.",
      eccentric: "Inicia el retorno empujando la cadera hacia atrás (bisagra) dejando descender la barra pegada a los muslos hasta pasar las rodillas; luego flexiona rodillas hasta posar los discos suavemente en el suelo.",
      breathing: "Toma aire abajo, llena la cavidad abdominal (bracing), aguanta la presión durante el despegue y exhala en el bloqueo superior."
    },
    keyPoints: [
      "La barra debe viajar en una línea estrictamente vertical pegada al cuerpo en todo momento.",
      "No es una sentadilla: el movimiento principal es una bisagra de cadera impulsada por glúteos e isquiotibiales.",
      "Mantener la columna vertebral completamente neutra (sin flexión ni extensión excesiva)."
    ],
    commonMistakes: [
      "Redondear la zona lumbar durante el despegue.",
      "Alejar la barra del cuerpo aumentando el brazo de palanca y la carga lumbar.",
      "Hiperextender la zona lumbar al finalizar el movimiento (bloqueo excesivo)."
    ]
  },
  triceps_extension: {
    name: "Extensión de Tríceps",
    dbKey: "TRICEP_EXTENSION",
    keywords: ["triceps", "tríceps", "extension de triceps", "extensión de tríceps"],
    setup: "Posición erguida o leve inclinación del torso. Codos flexionados, apuntando al frente o hacia abajo y fijos al torso. Hombros retraídos y estables.",
    execution: {
      concentric: "Extiende los codos por completo mediante la contracción aislada del tríceps hasta lograr el bloqueo completo del codo sin desplazar el hombro.",
      eccentric: "Controla el retorno flexionalizando el codo hasta llegar a un estiramiento profundo del tríceps.",
      breathing: "Exhala en la extensión completa del codo e inhala durante la flexión de retorno."
    },
    keyPoints: [
      "El húmero/codo debe permanecer inmóvil durante todo el movimiento; solo se mueve el antebrazo.",
      "Mantener las muñecas rígidas y neutras.",
      "Asegurar un estiramiento completo en la fase excéntrica para enfatizar la cabeza larga del tríceps."
    ],
    commonMistakes: [
      "Mover los hombros/codos involucrando el pectoral o el dorsal por usar demasiado peso.",
      "Abrir los codos hacia afuera desalineando la articulación.",
      "Realizar impulsos con la cadera o el torso."
    ]
  }
};

/**
 * Retorna las claves de DB (ej: 'BICEP_CURL') de los ejercicios detectados en el mensaje.
 */
export function getMatchedDbExerciseKeys(userMessage: string): string[] {
  if (!userMessage) return [];
  const normalizedMessage = userMessage.toLowerCase();
  const matchedDbKeys: string[] = [];

  for (const key in EXERCISE_KNOWLEDGE_BASE) {
    const exercise = EXERCISE_KNOWLEDGE_BASE[key];
    const isMatched = exercise.keywords.some((keyword) =>
      normalizedMessage.includes(keyword.toLowerCase())
    );

    if (isMatched && !matchedDbKeys.includes(exercise.dbKey)) {
      matchedDbKeys.push(exercise.dbKey);
    }
  }

  return matchedDbKeys;
}

/**
 * Busca términos clave en la consulta del usuario y genera un contexto estructurado en formato RAG.
 */
export function getRelevantExerciseContext(userMessage: string): string {
  if (!userMessage) return "";

  const normalizedMessage = userMessage.toLowerCase();
  const matchedExercises: ExerciseKnowledge[] = [];

  for (const key in EXERCISE_KNOWLEDGE_BASE) {
    const exercise = EXERCISE_KNOWLEDGE_BASE[key];
    const isMatched = exercise.keywords.some((keyword) =>
      normalizedMessage.includes(keyword.toLowerCase())
    );

    if (isMatched) {
      matchedExercises.push(exercise);
    }
  }

  if (matchedExercises.length === 0) {
    return "";
  }

  let context = "Utiliza la siguiente información biomecánica precisa para enriquecer tu respuesta técnica al usuario:\n\n";

  matchedExercises.forEach((ex, idx) => {
    context += `### EJERCICIO ${idx + 1}: ${ex.name}\n`;
    context += `- **Posición inicial / Setup**: ${ex.setup}\n`;
    context += `- **Ejecución concéntrica**: ${ex.execution.concentric}\n`;
    context += `- **Ejecución excéntrica**: ${ex.execution.eccentric}\n`;
    context += `- **Respiración**: ${ex.execution.breathing}\n`;
    context += `- **Puntos clave biomecánicos**: ${ex.keyPoints.join("; ")}\n`;
    context += `- **Errores comunes a evitar**: ${ex.commonMistakes.join("; ")}\n\n`;
  });

  return context;
}

