import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Shahada Certificate Edge Function - Generate PDF on server
export interface ShahadaCertificateRequest {
  applicationId: string;
  fullName: string;
  formerName?: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  shahadaDate: string;
  location: string;
  witnessName: string;
  witnessTitle: string;
  certificateId: string;
  issueDate: string;
}

const generateCertificatePDF = (data: ShahadaCertificateRequest): Uint8Array => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16
  });

  // Page dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Modern Color Palette
  const colors = {
    primary: '#0F4C3A',      // Deep Islamic Green
    secondary: '#D4AF37',    // Gold
    accent: '#2E8B57',       // Sea Green
    dark: '#1A1A1A',         // Near Black
    light: '#F8F9FA',        // Off White
    gray: '#6C757D',         // Gray
    border: '#E9ECEF'        // Light Gray
  };

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Modern geometric border
  doc.setFillColor(colors.primary);
  doc.rect(0, 0, pageWidth, 8, 'F');
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');

  // Gold accent lines
  doc.setDrawColor(colors.secondary);
  doc.setLineWidth(0.5);
  doc.line(margin, 25, pageWidth - margin, 25);
  doc.line(margin, 272, pageWidth - margin, 272);

  // HEADER SECTION
  doc.setFillColor(colors.primary);
  doc.circle(35, 45, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('☪', 35, 50, { align: 'center' });

  doc.setTextColor(colors.primary);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SHAHADA CERTIFICATE', 105, 40, { align: 'center' });

  doc.setTextColor(colors.gray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Islamic Conversion Certificate', 105, 48, { align: 'center' });

  doc.setTextColor(colors.dark);
  doc.setFontSize(8);
  doc.text('REPUBLIC OF RWANDA - MINISTRY OF ISLAMIC AFFAIRS', 105, 55, { align: 'center' });

  // ARABIC SECTION
  doc.setTextColor(colors.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('شهادة الشهادة', 105, 75, { align: 'center' });

  doc.setTextColor(colors.accent);
  doc.setFontSize(11);
  doc.text('بسم الله الرحمن الرحيم', 105, 85, { align: 'center' });

  // Modern divider
  doc.setDrawColor(colors.border);
  doc.setLineWidth(0.3);
  doc.line(60, 92, 150, 92);

  // MAIN CONTENT
  const startY = 105;
  
  // Personal Information Card
  doc.setFillColor(colors.light);
  doc.roundedRect(margin, startY, contentWidth, 75, 3, 3, 'F');
  
  doc.setFillColor(colors.primary);
  doc.roundedRect(margin, startY, contentWidth, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONAL INFORMATION', margin + 5, startY + 8);

  const labelX = margin + 8;
  const valueX = margin + 45;
  let currentY = startY + 22;
  
  const drawField = (label: string, value: string, y: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.gray);
    doc.text(label, labelX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark);
    doc.text(value || '__________________', valueX, y);
  };

  drawField('Full Name:', data.fullName, currentY);
  currentY += 12;
  
  if (data.formerName) {
    drawField('Former Name:', data.formerName, currentY);
    currentY += 12;
  }
  
  drawField('Date of Birth:', data.dateOfBirth, currentY);
  currentY += 12;
  drawField('Nationality:', data.nationality, currentY);
  currentY += 12;
  drawField('ID Number:', data.idNumber, currentY);

  // SHAHADA DECLARATION
  const declarationY = startY + 85;
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, declarationY, contentWidth, 55, 3, 3, 'D');
  
  doc.setFillColor(colors.secondary);
  doc.rect(margin, declarationY, 4, 55, 'F');

  doc.setTextColor(colors.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARATION OF FAITH', margin + 10, declarationY + 12);

  doc.setTextColor(colors.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('"I bear witness that there is no deity worthy of worship', 105, declarationY + 25, { align: 'center' });
  doc.text('except Allah, and I bear witness that Muhammad', 105, declarationY + 33, { align: 'center' });
  doc.text('is His servant and Messenger."', 105, declarationY + 41, { align: 'center' });

  doc.setTextColor(colors.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله', 105, declarationY + 52, { align: 'center' });

  // CEREMONY DETAILS
  const detailsY = declarationY + 65;
  const col1X = margin + 5;
  const col2X = 115;
  
  doc.setFillColor(colors.light);
  doc.roundedRect(margin, detailsY, contentWidth, 35, 3, 3, 'F');
  
  doc.setTextColor(colors.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CEREMONY DETAILS', col1X, detailsY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.gray);
  doc.text(`Date: ${data.shahadaDate}`, col1X, detailsY + 20);
  doc.text(`Location: ${data.location}`, col1X, detailsY + 28);
  
  doc.setTextColor(colors.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('WITNESS', col2X, detailsY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.gray);
  doc.text(data.witnessName, col2X, detailsY + 20);
  doc.text(data.witnessTitle, col2X, detailsY + 28);

  // FOOTER
  const footerY = 250;
  
  doc.setDrawColor(colors.border);
  doc.setLineWidth(0.2);
  doc.line(margin + 10, footerY, margin + 80, footerY);
  doc.setTextColor(colors.gray);
  doc.setFontSize(8);
  doc.text('Authorized Signature', margin + 10, footerY + 6);
  doc.text('Islamic Affairs Officer', margin + 10, footerY + 11);
  
  doc.line(115, footerY, 185, footerY);
  doc.text('Witness Signature', 115, footerY + 6);
  doc.text(data.witnessName, 115, footerY + 11);

  doc.setDrawColor(colors.secondary);
  doc.setLineWidth(1);
  doc.circle(150, footerY - 15, 12, 'S');
  doc.setTextColor(colors.secondary);
  doc.setFontSize(7);
  doc.text('OFFICIAL', 150, footerY - 12, { align: 'center' });
  doc.text('SEAL', 150, footerY - 7, { align: 'center' });

  doc.setFillColor(colors.primary);
  doc.roundedRect(margin, 275, contentWidth, 18, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Certificate ID: ${data.certificateId}`, margin + 8, 282);
  doc.text(`Issue Date: ${data.issueDate}`, margin + 8, 288);

  // Security watermark
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL', 105, 180, { align: 'center', angle: 45 });

  return doc.output('arraybuffer') as Uint8Array;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  try {
    const { applicationId, fullName, formerName, dateOfBirth, nationality, idNumber, shahadaDate, location, witnessName, witnessTitle, certificateId, issueDate } = await req.json();

    if (!fullName || !shahadaDate || !witnessName) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: fullName, shahadaDate, witnessName' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pdfBuffer = generateCertificatePDF({
      applicationId,
      fullName,
      formerName,
      dateOfBirth,
      nationality,
      idNumber,
      shahadaDate,
      location,
      witnessName,
      witnessTitle,
      certificateId,
      issueDate
    });

    const fileName = `shahada-certificate-${fullName.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  } catch (error) {
    console.error('Error generating Shahada certificate:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
