import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import WhyUs from "@/components/WhyUs"
import CtaBand from "@/components/CtaBand"
import Brands from "@/components/Brands"
import Footer from "@/components/Footer"
import { getVisibleVehicleBrands } from "@/lib/db/vehicle-brands"

export const dynamic = "force-dynamic"

export default async function Home() {
  const brands = await getVisibleVehicleBrands()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyUs />
        <CtaBand />
        <Brands brands={brands} />
      </main>
      <Footer />
    </>
  )
}
