// Lokasi file: api/api.ts

// --- Tipe Data untuk Status ---
type PersonStatus = "detected" | "not-detected";
type LampStatus = "on" | "off";
type FanStatus = "on" | "off";

// --- Status Deteksi Orang Bersama (Shared State) ---
let sharedPersonStatus: PersonStatus = "not-detected";

// --- Fungsi untuk mensimulasikan deteksi orang secara terpusat ---
const simulatePersonDetection = () => {
  // Hanya ada satu sumber kebenaran untuk deteksi orang
  sharedPersonStatus = Math.random() > 0.6 ? "detected" : "not-detected";
};

// --- Mock Database untuk Lampu ---
let mockLampDatabase: {
  lampStatus: LampStatus;
  personStatus: PersonStatus;
  isAutoMode: boolean;
} = {
  lampStatus: "off",
  personStatus: sharedPersonStatus,
  isAutoMode: false,
};

// --- Mock Database untuk Kipas Angin ---
let mockFanDatabase: {
  fanStatus: FanStatus;
  personStatus: PersonStatus;
  isAutoMode: boolean;
} = {
  fanStatus: "off",
  personStatus: sharedPersonStatus,
  isAutoMode: false,
};

// --- Fungsi untuk Lampu ---
export const fetchDeviceStatus = (): Promise<typeof mockLampDatabase> => {
  console.log("[API Lamp] Fetching status...");
  return new Promise((resolve) => {
    setTimeout(() => {
      // Jalankan simulasi terpusat
      simulatePersonDetection();
      // Update database lampu dengan status terbaru
      mockLampDatabase.personStatus = sharedPersonStatus;
      console.log("[API Lamp] Status received:", mockLampDatabase);
      resolve(mockLampDatabase);
    }, 500);
  });
};

export const updateLampState = (newState: {
  lampStatus?: LampStatus;
  isAutoMode?: boolean;
}): Promise<{ success: boolean }> => {
  console.log("[API Lamp] Sending update:", newState);
  return new Promise((resolve) => {
    setTimeout(() => {
      mockLampDatabase = { ...mockLampDatabase, ...newState };
      console.log("[API Lamp] Update success. New state:", mockLampDatabase);
      resolve({ success: true });
    }, 300);
  });
};

// --- Fungsi untuk Kipas Angin ---
export const fetchFanStatus = (): Promise<typeof mockFanDatabase> => {
  console.log("[API Fan] Fetching status...");
  return new Promise((resolve) => {
    setTimeout(() => {
      // Jalankan simulasi terpusat
      simulatePersonDetection();
      // Update database kipas dengan status terbaru
      mockFanDatabase.personStatus = sharedPersonStatus;
      console.log("[API Fan] Status received:", mockFanDatabase);
      resolve(mockFanDatabase);
    }, 500);
  });
};

export const updateFanState = (newState: {
  fanStatus?: FanStatus;
  isAutoMode?: boolean;
}): Promise<{ success: boolean }> => {
  console.log("[API Fan] Sending update:", newState);
  return new Promise((resolve) => {
    setTimeout(() => {
      mockFanDatabase = { ...mockFanDatabase, ...newState };
      console.log("[API Fan] Update success. New state:", mockFanDatabase);
      resolve({ success: true });
    }, 300);
  });
};
