import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY

export const encryptToken = (token: string): string => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString()
}

export const decryptToken = (encryptedToken: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export const setToken = (token: string): void => {
  localStorage.setItem('token', encryptToken(token))
}

export const getToken = (): string => {
  const encrypted = localStorage.getItem('token')
  if (!encrypted) return ''
  try {
    return decryptToken(encrypted)
  } catch {
    return ''
  }
}

export const removeToken = (): void => {
  localStorage.removeItem('token')
}
