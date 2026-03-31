/// <reference path="../deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Multilingual translations for the Edge Function
const translations = {
  en: {
    title: "Shahada Certificate",
    subtitle: "Islamic Conversion Certificate",
    government: "REPUBLIC OF RWANDA - MINISTRY OF ISLAMIC AFFAIRS",
    arabicTitle: "شهادة الشهادة",
    bismillah: "بسم الله الرحمن الرحيم",
    personalInformation: "Personal Information",
    fullName: "Full Name",
    formerName: "Former Name",
    dateOfBirth: "Date of Birth",
    nationality: "Nationality",
    idNumber: "ID Number",
    declarationOfFaith: "Declaration of Faith",
    shahadaText: "\"I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and Messenger.\"",
    shahadaArabic: "أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله",
    ceremonyDetails: "Ceremony Details",
    date: "Date",
    location: "Location",
    witness: "Witness",
    authorizedSignature: "Authorized Signature",
    islamicAffairsOfficer: "Islamic Affairs Officer",
    witnessSignature: "Witness Signature",
    officialSeal: "OFFICIAL SEAL",
    certificateId: "Certificate ID",
    issueDate: "Issue Date",
    scanToVerify: "SCAN TO VERIFY",
    downloadReady: "Assalamu Alaikum, your Shahada certificate is ready. Please check your email or download from your account."
  },
  rw: {
    title: "Impamyabumenyi ya Shahada",
    subtitle: "Impamyabumenyi yo guhindura mu Islam",
    government: "REPUBURIKA Y'U RWANDA - MINISTERE Y'UBUKUNZI BWA ISLAM",
    arabicTitle: "شهادة الشهادة",
    bismillah: "بسم الله الرحمن الرحيم",
    personalInformation: "Amakuru y'umuntu",
    fullName: "Izina ry'ukuri",
    formerName: "Izina rya mbere",
    dateOfBirth: "Itariki y'amavuko",
    nationality: "Ubwenegihugu",
    idNumber: "Umubare w'indangamuntu",
    declarationOfFaith: "Iyandikire ry'ukwemera",
    shahadaText: "\"Ndemeza ko nta Imana iriho uretse Allah, kandi ndemeza ko Muhammad y'umwigisha we.\"",
    shahadaArabic: "أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله",
    ceremonyDetails: "Amakuru y'ubutabizano",
    date: "Itariki",
    location: "Aho biherereye",
    witness: "Uwabonye",
    authorizedSignature: "Uruhandura rwemewe",
    islamicAffairsOfficer: "Umuyobozi w'ubukungu bwa Islam",
    witnessSignature: "Uruhandura rwa uwabonye",
    officialSeal: "Uruhandura RWA LETA",
    certificateId: "Umubare w'impamyabumenyi",
    issueDate: "Itariki yo gutangura",
    scanToVerify: "SUKA KUGENZURA",
    downloadReady: "Assalamu Alaikum, impamyabumenyi yawe ya Shahada yashize. Reba imeri yawe cyangwa yakure kuri konti yawe."
  },
  ar: {
    title: "شهادة الشهادة",
    subtitle: "شهادة اعتناق الإسلام",
    government: "جمهورية رواندا - وزارة الشؤون الإسلامية",
    arabicTitle: "شهادة الشهادة",
    bismillah: "بسم الله الرحمن الرحيم",
    personalInformation: "المعلومات الشخصية",
    fullName: "الاسم الكامل",
    formerName: "الاسم السابق",
    dateOfBirth: "تاريخ الميلاد",
    nationality: "الجنسية",
    idNumber: "رقم الهوية",
    declarationOfFaith: "إعلان الإيمان",
    shahadaText: "\"أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمداً عبده ورسوله.\"",
    shahadaArabic: "أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله",
    ceremonyDetails: "تفاصيل الحفل",
    date: "التاريخ",
    location: "المكان",
    witness: "الشاهد",
    authorizedSignature: "التوقيع المعتمد",
    islamicAffairsOfficer: "موظف الشؤون الإسلامية",
    witnessSignature: "توقيع الشاهد",
    officialSeal: "الختم الرسمي",
    certificateId: "رقم الشهادة",
    issueDate: "تاريخ الإصدار",
    scanToVerify: "امسح للتحقق",
    downloadReady: "السلام عليكم، شهادة الشهادة الخاصة بك جاهزة. يرجى التحقق من بريدك الإلكتروني أو التحميل من حسابك."
  },
  fr: {
    title: "Certificat de Shahada",
    subtitle: "Certificat de Conversion Islamique",
    government: "RÉPUBLIQUE DU RWANDA - MINISTÈRE DES AFFAIRES ISLAMIQUES",
    arabicTitle: "شهادة الشهادة",
    bismillah: "بسم الله الرحمن الرحيم",
    personalInformation: "Informations Personnelles",
    fullName: "Nom Complet",
    formerName: "Nom Précédent",
    dateOfBirth: "Date de Naissance",
    nationality: "Nationalité",
    idNumber: "Numéro d'Identité",
    declarationOfFaith: "Déclaration de Foi",
    shahadaText: "\"Je témoigne qu'il n'y a de divinité digne d'adoration qu'Allah, et je témoigne que Muhammad est Son serviteur et Messager.\"",
    shahadaArabic: "أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله",
    ceremonyDetails: "Détails de la Cérémonie",
    date: "Date",
    location: "Lieu",
    witness: "Témoin",
    authorizedSignature: "Signature Autorisée",
    islamicAffairsOfficer: "Responsable des Affaires Islamiques",
    witnessSignature: "Signature du Témoin",
    officialSeal: " SCEAU OFFICIEL",
    certificateId: "Numéro de Certificat",
    issueDate: "Date d'Émission",
    scanToVerify: "SCANNER POUR VÉRIFIER",
    downloadReady: "Assalamu Alaikum, votre certificat de Shahada est prêt. Veuillez vérifier votre e-mail ou télécharger depuis votre compte."
  }
};

type SupportedLanguage = 'en' | 'rw' | 'ar' | 'fr';

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
  passportPhotoUrl?: string;
  language?: SupportedLanguage;
}

const generateCertificatePDF = async (data: ShahadaCertificateRequest): Promise<Uint8Array> => {
  // Import jsPDF dynamically - TypeScript will ignore module resolution at runtime
  // @ts-ignore - Deno runtime will resolve these imports correctly
  const jsPDFModule = await import("https://esm.sh/jspdf@2.5.1");
  // @ts-ignore - Deno runtime will resolve these imports correctly  
  const autoTableModule = await import("https://esm.sh/jspdf-autotable@3.8.2");
  
  const jsPDF = jsPDFModule.default;
  const { autoTable } = autoTableModule;

  const lang = data.language || 'en';
  const t = translations[lang];

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16
  } as any);

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
  // Add logo image
  try {
    const logoUrl = "https://olpvftgnmycofavltxoa.supabase.co/storage/v1/object/public/logo/logo.png";
    const logoResponse = await fetch(logoUrl);
    
    if (logoResponse.ok) {
      const logoArrayBuffer = await logoResponse.arrayBuffer();
      const logoImage = await doc.addImage(logoArrayBuffer, 'PNG', 25, 35, 20, 20);
      console.log('Logo added successfully');
    } else {
      console.log('Logo not found, using fallback');
      // Fallback: Islamic symbol circle
      doc.setFillColor(colors.primary);
      doc.circle(35, 45, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('☪', 35, 50, { align: 'center' });
    }
  } catch (error) {
    console.log('Error adding logo, using fallback:', error);
    // Fallback: Islamic symbol circle
    doc.setFillColor(colors.primary);
    doc.circle(35, 45, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('☪', 35, 50, { align: 'center' });
  }

  doc.setTextColor(colors.primary);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, 105, 40, { align: 'center' });

  doc.setTextColor(colors.gray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(t.subtitle, 105, 48, { align: 'center' });

  doc.setTextColor(colors.dark);
  doc.setFontSize(8);
  doc.text(t.government, 105, 55, { align: 'center' });

  // ARABIC SECTION
  doc.setTextColor(colors.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t.arabicTitle, 105, 75, { align: 'center' });

  doc.setTextColor(colors.accent);
  doc.setFontSize(11);
  doc.text(t.bismillah, 105, 85, { align: 'center' });

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
  doc.text(t.personalInformation, margin + 5, startY + 8);

  const labelX = margin + 8;
  const valueX = margin + 45;
  let currentY = startY + 22;
  
  // Add passport photo if available
  console.log('📸 Photo check - passportPhotoUrl:', data.passportPhotoUrl ? 'PRESENT' : 'MISSING');
  
  if (data.passportPhotoUrl) {
    try {
      console.log('📸 Fetching passport photo from:', data.passportPhotoUrl);
      const photoResponse = await fetch(data.passportPhotoUrl);
      
      console.log('📸 Photo fetch response:', {
        status: photoResponse.status,
        ok: photoResponse.ok,
        contentType: photoResponse.headers.get('content-type')
      });
      
      if (photoResponse.ok) {
        const photoArrayBuffer = await photoResponse.arrayBuffer();
        console.log('📸 Photo downloaded, size:', photoArrayBuffer.byteLength, 'bytes');
        
        // Add photo to the right side of personal info
        const photoX = pageWidth - margin - 35;
        const photoY = startY + 15;
        const photoSize = 30;
        
        // Add photo border
        doc.setDrawColor(colors.border);
        doc.setLineWidth(0.5);
        doc.rect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4);
        
        // Add photo
        await doc.addImage(photoArrayBuffer, 'JPEG', photoX, photoY, photoSize, photoSize);
        console.log('✅ Passport photo added successfully to PDF');
        
        // Adjust text width to accommodate photo
        currentY = startY + 22;
      } else {
        console.log('❌ Failed to fetch passport photo:', photoResponse.status, photoResponse.statusText);
      }
    } catch (error) {
      console.log('❌ Error adding passport photo:', error instanceof Error ? error.message : error);
    }
  } else {
    console.log('⚠️ No passportPhotoUrl provided in data');
  }
  
  const drawField = (label: string, value: string, y: number, maxWidth?: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.gray);
    doc.text(label, labelX, y, { maxWidth: maxWidth || 100 });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark);
    doc.text(value || '__________________', valueX, y, { maxWidth: maxWidth || 120 });
  };

  // Adjust field positions if photo is present
  const fieldMaxWidth = data.passportPhotoUrl ? 80 : 120;
  
  drawField(t.fullName, data.fullName, currentY, fieldMaxWidth);
  currentY += 12;
  
  if (data.formerName) {
    drawField(t.formerName, data.formerName, currentY, fieldMaxWidth);
    currentY += 12;
  }
  
  drawField(t.dateOfBirth, data.dateOfBirth, currentY, fieldMaxWidth);
  currentY += 12;
  drawField(t.nationality, data.nationality, currentY, fieldMaxWidth);
  currentY += 12;
  drawField(t.idNumber, data.idNumber, currentY, fieldMaxWidth);

  // SHAHADA DECLARATION
  const declarationY = startY + 85;
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, declarationY, contentWidth, 55, 3, 3, 'D');
  
  doc.setFillColor(colors.secondary);
  doc.rect(margin, declarationY, 4, 55, 'F');

  doc.setTextColor(colors.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.declarationOfFaith, margin + 10, declarationY + 12);

  doc.setTextColor(colors.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(t.shahadaText, 105, declarationY + 25, { align: 'center' });
  doc.text(t.shahadaText.split(' ').slice(0, 7).join(' ') + '...', 105, declarationY + 33, { align: 'center' });
  doc.text(t.shahadaText.split(' ').slice(-5).join(' ') + '"', 105, declarationY + 41, { align: 'center' });

  doc.setTextColor(colors.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(t.shahadaArabic, 105, declarationY + 52, { align: 'center' });

  // CEREMONY DETAILS
  const detailsY = declarationY + 65;
  const col1X = margin + 5;
  const col2X = 115;
  
  doc.setFillColor(colors.light);
  doc.roundedRect(margin, detailsY, contentWidth, 35, 3, 3, 'F');
  
  doc.setTextColor(colors.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(t.ceremonyDetails, col1X, detailsY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.gray);
  doc.text(`${t.date}: ${data.shahadaDate}`, col1X, detailsY + 20);
  doc.text(`${t.location}: ${data.location}`, col1X, detailsY + 28);
  
  doc.setTextColor(colors.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(t.witness, col2X, detailsY + 10);
  
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
  doc.text(t.authorizedSignature, margin + 10, footerY + 6);
  doc.text(t.islamicAffairsOfficer, margin + 10, footerY + 11);
  
  doc.line(115, footerY, 185, footerY);
  doc.text(t.witnessSignature, 115, footerY + 6);
  doc.text(data.witnessName, 115, footerY + 11);

  doc.setDrawColor(colors.secondary);
  doc.setLineWidth(1);
  doc.circle(150, footerY - 15, 12, 'S');
  doc.setTextColor(colors.secondary);
  doc.setFontSize(7);
  doc.text(t.officialSeal, 150, footerY - 12, { align: 'center' });
  doc.text(t.officialSeal.split(' ')[1], 150, footerY - 7, { align: 'center' });

  doc.setFillColor(colors.primary);
  doc.roundedRect(margin, 275, contentWidth, 18, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.certificateId}: ${data.certificateId}`, margin + 8, 282);
  doc.text(`${t.issueDate}: ${data.issueDate}`, margin + 8, 288);

  // Security watermark
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL', 105, 180, { align: 'center', angle: 45 });

  // QR Code for verification
  const qrCodeUrl = `https://olpvftgnmycofavltxoa.supabase.co/verify-certificate?certificateId=${data.certificateId}`;
  doc.setTextColor(colors.primary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(t.scanToVerify, 150, 200, { align: 'center' });
  
  // QR Code placeholder (visual representation)
  doc.setDrawColor(colors.primary);
  doc.setLineWidth(1);
  const qrSize = 25;
  const qrX = 137.5; // Center position
  const qrY = 210;
  
  // Draw QR code border
  doc.rect(qrX, qrY, qrSize, qrSize);
  
  // Draw QR code pattern (simplified)
  const qrPattern = [
    [1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,1,1,0,0,0,0,0,1,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,1,0,1,1,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,0,0,1,1,0,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,1,1,1,1,0,1,0,0,0,0,0,1,1,1,1,0],
    [1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,0,1,1,1,0,0,1,0,1,0,1,0,1,1,1,0,0],
    [1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
    [0,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,0,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1],
    [1,1,1,1,0,0,1,0,1,0,1,0,1,0,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,0,0,0,1,1,0,0],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1],
    [1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,1,1,0,0,0,0,0,1,0],
    [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,0,0,1,0,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,0,1,1,1,0,0,1,0,1,0,1,0,1,1,1,0,0],
    [1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
    [0,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,0,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1],
    [1,1,1,1,0,0,1,0,1,0,1,0,1,0,0,1,1,1,0,1,0,1,0,1]
  ];
  
  const cellSize = qrSize / 25;
  qrPattern.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 1) {
        doc.setFillColor(colors.primary);
        doc.rect(qrX + j * cellSize, qrY + i * cellSize, cellSize, cellSize, 'F');
      }
    });
  });
  
  // QR Code URL below
  doc.setTextColor(colors.gray);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(qrCodeUrl, 150, qrY + qrSize + 5, { align: 'center', maxWidth: 50 });

  return doc.output('arraybuffer') as unknown as Uint8Array;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId, fullName, formerName, dateOfBirth, nationality, idNumber, shahadaDate, location, witnessName, witnessTitle, certificateId, issueDate, passportPhotoUrl, language = 'en' } = await req.json();

    if (!fullName || !shahadaDate || !witnessName) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: fullName, shahadaDate, witnessName' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const pdfBuffer = await generateCertificatePDF({
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
      issueDate,
      passportPhotoUrl,
      language
    });

    const fileName = `shahada-certificate-${language}-${fullName.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    return new Response(pdfBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error generating Shahada certificate:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
