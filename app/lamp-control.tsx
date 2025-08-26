import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // <<< 1. Impor
import { fetchDeviceStatus, updateLampState } from "../api/api";
import LampIcon from "../assets/images/leddua.svg";
import CustomSwitch from "../components/CustomSwitch";
import { Colors } from "../constants/Colors";
import { useLamp } from "../context/LampContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PersonStatus = "detected" | "not-detected";
type LightStatus = "on" | "off";

const StatusItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <View style={styles.statusItem}>
    <Ionicons name={icon} size={24} color={Colors.primary} />
    <View style={styles.statusTextContainer}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
    </View>
  </View>
);

export default function LampControlScreen() {
  const insets = useSafeAreaInsets(); // <<< 2. Gunakan hook
  const { isAutoMode, setIsAutoMode } = useLamp();
  const [lampStatus, setLampStatus] = useState<LightStatus>("off");
  const [personStatus, setPersonStatus] =
    useState<PersonStatus>("not-detected");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialStatus = async () => {
      try {
        const data = await fetchDeviceStatus();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setLampStatus(data.lampStatus);
        setPersonStatus(data.personStatus);
        setIsAutoMode(data.isAutoMode);
      } catch (error) {
        console.error("Fetch initial status error:", error);
        Alert.alert("Error", "Failed to fetch initial status from the server.");
      } finally {
        setIsLoading(false);
      }
    };

    getInitialStatus();

    const intervalId = setInterval(async () => {
      try {
        const data = await fetchDeviceStatus();
        if (data.personStatus !== personStatus) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
          setPersonStatus(data.personStatus);
        }
      } catch (error) {
        console.error("Fetch status update error:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [setIsAutoMode, personStatus]);

  useEffect(() => {
    if (isLoading) return;

    const performAutoUpdate = (newStatus: LightStatus) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLampStatus(newStatus);
      updateLampState({ lampStatus: newStatus }).catch((err) =>
        console.error("Auto mode update failed:", err)
      );
    };

    if (isAutoMode) {
      if (personStatus === "detected" && lampStatus === "off") {
        performAutoUpdate("on");
      } else if (personStatus === "not-detected" && lampStatus === "on") {
        performAutoUpdate("off");
      }
    }
  }, [personStatus, isAutoMode, isLoading, lampStatus]);

  const handleAutoModeToggle = async () => {
    const newMode = !isAutoMode;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsAutoMode(newMode);
    try {
      await updateLampState({ isAutoMode: newMode });
    } catch (error) {
      console.error("Update auto mode failed:", error);
      Alert.alert("Error", "Failed to update automatic mode.");
      setIsAutoMode(!newMode);
    }
  };

  const handleLampToggle = async () => {
    if (isAutoMode) return;
    const newStatus = lampStatus === "on" ? "off" : "on";
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLampStatus(newStatus);
    try {
      await updateLampState({ lampStatus: newStatus });
    } catch (error) {
      console.error("Update lamp status failed:", error);
      Alert.alert("Error", "Failed to update lamp status.");
      setLampStatus(lampStatus);
    }
  };

  const isLampOn = lampStatus === "on";

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.white} />
        <Text style={styles.loadingText}>Loading Status...</Text>
      </View>
    );
  }

  return (
    // <<< 3. Terapkan paddingTop dinamis di sini
    <View style={[styles.fullScreenContainer, { paddingTop: insets.top + 60 }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      {/* SafeAreaView dihapus karena padding sudah diatur */}

      {/* Top Section for Lamp */}
      <View style={styles.topContainer}>
        <Text style={styles.headerTitle}>Smart Lamp</Text>
        <Text style={styles.headerSubtitle}>Control your smart lighting</Text>
        <View style={styles.lampImageContainer}>
          <LampIcon
            width="100%"
            height="100%"
            fill={isLampOn ? Colors.lampOnColor : Colors.lampOffColor}
          />
        </View>
      </View>

      {/* Control Card */}
      <View style={styles.controlCard}>
        <View style={styles.controlCardContent}>
          <View style={styles.dragger} />

          {/* Power Button */}
          <TouchableOpacity
            style={[
              styles.powerButton,
              isAutoMode && { backgroundColor: Colors.border },
            ]}
            onPress={handleLampToggle}
            disabled={isAutoMode}
            activeOpacity={0.7}
          >
            <Ionicons
              name="power"
              size={36}
              color={isLampOn && !isAutoMode ? Colors.primary : Colors.white}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.lampStatus,
              { color: isLampOn ? Colors.greenDot : Colors.textLight },
            ]}
          >
            Lamp is {isLampOn ? "On" : "Off"}
          </Text>

          <View style={styles.divider} />

          {/* Status Container */}
          <View style={styles.statusContainer}>
            <StatusItem
              icon="body-outline"
              label="Person Status"
              value={personStatus === "detected" ? "Detected" : "Not Detected"}
              color={
                personStatus === "detected" ? Colors.redDot : Colors.greenDot
              }
            />
            <View style={styles.statusSeparator} />
            <StatusItem
              icon="bulb-outline"
              label="Lamp Status"
              value={isLampOn ? "On" : "Off"}
              color={isLampOn ? Colors.greenDot : Colors.redDot}
            />
          </View>

          {/* Automatic Mode Control */}
          <View style={styles.autoModeContainer}>
            <View>
              <Text style={styles.autoModeTitle}>Automatic Mode</Text>
              <Text style={styles.autoModeSubtitle}>
                Control lamp based on detection
              </Text>
            </View>
            <CustomSwitch
              value={isAutoMode}
              onValueChange={handleAutoModeToggle}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  // safeArea style tidak lagi digunakan
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.secondary,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.white,
    fontSize: 16,
  },
  topContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 25,
    fontWeight: "bold",
    color: Colors.white,
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    color: Colors.textLight,
    marginTop: 2,
  },
  lampImageContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
  },
  controlCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  controlCardContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 60,
  },
  dragger: {
    width: 50,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 25,
  },
  powerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  lampStatus: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 25,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    backgroundColor: "#F4F3F3",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
  },
  statusTextContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  statusLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: Colors.textLight,
  },
  statusValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
  },
  statusSeparator: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },
  autoModeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F4F3F3",
    borderRadius: 15,
    padding: 20,
    width: "100%",
  },
  autoModeTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  autoModeSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
});
