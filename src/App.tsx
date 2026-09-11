import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, ErrorCorrectionLevel } from 'qr-code-styling';
import { Download, Link as LinkIcon, Palette, Shapes, Image as ImageIcon, Trash2, Upload, QrCode, Pipette, Printer } from 'lucide-react';

declare global {
  interface Window {
    EyeDropper: any;
  }
}

const dotTypes: { label: string; value: DotType }[] = [
  { label: 'মিনিমাল (স্কয়ার)', value: 'square' },
  { label: 'রাউন্ডেড (Rounded)', value: 'rounded' },
  { label: 'ডটস (Dots)', value: 'dots' },
  { label: 'ক্লাসি (Classy)', value: 'classy' },
  { label: 'অতিরিক্ত রাউন্ডেড', value: 'extra-rounded' },
];

const cornerTypes: { label: string; value: CornerSquareType }[] = [
  { label: 'স্কয়ার (Square)', value: 'square' },
  { label: 'রাউন্ডেড (Rounded)', value: 'extra-rounded' },
  { label: 'ডট (Dot)', value: 'dot' },
];

const densityOptions: { label: string; value: ErrorCorrectionLevel }[] = [
  { label: 'মিনিমাল (কম ডট)', value: 'L' },
  { label: 'স্ট্যান্ডার্ড (মাঝারি)', value: 'M' },
  { label: 'ঘন (বেশি ডট)', value: 'Q' },
  { label: 'সর্বোচ্চ ঘন', value: 'H' },
];

export default function App() {
  const [url, setUrl] = useState<string>('https://example.com');
  const [dotsColor, setDotsColor] = useState<string>('#0f172a');
  const [cornersColor, setCornersColor] = useState<string>('#0f172a');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [hasBorder, setHasBorder] = useState<boolean>(false);
  const [borderColor, setBorderColor] = useState<string>('#0f172a');
  const [borderWidth, setBorderWidth] = useState<number>(4);
  const [borderRadius, setBorderRadius] = useState<number>(16);
  const [dotsType, setDotsType] = useState<DotType>('rounded');
  const [cornersSquareType, setCornersSquareType] = useState<CornerSquareType>('extra-rounded');
  const [density, setDensity] = useState<ErrorCorrectionLevel>('M');
  const [logo, setLogo] = useState<string | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (qrRef.current) {
      // Clear previous canvas/svg to ensure colors and shapes apply perfectly on change
      qrRef.current.innerHTML = '';
      
      const qr = new QRCodeStyling({
        width: 340,
        height: 340,
        margin: 10,
        data: url.trim() || 'https://google.com',
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 6,
          imageSize: 0.55,
        },
        qrOptions: {
          errorCorrectionLevel: density,
        },
        dotsOptions: {
          color: dotsColor,
          type: dotsType,
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          type: cornersSquareType,
          color: cornersColor,
        },
        cornersDotOptions: {
          type: cornersSquareType === 'dot' ? 'dot' : 'square',
          color: cornersColor,
        },
        image: logo || undefined,
      });

      qr.append(qrRef.current);
      qrCodeRef.current = qr;
    }
  }, [url, dotsColor, cornersColor, backgroundColor, dotsType, cornersSquareType, density, logo]);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

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
      alert("আপনার ব্রাউজার আই-ড্রপার (EyeDropper) সাপোর্ট করে না। দয়া করে কালার পিকার ব্যবহার করুন।");
    }
  };

  const ColorInput = ({ label, color, onChange }: { label: string, color: string, onChange: (c: string) => void }) => (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded cursor-pointer border-0 p-0 shadow-sm"
        />
        <button
          onClick={() => openEyeDropper(onChange)}
          className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-600 transition-colors shadow-sm"
          title="স্ক্রিন থেকে কালার পিক করুন"
        >
          <Pipette size={18} />
        </button>
        <span className="text-sm text-neutral-600 uppercase font-mono ml-1">{color}</span>
      </div>
    </div>
  );

  const downloadQR = async (ext: 'png' | 'svg' | 'jpeg') => {
    const scale = 2048 / 372;
    const bWidth = borderWidth * scale;
    const bRadius = borderRadius * scale;
    const margin = hasBorder ? Math.max(60, bWidth + 20) : 20;
    
    // Create a temporary high-resolution instance specifically for downloading
    const hdQr = new QRCodeStyling({
      width: 2048,
      height: 2048,
      margin: margin,
      data: url.trim() || 'https://google.com',
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 24,
        imageSize: 0.55,
      },
      qrOptions: {
        errorCorrectionLevel: density,
      },
      dotsOptions: {
        color: dotsColor,
        type: dotsType,
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: cornersColor,
      },
      cornersDotOptions: {
        type: cornersSquareType === 'dot' ? 'dot' : 'square',
        color: cornersColor,
      },
      image: logo || undefined,
    });

    if (hasBorder && ext !== 'svg') {
      const blob = await hdQr.getRawData(ext) as Blob;
      if (!blob) return;
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        const x = bWidth / 2;
        const y = bWidth / 2;
        const w = canvas.width - bWidth;
        const h = canvas.height - bWidth;
        const r = Math.max(0, bRadius - bWidth / 2);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create rounded rect path
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
        // Fill background inside border
        ctx.fillStyle = backgroundColor;
        ctx.fill();
        
        // Clip for image drawing
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        
        // Draw border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = bWidth;
        ctx.stroke();
        
        const a = document.createElement('a');
        a.download = `hd-premium-qr-code.${ext}`;
        a.href = canvas.toDataURL(`image/${ext}`);
        a.click();
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } else if (hasBorder && ext === 'svg') {
      const blob = await hdQr.getRawData('svg') as Blob;
      if (!blob) return;
      const text = await blob.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svgEl = doc.documentElement;
      
      const currentW = parseInt(svgEl.getAttribute('width') || '2048');
      const currentH = parseInt(svgEl.getAttribute('height') || '2048');
      
      const bgRect = svgEl.querySelector('rect');
      if (bgRect) {
        bgRect.setAttribute('rx', `${bRadius}`);
        bgRect.setAttribute('ry', `${bRadius}`);
      }
      
      // Draw border rect in SVG
      const borderRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      borderRect.setAttribute('x', `${bWidth/2}`);
      borderRect.setAttribute('y', `${bWidth/2}`);
      borderRect.setAttribute('width', `${currentW - bWidth}`);
      borderRect.setAttribute('height', `${currentH - bWidth}`);
      borderRect.setAttribute('fill', 'none');
      borderRect.setAttribute('stroke', borderColor);
      borderRect.setAttribute('stroke-width', `${bWidth}`);
      borderRect.setAttribute('rx', `${Math.max(0, bRadius - bWidth/2)}`);
      borderRect.setAttribute('ry', `${Math.max(0, bRadius - bWidth/2)}`);
      svgEl.appendChild(borderRect);
      
      const serializer = new XMLSerializer();
      const newSvgStr = serializer.serializeToString(svgEl);
      
      const a = document.createElement('a');
      a.download = `hd-premium-qr-code.svg`;
      a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(newSvgStr);
      a.click();
    } else {
      await hdQr.download({ extension: ext, name: 'hd-premium-qr-code' });
    }
  };

  const printQR = async () => {
    const scale = 1024 / 372;
    const bWidth = borderWidth * scale;
    const bRadius = borderRadius * scale;
    const margin = hasBorder ? Math.max(40, bWidth + 20) : 20;

    // Generate a high quality data URL for printing
    const printQr = new QRCodeStyling({
      width: 1024,
      height: 1024,
      margin: margin,
      data: url.trim() || 'https://google.com',
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 12,
        imageSize: 0.55,
      },
      qrOptions: {
        errorCorrectionLevel: density,
      },
      dotsOptions: {
        color: dotsColor,
        type: dotsType,
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: cornersColor,
      },
      cornersDotOptions: {
        type: cornersSquareType === 'dot' ? 'dot' : 'square',
        color: cornersColor,
      },
      image: logo || undefined,
    });

    try {
      const blob = await printQr.getRawData('png') as Blob;
      if (!blob) return;
      const objectUrl = URL.createObjectURL(blob);
      
      const openPrintWindow = (imgSrc: string) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('অনুগ্রহ করে পপ-আপ ব্লকার বন্ধ করুন। (Please disable popup blocker)');
          return;
        }

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  background-color: white;
                }
                .print-container {
                  text-align: center;
                }
                .qr-image {
                  max-width: 100%;
                  max-height: 80vh;
                }
                @media print {
                  @page { margin: 0; }
                  body { margin: 1cm; }
                  .qr-image {
                    max-width: 15cm;
                    max-height: 15cm;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <img class="qr-image" src="${imgSrc}" onload="window.print(); window.onafterprint = () => window.close();" />
              </div>
            </body>
          </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
      };
      
      if (hasBorder) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = 1024;
          canvas.height = 1024;
          
          const x = bWidth / 2;
          const y = bWidth / 2;
          const w = canvas.width - bWidth;
          const h = canvas.height - bWidth;
          const r = Math.max(0, bRadius - bWidth / 2);
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
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
          ctx.fillStyle = backgroundColor;
          ctx.fill();
          ctx.clip();
          
          const tempImg = new Image();
          tempImg.onload = () => {
            ctx.drawImage(tempImg, 0, 0);
            ctx.restore();
            
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = bWidth;
            ctx.stroke();
            
            const finalImgSrc = canvas.toDataURL('image/png');
            openPrintWindow(finalImgSrc);
            URL.revokeObjectURL(objectUrl);
          };
          tempImg.src = objectUrl;
      } else {
         const reader = new FileReader();
         reader.onloadend = () => {
           openPrintWindow(reader.result as string);
         }
         reader.readAsDataURL(blob as Blob);
      }

    } catch (e) {
      console.error("Print generation failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <QrCode size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800 tracking-tight leading-tight">প্রিমিয়াম কিউআর জেনারেটর</h1>
            <p className="text-xs text-neutral-500 font-medium">সম্পূর্ণ ফ্রি ও কাস্টমাইজেবল</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Configuration Sidebar */}
          <div className="w-full lg:w-[45%] space-y-6">
            
            {/* Link Input Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-neutral-800">
                <LinkIcon size={20} className="text-blue-600" />
                <h2 className="font-semibold text-lg">আপনার লিংক দিন</h2>
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-neutral-800 placeholder:text-neutral-400"
              />
              <p className="mt-2 text-sm text-neutral-500">এই লিংকে স্ক্যান করলে ইউজার সরাসরি চলে যাবে।</p>
            </section>

            {/* Shape & Pattern Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-5 text-neutral-800">
                <Shapes size={20} className="text-blue-600" />
                <h2 className="font-semibold text-lg">প্যাটার্ন ও শেপ</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">ডটের পরিমাণ (Density)</label>
                  <select
                    value={density}
                    onChange={(e) => setDensity(e.target.value as ErrorCorrectionLevel)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  >
                    {densityOptions.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {logo && (
                    <p className="mt-2 text-xs text-amber-600 font-medium">
                      লোগো আপলোড করা থাকলে কিউআর কোড স্ক্যান নিশ্চিত করতে 'সর্বোচ্চ ঘন' বেছে নেওয়া ভালো।
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">ডট স্টাইল (Dot Style)</label>
                  <select
                    value={dotsType}
                    onChange={(e) => setDotsType(e.target.value as DotType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  >
                    {dotTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">কর্নার স্টাইল (Corner Style)</label>
                  <select
                    value={cornersSquareType}
                    onChange={(e) => setCornersSquareType(e.target.value as CornerSquareType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  >
                    {cornerTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">বর্ডার (Border)</label>
                  <select
                    value={hasBorder ? 'yes' : 'no'}
                    onChange={(e) => setHasBorder(e.target.value === 'yes')}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white mb-4"
                  >
                    <option value="no">বর্ডার ছাড়া (None)</option>
                    <option value="yes">বর্ডার যুক্ত করুন (Add Border)</option>
                  </select>

                  {hasBorder && (
                    <div className="space-y-5 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-neutral-700">বর্ডারের পুরুত্ব (Thickness)</label>
                          <span className="text-xs text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">{borderWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="32"
                          value={borderWidth}
                          onChange={(e) => setBorderWidth(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-neutral-700">বর্ডারের রাউন্ডনেস (Radius)</label>
                          <span className="text-xs text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">{borderRadius}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="64"
                          value={borderRadius}
                          onChange={(e) => setBorderRadius(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Colors Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-5 text-neutral-800">
                <Palette size={20} className="text-blue-600" />
                <h2 className="font-semibold text-lg">রং নির্বাচন করুন</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-6">
                <ColorInput label="প্যাটার্ন (ডট) এর রং" color={dotsColor} onChange={setDotsColor} />
                <ColorInput label="কর্নারের (শেপ) রং" color={cornersColor} onChange={setCornersColor} />
                <ColorInput label="ব্যাকগ্রাউন্ডের রং" color={backgroundColor} onChange={setBackgroundColor} />
                
                {hasBorder && (
                  <ColorInput label="বর্ডারের রং" color={borderColor} onChange={setBorderColor} />
                )}
              </div>
            </section>

            {/* Logo Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-5 text-neutral-800">
                <ImageIcon size={20} className="text-blue-600" />
                <h2 className="font-semibold text-lg">লোগো যুক্ত করুন</h2>
              </div>

              {!logo ? (
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <Upload size={20} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-neutral-700 mb-1">আপনার ব্র্যান্ডের লোগো আপলোড করুন</p>
                  <p className="text-xs text-neutral-500 mb-4">PNG, JPG অথবা SVG</p>
                  <label className="cursor-pointer bg-white border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-blue-600 transition-colors shadow-sm">
                    লোগো ব্রাউজ করুন
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 border border-neutral-200 flex items-center justify-center overflow-hidden shadow-sm">
                      <img src={logo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">লোগো আপলোড করা হয়েছে</p>
                      <button onClick={removeLogo} className="text-xs text-red-600 hover:text-red-700 font-medium mt-1 flex items-center gap-1">
                        <Trash2 size={12} /> মুছে ফেলুন
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Preview & Action Section */}
          <div className="w-full lg:w-[55%] lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200 p-5 sm:p-8 flex flex-col items-center text-center">
              
              <div className="mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  লাইভ প্রিভিউ
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">আপনার কিউআর কোড প্রস্তুত!</h2>
                <p className="text-sm sm:text-base text-neutral-500 mt-2 max-w-md mx-auto">এই কিউআর কোডটি স্ক্যান করলেই আপনার দেওয়া লিংকে চলে যাবে। ডাউনলোড করে যেকোনো জায়গায় ব্যবহার করুন।</p>
              </div>

              {/* QR Code Container */}
              <div className="bg-neutral-50 w-full p-4 sm:p-6 rounded-3xl border border-neutral-100 shadow-inner mb-6 sm:mb-8 flex justify-center">
                <div 
                  className="overflow-hidden shadow-sm flex items-center justify-center transition-all mx-auto"
                  style={{ 
                    width: '100%',
                    maxWidth: '372px',
                    aspectRatio: '1 / 1',
                    backgroundColor: backgroundColor,
                    border: hasBorder ? `${borderWidth}px solid ${borderColor}` : `1px solid #e5e5e5`,
                    borderRadius: hasBorder ? `${borderRadius}px` : '16px',
                    padding: hasBorder ? '5%' : '5%'
                  }}
                >
                  <div ref={qrRef} className="w-full h-full flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-md">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button 
                    onClick={() => downloadQR('png')}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all active:scale-[0.98] shadow-md shadow-blue-600/10"
                  >
                    <Download size={18} />
                    ডাউনলোড PNG
                  </button>
                  <button 
                    onClick={() => downloadQR('svg')}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-neutral-700 border border-neutral-300 px-6 py-3.5 rounded-xl font-semibold hover:bg-neutral-50 hover:border-neutral-400 focus:ring-4 focus:ring-neutral-500/10 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <Download size={18} />
                    ডাউনলোড SVG
                  </button>
                </div>
                <button 
                  onClick={printQR}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-800 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-neutral-900 focus:ring-4 focus:ring-neutral-500/30 transition-all active:scale-[0.98] shadow-md shadow-neutral-900/10"
                >
                  <Printer size={18} />
                  প্রিন্ট করুন (Print QR)
                </button>
              </div>
              
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

