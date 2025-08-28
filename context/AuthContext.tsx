import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ASYNC_STORAGE_KEYS } from '../utils/user-data';

interface AuthContextType {
  userToken: string | null;
  userData: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (newUserData: Partial<User>) => Promise<void>;
}

// Buat Context dengan nilai default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props untuk AuthProvider
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component membungkus seluruh aplikasi dan menyediakan
 * state autentikasi global serta fungsi-fungsi terkait.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Loading saat memeriksa status autentikasi awal

  /**
   * Muat token dan data pengguna dari AsyncStorage saat aplikasi dimulai.
   */
  const loadAuthData = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.USER_TOKEN);
      const storedUserDataJson = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUserDataJson) {
        const storedUserData: User = JSON.parse(storedUserDataJson);
        setUserToken(storedToken);
        setUserData(storedUserData);
      } else {
        // Jika tidak ada data pengguna di AsyncStorage, set ke null
        setUserToken(null);
        setUserData(null); // userData akan null jika belum login
      }
    } catch (error) {
      console.error("Gagal memuat data autentikasi dari AsyncStorage:", error);
      setUserToken(null);
      setUserData(null);
    } finally {
      setIsAuthLoading(false); // Selesai memuat
    }
  }, []);

  useEffect(() => {
    loadAuthData();
  }, [loadAuthData]);

  /**
   * Fungsi untuk login pengguna.
   * Menyimpan token dan data pengguna ke state dan AsyncStorage.
   */
  const login = useCallback(async (token: string, user: User) => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      setUserToken(token);
      setUserData(user);
    } catch (error) {
      console.error("Gagal menyimpan data login ke AsyncStorage:", error);
      throw new Error("Gagal menyimpan sesi. Silakan coba lagi.");
    }
  }, []);

  /**
   * Fungsi untuk logout pengguna.
   * Menghapus token dan data pengguna dari state dan AsyncStorage.
   */
  const logout = useCallback(async () => {
    try {
      // Perbaikan: ASYC_STORAGE_KEYS menjadi ASYNC_STORAGE_KEYS
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.USER_DATA);
      setUserToken(null);
      setUserData(null);
      // Set flag untuk AppEntry agar tahu pengguna baru saja logout
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.JUST_LOGGED_OUT, 'true');
    } catch (error) {
      console.error("Gagal menghapus data logout dari AsyncStorage:", error);
      throw new Error("Gagal menghapus sesi. Silakan coba lagi.");
    }
  }, []);

  /**
   * Fungsi untuk memperbarui sebagian data pengguna.
   * Berguna untuk perubahan nama, gambar profil, dll.
   */
  const updateUserData = useCallback(async (newUserData: Partial<User>) => {
    setUserData(prevData => {
      if (!prevData) return null; // Tidak ada data untuk diperbarui
      const updated = { ...prevData, ...newUserData };
      AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER_DATA, JSON.stringify(updated))
        .catch(error => console.error("Gagal memperbarui userData di AsyncStorage:", error));
      return updated;
    });
  }, []);

  const value = {
    userToken,
    userData,
    isAuthenticated: !!userToken && !!userData,
    isAuthLoading,
    login,
    logout,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook kustom untuk mengakses state dan fungsi autentikasi dari AuthContext.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
