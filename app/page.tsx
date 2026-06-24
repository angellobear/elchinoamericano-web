import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import WhyUs from "@/components/WhyUs"
import CtaBand from "@/components/CtaBand"
import Brands from "@/components/Brands"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyUs />
        <CtaBand />
        <Brands />
      </main>
      <Footer />
    </>
  )
}
