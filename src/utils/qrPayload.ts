import { QRContentType, WiFiData, VCardData, WhatsAppData, EmailData, SMSData } from '../types';

export function generatePayload(
  type: QRContentType,
  values: {
    url: string;
    wifi: WiFiData;
    vcard: VCardData;
    whatsapp: WhatsAppData;
    email: EmailData;
    sms: SMSData;
    phone: string;
    text: string;
  }
): string {
  switch (type) {
    case 'url': {
      const trimmed = values.url.trim();
      if (!trimmed) return 'https://example.com';
      if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    }

    case 'wifi': {
      const { ssid, password, encryption, hidden } = values.wifi;
      const cleanSsid = (ssid || 'MyHomeWiFi').replace(/([\\;,:"])/g, '\\$1');
      const cleanPass = (password || '').replace(/([\\;,:"])/g, '\\$1');
      return `WIFI:S:${cleanSsid};T:${encryption};P:${cleanPass};${hidden ? 'H:true;' : ''};`;
    }

    case 'vcard': {
      const { firstName, lastName, phone, mobile, email, organization, title, url, street, city, country } = values.vcard;
      const formattedName = [firstName, lastName].filter(Boolean).join(' ') || 'John Doe';
      
      const lines: string[] = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName || ''};${firstName || ''};;;`,
        `FN:${formattedName}`,
      ];

      if (organization) lines.push(`ORG:${organization}`);
      if (title) lines.push(`TITLE:${title}`);
      if (phone) lines.push(`TEL;TYPE=WORK,VOICE:${phone}`);
      if (mobile) lines.push(`TEL;TYPE=CELL,VOICE:${mobile}`);
      if (email) lines.push(`EMAIL;TYPE=PREF,INTERNET:${email}`);
      if (url) lines.push(`URL:${url.startsWith('http') ? url : `https://${url}`}`);
      if (street || city || country) {
        lines.push(`ADR;TYPE=WORK:;;${street || ''};${city || ''};;;${country || ''}`);
      }

      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'whatsapp': {
      const cleanPhone = values.whatsapp.phone.replace(/[^0-9+]/g, '').replace(/^\+/, '');
      const encodedMsg = encodeURIComponent(values.whatsapp.message.trim());
      if (!cleanPhone) {
        return `https://wa.me/?text=${encodedMsg}`;
      }
      return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
    }

    case 'email': {
      const to = values.email.email.trim();
      const params: string[] = [];
      if (values.email.subject.trim()) {
        params.push(`subject=${encodeURIComponent(values.email.subject.trim())}`);
      }
      if (values.email.body.trim()) {
        params.push(`body=${encodeURIComponent(values.email.body.trim())}`);
      }
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      return `mailto:${to}${query}`;
    }

    case 'phone': {
      const cleanPhone = values.phone.trim();
      return `tel:${cleanPhone || '+1234567890'}`;
    }

    case 'sms': {
      const cleanPhone = values.sms.phone.trim();
      const body = values.sms.message.trim();
      return `smsto:${cleanPhone}:${body}`;
    }

    case 'text':
    default:
      return values.text.trim() || 'Hello, world!';
  }
}
