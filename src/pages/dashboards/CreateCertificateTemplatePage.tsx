import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Palette, Shield, FileText, Image, Settings, RefreshCcw, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeSVG as RealQRCodeSVG } from 'qrcode.react';

interface CertificateTemplate {
  id?: string;
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
  organization_logo_url: string;
  organization_stamp_url: string;
  chief_registrar_name: string;
  chief_registrar_title: string;
  show_photos: boolean;
  show_qr_code: boolean;
  show_barcode: boolean;
  show_nfc_indicator: boolean;
  photo_frame_style: string;
  show_watermark: boolean;
  watermark_text: string;
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
}

// Certificate Preview Component
function CertificatePreview({ template }: { template: CertificateTemplate }) {
  const borderClass = template.border_style === 'double' 
    ? 'border-4 border-double' 
    : template.border_style === 'dashed' 
    ? 'border-4 border-dashed' 
    : template.border_style === 'dotted'
    ? 'border-4 border-dotted'
    : 'border-4';

  const photoFrameClass = template.photo_frame_style === 'circle' 
    ? 'rounded-full' 
    : template.photo_frame_style === 'square' 
    ? 'rounded-none' 
    : 'rounded-lg';

  return (
    <div className="overflow-auto">
      {/* Guilloche Background */}
      {template.enable_guilloche_pattern && (
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="previewGuilloche" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="18" fill="none" stroke={template.secondary_color} strokeWidth="0.5" />
              <circle cx="20" cy="20" r="15" fill="none" stroke={template.secondary_color} strokeWidth="0.5" />
              <circle cx="20" cy="20" r="12" fill="none" stroke={template.secondary_color} strokeWidth="0.5" />
              <path d="M0,20 Q10,10 20,20 T40,20" fill="none" stroke={template.secondary_color} strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#previewGuilloche)" />
        </svg>
      )}

      <div 
        className={`relative mx-auto max-w-3xl ${borderClass} p-8 rounded-lg shadow-xl`}
        style={{ 
          background: `linear-gradient(135deg, ${template.background_gradient_start}, ${template.background_gradient_end})`,
          borderColor: template.primary_color,
          minHeight: '500px'
        }}
      >
        {/* Watermark */}
        {template.show_watermark && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
            style={{ transform: 'rotate(-30deg)' }}
          >
            <span 
              className="text-6xl font-bold whitespace-nowrap"
              style={{ color: template.primary_color }}
            >
              {template.watermark_text || 'OFFICIAL CERTIFICATE'}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          {/* Logo placeholder */}
          {template.organization_logo_url ? (
            <img 
              src={template.organization_logo_url} 
              alt="Logo" 
              className="h-16 mx-auto mb-2 object-contain"
            />
          ) : (
            <div 
              className="h-16 w-16 mx-auto mb-2 rounded-full flex items-center justify-center"
              style={{ backgroundColor: template.primary_color }}
            >
              <span className="text-white text-2xl font-bold">RIC</span>
            </div>
          )}
          
          <h1 
            className="text-xl font-bold tracking-wider"
            style={{ color: template.primary_color }}
          >
            {template.header_title}
          </h1>
          <h2 
            className="text-lg font-semibold mt-1"
            style={{ color: template.secondary_color }}
          >
            {template.organization_name}
          </h2>
          <div 
            className="h-1 w-32 mx-auto mt-2 rounded"
            style={{ backgroundColor: template.accent_color }}
          />
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-6 relative z-10">
          <h3 
            className="text-2xl font-bold"
            style={{ color: template.primary_color }}
          >
            {template.certificate_type}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Certificate No: {template.certificate_prefix}-{new Date().getFullYear()}-123456</p>
        </div>

        {/* Main Content */}
        <div className="space-y-4 mb-6 relative z-10 px-4">
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex">
                <span className="font-semibold w-32" style={{ color: template.primary_color }}>Groom:</span>
                <span className="border-b-2 flex-1 pb-1" style={{ borderColor: template.accent_color }}>John Doe</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32" style={{ color: template.primary_color }}>Bride:</span>
                <span className="border-b-2 flex-1 pb-1" style={{ borderColor: template.accent_color }}>Jane Smith</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32" style={{ color: template.primary_color }}>Date:</span>
                <span className="border-b-2 flex-1 pb-1" style={{ borderColor: template.accent_color }}>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32" style={{ color: template.primary_color }}>Masjid:</span>
                <span className="border-b-2 flex-1 pb-1" style={{ borderColor: template.accent_color }}>Kigali Central Mosque</span>
              </div>
            </div>

            {/* Photos */}
            {template.show_photos && (
              <div className="flex gap-3">
                <div 
                  className={`w-24 h-28 border-2 ${photoFrameClass} overflow-hidden`}
                  style={{ borderColor: template.accent_color }}
                >
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Groom Photo</span>
                  </div>
                </div>
                <div 
                  className={`w-24 h-28 border-2 ${photoFrameClass} overflow-hidden`}
                  style={{ borderColor: template.accent_color }}
                >
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Bride Photo</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code & Security Features */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          {/* Holographic Seal */}
          {template.enable_holographic_seal && (
            <div className="flex flex-col items-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${template.accent_color}, ${template.secondary_color}, ${template.primary_color})`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                <span className="text-white text-xs font-bold text-center">AUTHENTIC<br/>SEAL</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Holographic</span>
            </div>
          )}

          {/* Digital Signature */}
          {template.enable_digital_signature && (
            <div 
              className="px-4 py-2 rounded-lg border-2"
              style={{ borderColor: template.primary_color, backgroundColor: `${template.primary_color}10` }}
            >
              <p className="text-[10px] font-semibold uppercase" style={{ color: template.primary_color }}>Digital Signature</p>
              <p className="text-xs font-mono" style={{ color: template.primary_color }}>A1B2...C3D4</p>
            </div>
          )}

          {/* QR Code */}
          {template.show_qr_code && (
            <div className="flex flex-col items-center">
              <div 
                className="p-2 bg-white rounded-lg shadow-md"
                style={{ border: `2px solid ${template.accent_color}` }}
              >
                <RealQRCodeSVG value="https://example.com/verify/RCN-2026-123456" size={70} />
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Scan to verify</span>
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
          <div className="text-center">
            <div 
              className="h-12 border-b-2 mx-4 mb-1"
              style={{ borderColor: template.accent_color }}
            />
            <p className="text-sm font-semibold" style={{ color: template.primary_color }}>Imam</p>
          </div>
          <div className="text-center">
            <div 
              className="h-12 border-b-2 mx-4 mb-1"
              style={{ borderColor: template.accent_color }}
            />
            <p className="text-sm font-semibold" style={{ color: template.primary_color }}>Witness 1</p>
          </div>
          <div className="text-center">
            <div 
              className="h-12 border-b-2 mx-4 mb-1 relative"
              style={{ borderColor: template.accent_color }}
            >
              {/* Official Stamp overlay */}
              {template.enable_official_stamp && (
                <div className="absolute -top-6 right-0 w-12 h-12">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#dc2626" strokeWidth="2" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#dc2626" strokeWidth="1" />
                    <text x="50" y="40" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold">OFFICIAL</text>
                    <text x="50" y="60" textAnchor="middle" fill="#dc2626" fontSize="8">STAMP</text>
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm font-semibold" style={{ color: template.primary_color }}>
              {template.chief_registrar_title}
            </p>
            {template.chief_registrar_name && (
              <p className="text-xs text-gray-600">{template.chief_registrar_name}</p>
            )}
          </div>
        </div>

        {/* Security Thread */}
        {template.enable_security_thread && (
          <div 
            className="h-1 w-full mb-4"
            style={{ 
              background: `repeating-linear-gradient(90deg, ${template.accent_color}, ${template.secondary_color} 20px, ${template.primary_color} 40px)` 
            }}
          />
        )}

        {/* UV Element */}
        {template.enable_uv_reactive && (
          <div className="text-center mb-4">
            <span 
              className="text-xs px-3 py-1 rounded-full border"
              style={{ 
                borderColor: template.accent_color,
                backgroundColor: `${template.accent_color}20`,
                color: template.accent_color
              }}
            >
              UV: {template.organization_name.split(' ').map(w => w[0]).join('')} AUTHENTIC
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4 relative z-10" style={{ borderColor: template.accent_color }}>
          <p>{template.footer_text}</p>
          <p className="mt-2 font-semibold" style={{ color: template.primary_color }}>{template.legal_notice}</p>
        </div>

        {/* Machine Readable Zone */}
        {template.enable_machine_readable_zone && (
          <div 
            className="mt-4 p-2 font-mono text-xs text-center"
            style={{ backgroundColor: '#f0f0f0' }}
          >
            &lt;&lt;RIC&lt;NIKAH&lt;RCN2026&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </div>
        )}
      </div>
    </div>
  );
}

const defaultTemplate: CertificateTemplate = {
  name: 'Default Nikah Certificate',
  is_active: true,
  primary_color: '#166534',
  secondary_color: '#d97706',
  accent_color: '#f59e0b',
  background_gradient_start: '#fffbeb',
  background_gradient_end: '#ffffff',
  border_style: 'double',
  header_title: 'REPUBLIC OF RWANDA',
  organization_name: 'RWANDA ISLAMIC COMMUNITY',
  certificate_type: 'Official Marriage Certificate',
  footer_text: 'This certificate is issued under the authority of the Rwanda Islamic Community and is valid for all legal purposes.',
  legal_notice: 'Any alteration or forgery of this document is a criminal offense.',
  organization_logo_url: '',
  organization_stamp_url: '',
  chief_registrar_name: '',
  chief_registrar_title: 'Chief Registrar',
  show_photos: true,
  show_qr_code: true,
  show_barcode: false,
  show_nfc_indicator: false,
  photo_frame_style: 'rounded',
  show_watermark: true,
  watermark_text: '',
  enable_guilloche_pattern: true,
  enable_holographic_seal: true,
  enable_official_stamp: true,
  enable_security_thread: true,
  enable_uv_reactive: true,
  enable_metallic_strip: true,
  enable_digital_signature: true,
  enable_machine_readable_zone: true,
  enable_microprint: true,
  enable_security_fibers: true,
  enable_color_shifting_ink: true,
  enable_anti_copy_pattern: true,
  certificate_prefix: 'RCN',
  certificate_format: 'PREFIX-YEAR-RANDOM6',
};

export default function CreateCertificateTemplatePage() {
  const { toast } = useToast();
  const [template, setTemplate] = useState<CertificateTemplate>(defaultTemplate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);

  // Fetch existing templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificate_templates' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTemplates(data as unknown as CertificateTemplate[]);
        // Set active template as default
        const active = data.find((t: any) => t.is_active);
        if (active) {
          setTemplate(active as unknown as CertificateTemplate);
        }
      }
    } catch (err: any) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Deactivate other templates if this one is active
      if (template.is_active) {
        await supabase
          .from('certificate_templates' as any)
          .update({ is_active: false })
          .neq('id', template.id || '00000000-0000-0000-0000-000000000000');
      }

      let result;
      if (template.id) {
        // Update existing
        result = await supabase
          .from('certificate_templates' as any)
          .update(template)
          .eq('id', template.id)
          .select()
          .single();
      } else {
        // Create new
        result = await supabase
          .from('certificate_templates' as any)
          .insert(template)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setTemplate(result.data as unknown as CertificateTemplate);
      toast({
        title: 'Success',
        description: 'Certificate template saved successfully.',
      });
      fetchTemplates();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTemplate(defaultTemplate);
    toast({
      title: 'Reset',
      description: 'Template reset to defaults.',
    });
  };

  const updateField = (field: keyof CertificateTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certificate Template Manager</h2>
          <p className="text-muted-foreground">Customize certificate design, security features, and content</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </div>

      {/* Template Selector */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Existing Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t)}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    template.id === t.id
                      ? 'border-primary bg-primary/10 font-medium'
                      : 'border-border hover:bg-muted/50'
                  } ${t.is_active ? 'ring-2 ring-green-500' : ''}`}
                >
                  {t.name} {t.is_active && '(Active)'}
                </button>
              ))}
              <button
                onClick={() => setTemplate({ ...defaultTemplate, id: undefined, name: 'New Template' })}
                className="px-4 py-2 rounded-lg border border-dashed border-border text-sm hover:bg-muted/50"
              >
                + Create New
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="format">Format</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={template.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g., Standard Nikah Certificate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Active Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={(checked) => updateField('is_active', checked)}
                    />
                    <span className="text-sm">Set as active template</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Chief Registrar Name</Label>
                <Input
                  value={template.chief_registrar_name}
                  onChange={(e) => updateField('chief_registrar_name', e.target.value)}
                  placeholder="e.g., Sheikh Abdullah Hassan"
                />
              </div>

              <div className="space-y-2">
                <Label>Chief Registrar Title</Label>
                <Input
                  value={template.chief_registrar_title}
                  onChange={(e) => updateField('chief_registrar_title', e.target.value)}
                  placeholder="e.g., Chief Registrar"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Organization Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Logo URL</Label>
                <Input
                  value={template.organization_logo_url}
                  onChange={(e) => updateField('organization_logo_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Organization Stamp URL</Label>
                <Input
                  value={template.organization_stamp_url}
                  onChange={(e) => updateField('organization_stamp_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Colors & Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.primary_color}
                      onChange={(e) => updateField('primary_color', e.target.value)}
                      className="w-16"
                    />
                    <Input value={template.primary_color} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.secondary_color}
                      onChange={(e) => updateField('secondary_color', e.target.value)}
                      className="w-16"
                    />
                    <Input value={template.secondary_color} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.accent_color}
                      onChange={(e) => updateField('accent_color', e.target.value)}
                      className="w-16"
                    />
                    <Input value={template.accent_color} readOnly />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Background Gradient Start</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.background_gradient_start}
                      onChange={(e) => updateField('background_gradient_start', e.target.value)}
                      className="w-16"
                    />
                    <Input value={template.background_gradient_start} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Gradient End</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.background_gradient_end}
                      onChange={(e) => updateField('background_gradient_end', e.target.value)}
                      className="w-16"
                    />
                    <Input value={template.background_gradient_end} readOnly />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Border Style</Label>
                <Select
                  value={template.border_style}
                  onValueChange={(value) => updateField('border_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between">
                  <Label>Show Photos</Label>
                  <Switch
                    checked={template.show_photos}
                    onCheckedChange={(checked) => updateField('show_photos', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show QR Code</Label>
                  <Switch
                    checked={template.show_qr_code}
                    onCheckedChange={(checked) => updateField('show_qr_code', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Barcode</Label>
                  <Switch
                    checked={template.show_barcode}
                    onCheckedChange={(checked) => updateField('show_barcode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show NFC Indicator</Label>
                  <Switch
                    checked={template.show_nfc_indicator}
                    onCheckedChange={(checked) => updateField('show_nfc_indicator', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Watermark</Label>
                  <Switch
                    checked={template.show_watermark}
                    onCheckedChange={(checked) => updateField('show_watermark', checked)}
                  />
                </div>
              </div>

              {template.show_watermark && (
                <div className="mt-4 space-y-2">
                  <Label>Watermark Text (leave empty for couple names)</Label>
                  <Input
                    value={template.watermark_text}
                    onChange={(e) => updateField('watermark_text', e.target.value)}
                    placeholder="Custom watermark text"
                  />
                </div>
              )}

              <div className="mt-4 space-y-2">
                <Label>Photo Frame Style</Label>
                <Select
                  value={template.photo_frame_style}
                  onValueChange={(value) => updateField('photo_frame_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Guilloche Pattern</span>
                  <Switch
                    checked={template.enable_guilloche_pattern}
                    onCheckedChange={(checked) => updateField('enable_guilloche_pattern', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Holographic Seal</span>
                  <Switch
                    checked={template.enable_holographic_seal}
                    onCheckedChange={(checked) => updateField('enable_holographic_seal', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Official Stamp</span>
                  <Switch
                    checked={template.enable_official_stamp}
                    onCheckedChange={(checked) => updateField('enable_official_stamp', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Security Thread</span>
                  <Switch
                    checked={template.enable_security_thread}
                    onCheckedChange={(checked) => updateField('enable_security_thread', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">UV Reactive</span>
                  <Switch
                    checked={template.enable_uv_reactive}
                    onCheckedChange={(checked) => updateField('enable_uv_reactive', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Metallic Strip</span>
                  <Switch
                    checked={template.enable_metallic_strip}
                    onCheckedChange={(checked) => updateField('enable_metallic_strip', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Digital Signature</span>
                  <Switch
                    checked={template.enable_digital_signature}
                    onCheckedChange={(checked) => updateField('enable_digital_signature', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Machine Readable Zone</span>
                  <Switch
                    checked={template.enable_machine_readable_zone}
                    onCheckedChange={(checked) => updateField('enable_machine_readable_zone', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Microprint</span>
                  <Switch
                    checked={template.enable_microprint}
                    onCheckedChange={(checked) => updateField('enable_microprint', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Security Fibers</span>
                  <Switch
                    checked={template.enable_security_fibers}
                    onCheckedChange={(checked) => updateField('enable_security_fibers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Color Shifting Ink</span>
                  <Switch
                    checked={template.enable_color_shifting_ink}
                    onCheckedChange={(checked) => updateField('enable_color_shifting_ink', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Anti-Copy Pattern</span>
                  <Switch
                    checked={template.enable_anti_copy_pattern}
                    onCheckedChange={(checked) => updateField('enable_anti_copy_pattern', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Text Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Header Title</Label>
                <Input
                  value={template.header_title}
                  onChange={(e) => updateField('header_title', e.target.value)}
                  placeholder="e.g., REPUBLIC OF RWANDA"
                />
              </div>

              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  value={template.organization_name}
                  onChange={(e) => updateField('organization_name', e.target.value)}
                  placeholder="e.g., RWANDA ISLAMIC COMMUNITY"
                />
              </div>

              <div className="space-y-2">
                <Label>Certificate Type</Label>
                <Input
                  value={template.certificate_type}
                  onChange={(e) => updateField('certificate_type', e.target.value)}
                  placeholder="e.g., Official Marriage Certificate"
                />
              </div>

              <div className="space-y-2">
                <Label>Footer Text</Label>
                <Textarea
                  value={template.footer_text}
                  onChange={(e) => updateField('footer_text', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Legal Notice</Label>
                <Textarea
                  value={template.legal_notice}
                  onChange={(e) => updateField('legal_notice', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Format Tab */}
        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Number Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Certificate Prefix</Label>
                <Input
                  value={template.certificate_prefix}
                  onChange={(e) => updateField('certificate_prefix', e.target.value.toUpperCase())}
                  placeholder="e.g., RCN, RIC, NIKAH"
                />
                <p className="text-xs text-muted-foreground">Appears before the certificate number</p>
              </div>

              <div className="space-y-2">
                <Label>Certificate Number Format</Label>
                <Select
                  value={template.certificate_format}
                  onValueChange={(value) => updateField('certificate_format', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREFIX-YEAR-RANDOM6">PREFIX-YEAR-###### (e.g., RCN-2026-123456)</SelectItem>
                    <SelectItem value="UUID">UUID (e.g., RCN-A1B2C3D4)</SelectItem>
                    <SelectItem value="PREFIX-SEQUENTIAL">PREFIX-SEQUENTIAL (e.g., RCN-000001)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <code className="text-sm">
                  {template.certificate_format === 'PREFIX-YEAR-RANDOM6' && `${template.certificate_prefix}-${new Date().getFullYear()}-123456`}
                  {template.certificate_format === 'UUID' && `${template.certificate_prefix}-A1B2C3D4`}
                  {template.certificate_format === 'PREFIX-SEQUENTIAL' && `${template.certificate_prefix}-000001`}
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Certificate Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CertificatePreview template={template} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
