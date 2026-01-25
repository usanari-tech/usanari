import BakeryHero from './components/BakeryHero'
import StorySection from './components/StorySection'
import LineupSection from './components/LineupSection'
import ShopAccessSection from './components/ShopAccessSection'

function App() {
  return (
    <div className="selection:bg-bakery-toast/30">
      <BakeryHero />
      <StorySection />
      <LineupSection />
      <ShopAccessSection />

      <footer className="bg-white/50 dark:bg-black/50 py-16 text-center border-t border-primary/10">
        <p className="text-[10px] tracking-[0.5em] text-primary/40 uppercase font-medium">
          © 2024 ARTISAN BAKERY. CRAFTED WITH CARE.
        </p>
      </footer>
    </div>
  )
}

export default App
