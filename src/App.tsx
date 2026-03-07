import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Search } from 'lucide-react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { PracticePage } from './components/PracticePage'

type Material = {
  id: string
  title: string
  speaker: string
  cover: string
  duration: string
}

const materials: Material[] = [
  { id: '1', title: 'The power of vulnerability', speaker: 'Brené Brown', cover: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500', duration: '20:18' },
  { id: '2', title: 'How great leaders inspire action', speaker: 'Simon Sinek', cover: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?w=500', duration: '18:04' },
  { id: '3', title: 'Do schools kill creativity?', speaker: 'Sir Ken Robinson', cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500', duration: '19:16' },
  { id: '4', title: 'Your body language may shape who you are', speaker: 'Amy Cuddy', cover: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500', duration: '21:02' }
]

function HomePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [headerOpacity, setHeaderOpacity] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 1200)
    const onScroll = () => {
      const progress = Math.min(window.scrollY / 120, 1)
      setHeaderOpacity(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const filtered = materials.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="page home-page">
      <header className="immersive-header" style={{ backgroundColor: `rgba(15,23,42,${0.35 + headerOpacity * 0.55})` }}>
        <h1>EchoFlow</h1>
      </header>
      <div className="search-wrap" onClick={() => inputRef.current?.focus()}>
        <Search size={18} />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索 TED 素材"
          aria-label="搜索素材"
        />
      </div>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 />
            </motion.div>
            <span>素材加载中...</span>
          </motion.div>
        ) : (
          <motion.div key="content" className="waterfall-grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            {filtered.map((item, index) => (
              <Link key={item.id} to={`/practice/${item.id}`} className={`card ${index % 3 === 0 ? 'tall' : ''}`}>
                <img src={item.cover} alt={item.title} />
                <div className="card-info">
                  <h3>{item.title}</h3>
                  <p>{item.speaker}</p>
                  <small>{item.duration}</small>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function App() {
  const [offline, setOffline] = useState(!navigator.onLine)
  const navigate = useNavigate()

  useEffect(() => {
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return (
    <>
      {offline && (
        <div className="offline-banner" role="status" onClick={() => navigate('/')}>
          离线模式：可继续练习已缓存素材
        </div>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/practice/:id" element={<PracticePage />} />
      </Routes>
    </>
  )
}
