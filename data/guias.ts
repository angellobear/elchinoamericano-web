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
      "El filtro de aceite debe cambiarse en cada cambio de aceite, sin excepción. Los intervalos son: cada 5.000 km con aceite mineral, cada 7.500 km con semisintético, y cada 10.000 km con sintético. El costo del filtro es mínimo comparado con el daño que causa circular con aceite sin filtrar: las partículas metálicas y de carbón que el filtro atrapó se mezclan con el aceite nuevo, reduciendo su efectividad desde el primer día. En Ecuador, muchos propietarios de vehículos chinos usan filtros de marcas genéricas desconocidas por precio, lo que acelera el desgaste del motor.",
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
      "La regla práctica: si el disco tiene rayaduras profundas que se sienten con la uña, o está por debajo de su espesor mínimo (marcado en el costado del disco, generalmente 18–20 mm en frenos delanteros), cambia pastillas y discos juntos. Si el disco está en buen estado, solo cambia las pastillas. Colocar pastillas nuevas sobre discos desgastados es el error más común — las pastillas no se asientan bien, el frenado es inferior y las pastillas se desgastan más rápido. Si el chirrido persiste con pastillas nuevas, el disco necesita rectificación o las pastillas son de mala calidad.",
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
      "En El Chino Americano encontrarás repuestos para Chery en Ecuador: Tiggo 5, Tiggo 7, Tiggo 8, Arrizo 5 y QQ. Tenemos piezas originales, OEM y alternas para motor, frenos, suspensión, sistema de enfriamiento, filtros y carrocería. Operamos desde Quito y coordinamos envíos a todo el Ecuador en 24 a 72 horas. Puedes cotizar por WhatsApp con el modelo, año y número de parte o descripción del repuesto. Si no tienes el número de parte, con el código de motor y año del vehículo podemos identificarlo.",
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
      "En El Chino Americano tenemos repuestos para JAC en Ecuador: T8 (camioneta), S3 (SUV), J7 (sedán), S2 y T6. Manejamos piezas para motor, frenos, suspensión, sistema de enfriamiento y carrocería en versión original, OEM y alterna. Operamos desde Quito con envíos a todo el Ecuador en 24 a 72 horas. JAC tiene motores de distintas configuraciones según el modelo y año — al cotizar confirma el modelo exacto, año y código de motor para asegurar compatibilidad.",
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
      "En El Chino Americano tenemos repuestos para Ford en Ecuador: Ranger, F-150, Explorer, Escape, Bronco Sport y EcoSport. Manejamos piezas originales, OEM y alternas para motor, frenos, suspensión, sistema de enfriamiento y carrocería. Operamos desde Quito con envíos a todo el Ecuador en 24 a 72 horas. Los motores Ford más comunes en Ecuador son el 2.3L EcoBoost y el 2.5L NA — confirma el código de motor al cotizar porque los repuestos varían según el año y la versión del motor.",
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
      "En El Chino Americano tenemos repuestos para Chevrolet en Ecuador: D-MAX, Colorado, Blazer, Silverado, Captiva y Trailblazer. Manejamos piezas originales y OEM para motor, frenos, suspensión y sistema de enfriamiento. Operamos desde Quito con envíos a todo el Ecuador en 24 a 72 horas. Chevrolet es la marca americana con mayor presencia en Ecuador, lo que facilita la disponibilidad de repuestos OEM de calidad. Al cotizar confirma el modelo, año y si es diésel o gasolina — la D-MAX, por ejemplo, tiene versiones con motor 2.5L y 3.0L que usan repuestos distintos.",
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
      "En El Chino Americano tenemos repuestos para Great Wall en Ecuador: Wingle 5, Wingle 7 y los modelos Haval (H2, H6). Manejamos piezas para motor, frenos, suspensión y sistema de enfriamiento. Operamos desde Quito con envíos a todo el Ecuador. Great Wall y su marca Haval han crecido en Ecuador en los últimos años, pero algunos repuestos específicos pueden tener disponibilidad limitada — consulta antes de necesitarlos para evitar demoras. Los motores más comunes son el 2.0L GW4D20 (diésel) en la Wingle 5/7 y el 2.0T (turbo gasolina) en los Haval.",
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
      "En El Chino Americano tenemos repuestos para BYD en Ecuador: Song Plus, Atto 3, Dolphin, Seal y los modelos híbridos DMI. Manejamos piezas para el sistema de frenos, suspensión, carrocería y los sistemas convencionales de los modelos híbridos enchufables. Los vehículos eléctricos puros (como el Dolphin y el Atto 3) tienen sistemas de alta tensión que requieren servicio especializado — para esos sistemas contáctanos y te orientamos. Para los sistemas convencionales (frenos, suspensión, carrocería), la disponibilidad es similar a otros modelos chinos.",
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
      "En El Chino Americano tenemos repuestos para MG en Ecuador: ZS, HS, RX5 y MG 5. Manejamos piezas para motor, frenos, suspensión y carrocería. Operamos desde Quito con envíos a todo el Ecuador. MG (propiedad de SAIC Motor desde 2007) usa plataformas compartidas con otros modelos del grupo, lo que facilita la disponibilidad de repuestos OEM. El modelo más vendido en Ecuador es el MG ZS con motor 1.5L NA — tiene buena disponibilidad de repuestos para los sistemas principales.",
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
      "En El Chino Americano tenemos repuestos para DFSK en Ecuador: Glory 580, Glory 500, C35 y Supercab. Manejamos piezas para motor, frenos, suspensión y carrocería. Operamos desde Quito con envíos a todo el Ecuador. DFSK (Dongfeng Sokon) tiene presencia en Ecuador principalmente con la línea Glory (SUVs) y los modelos de carga. Los repuestos para los modelos más vendidos tienen disponibilidad razonable — para modelos de carga o específicos, consulta disponibilidad antes de necesitarlos.",
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
]

// ─── GUÍAS GENERALES DE COMPRA ───────────────────────────────────────────────

const guiasCompra: Guia[] = [
  {
    slug: "repuestos-autos-chinos-ecuador",
    categoria: "compra",
    titulo: "¿Dónde comprar repuestos para autos chinos en Ecuador?",
    descripcion:
      "Guía completa para comprar repuestos de vehículos chinos (Chery, JAC, BYD, Great Wall, MG, DFSK) en Ecuador. Originales, OEM y alternos con envíos desde Quito.",
    respuesta_corta:
      "En El Chino Americano puedes comprar repuestos para los principales autos chinos en Ecuador: Chery, JAC, BYD, Great Wall (Haval), MG y DFSK. Tenemos piezas originales, OEM y alternas para motor, frenos, suspensión, sistema de enfriamiento y carrocería. Operamos desde Quito con envíos a todo el Ecuador en 24 a 72 horas. Puedes cotizar por WhatsApp con el modelo, año y descripción del repuesto. Si no tienes el número de parte, con el código de motor y año del vehículo lo identificamos.",
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
      "En El Chino Americano puedes comprar repuestos para los principales autos americanos en Ecuador: Ford (Ranger, F-150, Explorer), Chevrolet (D-MAX, Colorado, Blazer, Silverado), Dodge, Jeep y Ram. Tenemos piezas originales, OEM y alternas para motor, frenos, suspensión y carrocería. Operamos desde Quito con envíos a todo el Ecuador en 24 a 72 horas. Al cotizar confirma el modelo, año y si el motor es diésel o gasolina — especialmente importante para la D-MAX y el Ranger, que tienen varias versiones de motor.",
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
]

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export const guias: Guia[] = [...guiasProblemas, ...guiasMarcas, ...guiasCompra]

export function getGuiaBySlug(categoria: string, slug: string): Guia | undefined {
  return guias.find((g) => g.categoria === categoria && g.slug === slug)
}

export function getGuiasByCategoria(categoria: GuiaCategoria): Guia[] {
  return guias.filter((g) => g.categoria === categoria)
}
