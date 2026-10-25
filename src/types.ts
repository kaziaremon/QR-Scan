import { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel, TypeNumber } from 'qr-code-styling';

export type QRContentType = 'url' | 'wifi' | 'vcard' | 'whatsapp' | 'email' | 'phone' | 'sms' | 'text';

export type GradientType = 'none' | 'linear' | 'radial';

export interface ColorStop {
  offset: number;
  color: string;
}

export interface WiFiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  mobile: string;
  email: string;
  organization: string;
  title: string;
  url: string;
  street: string;
  city: string;
  country: string;
}

export interface WhatsAppData {
  phone: string;
  message: string;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface SMSData {
  phone: string;
  message: string;
}

export interface QRPreset {
  id: string;
  name: string;
  nameBn: string;
  dotsColor: string;
  cornersColor: string;
  backgroundColor: string;
  dotsType: DotType;
  cornersSquareType: CornerSquareType;
  cornersDotType: CornerDotType;
  gradientType: GradientType;
  gradientColor2?: string;
}

export interface ScannabilityReport {
  isScannable: boolean;
  decodedData: string | null;
  contrastRatio: number;
  contrastLevel: 'excellent' | 'good' | 'poor' | 'critical';
  issues: string[];
  recommendations: string[];
}
