import { useState } from 'react';
import { useDataStore } from '../hooks/useDataStore';
import { ArrowLeft, Check, Plus, Trash2, Printer, Search, User, ChevronRight, Share2 } from 'lucide-react';
import { getAvatarColor, getInitials } from '../App';
import { compartirPresupuesto } from '../utils/shareUtils';

/* ──────────────────────────────────────────────────────────
   STEP INDICATOR
────────────────────────────────────────────────────────── */
const STEPS = ['Cliente', 'Trabajo', 'Conceptos', 'Revisar'];

function StepIndicator({ current }) {
  return (
    <div className="stepper" aria-label="Progreso del presupuesto">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done   = n < current;
        const active = n === current;
        return (
          <div key={label} className="step-item">
            <div className={`step-dot${active ? ' active' : done ? ' done' : ''}`} aria-label={`Paso ${n}: ${label}`}>
              {done ? <Check size={14} strokeWidth={3} /> : n}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line${done ? ' active' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────── */
export function NuevoPresupuesto({ setView, presupuestoInicial = null, onImprimir }) {
  const { clientes, addCliente, presupuestos, precios, savePresupuesto } = useDataStore();

  const [step, setStep] = useState(presupuestoInicial ? 3 : 1);
  const [presupuesto, setPresupuesto] = useState(() => {
    if (presupuestoInicial) {
      return { ...presupuestoInicial };
    }
    return {
      cliente:          null,
      tipoTrabajo:      '',
      conceptos:        [
        { id: Date.now(), descripcion: '', cantidad: 1, unidad: 'Unidad', precio: 0 }
      ],
      subtotal:         0,
      descuento:        0,
      impuestoPorcentaje: 0,
      total:            0,
      nota:             ''
    };
  });

  /* Paso 1 — Cliente y Cliente Rápido */
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [mostrarFormNuevoCliente, setMostrarFormNuevoCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', email: '', direccion: '' });

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(clienteBusqueda.toLowerCase())
  );

  const handleCrearClienteRapido = (e) => {
    e.preventDefault();
    if (!nuevoCliente.nombre.trim()) return;
    const creado = addCliente(nuevoCliente);
    setPresupuesto(p => ({ ...p, cliente: creado }));
    setMostrarFormNuevoCliente(false);
    setNuevoCliente({ nombre: '', telefono: '', email: '', direccion: '' });
    nextStep();
  };

  /* Paso 2 — Tipo de trabajo */
  const tiposTrabajo = [
    'Instalación de aire acondicionado',
    'Reparación',
    'Mantenimiento',
    'Mano de obra'
  ];
  const [tipoOtro, setTipoOtro] = useState('');

  /* Plantillas rápidas */
  const PLANTILLAS = [
    {
      nombre: 'Instalación Split 3000fg',
      tipo: 'Instalación de aire acondicionado',
      conceptos: [
        { id: Date.now() + 1, descripcion: 'Mano de obra instalación Split', cantidad: 1, unidad: 'Servicio', precio: 65000 },
        { id: Date.now() + 2, descripcion: 'Caño de cobre 1/4 y 3/8', cantidad: 3, unidad: 'Metro', precio: 18000 },
        { id: Date.now() + 3, descripcion: 'Ménsulas y tirafondos', cantidad: 1, unidad: 'Unidad', precio: 15000 }
      ]
    },
    {
      nombre: 'Mantenimiento Preventivo',
      tipo: 'Mantenimiento',
      conceptos: [
        { id: Date.now() + 1, descripcion: 'Limpieza profunda de filtros y turbina', cantidad: 1, unidad: 'Servicio', precio: 35000 },
        { id: Date.now() + 2, descripcion: 'Revisión de presión de gas y contactos', cantidad: 1, unidad: 'Servicio', precio: 15000 }
      ]
    },
    {
      nombre: 'Reparación / Carga Gas R410a',
      tipo: 'Reparación',
      conceptos: [
        { id: Date.now() + 1, descripcion: 'Búsqueda y reparación de fuga', cantidad: 1, unidad: 'Servicio', precio: 40000 },
        { id: Date.now() + 2, descripcion: 'Carga completa de gas R410a', cantidad: 1, unidad: 'Servicio', precio: 55000 }
      ]
    }
  ];

  /* Helpers navegación */
  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const goBack   = () => step === 1 ? setView('dashboard') : prevStep();

  /* Cálculos */
  const recalcularTotales = (conceptos, desc = presupuesto.descuento, imp = presupuesto.impuestoPorcentaje) => {
    const subtotal          = conceptos.reduce((acc, c) => acc + ((c.precio || 0) * (c.cantidad || 0)), 0);
    const totalConDescuento = subtotal - (desc || 0);
    const impuestoMonto     = totalConDescuento * ((imp || 0) / 100);
    const total             = Math.max(0, totalConDescuento + impuestoMonto);
    setPresupuesto(p => ({ ...p, conceptos, subtotal, descuento: desc, impuestoPorcentaje: imp, total }));
  };

  const agregarConceptoVacio = () => {
    recalcularTotales([
      ...presupuesto.conceptos,
      { id: Date.now(), descripcion: '', cantidad: 1, unidad: 'Unidad', precio: 0 }
    ]);
  };

  const cargarPlantilla = (plantilla) => {
    setPresupuesto(p => {
      const tipoTrabajo = p.tipoTrabajo || plantilla.tipo;
      const conceptos = plantilla.conceptos.map(c => ({ ...c, id: Date.now() + Math.random() }));
      const subtotal = conceptos.reduce((acc, c) => acc + (c.precio * c.cantidad), 0);
      return {
        ...p,
        tipoTrabajo,
        conceptos,
        subtotal,
        total: subtotal - (p.descuento || 0)
      };
    });
  };

  const actualizarConcepto = (id, campo, valor) => {
    const nuevos = presupuesto.conceptos.map(c => {
      if (c.id !== id) return c;
      let actualizado = { ...c, [campo]: valor };
      if (campo === 'descripcion') {
        const p = precios.find(p => p.descripcion.toLowerCase() === valor.toLowerCase());
        if (p) { actualizado.precio = p.precio; actualizado.unidad = p.unidad; }
      }
      return actualizado;
    });
    recalcularTotales(nuevos);
  };

  const eliminarConcepto = (id) => {
    const filtrados = presupuesto.conceptos.filter(c => c.id !== id);
    if (filtrados.length === 0) {
      recalcularTotales([{ id: Date.now(), descripcion: '', cantidad: 1, unidad: 'Unidad', precio: 0 }]);
    } else {
      recalcularTotales(filtrados);
    }
  };

  const guardar = (imprimir = false, compartir = false) => {
    if (!presupuesto.cliente) {
      alert('Por favor selecciona un cliente antes de guardar.');
      setStep(1);
      return;
    }
    const p = savePresupuesto(presupuesto);
    if (imprimir) {
      onImprimir(p);
    }
    if (compartir) {
      compartirPresupuesto(p);
    }
    setView('dashboard');
  };

  /* ── RENDER ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

      {/* Header con botón volver */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn btn-ghost"
          onClick={goBack}
          aria-label="Volver"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: '0.875rem' }}>Volver</span>
        </button>
        <h2 style={{ margin: 0, flex: 1 }}>
          {step === 1 && 'Seleccionar Cliente'}
          {step === 2 && 'Tipo de Trabajo'}
          {step === 3 && 'Conceptos del Presupuesto'}
          {step === 4 && 'Revisar y Generar'}
        </h2>
      </div>

      {/* Stepper */}
      <StepIndicator current={step} />

      {/* ═══════ PASO 1: CLIENTE ═══════ */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-up">

          {/* Búsqueda + Agregar Rápido */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="search-wrapper" style={{ flex: 1 }}>
              <Search size={16} className="search-icon" />
              <input
                id="buscar-cliente"
                type="text"
                className="form-control search-input"
                placeholder="Buscar cliente guardado..."
                value={clienteBusqueda}
                onChange={e => setClienteBusqueda(e.target.value)}
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setMostrarFormNuevoCliente(!mostrarFormNuevoCliente)}
              style={{ padding: '0.75rem 1rem' }}
            >
              <Plus size={18} /> Nuevo
            </button>
          </div>

          {/* Formulario nuevo cliente inline */}
          {mostrarFormNuevoCliente && (
            <form onSubmit={handleCrearClienteRapido} className="card animate-fade-up" style={{ border: '1.5px solid var(--accent-green)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--accent-green)', margin: 0 }}>Agregar Cliente Rápido</h3>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre completo o Empresa"
                  value={nuevoCliente.nombre}
                  onChange={e => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+54 9 11..."
                    value={nuevoCliente.telefono}
                    onChange={e => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dirección..."
                    value={nuevoCliente.direccion}
                    onChange={e => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarFormNuevoCliente(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar y Seleccionar
                </button>
              </div>
            </form>
          )}

          {/* Lista clientes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {clientesFiltrados.length === 0 && clienteBusqueda && !mostrarFormNuevoCliente && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No se encontraron clientes con "{clienteBusqueda}"
              </div>
            )}

            {clientesFiltrados.map(c => (
              <button
                key={c.id}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  border: presupuesto.cliente?.id === c.id
                    ? '1.5px solid var(--accent-green)'
                    : '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: presupuesto.cliente?.id === c.id
                    ? 'var(--accent-green-dim)'
                    : 'var(--bg-card)',
                }}
                onClick={() => { setPresupuesto(p => ({ ...p, cliente: c })); nextStep(); }}
              >
                <div className="avatar" style={{ background: getAvatarColor(c.nombre) }}>
                  {getInitials(c.nombre)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {[c.telefono, c.direccion].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            ))}
          </div>

          {/* Sin clientes iniciales */}
          {clientes.length === 0 && !mostrarFormNuevoCliente && (
            <div className="empty-state">
              <div className="empty-state-icon"><User size={28} strokeWidth={1.5} /></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No tenés clientes registrados aún. Usa el botón de arriba para agregar uno rápidamente.
              </p>
              <button className="btn btn-primary" onClick={() => setMostrarFormNuevoCliente(true)}>
                <Plus size={16} /> Crear mi primer cliente
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════ PASO 2: TIPO DE TRABAJO ═══════ */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="animate-fade-up">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Cliente seleccionado: <strong style={{ color: 'var(--accent-green)' }}>{presupuesto.cliente?.nombre}</strong>
          </p>

          {tiposTrabajo.map((t, i) => (
            <button
              key={t}
              className="card card-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                border: presupuesto.tipoTrabajo === t
                  ? '1.5px solid var(--accent-green)'
                  : '1px solid var(--border)',
                background: presupuesto.tipoTrabajo === t
                  ? 'var(--accent-green-dim)'
                  : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onClick={() => { setPresupuesto(p => ({ ...p, tipoTrabajo: t })); nextStep(); }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t}</span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>
          ))}

          {/* Tipo libre con Form Submit */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (tipoOtro.trim()) {
                setPresupuesto(p => ({ ...p, tipoTrabajo: tipoOtro }));
                nextStep();
              }
            }}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <label className="form-label">Otro tipo de trabajo</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                id="tipo-otro"
                type="text"
                className="form-control"
                value={tipoOtro}
                onChange={e => setTipoOtro(e.target.value)}
                placeholder="Describir trabajo personalizado..."
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!tipoOtro.trim()}
              >
                <Check size={18} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════ PASO 3: CONCEPTOS & PLANTILLAS ═══════ */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-up">

          {/* PLANTILLAS RÁPIDAS */}
          <div className="card" style={{ padding: '1rem', background: 'var(--bg-elevated)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              ⚡ Cargar Plantilla Rápida
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PLANTILLAS.map(p => (
                <button
                  key={p.nombre}
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => cargarPlantilla(p)}
                >
                  + {p.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE CONCEPTOS */}
          {presupuesto.conceptos.map((c, i) => (
            <div
              key={c.id}
              className="card"
              style={{ padding: '1.25rem' }}
            >
              {/* Header del concepto */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Concepto {i + 1}
                </span>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => eliminarConcepto(c.id)}
                  aria-label="Eliminar concepto"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Descripción */}
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Descripción del concepto o material..."
                  value={c.descripcion}
                  onChange={e => actualizarConcepto(c.id, 'descripcion', e.target.value)}
                  list="precios-sugeridos"
                />
                <datalist id="precios-sugeridos">
                  {precios.map(p => <option key={p.id} value={p.descripcion} />)}
                </datalist>
              </div>

              {/* Cantidad, Unidad, Precio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Cant.</label>
                  <input
                    type="number"
                    className="form-control"
                    value={c.cantidad}
                    min="1"
                    onChange={e => actualizarConcepto(c.id, 'cantidad', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad</label>
                  <select
                    className="form-control"
                    value={c.unidad}
                    onChange={e => actualizarConcepto(c.id, 'unidad', e.target.value)}
                  >
                    {['Unidad','Metro','Centímetro','Kilogramo','Gramo','Litro','Hora','Día','Servicio','Pieza','Otro'].map(u =>
                      <option key={u}>{u}</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">$ Precio</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={c.precio || ''}
                    onChange={e => actualizarConcepto(c.id, 'precio', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Subtotal */}
              <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-green)', fontSize: '1rem' }}>
                Subtotal: ${((c.cantidad || 0) * (c.precio || 0)).toLocaleString('es-AR')}
              </div>
            </div>
          ))}

          {/* Botón agregar */}
          <button
            id="btn-agregar-concepto"
            type="button"
            className="btn btn-secondary btn-full"
            style={{ padding: '1rem', borderStyle: 'dashed', borderColor: 'var(--border-hover)' }}
            onClick={agregarConceptoVacio}
          >
            <Plus size={18} strokeWidth={2.5} /> Agregar Otro Concepto
          </button>

          {/* Continuar */}
          <button
            type="button"
            className="btn btn-primary btn-large btn-full"
            style={{ marginTop: '0.5rem' }}
            onClick={nextStep}
          >
            Revisar Totales <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ═══════ PASO 4: REVISAR ═══════ */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-up">

          {/* Resumen cliente + trabajo */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div className="avatar" style={{ background: getAvatarColor(presupuesto.cliente?.nombre), width: 44, height: 44, fontSize: '1rem' }}>
              {getInitials(presupuesto.cliente?.nombre)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{presupuesto.cliente?.nombre || 'Cliente Final'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{presupuesto.tipoTrabajo}</div>
            </div>
            <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>
              Cambiar
            </button>
          </div>

          {/* Conceptos resumen */}
          <div className="card" style={{ padding: '1rem 0', overflow: 'hidden' }}>
            <table className="dark-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {presupuesto.conceptos.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {c.descripcion || 'Sin descripción'}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                        / {c.unidad}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{c.cantidad}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-main)', fontWeight: 600 }}>
                      ${((c.cantidad || 0) * (c.precio || 0)).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="totals-panel">
            <div className="totals-row">
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                ${(presupuesto.subtotal || 0).toLocaleString('es-AR')}
              </span>
            </div>

            <div className="totals-row">
              <span>Descuento ($)</span>
              <input
                type="number"
                className="form-control"
                style={{ width: '120px', padding: '0.3rem 0.6rem', textAlign: 'right' }}
                value={presupuesto.descuento || ''}
                placeholder="0"
                onChange={e => recalcularTotales(presupuesto.conceptos, parseFloat(e.target.value) || 0, presupuesto.impuestoPorcentaje)}
              />
            </div>

            <div className="totals-row">
              <span>Impuesto (%)</span>
              <input
                type="number"
                className="form-control"
                style={{ width: '120px', padding: '0.3rem 0.6rem', textAlign: 'right' }}
                value={presupuesto.impuestoPorcentaje || ''}
                placeholder="0"
                onChange={e => recalcularTotales(presupuesto.conceptos, presupuesto.descuento, parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="totals-row total-final">
              <span>TOTAL</span>
              <span className="total-value">${(presupuesto.total || 0).toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Nota */}
          <div className="form-group">
            <label className="form-label">Nota adicional (opcional)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Ej. Garantía de 6 meses sobre la instalación..."
              value={presupuesto.nota}
              onChange={e => setPresupuesto(p => ({ ...p, nota: e.target.value }))}
            />
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              id="btn-solo-guardar"
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => guardar(false)}
            >
              Solo Guardar
            </button>
            <button
              id="btn-guardar-compartir"
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              onClick={() => guardar(false, true)}
            >
              <Share2 size={18} /> Guardar y Compartir
            </button>
            <button
              id="btn-guardar-pdf"
              type="button"
              className="btn btn-primary"
              style={{ flex: 1.5 }}
              onClick={() => guardar(true)}
            >
              <Printer size={18} /> Guardar e Imprimir
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

