import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { guias, CATEGORIAS, type GuiaCategoria } from "@/data/guias"
import { SITE_NAME, SITE_URL, buildCatalogMetadata } from "@/lib/seo"

type Props = { params: Promise<{ categoria: string }> }

export async function generateStaticParams() {
  return (Object.keys(CATEGORIAS) as GuiaCategoria[]).map((cat) => ({ categoria: cat }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params
  const info = CATEGORIAS[categoria as GuiaCategoria]
  if (!info) return {}
  return buildCatalogMetadata(
    `${info.label} — Guías | ${SITE_NAME}`,
    info.descripcion,
    `/guias/${categoria}`,
  )
}

export default async function GuiasCategoriaPage({ params }: Props) {
  const { categoria } = await params
  const info = CATEGORIAS[categoria as GuiaCategoria]
  if (!info) notFound()

  const guiasCat = guias.filter((g) => g.categoria === categoria)

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href="/guias" className="hover:underline">Guías</Link>
        <span className="mx-2">/</span>
        <span>{info.label}</span>
      </nav>

      <h1 className="mb-3 text-3xl font-bold text-navy">{info.label}</h1>
      <p className="mb-10 text-lg text-gray-600">{info.descripcion}</p>

      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {guiasCat.map((guia) => (
          <li key={guia.slug}>
            <Link
              href={`/guias/${guia.categoria}/${guia.slug}`}
              className="block px-5 py-4 hover:bg-gray-50"
            >
              <p className="font-medium text-navy">{guia.titulo}</p>
              <p className="mt-0.5 text-sm text-gray-500">{guia.descripcion}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
