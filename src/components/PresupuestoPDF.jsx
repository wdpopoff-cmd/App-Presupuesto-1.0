import React from 'react';

export function PresupuestoPDF({ data, forceVisible = false }) {
  if (!data) return null;

  return (
    <div className={`${forceVisible ? 'pdf-render-target' : 'print-only'} pdf-container`}>
      {/* ── HEADER DE LA EMPRESA Y NUMERACIÓN ── */}
      <div className="pdf-header">
        <div>
          <div className="pdf-brand">
            <div className="pdf-logo">❄</div>
            <div>
              <h1 className="pdf-title">WP REFRIGERACIÓN</h1>
              <div className="pdf-subtitle">Instalación · Mantenimiento · Reparación</div>
            </div>
          </div>
          <div className="pdf-company-info">
            <p><strong>CUIT:</strong> 20-38492014-9 | <strong>Matrícula:</strong> CACAAV 14892</p>
            <p><strong>Teléfono:</strong> +54 9 11 5839-2041 | <strong>Email:</strong> contacto@wprefrigeracion.com</p>
            <p><strong>Dirección:</strong> Av. San Martín 1420, Buenos Aires</p>
          </div>
        </div>

        <div className="pdf-doc-info">
          <div className="pdf-badge">PRESUPUESTO</div>
          <div className="pdf-num">{data.numero || '#0001'}</div>
          <div className="pdf-date">
            <strong>Fecha:</strong> {data.fecha ? new Date(data.fecha).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR')}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN CLIENTE Y TIPO TRABAJO ── */}
      <div className="pdf-meta-grid">
        <div className="pdf-meta-box">
          <div className="pdf-meta-label">CLIENTE</div>
          <div className="pdf-meta-value font-bold">{data.cliente?.nombre || 'Cliente Final'}</div>
          {data.cliente?.telefono && <div className="pdf-meta-sub">Tel: {data.cliente.telefono}</div>}
          {data.cliente?.email && <div className="pdf-meta-sub">Email: {data.cliente.email}</div>}
          {data.cliente?.direccion && <div className="pdf-meta-sub">Dir: {data.cliente.direccion}</div>}
        </div>

        <div className="pdf-meta-box">
          <div className="pdf-meta-label">TRABAJO A REALIZAR</div>
          <div className="pdf-meta-value font-bold">{data.tipoTrabajo || 'Servicio de Refrigeración'}</div>
          <div className="pdf-meta-sub" style={{ marginTop: '4px', color: '#4b5563' }}>
            Presupuesto oficial y detallado de mano de obra y materiales.
          </div>
        </div>
      </div>

      {/* ── TABLA DE CONCEPTOS ── */}
      <div className="pdf-table-wrapper">
        <table className="pdf-table">
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Descripción</th>
              <th style={{ textAlign: 'center', width: '15%' }}>Cant.</th>
              <th style={{ textAlign: 'right', width: '20%' }}>Precio U.</th>
              <th style={{ textAlign: 'right', width: '20%' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(data.conceptos || []).map((c, i) => (
              <tr key={c.id || i}>
                <td>
                  <strong>{c.descripcion || 'Concepto'}</strong>
                  {c.unidad && <span className="pdf-unit-tag"> ({c.unidad})</span>}
                </td>
                <td style={{ textAlign: 'center' }}>{c.cantidad}</td>
                <td style={{ textAlign: 'right' }}>${(c.precio || 0).toLocaleString('es-AR')}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  ${((c.cantidad || 0) * (c.precio || 0)).toLocaleString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── RESUMEN TOTALES ── */}
      <div className="pdf-totals-wrapper">
        <div className="pdf-totals-box">
          <div className="pdf-total-row">
            <span>Subtotal:</span>
            <span>${(data.subtotal || 0).toLocaleString('es-AR')}</span>
          </div>

          {data.descuento > 0 && (
            <div className="pdf-total-row discount">
              <span>Descuento aplicado:</span>
              <span>-${(data.descuento || 0).toLocaleString('es-AR')}</span>
            </div>
          )}

          {data.impuestoPorcentaje > 0 && (
            <div className="pdf-total-row">
              <span>Impuesto ({data.impuestoPorcentaje}%):</span>
              <span>
                +${(((data.subtotal || 0) - (data.descuento || 0)) * (data.impuestoPorcentaje / 100)).toLocaleString('es-AR')}
              </span>
            </div>
          )}

          <div className="pdf-total-row final">
            <span>TOTAL:</span>
            <span className="amount">${(data.total || 0).toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      {/* ── NOTA Y CONDICIONES ── */}
      {data.nota && (
        <div className="pdf-note-box">
          <strong>Observaciones:</strong> {data.nota}
        </div>
      )}

      {/* ── PIE DE PÁGINA Y FIRMA ── */}
      <div className="pdf-footer">
        <div className="pdf-terms">
          <p><strong>Condiciones del servicio:</strong></p>
          <ul>
            <li>Este presupuesto posee una validez de 15 días corridos.</li>
            <li>Forma de pago a convenir con el técnico previo inicio del servicio.</li>
            <li>Garantía de 6 meses sobre instalaciones y reparaciones efectuadas.</li>
          </ul>
        </div>

        <div className="pdf-signature-area">
          <div className="pdf-signature-line"></div>
          <p><strong>WP Refrigeración</strong></p>
          <span style={{ fontSize: '10px', color: '#6b7280' }}>Firma y Sello del Técnico</span>
        </div>
      </div>
    </div>
  );
}

