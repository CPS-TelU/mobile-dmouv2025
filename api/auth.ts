import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipe data untuk peran pengguna
export type UserRole = "superuser" | "user";

// Tipe data untuk pengguna
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
};

// --- DATABASE PENGGUNA PALSU ---
const DUMMY_USERS: User[] = [
  {
    id: "1",
    name: "Superuser (Admin)",
    email: "superuser@gmail.com",
    role: "superuser",
    token: "dummy-token-superuser",
  },
  {
    id: "2",
    name: "user (User)",
    email: "user@gmail.com",
    role: "user",
    token: "dummy-token-user",
  },
];

/**
 * Fungsi untuk mensimulasikan proses login.
 * @param email Email pengguna
 * @param password Password pengguna (diabaikan dalam simulasi ini)
 * @returns Promise yang mengembalikan data pengguna jika berhasil, atau null jika gagal.
 */
export const login = (
  email: string,
  password?: string
): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = DUMMY_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (user) {
        resolve(user); // Login berhasil
      } else {
        resolve(null); // Login gagal
      }
    }, 1500); // Simulasi jeda jaringan
  });
};

/**
 * Fungsi untuk menyimpan data sesi pengguna (token dan peran)
 */
export const storeUserSession = async (token: string, role: UserRole) => {
  try {
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("userRole", role);
  } catch (e) {
    console.error("Gagal menyimpan sesi pengguna", e);
  }
};
