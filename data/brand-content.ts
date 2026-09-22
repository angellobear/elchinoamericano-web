// Contenido SEO por marca para /catalogo/marca/[brand]. Las marcas sin entrada usan el texto genérico.
export interface BrandFaq {
  question: string
  answer: string
}

export interface BrandContent {
  title: string
  metaDescription: string
  h1: string
  headerDescription: string
  introHeading: string
  intro: string[]
  faqs: BrandFaq[]
  guides: { titulo: string; href: string }[]
}

export const BRAND_CONTENT: Record<string, BrandContent> = {
  ford: {
    title: "Repuestos Ford en Ecuador | Explorer, Ranger, Escape, EcoSport",
    metaDescription:
      "Repuestos Ford originales, OEM y alternos para Explorer, Ranger, Escape, EcoSport, Edge y F-150. Tienda en Quito, envíos a todo Ecuador y asesoría por WhatsApp.",
    h1: "Repuestos Ford en Ecuador",
    headerDescription:
      "Originales, OEM y alternos para Explorer, Ranger, Escape, EcoSport, Edge, F-150 y más. Despacho desde Quito a todo el país.",
    introHeading: "Repuestos Ford en Quito y todo Ecuador",
    intro: [
      "Ford es la marca con más repuestos en nuestro catálogo. Trabajamos piezas originales, OEM y alternas de marcas reconocidas para los Ford que más circulan en Ecuador: Explorer, Ranger, Escape, EcoSport, Edge, F-150, Fiesta y Fusion.",
      "Encuentras suspensión y dirección (amortiguadores, terminales, axiales, rótulas), frenos, filtros de aceite, aire y cabina, bases de motor, poleas y piezas de enfriamiento. Cada ficha indica la calidad de la pieza, su marca y los modelos compatibles.",
      "Antes de despachar verificamos la compatibilidad con el año, la versión de motor y, si lo tienes, el número de parte o el VIN de tu Ford. Somos un almacén independiente en Quito y enviamos a Guayaquil, Cuenca, Ambato, Santo Domingo y todas las provincias en 24 a 72 horas, con guía rastreable.",
    ],
    faqs: [
      {
        question: "¿Qué repuestos Ford tienen disponibles?",
        answer:
          "Suspensión, dirección, frenos, filtros, motor y enfriamiento para Explorer, Ranger, Escape, EcoSport, Edge, F-150, Fiesta, Fusion y otros modelos Ford. Si no encuentras la pieza en el catálogo, escríbenos por WhatsApp y la cotizamos.",
      },
      {
        question: "¿Venden repuestos Ford originales o alternos?",
        answer:
          "Ambos. Cada ficha indica si la pieza es original, OEM o alterna. Para frenos, dirección y suspensión recomendamos original u OEM; en filtros y piezas de desgaste un alterno de marca reconocida rinde bien a menor precio.",
      },
      {
        question: "¿Hacen envíos de repuestos Ford a Guayaquil y otras ciudades?",
        answer:
          "Sí. Despachamos desde Quito a todo Ecuador en 24 a 72 horas según la ciudad, con guía de envío rastreable.",
      },
      {
        question: "¿Cómo sé si el repuesto sirve para mi Ford?",
        answer:
          "Envíanos por WhatsApp el modelo, año y motor de tu Ford, y si lo tienes el VIN de 17 caracteres o el número de parte. Verificamos la compatibilidad antes de confirmar el pedido.",
      },
      {
        question: "¿Son concesionario oficial Ford?",
        answer:
          "No. Somos un almacén independiente de repuestos en Quito. Para garantía de fábrica o piezas que requieren programación en concesionario, te recomendamos acudir a la red oficial.",
      },
    ],
    guides: [
      { titulo: "¿Dónde comprar repuestos Ford en Ecuador?", href: "/guias/marcas/repuestos-ford-ecuador" },
      { titulo: "¿Dónde comprar repuestos Ford en Quito?", href: "/guias/marcas/repuestos-ford-quito" },
      { titulo: "Problemas más comunes de los Ford en Ecuador", href: "/guias/problemas/problemas-comunes-ford-ecuador" },
    ],
  },
}

export function getGenericBrandFaqs(brandText: string): BrandFaq[] {
  return [
    {
      question: `¿Qué repuestos para ${brandText} están disponibles?`,
      answer: `Disponemos de repuestos originales, OEM y alternos para ${brandText} en Ecuador. Encuentra filtros, frenos, suspensión, motor y más en nuestro catálogo con envíos a todo el país.`,
    },
    {
      question: `¿Hacen envíos de repuestos para ${brandText} a todo Ecuador?`,
      answer:
        "Sí. Coordinamos envíos a Quito, Santo Domingo de los Tsáchilas y todo el Ecuador. Consúltanos por WhatsApp para disponibilidad y precio.",
    },
    {
      question: `¿Cómo verifico si el repuesto para ${brandText} es compatible con mi vehículo?`,
      answer:
        "Puedes escribirnos por WhatsApp con la marca, modelo, año y número de pieza o una foto del repuesto. También puedes buscar en el catálogo filtrando por categoría para confirmar compatibilidad.",
    },
  ]
}
