import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PresupuestoPDF } from '../components/PresupuestoPDF';

export async function generatePdfBlob(presupuesto) {
  if (!presupuesto) throw new Error('No se encontraron datos del presupuesto');

  const container = document.createElement('div');
  container.id = 'presupuesto-to-print';
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-99999';
  container.style.background = '#ffffff';
  container.style.color = '#111827';
  container.style.opacity = '1';
  container.style.visibility = 'visible';
  container.style.pointerEvents = 'none';

  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    await new Promise((resolve) => {
      root.render(
        React.createElement(
          'div',
          { style: { background: '#ffffff', color: '#111827', padding: '16px' } },
          React.createElement(PresupuestoPDF, { data: presupuesto, forceVisible: true })
        )
      );
      setTimeout(resolve, 350);
    });

    const targetEl = container.querySelector('.pdf-container') || container;

    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 800,
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('El lienzo capturado está vacío');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));

    const blob = pdf.output('blob');

    root.unmount();
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }

    return blob;
  } catch (err) {
    try { root.unmount(); } catch (_) {}
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    throw err;
  }
}

export async function compartirPresupuesto(presupuesto) {
  if (!presupuesto) return;

  try {
    // 1. Generar Blob de PDF de forma asíncrona y segura
    const pdfBlob = await generatePdfBlob(presupuesto);

    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('El archivo PDF generado está vacío');
    }

    const numLimpio = presupuesto.numero ? presupuesto.numero.replace('#', '') : 'WP';
    const fileName = `Presupuesto_${numLimpio}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // 2. Compartir mediante Web Share API
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Presupuesto ${presupuesto.numero || ''}`,
          text: `Hola ${presupuesto.cliente?.nombre || ''}, te adjunto el presupuesto ${presupuesto.numero || ''}.`
        });
      } catch (shareErr) {
        if (shareErr.name !== 'AbortError') {
          console.error('Error al compartir vía API nativa:', shareErr);
          fallbackDescargarYNotificar(pdfBlob, fileName, presupuesto);
        }
      }
    } else {
      // Fallback: descargar PDF si la API de compartir archivos no está soportada
      fallbackDescargarYNotificar(pdfBlob, fileName, presupuesto);
    }
  } catch (error) {
    console.error('Error al generar o compartir el PDF:', error);
    alert('No se pudo compartir el PDF: ' + (error.message || 'Error al procesar el documento'));
  }
}

function fallbackDescargarYNotificar(blob, fileName, presupuesto) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const telefonoLimpio = presupuesto.cliente?.telefono?.replace(/\D/g, '');
  if (telefonoLimpio && telefonoLimpio.length >= 8) {
    const texto = encodeURIComponent(`Hola ${presupuesto.cliente?.nombre || ''}, te adjunto el presupuesto ${presupuesto.numero || ''}.`);
    window.open(`https://wa.me/${telefonoLimpio}?text=${texto}`, '_blank');
  } else {
    alert('El PDF del presupuesto fue descargado con éxito. Podés adjuntarlo en WhatsApp.');
  }
}
