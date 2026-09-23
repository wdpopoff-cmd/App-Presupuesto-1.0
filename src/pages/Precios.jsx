import { useState } from 'react';
import { useDataStore } from '../hooks/useDataStore';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';

export function Precios({ setView }) {
  const { precios, savePrecio, deletePrecio } = useDataStore();
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState({ id: null, descripcion: '', unidad: 'Unidad', precio: 0 });

  const handleSave = () => {
    if (!current.descripcion.trim()) return;
    savePrecio(current);
    setIsEditing(false);
    setCurrent({ id: null, descripcion: '', unidad: 'Unidad', precio: 0 });
  };

  const handleEdit = (p) => { setCurrent(p); setIsEditing(true); };
  const handleAdd  = ()  => { setCurrent({ id: null, descripcion: '', unidad: 'Unidad', precio: 0 }); setIsEditing(true); };

  const handleDelete = (id, desc) => {
    if (window.confirm(`¿Eliminar precio para "${desc}"?`)) {
      deletePrecio(id);
    }
  };

  const UNIDADES = ['Unidad','Metro','Centímetro','Kilogramo','Gramo','Litro','Hora','Día','Servicio','Pieza','Otro'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }} className="animate-fade-up">

      <div>
        <h2 style={{ marginBottom: '0.25rem' }}>Base de Precios Personal</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          {precios.length} ítem{precios.length !== 1 ? 's' : ''} guardados — autocompletan los presupuestos
        </p>
      </div>

      {/* ── FORMULARIO ── */}
      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="card animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
            {current.id ? 'Editar Precio' : 'Nuevo Precio'}
          </h3>

          <div className="form-group">
            <label className="form-label">Descripción *</label>
            <input
              id="precio-descripcion"
              type="text"
              className="form-control"
              value={current.descripcion}
              onChange={e => setCurrent({ ...current, descripcion: e.target.value })}
              placeholder="Ej: Caño cobre 3/8"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <select
                id="precio-unidad"
                className="form-control"
                value={current.unidad}
                onChange={e => setCurrent({ ...current, unidad: e.target.value })}
              >
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Precio ($)</label>
              <input
                id="precio-valor"
                type="number"
                className="form-control"
                value={current.precio || ''}
                placeholder="0"
                onChange={e => setCurrent({ ...current, precio: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
            <button
              id="btn-guardar-precio"
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={!current.descripcion.trim()}
            >
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* ── CTA ── */}
          <button
            id="btn-agregar-precio"
            className="btn btn-primary btn-large btn-full"
            onClick={handleAdd}
          >
            <Plus size={20} strokeWidth={2.5} /> Agregar Precio
          </button>

          {/* ── GRID PRECIOS ── */}
          {precios.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><Tag size={28} strokeWidth={1.5} /></div>
                <p style={{ color: 'var(--text-sub)', fontWeight: 600 }}>Sin precios guardados</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '260px', textAlign: 'center' }}>
                  Guardá tus materiales y mano de obra para autocompletar presupuestos más rápido
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {precios.map((p) => (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '1.125rem',
                  }}
                >
                  {/* Ícono */}
                  <div
                    className="kpi-icon purple"
                    style={{ width: 38, height: 38, flexShrink: 0 }}
                  >
                    <Tag size={16} strokeWidth={1.75} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.descripcion}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      por {p.unidad}
                    </div>
                  </div>

                  {/* Precio y acciones */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: '1rem' }}>
                      ${(p.precio || 0).toLocaleString('es-AR')}
                    </div>
                    <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '0.2rem 0.4rem' }}
                        onClick={() => handleEdit(p)}
                        aria-label={`Editar precio ${p.descripcion}`}
                      >
                        <Edit size={14} color="var(--text-muted)" />
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '0.2rem 0.4rem', color: 'var(--danger)' }}
                        onClick={() => handleDelete(p.id, p.descripcion)}
                        aria-label={`Eliminar precio ${p.descripcion}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

