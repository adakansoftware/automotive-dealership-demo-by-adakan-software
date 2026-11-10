import nodemailer from 'nodemailer'

/**
 * İletişim formu e-posta bildirimi. SMTP_HOST ve INQUIRY_NOTIFY_EMAIL
 * tanımlıysa gönderir; değilse sessizce atlar (demo modu / sağlayıcı
 * beklenirken davranış değişmez). Gönderim hatası formu engellemez —
 * sorgu zaten inquiries tablosunda kalıcıdır.
 */

export interface InquiryEmailValues {
  name: string
  phone: string
  email: string
  message: string
}

const transporterOptions = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT ?? 587) === 465,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
})

export const isInquiryEmailConfigured = (): boolean =>
  Boolean(process.env.SMTP_HOST && process.env.INQUIRY_NOTIFY_EMAIL)

export function buildInquiryEmail(
  values: InquiryEmailValues,
  siteName: string,
): { subject: string; text: string } {
  return {
    subject: `Yeni iletişim formu mesajı — ${values.name}`,
    text: [
      `${siteName} iletişim formundan yeni mesaj:`,
      '',
      `Ad Soyad: ${values.name}`,
      `Telefon: ${values.phone}`,
      values.email ? `E-posta: ${values.email}` : null,
      '',
      'Mesaj:',
      values.message,
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
  }
}

export async function sendInquiryEmail(
  values: InquiryEmailValues,
  siteName: string,
): Promise<boolean> {
  if (!isInquiryEmailConfigured()) return false

  const { subject, text } = buildInquiryEmail(values, siteName)
  try {
    const transporter = nodemailer.createTransport(transporterOptions())
    await transporter.sendMail({
      from: process.env.SMTP_USER ?? process.env.INQUIRY_NOTIFY_EMAIL,
      to: process.env.INQUIRY_NOTIFY_EMAIL,
      replyTo: values.email || undefined,
      subject,
      text,
    })
    return true
  } catch (error) {
    console.error('inquiry email failed:', error)
    return false
  }
}
