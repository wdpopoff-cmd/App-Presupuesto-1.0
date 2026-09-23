import { useState, useEffect } from 'react'
import { Dashboard }         from './pages/Dashboard'
import { NuevoPresupuesto }  from './pages/NuevoPresupuesto'
import { PresupuestoPDF }    from './components/PresupuestoPDF'
import { Historial }         from './pages/Historial'
import { Clientes }          from './pages/Clientes'
import { Precios }           from './pages/Precios'
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Users,
  Tag,
  Snowflake,
  ChevronLeft
} from 'lucide-react'

/* ──────────────────────────────────────────────────────────
   NAV CONFIG
────────────────────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'clientes',  label: 'Clientes',   icon: Users },
  { id: 'precios',   label: 'Precios',    icon: Tag },
  { id: 'historial', label: 'Historial',  icon: History },
]

/* ──────────────────────────────────────────────────────────
   AVATAR HELPERS
────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  'linear-gradient(135deg,#00d4aa,#7c3aed)',
  'linear-gradient(135deg,#7c3aed,#3b82f6)',
  'linear-gradient(135deg,#f59e0b,#f43f5e)',
  'linear-gradient(135deg,#3b82f6,#00d4aa)',
]

export function getAvatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

/* ──────────────────────────────────────────────────────────
   APP
────────────────────────────────────────────────────────── */
function App() {
  const [view, setView] = useState('dashboard')
  const [pdfData, setPdfData] = useState(null)
  const [presupuestoEditar, setPresupuestoEditar] = useState(null)

  const handleImprimir = (data) => {
    if (!data) return
    // Crear nueva referencia de objeto para forzar re-render de PDF e impresión
    setPdfData({ ...data, _timestamp: Date.now() })
  }

  // Efecto de impresión con limpieza automática de pdfData
  useEffect(() => {
    if (pdfData) {
      const timer = setTimeout(() => {
        window.print()
      }, 300)

      const handleAfterPrint = () => {
        setPdfData(null)
      }

      window.addEventListener('afterprint', handleAfterPrint)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('afterprint', handleAfterPrint)
      }
    }
  }, [pdfData])

  const abrirNuevoPresupuesto = (paraEditar = null) => {
    setPresupuestoEditar(paraEditar)
    setView('nuevo')
  }

  // Vista activa en la sidebar
  const activeNav = NAV.find(n => n.id === view)?.id ?? 'dashboard'
  const isSubpage = view === 'nuevo'

  return (
    <>
      {/* ── ZONA IMPRESIÓN ── */}
      {pdfData && <PresupuestoPDF data={pdfData} />}

      {/* ── APP UI ── */}
      <div className="app-layout no-print">

        {/* ════════════════════════════════
            SIDEBAR — Desktop
        ════════════════════════════════ */}
        <aside className="sidebar" role="navigation" aria-label="Navegación principal">
          {/* Logo */}
          <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => setView('dashboard')}>
            <div className="logo-icon" aria-hidden="true">
              <Snowflake size={20} color="white" strokeWidth={2.5} />
            </div>
            <div className="logo-text">
              <strong>WP</strong>
              <span>Refrigeración</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="sidebar-nav">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item${activeNav === id && !isSubpage ? ' active' : ''}`}
                onClick={() => setView(id)}
                aria-current={activeNav === id && !isSubpage ? 'page' : undefined}
              >
                <span className="nav-icon"><Icon size={18} strokeWidth={1.75} /></span>
                {label}
              </button>
            ))}

            {/* Separador */}
            <div className="divider" style={{ margin: '0.75rem 0' }} />

            {/* Nuevo presupuesto destacado */}
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: '0.25rem' }}
              onClick={() => abrirNuevoPresupuesto(null)}
            >
              <PlusCircle size={16} strokeWidth={2.5} />
              Nuevo presupuesto
            </button>
          </nav>

          {/* Footer sidebar */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              WP Refrigeración<br />
              <span style={{ opacity: 0.5 }}>v1.0</span>
            </p>
          </div>
        </aside>

        {/* ════════════════════════════════
            MOBILE HEADER
        ════════════════════════════════ */}
        <header className="mobile-header" aria-label="Encabezado">
          {isSubpage ? (
            <button
              className="btn btn-ghost"
              onClick={() => setView('dashboard')}
              aria-label="Volver"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <div className="sidebar-logo" style={{ margin: 0, cursor: 'pointer' }} onClick={() => setView('dashboard')}>
              <div className="logo-icon" style={{ width: 32, height: 32 }}>
                <Snowflake size={16} color="white" strokeWidth={2.5} />
              </div>
              <div className="logo-text">
                <strong style={{ fontSize: '0.85rem' }}>WP</strong>
                <span style={{ fontSize: '0.62rem' }}>Refrigeración</span>
              </div>
            </div>
          )}
          <h2 style={{ fontSize: '1rem', margin: 0 }}>
            {view === 'dashboard'  && 'Dashboard'}
            {view === 'nuevo'      && (presupuestoEditar ? 'Editar Presupuesto' : 'Nuevo Presupuesto')}
            {view === 'clientes'   && 'Clientes'}
            {view === 'precios'    && 'Precios'}
            {view === 'historial'  && 'Historial'}
          </h2>
          <div style={{ width: 40 }} /> {/* spacer */}
        </header>

        {/* ════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════ */}
        <main className="main-content" role="main">
          {view === 'dashboard' && <Dashboard  setView={setView} onNuevo={abrirNuevoPresupuesto} onImprimir={handleImprimir} />}
          {view === 'nuevo'     && <NuevoPresupuesto setView={setView} presupuestoInicial={presupuestoEditar} onImprimir={handleImprimir} />}
          {view === 'clientes'  && <Clientes   setView={setView} onNuevoPresupuesto={abrirNuevoPresupuesto} />}
          {view === 'precios'   && <Precios    setView={setView} />}
          {view === 'historial' && <Historial  setView={setView} onEditar={abrirNuevoPresupuesto} setPdfData={handleImprimir} />}
        </main>

        {/* ════════════════════════════════
            BOTTOM NAV — Mobile
        ════════════════════════════════ */}
        <nav className="bottom-nav" aria-label="Navegación inferior">
          <div className="bottom-nav-inner">
            {/* Dashboard */}
            <button
              id="bnav-dashboard"
              className={`bottom-nav-btn${activeNav === 'dashboard' && !isSubpage ? ' active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              <LayoutDashboard size={22} strokeWidth={1.75} />
              <span>Inicio</span>
            </button>

            {/* Historial */}
            <button
              id="bnav-historial"
              className={`bottom-nav-btn${activeNav === 'historial' ? ' active' : ''}`}
              onClick={() => setView('historial')}
            >
              <History size={22} strokeWidth={1.75} />
              <span>Historial</span>
            </button>

            {/* FAB — Nuevo Presupuesto */}
            <button
              id="bnav-nuevo"
              className="bottom-nav-btn fab"
              onClick={() => setView('nuevo')}
              aria-label="Nuevo presupuesto"
            >
              <PlusCircle size={26} strokeWidth={2} />
            </button>

            {/* Clientes */}
            <button
              id="bnav-clientes"
              className={`bottom-nav-btn${activeNav === 'clientes' ? ' active' : ''}`}
              onClick={() => setView('clientes')}
            >
              <Users size={22} strokeWidth={1.75} />
              <span>Clientes</span>
            </button>

            {/* Precios */}
            <button
              id="bnav-precios"
              className={`bottom-nav-btn${activeNav === 'precios' ? ' active' : ''}`}
              onClick={() => setView('precios')}
            >
              <Tag size={22} strokeWidth={1.75} />
              <span>Precios</span>
            </button>
          </div>
        </nav>

      </div>
    </>
  )
}

export default App
