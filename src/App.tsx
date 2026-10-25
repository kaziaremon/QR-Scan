import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from 'qr-code-styling';
import { 
  Download, 
  Link as LinkIcon, 
  Palette, 
  Shapes, 
  Image as ImageIcon, 
  Trash2, 
  Upload, 
  QrCode, 
  Pipette, 
  Printer, 
  Wifi, 
  User, 
  MessageSquare, 
  Mail, 
  Phone, 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Languages, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Frame,
  RotateCcw
} from 'lucide-react';

import { QRContentType, WiFiData, VCardData, WhatsAppData, EmailData, SMSData, QRPreset } from './types';
import { generatePayload } from './utils/qrPayload';
import { evaluateColors } from './utils/contrast';
import { QR_PRESETS } from './utils/presets';
import { BRAND_LOGOS } from './utils/brandLogos';
import { ScannerVerifier } from './components/ScannerVerifier';

declare global {
  interface Window {
    EyeDropper: any;
  }
}

const dotTypes: { label: string; labelBn: string; value: DotType }[] = [
  { label: 'Rounded', labelBn: 'রাউন্ডেড (Rounded)', value: 'rounded' },
  { label: 'Dots', labelBn: 'ডটস (Dots)', value: 'dots' },
  { label: 'Classy', labelBn: 'ক্লাসি (Classy)', value: 'classy' },
  { label: 'Extra Rounded', labelBn: 'এক্সট্রা রাউন্ডেড', value: 'extra-rounded' },
  { label: 'Square', labelBn: 'স্কয়ার (Square)', value: 'square' },
];

const cornerSquareTypes: { label: string; labelBn: string; value: CornerSquareType }[] = [
  { label: 'Rounded', labelBn: 'রাউন্ডেড', value: 'extra-rounded' },
  { label: 'Square', labelBn: 'স্কয়ার', value: 'square' },
  { label: 'Dot', labelBn: 'ডট', value: 'dot' },
];

const cornerDotTypes: { label: string; labelBn: string; value: CornerDotType }[] = [
  { label: 'Dot', labelBn: 'ডট', value: 'dot' },
  { label: 'Square', labelBn: 'স্কয়ার', value: 'square' },
];

const densityOptions: { label: string; labelBn: string; desc: string; descBn: string; value: ErrorCorrectionLevel }[] = [
  { label: 'High (30%)', labelBn: 'সর্বোচ্চ ঘন (H - 30%)', desc: 'Recommended with Logo', descBn: 'লোগো থাকলে আবশ্যক', value: 'H' },
  { label: 'Quartile (25%)', labelBn: 'ঘন (Q - 25%)', desc: 'High reliability', descBn: 'উচ্চ নির্ভরযোগ্যতা', value: 'Q' },
  { label: 'Standard (15%)', labelBn: 'স্ট্যান্ডার্ড (M - 15%)', desc: 'Default balanced', descBn: 'স্বাভাবিক ভারসাম্য', value: 'M' },
  { label: 'Minimal (7%)', labelBn: 'মিনিমাল (L - 7%)', desc: 'Fastest decode', descBn: 'সবচেয়ে হালকা', value: 'L' },
];

export default function App() {
  const [lang, setLang] = useState<'en' | 'bn'>('bn');
  const [contentType, setContentType] = useState<QRContentType>('url');
  
  // Content States
  const [url, setUrl] = useState<string>('https://example.com');
  const [wifi, setWifi] = useState<WiFiData>({ ssid: '', password: '', encryption: 'WPA', hidden: false });
  const [vcard, setVcard] = useState<VCardData>({
    firstName: '',
    lastName: '',
    phone: '',
    mobile: '',
    email: '',
    organization: '',
    title: '',
    url: '',
    street: '',
    city: '',
    country: '',
  });
  const [whatsapp, setWhatsapp] = useState<WhatsAppData>({ phone: '', message: '' });
  const [email, setEmail] = useState<EmailData>({ email: '', subject: '', body: '' });
  const [phone, setPhone] = useState<string>('');
  const [sms, setSms] = useState<SMSData>({ phone: '', message: '' });
  const [text, setText] = useState<string>('');

  // Styling States
  const [dotsColor, setDotsColor] = useState<string>('#090d16');
  const [useGradient, setUseGradient] = useState<boolean>(false);
  const [gradientColor2, setGradientColor2] = useState<string>('#3b82f6');
  const [cornersColor, setCornersColor] = useState<string>('#090d16');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [dotsType, setDotsType] = useState<DotType>('rounded');
  const [cornersSquareType, setCornersSquareType] = useState<CornerSquareType>('extra-rounded');
  const [cornersDotType, setCornersDotType] = useState<CornerDotType>('dot');
  const [density, setDensity] = useState<ErrorCorrectionLevel>('H');
  const [margin, setMargin] = useState<number>(12);

  // Logo States
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(0.28); // Safe default 28%
  const [logoMargin, setLogoMargin] = useState<number>(4);
  const [logoBackground, setLogoBackground] = useState<boolean>(true);

  // Frame & Border States
  const [frameStyle, setFrameStyle] = useState<'none' | 'border' | 'banner'>('none');
  const [borderColor, setBorderColor] = useState<string>('#090d16');
  const [borderWidth, setBorderWidth] = useState<number>(4);
  const [borderRadius, setBorderRadius] = useState<number>(20);
  const [bannerText, setBannerText] = useState<string>('SCAN ME');

  // UI States
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'colors' | 'logo' | 'frame'>('content');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  // Calculate current payload
  const currentPayload = generatePayload(contentType, {
    url,
    wifi,
    vcard,
    whatsapp,
    email,
    sms,
    phone,
    text,
  });

  // Automatically enforce High error correction if a logo is applied
  useEffect(() => {
    if (logo && (density === 'L' || density === 'M')) {
      setDensity('H');
    }
  }, [logo]);

  // Build QRCodeStyling options
  const getQROptions = (size: number, customMargin?: number) => {
    const calculatedMargin = customMargin !== undefined ? customMargin : margin;
    
    // Configure dots styling with gradient if enabled
    const dotsOptionsConfig: any = {
      type: dotsType,
      color: dotsColor,
    };

    if (useGradient && gradientColor2) {
      dotsOptionsConfig.gradient = {
        type: 'linear',
        rotation: 0.785, // 45 degrees
        colorStops: [
          { offset: 0, color: dotsColor },
          { offset: 1, color: gradientColor2 },
        ],
      };
    }

    return {
      width: size,
      height: size,
      margin: calculatedMargin,
      data: currentPayload,
      image: logo || undefined,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: logoMargin,
        imageSize: Math.min(0.35, Math.max(0.15, logoSize)),
        hideBackgroundDots: logoBackground,
      },
      qrOptions: {
        errorCorrectionLevel: density,
      },
      dotsOptions: dotsOptionsConfig,
      backgroundOptions: {
        color: backgroundColor,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: cornersColor,
      },
      cornersDotOptions: {
        type: cornersDotType,
        color: cornersColor,
      },
    };
  };

  // Initialize or update QR Code with high performance
  useEffect(() => {
    const options = getQROptions(340);

    if (!qrCodeRef.current) {
      const qr = new QRCodeStyling(options);
      qrCodeRef.current = qr;
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
        qr.append(qrRef.current);
      }
    } else {
      qrCodeRef.current.update(options);
    }
  }, [
    currentPayload,
    dotsColor,
    useGradient,
    gradientColor2,
    cornersColor,
    backgroundColor,
    dotsType,
    cornersSquareType,
    cornersDotType,
    density,
    margin,
    logo,
    logoSize,
    logoMargin,
    logoBackground,
  ]);

  // Preset Selector
  const applyPreset = (preset: QRPreset) => {
    setDotsColor(preset.dotsColor);
    setCornersColor(preset.cornersColor);
    setBackgroundColor(preset.backgroundColor);
    setDotsType(preset.dotsType);
    setCornersSquareType(preset.cornersSquareType);
    setCornersDotType(preset.cornersDotType);
    if (preset.gradientType !== 'none' && preset.gradientColor2) {
      setUseGradient(true);
      setGradientColor2(preset.gradientColor2);
    } else {
      setUseGradient(false);
    }
  };

  // 1-Click Auto-Fix for 100% Scannability
  const handleAutoFix = () => {
    setDensity('H');
    setLogoSize(0.26);
    setLogoMargin(5);
    setLogoBackground(true);
    setDotsColor('#090d16');
    setCornersColor('#090d16');
    setBackgroundColor('#ffffff');
    setUseGradient(false);
    setMargin(14);
  };

  // Logo Upload Handler
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
        setDensity('H'); // Automatically upgrade error correction
      };
      reader.readAsDataURL(file);
    }
  };

  // EyeDropper API
  const openEyeDropper = async (setColor: (c: string) => void) => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        setColor(result.sRGBHex);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert(lang === 'bn' 
        ? "আপনার ব্রাউজার আই-ড্রপার (EyeDropper) সাপোর্ট করে না।" 
        : "Your browser does not support the EyeDropper tool.");
    }
  };

  // High-Resolution Export Engine
  const downloadQR = async (ext: 'png' | 'svg' | 'webp') => {
    setIsExporting(true);
    try {
      const exportDimension = 2048;
      const scale = exportDimension / 340;
      const bWidth = borderWidth * scale;
      const bRadius = borderRadius * scale;
      const safeMargin = frameStyle !== 'none' ? Math.max(80, bWidth + 30) : 40;

      const hdQr = new QRCodeStyling({
        ...getQROptions(exportDimension, safeMargin),
      });

      if (frameStyle === 'none' && ext === 'svg') {
        await hdQr.download({ extension: 'svg', name: 'qr-studio-pro' });
        setIsExporting(false);
        return;
      }

      if (frameStyle === 'none' && ext !== 'svg') {
        const blob = (await hdQr.getRawData(ext === 'webp' ? 'png' : ext)) as Blob;
        if (!blob) return;

        if (ext === 'webp') {
          const img = new Image();
          const objUrl = URL.createObjectURL(blob);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = exportDimension;
            canvas.height = exportDimension;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const link = document.createElement('a');
              link.download = `qr-studio-pro.webp`;
              link.href = canvas.toDataURL('image/webp', 0.95);
              link.click();
            }
            URL.revokeObjectURL(objUrl);
          };
          img.src = objUrl;
        } else {
          await hdQr.download({ extension: ext, name: 'qr-studio-pro' });
        }
        setIsExporting(false);
        return;
      }

      // If Frame or Banner is enabled
      const blob = (await hdQr.getRawData('png')) as Blob;
      if (!blob) return;
      const objUrl = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const bannerExtraHeight = frameStyle === 'banner' ? 240 : 0;
        const canvas = document.createElement('canvas');
        canvas.width = exportDimension;
        canvas.height = exportDimension + bannerExtraHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const x = bWidth / 2;
        const y = bWidth / 2;
        const w = canvas.width - bWidth;
        const h = canvas.height - bWidth;
        const r = Math.max(0, bRadius - bWidth / 2);

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Frame outline
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();

        ctx.save();
        ctx.clip();

        // Draw QR Image
        ctx.drawImage(img, 0, 0);

        // Draw Banner Text if style is banner
        if (frameStyle === 'banner') {
          ctx.fillStyle = borderColor;
          ctx.fillRect(0, exportDimension, exportDimension, bannerExtraHeight);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 84px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bannerText || 'SCAN ME', canvas.width / 2, exportDimension + bannerExtraHeight / 2);
        }

        ctx.restore();

        // Stroke frame
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = bWidth;
        ctx.stroke();

        const link = document.createElement('a');
        link.download = `qr-studio-pro.${ext === 'webp' ? 'webp' : 'png'}`;
        link.href = canvas.toDataURL(ext === 'webp' ? 'image/webp' : 'image/png');
        link.click();
        URL.revokeObjectURL(objUrl);
        setIsExporting(false);
      };
      img.src = objUrl;

    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
    }
  };

  // Copy to Clipboard
  const copyToClipboard = async () => {
    try {
      const hdQr = new QRCodeStyling(getQROptions(1024, 24));
      const blob = (await hdQr.getRawData('png')) as Blob;
      if (!blob) return;

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert(lang === 'bn' ? 'ক্লিপবোর্ডে কপি করতে ব্যর্থ হয়েছে।' : 'Failed to copy to clipboard.');
    }
  };

  // Print QR Code
  const printQR = async () => {
    try {
      const printQr = new QRCodeStyling(getQROptions(1024, 28));
      const blob = (await printQr.getRawData('png')) as Blob;
      if (!blob) return;

      const objUrl = URL.createObjectURL(blob);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert(lang === 'bn' ? 'অনুগ্রহ করে পপ-আপ ব্লকার বন্ধ করুন।' : 'Please disable popup blocker.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print QR Code - QR Studio Pro</title>
            <style>
              body {
                margin: 0;
                padding: 40px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: white;
                font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              }
              .card {
                padding: 30px;
                border-radius: 24px;
                border: 2px dashed #cbd5e1;
                text-align: center;
                max-width: 480px;
              }
              .qr-img {
                max-width: 360px;
                height: auto;
                border-radius: 16px;
              }
              .title {
                margin-top: 20px;
                font-size: 20px;
                font-weight: 700;
                color: #0f172a;
              }
              .subtitle {
                margin-top: 6px;
                font-size: 13px;
                color: #64748b;
              }
              @media print {
                body { padding: 0; }
                .card { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <img class="qr-img" src="${objUrl}" onload="window.print(); window.onafterprint = () => window.close();" />
              <div class="title">${frameStyle === 'banner' ? bannerText : 'Scan with Camera'}</div>
              <div class="subtitle">Generated by QR Studio Pro</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Print generation failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-16">
      
      {/* Top Ambient Glow */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] opacity-20 pointer-events-none blur-[140px] rounded-full transition-colors duration-700"
        style={{ background: dotsColor || '#3b82f6' }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070b14]/80 border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-blue-400">
                <QrCode size={22} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
                  {lang === 'bn' ? 'কিউআর স্টুডিও প্রো' : 'QR Studio Pro'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30">
                  World-Class
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'bn' ? '১০০% নির্ভুল ও কাস্টম কিউআর জেনারেটর' : '100% Scannable Custom QR Architect'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-Fix Scannability quick button */}
            <button
              onClick={handleAutoFix}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80 transition-all hover:text-white"
              title={lang === 'bn' ? 'ডিফল্ট অপ্টিমাইজড সেটিংসে রিসেট করুন' : 'Reset to optimized default settings'}
            >
              <RotateCcw size={13} />
              <span>{lang === 'bn' ? 'অপ্টিমাইজ রিসেট' : 'Optimize Reset'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all"
            >
              <Languages size={14} />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Curated Pro Presets Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles size={14} className="text-amber-400" />
              <span>{lang === 'bn' ? '১-ক্লিকে প্রফেশনাল থিম' : '1-Click Pro Themes'}</span>
            </div>
            <span className="text-[11px] text-slate-500">{lang === 'bn' ? 'যেকোনো থিমে ক্লিক করে তাৎক্ষণিক লুক পরিবর্তন করুন' : 'Click any preset to apply instantly'}</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {QR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-xs font-medium text-slate-200 group"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: preset.dotsColor }}
                />
                <span className="group-hover:text-white">{lang === 'bn' ? preset.nameBn : preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Creator Studio Controls */}
          <div className="w-full lg:w-[54%] space-y-6">

            {/* Content Type Selector */}
            <div className="bg-slate-900/80 rounded-2xl p-2 border border-slate-800 shadow-xl flex flex-wrap gap-1">
              {[
                { id: 'url', label: lang === 'bn' ? 'ওয়েবসাইট লিংক' : 'Website URL', icon: LinkIcon },
                { id: 'wifi', label: lang === 'bn' ? 'ওয়াই-ফাই' : 'Wi-Fi Network', icon: Wifi },
                { id: 'vcard', label: lang === 'bn' ? 'ডিজিটাল কার্ড' : 'vCard Contact', icon: User },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'email', label: lang === 'bn' ? 'ইমেইল' : 'Email', icon: Mail },
                { id: 'phone', label: lang === 'bn' ? 'ফোন কল' : 'Phone', icon: Phone },
                { id: 'text', label: lang === 'bn' ? 'সাধারণ টেক্সট' : 'Plain Text', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = contentType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setContentType(item.id as QRContentType)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Customization Navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
              {[
                { id: 'content', label: lang === 'bn' ? 'তথ্য ও কনটেন্ট' : 'Data & Content', icon: LinkIcon },
                { id: 'style', label: lang === 'bn' ? 'শেপ ও প্যাটার্ন' : 'Shapes & Density', icon: Shapes },
                { id: 'colors', label: lang === 'bn' ? 'রং ও গ্রেডিয়েন্ট' : 'Colors & Gradients', icon: Palette },
                { id: 'logo', label: lang === 'bn' ? 'লোগো ও ব্র্যান্ডিং' : 'Logo & Branding', icon: ImageIcon },
                { id: 'frame', label: lang === 'bn' ? 'বর্ডার ও ফ্রেম' : 'Frame & Banner', icon: Frame },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                      isActive
                        ? 'border-blue-500 text-blue-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: CONTENT INPUTS */}
            {activeTab === 'content' && (
              <section className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-4">
                
                {contentType === 'url' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {lang === 'bn' ? 'ওয়েবসাইটের ঠিকানা (URL)' : 'Website URL'}
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-sm transition-all"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {lang === 'bn' 
                        ? 'ক্যামেরা দিয়ে স্ক্যান করলে ব্রাউজারে স্বয়ংক্রিয়ভাবে ওয়েবসাইট খুলে যাবে।' 
                        : 'Any smartphone camera will open this website instantly upon scanning.'}
                    </p>
                  </div>
                )}

                {contentType === 'wifi' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        {lang === 'bn' ? 'ওয়াই-ফাই নাম (Network SSID)' : 'Network SSID (Name)'}
                      </label>
                      <input
                        type="text"
                        value={wifi.ssid}
                        onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                        placeholder="Home-WiFi-5G"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        {lang === 'bn' ? 'ওয়াই-ফাই পাসওয়ার্ড' : 'Wi-Fi Password'}
                      </label>
                      <input
                        type="text"
                        value={wifi.password}
                        onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                        placeholder="SecretKey123"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                          {lang === 'bn' ? 'সিকিউরিটি টাইপ' : 'Security Type'}
                        </label>
                        <select
                          value={wifi.encryption}
                          onChange={(e) => setWifi({ ...wifi, encryption: e.target.value as any })}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="WPA">WPA / WPA2 / WPA3</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">{lang === 'bn' ? 'পাসওয়ার্ড ছাড়া (Open)' : 'No Password'}</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={wifi.hidden}
                            onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 w-4 h-4"
                          />
                          <span>{lang === 'bn' ? 'লুকানো নেটওয়ার্ক (Hidden)' : 'Hidden Network'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {contentType === 'vcard' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'নামের প্রথম অংশ' : 'First Name'}
                        </label>
                        <input
                          type="text"
                          value={vcard.firstName}
                          onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                          placeholder="Kazi"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'নামের শেষ অংশ' : 'Last Name'}
                        </label>
                        <input
                          type="text"
                          value={vcard.lastName}
                          onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                          placeholder="Emon"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone / Mobile'}
                        </label>
                        <input
                          type="tel"
                          value={vcard.mobile}
                          onChange={(e) => setVcard({ ...vcard, mobile: e.target.value })}
                          placeholder="+8801700000000"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={vcard.email}
                          onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'প্রতিষ্ঠান / কোম্পানি' : 'Company'}
                        </label>
                        <input
                          type="text"
                          value={vcard.organization}
                          onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                          placeholder="Studio Inc."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'পদবী / টাইটেল' : 'Job Title'}
                        </label>
                        <input
                          type="text"
                          value={vcard.title}
                          onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                          placeholder="Design Director"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {contentType === 'whatsapp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        {lang === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোড সহ)' : 'WhatsApp Phone (with Country Code)'}
                      </label>
                      <input
                        type="tel"
                        value={whatsapp.phone}
                        onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                        placeholder="+8801700000000"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        {lang === 'bn' ? 'পূর্বনির্ধারিত মেসেজ (ঐচ্ছিক)' : 'Pre-filled Message (Optional)'}
                      </label>
                      <textarea
                        rows={3}
                        value={whatsapp.message}
                        onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
                        placeholder="Hello, I would like to inquire about your services."
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>
                  </div>
                )}

                {contentType === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {lang === 'bn' ? 'প্রাপকের ইমেইল' : 'Recipient Email'}
                      </label>
                      <input
                        type="email"
                        value={email.email}
                        onChange={(e) => setEmail({ ...email, email: e.target.value })}
                        placeholder="contact@company.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {lang === 'bn' ? 'বিষয় (Subject)' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        value={email.subject}
                        onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                        placeholder="Project Inquiry"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {lang === 'bn' ? 'মেসেজ বডি' : 'Body Content'}
                      </label>
                      <textarea
                        rows={3}
                        value={email.body}
                        onChange={(e) => setEmail({ ...email, body: e.target.value })}
                        placeholder="Hello, writing regarding..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {contentType === 'phone' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                    />
                  </div>
                )}

                {contentType === 'text' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {lang === 'bn' ? 'প্লেইন টেক্সট বা নোট' : 'Plain Text or Note'}
                    </label>
                    <textarea
                      rows={5}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write any text here..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                )}

              </section>
            )}

            {/* TAB 2: SHAPES & DENSITY */}
            {activeTab === 'style' && (
              <section className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-5">
                
                {/* Density / Error Correction Level */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {lang === 'bn' ? 'ত্রুটি সংশোধন লেভেল (Error Correction)' : 'Error Correction Level'}
                    </label>
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Level {density}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {densityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDensity(opt.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          density === opt.value
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-xs text-white">
                          {lang === 'bn' ? opt.labelBn : opt.label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {lang === 'bn' ? opt.descBn : opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dot Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {lang === 'bn' ? 'ডট প্যাটার্ন (Dot Style)' : 'Dot Style'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {dotTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setDotsType(type.value)}
                        className={`py-2 px-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                          dotsType === type.value
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {lang === 'bn' ? type.labelBn : type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Square Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {lang === 'bn' ? 'কর্নার ফ্রেম (Corner Square)' : 'Corner Frame Style'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {cornerSquareTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setCornersSquareType(type.value)}
                          className={`py-2 px-2 rounded-xl border text-center text-xs font-medium transition-all ${
                            cornersSquareType === type.value
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {lang === 'bn' ? type.labelBn : type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {lang === 'bn' ? 'কর্নার ভেতরের ডট' : 'Corner Center Dot'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {cornerDotTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setCornersDotType(type.value)}
                          className={`py-2 px-2 rounded-xl border text-center text-xs font-medium transition-all ${
                            cornersDotType === type.value
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {lang === 'bn' ? type.labelBn : type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Margin / Quiet Zone */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {lang === 'bn' ? 'মার্জিন / কুয়াইট জোন (Quiet Zone)' : 'Quiet Zone Margin'}
                    </label>
                    <span className="text-xs font-mono text-slate-400">{margin}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    {lang === 'bn' 
                      ? 'আন্তর্জাতিক কিউআর স্ট্যান্ডার্ড অনুযায়ী ক্যামেরা শনাক্তকরণের জন্য পর্যাপ্ত মার্জিন থাকা আবশ্যক।' 
                      : 'QR standard requires at least 4 modules of quiet zone for instant camera detection.'}
                  </p>
                </div>

              </section>
            )}

            {/* TAB 3: COLORS & GRADIENTS */}
            {activeTab === 'colors' && (
              <section className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-6">
                
                {/* Gradient Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      {lang === 'bn' ? 'ডুয়াল-কালার গ্রেডিয়েন্ট' : 'Dual-Color Gradient'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {lang === 'bn' ? 'প্রিমিয়াম ৪৭ ডিগ্রি লিনিয়ার কালার ব্লেন্ড' : 'Smooth 45° dynamic linear color blend'}
                    </div>
                  </div>
                  <button
                    onClick={() => setUseGradient(!useGradient)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${useGradient ? 'bg-blue-600' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${useGradient ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Color Pickers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Dots Color */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      {lang === 'bn' ? 'প্যাটার্ন (ডট) এর রং' : 'Dots Color (Primary)'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={dotsColor}
                        onChange={(e) => setDotsColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <button
                        onClick={() => openEyeDropper(setDotsColor)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                        title="Pick color from screen"
                      >
                        <Pipette size={16} />
                      </button>
                      <span className="font-mono text-xs text-slate-300 uppercase">{dotsColor}</span>
                    </div>
                  </div>

                  {/* Secondary Gradient Color */}
                  {useGradient && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in duration-200">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        {lang === 'bn' ? 'গ্রেডিয়েন্ট দ্বিতীয় রং' : 'Gradient Secondary Color'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradientColor2}
                          onChange={(e) => setGradientColor2(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <button
                          onClick={() => openEyeDropper(setGradientColor2)}
                          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                        >
                          <Pipette size={16} />
                        </button>
                        <span className="font-mono text-xs text-slate-300 uppercase">{gradientColor2}</span>
                      </div>
                    </div>
                  )}

                  {/* Corners Color */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      {lang === 'bn' ? 'কর্নার ফ্রেম ও ডটের রং' : 'Corners Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cornersColor}
                        onChange={(e) => setCornersColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <button
                        onClick={() => openEyeDropper(setCornersColor)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                      >
                        <Pipette size={16} />
                      </button>
                      <span className="font-mono text-xs text-slate-300 uppercase">{cornersColor}</span>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      {lang === 'bn' ? 'ক্যানভাস ব্যাকগ্রাউন্ড রং' : 'Background Canvas'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <button
                        onClick={() => openEyeDropper(setBackgroundColor)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                      >
                        <Pipette size={16} />
                      </button>
                      <span className="font-mono text-xs text-slate-300 uppercase">{backgroundColor}</span>
                    </div>
                  </div>

                </div>

              </section>
            )}

            {/* TAB 4: LOGO & BRANDING */}
            {activeTab === 'logo' && (
              <section className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-6">
                
                {/* 1-Click Popular Logos */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    {lang === 'bn' ? 'জনপ্রিয় ব্র্যান্ড লোগো (১-ক্লিক)' : 'Preset Brand Icons (1-Click)'}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                    {BRAND_LOGOS.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          setLogo(brand.svgDataUri);
                          setDensity('H');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          logo === brand.svgDataUri
                            ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/20'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img src={brand.svgDataUri} alt={brand.name} className="w-6 h-6 object-contain" />
                        <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">
                          {brand.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Logo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {lang === 'bn' ? 'অথবা আপনার কাস্টম লোগো আপলোড করুন' : 'Or Upload Custom Logo'}
                  </label>
                  
                  {!logo ? (
                    <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-950/40 hover:bg-slate-950 transition-colors">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400 mb-3 border border-slate-800">
                        <Upload size={20} />
                      </div>
                      <p className="text-sm font-semibold text-slate-200 mb-1">
                        {lang === 'bn' ? 'আপনার ব্র্যান্ডের লোগো সিলেক্ট করুন' : 'Drop logo here or browse'}
                      </p>
                      <p className="text-xs text-slate-500 mb-4">PNG, JPG, SVG, WebP</p>
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all">
                        {lang === 'bn' ? 'লোগো ফাইল খুঁজুন' : 'Browse Files'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center overflow-hidden">
                          <img src={logo} alt="Active Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {lang === 'bn' ? 'লোগো সক্রিয় রয়েছে' : 'Logo Active'}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-medium">
                            {lang === 'bn' ? 'লেভেল H এরর-কারেকশন এনফোর্সড' : 'Level H Error-Correction Enforced'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setLogo(null)}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs flex items-center gap-1"
                      >
                        <Trash2 size={15} />
                        <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Logo Safe Controls (Only shown when logo is active) */}
                {logo && (
                  <div className="space-y-4 pt-2 border-t border-slate-800">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          {lang === 'bn' ? 'লোগোর নিরাপদ সাইজ (Logo Scale)' : 'Safe Logo Scale'}
                        </label>
                        <span className="text-xs font-mono text-blue-400">{Math.round(logoSize * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.15"
                        max="0.35"
                        step="0.01"
                        value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {lang === 'bn' 
                          ? 'নিখুঁত স্ক্যান নিশ্চিত করতে লোগোর আকার সর্বোচ্চ ৩৫% এর মধ্যে সীমাবদ্ধ রাখা হয়।' 
                          : 'Capped to max 35% to guarantee camera Reed-Solomon mathematical recovery.'}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          {lang === 'bn' ? 'লোগো চারপাশের সেফ-মার্জিন' : 'Logo Margin (Safe Zone)'}
                        </label>
                        <span className="text-xs font-mono text-slate-400">{logoMargin}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={logoMargin}
                        onChange={(e) => setLogoMargin(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

              </section>
            )}

            {/* TAB 5: FRAME & BANNER */}
            {activeTab === 'frame' && (
              <section className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {lang === 'bn' ? 'ফ্রেম বা বর্ডারের ধরন' : 'Frame / Border Style'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: lang === 'bn' ? 'ফ্রেম ছাড়া' : 'None' },
                      { id: 'border', label: lang === 'bn' ? 'মিনিমাল বর্ডার' : 'Card Border' },
                      { id: 'banner', label: lang === 'bn' ? 'স্ক্যান মি ব্যানার' : 'Call-To-Action Banner' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setFrameStyle(style.id as any)}
                        className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                          frameStyle === style.id
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {frameStyle !== 'none' && (
                  <div className="space-y-4 pt-2">
                    
                    {frameStyle === 'banner' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'ব্যানারের টেক্সট' : 'Banner Text'}
                        </label>
                        <input
                          type="text"
                          value={bannerText}
                          onChange={(e) => setBannerText(e.target.value)}
                          placeholder="SCAN ME"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold tracking-wider text-sm"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            {lang === 'bn' ? 'বর্ডারের পুরুত্ব' : 'Border Thickness'}
                          </label>
                          <span className="text-xs font-mono text-slate-400">{borderWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="20"
                          value={borderWidth}
                          onChange={(e) => setBorderWidth(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            {lang === 'bn' ? 'কর্নার রাউন্ডনেস' : 'Corner Radius'}
                          </label>
                          <span className="text-xs font-mono text-slate-400">{borderRadius}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="48"
                          value={borderRadius}
                          onChange={(e) => setBorderRadius(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {lang === 'bn' ? 'ফ্রেম বা বর্ডারের রং' : 'Frame Color'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <button
                          onClick={() => openEyeDropper(setBorderColor)}
                          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                        >
                          <Pipette size={16} />
                        </button>
                        <span className="font-mono text-xs text-slate-300 uppercase">{borderColor}</span>
                      </div>
                    </div>

                  </div>
                )}

              </section>
            )}

          </div>

          {/* Right Column: Live High-Def Preview & Verification Card (Sticky) */}
          <div className="w-full lg:w-[46%] lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {lang === 'bn' ? 'রিয়েল-টাইম লাইভ প্রিভিউ' : 'Live Real-Time Engine'}
                </span>
                
                <span className="text-[11px] font-mono text-slate-400">
                  {density} Error Protection
                </span>
              </div>

              {/* QR Code Presentation Box */}
              <div className="flex justify-center my-4">
                <div 
                  className="transition-all duration-300 shadow-2xl flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: backgroundColor,
                    borderRadius: frameStyle !== 'none' ? `${borderRadius}px` : '24px',
                    border: frameStyle !== 'none' ? `${borderWidth}px solid ${borderColor}` : '1px solid rgba(255,255,255,0.08)',
                    maxWidth: '360px',
                    width: '100%',
                  }}
                >
                  <div className="p-3 w-full flex items-center justify-center aspect-square">
                    <div 
                      ref={qrRef} 
                      className="w-full h-full flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto"
                    />
                  </div>

                  {frameStyle === 'banner' && (
                    <div 
                      className="w-full py-2.5 text-center font-bold tracking-widest text-sm uppercase text-white shadow-inner"
                      style={{ backgroundColor: borderColor }}
                    >
                      {bannerText || 'SCAN ME'}
                    </div>
                  )}
                </div>
              </div>

              {/* Real-Time jsQR Optical Verifier & Diagnostics Engine */}
              <ScannerVerifier
                qrContainerRef={qrRef}
                intendedPayload={currentPayload}
                dotsColor={dotsColor}
                backgroundColor={backgroundColor}
                logo={logo}
                onAutoFix={handleAutoFix}
                lang={lang}
              />

              {/* Action Buttons Group */}
              <div className="mt-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => downloadQR('png')}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/25 active:scale-98 disabled:opacity-50"
                  >
                    <Download size={16} />
                    <span>{lang === 'bn' ? 'ডাউনলোড PNG (HD)' : 'Download Ultra PNG'}</span>
                  </button>

                  <button
                    onClick={() => downloadQR('svg')}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs border border-slate-700 transition-all active:scale-98 disabled:opacity-50"
                  >
                    <Download size={16} />
                    <span>{lang === 'bn' ? 'ভেক্টর SVG (প্রিন্ট)' : 'Vector SVG (Print)'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white py-2.5 px-3 rounded-xl text-xs border border-slate-800 transition-all font-semibold"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'ইমেজ কপি' : 'Copy Image')}</span>
                  </button>

                  <button
                    onClick={() => downloadQR('webp')}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white py-2.5 px-3 rounded-xl text-xs border border-slate-800 transition-all font-semibold"
                  >
                    <Download size={14} />
                    <span>WebP HD</span>
                  </button>

                  <button
                    onClick={printQR}
                    className="flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white py-2.5 px-3 rounded-xl text-xs border border-slate-800 transition-all font-semibold"
                  >
                    <Printer size={14} />
                    <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
