import { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Import translations
import enTranslations from '../../locales/en.json';
import rwTranslations from '../../locales/rw.json';
import arTranslations from '../../locales/ar.json';
import frTranslations from '../../locales/fr.json';

// Type for supported languages
export type SupportedLanguage = 'en' | 'rw' | 'ar' | 'fr';

// Translation map
const translations = {
  en: enTranslations,
  rw: rwTranslations,
  ar: arTranslations,
  fr: frTranslations
};

// Multilingual Shahada Certificate Generator
export interface ShahadaCertificateData {
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
  qrcode?: string;
  language?: SupportedLanguage;
}

export const generateMultilingualShahadaCertificate = (data: ShahadaCertificateData) => {
  const lang = data.language || 'en';
  const t = translations[lang];
  
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

  // Background - Clean white with subtle gradient effect
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Modern geometric border - top and bottom
  doc.setFillColor(colors.primary);
  doc.rect(0, 0, pageWidth, 8, 'F');
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');

  // Gold accent lines
  doc.setDrawColor(colors.secondary);
  doc.setLineWidth(0.5);
  doc.line(margin, 25, pageWidth - margin, 25);
  doc.line(margin, 272, pageWidth - margin, 272);

  // HEADER SECTION
  // Logo/Emblem area (left)
  doc.setFillColor(colors.primary);
  doc.circle(35, 45, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('☪', 35, 50, { align: 'center' });

  // Title area (center-right) - Using translated title
  doc.setTextColor(colors.primary);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, 105, 40, { align: 'center' });

  doc.setTextColor(colors.gray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(t.subtitle, 105, 48, { align: 'center' });

  // Government/Authority line - Using translated government
  doc.setTextColor(colors.dark);
  doc.setFontSize(8);
  doc.text(t.government, 105, 55, { align: 'center' });

  // ARABIC SECTION - Always keep Arabic
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

  // MAIN CONTENT - Modern card-style layout
  const startY = 105;
  
  // Section: Personal Information - Using translated section title
  doc.setFillColor(colors.light);
  doc.roundedRect(margin, startY, contentWidth, 75, 3, 3, 'F');
  
  // Section header
  doc.setFillColor(colors.primary);
  doc.roundedRect(margin, startY, contentWidth, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(t.personalInformation, margin + 5, startY + 8);

  // Content fields - Modern grid layout with translated labels
  doc.setTextColor(colors.dark);
  doc.setFontSize(9);
  
  const labelX = margin + 8;
  const valueX = margin + 45;
  let currentY = startY + 22;
  
  // Field styling with translated labels
  const drawField = (label: string, value: string, y: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.gray);
    doc.text(label, labelX, y);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark);
    doc.text(value || '__________________', valueX, y);
  };

  drawField(t.fullName, data.fullName, currentY);
  currentY += 12;
  
  if (data.formerName) {
    drawField(t.formerName, data.formerName, currentY);
    currentY += 12;
  }
  
  drawField(t.dateOfBirth, data.dateOfBirth, currentY);
  currentY += 12;
  drawField(t.nationality, data.nationality, currentY);
  currentY += 12;
  drawField(t.idNumber, data.idNumber, currentY);

  // SHAHADA DECLARATION SECTION - Using translated section title
  const declarationY = startY + 85;
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, declarationY, contentWidth, 55, 3, 3, 'D');
  
  // Decorative left border
  doc.setFillColor(colors.secondary);
  doc.rect(margin, declarationY, 4, 55, 'F');

  doc.setTextColor(colors.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.declarationOfFaith, margin + 10, declarationY + 12);

  // Shahada text with modern styling - Using translated text
  doc.setTextColor(colors.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(t.shahadaText, 105, declarationY + 25, { align: 'center' });
  doc.text(t.shahadaText.split(' ').slice(0, 7).join(' ') + '...', 105, declarationY + 33, { align: 'center' });
  doc.text(t.shahadaText.split(' ').slice(-5).join(' ') + '"', 105, declarationY + 41, { align: 'center' });

  // Arabic Shahada - Always keep Arabic
  doc.setTextColor(colors.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(t.shahadaArabic, 105, declarationY + 52, { align: 'center' });

  // CEREMONY DETAILS - Using translated section title
  const detailsY = declarationY + 65;
  
  // Two column layout
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

  // FOOTER SECTION - Using translated labels
  const footerY = 250;
  
  // Modern signature area
  doc.setDrawColor(colors.border);
  doc.setLineWidth(0.2);
  
  // Signature line 1 - Using translated labels
  doc.line(margin + 10, footerY, margin + 80, footerY);
  doc.setTextColor(colors.gray);
  doc.setFontSize(8);
  doc.text(t.authorizedSignature, margin + 10, footerY + 6);
  doc.text(t.islamicAffairsOfficer, margin + 10, footerY + 11);
  
  // Signature line 2 - Using translated labels
  doc.line(115, footerY, 185, footerY);
  doc.text(t.witnessSignature, 115, footerY + 6);
  doc.text(data.witnessName, 115, footerY + 11);

  // Official Seal placeholder - Using translated seal text
  doc.setDrawColor(colors.secondary);
  doc.setLineWidth(1);
  doc.circle(150, footerY - 15, 12, 'S');
  doc.setTextColor(colors.secondary);
  doc.setFontSize(7);
  doc.text(t.officialSeal, 150, footerY - 12, { align: 'center' });
  doc.text(t.officialSeal.split(' ')[1], 150, footerY - 7, { align: 'center' });

  // Certificate ID and Issue Date - Using translated labels
  doc.setFillColor(colors.primary);
  doc.roundedRect(margin, 275, contentWidth, 18, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.certificateId}: ${data.certificateId}`, margin + 8, 282);
  doc.text(`${t.issueDate}: ${data.issueDate}`, margin + 8, 288);
  
  // QR Code placeholder area - Using translated QR text
  if (data.qrcode) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(160, 276, 20, 16, 2, 2, 'F');
    doc.setTextColor(colors.dark);
    doc.setFontSize(6);
    doc.text(t.scanToVerify.split(' ')[0], 170, 282, { align: 'center' });
    doc.text(t.scanToVerify.split(' ')[1], 170, 286, { align: 'center' });
  }

  // Security watermark (subtle)
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL', 105, 180, { align: 'center', angle: 45 });

  return doc;
};

// Helper function to save certificate with language in filename
export const downloadMultilingualCertificate = (data: ShahadaCertificateData) => {
  const lang = data.language || 'en';
  const doc = generateMultilingualShahadaCertificate(data);
  const fileName = `shahada-certificate-${lang}-${data.fullName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(fileName);
  return fileName;
};

// React component for multilingual certificate download
export const MultilingualShahadaCertificateDownload = ({ 
  certificateData, 
  buttonText = "Download Certificate" 
}: { 
  certificateData: ShahadaCertificateData; 
  buttonText?: string;
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');

  const handleDownload = () => {
    downloadMultilingualCertificate({
      ...certificateData,
      language: selectedLanguage
    });
  };

  const languageOptions: { value: SupportedLanguage; label: string; flag: string }[] = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' }
  ];

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Shahada Certificate</h3>
        <p className="text-sm text-gray-600">Download your official Islamic conversion certificate</p>
      </div>
      
      {/* Language Selection */}
      <div className="flex flex-wrap gap-2 justify-center">
        {languageOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedLanguage(option.value)}
            className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
              selectedLanguage === option.value
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
            }`}
          >
            <span className="mr-2">{option.flag}</span>
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
      
      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <span className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-6-6m6 6v6m0-6l-6-6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0h6" />
          </svg>
          {buttonText} ({languageOptions.find(opt => opt.value === selectedLanguage)?.label})
        </span>
      </button>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Certificate ID: {certificateData.certificateId} | Language: {selectedLanguage.toUpperCase()}
      </div>
    </div>
  );
};
