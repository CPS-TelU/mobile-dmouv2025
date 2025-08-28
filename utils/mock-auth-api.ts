import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, ASYNC_STORAGE_KEYS } from "./user-data";
import 'react-native-get-random-values'; // Needed for uuid v4 on React Native
import { v4 as uuidv4 } from 'uuid'; // Import UUID for unique IDs

// Data super user default untuk simulasi
const SUPER_ADMIN_EMAIL = "superadmin@example.com";
// SUPER_ADMIN_PASSWORD telah dihapus karena tidak digunakan langsung dalam logika.
// Password untuk superadmin sekarang disimpan di array 'initialUsers' di bawah.

/**
 * Inisialisasi daftar pengguna mock di AsyncStorage jika belum ada.
 * Menambahkan super admin default.
 */
const initializeMockUsers = async () => {
  try {
    const storedUsers = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.MOCK_USERS);
    if (!storedUsers) {
      const initialUsers: (User & { password?: string })[] = [ // Tambahkan `password` untuk simulasi
        {
          id: uuidv4(),
          name: "Super Admin",
          email: SUPER_ADMIN_EMAIL,
          profilePictureUri: require("../assets/images/pp.svg"),
          role: "super_user",
          password: "password123", // Password untuk super admin
        },
        {
          id: uuidv4(),
          name: "Regular User",
          email: "user@example.com",
          profilePictureUri: require("../assets/images/pp.svg"),
          role: "regular_user",
          password: "password123", // Password untuk user biasa
        }
      ];
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.MOCK_USERS, JSON.stringify(initialUsers));
      console.log("Mock users initialized with super admin and regular user.");
    }
  } catch (error) {
    console.error("Failed to initialize mock users:", error);
  }
};

// Panggil inisialisasi saat aplikasi dimulai
initializeMockUsers();

/**
 * Simulasi pendaftaran pengguna baru.
 *
 * @param name Nama pengguna baru.
 * @param email Email pengguna baru.
 * @param password Password pengguna baru.
 * @param role Role pengguna baru.
 * @returns Promise yang resolve dengan objek User yang baru didaftarkan atau reject dengan Error.
 */
export const mockRegisterUser = async (
  name: string,
  email: string,
  passwordStrong: string,
  role: 'super_user' | 'regular_user' = 'regular_user' // Default role
): Promise<User> => {
  try {
    const storedUsersJson = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.MOCK_USERS);
    const users: (User & { password?: string })[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    if (users.some(user => user.email === email)) {
      throw new Error("Email already registered.");
    }

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      profilePictureUri: require("../assets/images/pp.svg"), // Default PP
      role,
    };

    // Simpan juga password di sini untuk tujuan simulasi login.
    // Di backend nyata, password akan di-hash sebelum disimpan.
    const userWithPassword = { ...newUser, password: passwordStrong };
    users.push(userWithPassword);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.MOCK_USERS, JSON.stringify(users));

    return newUser; // Kembalikan tanpa password
  } catch (error) {
    console.error("Mock registration failed:", error);
    throw error;
  }
};

/**
 * Simulasi proses login pengguna.
 * Memverifikasi email dan password terhadap daftar pengguna mock.
 *
 * @param email Email pengguna.
 * @param password Password pengguna.
 * @returns Promise yang resolve dengan objek { token: string, user: User } atau reject dengan Error.
 */
export const mockLoginUser = async (
  email: string,
  passwordInput: string
): Promise<{ token: string; user: User }> => {
  try {
    const storedUsersJson = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.MOCK_USERS);
    const users: (User & { password?: string })[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // Membandingkan password mentah yang tersimpan dengan input.
    // Di backend nyata, Anda akan membandingkan hash password.
    if (user.password !== passwordInput) {
      throw new Error("Invalid email or password.");
    }

    // Hasilkan token dummy dan kembalikan data pengguna (tanpa password)
    const token = `mock-token-${user.id}-${Date.now()}`;
    const { password, ...userDataWithoutPassword } = user; // Hapus password dari objek yang dikembalikan

    return { token, user: userDataWithoutPassword };
  } catch (error) {
    console.error("Mock login failed:", error);
    throw error;
  }
};
