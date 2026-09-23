import { useState } from 'react';
import { useDataStore } from '../hooks/useDataStore';
import { Users, Plus, Edit, Phone, Mail, MapPin, Trash2, FilePlus } from 'lucide-react';
import { getAvatarColor, getInitials } from '../App';

export function Clientes({ setView, onNuevoPresupuesto }) {
  const { clientes, addCliente, updateCliente, deleteCliente } = useDataStore();
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState({ id: null, nombre: '', telefono: '', email: '', direccion: '' });

  const handleSave = () => {
    if (!current.nombre.trim()) return;
    if (current.id) { updateCliente(current.id, current); }
    else             { addCliente(current); }
    setIsEditing(false);
    setCurrent({ id: null, nombre: '', telefono: '', email: '', direccion: '' });
  };

  const handleEdit = (c) => { setCurrent(c); setIsEditing(true); };
  const handleAdd  = ()  => { setCurrent({ id: null, nombre: '', telefono: '', email: '', direccion: '' }); setIsEditing(true); };

  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Deseas eliminar el cliente "${nombre}"?`)) {
      deleteCliente(id);
    }
  };

  const handleCrearPresupuestoCliente = (cliente) => {
    if (onNuevoPresupuesto) {
      onNuevoPresupuesto({ cliente, tipoTrabajo: '', conceptos: [{ id: Date.now(), descripcion: '', cantidad: 1, unidad: 'Unidad', precio: 0 }] });
    } else {
      setView('nuevo');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }} className="animate-fade-up">

      <div>
        <h2 style={{ marginBottom: '0.25rem' }}>Clientes</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} guardado{clientes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── FORMULARIO EDICIÓN ── */}
      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="card animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-green)' }}>
            {current.id ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>

          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              id="cliente-nombre"
              type="text"
              className="form-control"
              value={current.nombre}
              onChange={e => setCurrent({ ...current, nombre: e.target.value })}
              placeholder="Nombre completo o Empresa"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              id="cliente-telefono"
              type="tel"
              className="form-control"
              value={current.telefono}
              onChange={e => setCurrent({ ...current, telefono: e.target.value })}
              placeholder="+54 9 11 ..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="cliente-email"
              type="email"
              className="form-control"
              value={current.email}
              onChange={e => setCurrent({ ...current, email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input
              id="cliente-direccion"
              type="text"
              className="form-control"
              value={current.direccion}
              onChange={e => setCurrent({ ...current, direccion: e.target.value })}
              placeholder="Calle, número, localidad..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
            <button
              id="btn-guardar-cliente"
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={!current.nombre.trim()}
            >
              <Plus size={16} /> Guardar
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* ── BOTÓN AGREGAR ── */}
          <button
            id="btn-agregar-cliente"
            className="btn btn-primary btn-large btn-full"
            onClick={handleAdd}
          >
            <Plus size={20} strokeWidth={2.5} /> Agregar Cliente
          </button>

          {/* ── LISTA ── */}
          {clientes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><Users size={28} strokeWidth={1.5} /></div>
                <p style={{ color: 'var(--text-sub)', fontWeight: 600 }}>Sin clientes registrados</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Agregá tu primer cliente para agilizar la creación de presupuestos
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {clientes.map((c) => (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.125rem 1.25rem',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="avatar"
                    style={{ background: getAvatarColor(c.nombre), width: 44, height: 44, fontSize: '0.9rem', flexShrink: 0 }}
                  >
                    {getInitials(c.nombre)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>{c.nombre}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      {c.telefono && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Phone size={11} /> {c.telefono}
                        </span>
                      )}
                      {c.email && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Mail size={11} /> {c.email}
                        </span>
                      )}
                      {c.direccion && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={11} /> {c.direccion}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                      onClick={() => handleCrearPresupuestoCliente(c)}
                      title={`Nuevo presupuesto para ${c.nombre}`}
                    >
                      <FilePlus size={16} />
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem' }}
                      onClick={() => handleEdit(c)}
                      aria-label={`Editar cliente ${c.nombre}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.5rem' }}
                      onClick={() => handleDelete(c.id, c.nombre)}
                      aria-label={`Eliminar cliente ${c.nombre}`}
                    >
                      <Trash2 size={16} />
                    </button>
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

