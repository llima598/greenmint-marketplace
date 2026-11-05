import Header from './components/Header'
import Hero from './components/Hero'
import Products from './components/Products'
import Promos from './components/Promos'
import Journal from './components/Journal'
import Footer from './components/Footer'

function App() {
  return (
    <main className="min-h-screen bg-[#140D0A] px-6 text-white md:px-12 xl:px-[120px]">
      <Header />
      <Hero />
      <Products />
      <Promos />
      <Journal />
      <Footer />
    </main>
  )
}

export default App