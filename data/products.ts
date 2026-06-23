import { Product, Category, PartBrand, VehicleBrand } from "@/types"

// Shared category stubs for mock data
const CAT: Record<string, Category> = {
  motor:        { id: 1, key: 'motor',        name: 'Motor',                   sort_order: 1, is_active: true },
  frenos:       { id: 2, key: 'frenos',       name: 'Frenos',                  sort_order: 2, is_active: true },
  suspension:   { id: 3, key: 'suspension',   name: 'Suspensión y Dirección',  sort_order: 3, is_active: true },
  filtros:      { id: 4, key: 'filtros',      name: 'Filtros',                 sort_order: 4, is_active: true },
  carroceria:   { id: 5, key: 'carroceria',   name: 'Carrocería',              sort_order: 5, is_active: true },
  enfriamiento: { id: 6, key: 'enfriamiento', name: 'Sistema de Enfriamiento', sort_order: 6, is_active: true },
}

// Shared vehicle brand stubs
const VB: Record<string, VehicleBrand> = {
  great_wall: { id: 2, name: 'Great Wall', origin: 'chinese',  sort_order: 2, is_active: true },
  ford:       { id: 9, name: 'Ford',       origin: 'american', sort_order: 9, is_active: true },
  chery:      { id: 1, name: 'Chery',      origin: 'chinese',  sort_order: 1, is_active: true },
  chevrolet:  { id: 10, name: 'Chevrolet', origin: 'american', sort_order: 10, is_active: true },
  dfsk:       { id: 4, name: 'DFSK',       origin: 'chinese',  sort_order: 4, is_active: true },
  byd:        { id: 3, name: 'BYD',        origin: 'chinese',  sort_order: 3, is_active: true },
  mg:         { id: 7, name: 'MG',         origin: 'chinese',  sort_order: 7, is_active: true },
  jac:        { id: 8, name: 'JAC',        origin: 'chinese',  sort_order: 8, is_active: true },
}

function pb(id: number, name: string): PartBrand {
  return { id, name, is_active: true }
}

export const products: Product[] = [
  {
    id: 1, code: 'CA-0001', slug: 'bomba-de-agua-mgt-magiaty-great-wall-wingle-5',
    title: 'Bomba de agua', short_title: 'Bomba de agua',
    short_description: 'Great Wall Wingle 5 2.2 · 2016-19',
    price: 48.0, stock: 10, type: 'original', is_featured: true, is_active: true,
    category: CAT.enfriamiento, part_brand: pb(12, 'MGT Magiaty'),
    description: 'La bomba de agua MGT Magiaty para Great Wall Wingle 5 garantiza la circulación óptima del refrigerante en todo el circuito de enfriamiento del motor. Fabricada con materiales de alta durabilidad y sellados de precisión, previene el sobrecalentamiento y prolonga la vida útil del motor. Recomendada para mantenimiento preventivo cada 80.000 km.',
    specs: [
      { label: 'Marca', value: 'MGT Magiaty' }, { label: 'Tipo', value: 'Bomba de agua mecánica' },
      { label: 'Material cuerpo', value: 'Aluminio fundido a presión' }, { label: 'Diámetro impulsor', value: '68 mm' },
      { label: 'Incluye', value: 'Bomba + junta de sellado' }, { label: 'Intervalo de cambio', value: 'Cada 80.000 km' },
    ],
    compatibilities: [{ product_id: 1, vehicle_model_id: 3, model: { id: 3, brand_id: 2, name: 'Wingle 5', displacement: '2.2', fuel_type: 'gasoline', year_start: 2016, year_end: 2019, is_active: true, brand: VB.great_wall } }],
  },
  {
    id: 2, code: 'CA-0002', slug: 'kit-frenos-trasero-brembo-ford-f150',
    title: 'Kit de frenos trasero', short_title: 'Kit frenos trasero',
    short_description: 'Ford F-150 · 2018-2022',
    price: 35.0, stock: 8, type: 'aftermarket', is_featured: false, is_active: true,
    category: CAT.frenos, part_brand: pb(3, 'Brembo'),
    description: 'Kit de frenos trasero Brembo de alto rendimiento para Ford F-150. Brembo, líder mundial en sistemas de frenado, ofrece en este kit una respuesta de frenado progresiva y eficiente. Las pastillas de bajo polvo metálico garantizan mínima abrasión en los discos y larga vida útil.',
    specs: [
      { label: 'Marca', value: 'Brembo' }, { label: 'Posición', value: 'Trasero' },
      { label: 'Material pastillas', value: 'Semimetálico bajo polvo' }, { label: 'Temperatura máx.', value: '500 °C' },
      { label: 'Incluye', value: '4 pastillas + accesorios de montaje' }, { label: 'Certificación', value: 'ECE R-90' },
    ],
    compatibilities: [{ product_id: 2, vehicle_model_id: 9, model: { id: 9, brand_id: 9, name: 'F-150', displacement: '3.5', fuel_type: 'gasoline', year_start: 2018, year_end: 2022, is_active: true, brand: VB.ford } }],
  },
  {
    id: 3, code: 'CA-0003', slug: 'filtro-de-aceite-sakura-chery-tiggo-5',
    title: 'Filtro de aceite', short_title: 'Filtro de aceite',
    short_description: 'Chery Tiggo 5 2.0 · 2019-23',
    price: 12.5, stock: 25, type: 'oem', is_featured: false, is_active: true,
    category: CAT.filtros, part_brand: pb(9, 'Sakura'),
    description: 'Filtro de aceite Sakura para Chery Tiggo 5 2.0, diseñado bajo especificaciones OEM originales. El filtrado de alta eficiencia retiene partículas mayores a 15 micras, protegiendo los componentes internos del motor contra el desgaste prematuro.',
    specs: [
      { label: 'Marca', value: 'Sakura' }, { label: 'Tipo', value: 'Cartucho de papel plisado' },
      { label: 'Diámetro exterior', value: '76 mm' }, { label: 'Altura', value: '90 mm' },
      { label: 'Eficiencia filtrado', value: '> 99% (15 micras)' }, { label: 'Presión apertura válvula', value: '1.0 – 1.5 bar' },
    ],
    compatibilities: [{ product_id: 3, vehicle_model_id: 1, model: { id: 1, brand_id: 1, name: 'Tiggo 5', displacement: '2.0', fuel_type: 'gasoline', year_start: 2019, year_end: 2023, is_active: true, brand: VB.chery } }],
  },
  {
    id: 4, code: 'CA-0004', slug: 'terminal-de-direccion-moog-silverado',
    title: 'Terminal de dirección', short_title: 'Terminal de dirección',
    short_description: 'Chevrolet Silverado · 2019-22',
    price: 22.0, stock: 5, type: 'aftermarket', is_featured: false, is_active: true,
    category: CAT.suspension, part_brand: pb(10, 'Moog'),
    description: 'Terminal de dirección Moog para Chevrolet Silverado, referencia reconocida en el mercado de suspensión y dirección. El diseño mejorado con rótula de acero forjado y bota de neopreno garantiza mayor durabilidad frente al repuesto original.',
    specs: [
      { label: 'Marca', value: 'Moog' }, { label: 'Posición', value: 'Lado derecho e izquierdo (unidad)' },
      { label: 'Material rótula', value: 'Acero forjado 1045' }, { label: 'Bota', value: 'Neopreno resistente UV' },
      { label: 'Lubricación', value: 'Precargada, tapón de engrase' }, { label: 'Torque de apriete', value: '50 N·m' },
    ],
    compatibilities: [{ product_id: 4, vehicle_model_id: 12, model: { id: 12, brand_id: 10, name: 'Silverado', displacement: '5.3', fuel_type: 'gasoline', year_start: 2019, year_end: 2022, is_active: true, brand: VB.chevrolet } }],
  },
  {
    id: 5, code: 'CA-0005', slug: 'bujia-encendido-ngk-dfsk-glory-580',
    title: 'Bujía de encendido', short_title: 'Bujía de encendido',
    short_description: 'DFSK Glory 580 1.5T · 2020-23',
    price: 8.0, stock: 40, type: 'original', is_featured: false, is_active: true,
    category: CAT.motor, part_brand: pb(2, 'NGK'),
    description: 'Bujía de encendido NGK iridium para DFSK Glory 580 1.5T. El electrodo de iridio de 0.6 mm de diámetro ofrece chispa más concentrada y encendido más eficiente comparado con bujías estándar de cobre.',
    specs: [
      { label: 'Marca', value: 'NGK' }, { label: 'Serie', value: 'Iridium IX' },
      { label: 'Diámetro electrodo', value: '0.6 mm iridio' }, { label: 'Gap', value: '0.9 mm' },
      { label: 'Rosca', value: 'M14 × 1.25' }, { label: 'Intervalo de cambio', value: 'Cada 60.000 km' },
    ],
    compatibilities: [{ product_id: 5, vehicle_model_id: 6, model: { id: 6, brand_id: 4, name: 'Glory 580', displacement: '1.5', fuel_type: 'gasoline', year_start: 2020, year_end: 2023, is_active: true, brand: VB.dfsk } }],
  },
  {
    id: 6, code: 'CA-0006', slug: 'amortiguador-delantero-monroe-byd-song-plus',
    title: 'Amortiguador delantero', short_title: 'Amortiguador delantero',
    short_description: 'BYD Song Plus · 2021-24',
    price: 65.0, stock: 3, type: 'aftermarket', is_featured: false, is_active: true,
    category: CAT.suspension, part_brand: pb(4, 'Monroe'),
    description: 'Amortiguador delantero Monroe OESpectrum para BYD Song Plus. La tecnología de gas presurizado a 15 bar garantiza estabilidad y control en todo tipo de superficies. Diseñado específicamente para vehículos eléctricos e híbridos enchufables.',
    specs: [
      { label: 'Marca', value: 'Monroe' }, { label: 'Serie', value: 'OESpectrum' },
      { label: 'Tipo', value: 'Gas monotubo presurizado' }, { label: 'Presión de gas', value: '15 bar nitrógeno' },
      { label: 'Posición', value: 'Delantero (unidad)' }, { label: 'Garantía', value: '2 años / 50.000 km' },
    ],
    compatibilities: [{ product_id: 6, vehicle_model_id: 5, model: { id: 5, brand_id: 3, name: 'Song Plus', displacement: '1.5', fuel_type: 'hybrid', year_start: 2021, year_end: null, is_active: true, brand: VB.byd } }],
  },
  {
    id: 7, code: 'CA-0007', slug: 'radiador-de-agua-denso-ford-ranger',
    title: 'Radiador de agua', short_title: 'Radiador de agua',
    short_description: 'Ford Ranger 2.5 · 2016-20',
    price: 120.0, stock: 2, type: 'original', is_featured: true, is_active: true,
    category: CAT.enfriamiento, part_brand: pb(6, 'Denso'),
    description: 'Radiador Denso OEM para Ford Ranger 2.5, fabricado bajo los mismos estándares de calidad que el equipo original de fábrica. Las aletas de aluminio de alta densidad maximizan la disipación de calor.',
    specs: [
      { label: 'Marca', value: 'Denso' }, { label: 'Material núcleo', value: 'Aluminio de alta densidad' },
      { label: 'Material tanques', value: 'Plástico PA-66 reforzado' }, { label: 'Dimensiones', value: '660 × 390 × 26 mm' },
      { label: 'Capacidad refrigerante', value: '3.8 litros' }, { label: 'Presión de prueba', value: '1.5 bar' },
    ],
    compatibilities: [{ product_id: 7, vehicle_model_id: 10, model: { id: 10, brand_id: 9, name: 'Ranger', displacement: '2.5', fuel_type: 'gasoline', year_start: 2016, year_end: 2020, is_active: true, brand: VB.ford } }],
  },
  {
    id: 8, code: 'CA-0008', slug: 'pastillas-freno-delanteras-ferodo-chery-arrizo-5',
    title: 'Pastillas de freno delanteras', short_title: 'Pastillas de freno',
    short_description: 'Chery Arrizo 5 · 2018-23',
    price: 28.0, stock: 15, type: 'aftermarket', is_featured: false, is_active: true,
    category: CAT.frenos, part_brand: pb(7, 'Ferodo'),
    description: 'Pastillas de freno delanteras Ferodo DS Performance para Chery Arrizo 5. La fórmula de fricción NAO ofrece respuesta de frenado progresiva y silenciosa desde temperatura ambiente.',
    specs: [
      { label: 'Marca', value: 'Ferodo' }, { label: 'Serie', value: 'DS Performance' },
      { label: 'Material', value: 'NAO orgánico bajo polvo' }, { label: 'Temperatura máx.', value: '400 °C' },
      { label: 'Incluye', value: '2 pastillas delanteras + clips' }, { label: 'Indicador de desgaste', value: 'Sonoro integrado' },
    ],
    compatibilities: [{ product_id: 8, vehicle_model_id: 2, model: { id: 2, brand_id: 1, name: 'Arrizo 5', displacement: '1.5', fuel_type: 'gasoline', year_start: 2018, year_end: 2023, is_active: true, brand: VB.chery } }],
  },
  {
    id: 9, code: 'CA-0009', slug: 'correa-distribucion-gates-mg-zs',
    title: 'Correa de distribución', short_title: 'Correa de distribución',
    short_description: 'MG ZS 1.5 · 2020-24',
    price: 45.0, stock: 7, type: 'oem', is_featured: false, is_active: true,
    category: CAT.motor, part_brand: pb(5, 'Gates'),
    description: 'Correa de distribución Gates PowerGrip para MG ZS 1.5. Gates utiliza un compuesto de EPDM de alta resistencia al calor y ozono. Garantiza sincronización exacta del árbol de levas durante todo el intervalo de cambio.',
    specs: [
      { label: 'Marca', value: 'Gates' }, { label: 'Serie', value: 'PowerGrip GT3' },
      { label: 'Material', value: 'EPDM reforzado con fibra de vidrio' }, { label: 'Dientes', value: '109 dientes' },
      { label: 'Ancho', value: '19 mm' }, { label: 'Intervalo de cambio', value: 'Cada 60.000 km o 5 años' },
    ],
    compatibilities: [{ product_id: 9, vehicle_model_id: 7, model: { id: 7, brand_id: 7, name: 'ZS', displacement: '1.5', fuel_type: 'gasoline', year_start: 2020, year_end: null, is_active: true, brand: VB.mg } }],
  },
  {
    id: 10, code: 'CA-0010', slug: 'espejo-retrovisor-derecho-tyc-chevrolet-blazer',
    title: 'Espejo retrovisor derecho', short_title: 'Espejo retrovisor',
    short_description: 'Chevrolet Blazer · 2019-23',
    price: 55.0, stock: 1, type: 'aftermarket', is_featured: false, is_active: true,
    category: CAT.carroceria, part_brand: pb(11, 'TYC'),
    description: 'Espejo retrovisor lateral derecho TYC para Chevrolet Blazer, fabricado con la misma ingeniería de moldeo que el equipo original. Incluye luna con recubrimiento de baja reflexión, motor eléctrico de ajuste y calefacción integrada.',
    specs: [
      { label: 'Marca', value: 'TYC' }, { label: 'Lado', value: 'Derecho (copiloto)' },
      { label: 'Color', value: 'Sin pintar (preparado)' }, { label: 'Ajuste', value: 'Eléctrico 3 vías' },
      { label: 'Calefacción', value: 'Sí, integrada' }, { label: 'Conexión', value: 'Plug & Play OEM' },
    ],
    compatibilities: [{ product_id: 10, vehicle_model_id: 13, model: { id: 13, brand_id: 10, name: 'Blazer', displacement: '2.0', fuel_type: 'gasoline', year_start: 2019, year_end: 2023, is_active: true, brand: VB.chevrolet } }],
  },
  {
    id: 11, code: 'CA-0011', slug: 'filtro-de-aire-mann-jac-t8',
    title: 'Filtro de aire', short_title: 'Filtro de aire',
    short_description: 'JAC T8 2.0T · 2020-24',
    price: 18.0, stock: 12, type: 'oem', is_featured: false, is_active: true,
    category: CAT.filtros, part_brand: pb(8, 'Mann'),
    description: 'Filtro de aire Mann-Filter para JAC T8 2.0T. El papel filtrante acordeonado garantiza captura del 99.5% de partículas mayores a 10 micras, protegiendo el turbocompresor y la cámara de combustión.',
    specs: [
      { label: 'Marca', value: 'Mann-Filter' }, { label: 'Referencia', value: 'C 28 050' },
      { label: 'Tipo', value: 'Panel plano plisado' }, { label: 'Eficiencia filtrado', value: '99.5% (10 micras)' },
      { label: 'Dimensiones', value: '310 × 200 × 35 mm' }, { label: 'Intervalo de cambio', value: 'Cada 30.000 km' },
    ],
    compatibilities: [{ product_id: 11, vehicle_model_id: 8, model: { id: 8, brand_id: 8, name: 'T8', displacement: '2.0', fuel_type: 'gasoline', year_start: 2020, year_end: null, is_active: true, brand: VB.jac } }],
  },
  {
    id: 12, code: 'CA-0012', slug: 'sensor-de-oxigeno-bosch-ford-explorer',
    title: 'Sensor de oxígeno', short_title: 'Sensor de oxígeno',
    short_description: 'Ford Explorer 2.3 · 2017-21',
    price: 72.0, stock: 4, type: 'original', is_featured: true, is_active: true,
    category: CAT.motor, part_brand: pb(1, 'Bosch'),
    description: 'Sensor de oxígeno Bosch OEM para Ford Explorer 2.3 EcoBoost. Bosch, inventor de la sonda lambda, utiliza en este sensor cerámica de zirconia con platino para respuesta ultrarrápida al cambio de mezcla.',
    specs: [
      { label: 'Marca', value: 'Bosch' }, { label: 'Tipo', value: 'Banda ancha (wideband) 4 cables' },
      { label: 'Elemento sensor', value: 'Zirconia de óxido con platino' }, { label: 'Temperatura operación', value: '300 – 850 °C' },
      { label: 'Tiempo de calentamiento', value: '< 10 segundos' }, { label: 'Posición', value: 'Upstream (antes del catalizador)' },
    ],
    compatibilities: [{ product_id: 12, vehicle_model_id: 11, model: { id: 11, brand_id: 9, name: 'Explorer', displacement: '2.3', fuel_type: 'gasoline', year_start: 2017, year_end: 2021, is_active: true, brand: VB.ford } }],
  },
]
