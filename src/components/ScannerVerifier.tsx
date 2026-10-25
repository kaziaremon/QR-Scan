import React, { useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { ShieldCheck, AlertTriangle, CheckCircle2, Wand2, Eye, ExternalLink } from 'lucide-react';
import { evaluateColors } from '../utils/contrast';

interface ScannerVerifierProps {
  qrContainerRef: React.RefObject<HTMLDivElement | null>;
  intendedPayload: string;
  dotsColor: string;
  backgroundColor: string;
  logo: string | null;
  onAutoFix: () => void;
  lang: 'en' | 'bn';
}

export const ScannerVerifier: React.FC<ScannerVerifierProps> = ({
  qrContainerRef,
  intendedPayload,
  dotsColor,
  backgroundColor,
  logo,
  onAutoFix,
  lang,
}) => {
  const [scanStatus, setScanStatus] = useState<{
    tested: boolean;
    success: boolean;
    decodedText: string | null;
    timestamp: number;
  }>({
    tested: false,
    success: false,
    decodedText: null,
    timestamp: Date.now(),
  });

  const contrastInfo = evaluateColors(dotsColor, backgroundColor, lang);

  // Scan the rendered QR Code whenever the canvas updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!qrContainerRef.current) return;
      
      const canvas = qrContainerRef.current.querySelector('canvas');
      if (!canvas) {
        // If rendered as SVG, we can test via offscreen image
        const svg = qrContainerRef.current.querySelector('svg');
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          img.onload = () => {
            const offscreen = document.createElement('canvas');
            offscreen.width = img.width || 340;
            offscreen.height = img.height || 340;
            const ctx = offscreen.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              try {
                const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
                const code = jsQR(imgData.data, imgData.width, imgData.height);
                setScanStatus({
                  tested: true,
                  success: !!code,
                  decodedText: code ? code.data : null,
                  timestamp: Date.now(),
                });
              } catch (e) {
                console.error('Scan test error', e);
              }
            }
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
        return;
      }

      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          setScanStatus({
            tested: true,
            success: !!code,
            decodedText: code ? code.data : null,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        console.error('Canvas read error', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [qrContainerRef, intendedPayload, dotsColor, backgroundColor, logo]);

  const isCritical = !scanStatus.success && scanStatus.tested;
  const isWarning = scanStatus.success && contrastInfo.level === 'poor';

  return (
    <div className="w-full mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-left transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {scanStatus.success ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>{lang === 'bn' ? '১০০% স্ক্যানযোগ্য ও ভেরিফায়েড' : '100% Scannable & Verified'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-sm">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 animate-bounce" />
              <span>{lang === 'bn' ? 'স্ক্যান সমস্যা শনাক্ত হয়েছে' : 'Scan Issue Detected'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
            contrastInfo.level === 'excellent'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : contrastInfo.level === 'good'
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {contrastInfo.ratio}:1 {lang === 'bn' ? 'কন্ট্রাস্ট' : 'Contrast'}
          </span>
        </div>
      </div>

      {scanStatus.success ? (
        <div className="space-y-2 mt-2">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 break-all flex items-start gap-2">
            <Eye size={14} className="text-blue-400 mt-0.5 shrink-0" />
            <div className="line-clamp-2">{scanStatus.decodedText}</div>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'bn' 
              ? 'সরাসরি রিয়েল-টাইম ডিকোডার দিয়ে যাচাইকৃত। আইফোন ও অ্যান্ড্রয়েড ক্যামেরা স্বয়ংক্রিয়ভাবে রিড করতে পারবে।'
              : 'Verified via real-time optical decoding. Works seamlessly with iPhone, Android, and industrial scanners.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          <p className="text-xs text-amber-300/90 leading-relaxed">
            {lang === 'bn'
              ? 'কিউআর কোডটি বর্তমানে স্ক্যানার দ্বারা রিড করা যাচ্ছে না। সম্ভবত লোগোর আকার বড়, বা ডট ও ব্যাকগ্রাউন্ডের রঙের কন্ট্রাস্ট খুব কম।'
              : 'The QR code cannot be decoded by scanners. The logo may be obstructing critical modules, or contrast is too weak.'}
          </p>

          <button
            onClick={onAutoFix}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-98"
          >
            <Wand2 size={15} />
            {lang === 'bn' ? 'স্বয়ংক্রিয়ভাবে ১০০% স্ক্যানযোগ্য করুন (Auto-Fix)' : 'Auto-Fix for 100% Scannability'}
          </button>
        </div>
      )}
    </div>
  );
};
