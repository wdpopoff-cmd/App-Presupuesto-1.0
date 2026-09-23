import { useState } from 'react'
import {
  PlusCircle, FileText, Users, Tag, History,
  Share2, TrendingUp, DollarSign, ClipboardList,
  ChevronRight, Snowflake
} from 'lucide-react'
import { useDataStore }       from '../hooks/useDataStore'
import { compartirPresupuesto } from '../utils/shareUtils'
import { getAvatarColor, getInitials } from '../App'

/* ──────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────── */
function formatMoney(n = 0) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function getMonthTotal(presupuestos) {
  const now = new Date()
  return presupuestos
    .filter(p => {
      const d = new Date(p.fecha)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((acc, p) => acc + (p.total || 0), 0)
}

function getMonthCount(presupuestos) {
  const now = new Date()
  return presupuestos.filter(p => {
    const d = new Date(p.fecha)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
}

/* ──────────────────────────────────────────────────────────
   DASHBOARD
────────────────────────────────────────────────────────── */
export function Dashboard({ setView, onNuevo, onImprimir }) {
  const { presupuestos, clientes } = useDataStore()

  const recientes    = [...presupuestos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  const mesTotal     = getMonthTotal(presupuestos)
  const mesCant      = getMonthCount(presupuestos)
  const totalClientes = clientes.length

  // Nombre del mes actual
  const mesNombre = new Date().toLocaleDateString('es-AR', { month: 'long' })

  const handleNuevoClick = () => {
    if (onNuevo) onNuevo(null)
    else setView('nuevo')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="animate-fade-up">

      {/* ── GREETING ── */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Dashboard <span style={{ color: 'var(--accent-green)' }}>❄</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── KPI GRID ── */}
      <div
        className="kpi-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}
      >
        <div className="kpi-card animate-fade-up delay-1">
          <div className="kpi-icon green"><DollarSign size={18} strokeWidth={2} /></div>
          <div className="kpi-value">{formatMoney(mesTotal)}</div>
          <div className="kpi-label">Total {mesNombre}</div>
        </div>

        <div className="kpi-card animate-fade-up delay-2">
          <div className="kpi-icon purple"><ClipboardList size={18} strokeWidth={2} /></div>
          <div className="kpi-value">{mesCant}</div>
          <div className="kpi-label">Presupuestos</div>
        </div>

        <div className="kpi-card animate-fade-up delay-3">
          <div className="kpi-icon blue"><Users size={18} strokeWidth={2} /></div>
          <div className="kpi-value">{totalClientes}</div>
          <div className="kpi-label">Clientes</div>
        </div>
      </div>

      {/* ── CTA PRINCIPAL ── */}
      <button
        id="btn-nuevo-presupuesto"
        className="btn btn-primary btn-large btn-full animate-fade-up delay-2"
        onClick={handleNuevoClick}
        style={{
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1.75rem',
          background: 'linear-gradient(135deg, var(--accent-green) 0%, #00bfa0 50%, var(--accent-purple) 100%)',
          animation: 'pulse-glow 3s ease-in-out infinite',
          boxShadow: '0 4px 32px rgba(0,212,170,0.3)',
        }}
      >
        <PlusCircle size={36} strokeWidth={2} />
        <span style={{ fontSize: '1.125rem', letterSpacing: '0.04em' }}>NUEVO PRESUPUESTO</span>
      </button>

      {/* ── RECIENTES ── */}
      <div className="animate-fade-up delay-3">
        <div className="section-header">
          <span className="section-title">Recientes</span>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', color: 'var(--accent-green)', padding: '0.25rem 0.5rem', gap: '0.25rem' }}
            onClick={() => setView('historial')}
          >
            Ver todos <ChevronRight size={14} />
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {recientes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ color: 'var(--text-sub)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Sin presupuestos todavía
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Creá tu primer presupuesto con el botón de arriba
                </p>
              </div>
            </div>
          ) : (
            <table className="dark-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((p, i) => (
                  <tr key={p.id}>
                    {/* Número */}
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                        {p.numero || `#0000`}
                      </span>
                    </td>

                    {/* Cliente con avatar */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div
                          className="avatar"
                          style={{ background: getAvatarColor(p.cliente?.nombre), width: 30, height: 30, fontSize: '0.65rem' }}
                        >
                          {getInitials(p.cliente?.nombre)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                          {p.cliente?.nombre || 'Cliente Final'}
                        </span>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(p.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </td>

                    {/* Total */}
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-green)' }}>
                      ${(p.total || 0).toLocaleString('es-AR')}
                    </td>

                    {/* Acciones */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '0.25rem 0.4rem' }}
                          onClick={() => compartirPresupuesto(p)}
                          title="Compartir por WhatsApp"
                        >
                          <Share2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '0.25rem 0.4rem', color: 'var(--accent-green)' }}
                          onClick={() => onImprimir && onImprimir(p)}
                          title="Imprimir PDF"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── ACCESOS SECUNDARIOS ── */}
      <div className="animate-fade-up delay-4">
        <div className="section-header">
          <span className="section-title">Accesos rápidos</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>

          <button
            id="quick-clientes"
            className="card card-interactive"
            style={{ border: 'none', cursor: 'pointer', textAlign: 'center', padding: '1.25rem 0.75rem', background: 'var(--bg-card)' }}
            onClick={() => setView('clientes')}
          >
            <div className="kpi-icon blue" style={{ margin: '0 auto 0.75rem' }}>
              <Users size={20} strokeWidth={1.75} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)' }}>Clientes</div>
          </button>

          <button
            id="quick-precios"
            className="card card-interactive"
            style={{ border: 'none', cursor: 'pointer', textAlign: 'center', padding: '1.25rem 0.75rem', background: 'var(--bg-card)' }}
            onClick={() => setView('precios')}
          >
            <div className="kpi-icon purple" style={{ margin: '0 auto 0.75rem' }}>
              <Tag size={20} strokeWidth={1.75} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)' }}>Precios</div>
          </button>

          <button
            id="quick-historial"
            className="card card-interactive"
            style={{ border: 'none', cursor: 'pointer', textAlign: 'center', padding: '1.25rem 0.75rem', background: 'var(--bg-card)' }}
            onClick={() => setView('historial')}
          >
            <div className="kpi-icon green" style={{ margin: '0 auto 0.75rem' }}>
              <History size={20} strokeWidth={1.75} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)' }}>Historial</div>
          </button>

        </div>
      </div>

    </div>
  )
}
