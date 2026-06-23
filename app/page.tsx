import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import WhyUs from "@/components/WhyUs"
import AboutUs from "@/components/AboutUs"
import FindPart from "@/components/FindPart"
import Brands from "@/components/Brands"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyUs />
        <AboutUs />
        <FindPart />
        <Brands />
      </main>
      <Footer />
    </>
  )
}
