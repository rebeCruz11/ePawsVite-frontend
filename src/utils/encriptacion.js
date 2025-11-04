import CryptoJS from 'crypto-js';

const SECRET_KEY = 'ePaws_2025_SecretKey_ForEncryption';

// Encriptar contraseña
export const encriptarContrasena = (contrasena) => {
  return CryptoJS.AES.encrypt(contrasena, SECRET_KEY).toString();
};

// Desencriptar contraseña
export const desencriptarContrasena = (contrasenaEncriptada) => {
  try {
    const bytes = CryptoJS.AES.decrypt(contrasenaEncriptada, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
};

// Hash de contraseña (para comparación)
export const hashContrasena = (contrasena) => {
  return CryptoJS.SHA256(contrasena).toString();
};

// Generar token aleatorio
export const generarToken = () => {
  return CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
};

// Encriptar datos generales
export const encriptar = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Desencriptar datos generales
export const desencriptar = (dataEncriptada) => {
  try {
    const bytes = CryptoJS.AES.decrypt(dataEncriptada, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    return null;
  }
};
