import { Suspense } from "react"
import CatalogoClient from "./CatalogoClient"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function CatalogoPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center">
            <div className="text-slate-400 text-sm">Cargando catálogo...</div>
          </main>
        }
      >
        <CatalogoClient />
      </Suspense>
      <Footer />
    </>
  )
}
