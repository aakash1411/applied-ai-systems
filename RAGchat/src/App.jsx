import Layout from './components/Layout'
import Hero from './components/Landing/Hero'
import Overview from './components/Landing/Overview'
import ArchitectureGrid from './components/Playground/ArchitectureGrid'

export default function App() {
  const scrollToPlayground = () => {
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Layout>
      <Hero onTryRag={scrollToPlayground} />
      <Overview />
      <ArchitectureGrid />
    </Layout>
  )
}
