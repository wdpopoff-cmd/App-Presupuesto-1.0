import { useState } from 'react';
import { useDataStore }         from '../hooks/useDataStore';
import { FileText, Printer, Share2, Search, Edit, Copy, Trash2 } from 'lucide-react';
import { compartirPresupuesto } from '../utils/shareUtils';
import { getAvatarColor, getInitials } from '../App';

export function Historial({ setView, onEditar, setPdfData }) {
  const { presupuestos, deletePresupuesto, duplicarPresupuesto } = useDataStore();
  const [busqueda, setBusqueda] = useState('');

  const todos = [...presupuestos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const filtrados = todos.filter(p => {
    const q = busqueda.toLowerCase();
    return (
      (p.cliente?.nombre || '').toLowerCase().includes(q) ||
      (p.numero || '').toLowerCase().includes(q)          ||
      (p.tipoTrabajo || '').toLowerCase().includes(q)
    );
  });

  const handleDuplicar = (id) => {
    const duplicado = duplicarPresupuesto(id);
    if (duplicado) {
      alert(`Presupuesto duplicado con éxito como ${duplicado.numero}`);
    }
  };

  const handleEliminar = (id, numero) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el presupuesto ${numero}?`)) {
      deletePresupuesto(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-up">

      {/* Encabezado */}
      <div>
        <h2 style={{ marginBottom: '0.25rem' }}>Historial de Presupuestos</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          {todos.length} presupuesto{todos.length !== 1 ? 's' : ''} registrado{todos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Búsqueda */}
      <div className="search-wrapper">
        <Search size={16} className="search-icon" />
        <input
          id="historial-busqueda"
          type="text"
          className="form-control search-input"
          placeholder="Buscar por cliente, número (#0001) o trabajo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla / Cards */}
      {filtrados.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={28} strokeWidth={1.5} />
            </div>
            <p style={{ color: 'var(--text-sub)', fontWeight: 600 }}>
              {busqueda ? 'Sin resultados de búsqueda' : 'Sin presupuestos'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {busqueda ? 'Probá buscando con otro nombre o número' : 'Los presupuestos que crees se guardarán aquí automáticamente'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtrados.map((p, i) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: '1.25rem',
              }}
            >
              {/* Fila superior: avatar + info + total */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.875rem' }}>
                {/* Avatar */}
                <div
                  className="avatar"
                  style={{ background: getAvatarColor(p.cliente?.nombre), width: 44, height: 44, fontSize: '0.875rem', flexShrink: 0 }}
                >
                  {getInitials(p.cliente?.nombre)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      {p.cliente?.nombre || 'Cliente Final'}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)', background: 'var(--accent-green-dim)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      {p.numero || '#0000'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                    {p.tipoTrabajo}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {new Date(p.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Total */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: '1.15rem' }}>
                    ${(p.total || 0).toLocaleString('es-AR')}
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="divider" style={{ margin: '0 0 0.875rem' }} />

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                  onClick={() => onEditar(p)}
                  title="Editar presupuesto"
                >
                  <Edit size={14} /> Editar
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                  onClick={() => handleDuplicar(p.id)}
                  title="Duplicar como nuevo presupuesto"
                >
                  <Copy size={14} /> Duplicar
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                  onClick={() => compartirPresupuesto(p)}
                  title="Enviar o copiar por WhatsApp"
                >
                  <Share2 size={14} /> Compartir
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                  onClick={() => setPdfData(p)}
                  title="Imprimir o exportar PDF de 1 hoja"
                >
                  <Printer size={14} /> PDF
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                  onClick={() => handleEliminar(p.id, p.numero)}
                  title="Eliminar registro"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

