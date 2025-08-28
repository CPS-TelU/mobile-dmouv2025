/**
 * utils/network-validation.ts
 *
 * File ini berisi fungsi-fungsi utilitas untuk memvalidasi
 * alamat IP, SSID Wi-Fi, dan kata sandi Wi-Fi.
 */

interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Memvalidasi format alamat IP (IPv4 dasar).
 * @param ip Alamat IP yang akan divalidasi.
 * @returns ValidationResult Objek yang menunjukkan validitas dan pesan.
 */
export const validateIpAddress = (ip: string): ValidationResult => {
  if (!ip.trim()) {
    return { isValid: false, message: "Alamat IP tidak boleh kosong." };
  }
  // Regex dasar untuk validasi IPv4 (mis. 192.168.1.1)
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip.trim())) {
    return { isValid: false, message: "Format alamat IP tidak valid." };
  }
  return { isValid: true, message: "" };
};

export const validateSsid = (ssid: string): ValidationResult => {
  if (!ssid.trim()) {
    return { isValid: false, message: "SSID tidak boleh kosong." };
  }

  if (ssid.trim().length < 1 || ssid.trim().length > 32) {
    return { isValid: false, message: "SSID harus antara 1 sampai 32 karakter." };
  }
  return { isValid: true, message: "" };
};

export const validateWifiPassword = (password: string): ValidationResult => {
  if (!password.trim()) {
    return { isValid: false, message: "Kata sandi Wi-Fi tidak boleh kosong." };
  }
  if (password.trim().length < 8) {
    return { isValid: false, message: "Kata sandi Wi-Fi minimal 8 karakter." };
  }
  return { isValid: true, message: "" };
};
