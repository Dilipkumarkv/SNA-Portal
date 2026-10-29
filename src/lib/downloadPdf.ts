import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

export const generateAndDownloadPdf = async (elementId: string, filename: string, successMessage: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const toastId = toast.loading('Generating PDF...');
  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(filename);
    toast.success(successMessage, { id: toastId });
  } catch (e) {
    console.error('Error generating PDF:', e);
    toast.error('Failed to generate PDF', { id: toastId });
  }
};

