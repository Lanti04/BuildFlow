import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportCanvasToImage(
  canvas: HTMLCanvasElement,
  filename: string = 'notepad-export.png'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to export canvas to image'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export async function exportToPDF(
  element: HTMLElement | HTMLCanvasElement,
  filename: string = 'notepad-export.pdf',
  options?: {
    width?: number;
    height?: number;
    scale?: number;
  }
): Promise<Blob> {
  const scale = options?.scale || 2;
  
  let canvas: HTMLCanvasElement;
  
  if (element instanceof HTMLCanvasElement) {
    canvas = element;
  } else {
    canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
    });
  }

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  return pdf.output('blob');
}

export async function saveToDevice(
  blob: Blob,
  filename: string
): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// For iOS/iPad: Save to Photos app
export async function saveToPhotos(blob: Blob, filename?: string): Promise<void> {
  // Use native implementation if available
  const { saveImageToPhotos } = await import('./native');
  await saveImageToPhotos(blob, filename || `buildflow-${Date.now()}.png`);
}

