export type GuiaCategoria = "problemas" | "compra" | "marcas" | "mantenimiento"

export type GuiaBloque =
  | { tipo: "p"; texto: string }
  | { tipo: "h2"; texto: string }
  | { tipo: "h3"; texto: string }
  | { tipo: "ul"; items: string[] }
  | { tipo: "ol"; items: string[] }
  | { tipo: "aviso"; texto: string }

export type GuiaProductoRelacionado = {
  nombre: string
  href: string
}

export type Guia = {
  slug: string
  categoria: GuiaCategoria
  titulo: string
  descripcion: string
  /** Párrafo directo de 100–150 palabras. Es lo que los LLMs y rich snippets muestran primero. */
  respuesta_corta: string
  keywords: string[]
  contenido: GuiaBloque[]
  faq?: { pregunta: string; respuesta: string }[]
  productosRelacionados?: GuiaProductoRelacionado[]
  guiasRelacionadas?: { titulo: string; href: string }[]
  ctaWhatsApp?: string
  fechaPublicacion: string
  /** Solo si la guía se revisó después de publicarse. Alimenta dateModified en el JSON-LD. */
  fechaActualizacion?: string
}

export const CATEGORIAS: Record<GuiaCategoria, { label: string; descripcion: string }> = {
  problemas: {
    label: "Problemas y síntomas",
    descripcion: "Guías para identificar fallas comunes en vehículos chinos y americanos",
  },
  compra: {
    label: "Guías de compra",
    descripcion: "Cómo elegir, identificar y comprar repuestos automotrices en Ecuador",
  },
  marcas: {
    label: "Por marca",
    descripcion: "Dónde encontrar repuestos por marca de vehículo en Ecuador",
  },
  mantenimiento: {
    label: "Mantenimiento",
    descripcion: "Intervalos y recomendaciones de mantenimiento preventivo",
  },
}

// ─── GUÍAS DE PROBLEMAS ───────────────────────────────────────────────────────

const guiasProblemas: Guia[] = [
  {
    slug: "como-saber-si-la-bomba-de-agua-esta-danada",
    categoria: "problemas",
    titulo: "¿Cómo saber si la bomba de agua de mi auto está dañada?",
    descripcion:
      "Síntomas de bomba de agua dañada: sobrecalentamiento, fuga de refrigerante, ruidos. Guía de diagnóstico para autos chinos y americanos en Ecuador.",
    respuesta_corta:
      "La bomba de agua falla cuando el sello mecánico se desgasta o el rodamiento colapsa. Los síntomas principales son: el motor sube rápidamente de temperatura, aparece una fuga de refrigerante en la zona frontal del motor, o escuchas un traqueteo al arrancar en frío. En Ecuador, usar agua de llave en lugar de refrigerante puro acelera el daño interno por corrosión. Si el auto ya sobrecalentó, no arranques de nuevo — continuar puede dañar la culata, una reparación mucho más costosa que una bomba. Para confirmar, revisa si hay fuga en la base de la bomba y si el nivel de refrigerante baja sin fuga visible.",
    keywords: [
      "bomba de agua dañada síntomas",
      "bomba de agua Chery Ecuador",
      "bomba de agua JAC Ecuador",
      "sobrecalentamiento motor Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "La bomba de agua es la encargada de hacer circular el refrigerante por todo el motor. Cuando falla, el motor pierde capacidad de enfriarse y puede sobrecalentarse en minutos. Identificarla a tiempo evita daños costosos como la deformación de la culata.",
      },
      {
        tipo: "h2",
        texto: "Síntomas principales de una bomba de agua dañada",
      },
      {
        tipo: "ul",
        items: [
          "La aguja de temperatura sube rápidamente o llega al rojo.",
          "Fuga de refrigerante (verde, rosado o naranja) en la zona frontal del motor.",
          "Ruido de chirrido o traqueteo al arrancar en frío.",
          "Vapor saliendo del capó o del área del radiador.",
          "Olor dulce similar a caramelo quemado.",
          "El nivel de refrigerante baja constantemente sin fugas externas visibles.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Por qué falla la bomba de agua?",
      },
      {
        tipo: "ul",
        items: [
          "Desgaste del sello mecánico interno (fuga por el orificio de drenaje de la bomba).",
          "Rodamiento desgastado (produce el traqueteo).",
          "Correa de distribución rota o floja que deja de girar la bomba.",
          "Refrigerante contaminado con agua de llave que oxida los componentes.",
          "Sobrecalentamientos previos no atendidos.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué revisar antes de comprar una bomba de agua?",
      },
      {
        tipo: "p",
        texto:
          "Confirma el año exacto del vehículo, el tipo de motor (cilindrada y código) y si la bomba es accionada por correa de distribución o correa de accesorios. Este detalle cambia el parte según el modelo.",
      },
      {
        tipo: "aviso",
        texto:
          "Si tu vehículo ya sobrecalentó, no arranques de nuevo hasta revisar el nivel de refrigerante. Continuar con el motor caliente puede destruir la culata.",
      },
      {
        tipo: "h2",
        texto: "¿Cuándo cambiar también la correa de distribución?",
      },
      {
        tipo: "p",
        texto:
          "Si la bomba es accionada por la correa de distribución (la mayoría de motores Chery y JAC), cambia ambas al mismo tiempo. El costo de mano de obra es el mismo porque el motor se desarma igual.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cuánto dura una bomba de agua?",
        respuesta:
          "Entre 80.000 y 150.000 km en condiciones normales. En Ecuador, usar agua de llave en lugar de refrigerante puro acorta significativamente su vida útil.",
      },
      {
        pregunta: "¿Puedo seguir manejando con la bomba de agua dañada?",
        respuesta:
          "No. Si el motor ya alcanza temperaturas altas, cada kilómetro adicional puede causar daños irreversibles en la culata o los pistones. Es mejor detener el vehículo y remolcarlo.",
      },
      {
        pregunta: "¿Dónde encuentro bomba de agua para mi Chery o JAC en Ecuador?",
        respuesta:
          "En El Chino Americano tenemos bombas de agua OEM y alternas para las principales marcas chinas y americanas. Escríbenos por WhatsApp con el modelo, año y código de motor.",
      },
    ],
    productosRelacionados: [
      { nombre: "Bombas de agua en el catálogo", href: "/catalogo?categoria=enfriamiento" },
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
      { nombre: "Repuestos para JAC", href: "/catalogo/marca/jac" },
    ],
    guiasRelacionadas: [
      { titulo: "Mi auto pierde refrigerante — causas y qué revisar", href: "/guias/problemas/auto-pierde-refrigerante-causas" },
      { titulo: "Luz del motor encendida — qué hacer primero", href: "/guias/problemas/luz-del-motor-encendida-que-hacer" },
    ],
    ctaWhatsApp: "Consultar disponibilidad de bomba de agua para mi vehículo",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "ruido-al-frenar-chery-tiggo",
    categoria: "problemas",
    titulo: "Mi Chery Tiggo hace ruido al frenar — ¿qué puede ser?",
    descripcion:
      "Ruido al frenar en Chery Tiggo: cómo diferenciar si son pastillas, discos o pinzas. Guía para Ecuador con intervalos de cambio y qué revisar.",
    respuesta_corta:
      "El ruido al frenar en el Chery Tiggo tiene tres causas principales: un chirrido agudo al inicio del frenado indica que las pastillas llegaron a su límite (el indicador metálico roza el disco); un raspado fuerte y constante significa que las pastillas se agotaron y el metal roza directamente el disco; y una vibración en el pedal al frenar señala discos deformados. En Quito, el tráfico con muchas frenadas cortas desgasta las pastillas más rápido que en ruta. Cambiar solo las pastillas sin revisar el espesor del disco es el error más común — si el disco está por debajo del mínimo, también debe reemplazarse.",
    keywords: [
      "ruido al frenar Chery Tiggo",
      "pastillas freno Chery Tiggo Ecuador",
      "discos freno Chery Ecuador",
      "frenos vehículos chinos Quito",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "El ruido al frenar es uno de los avisos más claros de que el sistema de frenos necesita revisión. En el Chery Tiggo (T11, T15, T19, T21 y T2), los problemas de frenos siguen patrones específicos.",
      },
      {
        tipo: "h2",
        texto: "Tipos de ruido y qué indica cada uno",
      },
      {
        tipo: "h3",
        texto: "Chirrido agudo al inicio del frenado",
      },
      {
        tipo: "p",
        texto:
          "Las pastillas llegaron a su límite. El indicador metálico roza el disco intencionalmente para advertirte. Puedes seguir circulando con precaución pero hay que cambiarlas pronto.",
      },
      {
        tipo: "h3",
        texto: "Raspado metálico fuerte y constante",
      },
      {
        tipo: "p",
        texto:
          "Las pastillas se agotaron. El metal de la base roza directamente el disco. Detente: en este punto el disco también se daña y el costo de reparación sube.",
      },
      {
        tipo: "h3",
        texto: "Vibración en el pedal al frenar",
      },
      {
        tipo: "p",
        texto:
          "Los discos tienen variación de espesor por calor o fisuras. Ocurre especialmente si el auto bajó pendientes largas con freno aplicado.",
      },
      {
        tipo: "h2",
        texto: "Causas frecuentes en Ecuador",
      },
      {
        tipo: "ul",
        items: [
          "Pastillas de baja calidad con material de fricción inadecuado.",
          "Discos oxidados tras días de lluvia sin uso.",
          "Pinzas de freno atascadas que mantienen presión constante.",
          "Líquido de frenos degradado (oscuro, absorbe humedad).",
          "Freno de mano mal calibrado.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "Los frenos siempre se cambian por eje (los dos delanteros o los dos traseros juntos). Cambiar solo uno hace que el auto jale hacia un lado al frenar.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cada cuánto hay que cambiar las pastillas en el Chery Tiggo?",
        respuesta:
          "Entre 30.000 y 50.000 km según el uso. En Quito, el tráfico urbano con muchas frenadas cortas las desgasta más rápido.",
      },
      {
        pregunta: "¿Dónde consigo pastillas y discos para Chery Tiggo en Quito?",
        respuesta:
          "En El Chino Americano tenemos pastillas y discos para las distintas generaciones del Tiggo. Escríbenos por WhatsApp con el año y versión.",
      },
    ],
    productosRelacionados: [
      { nombre: "Repuestos de frenos en el catálogo", href: "/catalogo?categoria=frenos" },
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
    ],
    guiasRelacionadas: [
      { titulo: "Frenos que chirrían — ¿pastillas o discos?", href: "/guias/problemas/frenos-chirrían-pastillas-o-discos" },
      { titulo: "¿Dónde comprar repuestos Chery en Ecuador?", href: "/guias/marcas/repuestos-chery-ecuador" },
    ],
    ctaWhatsApp: "Consultar pastillas y discos para mi Chery Tiggo",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "como-identificar-amortiguadores-gastados",
    categoria: "problemas",
    titulo: "¿Cómo identificar si los amortiguadores de mi auto están gastados?",
    descripcion:
      "Señales de amortiguadores en mal estado: rebote excesivo, inestabilidad, desgaste irregular de neumáticos. Para vehículos chinos y americanos en Ecuador.",
    respuesta_corta:
      "Los amortiguadores gastados se identifican por tres señales principales: el auto rebota más de una vez al pasar por un bache, el vehículo se inclina exageradamente al frenar o en curvas, y los neumáticos presentan desgaste irregular (parches o consumo desigual en el ancho). También puedes hacer la prueba del rebote: empuja fuerte hacia abajo en cada esquina del auto y suelta — si rebota más de una vez antes de estabilizarse, el amortiguador está gastado. En Ecuador, las vías en mal estado y los reductores de velocidad aceleran el desgaste, especialmente en vehículos chinos que circulan por zonas rurales.",
    keywords: [
      "amortiguadores gastados síntomas",
      "amortiguadores Chery Ecuador",
      "suspensión vehículos chinos Ecuador",
      "amortiguadores JAC Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Los amortiguadores no solo hacen el viaje cómodo — son un componente de seguridad activa. Un amortiguador en mal estado aumenta la distancia de frenado y reduce el control, especialmente en curvas y pavimento mojado.",
      },
      {
        tipo: "h2",
        texto: "Señales de que los amortiguadores necesitan revisión",
      },
      {
        tipo: "ul",
        items: [
          "El auto rebota más de una vez al pasar por irregularidades.",
          "Se inclina exageradamente hacia adelante al frenar o hacia atrás al acelerar.",
          "En curvas, sientes que el auto se balancea o tiende a irse hacia afuera.",
          "El volante vibra a ciertas velocidades (entre 80 y 110 km/h).",
          "Desgaste irregular o en parches en los neumáticos.",
          "Manchas de aceite en la carrocería del amortiguador (fuga interna).",
          "Ruido de golpe o traqueteo al pasar por irregularidades.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Cada cuánto se cambian?",
      },
      {
        tipo: "p",
        texto:
          "En condiciones normales, entre 60.000 y 80.000 km. En Ecuador, las vías en mal estado y los reductores frecuentes aceleran el desgaste. Revísalos cada 40.000 km si el uso es intenso.",
      },
      {
        tipo: "h2",
        texto: "¿Originales, OEM o alternos?",
      },
      {
        tipo: "p",
        texto:
          "Para vehículos chinos, marcas como KYB, Monroe o Sachs ofrecen mejor durabilidad que los amortiguadores de origen genérico. Para uso en vías destapadas o con carga frecuente, considera OEM o reforzados.",
      },
      {
        tipo: "aviso",
        texto:
          "Cambia los amortiguadores por eje (los dos delanteros o los dos traseros). Cambiar solo uno deja el auto desequilibrado.",
      },
    ],
    faq: [
      {
        pregunta: "¿Se cambian los amortiguadores de a dos o de a cuatro?",
        respuesta:
          "Por eje: si cambias los delanteros, cambia los dos. Lo mismo para traseros. Cambiarlos de a cuatro es ideal si todos tienen el mismo kilometraje.",
      },
      {
        pregunta: "¿Consiguen amortiguadores para vehículos chinos en Ecuador?",
        respuesta:
          "Sí. En El Chino Americano tenemos amortiguadores para Chery, JAC, BYD, Great Wall y otras marcas. Escríbenos con el modelo y año.",
      },
    ],
    productosRelacionados: [
      { nombre: "Suspensión en el catálogo", href: "/catalogo?categoria=suspension" },
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
      { nombre: "Repuestos para JAC", href: "/catalogo/marca/jac" },
    ],
    guiasRelacionadas: [
      { titulo: "Ruido al girar el volante — causas en autos chinos y americanos", href: "/guias/problemas/ruido-al-girar-el-volante" },
    ],
    ctaWhatsApp: "Consultar amortiguadores para mi vehículo",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "auto-pierde-refrigerante-causas",
    categoria: "problemas",
    titulo: "Mi auto pierde refrigerante — causas comunes y qué revisar primero",
    descripcion:
      "Por qué un auto pierde refrigerante sin fuga visible: culata, radiador, mangueras o bomba de agua. Diagnóstico paso a paso para vehículos en Ecuador.",
    respuesta_corta:
      "Perder refrigerante sin ver una fuga obvia tiene cuatro causas posibles, ordenadas de menor a mayor gravedad: una manguera o conexión con micro-fuga que se evapora antes de gotear al suelo, el radiador picado internamente, la bomba de agua con el sello dañado, o la junta de culata fallando (la más grave). La junta de culata se distingue por tres señales específicas: aceite color chocolate con leche en la varilla, humo blanco espeso por el escape que no desaparece, y burbujas en el depósito de refrigerante. Si ves cualquiera de esas tres señales, no arranques el motor hasta llevar el auto a un taller.",
    keywords: [
      "auto pierde refrigerante sin fuga",
      "culata quemada síntomas Ecuador",
      "radiador picado Ecuador",
      "sistema enfriamiento Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "El nivel del depósito baja semana a semana pero no hay charcos bajo el auto ni manchas visibles. Hay varias causas posibles y algunas son mucho más urgentes que otras.",
      },
      {
        tipo: "h2",
        texto: "Causas ordenadas de menor a mayor gravedad",
      },
      {
        tipo: "h3",
        texto: "1. Fuga pequeña en manguera o conexión",
      },
      {
        tipo: "p",
        texto:
          "Las mangueras se endurecen y agrietan con el tiempo. Una fuga pequeña puede evaporarse antes de llegar al suelo si el motor está caliente. Revisa con el motor frío, apretando con los dedos para detectar zonas blandas o agrietadas.",
      },
      {
        tipo: "h3",
        texto: "2. Radiador picado internamente",
      },
      {
        tipo: "p",
        texto:
          "Los radiadores de aluminio (usados en la mayoría de vehículos chinos) pueden picarse. La fuga es tan fina que se evapora. Señal: depósitos blanquecinos en las aletas del radiador.",
      },
      {
        tipo: "h3",
        texto: "3. Bomba de agua con sello dañado",
      },
      {
        tipo: "p",
        texto:
          "El refrigerante gotea por el orificio de drenaje de la bomba de forma intermitente y difícil de ver.",
      },
      {
        tipo: "h3",
        texto: "4. Junta de culata dañada (la más grave)",
      },
      {
        tipo: "p",
        texto:
          "El refrigerante entra al aceite o a los cilindros. Señales específicas: aceite color chocolate con leche en la varilla, humo blanco espeso por el escape, burbujas en el depósito de refrigerante.",
      },
      {
        tipo: "aviso",
        texto:
          "Si el aceite se ve blanco o cremoso al revisar la varilla, no arranques el motor. Con la culata dañada, el motor puede destruirse en minutos.",
      },
      {
        tipo: "h2",
        texto: "Diagnóstico rápido",
      },
      {
        tipo: "ol",
        items: [
          "Revisa la varilla de aceite: ¿está blanco o con espuma? → Probable culata.",
          "Observa el escape al arrancar en frío: ¿humo blanco que no desaparece? → Sospecha de culata.",
          "Revisa el depósito de refrigerante: ¿tiene burbujas o espuma? → Posible culata.",
          "Inspecciona mangueras y radiador buscando costras o manchas secas de refrigerante.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Puedo usar agua de llave temporalmente?",
        respuesta:
          "Solo como medida de emergencia para llegar al taller. El agua de llave no protege contra la corrosión ni tiene el punto de ebullición adecuado.",
      },
      {
        pregunta: "¿Con qué frecuencia hay que cambiar el refrigerante?",
        respuesta:
          "Cada 2 años o 40.000 km. El refrigerante degradado pierde sus propiedades anticorrosivas y acelera el deterioro del sistema de enfriamiento.",
      },
    ],
    productosRelacionados: [
      { nombre: "Sistema de enfriamiento en el catálogo", href: "/catalogo?categoria=enfriamiento" },
      { nombre: "Bombas de agua", href: "/catalogo?categoria=enfriamiento" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo saber si la bomba de agua está dañada?", href: "/guias/problemas/como-saber-si-la-bomba-de-agua-esta-danada" },
    ],
    ctaWhatsApp: "Consultar repuestos del sistema de enfriamiento",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "bateria-auto-necesita-cambio",
    categoria: "problemas",
    titulo: "¿Cómo saber si la batería de mi auto necesita cambio?",
    descripcion:
      "Síntomas de batería en mal estado: arranque lento, luces tenues, fallos eléctricos. Cuánto dura una batería en Ecuador y cuándo reemplazarla.",
    respuesta_corta:
      "La batería necesita cambio cuando el motor arranca lento o con dificultad (especialmente por las mañanas), cuando el auto no arranca si lo dejas más de un día sin encender, o cuando la batería lleva más de 4 años. En Quito, la altitud (2.800 msnm) hace que los motores demanden más al arrancar, lo que desgasta la batería más rápido. La diferencia clave con una falla del alternador: si la batería se descarga de nuevo pocas horas después de cargarla mientras manejas, el alternador no está cargando bien. Si no retiene carga aunque el alternador funcione, la batería está sulfatada y debe reemplazarse.",
    keywords: [
      "batería auto Ecuador",
      "batería Chery JAC BYD",
      "cambiar batería Quito",
      "alternador o batería Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "La batería es el primer eslabón de toda la electricidad del auto. Cuando empieza a fallar, el motor no arranca bien y el sistema eléctrico se vuelve errático.",
      },
      {
        tipo: "h2",
        texto: "Señales de que la batería está fallando",
      },
      {
        tipo: "ul",
        items: [
          "Motor arranca lento, especialmente por las mañanas.",
          "Las luces del tablero parpadean o se ven tenues al arrancar.",
          "No arranca si lo dejas más de un día sin usar.",
          "Escuchas un 'clic-clic' al girar la llave.",
          "La batería necesita carga externa frecuente.",
          "Corrosión verde o blanca en los bornes.",
          "Más de 4 años con la misma batería.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿La batería o el alternador?",
      },
      {
        tipo: "p",
        texto:
          "Si el auto arranca bien pero la batería se descarga en pocas horas de uso normal, el problema es el alternador. Si la batería no retiene carga aunque el alternador esté bien, la batería está sulfatada y hay que reemplazarla.",
      },
      {
        tipo: "h2",
        texto: "¿Cuánto dura una batería en Ecuador?",
      },
      {
        tipo: "p",
        texto:
          "En promedio 3 a 5 años. En Quito, la altitud hace que los motores trabajen más al arrancar, lo que demanda más de la batería. Las baterías originales de vehículos chinos suelen durar menos que las marcas de reemplazo de calidad.",
      },
    ],
    faq: [
      {
        pregunta: "¿Puedo recargar una batería completamente descargada?",
        respuesta:
          "Depende. Si la descarga fue profunda y repetida, las celdas pueden estar sulfatadas permanentemente. Una batería que no retiene carga después de recargarla debe reemplazarse.",
      },
      {
        pregunta: "¿Qué capacidad de batería necesita mi auto?",
        respuesta:
          "La capacidad en amperios-hora (Ah) está indicada en el manual del vehículo o en la batería original. No uses una batería de menor capacidad — el sistema eléctrico está calibrado para la carga correcta.",
      },
    ],
    productosRelacionados: [
      { nombre: "Repuestos eléctricos en el catálogo", href: "/catalogo?categoria=electrico" },
    ],
    guiasRelacionadas: [
      { titulo: "Luz del motor encendida — qué hacer primero", href: "/guias/problemas/luz-del-motor-encendida-que-hacer" },
    ],
    ctaWhatsApp: "Consultar batería compatible para mi vehículo",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "luz-del-motor-encendida-que-hacer",
    categoria: "problemas",
    titulo: "Luz del motor encendida — qué hacer primero y cuándo es urgente",
    descripcion:
      "La luz Check Engine puede indicar desde una tapa de gasolina suelta hasta una falla seria. Cómo distinguir cuándo parar en Ecuador.",
    respuesta_corta:
      "La diferencia más importante al ver la luz del motor: si la luz está fija (no parpadea) y el auto funciona normalmente, puedes llegar al taller con precaución pero no lo ignores por semanas. Si la luz parpadea, indica un misfiring activo (fallo de encendido en un cilindro) — reduce la velocidad y ve al taller pronto porque el catalizador puede dañarse. Las causas más frecuentes en vehículos chinos y americanos son la tapa de gasolina mal cerrada, el sensor de oxígeno (O2) desgastado, bujías en mal estado, o el sensor de masa de aire (MAF) sucio. Sin leer el código OBD-II, es difícil saber qué parte cambiar.",
    keywords: [
      "luz check engine Ecuador",
      "check engine Chery JAC",
      "sensor O2 Ecuador",
      "diagnóstico OBD Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "La luz del motor (check engine) enciende cuando la ECU detecta un valor fuera de rango en algún sensor. Puede ser algo menor como una tapa de gasolina mal cerrada, o algo serio como un fallo en el sistema de combustible.",
      },
      {
        tipo: "h2",
        texto: "¿Luz fija o luz parpadeante?",
      },
      {
        tipo: "p",
        texto:
          "Una luz fija indica un problema detectado pero no inmediatamente peligroso. Una luz que parpadea indica un fallo activo — generalmente misfiring. En este caso, reduce la velocidad y ve al taller pronto: el catalizador puede dañarse si continúas.",
      },
      {
        tipo: "h2",
        texto: "Causas más frecuentes en vehículos chinos y americanos",
      },
      {
        tipo: "ul",
        items: [
          "Tapa del tanque de gasolina mal cerrada o con sello dañado.",
          "Sensor de oxígeno (O2) desgastado — frecuente después de 80.000 km.",
          "Bujías o cables de bujía en mal estado (produce misfiring).",
          "Sensor de masa de aire (MAF) sucio o dañado.",
          "Catalizador deteriorado.",
          "Inyectores sucios o con fuga.",
          "Sensor de posición del árbol de levas o cigüeñal.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Cómo leer el código de falla?",
      },
      {
        tipo: "p",
        texto:
          "Necesitas un escáner OBD-II (hay opciones de USD 20–30 que conectan al puerto bajo el tablero). El código (P0XXX, P1XXX) indica exactamente qué sistema falló.",
      },
      {
        tipo: "aviso",
        texto:
          "Borrar el código sin reparar la causa no soluciona nada — la luz vuelve en pocos kilómetros. Léelo, diagnostica y repara antes de borrarlo.",
      },
    ],
    faq: [
      {
        pregunta: "¿Puedo seguir manejando con la luz del motor encendida?",
        respuesta:
          "Si está fija y el auto funciona normalmente, sí, con precaución. Si parpadea o el auto tiembla o pierde potencia, detente.",
      },
      {
        pregunta: "¿El sensor O2 afecta el consumo de combustible?",
        respuesta:
          "Sí. Un sensor O2 dañado puede aumentar el consumo entre un 10% y 40%.",
      },
    ],
    productosRelacionados: [
      { nombre: "Sensores y repuestos eléctricos", href: "/catalogo?categoria=electrico" },
      { nombre: "Filtros", href: "/catalogo?categoria=filtros" },
    ],
    guiasRelacionadas: [
      { titulo: "Mi Chery o JAC arranca con dificultad", href: "/guias/problemas/auto-chino-arranca-con-dificultad" },
      { titulo: "¿Cada cuánto se cambia el filtro de aceite?", href: "/guias/problemas/cada-cuanto-cambiar-filtro-de-aceite" },
    ],
    ctaWhatsApp: "Consultar sensores y repuestos para mi motor",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "ruido-al-girar-el-volante",
    categoria: "problemas",
    titulo: "Ruido al girar el volante — causas en autos chinos y americanos",
    descripcion:
      "Chasquidos, chirridos o golpes al girar el volante en Chery, JAC, BYD, Chevrolet o Ford. Rótulas, cremallera, dirección asistida o bujes.",
    respuesta_corta:
      "Un chasquido sordo al girar despacio (maniobras de parqueo) casi siempre apunta a una rótula desgastada o a un buje de barra estabilizadora partido. Un chirrido agudo al girar puede indicar bajo nivel de aceite de dirección hidráulica o el cojinete del soporte del amortiguador desgastado. En vehículos chinos como Chery Tiggo y JAC S3, la cremallera de dirección y las rótulas son los componentes que más fallan. Las rótulas y terminales de dirección son componentes de seguridad críticos: una rótula partida en movimiento puede causar pérdida total de control del vehículo, por lo que no se debe postergar su revisión.",
    keywords: [
      "ruido al girar volante Ecuador",
      "rótula dañada Chery JAC",
      "cremallera dirección Ecuador",
      "suspensión delantera Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Un ruido al girar el volante casi siempre apunta al sistema de dirección o la suspensión delantera. El tipo de ruido ayuda a acotar el diagnóstico.",
      },
      {
        tipo: "h2",
        texto: "Tipos de ruido y causas probables",
      },
      {
        tipo: "h3",
        texto: "Chasquido sordo al girar despacio",
      },
      {
        tipo: "p",
        texto: "Rótula desgastada o buje de barra estabilizadora partido.",
      },
      {
        tipo: "h3",
        texto: "Chirrido agudo al girar",
      },
      {
        tipo: "p",
        texto: "Bajo nivel de aceite de dirección hidráulica, o cojinete del soporte del amortiguador delantero desgastado.",
      },
      {
        tipo: "h3",
        texto: "Zumbido que aumenta con la velocidad",
      },
      {
        tipo: "p",
        texto: "Rodamiento de rueda (masa) desgastado — el ruido cambia al girar ligeramente el volante.",
      },
      {
        tipo: "h2",
        texto: "Componentes que más fallan en marcas chinas",
      },
      {
        tipo: "ul",
        items: [
          "Rótulas superiores e inferiores — alto desgaste en vías en mal estado.",
          "Bujes de brazos de suspensión — se endurecen y agrietan.",
          "Cremallera de dirección — especialmente en Chery Tiggo y JAC S3.",
          "Cojinete del soporte del amortiguador — produce chirrido al girar.",
          "Terminal de dirección — produce juego en el volante.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "Las rótulas y terminales de dirección son componentes de seguridad. Una rótula partida en movimiento puede causar pérdida de control. No postergues la revisión.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cómo sé si la rótula de mi auto está mala?",
        respuesta:
          "Con el auto elevado y la rueda colgando, intenta moverla hacia arriba y abajo. Si hay movimiento o chasquido, la rótula está desgastada. También notarás desgaste irregular en el neumático.",
      },
      {
        pregunta: "¿Consiguen rótulas para Chery o JAC en Ecuador?",
        respuesta:
          "Sí. Tenemos rótulas, terminales y bujes para las principales marcas chinas. Escríbenos con el modelo y año del vehículo.",
      },
    ],
    productosRelacionados: [
      { nombre: "Suspensión y dirección en el catálogo", href: "/catalogo?categoria=suspension" },
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo identificar si los amortiguadores están gastados?", href: "/guias/problemas/como-identificar-amortiguadores-gastados" },
    ],
    ctaWhatsApp: "Consultar rótulas, terminales y repuestos de dirección",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "cada-cuanto-cambiar-filtro-de-aceite",
    categoria: "problemas",
    titulo: "¿Cada cuánto se cambia el filtro de aceite y por qué importa?",
    descripcion:
      "Intervalos de cambio de filtro de aceite según tipo de aceite y uso. Por qué siempre debe cambiarse junto con el aceite en vehículos en Ecuador.",
    respuesta_corta:
      "El filtro de aceite se cambia en cada cambio de aceite, sin excepción. Los intervalos de referencia son: cada 5.000 km con aceite mineral, cada 7.500 km con semisintético y cada 10.000 km con sintético, siempre validando contra el manual de tu versión. Reutilizar el filtro contamina el aceite nuevo desde el primer kilómetro, porque las partículas metálicas y de carbón que retuvo vuelven a circular. Cuando el filtro se satura, la válvula de by-pass se abre y el motor pasa a lubricarse con aceite sin filtrar: ese es el escenario que destruye cojinetes. En uso urbano intenso, en zonas de polvo o en la sierra ecuatoriana conviene acortar el intervalo. Para pedir el filtro correcto envía marca, modelo, año y código de motor, o el número de parte del filtro usado.",
    keywords: [
      "cada cuánto cambiar filtro aceite Ecuador",
      "filtro aceite Chery JAC Ecuador",
      "mantenimiento motor Ecuador",
      "cambio aceite Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "El filtro de aceite atrapa partículas metálicas, carbón y contaminantes. Si no se cambia, se satura y deja de filtrar — o el aceite circula sin filtrar por la válvula de alivio.",
      },
      {
        tipo: "h2",
        texto: "Intervalos recomendados",
      },
      {
        tipo: "ul",
        items: [
          "Aceite mineral: cada 5.000 km o en cada cambio de aceite.",
          "Aceite semisintético: cada 7.500 km o en cada cambio.",
          "Aceite sintético: cada 10.000 km — pero igualmente en cada cambio.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Importa qué marca de filtro usar?",
      },
      {
        tipo: "p",
        texto:
          "Sí. Un filtro de baja calidad tiene un medio filtrante más poroso que deja pasar partículas dañinas. Para vehículos chinos, muchos propietarios en Ecuador usan filtros genéricos por precio, lo que acelera el desgaste del motor.",
      },
      {
        tipo: "h2",
        texto: "Señales de que el aceite o filtro llevan demasiado tiempo",
      },
      {
        tipo: "ul",
        items: [
          "Aceite negro espeso en la varilla (debería ser ámbar o marrón, no negro).",
          "Golpeteo en el motor al arrancar en frío.",
          "Consumo de aceite mayor al normal.",
          "Luz de presión de aceite encendida.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Puedo cambiar solo el aceite sin el filtro?",
        respuesta:
          "Técnicamente sí, pero no es recomendable. El filtro viejo retiene aceite contaminado que se mezcla con el nuevo, reduciendo la efectividad del cambio.",
      },
      {
        pregunta: "¿El filtro de aceite es el mismo para todos los motores Chery?",
        respuesta:
          "No. Cada modelo y versión tiene un filtro específico. Siempre verifica el código con el modelo, año y código de motor.",
      },
    ],
    productosRelacionados: [
      { nombre: "Filtros en el catálogo", href: "/catalogo?categoria=filtros" },
      { nombre: "Motor y repuestos internos", href: "/catalogo?categoria=motor" },
    ],
    guiasRelacionadas: [
      { titulo: "Mi Chery o JAC arranca con dificultad", href: "/guias/problemas/auto-chino-arranca-con-dificultad" },
    ],
    ctaWhatsApp: "Consultar filtro de aceite para mi vehículo",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "auto-chino-arranca-con-dificultad",
    categoria: "problemas",
    titulo: "Mi Chery o JAC arranca con dificultad — diagnóstico inicial",
    descripcion:
      "Causas de arranque difícil en vehículos chinos: batería, motor de arranque, bujías, sensor de cigüeñal. Diagnóstico paso a paso en Ecuador.",
    respuesta_corta:
      "El patrón del problema indica la causa: si el motor arranca difícil en frío pero bien en caliente, revisa las bujías y el sensor de temperatura del refrigerante (ECT). Si escuchas el motor dando vueltas pero no enciende, el sensor de posición del cigüeñal (CKP) o la bomba de combustible pueden estar fallando. Si solo escuchas un clic al girar la llave, el problema es la batería o el motor de arranque. En Quito, las mañanas frías hacen más evidente cualquier debilidad en el sistema de arranque. Mide el voltaje de la batería primero (debe estar entre 12.4 y 12.8V) antes de reemplazar partes.",
    keywords: [
      "Chery no arranca bien",
      "JAC arranca difícil Ecuador",
      "bujías Chery Ecuador",
      "sensor cigüeñal JAC",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Un motor que tarda en arrancar, que hay que intentarlo varias veces, o que arranca mal en frío pero bien en caliente, indica un problema específico.",
      },
      {
        tipo: "h2",
        texto: "Patrón 1: Difícil en frío, bien en caliente",
      },
      {
        tipo: "p",
        texto:
          "Posibles causas: bujías desgastadas, sensor de temperatura del refrigerante (ECT) con lectura incorrecta, o inyectores que no pulverizan bien en frío. En Quito, donde las mañanas son frías, este síntoma es más marcado.",
      },
      {
        tipo: "h2",
        texto: "Patrón 2: Motor da vueltas pero no enciende",
      },
      {
        tipo: "p",
        texto:
          "Revisa el sensor de posición del cigüeñal (CKP) — si falla, la ECU no sabe cuándo inyectar combustible. También puede ser bomba de combustible débil o filtro de combustible obstruido.",
      },
      {
        tipo: "h2",
        texto: "Patrón 3: Solo un clic, no gira",
      },
      {
        tipo: "p",
        texto:
          "La batería no tiene suficiente corriente, o el motor de arranque está dañado. Prueba primero con una batería cargada antes de cambiar el motor de arranque.",
      },
      {
        tipo: "h2",
        texto: "Revisión rápida",
      },
      {
        tipo: "ol",
        items: [
          "Mide el voltaje de la batería: debe estar entre 12.4 y 12.8V en reposo.",
          "Revisa los bornes de batería: corrosión o bornes flojos causan mala conexión.",
          "Inspecciona las bujías si el auto tiene más de 30.000 km sin cambiarlas.",
          "Escucha si la bomba de combustible zumba al girar la llave (antes de arrancar).",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Cada cuánto se cambian las bujías en vehículos chinos?",
        respuesta:
          "Bujías estándar de cobre: cada 20.000–30.000 km. Bujías de iridio o platino: 60.000–100.000 km. Muchos vehículos chinos traen bujías estándar de fábrica.",
      },
      {
        pregunta: "¿Consiguen bujías y sensores CKP para Chery o JAC en Ecuador?",
        respuesta:
          "Sí. Tenemos sensores de cigüeñal, bujías y componentes del sistema de encendido para marcas chinas. Escríbenos por WhatsApp.",
      },
    ],
    productosRelacionados: [
      { nombre: "Motor y repuestos de encendido", href: "/catalogo?categoria=motor" },
      { nombre: "Filtros", href: "/catalogo?categoria=filtros" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cada cuánto se cambia el filtro de aceite?", href: "/guias/problemas/cada-cuanto-cambiar-filtro-de-aceite" },
      { titulo: "Batería — ¿cuándo necesita cambio?", href: "/guias/problemas/bateria-auto-necesita-cambio" },
    ],
    ctaWhatsApp: "Consultar bujías y sensores para mi vehículo",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "frenos-chirrían-pastillas-o-discos",
    categoria: "problemas",
    titulo: "Frenos que chirrían — ¿debo cambiar las pastillas, los discos o ambos?",
    descripcion:
      "Cómo decidir si cambiar solo pastillas o también los discos de freno. Medidas mínimas y cuándo cambiar ambos en Ecuador.",
    respuesta_corta:
      "La regla práctica: si el disco tiene rayaduras profundas que se sienten con la uña, o está por debajo del espesor mínimo marcado en su costado (habitualmente 18 a 20 mm en frenos delanteros), cambia pastillas y discos juntos. Si el disco está en buen estado y dentro de espesor, basta con cambiar las pastillas. Colocar pastillas nuevas sobre discos desgastados es el error más común: no se asientan bien, el frenado es inferior y las pastillas se consumen mucho más rápido. Si el chirrido persiste con pastillas nuevas, el disco necesita rectificación o las pastillas son de baja calidad. Un chirrido metálico continuo indica que el testigo de desgaste ya está tocando el disco, y en ese punto no conviene esperar más. Para cotizar envía marca, modelo, año y si el freno es delantero o posterior.",
    keywords: [
      "pastillas o discos freno Ecuador",
      "cuándo cambiar discos freno",
      "frenos vehículos chinos Ecuador",
      "repuestos frenos Quito",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "El chirrido en los frenos tiene varias causas. El error más común es creer que siempre requiere cambiar solo las pastillas.",
      },
      {
        tipo: "h2",
        texto: "¿Cuándo cambiar solo las pastillas?",
      },
      {
        tipo: "ul",
        items: [
          "El indicador de desgaste metálico activa el chirrido de advertencia.",
          "El material de fricción tiene menos de 3 mm.",
          "El disco está dentro de su espesor mínimo y sin rayaduras profundas.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Cuándo cambiar también los discos?",
      },
      {
        tipo: "ul",
        items: [
          "El disco está por debajo del espesor mínimo marcado en su costado.",
          "Tiene rayaduras profundas que se sienten con la uña.",
          "El pedal vibra al frenar (variación de espesor).",
          "Las pastillas anteriores se desgastaron hasta el metal y rayaron el disco.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Y si el chirrido persiste con pastillas nuevas?",
      },
      {
        tipo: "p",
        texto:
          "Puede ser que las pastillas sean de baja calidad, el disco necesite rectificación, haya humedad en los frenos (desaparece en los primeros frenados), o una pinza esté atascada.",
      },
      {
        tipo: "aviso",
        texto:
          "Los frenos siempre se cambian por eje (ambas ruedas del mismo eje al mismo tiempo). Si cambias solo uno, el auto jalará hacia el lado con frenos nuevos.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cómo mido el espesor del disco sin desmontarlo?",
        respuesta:
          "Con un micrómetro de frenos, midiendo en varios puntos del disco. También puedes llevarlo a un taller — la medición toma minutos.",
      },
      {
        pregunta: "¿Hay pastillas y discos para vehículos chinos en Ecuador?",
        respuesta:
          "Sí. Tenemos pastillas y discos para Chery, JAC, BYD, Great Wall y otras marcas. Escríbenos con el modelo, año y si necesitas delanteros o traseros.",
      },
    ],
    productosRelacionados: [
      { nombre: "Frenos en el catálogo", href: "/catalogo?categoria=frenos" },
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
    ],
    guiasRelacionadas: [
      { titulo: "Ruido al frenar en Chery Tiggo", href: "/guias/problemas/ruido-al-frenar-chery-tiggo" },
    ],
    ctaWhatsApp: "Consultar pastillas y discos de freno para mi vehículo",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "problemas-comunes-ford-ecuador",
    categoria: "problemas",
    titulo: "¿Cuáles son los problemas más comunes de los Ford en Ecuador?",
    descripcion:
      "Fallas frecuentes en Ford Ranger, F-150, Explorer, EcoSport y Escape en Ecuador: síntomas, causas y qué repuestos suelen necesitarse.",
    respuesta_corta:
      "Las fallas más reportadas en vehículos Ford en Ecuador son cinco. Primera, desgaste prematuro de suspensión y dirección —bujes, rótulas, terminales y amortiguadores— por el estado de las vías y el uso con carga. Segunda, fugas y sobrecalentamiento en el sistema de enfriamiento, casi siempre por completar el nivel con agua de llave en lugar de refrigerante. Tercera, check engine por sensores de oxígeno o MAF, que elevan el consumo y provocan marcha inestable. Cuarta, falla de marcha y tirones por bobinas y bujías desgastadas, algo que la altura de Quito agrava porque el sistema de encendido trabaja más exigido. Quinta, problemas de inyección y turbo en el Ranger diésel cuando el filtro de combustible no se cambia a tiempo. Casi todas se previenen respetando los intervalos del manual y usando filtros de calidad.",
    keywords: [
      "problemas comunes Ford Ecuador",
      "fallas Ford Ranger Ecuador",
      "problemas Ford EcoSport",
      "fallas comunes Ford Explorer",
      "check engine Ford Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Los Ford tienen buena reputación de robustez en Ecuador, sobre todo en el segmento de pickups. Las fallas que aparecen con más frecuencia tienen menos que ver con defectos de diseño y más con las condiciones de uso locales: vías irregulares, altura, calidad variable del combustible y mantenimiento espaciado.",
      },
      {
        tipo: "h2",
        texto: "1. Suspensión y dirección desgastadas antes de tiempo",
      },
      {
        tipo: "p",
        texto:
          "Es la queja más común en Ranger, F-150 y Explorer. Bujes, rótulas, terminales de dirección y amortiguadores se desgastan más rápido por el estado de las vías y por el uso con carga. Los síntomas son ruidos secos al pasar sobre irregularidades, volante con juego y desgaste irregular de llantas.",
      },
      {
        tipo: "h2",
        texto: "2. Sistema de enfriamiento",
      },
      {
        tipo: "p",
        texto:
          "Fugas de refrigerante, termostato pegado y bomba de agua desgastada. La causa más frecuente en Ecuador es completar el nivel con agua de llave en lugar de refrigerante, lo que acelera la corrosión interna del radiador y de la bomba.",
      },
      {
        tipo: "h2",
        texto: "3. Check engine por sensores",
      },
      {
        tipo: "ul",
        items: [
          "Sensor de oxígeno: aumenta el consumo de combustible y enciende la luz del motor.",
          "Sensor MAF (flujo de aire): marcha inestable y pérdida de potencia.",
          "Sensor de posición del cigüeñal o del árbol de levas: arranque difícil o apagones intermitentes.",
          "Sensor de temperatura del refrigerante: ventilador que no arranca o consumo elevado en frío.",
        ],
      },
      {
        tipo: "h2",
        texto: "4. Encendido en motores a gasolina",
      },
      {
        tipo: "p",
        texto:
          "Bobinas y bujías desgastadas producen falla de marcha, tirones al acelerar y luz del motor parpadeante. En altura el sistema de encendido trabaja más exigido, así que respetar el intervalo de bujías tiene un efecto directo en el desempeño.",
      },
      {
        tipo: "h2",
        texto: "5. Diésel: inyección, turbo y filtro de combustible",
      },
      {
        tipo: "p",
        texto:
          "En las versiones diésel del Ranger, el filtro de combustible es la pieza que más problemas evita. Un filtro saturado somete a los inyectores y a la bomba de alta presión a un esfuerzo innecesario, y esa reparación es de otro orden de costo. Los síntomas de alerta son humo negro, pérdida de potencia y arranque difícil en frío.",
      },
      {
        tipo: "aviso",
        texto:
          "No ignores el check engine encendido de forma permanente, y menos aún si parpadea. Una luz parpadeante indica una falla de combustión activa que puede dañar el catalizador en pocos kilómetros.",
      },
      {
        tipo: "h2",
        texto: "Cómo prevenir la mayoría de estas fallas",
      },
      {
        tipo: "ol",
        items: [
          "Cambia aceite y filtro de aceite a intervalo, sin estirarlo.",
          "Cambia el filtro de combustible en diésel según lo especifica el fabricante.",
          "Usa refrigerante, nunca agua de llave, y revisa el nivel con el motor frío.",
          "Revisa suspensión y alineación cada 10.000 km o si aparecen ruidos.",
          "Cambia bujías al intervalo y no mezcles marcas ni grados térmicos.",
          "Atiende el check engine apenas aparezca, con escáner.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Son confiables los Ford en Ecuador?",
        respuesta:
          "Sí, especialmente las pickups. La mayoría de las fallas reportadas se relacionan con mantenimiento espaciado y con el estado de las vías, no con defectos estructurales del vehículo.",
      },
      {
        pregunta: "¿Qué repuestos Ford se cambian con más frecuencia?",
        respuesta:
          "Filtros, pastillas y discos de freno, amortiguadores, rótulas y terminales de dirección, bujías y bobinas, y componentes del sistema de enfriamiento como bomba de agua y termostato.",
      },
      {
        pregunta: "¿La altura de Quito afecta al motor de mi Ford?",
        respuesta:
          "Afecta el desempeño: a 2.800 metros hay menos densidad de aire, y los motores atmosféricos pierden potencia frente al nivel del mar. Los turbo lo compensan mejor, pero cualquier fuga en la admisión se hace más evidente.",
      },
      {
        pregunta: "¿Dónde consigo estos repuestos Ford en Ecuador?",
        respuesta:
          "En El Chino Americano manejamos originales, OEM y alternos para Ford. Escríbenos por WhatsApp con el modelo, año y versión de motor y te confirmamos disponibilidad, precio y número de parte.",
      },
    ],
    productosRelacionados: [
      { nombre: "Repuestos para Ford", href: "/catalogo/marca/ford" },
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Dónde comprar repuestos Ford en Quito?", href: "/guias/marcas/repuestos-ford-quito" },
      { titulo: "¿Dónde comprar repuestos Ford en Ecuador?", href: "/guias/marcas/repuestos-ford-ecuador" },
      { titulo: "Luz del motor encendida — qué hacer primero", href: "/guias/problemas/luz-del-motor-encendida-que-hacer" },
    ],
    ctaWhatsApp: "Mi Ford presenta una falla y necesito el repuesto. Modelo, año y síntoma:",
    fechaPublicacion: "2026-09-01",
  },
]

// ─── GUÍAS DE MARCA ───────────────────────────────────────────────────────────

const guiasMarcas: Guia[] = [
  {
    slug: "repuestos-chery-ecuador",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos Chery en Ecuador?",
    descripcion:
      "Repuestos para Chery Tiggo 5, Tiggo 7, Tiggo 8, Arrizo 5 y más en Ecuador. Originales, OEM y alternos. Envíos a Quito y todo el país.",
    respuesta_corta:
      "En El Chino Americano encontrarás repuestos para Chery en Ecuador: Tiggo 2, Tiggo 4, Tiggo 5, Tiggo 7, Tiggo 8, Arrizo 5 y QQ. Manejamos piezas originales, OEM y alternas para motor, frenos, suspensión, sistema de enfriamiento, filtros y carrocería. Operamos desde Quito y despachamos a Guayaquil, Cuenca, Ambato, Loja, Manta, Esmeraldas, Santo Domingo de los Tsáchilas y el resto del país en 24 a 72 horas con guía rastreable. Chery es la marca china con mejor disponibilidad de repuestos en Ecuador por ser la de mayor volumen histórico. Al cotizar ten en cuenta que varias series Chery cambiaron de plataforma manteniendo el mismo nombre comercial: envía modelo exacto, año y código de motor, o el número de parte de la pieza usada, y verificamos la compatibilidad antes de despachar.",
    keywords: [
      "repuestos Chery Ecuador",
      "repuestos Chery Tiggo Ecuador",
      "repuestos Chery Arrizo Ecuador",
      "repuestos chinos Quito",
      "donde comprar repuestos Chery Quito",
    ],
    contenido: [
      {
        tipo: "h2",
        texto: "¿Qué repuestos Chery están disponibles?",
      },
      {
        tipo: "ul",
        items: [
          "Motor: bombas de agua, correas de distribución, juntas, pistones, cojinetes.",
          "Frenos: pastillas, discos, mangueras de freno, líquido de frenos.",
          "Suspensión: amortiguadores, rótulas, terminales, bujes, resortes.",
          "Sistema de enfriamiento: radiadores, mangueras, termostatos, reservorios.",
          "Filtros: aceite, aire, combustible, habitáculo.",
          "Carrocería: faros, luces, espejos, parachoques.",
          "Eléctrico: sensores, alternadores, motores de arranque, bujías.",
        ],
      },
      {
        tipo: "h2",
        texto: "Modelos Chery más comunes en Ecuador",
      },
      {
        tipo: "ul",
        items: [
          "Tiggo 5 (2014–2023) — el modelo más vendido en Ecuador",
          "Tiggo 7 / Tiggo 7 Pro (2019–presente)",
          "Tiggo 8 / Tiggo 8 Pro (2020–presente)",
          "Arrizo 5 / Arrizo 5e (2018–presente)",
          "QQ (2009–2017)",
          "Tiggo 2 / Tiggo 2 Pro (2021–presente)",
          "Tiggo 4 / Tiggo 4 Pro (2022–presente)",
        ],
      },
      {
        tipo: "h2",
        texto: "Original vs OEM vs alterno para Chery",
      },
      {
        tipo: "p",
        texto:
          "Los repuestos originales son fabricados por el mismo fabricante de Chery o su proveedor oficial — mayor garantía de compatibilidad y calidad, precio más alto. Los OEM son fabricados por el mismo proveedor que produce las piezas originales, pero vendidos sin el sello de la marca — misma calidad, menor precio. Los alternos son fabricados por terceros con especificaciones similares — precio menor, calidad variable según la marca del fabricante.",
      },
      {
        tipo: "h2",
        texto: "¿Cómo saber qué repuesto necesitas?",
      },
      {
        tipo: "ol",
        items: [
          "Ten a mano: modelo exacto, año del vehículo y código de motor (en la placa del auto o en el manual).",
          "Si tienes el número de parte original (en el repuesto viejo o en el manual), compártelo — es la forma más rápida.",
          "Sin número de parte, describe el síntoma y el sistema afectado (motor, frenos, suspensión).",
          "Escríbenos por WhatsApp — respondemos en menos de 24 horas en horario hábil.",
        ],
      },
      {
        tipo: "h2",
        texto: "Envíos desde Quito a todo Ecuador",
      },
      {
        tipo: "p",
        texto:
          "Coordinamos envíos a Quito, Guayaquil, Cuenca, Ambato, Loja, Manta, Esmeraldas, Santo Domingo de los Tsáchilas y más ciudades. El plazo estimado es de 24 a 72 horas según la ciudad.",
      },
    ],
    faq: [
      {
        pregunta: "¿Tienen repuestos para Chery Tiggo 5 con motor SQRE4G16?",
        respuesta:
          "Sí. El motor SQRE4G16 (1.5L) del Tiggo 5 es uno de los que más manejamos. Confirma la generación del motor (hay variaciones entre años) al consultar.",
      },
      {
        pregunta: "¿Los repuestos Chery son difíciles de conseguir en Ecuador?",
        respuesta:
          "Depende del modelo y el año. Los modelos más vendidos (Tiggo 5, Arrizo 5) tienen buena disponibilidad. Para modelos más antiguos o específicos puede tomar más tiempo. Consúltanos primero.",
      },
      {
        pregunta: "¿Cómo identifico si un repuesto Chery es original?",
        respuesta:
          "Los repuestos originales Chery vienen con el logo de la marca y un número de parte que puedes verificar en el catálogo oficial. Los OEM también son confiables aunque no lleven el logo de la marca.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver catálogo de Chery", href: "/catalogo/marca/chery" },
      { nombre: "Motor para Chery", href: "/catalogo/marca/chery" },
      { nombre: "Frenos para Chery", href: "/catalogo/marca/chery" },
    ],
    guiasRelacionadas: [
      { titulo: "Ruido al frenar en Chery Tiggo", href: "/guias/problemas/ruido-al-frenar-chery-tiggo" },
      { titulo: "Mi Chery arranca con dificultad", href: "/guias/problemas/auto-chino-arranca-con-dificultad" },
      { titulo: "¿Cómo identificar si los amortiguadores están gastados?", href: "/guias/problemas/como-identificar-amortiguadores-gastados" },
    ],
    ctaWhatsApp: "Cotizar repuesto Chery — modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-jac-ecuador",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos JAC en Ecuador?",
    descripcion:
      "Repuestos para JAC T8, JAC S3, JAC J7 y más en Ecuador. Originales y OEM con envíos desde Quito a todo el país.",
    respuesta_corta:
      "En El Chino Americano tenemos repuestos para JAC en Ecuador: T8 y T6 (camionetas), S2, S3 y S4 (SUV) y J7 (sedán). Manejamos piezas originales, OEM y alternas para motor, frenos, suspensión, sistema de enfriamiento y carrocería. Operamos desde Quito con despacho a todo el Ecuador en 24 a 72 horas y guía de envío rastreable. JAC usa configuraciones de motor distintas según el modelo y el año, y sus camionetas tienen versiones a diésel y a gasolina que no comparten repuestos de motor. Por eso, al cotizar confirma el modelo exacto, el año, el tipo de combustible y el código de motor. Si tienes el número de parte de la pieza usada o el VIN del vehículo, la identificación es inmediata y verificamos la compatibilidad antes de despachar.",
    keywords: [
      "repuestos JAC Ecuador",
      "repuestos JAC T8 Ecuador",
      "repuestos JAC S3 Ecuador",
      "donde comprar repuestos JAC Quito",
    ],
    contenido: [
      {
        tipo: "h2",
        texto: "Modelos JAC con repuestos disponibles",
      },
      {
        tipo: "ul",
        items: [
          "JAC T8 (2019–presente) — camioneta doble cabina",
          "JAC T6 (2016–2020) — camioneta doble cabina",
          "JAC S3 (2015–2019) — SUV compacto",
          "JAC S4 (2018–2021) — SUV",
          "JAC J7 (2020–presente) — sedán",
          "JAC S2 (2015–2018) — SUV pequeño",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué repuestos JAC están disponibles?",
      },
      {
        tipo: "ul",
        items: [
          "Motor: bombas de agua, correas, filtros de aceite, sensores de motor.",
          "Frenos: pastillas y discos para todos los modelos principales.",
          "Suspensión: amortiguadores, rótulas, terminales, bujes.",
          "Sistema de enfriamiento: termostatos, mangueras, radiadores.",
          "Carrocería: faros, luces traseras, espejos laterales.",
          "Filtros: aceite, aire, combustible.",
        ],
      },
      {
        tipo: "h2",
        texto: "Original vs OEM para JAC",
      },
      {
        tipo: "p",
        texto:
          "JAC usa proveedores de marcas reconocidas en su línea de producción. Los repuestos OEM para JAC (misma pieza, sin el sello JAC) son una opción de calidad a menor precio. Para el JAC T8, los repuestos de motor y suspensión tienen buena disponibilidad en el mercado OEM.",
      },
      {
        tipo: "h2",
        texto: "¿Cómo cotizar un repuesto JAC?",
      },
      {
        tipo: "ol",
        items: [
          "Identifica el modelo exacto (T8, S3, J7, etc.) y el año.",
          "Busca el código de motor en la placa del vehículo o en el manual.",
          "Si tienes el número de parte del repuesto viejo, compártelo.",
          "Escríbenos por WhatsApp — respondemos en menos de 24 horas.",
        ],
      },
      {
        tipo: "h2",
        texto: "Envíos a todo el Ecuador",
      },
      {
        tipo: "p",
        texto:
          "Desde Quito coordinamos envíos a Guayaquil, Cuenca, Ambato, Manta, Loja y todo el país en 24 a 72 horas.",
      },
    ],
    faq: [
      {
        pregunta: "¿Son los repuestos JAC fáciles de conseguir en Ecuador?",
        respuesta:
          "Los modelos más recientes como el T8 tienen mejor disponibilidad. Para modelos anteriores como el S3 o T6, algunos repuestos requieren más tiempo. Consulta disponibilidad antes de necesitarlos.",
      },
      {
        pregunta: "¿El JAC T8 usa los mismos repuestos que el T6?",
        respuesta:
          "No en todos los casos. Aunque son plataformas similares, el motor y varios sistemas cambiaron entre generaciones. Siempre confirma el año y código de motor al cotizar.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver catálogo de JAC", href: "/catalogo/marca/jac" },
      { nombre: "Suspensión y dirección", href: "/catalogo?categoria=suspension" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo saber si la bomba de agua está dañada?", href: "/guias/problemas/como-saber-si-la-bomba-de-agua-esta-danada" },
      { titulo: "Mi auto arranca con dificultad", href: "/guias/problemas/auto-chino-arranca-con-dificultad" },
    ],
    ctaWhatsApp: "Cotizar repuesto JAC — modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-ford-ecuador",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos Ford en Ecuador?",
    descripcion:
      "Repuestos para Ford Ranger, F-150, Explorer, Escape y más en Ecuador. Originales, OEM y alternos con envíos desde Quito.",
    respuesta_corta:
      "En El Chino Americano tenemos repuestos para Ford en Ecuador: Ranger, F-150, Explorer, Escape, EcoSport y Bronco Sport. Manejamos piezas originales de marca Motorcraft, OEM y alternas para motor, frenos, suspensión, sistema de enfriamiento y carrocería. Operamos desde Quito con despacho a todo el Ecuador en 24 a 72 horas y guía rastreable. Ford vende varios modelos con el mismo nombre y motores muy distintos entre generaciones: en el Ranger conviven versiones 2.5 a gasolina, 2.2 y 3.2 diésel y 2.3 EcoBoost, y sus repuestos de motor no son intercambiables. Por eso, al cotizar confirma el año, el tipo de combustible, el código de motor y si es 4x2 o 4x4. Con el VIN o el número de parte de la pieza usada verificamos la compatibilidad antes de despachar.",
    keywords: [
      "repuestos Ford Ecuador",
      "repuestos Ford Ranger Ecuador",
      "repuestos Ford F-150 Ecuador",
      "donde comprar repuestos Ford Quito",
      "repuestos americanos Ecuador",
    ],
    contenido: [
      {
        tipo: "h2",
        texto: "Modelos Ford con repuestos disponibles",
      },
      {
        tipo: "ul",
        items: [
          "Ford Ranger (2016–presente) — el más vendido en Ecuador",
          "Ford F-150 (2015–presente)",
          "Ford Explorer (2016–presente)",
          "Ford Escape / EcoSport (2015–presente)",
          "Ford Bronco Sport (2021–presente)",
          "Ford Maverick (2022–presente)",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué repuestos Ford están disponibles?",
      },
      {
        tipo: "ul",
        items: [
          "Motor: bombas de agua, correas de distribución, cadena de timing, juntas, sensores.",
          "Frenos: pastillas y discos delanteros y traseros.",
          "Suspensión: amortiguadores, rótulas, terminales, bujes de horquilla.",
          "Sistema de enfriamiento: radiadores, mangueras, termostatos, reservorios.",
          "Filtros: aceite, aire, combustible, habitáculo.",
          "Carrocería: faros LED, luces traseras, espejos, parachoques.",
        ],
      },
      {
        tipo: "h2",
        texto: "Original vs OEM para Ford",
      },
      {
        tipo: "p",
        texto:
          "Ford en Ecuador usa repuestos Motorcraft como línea original. Los repuestos OEM (de los mismos proveedores de la planta) son una alternativa de calidad equivalente a menor precio. Marcas como Bosch, Denso y Monroe producen repuestos OEM compatibles con Ford.",
      },
      {
        tipo: "h2",
        texto: "Modelos compatibles y consideraciones",
      },
      {
        tipo: "p",
        texto:
          "El Ford Ranger tiene variaciones de motor según el año: el 2.5L NA (2012–2015), el 2.2L TDCi (diésel, importado) y el 2.3L EcoBoost (2019–presente). Cada versión usa repuestos distintos. Confirma el año y código de motor antes de comprar.",
      },
      {
        tipo: "h2",
        texto: "Envíos a todo el Ecuador",
      },
      {
        tipo: "p",
        texto:
          "Desde Quito coordinamos envíos a Guayaquil, Cuenca, Ambato, Manta, Loja, Esmeraldas y todo el país en 24 a 72 horas.",
      },
    ],
    faq: [
      {
        pregunta: "¿Tienen repuestos para Ford Ranger 2.5 gasolina?",
        respuesta:
          "Sí, es uno de los modelos que más manejamos. Confirma el año (2012–2015 vs versiones más recientes) para asegurar la compatibilidad.",
      },
      {
        pregunta: "¿Qué diferencia hay entre un repuesto Motorcraft y uno OEM para Ford?",
        respuesta:
          "Motorcraft es la marca de repuestos oficiales de Ford. Un OEM es fabricado por el mismo proveedor de la planta pero sin el sello Motorcraft — misma calidad, menor precio.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver catálogo de Ford", href: "/catalogo/marca/ford" },
      { nombre: "Frenos para Ford", href: "/catalogo/marca/ford" },
      { nombre: "Sistema de enfriamiento", href: "/catalogo?categoria=enfriamiento" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo saber si la bomba de agua está dañada?", href: "/guias/problemas/como-saber-si-la-bomba-de-agua-esta-danada" },
      { titulo: "Frenos que chirrían — ¿pastillas o discos?", href: "/guias/problemas/frenos-chirrían-pastillas-o-discos" },
    ],
    ctaWhatsApp: "Cotizar repuesto Ford — modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-chevrolet-ecuador",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos Chevrolet en Ecuador?",
    descripcion:
      "Repuestos para Chevrolet D-MAX, Colorado, Blazer, Silverado y más en Ecuador. Originales y OEM desde Quito con envíos nacionales.",
    respuesta_corta:
      "En El Chino Americano tenemos repuestos para Chevrolet en Ecuador: D-MAX, Colorado, Blazer, Silverado, Captiva y Trailblazer. Manejamos piezas originales de marca AC Delco, OEM y alternas para motor, frenos, suspensión y sistema de enfriamiento. Operamos desde Quito con despacho a todo el Ecuador en 24 a 72 horas y guía rastreable. Chevrolet es la marca americana con mayor presencia en el parque automotor ecuatoriano, lo que se traduce en muy buena disponibilidad de repuestos OEM y en precios más competitivos que en marcas de menor rotación. Al cotizar confirma el modelo, el año y si el motor es diésel o gasolina: la D-MAX, por ejemplo, tiene versiones 2.5L y 3.0L diésel con códigos 4JK1 y 4JJ1 que usan repuestos de motor distintos. Con el VIN confirmamos la versión exacta.",
    keywords: [
      "repuestos Chevrolet Ecuador",
      "repuestos Chevrolet D-MAX Ecuador",
      "repuestos Chevrolet Colorado Ecuador",
      "donde comprar repuestos Chevrolet Quito",
    ],
    contenido: [
      {
        tipo: "h2",
        texto: "Modelos Chevrolet con repuestos disponibles",
      },
      {
        tipo: "ul",
        items: [
          "Chevrolet D-MAX (diésel y gasolina, 2012–presente)",
          "Chevrolet Colorado (2015–presente)",
          "Chevrolet Blazer (2019–presente)",
          "Chevrolet Silverado (2014–presente)",
          "Chevrolet Captiva (2011–2018)",
          "Chevrolet Trailblazer (2012–presente)",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué repuestos Chevrolet están disponibles?",
      },
      {
        tipo: "ul",
        items: [
          "Motor: filtros, bombas de aceite, bombas de agua, correas, sensores.",
          "Frenos: pastillas y discos delanteros y traseros.",
          "Suspensión: amortiguadores, rótulas, terminales, bujes.",
          "Sistema de enfriamiento: radiadores, mangueras, termostatos.",
          "Filtros: aceite, aire, combustible, habitáculo.",
          "Carrocería: faros, luces, espejos.",
        ],
      },
      {
        tipo: "h2",
        texto: "Original vs OEM para Chevrolet",
      },
      {
        tipo: "p",
        texto:
          "Los repuestos originales Chevrolet vienen bajo la marca GM Parts o AC Delco. Los repuestos OEM de marcas como Bosch, Denso o Monroe ofrecen calidad equivalente a menor precio. Chevrolet tiene buena disponibilidad de repuestos OEM en Ecuador por su alta penetración de mercado.",
      },
      {
        tipo: "h2",
        texto: "Consideraciones por modelo",
      },
      {
        tipo: "p",
        texto:
          "La D-MAX tiene dos versiones de motor principales: 2.5L 4JK1 y 3.0L 4JJ1 (ambas diésel). Los repuestos no son intercambiables entre versiones. El Colorado usa el motor 2.8L diésel en las versiones Ecuador. Siempre confirma el motor al cotizar.",
      },
    ],
    faq: [
      {
        pregunta: "¿Tienen repuestos para Chevrolet D-MAX 2.5 diésel?",
        respuesta:
          "Sí, es uno de los vehículos que más manejamos. Confirma el año (2012–2016 vs 2017 en adelante) porque el motor cambia entre generaciones.",
      },
      {
        pregunta: "¿Cuál es la diferencia entre AC Delco y un repuesto OEM para Chevrolet?",
        respuesta:
          "AC Delco es la marca de repuestos originales de GM. Un repuesto OEM es fabricado por el mismo proveedor de la planta, pero sin el sello AC Delco — calidad equivalente, precio menor.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver catálogo de Chevrolet", href: "/catalogo/marca/chevrolet" },
      { nombre: "Motor y filtros", href: "/catalogo?categoria=motor" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo saber si la bomba de agua está dañada?", href: "/guias/problemas/como-saber-si-la-bomba-de-agua-esta-danada" },
      { titulo: "Frenos que chirrían — ¿pastillas o discos?", href: "/guias/problemas/frenos-chirrían-pastillas-o-discos" },
    ],
    ctaWhatsApp: "Cotizar repuesto Chevrolet — modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-great-wall-ecuador",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos Great Wall en Ecuador?",
    descripcion:
      "Repuestos para Great Wall Wingle 5, Wingle 7, Haval H6 y más en Ecuador. Originales y OEM desde Quito con envíos nacionales.",
    respuesta_corta:
      "En El Chino Americano tenemos repuestos para Great Wall en Ecuador: Wingle 5 y Wingle 7 (camionetas) y la línea Haval (H2, H6 y Jolion). Manejamos piezas originales, OEM y alternas para motor, frenos, suspensión, sistema de enfriamiento y carrocería. Operamos desde Quito con despacho a todo el Ecuador en 24 a 72 horas y guía rastreable. Los motores más comunes en el país son el 2.0L GW4D20 diésel en las Wingle 5 y 7, y el 2.0 turbo a gasolina en la línea Haval. Great Wall y Haval han crecido con fuerza en los últimos años, pero algunos repuestos específicos todavía se traen bajo pedido: si tu vehículo entra a mantenimiento programado, consulta con anticipación para que el trabajo no se detenga esperando una pieza.",
    keywords: [
      "repuestos Great Wall Ecuador",
      "repuestos Wingle 5 Ecuador",
      "repuestos Haval Ecuador",
      "repuestos Great Wall Quito",
    ],
    contenido: [
      {
        tipo: "h2",
        texto: "Modelos Great Wall con repuestos disponibles",
      },
      {
        tipo: "ul",
        items: [
          "Great Wall Wingle 5 (2010–2019) — camioneta doble cabina",
          "Great Wall Wingle 7 (2019–presente)",
          "Haval H2 (2015–2021)",
          "Haval H6 (2018–presente)",
          "Haval Jolion (2021–presente)",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué repuestos están disponibles?",
      },
      {
        tipo: "ul",
        items: [
          "Motor: filtros, bombas de agua, correas, juntas, sensores.",
          "Frenos: pastillas y discos.",
          "Suspensión: amortiguadores, rótulas, bujes.",
          "Sistema de enfriamiento: radiadores, mangueras, termostatos.",
          "Carrocería: faros, luces, espejos.",
        ],
      },
      {
        tipo: "h2",
        texto: "Consideraciones importantes para Great Wall",
      },
      {
        tipo: "p",
        texto:
          "Great Wall tiene dos líneas de vehículos distintas en Ecuador: la Wingle (camionetas de trabajo) y la Haval (SUVs). Los repuestos entre líneas no son intercambiables. Para los Haval más recientes con motores 2.0T, la disponibilidad de repuestos OEM es más limitada que para la Wingle — consulta antes de necesitarlos.",
      },
    ],
    faq: [
      {
        pregunta: "¿Son difíciles de conseguir los repuestos para Haval en Ecuador?",
        respuesta:
          "Los modelos Haval más recientes (Jolion, H6 de última generación) tienen menos disponibilidad que los modelos más establecidos como la Wingle 5. Consulta disponibilidad con anticipación.",
      },
      {
        pregunta: "¿La Wingle 5 y la Wingle 7 usan los mismos repuestos?",
        respuesta:
          "No en todos los casos. El motor cambió entre generaciones. Confirma el año y código de motor al cotizar.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver catálogo de Great Wall", href: "/catalogo/marca/great-wall" },
      { nombre: "Sistema de enfriamiento", href: "/catalogo?categoria=enfriamiento" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo saber si la bomba de agua está dañada?", href: "/guias/problemas/como-saber-si-la-bomba-de-agua-esta-danada" },
      { titulo: "¿Cómo identificar si los amortiguadores están gastados?", href: "/guias/problemas/como-identificar-amortiguadores-gastados" },
    ],
    ctaWhatsApp: "Cotizar repuesto Great Wall / Haval — modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-byd-ecuador",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos BYD en Ecuador?",
    descripcion:
      "Repuestos para BYD Song Plus, Atto 3, Dolphin, Seal y más en Ecuador. Originales y OEM desde Quito con envíos nacionales.",
    respuesta_corta:
      "En El Chino Americano tenemos repuestos para BYD en Ecuador: Song Plus, Atto 3, Dolphin, Seal y los modelos híbridos enchufables DM-i. Manejamos piezas para frenos, suspensión, dirección, carrocería y los sistemas convencionales de los híbridos. Operamos desde Quito con despacho a todo el Ecuador en 24 a 72 horas y guía rastreable. Una precisión importante: los modelos eléctricos puros, como el Dolphin y el Atto 3, tienen sistemas de alta tensión —batería de tracción, inversor y cableado naranja— que solo debe intervenir personal certificado con herramienta aislada; para esos componentes te orientamos sobre el canal correcto en lugar de venderte la pieza. En frenos, suspensión y carrocería la disponibilidad es comparable a la de otras marcas chinas. Al cotizar confirma modelo, año y versión.",
    keywords: [
      "repuestos BYD Ecuador",
      "repuestos BYD Song Plus Ecuador",
      "repuestos BYD Atto 3 Ecuador",
      "repuestos eléctrico BYD Ecuador",
    ],
    contenido: [
      {
        tipo: "h2",
        texto: "Modelos BYD con repuestos disponibles",
      },
      {
        tipo: "ul",
        items: [
          "BYD Song Plus (2021–presente) — híbrido enchufable DMI",
          "BYD Atto 3 / Yuan Plus (2022–presente) — eléctrico",
          "BYD Dolphin (2022–presente) — eléctrico",
          "BYD Seal (2023–presente) — eléctrico",
          "BYD Han (2022–presente) — eléctrico",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué repuestos BYD están disponibles?",
      },
      {
        tipo: "ul",
        items: [
          "Frenos: pastillas y discos (los BYD usan frenos convencionales).",
          "Suspensión: amortiguadores, rótulas, bujes.",
          "Carrocería: faros, luces, espejos.",
          "Filtros: habitáculo y aire (para modelos híbridos con motor de combustión).",
          "Sistema de enfriamiento del motor de combustión (modelos DMI).",
        ],
      },
      {
        tipo: "h2",
        texto: "Consideraciones para vehículos eléctricos BYD",
      },
      {
        tipo: "p",
        texto:
          "Los sistemas de alta tensión (baterías, inversores, motores eléctricos) de los BYD puros requieren técnicos certificados y herramientas especializadas. Para estos sistemas, te orientamos sobre el servicio técnico adecuado. Los sistemas mecánicos convencionales (frenos, suspensión, carrocería) los manejamos directamente.",
      },
      {
        tipo: "aviso",
        texto:
          "Nunca intervengas los sistemas de alta tensión de un vehículo eléctrico sin la certificación adecuada. Las baterías de los BYD operan a 400–800V.",
      },
    ],
    faq: [
      {
        pregunta: "¿Los frenos del BYD Song Plus son los mismos que otros autos chinos?",
        respuesta:
          "Son de especificación específica para el modelo, pero son frenos de disco convencionales. Pastillas y discos BYD Song Plus tienen disponibilidad en el mercado OEM.",
      },
      {
        pregunta: "¿Qué hacer si mi BYD eléctrico tiene un problema en la batería?",
        respuesta:
          "Contacta al concesionario oficial o a un taller certificado en vehículos eléctricos. Las baterías de alta tensión no deben ser intervenidas sin equipo especializado.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver catálogo de BYD", href: "/catalogo/marca/byd" },
      { nombre: "Frenos en el catálogo", href: "/catalogo?categoria=frenos" },
    ],
    guiasRelacionadas: [
      { titulo: "Frenos que chirrían — ¿pastillas o discos?", href: "/guias/problemas/frenos-chirrían-pastillas-o-discos" },
    ],
    ctaWhatsApp: "Cotizar repuesto BYD — modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-mg-ecuador",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos MG en Ecuador?",
    descripcion:
      "Repuestos para MG ZS, MG HS, MG RX5 y más en Ecuador. Originales y OEM desde Quito con envíos a todo el país.",
    respuesta_corta:
      "En El Chino Americano tenemos repuestos para MG en Ecuador: ZS, HS, RX5 y MG 5. Manejamos piezas originales, OEM y alternas para motor, frenos, suspensión y carrocería. Operamos desde Quito con despacho a todo el Ecuador en 24 a 72 horas y guía rastreable. MG pertenece al grupo SAIC Motor desde 2007 y comparte plataformas y proveedores con otros modelos del grupo, lo que amplía la oferta de repuestos OEM equivalentes a un precio menor que el original. El modelo con mayor circulación en Ecuador es el MG ZS con motor 1.5L atmosférico, que tiene buena disponibilidad en los sistemas principales; las versiones turbo y los modelos más recientes pueden requerir pedido. Al cotizar envía modelo, año y código de motor, o el VIN del vehículo.",
    keywords: [
      "repuestos MG Ecuador",
      "repuestos MG ZS Ecuador",
      "repuestos MG HS Ecuador",
      "donde comprar repuestos MG Quito",
    ],
    contenido: [
      {
        tipo: "h2",
        texto: "Modelos MG con repuestos disponibles",
      },
      {
        tipo: "ul",
        items: [
          "MG ZS (2018–presente) — SUV compacto, el más vendido en Ecuador",
          "MG HS (2019–presente) — SUV mediano",
          "MG RX5 (2016–2020)",
          "MG 5 (2020–presente) — sedán",
          "MG ZS EV (2021–presente) — eléctrico",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué repuestos MG están disponibles?",
      },
      {
        tipo: "ul",
        items: [
          "Motor: filtros, bombas de agua, correas, sensores.",
          "Frenos: pastillas y discos delanteros y traseros.",
          "Suspensión: amortiguadores, rótulas, terminales, bujes.",
          "Sistema de enfriamiento: termostatos, mangueras.",
          "Carrocería: faros, luces traseras, espejos.",
          "Filtros: aceite, aire, habitáculo.",
        ],
      },
      {
        tipo: "h2",
        texto: "Original vs OEM para MG",
      },
      {
        tipo: "p",
        texto:
          "MG usa proveedores reconocidos del grupo SAIC. Los repuestos OEM compatibles están disponibles en el mercado. Para el ZS en particular, hay buena disponibilidad de pastillas, discos y filtros de calidad.",
      },
    ],
    faq: [
      {
        pregunta: "¿Son difíciles de conseguir los repuestos para MG ZS en Ecuador?",
        respuesta:
          "Para los sistemas principales (frenos, filtros, suspensión), la disponibilidad es buena. Para componentes más específicos puede tomar más tiempo. Consulta antes.",
      },
      {
        pregunta: "¿Tienen repuestos para el MG ZS EV (eléctrico)?",
        respuesta:
          "Para los sistemas convencionales del MG ZS EV (frenos, suspensión, carrocería), sí. Para los sistemas de alta tensión (batería, motor eléctrico), se requiere servicio técnico especializado.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver catálogo de MG", href: "/catalogo/marca/mg" },
      { nombre: "Suspensión y dirección", href: "/catalogo?categoria=suspension" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo identificar si los amortiguadores están gastados?", href: "/guias/problemas/como-identificar-amortiguadores-gastados" },
    ],
    ctaWhatsApp: "Cotizar repuesto MG — modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-dfsk-ecuador",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos DFSK en Ecuador?",
    descripcion:
      "Repuestos para DFSK Glory 580, Glory 500, C35 y más en Ecuador. Originales y OEM desde Quito con envíos nacionales.",
    respuesta_corta:
      "En El Chino Americano tenemos repuestos para DFSK en Ecuador: Glory 580, Glory 500, C35 y Supercab. Manejamos piezas OEM y alternas para motor, frenos, suspensión y carrocería. Operamos desde Quito con despacho a todo el Ecuador en 24 a 72 horas y guía rastreable. DFSK (Dongfeng Sokon) tiene presencia en el país sobre todo con la línea Glory de SUV y con los modelos de carga usados por comerciantes y pequeñas flotas. Los repuestos de los modelos de mayor rotación tienen disponibilidad razonable; en los modelos de carga y en referencias específicas conviene consultar con anticipación, porque suelen traerse bajo pedido. Al cotizar envía modelo exacto, año y código de motor, o el número de parte de la pieza usada.",
    keywords: [
      "repuestos DFSK Ecuador",
      "repuestos DFSK Glory Ecuador",
      "repuestos DFSK Glory 580 Ecuador",
      "donde comprar repuestos DFSK Quito",
    ],
    contenido: [
      {
        tipo: "h2",
        texto: "Modelos DFSK con repuestos disponibles",
      },
      {
        tipo: "ul",
        items: [
          "DFSK Glory 580 (2019–presente) — SUV familiar",
          "DFSK Glory 500 (2018–2021) — SUV compacto",
          "DFSK C35 (2015–2020) — furgoneta",
          "DFSK Supercab (camioneta de carga)",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué repuestos DFSK están disponibles?",
      },
      {
        tipo: "ul",
        items: [
          "Motor: filtros de aceite y aire, bujías, sensores básicos.",
          "Frenos: pastillas y discos para los modelos Glory.",
          "Suspensión: amortiguadores, bujes.",
          "Carrocería: faros, luces, espejos.",
          "Filtros: aceite, aire, habitáculo.",
        ],
      },
      {
        tipo: "h2",
        texto: "Consideraciones para DFSK",
      },
      {
        tipo: "p",
        texto:
          "DFSK comparte plataformas con Dongfeng, lo que facilita encontrar algunos repuestos en el mercado OEM. Sin embargo, la disponibilidad es menor que para marcas como Chery o JAC. Para repuestos específicos de motor o transmisión, el tiempo de búsqueda puede ser mayor — planifica con anticipación.",
      },
    ],
    faq: [
      {
        pregunta: "¿Son difíciles de conseguir repuestos para DFSK Glory 580 en Ecuador?",
        respuesta:
          "Para los sistemas principales (frenos, filtros, carrocería básica), la disponibilidad es aceptable. Para repuestos de motor más específicos puede ser más difícil. Consulta antes de necesitarlos.",
      },
      {
        pregunta: "¿El DFSK usa los mismos repuestos que Dongfeng?",
        respuesta:
          "En algunos componentes sí, ya que comparten plataformas. Pero no todos los repuestos son intercambiables — siempre confirma el modelo y año.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver catálogo de DFSK", href: "/catalogo/marca/dfsk" },
      { nombre: "Filtros en el catálogo", href: "/catalogo?categoria=filtros" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo saber si la bomba de agua está dañada?", href: "/guias/problemas/como-saber-si-la-bomba-de-agua-esta-danada" },
    ],
    ctaWhatsApp: "Cotizar repuesto DFSK — modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-ford-quito",
    categoria: "marcas",
    titulo: "¿Dónde comprar repuestos Ford en Quito?",
    descripcion:
      "Dónde conseguir repuestos Ford en Quito: sectores donde se concentran los almacenes, cómo cotizar sin desplazarte y qué verificar antes de comprar. Ranger, F-150, Explorer, EcoSport y Escape.",
    respuesta_corta:
      "En Quito hay tres canales para comprar repuestos Ford: el concesionario oficial de la marca, los almacenes independientes concentrados en la Av. 10 de Agosto y en el norte de la ciudad, y las tiendas en línea con despacho a domicilio. En El Chino Americano manejamos originales de marca Motorcraft, OEM y alternos para Ranger, F-150, Explorer, EcoSport, Escape y Bronco Sport. Somos un almacén independiente, no el concesionario oficial. Cotizamos por WhatsApp: verificamos la compatibilidad con tu año y versión de motor, te enviamos el número de parte y una foto real de la pieza antes del pago, y entregamos en Quito norte, centro, sur y los valles, o despachamos al resto del Ecuador en 24 a 72 horas con guía rastreable.",
    keywords: [
      "repuestos ford quito",
      "autopartes ford quito",
      "repuestos ford quito norte",
      "repuestos ford quito sur",
      "repuestos ford 10 de agosto quito",
      "ford repuestos quito ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Quito concentra la mayor oferta de repuestos Ford del país. La dificultad no es encontrar dónde comprar, sino asegurarte de que la pieza corresponde exactamente a tu versión: Ford vende varios modelos con el mismo nombre y motores muy distintos entre años.",
      },
      {
        tipo: "h2",
        texto: "Dónde se concentran los almacenes de repuestos Ford en Quito",
      },
      {
        tipo: "ul",
        items: [
          "Av. 10 de Agosto: la zona tradicional de autopartes de Quito, con la mayor densidad de almacenes.",
          "Quito norte (sector El Inca, Amazonas y alrededores): almacenes y talleres especializados.",
          "Quito sur: oferta orientada a pickups y vehículos de trabajo.",
          "Concesionario oficial de la marca: para piezas que requieren programación o campañas de servicio.",
          "Tiendas en línea con despacho a domicilio en Quito y provincias.",
        ],
      },
      {
        tipo: "h2",
        texto: "Modelos Ford con mejor disponibilidad en Quito",
      },
      {
        tipo: "ul",
        items: [
          "Ford Ranger — el modelo de mayor rotación; confirma si es 2.5 gasolina, 2.2 o 3.2 diésel, o 2.3 EcoBoost.",
          "Ford F-150 — motores V6 y V8 con repuestos distintos entre generaciones.",
          "Ford Explorer — disponibilidad buena en piezas de motor, suspensión y frenos.",
          "Ford EcoSport — alta circulación en Quito, muy buena oferta de OEM y alterno.",
          "Ford Escape y Bronco Sport — disponibilidad creciente.",
        ],
      },
      {
        tipo: "h2",
        texto: "Qué verificar antes de comprar un repuesto Ford",
      },
      {
        tipo: "ol",
        items: [
          "Año exacto del vehículo, no solo el modelo: Ranger 2015 y Ranger 2019 no comparten varias piezas.",
          "Versión de motor: diésel o gasolina, cilindrada y si es turbo.",
          "Tracción: 4x2 o 4x4 cambia piezas de suspensión y transmisión.",
          "VIN del vehículo, que resuelve cualquier duda de versión de fábrica.",
          "Número de parte de la pieza usada, si puedes verlo.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "En Ford, la marca original es Motorcraft. Existe además una oferta OEM muy sólida de Bosch, Denso, Motorcraft, Monroe, Gates y TRW: misma calidad de fábrica a menor precio. Pide siempre las dos opciones al cotizar.",
      },
      {
        tipo: "h2",
        texto: "Comprar sin recorrer almacenes",
      },
      {
        tipo: "p",
        texto:
          "Recorrer la 10 de Agosto preguntando por una pieza cuesta medio día y no garantiza que la que te vendan corresponda a tu versión. Cotizando por WhatsApp verificamos la aplicación con tu año y motor, te enviamos el número de parte y la foto de la pieza, y coordinamos la entrega en Quito o el envío a tu ciudad. Toda la conversación queda registrada, lo que te sirve como respaldo de lo acordado.",
      },
      {
        tipo: "h2",
        texto: "Entrega en Quito y envíos al resto del país",
      },
      {
        tipo: "p",
        texto:
          "Coordinamos entrega en Quito norte, centro, sur y los valles, y despachamos a Guayaquil, Cuenca, Ambato, Loja, Manta, Esmeraldas, Santo Domingo de los Tsáchilas y el resto del Ecuador en 24 a 72 horas con guía rastreable.",
      },
    ],
    faq: [
      {
        pregunta: "¿Son ustedes el concesionario oficial Ford en Quito?",
        respuesta:
          "No. El Chino Americano es un almacén independiente especializado en repuestos para vehículos chinos y americanos. Manejamos repuestos originales, OEM y alternos para Ford, y siempre te indicamos cuál es cuál antes de la compra.",
      },
      {
        pregunta: "¿Tienen repuestos Ford en el sector de la 10 de Agosto?",
        respuesta:
          "Operamos desde Quito con cotización y coordinación por WhatsApp, y entregamos en toda la ciudad. No necesitas recorrer almacenes: te confirmamos disponibilidad, precio y número de parte antes de que te muevas.",
      },
      {
        pregunta: "¿Consiguen repuestos para Ford Ranger diésel?",
        respuesta:
          "Sí, es uno de los modelos que más manejamos. Confirma el año y el código de motor (2.2 o 3.2 diésel) para identificar la pieza correcta, porque cambian entre generaciones.",
      },
      {
        pregunta: "¿Cuánto demora un repuesto Ford si no está en stock?",
        respuesta:
          "Si la pieza está disponible, la despachamos en 24 a 72 horas. Si hay que traerla bajo pedido, te confirmamos el plazo real en la cotización antes de que decidas.",
      },
      {
        pregunta: "¿Los repuestos Ford tienen garantía?",
        respuesta:
          "La garantía aplica al recibir la pieza y por defecto de fábrica: que sea la correcta y llegue en buen estado. Una vez instalada deja de aplicar. Las eléctricas se envían probadas y no tienen garantía una vez conectadas. El detalle está en nuestra guía de garantía.",
      },
    ],
    productosRelacionados: [
      { nombre: "Repuestos para Ford", href: "/catalogo/marca/ford" },
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Contacto y ubicación", href: "/contacto" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Dónde comprar repuestos Ford en Ecuador?", href: "/guias/marcas/repuestos-ford-ecuador" },
      { titulo: "Problemas más comunes de los Ford en Ecuador", href: "/guias/problemas/problemas-comunes-ford-ecuador" },
      { titulo: "¿Concesionario o almacén independiente?", href: "/guias/compra/concesionario-o-almacen-independiente" },
      { titulo: "¿Es seguro comprar repuestos de auto por internet en Ecuador?", href: "/guias/compra/es-seguro-comprar-repuestos-por-internet-ecuador" },
    ],
    ctaWhatsApp: "Busco un repuesto Ford en Quito. Modelo, año y motor de mi vehículo:",
    fechaPublicacion: "2026-09-01",
  },
]

// ─── GUÍAS GENERALES DE COMPRA ───────────────────────────────────────────────

const guiasCompra: Guia[] = [
  {
    slug: "es-seguro-comprar-repuestos-por-internet-ecuador",
    categoria: "compra",
    titulo: "¿Es seguro comprar repuestos de auto por internet en Ecuador?",
    descripcion:
      "Sí, si verificas al vendedor. Cómo comprobar la compatibilidad antes de pagar, qué datos exigir, señales de alerta y cómo funciona la compra en El Chino Americano.",
    respuesta_corta:
      "Sí, comprar repuestos por internet en Ecuador es seguro cuando el vendedor confirma la compatibilidad antes del pago, te muestra el número de parte y una foto real de la pieza, declara si es original, OEM o alterno, y te entrega comprobante y guía de envío rastreable. El riesgo no está en el canal online sino en comprar sin verificar: la falla más frecuente no es el fraude, es recibir una pieza que no encaja porque nadie confirmó el año ni la versión de motor. En El Chino Americano validamos la aplicación del repuesto con los datos de tu vehículo antes de despachar, enviamos foto y número de parte en la cotización, y despachamos desde Quito a todo el Ecuador en 24 a 72 horas con seguimiento. Si un vendedor evita darte estos datos, no compres.",
    keywords: [
      "es seguro comprar repuestos por internet en Ecuador",
      "comprar repuestos online Ecuador confiable",
      "tiendas online confiables repuestos Ecuador",
      "comprar autopartes por internet Ecuador",
      "estafas repuestos online Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "La desconfianza al comprar repuestos por internet es razonable: es una pieza que no puedes tocar, para un auto que necesitas de vuelta pronto, y si llega mal el problema es tuyo. Pero el riesgo real no depende del canal, sino de cuánta verificación hace el vendedor antes de cobrarte.",
      },
      {
        tipo: "h2",
        texto: "¿Qué puede salir mal al comprar un repuesto online?",
      },
      {
        tipo: "ul",
        items: [
          "Pieza incompatible: el error más frecuente. El modelo coincide, pero el año o la versión de motor no.",
          "Repuesto no original vendido como original, sin que el anuncio lo aclare.",
          "Fotos genéricas de catálogo que no corresponden a la pieza que realmente te envían.",
          "Vendedor que cobra por adelantado y luego deja de responder.",
          "Envío sin guía ni seguimiento, imposible de reclamar.",
          "Sin comprobante de compra, no hay forma de hacer valer una garantía.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cómo verificar que un vendedor de repuestos es confiable",
      },
      {
        tipo: "p",
        texto:
          "Antes de transferir, pide estas seis cosas. Un vendedor serio te las da sin problema; uno que las evita es una señal clara.",
      },
      {
        tipo: "ol",
        items: [
          "Que confirme la compatibilidad con tu año, modelo y versión de motor — no solo con el nombre del modelo.",
          "El número de parte exacto de la pieza que te va a enviar.",
          "Una foto real de la pieza en stock, no una imagen de catálogo.",
          "Si es original, OEM o alterno, dicho de forma explícita.",
          "Ubicación física verificable y un canal de contacto estable (WhatsApp de empresa, dirección, mapa).",
          "Comprobante de compra y guía de envío rastreable.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "Señales de alerta: precio muy por debajo del mercado, presión para pagar de inmediato, negativa a dar el número de parte, cuenta bancaria a nombre de un tercero sin relación con el negocio, o un vendedor que responde 'sí sirve' sin preguntarte el año del vehículo.",
      },
      {
        tipo: "h2",
        texto: "Cómo funciona la compra en El Chino Americano",
      },
      {
        tipo: "ol",
        items: [
          "Nos escribes por WhatsApp con marca, modelo, año y el repuesto que buscas. Si tienes el número de parte o el VIN, mejor.",
          "Verificamos la aplicación del repuesto para tu vehículo antes de cotizar.",
          "Te enviamos la cotización con foto de la pieza, número de parte y si es original, OEM o alterno.",
          "Confirmas y acordamos el medio de pago y la dirección de entrega.",
          "Despachamos con guía de envío rastreable a todo el Ecuador, entre 24 y 72 horas según la ciudad.",
          "Te acompañamos por el mismo chat de WhatsApp hasta que la pieza esté montada y funcionando.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Es más seguro comprar en una tienda física?",
      },
      {
        tipo: "p",
        texto:
          "No necesariamente. En mostrador puedes ver la pieza, pero rara vez alguien valida el número de parte contra tu vehículo, y muchas ventas se hacen 'de memoria' por el nombre del modelo. Comprar online con un asesor que verifica compatibilidad por escrito deja evidencia de lo que se acordó: el chat, la foto y el número de parte quedan registrados. Esa conversación es tu mejor respaldo si algo no coincide.",
      },
      {
        tipo: "h2",
        texto: "Buenas prácticas de pago",
      },
      {
        tipo: "ul",
        items: [
          "Paga a una cuenta a nombre del negocio, no de una persona sin relación con la empresa.",
          "Guarda el comprobante de transferencia y el chat completo de la cotización.",
          "Pide siempre un documento de venta con el detalle del repuesto y el número de parte.",
          "Desconfía de quien exige pago total anticipado sin darte antes ninguna verificación.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Qué pasa si el repuesto que recibo no es el correcto?",
        respuesta:
          "Escríbenos por el mismo chat de WhatsApp con fotos de la pieza recibida y del número de parte. Como validamos la compatibilidad antes de despachar, la mayoría de los casos se resuelven identificando la variante correcta y coordinando el cambio.",
      },
      {
        pregunta: "¿Cómo sé que la tienda existe de verdad?",
        respuesta:
          "El Chino Americano opera desde Quito, Ecuador, con dirección física verificable en Google Maps, catálogo público en línea y atención por WhatsApp en horario comercial. Puedes revisar el catálogo, la página de contacto y la ubicación antes de escribir.",
      },
      {
        pregunta: "¿Puedo pagar contra entrega?",
        respuesta:
          "Las condiciones de pago y envío se acuerdan por WhatsApp según la ciudad de destino y el tipo de repuesto. Escríbenos y te indicamos las opciones disponibles para tu caso.",
      },
      {
        pregunta: "¿Los repuestos tienen garantía?",
        respuesta:
          "La garantía aplica al inicio y por defecto de fábrica: verificas al recibir que sea la pieza correcta y que no venga fisurada ni dañada. Una vez instalada deja de aplicar. Las eléctricas se envían probadas y no tienen garantía una vez conectadas. Te lo informamos siempre antes de la compra.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Contacto y ubicación", href: "/contacto" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo verificar que un repuesto es original y no falsificado?", href: "/guias/compra/como-verificar-que-un-repuesto-es-original" },
      { titulo: "Garantía de repuestos: qué cubre y qué no", href: "/guias/compra/garantia-y-devoluciones-de-repuestos" },
      { titulo: "¿Cómo identificar el repuesto correcto para mi auto?", href: "/guias/compra/como-identificar-el-repuesto-correcto" },
    ],
    ctaWhatsApp: "Quiero verificar la compatibilidad de un repuesto antes de comprar:",
    fechaPublicacion: "2026-09-01",
  },

  {
    slug: "repuestos-autos-chinos-ecuador",
    categoria: "compra",
    titulo: "¿Dónde comprar repuestos para autos chinos en Ecuador?",
    descripcion:
      "Guía completa para comprar repuestos de vehículos chinos (Chery, JAC, BYD, Great Wall, MG, DFSK) en Ecuador. Originales, OEM y alternos con envíos desde Quito.",
    respuesta_corta:
      "En El Chino Americano compras repuestos para las principales marcas chinas en Ecuador: Chery, JAC, BYD, Great Wall (Haval), MG y DFSK. Tenemos piezas originales, OEM y alternas para motor, frenos, suspensión, sistema de enfriamiento, filtros y carrocería. Operamos desde Quito y despachamos a Guayaquil, Cuenca, Ambato, Loja, Manta, Esmeraldas, Santo Domingo de los Tsáchilas y el resto del país en 24 a 72 horas con guía rastreable. El punto crítico en marcas chinas es la identificación: varios modelos cambiaron de plataforma manteniendo el mismo nombre comercial, así que el nombre del modelo por sí solo no basta. Cotiza por WhatsApp con modelo exacto, año y código de motor; si no tienes el número de parte, con el VIN o una foto de la pieza usada lo identificamos.",
    keywords: [
      "repuestos autos chinos Ecuador",
      "repuestos vehículos chinos Quito",
      "repuestos Chery JAC BYD Ecuador",
      "donde comprar repuestos chinos Ecuador",
      "repuestos marcas chinas Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Los vehículos chinos representan una parte importante del parque automotor ecuatoriano. Chery, JAC, BYD, Great Wall, MG y DFSK tienen una presencia creciente, y la disponibilidad de repuestos ha mejorado significativamente en los últimos años.",
      },
      {
        tipo: "h2",
        texto: "Marcas chinas con repuestos disponibles en Ecuador",
      },
      {
        tipo: "ul",
        items: [
          "Chery — Tiggo 5, Tiggo 7, Tiggo 8, Arrizo 5, QQ",
          "JAC — T8, T6, S3, S4, J7",
          "BYD — Song Plus, Atto 3, Dolphin, Seal",
          "Great Wall / Haval — Wingle 5, Wingle 7, H2, H6, Jolion",
          "MG — ZS, HS, RX5, MG 5",
          "DFSK — Glory 580, Glory 500, C35",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué tipo de repuesto necesitas?",
      },
      {
        tipo: "p",
        texto:
          "Para vehículos chinos en Ecuador, los repuestos se clasifican en tres categorías: originales (fabricados o certificados por la marca), OEM (mismo fabricante que el original, sin el sello de la marca) y alternos (fabricados por terceros con especificaciones similares). Los OEM suelen ser la mejor relación calidad-precio.",
      },
      {
        tipo: "h2",
        texto: "¿Por qué es difícil a veces conseguir repuestos chinos?",
      },
      {
        tipo: "p",
        texto:
          "Los vehículos chinos tienen motores y plataformas que cambian entre generaciones, a veces con el mismo nombre de modelo. El Chery Tiggo 5, por ejemplo, tuvo tres plataformas distintas. El número de parte o el código de motor son la forma más segura de identificar el repuesto correcto.",
      },
      {
        tipo: "h2",
        texto: "¿Cómo cotizar un repuesto para tu auto chino?",
      },
      {
        tipo: "ol",
        items: [
          "Identifica la marca, modelo exacto y año del vehículo.",
          "Busca el código de motor en la placa del vehículo o en el manual.",
          "Si tienes el repuesto viejo, busca el número de parte impreso.",
          "Escríbenos por WhatsApp — respondemos en menos de 24 horas en horario hábil.",
        ],
      },
      {
        tipo: "h2",
        texto: "Envíos a todo el Ecuador desde Quito",
      },
      {
        tipo: "p",
        texto:
          "Coordinamos envíos a Quito, Guayaquil, Cuenca, Ambato, Loja, Manta, Esmeraldas, Santo Domingo de los Tsáchilas y todo el país en 24 a 72 horas.",
      },
    ],
    faq: [
      {
        pregunta: "¿Los repuestos para autos chinos son buenos?",
        respuesta:
          "Depende del fabricante. Los repuestos OEM de marcas reconocidas son de buena calidad. Los alternos de origen desconocido pueden fallar antes. En El Chino Americano trabajamos con proveedores verificados.",
      },
      {
        pregunta: "¿Puedo comprar repuestos chinos online y recibirlos en cualquier ciudad de Ecuador?",
        respuesta:
          "Sí. Cotizamos por WhatsApp y coordinamos el envío a tu ciudad. El plazo es de 24 a 72 horas según la distancia desde Quito.",
      },
      {
        pregunta: "¿Qué marca china tiene mejor disponibilidad de repuestos en Ecuador?",
        respuesta:
          "Chery tiene la mejor disponibilidad por ser la marca china más vendida históricamente. JAC y BYD le siguen. Para marcas más recientes como MG y DFSK, algunos repuestos específicos pueden tomar más tiempo.",
      },
    ],
    productosRelacionados: [
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
      { nombre: "Repuestos para JAC", href: "/catalogo/marca/jac" },
      { nombre: "Repuestos para BYD", href: "/catalogo/marca/byd" },
      { nombre: "Repuestos para Great Wall", href: "/catalogo/marca/great-wall" },
      { nombre: "Todo el catálogo", href: "/catalogo" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Dónde comprar repuestos Chery en Ecuador?", href: "/guias/marcas/repuestos-chery-ecuador" },
      { titulo: "¿Dónde comprar repuestos JAC en Ecuador?", href: "/guias/marcas/repuestos-jac-ecuador" },
      { titulo: "¿Dónde comprar repuestos BYD en Ecuador?", href: "/guias/marcas/repuestos-byd-ecuador" },
      { titulo: "¿Cómo saber si la bomba de agua está dañada?", href: "/guias/problemas/como-saber-si-la-bomba-de-agua-esta-danada" },
    ],
    ctaWhatsApp: "Cotizar repuesto para mi auto chino — marca, modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "repuestos-autos-americanos-ecuador",
    categoria: "compra",
    titulo: "¿Dónde comprar repuestos para autos americanos en Ecuador?",
    descripcion:
      "Guía para comprar repuestos Ford, Chevrolet, Dodge, Jeep y Ram en Ecuador. Originales, OEM y alternos con envíos desde Quito a todo el país.",
    respuesta_corta:
      "En El Chino Americano compras repuestos para las principales marcas americanas en Ecuador: Ford (Ranger, F-150, Explorer, EcoSport), Chevrolet (D-MAX, Colorado, Blazer, Silverado), Dodge, Jeep y Ram. Tenemos piezas originales —Motorcraft en Ford y AC Delco en Chevrolet—, OEM y alternas para motor, frenos, suspensión y carrocería. Operamos desde Quito con despacho a todo el Ecuador en 24 a 72 horas y guía rastreable. Al cotizar, el dato que más errores evita es el tipo de motor: confirma el año, si es diésel o gasolina y el código de motor, sobre todo en la D-MAX (2.5L y 3.0L diésel, códigos 4JK1 y 4JJ1) y en el Ranger, que convive con versiones 2.5 a gasolina, 2.2 y 3.2 diésel y 2.3 EcoBoost. Con el VIN confirmamos la versión exacta.",
    keywords: [
      "repuestos autos americanos Ecuador",
      "repuestos Ford Chevrolet Ecuador",
      "repuestos vehículos americanos Quito",
      "donde comprar repuestos americanos Ecuador",
      "repuestos pickup americana Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Los vehículos de origen americano (Ford, Chevrolet, Dodge, Jeep, Ram) tienen alta presencia en Ecuador, especialmente en el segmento de pickups y SUVs. La disponibilidad de repuestos OEM es generalmente buena dada la popularidad de estos modelos.",
      },
      {
        tipo: "h2",
        texto: "Marcas americanas con repuestos disponibles en Ecuador",
      },
      {
        tipo: "ul",
        items: [
          "Ford — Ranger, F-150, Explorer, Escape, EcoSport, Bronco Sport",
          "Chevrolet — D-MAX, Colorado, Blazer, Silverado, Captiva, Trailblazer",
          "Dodge — RAM 1500, Durango, Journey",
          "Jeep — Wrangler, Grand Cherokee, Cherokee, Compass",
          "Ram — 1500, 2500",
        ],
      },
      {
        tipo: "h2",
        texto: "Originales vs OEM para marcas americanas",
      },
      {
        tipo: "p",
        texto:
          "Los repuestos originales Ford vienen bajo la marca Motorcraft; los de Chevrolet bajo AC Delco. Los repuestos OEM de marcas como Bosch, Denso, Monroe y TRW ofrecen calidad equivalente a menor precio — son fabricados por los mismos proveedores de las plantas de ensamblaje.",
      },
      {
        tipo: "h2",
        texto: "Consideraciones al comprar repuestos americanos en Ecuador",
      },
      {
        tipo: "ul",
        items: [
          "Confirma si el motor es diésel o gasolina — los repuestos cambian completamente.",
          "Los modelos más vendidos (Ranger, D-MAX) tienen mejor disponibilidad que los menos comunes.",
          "El año del vehículo es crítico: plataformas cambian entre generaciones con el mismo nombre.",
          "Para pickups con alta kilometraje (D-MAX diésel), la disponibilidad de repuestos de motor es clave.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Cómo cotizar un repuesto para tu auto americano?",
      },
      {
        tipo: "ol",
        items: [
          "Ten a mano: marca, modelo, año y tipo de motor (diésel/gasolina, cilindrada).",
          "Si el vehículo es diésel, confirma el código de motor (ej. 4JK1, 4JJ1 para D-MAX).",
          "Si tienes el repuesto viejo, busca el número de parte impreso.",
          "Escríbenos por WhatsApp — respondemos en menos de 24 horas en horario hábil.",
        ],
      },
      {
        tipo: "h2",
        texto: "Envíos a todo el Ecuador desde Quito",
      },
      {
        tipo: "p",
        texto:
          "Coordinamos envíos a Quito, Guayaquil, Cuenca, Ambato, Manta, Loja y todo el Ecuador en 24 a 72 horas.",
      },
    ],
    faq: [
      {
        pregunta: "¿Consiguen repuestos para Ford Ranger y Chevrolet D-MAX en Ecuador?",
        respuesta:
          "Sí, son dos de los modelos que más manejamos. Para el Ranger confirma el año y versión de motor (2.5 gasolina vs 2.3 EcoBoost). Para la D-MAX confirma si es 2.5L o 3.0L diésel.",
      },
      {
        pregunta: "¿Los repuestos americanos son más caros que los chinos?",
        respuesta:
          "Generalmente sí, especialmente los originales. Sin embargo, los repuestos OEM de buena calidad para marcas americanas tienen precios competitivos. La mayor disponibilidad en el mercado también ayuda a mantener precios razonables.",
      },
      {
        pregunta: "¿Tienen repuestos para Jeep y Dodge en Ecuador?",
        respuesta:
          "Sí, aunque la disponibilidad es más limitada que para Ford y Chevrolet. Para modelos Jeep y Dodge, es mejor consultar disponibilidad antes de necesitar el repuesto.",
      },
    ],
    productosRelacionados: [
      { nombre: "Repuestos para Ford", href: "/catalogo/marca/ford" },
      { nombre: "Repuestos para Chevrolet", href: "/catalogo/marca/chevrolet" },
      { nombre: "Todo el catálogo", href: "/catalogo" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Dónde comprar repuestos Ford en Ecuador?", href: "/guias/marcas/repuestos-ford-ecuador" },
      { titulo: "¿Dónde comprar repuestos Chevrolet en Ecuador?", href: "/guias/marcas/repuestos-chevrolet-ecuador" },
      { titulo: "Frenos que chirrían — ¿pastillas o discos?", href: "/guias/problemas/frenos-chirrían-pastillas-o-discos" },
    ],
    ctaWhatsApp: "Cotizar repuesto para mi auto americano — marca, modelo y año:",
    fechaPublicacion: "2026-08-26",
  },

  {
    slug: "como-verificar-que-un-repuesto-es-original",
    categoria: "compra",
    titulo: "¿Cómo verificar que un repuesto es original y no falsificado?",
    descripcion:
      "Cómo comprobar la autenticidad de un repuesto automotriz: número de parte, empaque, holograma, acabados y precio. Guía para Ecuador con piezas chinas y americanas.",
    respuesta_corta:
      "Revisa cuatro cosas, en este orden. Primero, el número de parte: debe estar grabado o impreso en la pieza misma, no solo en la caja, y coincidir con el catálogo del fabricante y con la aplicación de tu vehículo. Es la prueba más confiable. Segundo, el empaque: logo nítido, código de barras legible, sin errores de ortografía, sin etiquetas pegadas sobre otras y, en marcas como Bosch, Denso, Motorcraft o AC Delco, con holograma o código verificable en el sitio oficial. Tercero, la pieza: acabados limpios, sin rebabas, peso consistente y soldaduras parejas, porque una copia suele usar menos material y se siente más liviana. Cuarto, el precio: un original a mitad del mercado es señal de alerta. Un OEM legítimo también cuesta menos, pero se declara como OEM en lugar de venderse como original.",
    keywords: [
      "cómo verificar la autenticidad de repuestos",
      "repuesto original o falso",
      "identificar repuestos falsificados Ecuador",
      "repuestos originales Ecuador cómo saber",
      "número de parte repuesto verificar",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "La preocupación por los repuestos falsificados es legítima, sobre todo en piezas de seguridad como frenos, suspensión y filtros. Una pieza falsificada no solo dura menos: puede fallar en el peor momento. Estos son los controles que puedes hacer tú mismo, en orden de confiabilidad.",
      },
      {
        tipo: "h2",
        texto: "1. El número de parte, la prueba más fuerte",
      },
      {
        tipo: "p",
        texto:
          "Toda pieza legítima lleva un número de parte grabado, estampado o impreso en la pieza misma, no únicamente en la caja. Ese número debe coincidir con el catálogo del fabricante y con la aplicación de tu vehículo. Si el número solo está en la etiqueta de la caja, o si la pieza tiene un número que no aparece en ningún catálogo, es una señal de alerta.",
      },
      {
        tipo: "h2",
        texto: "2. Revisa el empaque",
      },
      {
        tipo: "ul",
        items: [
          "Logo nítido, sin colores desviados ni bordes pixelados por reimpresión.",
          "Código de barras legible y etiqueta bien adherida, no pegada encima de otra.",
          "Ortografía correcta: los empaques falsificados suelen tener errores en el texto.",
          "Holograma o código de verificación en las marcas que lo usan (Bosch, Denso, Motorcraft, AC Delco y varias marcas OEM chinas).",
          "Caja sin señales de reempaque, cinta reabierta o piezas sueltas dentro.",
        ],
      },
      {
        tipo: "h2",
        texto: "3. Inspecciona la pieza",
      },
      {
        tipo: "ul",
        items: [
          "Acabados limpios: sin rebabas de fundición, sin bordes cortantes, sin pintura corrida.",
          "Peso consistente: una pieza falsificada suele usar menos material y se siente notablemente más liviana.",
          "Sellos y empaques de caucho flexibles y uniformes, no resecos ni con exceso de rebaba.",
          "Roscas y agujeros limpios y alineados.",
          "Soldaduras parejas en piezas metálicas como radiadores, soportes o bombas.",
        ],
      },
      {
        tipo: "h2",
        texto: "4. Evalúa el precio con criterio",
      },
      {
        tipo: "p",
        texto:
          "Un repuesto original a mitad de precio del mercado casi nunca es una oportunidad. Ahora bien, un precio menor no significa falsificación: un repuesto OEM legítimo cuesta menos que el original con logo de la marca porque lo fabrica el mismo proveedor sin el sello. La diferencia está en que el OEM se declara como OEM. El problema no es el precio bajo, es el precio bajo con etiqueta de original.",
      },
      {
        tipo: "aviso",
        texto:
          "En piezas de seguridad —pastillas y discos de freno, rótulas, terminales de dirección, amortiguadores, airbags— no arriesgues. Prefiere original u OEM de marca reconocida y exige el número de parte antes de comprar.",
      },
      {
        tipo: "h2",
        texto: "Cómo lo verificamos nosotros antes de enviarte la pieza",
      },
      {
        tipo: "ol",
        items: [
          "Cruzamos el número de parte con la aplicación de tu vehículo (marca, modelo, año y versión de motor).",
          "Confirmamos la procedencia del repuesto con el proveedor y si corresponde a original, OEM o alterno.",
          "Te enviamos foto real de la pieza y del número de parte en la cotización, antes de que pagues.",
          "Declaramos siempre el tipo de repuesto por escrito. No vendemos alterno como si fuera original.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Un repuesto OEM es falsificado?",
        respuesta:
          "No. OEM significa que lo fabrica el mismo proveedor que produce la pieza para la línea de montaje, pero se vende sin el logo de la automotriz. Es legítimo y suele ser la mejor relación calidad-precio. Falsificado es otra cosa: una copia que imita la marca sin autorización ni control de calidad.",
      },
      {
        pregunta: "¿Dónde encuentro el número de parte de mi repuesto?",
        respuesta:
          "Normalmente está grabado o impreso en la pieza usada que vas a reemplazar. Si no puedes desmontarla, con la marca, modelo, año y código de motor podemos identificarlo por catálogo.",
      },
      {
        pregunta: "¿Puedo verificar el holograma de una marca por internet?",
        respuesta:
          "Varias marcas —Bosch, Denso y algunos fabricantes OEM chinos— tienen portales o líneas de verificación de códigos de seguridad. Si tu pieza trae un código raspable, vale la pena validarlo en el sitio oficial de la marca.",
      },
      {
        pregunta: "¿Ustedes venden repuestos originales en Ecuador?",
        respuesta:
          "Sí. Manejamos originales, OEM y alternos, y siempre te decimos cuál es cuál antes de la compra para que elijas con la información completa.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Repuestos para Ford", href: "/catalogo/marca/ford" },
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Es seguro comprar repuestos de auto por internet en Ecuador?", href: "/guias/compra/es-seguro-comprar-repuestos-por-internet-ecuador" },
      { titulo: "Original, OEM o alterno: ¿cuál conviene?", href: "/guias/compra/original-oem-o-alterno-cual-elegir" },
    ],
    ctaWhatsApp: "Quiero confirmar el número de parte y la procedencia de un repuesto:",
    fechaPublicacion: "2026-09-01",
  },

  {
    slug: "original-oem-o-alterno-cual-elegir",
    categoria: "compra",
    titulo: "Original, OEM o alterno: ¿cuál repuesto conviene comprar?",
    descripcion:
      "Diferencias reales entre repuesto original, OEM y alterno, con recomendación por tipo de pieza: frenos, suspensión, motor, filtros y carrocería. Guía para Ecuador.",
    respuesta_corta:
      "El original lleva el logo de la automotriz —Motorcraft en Ford, AC Delco en Chevrolet— y es el más caro. El OEM lo fabrica el mismo proveedor que abastece a la línea de montaje (Bosch, Denso, Valeo, NGK, Monroe, TRW, Sachs, Gates) pero se vende sin ese logo: calidad equivalente a un precio sensiblemente menor, y es la opción más inteligente para la mayoría de compras. El alterno lo produce un tercero con especificaciones similares y su calidad depende del fabricante, por lo que la marca importa más que la etiqueta. Regla práctica por tipo de pieza: en frenos, dirección, suspensión, distribución y electrónica elige original u OEM; en filtros, mangueras, correas de accesorios y carrocería, un alterno de marca reconocida rinde bien y te ahorra dinero.",
    keywords: [
      "original OEM o alterno cuál elegir",
      "diferencia repuesto original y OEM",
      "repuestos aftermarket Ecuador",
      "OEM vs alterno repuestos",
      "qué repuesto comprar Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Casi toda cotización de repuestos en Ecuador te va a dar estas tres opciones. La diferencia de precio entre ellas puede ser grande, y elegir bien depende menos del presupuesto que del tipo de pieza que vas a cambiar.",
      },
      {
        tipo: "h2",
        texto: "Qué significa cada uno",
      },
      {
        tipo: "h3",
        texto: "Original (genuino)",
      },
      {
        tipo: "p",
        texto:
          "Pieza vendida bajo la marca de la automotriz, en su empaque oficial: Motorcraft para Ford, AC Delco para Chevrolet, o el empaque de marca en el caso de Chery, JAC, BYD, Great Wall y MG. Es la referencia de calidad y la más cara. Tiene sentido cuando la pieza es crítica, cuando el vehículo está en garantía de fábrica, o cuando no existe una alternativa OEM confiable.",
      },
      {
        tipo: "h3",
        texto: "OEM",
      },
      {
        tipo: "p",
        texto:
          "Misma pieza, mismo fabricante, sin el logo de la automotriz. Empresas como Bosch, Denso, Valeo, NGK, Monroe, TRW, Sachs o Gates producen para las plantas de ensamblaje y también venden bajo su propia marca. Para la mayoría de los casos es la opción más inteligente: calidad equivalente a un precio sensiblemente menor.",
      },
      {
        tipo: "h3",
        texto: "Alterno",
      },
      {
        tipo: "p",
        texto:
          "También llamado alternativo o, en catálogos internacionales, aftermarket. Lo fabrica un tercero con especificaciones similares. El rango de calidad es enorme: hay alternos excelentes y alternos que duran meses. Aquí la marca del fabricante importa más que la etiqueta 'alterno'. Es la opción de menor costo y funciona bien en piezas de desgaste donde una falla no compromete la seguridad.",
      },
      {
        tipo: "h2",
        texto: "Qué elegir según la pieza",
      },
      {
        tipo: "ul",
        items: [
          "Frenos (pastillas, discos, mordazas): original u OEM. Es la pieza que decide si frenas a tiempo.",
          "Dirección y suspensión (rótulas, terminales, amortiguadores, bujes): OEM. Un alterno barato se desajusta rápido y desgasta llantas.",
          "Sensores y electrónica (sensores de oxígeno, MAF, bobinas, ECU): original u OEM. Los alternos suelen dar lecturas fuera de rango y encender el check engine.",
          "Distribución (correa, kit, tensor, bomba de agua): OEM de marca reconocida. Una falla aquí destruye el motor.",
          "Filtros (aire, aceite, combustible, cabina): alterno u OEM de marca conocida rinde perfectamente.",
          "Correas de accesorios, mangueras, terminales de escape: alterno de marca reconocida.",
          "Carrocería (faros, parachoques, guardafangos, espejos): alterno es la opción habitual y sensata.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "Cuidado con el falso ahorro: un alterno de baja calidad en frenos o suspensión suele durar menos de la mitad, y pagas dos veces la mano de obra. En piezas que requieren desarmar el motor, el ahorro inicial casi nunca compensa.",
      },
      {
        tipo: "h2",
        texto: "El caso particular de los autos chinos",
      },
      {
        tipo: "p",
        texto:
          "En marcas como Chery, JAC, BYD, Great Wall, MG y DFSK, muchas piezas originales son fabricadas por proveedores globales conocidos. Eso significa que existe una versión OEM de la misma pieza a mejor precio. También significa lo contrario: hay mucho alterno genérico de origen no verificable. Por eso el número de parte y el proveedor pesan más que la etiqueta del empaque.",
      },
      {
        tipo: "h2",
        texto: "Cómo pedir la comparación al cotizar",
      },
      {
        tipo: "ol",
        items: [
          "Pide las tres opciones con precio y marca del fabricante, no solo 'original o alterno'.",
          "Pregunta el número de parte de cada opción.",
          "Confirma si la pieza tiene garantía: las eléctricas y electrónicas no la tienen, y en el resto aplica solo antes de instalar.",
          "Decide considerando el costo de la mano de obra, no solo el precio de la pieza.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿El repuesto OEM es igual al original?",
        respuesta:
          "En la mayoría de los casos es la misma pieza fabricada en la misma planta, sin el logo de la automotriz y sin el sobreprecio de la marca. Puede haber diferencias menores de acabado o empaque, pero el desempeño es equivalente.",
      },
      {
        pregunta: "¿Usar repuestos alternos anula la garantía de mi auto?",
        respuesta:
          "Depende del concesionario y del país. Si tu vehículo está dentro de la garantía de fábrica, consulta primero con la marca. Fuera de garantía, no hay impedimento para usar OEM o alterno.",
      },
      {
        pregunta: "¿Cuánto más barato es el OEM frente al original?",
        respuesta:
          "Varía según la pieza y la marca del vehículo. La diferencia suele ser significativa y por eso es la opción más elegida. Cotiza con nosotros y te damos las opciones lado a lado con precio real y número de parte.",
      },
      {
        pregunta: "¿Ustedes venden las tres opciones?",
        respuesta:
          "Sí. Manejamos original, OEM y alterno para vehículos chinos y americanos, y te indicamos cuál es cuál en la cotización para que decidas con la información completa.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Repuestos para autos chinos", href: "/guias/compra/repuestos-autos-chinos-ecuador" },
      { nombre: "Repuestos para autos americanos", href: "/guias/compra/repuestos-autos-americanos-ecuador" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cómo verificar que un repuesto es original y no falsificado?", href: "/guias/compra/como-verificar-que-un-repuesto-es-original" },
      { titulo: "¿Cuánto cuestan los repuestos en Ecuador?", href: "/guias/compra/cuanto-cuestan-los-repuestos-en-ecuador" },
      { titulo: "¿Es seguro comprar repuestos de auto por internet en Ecuador?", href: "/guias/compra/es-seguro-comprar-repuestos-por-internet-ecuador" },
    ],
    ctaWhatsApp: "Quiero comparar precios de original, OEM y alterno para mi repuesto:",
    fechaPublicacion: "2026-09-01",
  },

  {
    slug: "como-identificar-el-repuesto-correcto",
    categoria: "compra",
    titulo: "¿Cómo identificar el repuesto correcto para mi auto?",
    descripcion:
      "Cómo usar el VIN, el número de parte y el código de motor para comprar el repuesto exacto y evitar piezas incompatibles. Guía práctica para Ecuador.",
    respuesta_corta:
      "Necesitas uno de tres datos, en orden de precisión. El número de parte grabado en la pieza que vas a reemplazar es la identificación exacta: fotografíalo completo, con prefijos y sufijos, porque una letra final puede distinguir dos versiones. El VIN —los 17 caracteres que aparecen en la matrícula, en el marco de la puerta del conductor y en la esquina inferior del parabrisas— determina la versión de fábrica de tu vehículo: motor, transmisión y equipamiento. Marca, modelo, año y código de motor son el mínimo indispensable, pero pueden dejar varias variantes abiertas, sobre todo en modelos que cambiaron de plataforma conservando el nombre comercial. Añade si es diésel o gasolina, manual o automático, y 4x2 o 4x4. Con fotos de la pieza usada y el VIN, la identificación es inmediata.",
    keywords: [
      "cómo identificar repuestos compatibles",
      "número de parte auto Ecuador",
      "VIN para buscar repuestos",
      "código de motor repuestos",
      "compatibilidad repuestos vehículo",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "El error más caro al comprar repuestos no es pagar de más: es recibir una pieza que no encaja. Casi siempre ocurre por comprar con el nombre del modelo y nada más. Estos son los datos que eliminan la incertidumbre.",
      },
      {
        tipo: "h2",
        texto: "1. El número de parte (la identificación exacta)",
      },
      {
        tipo: "p",
        texto:
          "Es la referencia definitiva. Está grabado, estampado o impreso en la pieza que vas a reemplazar. Si puedes desmontarla o verla, tómale una foto nítida del número completo, incluyendo prefijos y sufijos: una letra al final puede distinguir dos versiones distintas.",
      },
      {
        tipo: "h2",
        texto: "2. El VIN (17 caracteres)",
      },
      {
        tipo: "p",
        texto:
          "El VIN identifica tu vehículo exacto tal como salió de fábrica: versión, motor, transmisión y equipamiento. Lo encuentras en la matrícula, en la placa del marco de la puerta del conductor, y en la esquina inferior del parabrisas del lado del conductor. Con el VIN se resuelven las dudas de versión que el año no aclara.",
      },
      {
        tipo: "h2",
        texto: "3. Código de motor, marca, modelo y año",
      },
      {
        tipo: "p",
        texto:
          "Si no tienes número de parte ni VIN a mano, el mínimo indispensable es marca, modelo, año y código de motor, además de si es diésel o gasolina, manual o automático, y 4x2 o 4x4. El código de motor suele estar en una placa del block o en la etiqueta del compartimiento del motor.",
      },
      {
        tipo: "h2",
        texto: "Por qué el año importa tanto",
      },
      {
        tipo: "ul",
        items: [
          "Un mismo modelo puede tener dos o tres plataformas distintas a lo largo de su vida comercial.",
          "El año de fabricación y el año de matrícula no siempre coinciden; el VIN resuelve esa diferencia.",
          "Muchos modelos cambian de proveedor de una pieza a mitad de producción, sin cambiar de generación.",
          "Las versiones de motor de un mismo modelo llevan repuestos completamente distintos: 2.5 gasolina y 2.3 turbo no comparten casi nada.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "En vehículos chinos, verificar la versión es especialmente importante. El Chery Tiggo 5, por ejemplo, tuvo varias configuraciones bajo el mismo nombre comercial. Nunca compres solo por el nombre del modelo.",
      },
      {
        tipo: "h2",
        texto: "Qué enviarnos para que confirmemos la compatibilidad",
      },
      {
        tipo: "ol",
        items: [
          "Marca, modelo y año del vehículo.",
          "VIN completo (17 caracteres) si lo tienes a mano.",
          "Foto del número de parte de la pieza usada, si es posible.",
          "Foto de la pieza montada en el vehículo — a veces dice más que el número.",
          "Tipo de motor: cilindrada, diésel o gasolina, y código de motor si lo conoces.",
        ],
      },
      {
        tipo: "p",
        texto:
          "Con esos datos validamos la aplicación antes de cotizar. Es el paso que evita la mayoría de las devoluciones.",
      },
    ],
    faq: [
      {
        pregunta: "¿Dónde encuentro el VIN de mi vehículo?",
        respuesta:
          "En la matrícula del vehículo, en la placa metálica del marco de la puerta del conductor y en la esquina inferior del parabrisas del lado del conductor. Son 17 caracteres entre letras y números.",
      },
      {
        pregunta: "¿Puedo comprar sin el número de parte?",
        respuesta:
          "Sí. Con marca, modelo, año, código de motor y fotos de la pieza podemos identificar el repuesto por catálogo. El número de parte solo hace el proceso más rápido y seguro.",
      },
      {
        pregunta: "¿Sirve un repuesto de otro año del mismo modelo?",
        respuesta:
          "A veces sí y a veces no. Depende de si el fabricante mantuvo la misma pieza entre años. Hay que verificarlo caso por caso; no lo asumas.",
      },
      {
        pregunta: "¿Verifican la compatibilidad antes de enviar?",
        respuesta:
          "Sí. Validamos la aplicación del repuesto con los datos de tu vehículo antes de despachar, y te enviamos el número de parte y una foto de la pieza en la cotización.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Contacto", href: "/contacto" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Es seguro comprar repuestos de auto por internet en Ecuador?", href: "/guias/compra/es-seguro-comprar-repuestos-por-internet-ecuador" },
      { titulo: "Original, OEM o alterno: ¿cuál conviene?", href: "/guias/compra/original-oem-o-alterno-cual-elegir" },
    ],
    ctaWhatsApp: "Necesito confirmar qué repuesto corresponde a mi vehículo. Mis datos son:",
    fechaPublicacion: "2026-09-01",
  },

  {
    slug: "cuanto-cuestan-los-repuestos-en-ecuador",
    categoria: "compra",
    titulo: "¿Cuánto cuestan los repuestos de auto en Ecuador y qué define el precio?",
    descripcion:
      "Qué factores determinan el precio de un repuesto en Ecuador, cómo comparar cotizaciones de forma justa y cómo evitar pagar de más sin sacrificar calidad.",
    respuesta_corta:
      "El precio de un repuesto en Ecuador depende de cinco factores. El primero y de mayor peso es el tipo: entre un original y un alterno puede haber varias veces de diferencia, con el OEM en un punto intermedio y calidad equivalente al original. El segundo es la marca y el modelo: los vehículos de baja rotación en el país cuestan más por menor volumen. El tercero es la disponibilidad: una pieza en stock en Quito cuesta menos y llega antes que una importada bajo pedido. El cuarto es la complejidad de la pieza. El quinto es la mano de obra del cambio, que en trabajos como el kit de distribución supera con frecuencia el valor de la pieza. Para comparar cotizaciones exige número de parte, marca del fabricante y garantía: sin esos datos no son comparables.",
    keywords: [
      "cuánto cuestan los repuestos en Ecuador",
      "precios repuestos Ford Ecuador",
      "precio repuestos autos chinos Ecuador",
      "son caros los repuestos Ford",
      "comparar precios repuestos Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Preguntar '¿cuánto cuesta?' antes de decir qué pieza, para qué vehículo y de qué tipo, es como pedir el precio de un pasaje sin decir el destino. Esta guía explica qué mueve realmente el precio para que puedas comparar sin que te vendan humo.",
      },
      {
        tipo: "h2",
        texto: "Los cinco factores que determinan el precio",
      },
      {
        tipo: "ol",
        items: [
          "Tipo de repuesto: original, OEM o alterno. Es la variable de mayor peso; entre el original y el alterno puede haber una diferencia de varias veces.",
          "Marca y modelo del vehículo: las marcas premium y los modelos de baja rotación en Ecuador cuestan más por menor volumen.",
          "Disponibilidad local: una pieza en stock en Quito cuesta menos y llega antes que una que hay que importar bajo pedido.",
          "Complejidad de la pieza: un sensor electrónico o una bomba de alta presión tienen otro orden de precio que una manguera o un filtro.",
          "Mano de obra asociada: cambiar una bomba de agua accionada por la correa de distribución implica desarmar el frente del motor. La pieza puede ser lo barato del trabajo.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Son caros los repuestos Ford en Ecuador?",
      },
      {
        tipo: "p",
        texto:
          "Los originales Ford, bajo la marca Motorcraft, están en el rango alto. Pero Ford tiene una de las mejores ofertas OEM del mercado: Bosch, Denso, Monroe, Gates y TRW producen para la línea de montaje y venden bajo su propia marca a un precio bastante menor.",
      },
      {
        tipo: "p",
        texto:
          "En modelos de alto volumen en Ecuador —Ranger, F-150, Explorer y EcoSport— la disponibilidad es buena y eso mantiene los precios competitivos. En modelos menos comunes o más antiguos el precio sube, porque hay que importar.",
      },
      {
        tipo: "h2",
        texto: "¿Y los repuestos de autos chinos?",
      },
      {
        tipo: "p",
        texto:
          "En general son más económicos que sus equivalentes americanos o europeos, sobre todo en marcas de alta rotación como Chery, JAC y Great Wall. La variable a cuidar no es el precio sino la trazabilidad: hay mucho alterno genérico sin fabricante identificable. Un repuesto barato que dura seis meses termina siendo más caro que uno OEM que dura años, especialmente si el cambio requiere mano de obra.",
      },
      {
        tipo: "aviso",
        texto:
          "Los precios de repuestos cambian por tipo de cambio, disponibilidad y lote de importación. Cualquier precio que veas publicado es referencial hasta que se confirma la disponibilidad real. Por eso cotizamos pieza por pieza.",
      },
      {
        tipo: "h2",
        texto: "Cómo comparar dos cotizaciones de forma justa",
      },
      {
        tipo: "ul",
        items: [
          "Exige el número de parte en cada cotización. Sin eso no sabes si te están cotizando lo mismo.",
          "Exige la marca del fabricante, no solo 'original' o 'alterno'.",
          "Confirma la condición de garantía, que no es igual en todas las piezas.",
          "Pregunta si el precio incluye envío y a qué plazo.",
          "Considera la mano de obra: la opción barata que hay que cambiar dos veces no es la barata.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cómo bajar el costo sin bajar la calidad",
      },
      {
        tipo: "ul",
        items: [
          "Elige OEM en lugar de original cuando exista: misma calidad, menor precio.",
          "Agrupa piezas del mismo trabajo en un solo pedido y ahorra en envíos.",
          "Anticipa el mantenimiento: comprar con tiempo evita el sobreprecio de la urgencia.",
          "Cambia en conjunto lo que se desarma junto (kit de distribución con bomba de agua, pastillas con discos) y ahorra mano de obra.",
        ],
      },
    ],
    faq: [
      {
        pregunta: "¿Por qué no publican todos los precios en la web?",
        respuesta:
          "Los precios del catálogo son referenciales y dependen de la disponibilidad y del lote de importación. Confirmamos el precio final por WhatsApp junto con la disponibilidad real y el número de parte exacto para tu vehículo.",
      },
      {
        pregunta: "¿El repuesto más barato siempre sale más caro?",
        respuesta:
          "No siempre, pero en piezas de seguridad y en piezas que requieren desarmar el motor sí suele pasar. En filtros, mangueras o piezas de carrocería, una opción alterna de marca reconocida es una decisión perfectamente sensata.",
      },
      {
        pregunta: "¿Hacen descuento por comprar varias piezas?",
        respuesta:
          "Escríbenos con la lista completa del trabajo que vas a hacer. Cotizamos el conjunto y coordinamos un solo envío, lo que reduce el costo total.",
      },
      {
        pregunta: "¿El precio incluye el envío?",
        respuesta:
          "El costo de envío se confirma junto con la cotización, según la ciudad de destino y el peso de la pieza. Enviamos a todo el Ecuador desde Quito en 24 a 72 horas.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Repuestos para Ford", href: "/catalogo/marca/ford" },
      { nombre: "Repuestos para Chevrolet", href: "/catalogo/marca/chevrolet" },
    ],
    guiasRelacionadas: [
      { titulo: "Original, OEM o alterno: ¿cuál conviene?", href: "/guias/compra/original-oem-o-alterno-cual-elegir" },
      { titulo: "¿Concesionario o almacén independiente?", href: "/guias/compra/concesionario-o-almacen-independiente" },
      { titulo: "Repuestos al por mayor en Ecuador", href: "/guias/compra/repuestos-al-por-mayor-ecuador" },
    ],
    ctaWhatsApp: "Quiero una cotización con precio, número de parte y garantía para:",
    fechaPublicacion: "2026-09-01",
  },

  {
    slug: "garantia-y-devoluciones-de-repuestos",
    categoria: "compra",
    titulo: "Garantía de repuestos: qué cubre, qué no, y por qué debes revisar la pieza antes de instalarla",
    descripcion:
      "Condiciones de garantía de El Chino Americano: aplica al recibir la pieza y por defecto de fábrica. Las eléctricas se envían probadas. No hay garantía sobre piezas instaladas ni por mala instalación.",
    respuesta_corta:
      "En El Chino Americano la garantía aplica al inicio y por defecto de fábrica: es una verificación de entrega, no una garantía de duración. Cubre que la pieza sea la correcta y llegue en buen estado, sin fisuras, sin daños por manipulación y completa. Las piezas eléctricas se envían probadas, y una vez conectadas no tienen garantía. Ninguna pieza tiene garantía una vez instalada o usada, porque a partir de ahí la falla puede venir del montaje, del uso o de otro componente del vehículo en mal estado que afectó a la pieza nueva. Tampoco cubrimos daños por una instalación incorrecta. Por eso revisa el repuesto apenas lo recibas, antes de llevarlo al taller, y avísanos si algo no cuadra.",
    keywords: [
      "garantía repuestos Ecuador",
      "devolución repuestos automotrices",
      "garantía piezas eléctricas auto",
      "condiciones de garantía repuestos Quito",
      "reclamo repuesto defectuoso Ecuador",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "La garantía es la pregunta que casi nadie hace antes de pagar y que todo el mundo hace después. Preferimos decirla completa desde el inicio. La idea de fondo es una sola: nuestra garantía es por defecto de fábrica y se verifica al recibir la pieza, no es una garantía de duración en el tiempo.",
      },
      {
        tipo: "h2",
        texto: "¿Qué cubre la garantía?",
      },
      {
        tipo: "p",
        texto:
          "Cubre el defecto de fábrica, detectable cuando recibes la pieza y antes de instalarla. Se gestiona con la pieza sin montar, en su estado original y con su empaque, junto con el comprobante de compra.",
      },
      {
        tipo: "ul",
        items: [
          "La pieza no corresponde a la que se cotizó o al vehículo.",
          "Llega con una fisura o una grieta de fábrica.",
          "Llega forzada, golpeada o deformada por manipulación.",
          "Llega incompleta: faltan pernos, sellos o accesorios incluidos.",
          "Tiene un defecto de fabricación visible: roscas dañadas, soldaduras abiertas, empaques resecos.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Qué no cubre la garantía?",
      },
      {
        tipo: "ul",
        items: [
          "Piezas eléctricas y electrónicas una vez conectadas: sensores, bobinas, módulos, ECU, alternadores, motores de arranque y componentes de cableado. Se envían probadas, pero después del montaje no tienen garantía.",
          "Cualquier pieza ya instalada o usada, sin importar el tiempo transcurrido.",
          "Fallas por uso inadecuado del vehículo: sobrecarga, conducción en malas condiciones, exigencia fuera de lo previsto para la pieza.",
          "Daños causados por otro componente en mal estado que afectó a la pieza nueva.",
          "Mala instalación: no nos hacemos responsables por daños derivados de un montaje incorrecto o realizado sin los torques y procedimientos especificados.",
          "Desgaste normal de piezas consumibles: pastillas, discos, filtros, correas y bujías tienen vida útil limitada por diseño.",
          "Piezas manipuladas, pintadas, perforadas o con el número de parte alterado.",
        ],
      },
      {
        tipo: "h2",
        texto: "¿Por qué la garantía aplica al inicio y no después?",
      },
      {
        tipo: "p",
        texto:
          "Porque un defecto de fábrica se manifiesta desde el primer momento, mientras que una falla posterior casi nunca depende de la pieza. Un ejemplo concreto: compras un amortiguador, llega bien, se instala bien, y a las dos semanas ya no sirve. En ese escenario la causa suele ser el uso al que se sometió el vehículo, o un componente vecino que estaba en mal estado —una base, un buje, un resorte vencido— y que destruyó la pieza nueva. Nada de eso es un defecto de fabricación, y no hay forma de demostrar que lo fuera después del montaje.",
      },
      {
        tipo: "p",
        texto:
          "Por eso la garantía se define en el momento de la entrega: ahí sí es posible verificar objetivamente si la pieza es la correcta y si llegó en buen estado.",
      },
      {
        tipo: "h2",
        texto: "¿Y las piezas eléctricas?",
      },
      {
        tipo: "p",
        texto:
          "Las piezas eléctricas y electrónicas se envían probadas: verificamos que funcionen antes de despacharlas, así que salen operativas. Una vez conectadas, sin embargo, no tienen garantía, y la razón es la misma pero más marcada. Un sensor, una bobina o un módulo pueden quemarse por un cortocircuito, una masa deficiente, un voltaje irregular, una conexión invertida o un diagnóstico equivocado que llevó a cambiar la pieza que no era. Ninguna de esas causas es un defecto de fabricación, y ninguna se puede descartar después del montaje.",
      },
      {
        tipo: "p",
        texto:
          "Por eso, en electrónica la verificación previa vale más que cualquier garantía: confirma el número de parte, asegúrate de que el diagnóstico esté hecho con escáner y no por descarte, y revisa el estado del cableado y la alimentación antes de conectar la pieza nueva.",
      },
      {
        tipo: "h2",
        texto: "Revisa la pieza antes de instalarla",
      },
      {
        tipo: "p",
        texto:
          "Este es el momento en el que la garantía está viva. La revisión tiene dos objetivos: confirmar que es la pieza correcta y descartar que venga fisurada, forzada o dañada. Dedícale cinco minutos apenas recibas el pedido, antes de llevarlo al taller.",
      },
      {
        tipo: "ol",
        items: [
          "Compara el número de parte de la pieza con el de la cotización. Deben coincidir, incluidos prefijos y sufijos.",
          "Revisa que la pieza corresponda físicamente a la que vas a reemplazar: mídela o compárala lado a lado con la usada.",
          "Busca fisuras, grietas, golpes, deformaciones por manipulación, roscas dañadas o empaques resecos.",
          "Verifica que el empaque esté completo y que no falten pernos, sellos ni accesorios incluidos.",
          "Si algo no cuadra, escríbenos por WhatsApp con fotos antes de instalar.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "La instalación es el punto de no retorno. Desde el momento en que la pieza se monta, la garantía deja de aplicar, sin importar cuánto tiempo pase después. Revisa y consulta antes del montaje.",
      },
      {
        tipo: "h2",
        texto: "Qué necesitas para gestionar una garantía",
      },
      {
        tipo: "ol",
        items: [
          "Comprobante de compra con el detalle del repuesto y el número de parte.",
          "La pieza sin instalar, en su estado original y con su empaque.",
          "Fotos claras de la pieza, del número de parte y del empaque.",
          "El chat de WhatsApp de la compra, donde queda registrado lo que se cotizó y se acordó.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cómo evitamos que llegues a este punto",
      },
      {
        tipo: "p",
        texto:
          "La mayoría de los problemas no son piezas defectuosas: son piezas que no correspondían al vehículo. Por eso verificamos la aplicación del repuesto con tu año y versión de motor antes de despachar, probamos las piezas eléctricas antes de enviarlas, y te entregamos el número de parte y una foto real de la pieza en la cotización, para que puedas compararla al recibirla.",
      },
    ],
    faq: [
      {
        pregunta: "¿Las piezas eléctricas tienen garantía?",
        respuesta:
          "Las piezas eléctricas y electrónicas se envían probadas: verificamos que funcionen antes de despacharlas. Una vez conectadas no tienen garantía, porque no es posible determinar si la falla vino de la pieza o del sistema del vehículo. Si al recibirla no es la pieza correcta o llega dañada, avísanos antes de instalarla.",
      },
      {
        pregunta: "¿Puedo reclamar la garantía si la pieza ya está instalada?",
        respuesta:
          "No. La garantía aplica al recibir la pieza, sin montar y con su empaque. Una vez instalada deja de aplicar, sin importar cuánto tiempo pase. Por eso conviene revisar el repuesto apenas llega y consultarnos antes de llevarlo al taller.",
      },
      {
        pregunta: "Compré un amortiguador, se instaló bien y falló a las dos semanas. ¿Hay garantía?",
        respuesta:
          "No. Una falla que aparece después del montaje no es un defecto de fábrica: suele deberse al uso al que se sometió el vehículo o a otro componente en mal estado —una base, un buje o un resorte vencido— que dañó la pieza nueva. La garantía cubre el defecto de fábrica verificable al momento de la entrega.",
      },
      {
        pregunta: "¿Qué pasa si el taller instaló mal la pieza?",
        respuesta:
          "No nos hacemos responsables por daños derivados de una instalación incorrecta. La instalación es responsabilidad del taller o de quien realiza el montaje, y conviene que se haga siguiendo los torques y procedimientos que especifica el fabricante.",
      },
      {
        pregunta: "¿Puedo devolver un repuesto que no necesité?",
        respuesta:
          "Escríbenos por WhatsApp antes de abrir o instalar la pieza. Las piezas sin usar, en su empaque original y con comprobante de compra son las únicas que se pueden gestionar.",
      },
      {
        pregunta: "¿Qué pasa si la pieza llega dañada por el envío?",
        respuesta:
          "Avísanos apenas la recibas, con fotos del empaque y de la pieza antes de manipularla. Todos nuestros envíos salen con guía rastreable, lo que permite gestionar el caso con la transportadora.",
      },
      {
        pregunta: "¿La garantía cubre la mano de obra del taller?",
        respuesta:
          "No. La garantía se limita al repuesto, nunca a la mano de obra de instalación ni a los costos derivados del trabajo.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Contacto", href: "/contacto" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Es seguro comprar repuestos de auto por internet en Ecuador?", href: "/guias/compra/es-seguro-comprar-repuestos-por-internet-ecuador" },
      { titulo: "¿Cómo verificar que un repuesto es original y no falsificado?", href: "/guias/compra/como-verificar-que-un-repuesto-es-original" },
      { titulo: "¿Cómo identificar el repuesto correcto para mi auto?", href: "/guias/compra/como-identificar-el-repuesto-correcto" },
    ],
    ctaWhatsApp: "Quiero consultar las condiciones de garantía de un repuesto antes de comprarlo:",
    fechaPublicacion: "2026-09-01",
  },

  {
    slug: "concesionario-o-almacen-independiente",
    categoria: "compra",
    titulo: "¿Concesionario o almacén independiente para comprar repuestos?",
    descripcion:
      "Comparación honesta entre comprar repuestos en el concesionario oficial o en un almacén independiente en Ecuador: precio, disponibilidad, garantía y asesoría.",
    respuesta_corta:
      "El concesionario oficial conviene en tres casos: cuando el vehículo está dentro de la garantía de fábrica y la marca exige repuesto original; cuando la pieza es electrónica y necesita codificación con equipo de marca, como módulos, llaves o ECU; y cuando el modelo es tan reciente que todavía no existe oferta OEM. El almacén independiente conviene en todo lo demás: ofrece original, OEM y alterno lado a lado, precios menores en piezas equivalentes, mejor disponibilidad en modelos con años de circulación y asesoría directa sin turnos. Un almacén serio entrega lo que realmente importa: compatibilidad verificada contra año y versión, número de parte, declaración del tipo de repuesto, condiciones de garantía dichas con claridad y comprobante de compra. La diferencia real no es oficial contra independiente, sino con verificación contra sin verificación.",
    keywords: [
      "concesionario o almacén independiente repuestos",
      "repuestos concesionario vs independiente Ecuador",
      "dónde comprar repuestos Ecuador",
      "almacén de repuestos confiable Quito",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Es una decisión que casi todo propietario enfrenta después de la garantía de fábrica. Las dos opciones son legítimas y cada una tiene un terreno donde gana con claridad.",
      },
      {
        tipo: "h2",
        texto: "Cuándo conviene el concesionario oficial",
      },
      {
        tipo: "ul",
        items: [
          "El vehículo está dentro de la garantía de fábrica y el fabricante exige repuesto original.",
          "La pieza es electrónica y necesita codificación o programación con equipo de marca (módulos, llaves, ECU).",
          "Se trata de una campaña de servicio o un llamado a revisión del fabricante.",
          "Es un modelo muy reciente cuya oferta OEM en el mercado todavía no existe.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cuándo conviene el almacén independiente",
      },
      {
        tipo: "ul",
        items: [
          "Buscas la opción OEM equivalente a un precio menor que el original.",
          "El vehículo ya tiene varios años y no está bajo garantía de fábrica.",
          "Quieres comparar original, OEM y alterno antes de decidir.",
          "Necesitas disponibilidad rápida sin agenda ni turnos.",
          "Quieres hablar directamente con quien identifica la pieza, no con una ventanilla.",
        ],
      },
      {
        tipo: "h2",
        texto: "Lo que debe darte cualquiera de los dos",
      },
      {
        tipo: "ol",
        items: [
          "Compatibilidad verificada con año, versión y, si es posible, VIN.",
          "Número de parte de la pieza que te van a entregar.",
          "Declaración clara de si es original, OEM o alterno.",
          "Condiciones de garantía dichas con claridad antes de pagar, incluido lo que no cubre.",
          "Comprobante de compra.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "El riesgo no está en comprar fuera del concesionario, sino en comprar sin verificación. Un mostrador que responde 'sí sirve' sin preguntarte el año del vehículo es más riesgoso que cualquier canal.",
      },
      {
        tipo: "h2",
        texto: "Dónde nos ubicamos nosotros",
      },
      {
        tipo: "p",
        texto:
          "El Chino Americano es un almacén independiente especializado en vehículos chinos y americanos, con base en Quito y envíos a todo el Ecuador. Trabajamos con original, OEM y alterno; verificamos la aplicación del repuesto antes de despachar; entregamos número de parte y foto real en la cotización; y entregamos comprobante de compra. La garantía cubre defectos de fábrica en piezas sin instalar; las eléctricas se venden sin garantía.",
      },
    ],
    faq: [
      {
        pregunta: "¿Comprar fuera del concesionario anula la garantía de mi auto?",
        respuesta:
          "Si tu vehículo está dentro de la garantía de fábrica, consulta las condiciones con la marca antes de cambiar una pieza. Fuera de la garantía de fábrica, no hay ningún impedimento para comprar en un almacén independiente.",
      },
      {
        pregunta: "¿Un almacén independiente vende repuestos originales?",
        respuesta:
          "Sí. Nosotros manejamos original, OEM y alterno, y te indicamos cuál es cuál en la cotización para que tomes la decisión con la información completa.",
      },
      {
        pregunta: "¿Por qué el precio es menor fuera del concesionario?",
        respuesta:
          "Principalmente porque el repuesto OEM es la misma pieza del fabricante original sin el sobreprecio de la marca de la automotriz, y porque la estructura de costos de un almacén independiente es más liviana.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Contacto y ubicación", href: "/contacto" },
    ],
    guiasRelacionadas: [
      { titulo: "Original, OEM o alterno: ¿cuál conviene?", href: "/guias/compra/original-oem-o-alterno-cual-elegir" },
      { titulo: "¿Cuánto cuestan los repuestos en Ecuador?", href: "/guias/compra/cuanto-cuestan-los-repuestos-en-ecuador" },
      { titulo: "¿Es seguro comprar repuestos de auto por internet en Ecuador?", href: "/guias/compra/es-seguro-comprar-repuestos-por-internet-ecuador" },
    ],
    ctaWhatsApp: "Quiero comparar la opción original y la OEM para mi repuesto:",
    fechaPublicacion: "2026-09-01",
  },

  {
    slug: "repuestos-al-por-mayor-ecuador",
    categoria: "compra",
    titulo: "¿Dónde comprar repuestos de carros al por mayor en Ecuador?",
    descripcion:
      "Cómo comprar repuestos al por mayor en Ecuador para talleres, mecánicas y almacenes: qué datos enviar, cómo cotizar volumen y cómo coordinar envíos a provincias.",
    respuesta_corta:
      "Un pedido al por mayor se cotiza por lista, no pieza por pieza. Arma una fila por referencia con el número de parte, o con marca, modelo, año y descripción, e indica la cantidad de cada ítem y si necesitas original, OEM o alterno. Con esa lista se arma una cotización de volumen con precio por referencia, disponibilidad y plazo, y se coordina un despacho único. En El Chino Americano atendemos talleres, mecánicas, almacenes de provincia y flotas desde Quito, con envío a todo el Ecuador en 24 a 72 horas y guía rastreable. Para compras recurrentes conviene acordar las referencias de mayor rotación —filtros, pastillas y discos, bujías, correas, amortiguadores, rótulas y kits de distribución— y anticipar disponibilidad en lugar de comprar cada vez con urgencia.",
    keywords: [
      "repuestos al por mayor Ecuador",
      "repuestos por mayor para talleres Ecuador",
      "distribuidor repuestos automotrices Ecuador",
      "comprar autopartes al por mayor Quito",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Un taller no compra como un dueño de auto. Necesita rotación previsible, precios de volumen y un proveedor que responda rápido cuando el vehículo del cliente está en el elevador.",
      },
      {
        tipo: "h2",
        texto: "Quién compra al por mayor",
      },
      {
        tipo: "ul",
        items: [
          "Talleres y mecánicas especializadas en marcas chinas o americanas.",
          "Almacenes de repuestos de provincia que se abastecen desde Quito.",
          "Flotas y empresas con varios vehículos del mismo modelo.",
          "Servicios de mantenimiento por contrato.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cómo cotizar un pedido de volumen",
      },
      {
        tipo: "ol",
        items: [
          "Arma una lista con una fila por referencia: número de parte o marca, modelo, año y descripción.",
          "Indica la cantidad por referencia y si necesitas original, OEM o alterno.",
          "Envía la lista por WhatsApp en texto, Excel o foto legible.",
          "Recibes la cotización consolidada con precio por referencia, disponibilidad y plazo.",
          "Se coordina un despacho único a tu ciudad con guía rastreable.",
        ],
      },
      {
        tipo: "h2",
        texto: "Qué referencias conviene mantener en stock",
      },
      {
        tipo: "p",
        texto:
          "Para talleres que trabajan marcas chinas y americanas, las referencias de mayor rotación suelen ser filtros (aceite, aire, combustible y cabina), pastillas y discos de freno, bujías, correas de accesorios, amortiguadores, rótulas y terminales de dirección, bombas de agua y kits de distribución. Anticipar estas referencias evita parar un trabajo esperando una pieza.",
      },
      {
        tipo: "aviso",
        texto:
          "El error más común en pedidos de volumen es enviar la lista sin el año ni la versión de motor de cada vehículo. Una lista bien armada se cotiza en horas; una lista incompleta se convierte en días de idas y vueltas.",
      },
      {
        tipo: "h2",
        texto: "Envíos a provincias",
      },
      {
        tipo: "p",
        texto:
          "Despachamos desde Quito a Guayaquil, Cuenca, Ambato, Loja, Manta, Esmeraldas, Santo Domingo de los Tsáchilas y el resto del país en 24 a 72 horas según la ciudad, con guía de envío rastreable.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cuál es el pedido mínimo para precio de mayorista?",
        respuesta:
          "Depende de las referencias y del volumen por ítem. Envíanos tu lista por WhatsApp y te confirmamos la condición aplicable a ese pedido.",
      },
      {
        pregunta: "¿Atienden talleres fuera de Quito?",
        respuesta:
          "Sí. Trabajamos con talleres y almacenes de todo el Ecuador, con envío desde Quito en 24 a 72 horas y guía rastreable.",
      },
      {
        pregunta: "¿Pueden abastecer referencias de forma recurrente?",
        respuesta:
          "Sí. Si nos compartes tus referencias de mayor rotación, podemos anticipar disponibilidad y reducir los tiempos de espera en tus trabajos.",
      },
      {
        pregunta: "¿Emiten comprobante para empresas?",
        respuesta:
          "Sí. Indícanos los datos de facturación al momento de confirmar el pedido.",
      },
    ],
    productosRelacionados: [
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
      { nombre: "Contacto", href: "/contacto" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cuánto cuestan los repuestos en Ecuador?", href: "/guias/compra/cuanto-cuestan-los-repuestos-en-ecuador" },
      { titulo: "Original, OEM o alterno: ¿cuál conviene?", href: "/guias/compra/original-oem-o-alterno-cual-elegir" },
    ],
    ctaWhatsApp: "Tengo un taller y quiero cotizar un pedido al por mayor. Mi lista es:",
    fechaPublicacion: "2026-09-01",
  },
]

// ─── GUÍAS DE MANTENIMIENTO ───────────────────────────────────────────────────

const guiasMantenimiento: Guia[] = [
  {
    slug: "filtros-chery-cuales-son-y-cada-cuanto-cambiarlos",
    categoria: "mantenimiento",
    titulo: "Filtros Chery: cuáles son, cada cuánto cambiarlos y cómo pedir el correcto",
    descripcion:
      "Guía de los cuatro filtros de un Chery (aceite, aire, combustible y cabina): función, intervalos de cambio en Ecuador y qué datos enviar para pedir el filtro exacto.",
    respuesta_corta:
      "Un Chery usa cuatro filtros, cada uno con su propio intervalo. El de aceite se cambia en cada cambio de aceite: 5.000 a 7.000 km con semisintético y hasta 10.000 km con sintético. El de aire del motor, cada 15.000 km, o antes si circulas por vías sin asfaltar o zonas de construcción. El de combustible, entre 20.000 y 40.000 km según el modelo; saturado provoca tirones al acelerar y pérdida de potencia en subida. El de cabina o polen, cada 15.000 km o una vez al año, y en Quito conviene revisarlo antes por el polvo y la contaminación urbana. Para pedir el filtro correcto no basta decir Tiggo: Chery ha usado varias plataformas bajo nombres parecidos, así que envía modelo exacto, año y código de motor, o el número de parte del filtro usado.",
    keywords: [
      "filtros chery",
      "filtro de aceite Chery Tiggo",
      "filtro de aire Chery Ecuador",
      "filtro de cabina Chery",
      "cada cuánto cambiar filtros Chery",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Los filtros son el mantenimiento más barato y el que más problemas evita. En un Chery son cuatro, cada uno con una función distinta y un intervalo propio. Cambiarlos a tiempo cuesta poco; no cambiarlos termina en reparaciones de motor.",
      },
      {
        tipo: "h2",
        texto: "1. Filtro de aceite",
      },
      {
        tipo: "p",
        texto:
          "Retiene las partículas metálicas y el hollín que circulan con el aceite. Se cambia siempre junto con el aceite, nunca después: reutilizarlo contamina el aceite nuevo desde el primer kilómetro. El intervalo depende del aceite: con mineral o semisintético, entre 5.000 y 7.000 km; con sintético, hasta 10.000 km según lo indique el manual del vehículo.",
      },
      {
        tipo: "h2",
        texto: "2. Filtro de aire del motor",
      },
      {
        tipo: "p",
        texto:
          "Evita que polvo y arena entren a los cilindros. Un filtro saturado reduce la potencia y aumenta el consumo. El intervalo de referencia es 15.000 km, pero en Ecuador conviene revisarlo antes si circulas por vías sin asfaltar, zonas de construcción o carreteras con polvo. Se revisa a simple vista: si está oscuro y cargado, se cambia.",
      },
      {
        tipo: "h2",
        texto: "3. Filtro de combustible",
      },
      {
        tipo: "p",
        texto:
          "Protege los inyectores y la bomba de combustible de impurezas y agua. El intervalo va de 20.000 a 40.000 km según el modelo. Los síntomas de un filtro saturado son tirones al acelerar, pérdida de potencia en subida y arranque difícil. Es una pieza barata que protege componentes caros.",
      },
      {
        tipo: "h2",
        texto: "4. Filtro de cabina (polen o aire acondicionado)",
      },
      {
        tipo: "p",
        texto:
          "Filtra el aire que entra al habitáculo. No afecta al motor, pero sí a la salud de los ocupantes y al rendimiento del aire acondicionado. El intervalo de referencia es 15.000 km o una vez al año. Si el aire acondicionado sopla poco o hay olor a humedad, casi siempre es este filtro. En Quito, por el polvo y la contaminación urbana, conviene revisarlo antes del intervalo.",
      },
      {
        tipo: "h2",
        texto: "Modelos Chery más comunes en Ecuador",
      },
      {
        tipo: "ul",
        items: [
          "Chery Tiggo 2 y Tiggo 2 Pro",
          "Chery Tiggo 4 y Tiggo 4 Pro",
          "Chery Tiggo 5 y Tiggo 5X",
          "Chery Tiggo 7 y Tiggo 7 Pro",
          "Chery Tiggo 8 y Tiggo 8 Pro",
          "Chery Arrizo 5 y Arrizo 6",
          "Chery QQ",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "Decir solo 'filtros para Tiggo' no alcanza. Chery ha usado varias plataformas y motores bajo nombres de modelo parecidos, y las referencias de filtro cambian entre ellas. Envía modelo exacto, año y código de motor, o una foto del número de parte del filtro que vas a reemplazar.",
      },
      {
        tipo: "h2",
        texto: "Qué enviarnos para cotizar los filtros correctos",
      },
      {
        tipo: "ol",
        items: [
          "Modelo exacto y año del vehículo (por ejemplo, Tiggo 4 Pro 2022, no solo 'Tiggo').",
          "Código de motor si lo conoces, o el VIN del vehículo.",
          "Qué filtros necesitas: aceite, aire, combustible, cabina, o el juego completo.",
          "Si prefieres original, OEM o alterno de marca reconocida.",
        ],
      },
      {
        tipo: "p",
        texto:
          "Con esos datos verificamos la aplicación, te enviamos los números de parte y cotizamos el juego completo, que casi siempre sale mejor que comprar los filtros por separado.",
      },
    ],
    faq: [
      {
        pregunta: "¿Cada cuánto se cambian los filtros de un Chery Tiggo?",
        respuesta:
          "Filtro de aceite en cada cambio de aceite (5.000 a 10.000 km según el aceite), filtro de aire cada 15.000 km, filtro de combustible entre 20.000 y 40.000 km, y filtro de cabina cada 15.000 km o una vez al año. Confirma siempre contra el manual de tu versión.",
      },
      {
        pregunta: "¿Puedo usar filtros alternos en un Chery?",
        respuesta:
          "Sí. Los filtros son una de las piezas donde un alterno u OEM de marca reconocida rinde perfectamente. Lo que no conviene es un filtro genérico sin fabricante identificable, porque el medio filtrante es justamente lo que estás pagando.",
      },
      {
        pregunta: "¿Qué pasa si no cambio el filtro de aire a tiempo?",
        respuesta:
          "El motor respira menos, pierdes potencia y sube el consumo de combustible. Si el filtro se rompe por saturación, entra polvo directo a los cilindros y el desgaste interno se acelera.",
      },
      {
        pregunta: "¿Tienen filtros Chery en stock en Ecuador?",
        respuesta:
          "Sí, es una de las referencias de mayor rotación. Escríbenos por WhatsApp con el modelo exacto y el año y te confirmamos disponibilidad, precio y número de parte. Enviamos a todo el Ecuador desde Quito.",
      },
    ],
    productosRelacionados: [
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
      { nombre: "Filtros en el catálogo", href: "/catalogo?categoria=filtros" },
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
    ],
    guiasRelacionadas: [
      { titulo: "¿Cada cuánto cambiar el filtro de aceite?", href: "/guias/problemas/cada-cuanto-cambiar-filtro-de-aceite" },
      { titulo: "Plan de mantenimiento por kilometraje para autos chinos", href: "/guias/mantenimiento/plan-de-mantenimiento-auto-chino" },
      { titulo: "¿Dónde comprar repuestos Chery en Ecuador?", href: "/guias/marcas/repuestos-chery-ecuador" },
    ],
    ctaWhatsApp: "Necesito cotizar filtros para mi Chery. Modelo y año:",
    fechaPublicacion: "2026-09-01",
  },

  {
    slug: "plan-de-mantenimiento-auto-chino",
    categoria: "mantenimiento",
    titulo: "Plan de mantenimiento por kilometraje para autos chinos en Ecuador",
    descripcion:
      "Qué revisar y cambiar cada 5.000, 10.000, 20.000, 40.000 y 60.000 km en un Chery, JAC, BYD, Great Wall, MG o DFSK, con las particularidades del uso en Ecuador.",
    respuesta_corta:
      "Plan de referencia para un auto chino en Ecuador, siempre validado contra el manual de tu versión. Cada 5.000 a 10.000 km: aceite y filtro de aceite, revisión de niveles, frenos y presión de llantas, y rotación de llantas. Cada 15.000 km: filtro de aire, filtro de cabina, alineación y balanceo. Entre 20.000 y 40.000 km: filtro de combustible, pastillas de freno y revisión de discos y correas de accesorios. Cada 40.000 km: bujías en motores a gasolina, líquido de frenos y revisión completa de suspensión. Entre 60.000 y 100.000 km: kit de distribución junto con la bomba de agua si es accionada por esa correa, y cambio total de refrigerante. Tres factores locales acortan estos intervalos: la altura de la sierra, el polvo de vías sin asfaltar y el tráfico urbano denso.",
    keywords: [
      "mantenimiento auto chino Ecuador",
      "plan de mantenimiento Chery JAC",
      "mantenimiento por kilometraje vehículo chino",
      "cada cuánto hacer mantenimiento auto chino",
    ],
    contenido: [
      {
        tipo: "p",
        texto:
          "Los vehículos chinos modernos no requieren un mantenimiento distinto al de cualquier otra marca: requieren que se cumpla. El manual de cada modelo manda, y esta guía sirve como referencia práctica para planificar con anticipación y comprar los repuestos sin urgencia.",
      },
      {
        tipo: "h2",
        texto: "Cada 5.000 a 10.000 km",
      },
      {
        tipo: "ul",
        items: [
          "Cambio de aceite de motor y filtro de aceite (5.000 a 7.000 km con semisintético, hasta 10.000 km con sintético).",
          "Revisión de niveles: refrigerante, líquido de frenos, dirección hidráulica y limpiaparabrisas.",
          "Revisión visual de pastillas de freno y presión de llantas.",
          "Rotación de llantas.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cada 15.000 km",
      },
      {
        tipo: "ul",
        items: [
          "Filtro de aire del motor (antes si circulas en zonas con polvo).",
          "Filtro de cabina o de polen.",
          "Alineación y balanceo.",
          "Revisión de amortiguadores y bujes de suspensión.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cada 20.000 a 40.000 km",
      },
      {
        tipo: "ul",
        items: [
          "Filtro de combustible, según lo especifique el modelo.",
          "Cambio de pastillas de freno delanteras si el desgaste lo exige.",
          "Revisión de discos de freno: espesor y ausencia de alabeo.",
          "Revisión de correas de accesorios y tensores.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cada 40.000 km",
      },
      {
        tipo: "ul",
        items: [
          "Bujías en motores a gasolina (el intervalo varía según el tipo de bujía).",
          "Líquido de frenos: es higroscópico y pierde propiedades con el tiempo, no solo con el kilometraje.",
          "Revisión completa de suspensión: rótulas, terminales de dirección y bujes.",
          "Revisión del sistema de enfriamiento y del estado del refrigerante.",
        ],
      },
      {
        tipo: "h2",
        texto: "Entre 60.000 y 100.000 km",
      },
      {
        tipo: "ul",
        items: [
          "Kit de distribución (correa, tensor y poleas) junto con la bomba de agua, si la bomba es accionada por esa correa.",
          "Cambio completo de refrigerante.",
          "Revisión o cambio de amortiguadores.",
          "Revisión del embrague en vehículos manuales de uso urbano intenso.",
          "Revisión del sistema de escape y del catalizador.",
        ],
      },
      {
        tipo: "aviso",
        texto:
          "El kit de distribución no es un mantenimiento opcional. Si la correa se corta en un motor de interferencia, las válvulas chocan con los pistones y la reparación cuesta muchas veces más que el kit. Cámbialo dentro del intervalo del manual, no cuando haga ruido.",
      },
      {
        tipo: "h2",
        texto: "Tres factores que acortan los intervalos en Ecuador",
      },
      {
        tipo: "ol",
        items: [
          "Altura: en Quito y la sierra, el motor y el sistema de encendido trabajan más exigidos. Respetar el intervalo de bujías y filtros de aire tiene un efecto directo en el consumo y la potencia.",
          "Polvo: vías sin asfaltar y zonas de construcción saturan el filtro de aire mucho antes de los 15.000 km.",
          "Tráfico urbano: el uso continuo en ciudad desgasta frenos, embrague y aceite más rápido que la misma distancia en carretera.",
        ],
      },
      {
        tipo: "h2",
        texto: "Cómo planificar la compra de repuestos",
      },
      {
        tipo: "p",
        texto:
          "Comprar con anticipación siempre sale mejor: puedes comparar original, OEM y alterno con calma, agrupar varias piezas en un solo envío y evitar el sobreprecio de la urgencia. Envíanos el modelo, el año y el kilometraje actual y te armamos la lista del próximo mantenimiento con precios y números de parte.",
      },
    ],
    faq: [
      {
        pregunta: "¿Los autos chinos necesitan más mantenimiento que otros?",
        respuesta:
          "No necesariamente. Los modelos actuales tienen intervalos comparables a los de otras marcas. Lo que sí cambia es la disponibilidad de repuestos: conviene planificar con anticipación en piezas menos comunes.",
      },
      {
        pregunta: "¿Puedo estirar el cambio de aceite si uso sintético?",
        respuesta:
          "Hasta el intervalo que indique el manual de tu versión, sí. Pero en uso urbano intenso o en zonas de polvo, estirarlo es un mal negocio: el aceite se contamina por condiciones de uso, no solo por kilómetros.",
      },
      {
        pregunta: "¿Cada cuánto cambio el kit de distribución en un Chery o JAC?",
        respuesta:
          "Depende del motor: el rango habitual está entre 60.000 y 100.000 km. Confirma el intervalo exacto en el manual de tu versión y cambia la bomba de agua al mismo tiempo si es accionada por esa correa, porque la mano de obra es la misma.",
      },
      {
        pregunta: "¿Ustedes venden los kits completos de mantenimiento?",
        respuesta:
          "Sí. Escríbenos con el modelo, el año y el kilometraje y te cotizamos el juego completo de lo que toca en ese servicio, con números de parte y en un solo envío.",
      },
    ],
    productosRelacionados: [
      { nombre: "Repuestos para Chery", href: "/catalogo/marca/chery" },
      { nombre: "Repuestos para JAC", href: "/catalogo/marca/jac" },
      { nombre: "Ver todo el catálogo", href: "/catalogo" },
    ],
    guiasRelacionadas: [
      { titulo: "Filtros Chery: cuáles son y cada cuánto cambiarlos", href: "/guias/mantenimiento/filtros-chery-cuales-son-y-cada-cuanto-cambiarlos" },
      { titulo: "¿Cómo saber si la bomba de agua está dañada?", href: "/guias/problemas/como-saber-si-la-bomba-de-agua-esta-danada" },
      { titulo: "¿Dónde comprar repuestos para autos chinos en Ecuador?", href: "/guias/compra/repuestos-autos-chinos-ecuador" },
    ],
    ctaWhatsApp: "Quiero cotizar el mantenimiento de mi auto. Modelo, año y kilometraje:",
    fechaPublicacion: "2026-09-01",
  },
]

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export const guias: Guia[] = [
  ...guiasProblemas,
  ...guiasMarcas,
  ...guiasCompra,
  ...guiasMantenimiento,
]

export function getGuiaBySlug(categoria: string, slug: string): Guia | undefined {
  return guias.find((g) => g.categoria === categoria && g.slug === slug)
}

export function getGuiasByCategoria(categoria: GuiaCategoria): Guia[] {
  return guias.filter((g) => g.categoria === categoria)
}
