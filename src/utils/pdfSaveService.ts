import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Service to permanently bake all highlights, comments, and direct in-page text boxes
 * into a downloadable high-resolution PDF document.
 */
export async function saveDocumentAsPdf(
  documentTitle: string,
  onProgress?: (message: string) => void
): Promise<boolean> {
  const pageElements = Array.from(document.querySelectorAll<HTMLElement>('[data-page-number]'));

  if (pageElements.length === 0) {
    window.print();
    return true;
  }

  try {
    onProgress?.('Preparing high-resolution PDF render...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      onProgress?.(`Rendering Page ${i + 1} of ${pageElements.length} with permanent annotations...`);

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 2x resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        onclone: clonedDoc => {
          // Tailwind v4 uses modern color formats like oklab() and oklch().
          // html2canvas parser throws on oklab(); sanitize all stylesheets in the clone.
          clonedDoc.querySelectorAll('style').forEach(styleTag => {
            if (styleTag.textContent) {
              styleTag.textContent = styleTag.textContent
                .replace(/oklab\([^)]+\)/g, '#1e1e1e')
                .replace(/oklch\([^)]+\)/g, '#1e1e1e');
            }
          });

          // Also sanitize inline styles on cloned elements
          clonedDoc.querySelectorAll('*').forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              const bg = htmlEl.style.backgroundColor;
              if (bg && (bg.includes('oklab') || bg.includes('oklch'))) {
                htmlEl.style.backgroundColor = '#ffffff';
              }
              const color = htmlEl.style.color;
              if (color && (color.includes('oklab') || color.includes('oklch'))) {
                htmlEl.style.color = '#1e1e1e';
              }
              const border = htmlEl.style.borderColor;
              if (border && (border.includes('oklab') || border.includes('oklch'))) {
                htmlEl.style.borderColor = '#e2e8f0';
              }
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const imgWidth = pdfWidth - 36;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xOffset = 18;
      const yOffset = Math.max(18, (pdfHeight - imgHeight) / 2);

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, Math.min(imgHeight, pdfHeight - 36));
    }

    onProgress?.('Finalizing and downloading permanent PDF...');
    const cleanName = (documentTitle || 'annotated-document')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    pdf.save(`fluentpdf-${cleanName}-annotated.pdf`);
    return true;
  } catch (error) {
    console.warn('Canvas PDF export error, activating print-to-PDF driver fallback:', error);
    onProgress?.('Activating print-to-PDF driver...');
    window.print();
    return true;
  }
}
