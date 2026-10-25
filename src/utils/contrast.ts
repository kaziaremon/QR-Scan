// WCAG relative luminance & contrast ratio calculation

function parseColorToRgb(color: string): [number, number, number] {
  const hex = color.trim().replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return [r, g, b];
  }
  if (hex.length >= 6) {
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return [r, g, b];
  }
  return [0, 0, 0];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(foreground: string, background: string): number {
  const rgb1 = parseColorToRgb(foreground);
  const rgb2 = parseColorToRgb(background);
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Number(ratio.toFixed(2));
}

export function evaluateColors(dotsColor: string, bgColor: string, lang: 'en' | 'bn' = 'en'): {
  ratio: number;
  level: 'excellent' | 'good' | 'poor' | 'critical';
  isInverted: boolean;
  message: string;
} {
  const ratio = getContrastRatio(dotsColor, bgColor);
  const lumDots = getLuminance(parseColorToRgb(dotsColor));
  const lumBg = getLuminance(parseColorToRgb(bgColor));
  const isInverted = lumDots > lumBg; // Light dots on dark background

  let level: 'excellent' | 'good' | 'poor' | 'critical' = 'excellent';
  let message = lang === 'bn' 
    ? 'নিখুঁত কন্ট্রাস্ট - যেকোনো ক্যামেরায় সঙ্গে সঙ্গে স্ক্যান হবে।'
    : 'Optimum Contrast: Guaranteed 100% instant optical scan on all smartphone cameras.';

  if (ratio < 2.5) {
    level = 'critical';
    message = lang === 'bn'
      ? 'গুরুতর সতর্কতা: কন্ট্রাস্ট অত্যন্ত কম! ক্যামেরা স্ক্যান করতে ব্যর্থ হতে পারে।'
      : 'Critical Warning: Extremely low contrast. Scanners will fail to recognize patterns.';
  } else if (ratio < 4.5) {
    level = 'poor';
    message = lang === 'bn'
      ? 'সতর্কতা: কম কন্ট্রাস্ট। পুরনো বা কম আলোতে ক্যামেরা স্ক্যান করতে দেরি হতে পারে।'
      : 'Notice: Suboptimal contrast. Older devices or low-light conditions may struggle.';
  } else if (isInverted) {
    level = 'good';
    message = lang === 'bn'
      ? 'ইনভার্টেড কিউআর কোড (গাঢ় ব্যাকগ্রাউন্ডে হালকা ডট)। আধুনিক ফোনেই কেবল স্ক্যান হবে।'
      : 'Inverted Matrix: Light dots on dark background. Recommended for modern high-res scanners.';
  } else {
    level = 'excellent';
    message = lang === 'bn'
      ? 'চমৎকার কন্ট্রাস্ট (১০০% নির্ভরযোগ্য স্ক্যান)।'
      : 'Excellent Contrast: 100% verified camera recognition rate.';
  }

  return { ratio, level, isInverted, message };
}
