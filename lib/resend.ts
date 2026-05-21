import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
export const ADMIN_EMAIL = 'boudewijn@plgn.nl'
export const FROM_EMAIL = 'Recrootools <noreply@plgn.nl>'
