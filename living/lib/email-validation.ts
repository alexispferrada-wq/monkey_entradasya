/**
 * Disposable / temporary email domain blocklist.
 * These services provide short-lived addresses used to bypass email verification.
 */
const DISPOSABLE_DOMAINS = new Set([
  // Mailinator family
  'mailinator.com', 'mailinator2.com', 'notmailinator.com',
  // Guerrilla Mail
  'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'spam4.me',
  // Trash Mail
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashmail.at',
  'trashmail.io', 'trashmail.org', 'trashmail.fr',
  // 10 Minute Mail / Temp Mail
  '10minutemail.com', '10minutemail.net', '10minutemail.org',
  'tempmail.com', 'temp-mail.org', 'temp-mail.ru', 'temp-mail.io',
  'tempr.email', 'tempinbox.com', 'throwaway.email',
  // Yopmail
  'yopmail.com', 'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf',
  'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr',
  'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf',
  // Maildrop / Mailsac
  'maildrop.cc', 'mailsac.com', 'mailnull.com',
  // Other popular disposables
  'fakeinbox.com', 'dispostable.com', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org',
  'crap.pizza', 'binkmail.com', 'mintemail.com',
  'getnada.com', 'getairmail.com', 'getonemail.com',
  'mailtemp.info', 'fakemailgenerator.com', 'fakemail.net',
  'emailondeck.com', 'incognitomail.com', 'incognitomail.net',
  'incognitomail.org', 'filzmail.com', 'harakirimail.com',
  'mailexpire.com', 'mailfall.com', 'mailmetrash.com',
  'mailsucker.net', 'mailzilla.com', 'mailzilla.org',
  'rcpt.at', 'deadaddress.com', 'objectmail.com',
  'mt2014.com', 'mt2009.com', 'owlpic.com',
  'fleckens.hu', 'klzlk.com', 'lol.ovpn.to', 'mbx.cc',
])

/**
 * Returns true if the email's domain belongs to a known disposable
 * email provider. Domain matching is exact (not suffix-based).
 */
export function isDisposableEmail(email: string): boolean {
  const parts = email.split('@')
  if (parts.length !== 2) return false
  const domain = parts[1].toLowerCase()
  return DISPOSABLE_DOMAINS.has(domain)
}
