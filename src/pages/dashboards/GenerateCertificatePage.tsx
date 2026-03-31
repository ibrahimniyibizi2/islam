import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, FileCheck, Printer, Award, QrCode, Stamp, UserCircle, Shield, Check, Lock, Fingerprint, Hash, Download, Mail } from 'lucide-react';
import { QRCodeSVG as RealQRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NikahApplication {
  id: string;
  groom_name: string;
  bride_name: string;
  groom_national_id: string;
  bride_national_id: string;
  preferred_date: string;
  preferred_masjid: string;
  status: string;
  created_at: string;
  certificate_number?: string;
  certificate_issued_at?: string;
  imam_name?: string;
  witness_1_name?: string;
  witness_2_name?: string;
  preferred_imam?: string;
  male_witness_name?: string;
  female_witness1_name?: string;
  groom_passport_photo_url?: string;
  bride_passport_photo_url?: string;
  groom_birth_cert_url?: string;
  bride_birth_cert_url?: string;
  groom_id_document_url?: string;
  bride_id_document_url?: string;
  hiv_test_url?: string;
}

interface ShahadaApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  date_of_birth: string | null;
  previous_religion: string | null;
  address: string | null;
  status: string;
  created_at: string;
  certificate_number?: string;
  certificate_issued_at?: string;
  witness1_name: string;
  witness2_name: string;
  declaration_text?: string;
  // Additional optional fields from database
  gender?: string;
  nationality?: string;
  city?: string;
  district?: string;
  conversion_reason?: string;
  islamic_knowledge?: string;
  witness1_phone?: string;
  witness1_relationship?: string;
  witness2_phone?: string;
  witness2_relationship?: string;
  additional_info?: string;
  updated_at?: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  is_active: boolean;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_gradient_start: string;
  background_gradient_end: string;
  border_style: string;
  header_title: string;
  organization_name: string;
  certificate_type: string;
  footer_text: string;
  legal_notice: string;
  organization_logo_url?: string;
  organization_stamp_url?: string;
  chief_registrar_name?: string;
  chief_registrar_title: string;
  show_photos: boolean;
  show_qr_code: boolean;
  show_barcode: boolean;
  show_nfc_indicator: boolean;
  photo_frame_style: string;
  show_watermark: boolean;
  watermark_text?: string;
  enable_guilloche_pattern: boolean;
  enable_holographic_seal: boolean;
  enable_official_stamp: boolean;
  enable_security_thread: boolean;
  enable_uv_reactive: boolean;
  enable_metallic_strip: boolean;
  enable_digital_signature: boolean;
  enable_machine_readable_zone: boolean;
  enable_microprint: boolean;
  enable_security_fibers: boolean;
  enable_color_shifting_ink: boolean;
  enable_anti_copy_pattern: boolean;
  certificate_prefix: string;
  certificate_format: string;
  custom_fields?: any[];
  created_at: string;
  updated_at: string;
}

// Embossed Seal Effect
function EmbossedSeal() {
  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-amber-600/20 shadow-inner opacity-50" 
         style={{ 
           boxShadow: 'inset 0 0 20px rgba(217, 119, 6, 0.2), 0 0 10px rgba(217, 119, 6, 0.1)',
           background: 'radial-gradient(circle, transparent 40%, rgba(217,119,6,0.1) 70%)'
         }} />
  );
}

// Optical Variable Device (changes color when tilted)
function OpticalVariableDevice() {
  return (
    <div className="absolute bottom-20 left-10 w-8 h-8 rounded-full"
         style={{
           background: 'conic-gradient(from 0deg, #ff0000, #00ff00, #0000ff, #ff0000)',
           filter: 'blur(1px)'
         }} />
  );
}

// Security Fibers
function SecurityFibers() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      {[...Array(5)].map((_, i) => (
        <div key={i} 
             className="absolute w-px h-4 bg-red-500/40 rotate-45"
             style={{
               left: `${20 + i * 15}%`,
               top: `${10 + i * 20}%`
             }} />
      ))}
    </div>
  );
}

// Thermochromic Ink Indicator
function ThermochromicIndicator() {
  return (
    <div className="flex items-center gap-1 text-[8px] text-gray-400">
      <span className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
      <span>Thermo</span>
    </div>
  );
}

// Perforation Marks
function PerforationMarks() {
  return (
    <div className="absolute left-0 right-0 top-1/2 h-px flex justify-between opacity-20">
      {[...Array(50)].map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full bg-gray-400" />
      ))}
    </div>
  );
}

// Latent Image (hidden pattern)
function LatentImage() {
  return (
    <div className="absolute bottom-40 right-10 w-12 h-12 opacity-10 rotate-45">
      <div className="w-full h-full bg-gradient-to-br from-amber-600 to-transparent" />
    </div>
  );
}

// Color Shifting Ink Effect
function ColorShiftingText({ text }: { text: string }) {
  return (
    <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent animate-pulse font-bold">
      {text}
    </span>
  );
}

// Anti-Copy Pattern (shows "VOID" when copied)
function AntiCopyPattern() {
  return (
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <div className="w-full h-full" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(255,0,0,0.1) 10px,
          rgba(255,0,0,0.1) 20px
        )`
      }} />
    </div>
  );
}

// Foil Stamping Effect
function FoilStamp({ text }: { text: string }) {
  return (
    <div className="relative inline-block">
      <span className="text-amber-500 font-bold" style={{
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c2 50%, #d4af37 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        {text}
      </span>
    </div>
  );
}

// NFC/RFID Indicator
function NFCIndicator() {
  return (
    <div className="flex flex-col items-center bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
        <span className="text-[8px] font-bold text-blue-600 uppercase">NFC</span>
      </div>
      <p className="text-[6px] text-blue-500">Tap to verify</p>
    </div>
  );
}

// Holographic Strip
function HolographicStrip() {
  return (
    <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent">
      <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_5px,rgba(255,255,255,0.3)_5px,rgba(255,255,255,0.3)_10px)]" />
    </div>
  );
}

// Rainbow Printing Effect
function RainbowText({ text }: { text: string }) {
  return (
    <span className="bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent font-bold">
      {text}
    </span>
  );
}

// Ghost Image (faint secondary photo)
function GhostImage({ name }: { name: string }) {
  return (
    <div className="absolute top-20 left-20 w-24 h-24 rounded-full bg-gray-200/20 flex items-center justify-center pointer-events-none">
      <span className="text-4xl font-bold text-gray-300/30 uppercase">{name.charAt(0)}</span>
    </div>
  );
}

// See-through Register (alignment mark)
function SeeThroughRegister() {
  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400/50 border-2 border-amber-600" />
  );
}

// Kinegram Effect (shimmering pattern)
function KinegramEffect() {
  return (
    <div className="absolute right-20 top-20 w-16 h-16 opacity-20">
      <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,amber_30deg,transparent_60deg,amber_90deg,transparent_120deg,amber_150deg,transparent_180deg,amber_210deg,transparent_240deg,amber_270deg,transparent_300deg,amber_330deg,transparent_360deg)] animate-spin" style={{ animationDuration: '8s' }} />
    </div>
  );
}

// Metallic Strip Component
function MetallicStrip() {
  return (
    <div className="absolute right-12 top-0 bottom-0 w-3 bg-gradient-to-b from-gray-300 via-gray-100 to-gray-300 opacity-40">
      <div className="h-full w-full bg-[repeating-linear-gradient(180deg,#c0c0c0,#e8e8e8_2px,#c0c0c0_4px)]" />
    </div>
  );
}

// Machine Readable Zone (MRZ)
function MachineReadableZone({ certNumber, appId }: { certNumber: string; appId: string }) {
  const line1 = `RCN<<${certNumber}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`;
  const line2 = `${appId.slice(0, 12)}${Date.now().toString().slice(-8)}RWA<<<<<<<<<<<${new Date().getFullYear().toString().slice(-2)}`;
  
  return (
    <div className="bg-gray-100 p-2 rounded font-mono text-[8px] tracking-wider text-gray-700 mt-2">
      <p className="whitespace-nowrap">{line1}</p>
      <p className="whitespace-nowrap">{line2}</p>
    </div>
  );
}

// Laser Engraved Portrait Effect
function LaserPortraitOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-multiply">
      <div className="w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
    </div>
  );
}

// Barcode Component
function BarcodeSVG({ value }: { value: string }) {
  // Generate a simple barcode pattern
  const generateBars = () => {
    const bars = [];
    let x = 0;
    for (let i = 0; i < 30; i++) {
      const width = Math.random() > 0.5 ? 2 : 1;
      const height = Math.random() > 0.3 ? 40 : 35;
      bars.push(
        <rect
          key={i}
          x={x}
          y={0}
          width={width}
          height={height}
          fill="#000"
        />
      );
      x += width + 1;
    }
    return bars;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="45" viewBox="0 0 90 45" className="bg-white">
        {generateBars()}
      </svg>
      <p className="text-[8px] font-mono text-gray-500 mt-0.5">{value.slice(-8)}</p>
    </div>
  );
}

// Security Thread Component
function SecurityThread() {
  return (
    <div className="absolute left-8 top-0 bottom-0 w-2 bg-gradient-to-b from-transparent via-amber-400/60 to-transparent">
      <div className="h-full w-full bg-[repeating-linear-gradient(180deg,transparent,transparent_10px,#f59e0b_10px,#f59e0b_12px)] opacity-50" />
    </div>
  );
}

// UV Reactive Element
function UVElement({ text }: { text: string }) {
  return (
    <div className="hidden print:block absolute top-20 right-20 bg-purple-100/20 p-2 rounded">
      <p className="text-purple-600 font-bold text-xs opacity-60">{text}</p>
    </div>
  );
}

// Watermark Text
function WatermarkText({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-30deg]">
      <p className="text-6xl font-bold text-gray-800 uppercase tracking-widest">{text}</p>
    </div>
  );
}

// Digital Signature Hash Component
function DigitalSignatureHash({ appId, certNumber }: { appId: string; certNumber: string }) {
  // Generate a deterministic hash based on appId and certNumber
  const generateHash = () => {
    const data = `${appId}:${certNumber}:${new Date().toISOString().slice(0, 10)}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(16, '0');
  };

  const hash = generateHash();
  const shortHash = `${hash.slice(0, 4)}...${hash.slice(-4)}`;

  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <Fingerprint className="w-4 h-4 text-green-600" />
      <div>
        <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Digital Signature</p>
        <p className="text-xs font-mono text-green-800 font-bold">{shortHash}</p>
      </div>
      <Lock className="w-3 h-3 text-green-400 ml-1" />
    </div>
  );
}

// Verification Code Component
function VerificationCode({ certNumber }: { certNumber: string }) {
  const generateCode = () => {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  };

  const [code] = useState(generateCode());

  return (
    <div className="flex flex-col items-center bg-amber-50 border-2 border-amber-300 rounded-lg px-3 py-2">
      <p className="text-[9px] text-amber-600 font-semibold uppercase">Auth Code</p>
      <p className="text-lg font-mono font-bold text-amber-800 tracking-widest">{code}</p>
    </div>
  );
}

// Microprint Security Text
function MicroprintText({ text }: { text: string }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <p className="text-[6px] text-gray-300 font-mono select-none" style={{ letterSpacing: '0.5px' }}>
        {text.repeat(20)}
      </p>
    </div>
  );
}

// Gold Foil Effect Component
function GoldFoilText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 bg-clip-text text-transparent ${className}`}
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
      {children}
    </span>
  );
}

// Guilloche Pattern Background - Canvas-safe version using CSS
function GuillocheBackground() {
  return (
    <div 
      className="absolute inset-0 opacity-10 pointer-events-none" 
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, transparent 10%, rgba(217, 119, 6, 0.1) 11%, transparent 12%),
          radial-gradient(circle at 60% 70%, transparent 15%, rgba(217, 119, 6, 0.1) 16%, transparent 17%),
          radial-gradient(circle at 40% 50%, transparent 8%, rgba(217, 119, 6, 0.1) 9%, transparent 10%),
          radial-gradient(circle at 80% 20%, transparent 12%, rgba(217, 119, 6, 0.1) 13%, transparent 14%),
          radial-gradient(circle at 10% 80%, transparent 18%, rgba(217, 119, 6, 0.1) 19%, transparent 20%),
          radial-gradient(circle at 70% 40%, transparent 6%, rgba(217, 119, 6, 0.1) 7%, transparent 8%),
          radial-gradient(circle at 30% 60%, transparent 14%, rgba(217, 119, 6, 0.1) 15%, transparent 16%),
          radial-gradient(circle at 90% 90%, transparent 10%, rgba(217, 119, 6, 0.1) 11%, transparent 12%)
        `,
        backgroundSize: '200px 200px'
      }}
    />
  );
}

// Holographic Seal Component
function HolographicSeal() {
  return (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-80 animate-pulse" />
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 opacity-60" />
      <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
        <Shield className="w-8 h-8 text-green-700" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
        <Check className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

// Enhanced Signature Line with Seal
function EnhancedSignature({ title, name, hasSeal = false }: { title: string; name: string; hasSeal?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2">
        {/* Signature line with decorative border */}
        <div className="w-32 h-16 border-b-2 border-gray-400 relative">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
          {name && (
            <p className="absolute bottom-2 left-0 right-0 text-center font-script text-lg text-gray-700" 
               style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              {name}
            </p>
          )}
        </div>
        {hasSeal && (
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</p>
      {hasSeal && <p className="text-[9px] text-red-600 mt-0.5">Official Seal</p>}
    </div>
  );
}

// Official Stamp Component
function OfficialStamp() {
  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer circle */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#dc2626" strokeWidth="2" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#dc2626" strokeWidth="1" />
        
        {/* Text path */}
        <defs>
          <path id="circlePath" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
        </defs>
        
        {/* Curved text */}
        <text fill="#dc2626" fontSize="8" fontWeight="bold">
          <textPath href="#circlePath" startOffset="0%">
            RWANDA ISLAMIC COMMUNITY
          </textPath>
        </text>
        
        {/* Inner text */}
        <text x="50" y="45" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold">
          OFFICIAL
        </text>
        <text x="50" y="58" textAnchor="middle" fill="#dc2626" fontSize="8">
          NIKAH
        </text>
        <text x="50" y="68" textAnchor="middle" fill="#dc2626" fontSize="8">
          CERTIFIED
        </text>
        
        {/* Star */}
        <polygon points="50,25 53,32 60,32 55,37 57,44 50,40 43,44 45,37 40,32 47,32" fill="#dc2626" />
      </svg>
      {/* Hatching effect */}
      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#dc2626_2px,#dc2626_4px)] rounded-full pointer-events-none" />
    </div>
  );
}

// Signature Stamp Component
function SignatureStamp({ title, name }: { title: string; name: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-600 flex items-center justify-center opacity-30 absolute inset-0" />
        <div className="w-16 h-16 rounded-full border-2 border-red-600 flex items-center justify-center relative z-10">
          <Stamp className="w-8 h-8 text-red-600" />
        </div>
      </div>
      <p className="font-medium text-sm mt-2 text-center">{name || '_______________'}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
    </div>
  );
}

// Left Side Stamp Component - Islamic
function LeftSideStamp() {
  return (
    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-20 h-32 opacity-70 pointer-events-none">
      <svg viewBox="0 0 100 120" className="w-full h-full">
        {/* Outer circle */}
        <circle cx="50" cy="60" r="45" fill="none" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="50" cy="60" r="38" fill="none" stroke="#b91c1c" strokeWidth="1.5" />
        
        {/* Inner decorative pattern */}
        <path d="M50,20 L50,100 M20,60 L80,60" stroke="#b91c1c" strokeWidth="1" strokeDasharray="3 2" />
        
        {/* Arabic text */}
        <text x="50" y="45" textAnchor="middle" fill="#b91c1c" fontSize="8" fontFamily="Arial">
          بسم الله
        </text>
        <text x="50" y="58" textAnchor="middle" fill="#b91c1c" fontSize="7" fontWeight="bold">
          الحمد لله
        </text>
        
        {/* Star */}
        <polygon points="50,70 52,74 56,74 53,77 55,81 50,78 45,81 47,77 44,74 48,74" fill="#b91c1c" opacity="0.7" />
        
        {/* Text */}
        <text x="50" y="95" textAnchor="middle" fill="#b91c1c" fontSize="6">
          NIKAH
        </text>
        <text x="50" y="102" textAnchor="middle" fill="#b91c1c" fontSize="5">
          MUBARAK
        </text>
      </svg>
    </div>
  );
}

// Right Side Stamp Component - Official
function RightSideStamp() {
  return (
    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-32 opacity-70 pointer-events-none">
      <svg viewBox="0 0 100 120" className="w-full h-full">
        {/* Outer decorative border */}
        <rect x="10" y="15" width="80" height="90" fill="none" stroke="#d97706" strokeWidth="2" rx="5" />
        <rect x="13" y="18" width="74" height="84" fill="none" stroke="#d97706" strokeWidth="1" rx="3" />
        
        {/* Inner pattern */}
        <path d="M50,25 L50,95 M20,60 L80,60" stroke="#d97706" strokeWidth="1" strokeDasharray="3 2" />
        
        {/* Text */}
        <text x="50" y="40" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="bold">
        </text>
        <text x="50" y="52" textAnchor="middle" fill="#d97706" fontSize="7">
          CERTIFIED
        </text>
        
        {/* Decorative elements */}
        <circle cx="50" cy="70" r="8" fill="none" stroke="#d97706" strokeWidth="1.5" />
        <text x="50" y="73" textAnchor="middle" fill="#d97706" fontSize="8">
          ✓
        </text>
        
        {/* Bottom text */}
        <text x="50" y="95" textAnchor="middle" fill="#d97706" fontSize="6">
          OFFICIAL
        </text>
        <text x="50" y="102" textAnchor="middle" fill="#d97706" fontSize="5">
          NIKAH
        </text>
      </svg>
    </div>
  );
}

// Islamic Ornamental Stamp
function IslamicOrnamentalStamp() {
  return (
    <div className="absolute left-4 bottom-4 w-16 h-16 opacity-60 pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Islamic geometric pattern */}
        <path d="M50,15 L65,35 L85,35 L70,55 L85,75 L65,75 L50,95 L35,75 L15,75 L30,55 L15,35 L35,35 Z" 
              fill="none" stroke="#2d6b36" strokeWidth="1.5" />
        <circle cx="50" cy="55" r="12" fill="none" stroke="#2d6b36" strokeWidth="1" />
        <text x="50" y="60" textAnchor="middle" fill="#2d6b36" fontSize="8" fontWeight="bold">
          ☪
        </text>
      </svg>
    </div>
  );
}

// Decorative Corner Stamps
function CornerStamps() {
  return (
    <>
      {/* Top Left Corner */}
      <div className="absolute top-2 left-2 w-12 h-12 opacity-50 pointer-events-none">
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <path d="M5,5 L15,5 L5,15 Z" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <path d="M8,8 L12,8 L8,12 Z" fill="#d97706" opacity="0.5" />
        </svg>
      </div>
      
      {/* Top Right Corner */}
      <div className="absolute top-2 right-2 w-12 h-12 opacity-50 pointer-events-none">
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <path d="M45,5 L35,5 L45,15 Z" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <path d="M42,8 L38,8 L42,12 Z" fill="#d97706" opacity="0.5" />
        </svg>
      </div>
      
      {/* Bottom Left Corner */}
      <div className="absolute bottom-2 left-2 w-12 h-12 opacity-50 pointer-events-none">
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <path d="M5,45 L15,45 L5,35 Z" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <path d="M8,42 L12,42 L8,38 Z" fill="#d97706" opacity="0.5" />
        </svg>
      </div>
      
      {/* Bottom Right Corner */}
      <div className="absolute bottom-2 right-2 w-12 h-12 opacity-50 pointer-events-none">
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <path d="M45,45 L35,45 L45,35 Z" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <path d="M42,42 L38,42 L42,38 Z" fill="#d97706" opacity="0.5" />
        </svg>
      </div>
    </>
  );
}

export default function GenerateCertificatePage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [certificateType, setCertificateType] = useState<'nikah' | 'shahada'>('nikah');
  const [applications, setApplications] = useState<NikahApplication[]>([]);
  const [shahadaApplications, setShahadaApplications] = useState<ShahadaApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<NikahApplication | null>(null);
  const [selectedShahadaApp, setSelectedShahadaApp] = useState<ShahadaApplication | null>(null);
  const [generating, setGenerating] = useState(false);
  const [certificateData, setCertificateData] = useState({
    imamName: '',
    witness1Name: '',
    witness2Name: '',
    certificateNumber: '',
    registrarName: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    registrarTitle: role ? role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Chief Registrar',
    confirmedDate: '',
    confirmedLocation: '',
    muftiName: 'Sheikh Salim Hitimana',
    // Shahada-specific fields
    convertName: '',
    previousReligion: '',
    declarationDate: '',
    declarationLocation: '',
    islamicName: '',
  });

  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  // Fetch certificate template from Supabase
  const fetchCertificateTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('certificate_templates' as any)
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.log('No active template found, using defaults');
        return;
      }

      const templateData = data as unknown as CertificateTemplate;
      setTemplate(templateData);
      
      // Update certificate data with template defaults
      if (templateData?.chief_registrar_name) {
        setCertificateData(prev => ({
          ...prev,
          registrarName: templateData.chief_registrar_name || prev.registrarName,
          registrarTitle: templateData.chief_registrar_title || prev.registrarTitle,
        }));
      }
    } catch (err) {
      console.error('Error fetching certificate template:', err);
    } finally {
      setTemplateLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateTemplate();
  }, []);

  // Load application directly when navigated from certificates list (Print action)
  useEffect(() => {
    const appId = searchParams.get('app');
    if (!appId) return;

    let cancelled = false;
    async function loadById() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('nikah_applications')
          .select('*')
          .eq('id', appId)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        if (!data) throw new Error('Application not found');

        setSelectedApp(data as NikahApplication);
        setApplications((prev) => {
          const exists = prev.some((a) => a.id === (data as any).id);
          return exists ? prev : [data as NikahApplication, ...prev];
        });

        setCertificateData((prev) => ({
          ...prev,
          imamName: (data as any).imam_name || (data as any).preferred_imam || '',
          witness1Name: (data as any).male_witness_name || (data as any).witness_1_name || '',
          witness2Name: (data as any).female_witness1_name || (data as any).witness_2_name || '',
          certificateNumber: (data as any).certificate_number || prev.certificateNumber || generateCertNumber(),
        }));
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadById();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  // Get public URLs for documents
  const getPhotoUrl = (path: string | undefined) => {
    if (!path) return null;
    const { data } = supabase.storage.from('nikah-documents').getPublicUrl(path);
    return data.publicUrl;
  };

  // Generate verification URL for QR code
  const verificationUrl = useMemo(() => {
    if (!selectedApp || !certificateData.certificateNumber) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify-certificate/${certificateData.certificateNumber}?app=${selectedApp.id}`;
  }, [selectedApp, certificateData.certificateNumber]);

  // Search for approved applications
  const searchApplications = async () => {
    if (!searchQuery.trim()) return;
    
    // Debug: Check auth state
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Auth debug:', { 
      isAuthenticated: !!session, 
      userId: session?.user?.id,
      email: session?.user?.email 
    });
    
    setLoading(true);
    try {
      if (certificateType === 'nikah') {
        const { data, error } = await supabase
          .from('nikah_applications')
          .select('*')
          .in('status', ['approved', 'completed'])
          .or(`groom_name.ilike.%${searchQuery}%,bride_name.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setApplications(data || []);
        setShahadaApplications([]);
      } else {
        // Search Shahada applications - database uses first_name and last_name
        console.log('Searching Shahada with query:', searchQuery);
        
        // Debug: Try fetching without status filter first
        const { data: allData, error: allError } = await supabase
          .from('shahada_applications')
          .select('id, first_name, last_name, status')
          .limit(5);
        console.log('Debug - All applications (no filter):', { allData, allError });
        
        // Debug: Try fetching only approved
        const { data: approvedData, error: approvedError } = await supabase
          .from('shahada_applications')
          .select('id, first_name, last_name, status')
          .eq('status', 'approved')
          .limit(5);
        console.log('Debug - Approved only:', { approvedData, approvedError });
        
        // Show available names for debugging
        if (approvedData && approvedData.length > 0) {
          console.log('Available approved names:', approvedData.map(app => `${app.first_name} ${app.last_name}`));
        }
        
        // Search with proper OR syntax for Supabase
        const searchPattern = `%${searchQuery}%`;
        const { data, error } = await supabase
          .from('shahada_applications')
          .select('*')
          .in('status', ['approved', 'completed'])
          .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`)
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('Shahada search result:', { data, error, count: data?.length });

        // Fallback: if search returns empty, try fetching all approved and filter in JS
        if ((!data || data.length === 0) && approvedData && approvedData.length > 0) {
          console.log('Using JS fallback filtering');
          const query = searchQuery.toLowerCase();
          const filtered = approvedData.filter((app: any) => {
            const fullName = `${app.first_name || ''} ${app.last_name || ''}`.toLowerCase();
            const firstName = (app.first_name || '').toLowerCase();
            const lastName = (app.last_name || '').toLowerCase();
            return fullName.includes(query) || firstName.includes(query) || lastName.includes(query);
          });
          console.log('JS filtered results:', filtered);
          // Fetch full details for filtered results
          if (filtered.length > 0) {
            const ids = filtered.map((app: any) => app.id).filter((id: any) => id && typeof id === 'string');
            if (ids.length === 0) {
              console.warn('No valid IDs found in filtered results');
              setShahadaApplications([]);
            } else {
              const { data: fullData, error: fullError } = await supabase
                .from('shahada_applications')
                .select('*')
                .in('id', ids);
              if (fullError) {
                console.error('Error fetching full details:', fullError);
                setShahadaApplications([]);
              } else {
                setShahadaApplications(fullData || []);
              }
            }
          } else {
            setShahadaApplications([]);
          }
        } else {
          setShahadaApplications(data || []);
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate certificate number based on template format
  const generateCertNumber = (type: 'nikah' | 'shahada' = certificateType) => {
    const year = new Date().getFullYear();
    const prefix = type === 'shahada' ? 'RCS' : (template?.certificate_prefix || 'RCN');
    
    if (template?.certificate_format === 'UUID') {
      return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    }
    
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${year}-${random}`;
  };

  // Handle generate certificate
  const handleGenerate = async () => {
    if (certificateType === 'nikah') {
      if (!selectedApp) return;
      if (!certificateData.imamName || !certificateData.witness1Name || !certificateData.witness2Name || !certificateData.registrarName) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields including registrar name.',
          variant: 'destructive',
        });
        return;
      }

      setGenerating(true);
      try {
        const certNumber = certificateData.certificateNumber || generateCertNumber('nikah');
        
        // Update application with certificate details
        const { error } = await supabase
          .from('nikah_applications')
          .update({
            certificate_number: certNumber,
            certificate_issued_at: new Date().toISOString(),
            imam_name: certificateData.imamName,
            witness_1_name: certificateData.witness1Name,
            witness_2_name: certificateData.witness2Name,
            confirmed_date: certificateData.confirmedDate || selectedApp?.preferred_date,
            confirmed_location: certificateData.confirmedLocation || selectedApp?.preferred_masjid,
            status: 'completed',
          })
          .eq('id', selectedApp.id);

        if (error) throw error;

        setCertificateData(prev => ({ ...prev, certificateNumber: certNumber }));
        
        toast({
          title: 'Certificate Generated',
          description: `Certificate ${certNumber} has been created successfully.`,
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setGenerating(false);
      }
    } else {
      // Shahada certificate generation
      if (!selectedShahadaApp) return;
      if (!selectedShahadaApp.id) {
        console.error('Selected Shahada application has no ID');
        toast({
          title: 'Error',
          description: 'Invalid application selected. Please search and select again.',
          variant: 'destructive',
        });
        return;
      }
      if (!certificateData.witness1Name || !certificateData.witness2Name || !certificateData.registrarName) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields including registrar name and witness names.',
          variant: 'destructive',
        });
        return;
      }

      setGenerating(true);
      try {
        const certNumber = certificateData.certificateNumber || generateCertNumber('shahada');
        
        // Update Shahada application with certificate details
        const { error } = await supabase
          .from('shahada_applications')
          .update({
            certificate_number: certNumber,
            witness1_name: certificateData.witness1Name,
            witness2_name: certificateData.witness2Name,
            status: 'completed',
          })
          .eq('id', selectedShahadaApp.id);

        if (error) throw error;

        setCertificateData(prev => ({ ...prev, certificateNumber: certNumber }));
        
        toast({
          title: 'Shahada Certificate Generated',
          description: `Certificate ${certNumber} has been created successfully.`,
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setGenerating(false);
      }
    }
  };

  // Handle download certificate as PDF - Fixed for proper fit
  const handleDownload = async () => {
    if (!certificateData.certificateNumber) return;
    if (certificateType === 'nikah' && !selectedApp) return;
    if (certificateType === 'shahada' && !selectedShahadaApp) return;

    setDownloadLoading(true);

    try {
      // Get the actual certificate element
      const element = document.getElementById('certificate-print-area');
      if (!element) {
        throw new Error('Certificate element not found');
      }

      // Create a loading toast
      toast({
        title: 'Generating PDF',
        description: 'Please wait while we create your certificate...',
      });

      // Store original styles
      const originalWidth = element.style.width;
      const originalHeight = element.style.height;
      const originalPosition = element.style.position;
      const originalOverflow = element.style.overflow;
      
      // Set fixed dimensions for A4 landscape (297mm x 210mm)
      // 297mm = 1123px at 96dpi, 210mm = 794px
      element.style.width = '1123px';
      element.style.height = '794px';
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      
      // Wait for all images to load
      const imgs = element.querySelectorAll('img');
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete && img.naturalHeight !== 0) {
                resolve(true);
              } else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(true);
                setTimeout(() => resolve(true), 5000);
              }
            })
        )
      );
      
      // Additional delay for any dynamic content
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capture the certificate
      const canvas = await html2canvas(element, {
        scale: 2.5, // Good balance between quality and performance
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1123,
        windowHeight: 794,
        onclone: (clonedDoc, element) => {
          const clonedCert = clonedDoc.getElementById('certificate-print-area');
          if (clonedCert) {
            clonedCert.style.width = '1123px';
            clonedCert.style.height = '794px';
            clonedCert.style.position = 'relative';
            clonedCert.style.overflow = 'hidden';
            
            // Ensure all text fits
            const allElements = clonedCert.querySelectorAll('*');
            allElements.forEach((el: any) => {
              if (el.style) {
                el.style.overflow = 'visible';
              }
            });
          }
        }
      });
      
      // Restore original styles
      element.style.width = originalWidth;
      element.style.height = originalHeight;
      element.style.position = originalPosition;
      element.style.overflow = originalOverflow;

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Create PDF with exact A4 landscape dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
        hotfixes: ['px_scaling']
      });

      // Get PDF dimensions (297mm x 210mm)
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add image to fill entire page without margins
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      // Save the PDF with appropriate filename
      const certType = certificateType === 'shahada' ? 'shahada' : 'nikah';
      pdf.save(`${certType}-certificate-${certificateData.certificateNumber}.pdf`);
      
      toast({
        title: 'Download Complete',
        description: `Certificate ${certificateData.certificateNumber} downloaded successfully.`,
      });
    } catch (err: any) {
      console.error('Download error:', err);
      toast({
        title: 'Download Failed',
        description: err.message || 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  // Handle send certificate via email
  const handleSendEmail = async () => {
    if (!certificateData.certificateNumber || !emailAddress) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address to send the certificate.',
        variant: 'destructive',
      });
      return;
    }

    setEmailSending(true);
    try {
      const emailData = certificateType === 'nikah' ? {
        certificateNumber: certificateData.certificateNumber,
        email: emailAddress,
        groomName: selectedApp?.groom_name,
        brideName: selectedApp?.bride_name,
        certificateHtml: document.getElementById('certificate-print-area')?.innerHTML,
      } : {
        certificateNumber: certificateData.certificateNumber,
        email: emailAddress,
        convertName: selectedShahadaApp?.full_name || '',
        certificateHtml: document.getElementById('certificate-print-area')?.innerHTML,
      };

      const { error } = await supabase.functions.invoke('send-certificate-email', {
        body: emailData,
      });

      if (error) throw error;

      toast({
        title: 'Email Sent',
        description: `Certificate sent to ${emailAddress}`,
      });
      setEmailAddress('');
    } catch (err: any) {
      toast({
        title: 'Email Failed',
        description: err.message || 'Failed to send email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setEmailSending(false);
    }
  };

  // Print certificate - Uses the actual enhanced certificate
  const handlePrint = () => {
    const certificateElement = document.getElementById('certificate-print-area');
    if (!certificateElement) {
      toast({
        title: 'Error',
        description: 'Certificate not found',
        variant: 'destructive',
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Clone the certificate to avoid modifying the original
    const clone = certificateElement.cloneNode(true) as HTMLElement;
    
    // Get all styles from the original
    const styles = document.querySelectorAll('style');
    let styleContent = '';
    styles.forEach(style => {
      styleContent += style.innerHTML;
    });

    const certTypeTitle = certificateType === 'nikah' ? 'Nikah Certificate' : 'Shahada Certificate';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${certTypeTitle} - ${certificateData.certificateNumber}</title>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            /* Print specific styles */
            @page {
              size: A4 landscape;
              margin: 0;
              padding: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
              width: 297mm;
              height: 210mm;
              font-family: Georgia, serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .print-container {
              width: 100%;
              height: 100%;
              overflow: hidden;
              page-break-after: avoid;
              page-break-before: avoid;
              page-break-inside: avoid;
              break-inside: avoid;
              position: relative;
            }
            
            /* Ensure all security features are visible in print */
            .absolute, .relative, .fixed {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .print-container {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
              }
              
              img {
                max-width: 100%;
                max-height: 100%;
                page-break-inside: avoid;
              }
              
              /* Ensure gradients and backgrounds print */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            
            /* Additional styles from the app */
            ${styleContent}
          </style>
        </head>
        <body>
          <div class="print-container" style="width: 297mm; height: 210mm; position: relative;">
            ${clone.outerHTML}
          </div>
          <script>
            window.onload = function() {
              // Ensure the certificate fits perfectly
              const container = document.querySelector('.print-container');
              const certificate = document.querySelector('#certificate-print-area');
              if (certificate) {
                certificate.style.width = '100%';
                certificate.style.height = '100%';
              }
              
              // Print after a short delay to ensure everything is rendered
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generate Certificate</h2>
          <p className="text-muted-foreground">Search and generate official Islamic certificates</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">Certificate Type:</Label>
          <Select
            value={certificateType}
            onValueChange={(value: 'nikah' | 'shahada') => {
              setCertificateType(value);
              setSelectedApp(null);
              setSelectedShahadaApp(null);
              setApplications([]);
              setShahadaApplications([]);
              setSearchQuery('');
              setCertificateData(prev => ({
                ...prev,
                certificateNumber: '',
                imamName: '',
                witness1Name: '',
                witness2Name: '',
                convertName: '',
                declarationDate: '',
                declarationLocation: '',
                previousReligion: '',
              }));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nikah">Nikah (Marriage)</SelectItem>
              <SelectItem value="shahada">Shahada (Conversion)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Approved {certificateType === 'nikah' ? 'Nikah' : 'Shahada'} Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={certificateType === 'nikah' ? "Search by groom or bride name..." : "Search by convert name..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchApplications()}
              className="flex-1"
            />
            <Button onClick={searchApplications} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {/* Results - Nikah */}
          {certificateType === 'nikah' && applications.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Select an application:</p>
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setCertificateData(prev => ({
                      ...prev,
                      imamName: app.imam_name || app.preferred_imam || '',
                      witness1Name: app.male_witness_name || app.witness_1_name || '',
                      witness2Name: app.female_witness1_name || app.witness_2_name || '',
                      certificateNumber: app.certificate_number || prev.certificateNumber || generateCertNumber('nikah'),
                    }));
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedApp?.id === app.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {app.groom_passport_photo_url ? (
                          <img
                            src={getPhotoUrl(app.groom_passport_photo_url) || ''}
                            alt="Groom"
                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white">
                            <UserCircle className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        {app.bride_passport_photo_url ? (
                          <img
                            src={getPhotoUrl(app.bride_passport_photo_url) || ''}
                            alt="Bride"
                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center border-2 border-white">
                            <UserCircle className="w-5 h-5 text-pink-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{app.groom_name} & {app.bride_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Date: {app.preferred_date} | Masjid: {app.preferred_masjid || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {app.certificate_number ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Cert: {app.certificate_number}
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        No Certificate
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Results - Shahada */}
          {certificateType === 'shahada' && shahadaApplications.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Select a Shahada application:</p>
              {shahadaApplications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedShahadaApp(app);
                    setCertificateData(prev => ({
                      ...prev,
                      convertName: `${app.first_name} ${app.last_name}`,
                      witness1Name: app.witness1_name || '',
                      witness2Name: app.witness2_name || '',
                      previousReligion: app.previous_religion || '',
                      declarationDate: app.preferred_date || '',
                      declarationLocation: app.address || '',
                      certificateNumber: app.certificate_number || prev.certificateNumber || generateCertNumber('shahada'),
                    }));
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedShahadaApp?.id === app.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border-2 border-white">
                        <UserCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{app.first_name} {app.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Date: {app.preferred_date || 'N/A'} | Previous: {app.previous_religion || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {app.certificate_number ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Cert: {app.certificate_number}
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        No Certificate
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Form - Nikah */}
      {certificateType === 'nikah' && selectedApp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Nikah Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Certificate Number</Label>
                <Input
                  value={certificateData.certificateNumber}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div className="space-y-2">
                <Label>Registrar Name *</Label>
                <Input
                  value={certificateData.registrarName}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, registrarName: e.target.value }))}
                  placeholder="Chief Registrar name"
                />
              </div>
              <div className="space-y-2">
                <Label>Registrar Title</Label>
                <Input
                  value={certificateData.registrarTitle}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, registrarTitle: e.target.value }))}
                  placeholder="e.g. Chief Registrar"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Imam Name *</Label>
                <Input
                  value={certificateData.imamName}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, imamName: e.target.value }))}
                  placeholder="Enter imam name"
                />
              </div>
              <div className="space-y-2">
                <Label>Witness 1 Name *</Label>
                <Input
                  value={certificateData.witness1Name}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, witness1Name: e.target.value }))}
                  placeholder="First witness name"
                />
              </div>
              <div className="space-y-2">
                <Label>Witness 2 Name *</Label>
                <Input
                  value={certificateData.witness2Name}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, witness2Name: e.target.value }))}
                  placeholder="Second witness name"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Confirmed Date</Label>
                <Input
                  type="date"
                  value={certificateData.confirmedDate}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, confirmedDate: e.target.value }))}
                  placeholder={selectedApp?.preferred_date || 'Select confirmed date'}
                />
                <p className="text-xs text-muted-foreground">Defaults to: {selectedApp?.preferred_date || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <Label>Confirmed Location</Label>
                <Input
                  value={certificateData.confirmedLocation}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, confirmedLocation: e.target.value }))}
                  placeholder={selectedApp?.preferred_masjid || 'Enter confirmed location'}
                />
                <p className="text-xs text-muted-foreground">Defaults to: {selectedApp?.preferred_masjid || 'N/A'}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Award className="h-4 w-4 mr-2" />
                )}
                {selectedApp.certificate_number ? 'Update Certificate' : 'Generate Certificate'}
              </Button>
              <Button variant="outline" onClick={handlePrint} disabled={!certificateData.certificateNumber}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={!certificateData.certificateNumber || downloadLoading}>
                {downloadLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Download
              </Button>
            </div>

            {/* Email Section */}
            <div className="flex gap-3 pt-2">
              <Input
                type="email"
                placeholder="Enter email address to send certificate..."
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleSendEmail} 
                disabled={!certificateData.certificateNumber || !emailAddress || emailSending}
              >
                {emailSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Form - Shahada */}
      {certificateType === 'shahada' && selectedShahadaApp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Shahada Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Certificate Number</Label>
                <Input
                  value={certificateData.certificateNumber}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div className="space-y-2">
                <Label>Registrar Name *</Label>
                <Input
                  value={certificateData.registrarName}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, registrarName: e.target.value }))}
                  placeholder="Chief Registrar name"
                />
              </div>
              <div className="space-y-2">
                <Label>Registrar Title</Label>
                <Input
                  value={certificateData.registrarTitle}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, registrarTitle: e.target.value }))}
                  placeholder="e.g. Chief Registrar"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Witness 1 Name *</Label>
                <Input
                  value={certificateData.witness1Name}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, witness1Name: e.target.value }))}
                  placeholder="First witness name"
                />
              </div>
              <div className="space-y-2">
                <Label>Witness 2 Name *</Label>
                <Input
                  value={certificateData.witness2Name}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, witness2Name: e.target.value }))}
                  placeholder="Second witness name"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Declaration Date</Label>
                <Input
                  type="date"
                  value={certificateData.declarationDate}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, declarationDate: e.target.value }))}
                  placeholder={selectedShahadaApp?.preferred_date || 'Select declaration date'}
                />
                <p className="text-xs text-muted-foreground">Defaults to: {selectedShahadaApp?.preferred_date || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <Label>Declaration Location</Label>
                <Input
                  value={certificateData.declarationLocation}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, declarationLocation: e.target.value }))}
                  placeholder={selectedShahadaApp?.address || 'Enter declaration location'}
                />
                <p className="text-xs text-muted-foreground">Defaults to: {selectedShahadaApp?.address || 'N/A'}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Award className="h-4 w-4 mr-2" />
                )}
                {selectedShahadaApp.certificate_number ? 'Update Certificate' : 'Generate Certificate'}
              </Button>
              <Button variant="outline" onClick={handlePrint} disabled={!certificateData.certificateNumber}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={!certificateData.certificateNumber || downloadLoading}>
                {downloadLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Download
              </Button>
            </div>

            {/* Email Section */}
            <div className="flex gap-3 pt-2">
              <Input
                type="email"
                placeholder="Enter email address to send certificate..."
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleSendEmail} 
                disabled={!certificateData.certificateNumber || !emailAddress || emailSending}
              >
                {emailSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Certificate Preview - Nikah */}
      {certificateType === 'nikah' && selectedApp && certificateData.certificateNumber && (
        <Card id="certificate-preview" className="print:shadow-none overflow-hidden">
          <CardContent className="p-0">
            <div 
              id="certificate-print-area" 
              className="relative" 
              style={{ 
                width: '1123px', 
                height: '794px',
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Certificate Container with reduced padding */}
              <div className="w-full h-full border-8 border-double border-amber-600 p-3 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
                
                {/* Anti-Copy Pattern */}
                {template?.enable_anti_copy_pattern !== false && <AntiCopyPattern />}
                
                {/* Security Fibers */}
                {template?.enable_security_fibers !== false && <SecurityFibers />}
                
                {/* Metallic Strip */}
                {template?.enable_metallic_strip !== false && <MetallicStrip />}
                
                {/* Watermark */}
                {template?.show_watermark !== false && (
                  <WatermarkText text={template?.watermark_text || `${selectedApp.groom_name} & ${selectedApp.bride_name}`} />
                )}
                
                {/* Security Thread */}
                {template?.enable_security_thread !== false && <SecurityThread />}
                
                {/* Guilloche Pattern */}
                {template?.enable_guilloche_pattern !== false && <GuillocheBackground />}
                
                {/* Side Stamps - Left and Right */}
                <LeftSideStamp />
                <RightSideStamp />
                
                {/* Optional: Islamic Ornamental Stamp and Corner Stamps */}
                <IslamicOrnamentalStamp />
                <CornerStamps />
                
                {/* Main Content - Using flex column to distribute space evenly */}
                <div className="relative h-full flex flex-col justify-between">
                  
                  {/* Top Header - Compact */}
                  <div className="flex items-center justify-between mb-1">
                    {/* Left - Logo */}
                    <div className="w-28 flex-shrink-0">
                      <img 
                        src="/src/assets/logo.png" 
                        alt="Rwanda Muslim Community" 
                        className="w-24 h-auto"
                      />
                    </div>

                    {/* Center - Title */}
                    <div className="text-center flex-1 px-1">
                      <h1 className="text-xl font-bold text-green-800 tracking-wide">REPUBLIC OF RWANDA</h1>
                      <h2 className="text-lg font-bold">
                        <GoldFoilText>RWANDA ISLAMIC COMMUNITY</GoldFoilText>
                      </h2>
                      <p className="text-xs text-amber-600 uppercase tracking-widest font-semibold">Official Marriage Certificate</p>
                      <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-1" />
                    </div>

                    {/* Right - QR Code */}
                    <div className="w-24 flex-shrink-0 flex flex-col items-center">
                      <div className="p-1.5 bg-white rounded-lg shadow-md border border-amber-200">
                        <RealQRCodeSVG value={verificationUrl} size={90} />
                      </div>
                      <p className="text-[8px] text-gray-500 text-center mt-1">Scan to verify</p>
                    </div>
                  </div>

                  {/* Certificate Number Banner */}
                  <div className="text-center my-1">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border border-amber-400 px-4 py-1 rounded-full">
                      <span className="text-amber-800 font-semibold text-xs">CERTIFICATE NO:</span>
                      <ColorShiftingText text={certificateData.certificateNumber} />
                    </div>
                  </div>

                  {/* Certification Text */}
                  <div className="text-center my-1">
                    <p className="text-sm text-gray-700 italic">This is to certify that the Islamic Marriage (Nikah) was solemnized between:</p>
                  </div>

                  {/* Photos and Names - Compact */}
                  <div className="flex items-center justify-center gap-3 my-1">
                    {/* Groom Photo */}
                    <div className="flex flex-col items-center">
                      <div className="w-36 h-36 border-2 border-amber-300 rounded-lg overflow-hidden bg-gray-100 shadow-md">
                        {selectedApp.groom_passport_photo_url ? (
                          <img
                            src={getPhotoUrl(selectedApp.groom_passport_photo_url) || ''}
                            alt="Groom"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserCircle className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Names */}
                    <div className="text-center space-y-1 px-2">
                      <div>
                        <p className="text-lg font-bold text-green-800">{selectedApp.groom_name}</p>
                        <p className="text-[10px] text-gray-500">ID: {selectedApp.groom_national_id || '_________________'}</p>
                      </div>
                      <p className="text-sm italic text-amber-600">~ and ~</p>
                      <div>
                        <p className="text-lg font-bold text-green-800">{selectedApp.bride_name}</p>
                        <p className="text-[10px] text-gray-500">ID: {selectedApp.bride_national_id || '_________________'}</p>
                      </div>
                    </div>

                    {/* Bride Photo */}
                    <div className="flex flex-col items-center">
                      <div className="w-36 h-36 border-2 border-amber-300 rounded-lg overflow-hidden bg-gray-100 shadow-md">
                        {selectedApp.bride_passport_photo_url ? (
                          <img
                            src={getPhotoUrl(selectedApp.bride_passport_photo_url) || ''}
                            alt="Bride"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserCircle className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date/Place LeftSide and Official Stamp RightSide */}
                  <div className="flex items-center justify-between my-1 gap-1">
                    {/* Date and Place - Compact LeftSide */}
                    <div className="flex-1 grid grid-cols-2 gap-2 text-center bg-amber-50/50 p-1.5 rounded-lg border border-amber-200 max-w-md">
                      <div>
                        <span className="text-gray-500 text-[10px] font-medium">Date of Nikah:</span>
                        <p className="font-semibold text-sm text-gray-800">{certificateData.confirmedDate || selectedApp.preferred_date || '_________________'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] font-medium">Place of Nikah:</span>
                        <p className="font-semibold text-sm text-gray-800">{certificateData.confirmedLocation || selectedApp.preferred_masjid || '_________________'}</p>
                      </div>
                    </div>
                    {/* Official Stamp RightSide */}
                    <div className="flex-shrink-0 ml-1">
                      <div className="relative">
                        <OfficialStamp />
                      </div>
                    </div>
                  </div>

                  {/* Signatures - More compact */}
                  <div className="border-t border-amber-300 pt-2 mt-1">
                    <p className="text-center text-xs font-bold text-amber-700 mb-2 uppercase tracking-widest">Officiated By</p>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.imamName}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">Imam</p>
                        <p className="text-[8px] text-red-600">Official Seal</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.witness1Name}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">Witness 1</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.witness2Name}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">Witness 2</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1 relative">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.registrarName}</p>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-[6px]">✓</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">{certificateData.registrarTitle}</p>
                        <p className="text-[8px] text-red-600">Official Seal</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1 relative">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.muftiName || 'Sheikh Salim Hitimana'}</p>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-[6px]">★</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">Grand Mufti of Rwanda</p>
                        <p className="text-[8px] text-green-600">Chief Islamic Authority</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Compact */}
                  <div className="mt-1 pt-1 border-t border-amber-300 text-center">
                    <p className="text-[9px] text-gray-600 italic max-w-2xl mx-auto leading-tight">
                      This certificate is issued under the authority of the Rwanda Islamic Community and is valid for all legal purposes. 
                      Any alteration or forgery of this document is a criminal offense.
                    </p>
                    <div className="flex justify-center items-center gap-2 mt-1 text-[8px] text-gray-400">
                      <span>Date of Issue: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span>|</span>
                      <span>Verify: {window.location.origin}/verify-certificate/{certificateData.certificateNumber}</span>
                    </div>
                  </div>

                  {/* Security Footer */}
                  <div className="mt-1 flex justify-between items-center text-[8px] text-gray-400 border-t border-dashed border-gray-300 pt-1">
                    <span>🔒 Secure Document | Official Use Only</span>
                    <span className="font-mono">ID: {selectedApp.id.slice(0, 8)}... | AUTH: RIC-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-1 left-1 w-6 h-6 border-l-2 border-t-2 border-amber-400" />
                <div className="absolute top-1 right-1 w-6 h-6 border-r-2 border-t-2 border-amber-400" />
                <div className="absolute bottom-1 left-1 w-6 h-6 border-l-2 border-b-2 border-amber-400" />
                <div className="absolute bottom-1 right-1 w-6 h-6 border-r-2 border-b-2 border-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shahada Certificate Preview */}
      {certificateType === 'shahada' && selectedShahadaApp && certificateData.certificateNumber && (
        <Card id="certificate-preview" className="print:shadow-none overflow-hidden">
          <CardContent className="p-0">
            <div 
              id="certificate-print-area" 
              className="relative" 
              style={{ 
                width: '1123px', 
                height: '794px',
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Certificate Container - Green theme for Shahada */}
              <div className="w-full h-full border-8 border-double border-green-700 p-3 bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
                
                {/* Anti-Copy Pattern */}
                <AntiCopyPattern />
                
                {/* Security Fibers */}
                <SecurityFibers />
                
                {/* Watermark */}
                <WatermarkText text={`${selectedShahadaApp.first_name} ${selectedShahadaApp.last_name}`} />
                
                {/* Security Thread - Green for Shahada */}
                <div className="absolute left-8 top-0 bottom-0 w-2 bg-gradient-to-b from-transparent via-green-500/60 to-transparent">
                  <div className="h-full w-full bg-[repeating-linear-gradient(180deg,transparent,transparent_10px,#22c55e_10px,#22c55e_12px)] opacity-50" />
                </div>
                
                {/* Guilloche Pattern */}
                <GuillocheBackground />
                
                {/* Corner Decorations */}
                <div className="absolute top-1 left-1 w-6 h-6 border-l-2 border-t-2 border-green-600" />
                <div className="absolute top-1 right-1 w-6 h-6 border-r-2 border-t-2 border-green-600" />
                <div className="absolute bottom-1 left-1 w-6 h-6 border-l-2 border-b-2 border-green-600" />
                <div className="absolute bottom-1 right-1 w-6 h-6 border-r-2 border-b-2 border-green-600" />
                
                {/* Main Content */}
                <div className="relative h-full flex flex-col justify-between">
                  
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-1">
                    {/* Left - Logo */}
                    <div className="w-28 flex-shrink-0">
                      <img 
                        src="/src/assets/logo.png" 
                        alt="Rwanda Muslim Community" 
                        className="w-24 h-auto"
                      />
                    </div>

                    {/* Center - Title */}
                    <div className="text-center flex-1 px-1">
                      <h1 className="text-xl font-bold text-green-800 tracking-wide">REPUBLIC OF RWANDA</h1>
                      <h2 className="text-lg font-bold">
                        <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent">RWANDA ISLAMIC COMMUNITY</span>
                      </h2>
                      <p className="text-xs text-green-700 uppercase tracking-widest font-semibold">Official Shahada Certificate</p>
                      <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mt-1" />
                    </div>

                    {/* Right - QR Code */}
                    <div className="w-24 flex-shrink-0 flex flex-col items-center">
                      <div className="p-1.5 bg-white rounded-lg shadow-md border border-green-200">
                        <RealQRCodeSVG value={verificationUrl} size={90} />
                      </div>
                      <p className="text-[8px] text-gray-500 text-center mt-1">Scan to verify</p>
                    </div>
                  </div>

                  {/* Arabic Header */}
                  <div className="text-center my-1">
                    <p className="text-lg font-bold text-green-800">شهادة الشهادة</p>
                    <p className="text-sm text-green-600">Islamic Declaration of Faith Certificate</p>
                  </div>

                  {/* Certificate Number Banner */}
                  <div className="text-center my-1">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 border border-green-400 px-4 py-1 rounded-full">
                      <span className="text-green-800 font-semibold text-xs">CERTIFICATE NO:</span>
                      <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent font-bold">{certificateData.certificateNumber}</span>
                    </div>
                  </div>

                  {/* Certification Text */}
                  <div className="text-center my-1 px-8">
                    <p className="text-sm text-gray-700 italic">This is to certify that</p>
                    <p className="text-xl font-bold text-green-800 my-2">{selectedShahadaApp.first_name} {selectedShahadaApp.last_name}</p>
                    <p className="text-sm text-gray-700 italic">has sincerely declared the Islamic Shahada (Declaration of Faith)</p>
                    {selectedShahadaApp.previous_religion && (
                      <p className="text-xs text-gray-500 mt-1">Previously: {selectedShahadaApp.previous_religion}</p>
                    )}
                  </div>

                  {/* Shahada Declaration */}
                  <div className="mx-16 my-2 p-4 border-2 border-green-200 rounded-lg bg-green-50/50">
                    <p className="text-center text-lg font-bold text-green-800 mb-2">
                      أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله
                    </p>
                    <p className="text-center text-sm text-gray-600 italic">
                      "I bear witness that there is no deity worthy of worship except Allah, 
                      and I bear witness that Muhammad is His servant and Messenger."
                    </p>
                  </div>

                  {/* Convert Photo and Details */}
                  <div className="flex items-center justify-center gap-4 my-1">
                    <div className="w-32 h-32 border-2 border-green-300 rounded-lg overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
                      <UserCircle className="w-16 h-16 text-green-600" />
                    </div>
                    <div className="text-left space-y-1">
                      <p className="text-sm"><span className="font-semibold text-gray-600">ID Number:</span> {selectedShahadaApp.national_id || '_________________'}</p>
                      <p className="text-sm"><span className="font-semibold text-gray-600">Date of Birth:</span> {selectedShahadaApp.date_of_birth || '_________________'}</p>
                      <p className="text-sm"><span className="font-semibold text-gray-600">Declaration Date:</span> {certificateData.declarationDate || selectedShahadaApp.preferred_date || '_________________'}</p>
                      <p className="text-sm"><span className="font-semibold text-gray-600">Location:</span> {certificateData.declarationLocation || selectedShahadaApp.address || '_________________'}</p>
                    </div>
                  </div>

                  {/* Date/Place and Official Stamp */}
                  <div className="flex items-center justify-between my-1 gap-1">
                    {/* Date and Place */}
                    <div className="flex-1 grid grid-cols-2 gap-2 text-center bg-green-50/50 p-1.5 rounded-lg border border-green-200 max-w-md">
                      <div>
                        <span className="text-gray-500 text-[10px] font-medium">Declaration Date:</span>
                        <p className="font-semibold text-sm text-gray-800">{certificateData.declarationDate || selectedShahadaApp.preferred_date || '_________________'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] font-medium">Location:</span>
                        <p className="font-semibold text-sm text-gray-800">{certificateData.declarationLocation || selectedShahadaApp.address || '_________________'}</p>
                      </div>
                    </div>
                    {/* Official Stamp */}
                    <div className="flex-shrink-0 ml-1">
                      <div className="relative">
                        <div className="w-24 h-24">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#16a34a" strokeWidth="2" />
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#16a34a" strokeWidth="1" />
                            <defs>
                              <path id="shahadaCirclePath" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                            </defs>
                            <text fill="#16a34a" fontSize="8" fontWeight="bold">
                              <textPath href="#shahadaCirclePath" startOffset="0%">
                                RWANDA ISLAMIC COMMUNITY
                              </textPath>
                            </text>
                            <text x="50" y="45" textAnchor="middle" fill="#16a34a" fontSize="10" fontWeight="bold">
                              OFFICIAL
                            </text>
                            <text x="50" y="58" textAnchor="middle" fill="#16a34a" fontSize="8">
                              SHAHADA
                            </text>
                            <text x="50" y="68" textAnchor="middle" fill="#16a34a" fontSize="8">
                              CERTIFIED
                            </text>
                            <polygon points="50,25 53,32 60,32 55,37 57,44 50,40 43,44 45,37 40,32 47,32" fill="#16a34a" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="border-t border-green-300 pt-2 mt-1">
                    <p className="text-center text-xs font-bold text-green-700 mb-2 uppercase tracking-widest">Witnessed By</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.witness1Name}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">Witness 1</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.witness2Name}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">Witness 2</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1 relative">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.registrarName}</p>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-[6px]">✓</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">{certificateData.registrarTitle}</p>
                        <p className="text-[8px] text-red-600">Official Seal</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-gray-400 pb-1 mb-1 relative">
                          <p className="text-sm font-serif italic text-gray-700">{certificateData.muftiName || 'Sheikh Salim Hitimana'}</p>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-[6px]">★</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase">Grand Mufti of Rwanda</p>
                        <p className="text-[8px] text-green-600">Chief Islamic Authority</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-1 pt-1 border-t border-green-300 text-center">
                    <p className="text-[9px] text-gray-600 italic max-w-2xl mx-auto leading-tight">
                      This Shahada certificate confirms the bearer's sincere declaration of faith in Islam. 
                      Any alteration or forgery of this document is a criminal offense.
                    </p>
                    <div className="flex justify-center items-center gap-2 mt-1 text-[8px] text-gray-400">
                      <span>Date of Issue: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span>|</span>
                      <span>Verify: {window.location.origin}/verify-certificate/{certificateData.certificateNumber}</span>
                    </div>
                  </div>

                  {/* Security Footer */}
                  <div className="mt-1 flex justify-between items-center text-[8px] text-gray-400 border-t border-dashed border-gray-300 pt-1">
                    <span>🔒 Secure Document | Official Use Only</span>
                    <span className="font-mono">ID: {selectedShahadaApp.id.slice(0, 8)}... | AUTH: RIC-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
