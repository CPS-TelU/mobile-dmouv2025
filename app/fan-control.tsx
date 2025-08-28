import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchFanStatus, updateFanState } from "../api/api";
import FanIcon from "../assets/images/fandua.svg";
import CustomSwitch from "../components/CustomSwitch";
import { Colors } from "../constants/Colors";
import { useFan } from "../context/FanContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PersonStatus = "detected" | "not-detected";
type FanStatus = "on" | "off";

const StatusItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <View className="flex-1 items-center">
    <Ionicons name={icon} size={24} color={Colors.primary} />
    <View className="items-center mt-2">
      <Text className="font-poppins-regular text-sm text-textLight">
        {label}
      </Text>
      <Text
        className="font-poppins-semibold text-[15px] font-bold mt-1"
        style={{ color }}
      >
        {value}
      </Text>
    </View>
  </View>
);

export default function FanControlScreen() {
  const insets = useSafeAreaInsets();
  const { isAutoMode, setIsAutoMode } = useFan();
  const [fanStatus, setFanStatus] = useState<FanStatus>("off");
  const [personStatus, setPersonStatus] =
    useState<PersonStatus>("not-detected");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialStatus = async () => {
      try {
        const data = await fetchFanStatus();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFanStatus(data.fanStatus);
        setPersonStatus(data.personStatus);
        setIsAutoMode(data.isAutoMode);
      } catch (error) {
        console.error("Fetch initial fan status error:", error);
        Alert.alert("Error", "Failed to fetch initial status from the server.");
      } finally {
        setIsLoading(false);
      }
    };

    getInitialStatus();

    const intervalId = setInterval(async () => {
      try {
        const data = await fetchFanStatus();
        if (data.personStatus !== personStatus) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
          setPersonStatus(data.personStatus);
        }
      } catch (error) {
        console.error("Fetch fan status update error:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [setIsAutoMode, personStatus]);

  useEffect(() => {
    if (isLoading) return;

    const performAutoUpdate = (newStatus: FanStatus) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setFanStatus(newStatus);
      updateFanState({ fanStatus: newStatus }).catch((err) =>
        console.error("Auto mode update failed:", err)
      );
    };

    if (isAutoMode) {
      if (personStatus === "detected" && fanStatus === "off") {
        performAutoUpdate("on");
      } else if (personStatus === "not-detected" && fanStatus === "on") {
        performAutoUpdate("off");
      }
    }
  }, [personStatus, isAutoMode, isLoading, fanStatus]);

  const handleAutoModeToggle = async () => {
    const newMode = !isAutoMode;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsAutoMode(newMode);
    try {
      await updateFanState({ isAutoMode: newMode });
    } catch (error) {
      console.error("Update auto mode failed:", error);
      Alert.alert("Error", "Failed to update automatic mode.");
      setIsAutoMode(!newMode);
    }
  };

  const handleFanToggle = async () => {
    if (isAutoMode) return;
    const newStatus = fanStatus === "on" ? "off" : "on";
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFanStatus(newStatus);
    try {
      await updateFanState({ fanStatus: newStatus });
    } catch (error) {
      console.error("Update fan status failed:", error);
      Alert.alert("Error", "Failed to update fan status.");
      setFanStatus(fanStatus);
    }
  };

  const isFanOn = fanStatus === "on";

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-secondary">
        <ActivityIndicator size="large" color={Colors.white} />
        <Text className="mt-2.5 text-white text-base">Loading Status...</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-secondary"
      style={{ paddingTop: insets.top + 50 }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View className="items-center justify-start px-5">
        <Text
          className="font-poppins-semibold text-3xl font-bold text-white mt-0.5"
          style={{
            textShadowColor: "rgba(0, 0, 0, 0.2)",
            textShadowOffset: { width: 1, height: 2 },
            textShadowRadius: 3,
          }}
        >
          Smart Fan
        </Text>
        <Text className="font-poppins-regular text-[15px] text-textLight mt-0.5">
          Control your smart cooling
        </Text>
        <View className="w-52 h-52 justify-center items-center mt-2.5 mb-12 p-4">
          <FanIcon
            width="120%"
            height="120%"
            fill={isFanOn ? Colors.lampOnColor : Colors.lampOffColor}
          />
        </View>
      </View>

      <View className="bg-white flex-1 rounded-t-[30px] items-center shadow-lg shadow-black/10 mt-50">
        <View className="w-full items-center px-6 pt-5 pb-16">
          <View className="w-[50px] h-[5px] bg-border rounded-full mb-6" />

          <TouchableOpacity
            className={`w-24 h-24 rounded-full justify-center items-center bg-secondary shadow-lg shadow-primary/30 mb-2.5 border-2 border-white ${
              isAutoMode ? "bg-border" : ""
            }`}
            onPress={handleFanToggle}
            disabled={isAutoMode}
            activeOpacity={0.7}
          >
            <Ionicons
              name="power"
              size={36}
              color={isFanOn && !isAutoMode ? Colors.primary : Colors.white}
            />
          </TouchableOpacity>
          <Text
            className={`font-poppins-semibold text-base font-semibold mb-6 ${
              isFanOn ? "text-greenDot" : "text-textLight"
            }`}
          >
            Fan is {isFanOn ? "On" : "Off"}
          </Text>

          <View className="w-full h-px bg-border mb-5" />

          <View className="flex-row w-full justify-around bg-[#F4F3F3] rounded-2xl p-4 mb-5">
            <StatusItem
              icon="body-outline"
              label="Person Status"
              value={personStatus === "detected" ? "Detected" : "Not Detected"}
              color={
                personStatus === "detected" ? Colors.redDot : Colors.greenDot
              }
            />
            <View className="w-px bg-border mx-2.5" />
            <StatusItem
              icon="sync-circle-outline"
              label="Fan Status"
              value={isFanOn ? "On" : "Off"}
              color={isFanOn ? Colors.greenDot : Colors.redDot}
            />
          </View>

          <View className="flex-row justify-between items-center bg-[#F4F3F3] rounded-2xl p-5 w-full">
            <View>
              <Text className="font-poppins-semibold text-[15px] font-semibold text-text">
                Automatic Mode
              </Text>
              <Text className="font-poppins-regular text-xs text-textLight mt-0.5">
                Control fan based on detection
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
