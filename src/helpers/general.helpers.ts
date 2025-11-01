export const maskEmail = (email: string) => {
  if (!email) return ''
  const [username, domain] = email.split('@')
  if (!username || !domain) return email
  return `${username.slice(0, 2)}*****${username.slice(-2)}@${domain}`
}
