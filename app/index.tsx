// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import SplashScreenComponent from "../components/SplashScreen";
import { useCachedResources } from "../hooks/useCachedResources";

export default function AppEntry() {
  const isLoadingComplete = useCachedResources();
  const router = useRouter();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [splashScreenTimerCompleted, setSplashScreenTimerCompleted] =
    useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashScreenTimerCompleted(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");

        if (userToken) {
          // Pengguna masih login, arahkan ke home
          setInitialRoute("/(tabs)/home");
        } else {
          // --- LOGIKA BARU DI SINI ---
          // Pengguna tidak login, cek apakah mereka baru saja logout
          const justLoggedOut = await AsyncStorage.getItem("justLoggedOut");

          if (justLoggedOut === "true") {
            // Skenario 1: Baru saja menekan tombol logout
            // Hapus penanda agar tidak aktif lagi
            await AsyncStorage.removeItem("justLoggedOut");
            // Arahkan ke halaman IP Device
            setInitialRoute("/(auth)/ip-device");
          } else {
            // Skenario 2: Membuka aplikasi dari awal (saat sudah logout)
            // Selalu arahkan ke Onboarding sesuai permintaan
            setInitialRoute("/(auth)/onboarding");
          }
        }
      } catch (e) {
        console.error("Gagal memeriksa status autentikasi.", e);
        setInitialRoute("/(auth)/onboarding");
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoadingComplete && initialRoute && splashScreenTimerCompleted) {
      router.replace(initialRoute as Href);
    }
  }, [isLoadingComplete, initialRoute, splashScreenTimerCompleted, router]);

  if (!isLoadingComplete || !initialRoute || !splashScreenTimerCompleted) {
    return <SplashScreenComponent />;
  }
  return null;
}
