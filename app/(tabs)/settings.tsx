import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  // SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwipeListView } from "react-native-swipe-list-view";
import { Colors } from "../../constants/Colors";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Device = "lamp" | "fan";
type Schedule = { id: string; day: string; onTime: string; offTime: string };

const initialSchedules: { lamp: Schedule[]; fan: Schedule[] } = {
  lamp: [
    { id: "l1", day: "Monday", onTime: "07:30", offTime: "17:30" },
    { id: "l2", day: "Thursday", onTime: "12:30", offTime: "17:00" },
  ],
  fan: [{ id: "f1", day: "Saturday", onTime: "10:00", offTime: "18:00" }],
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// --- KOMPONEN FORM TERPISAH UNTUK VALIDASI & UI YANG LEBIH BAIK ---
// --- KOMPONEN FORM TERPISAH (VERSI SUDAH DIPERBAIKI) ---
interface ScheduleFormProps {
  selectedDevice: "lamp" | "fan";
  schedulesForDevice: Schedule[];
  onSubmit: (data: Omit<Schedule, "id">) => void;
}

// 1. Definisikan komponen dengan nama fungsi yang jelas
const ScheduleFormComponent = ({
  selectedDevice,
  schedulesForDevice,
  onSubmit,
}: ScheduleFormProps) => {
  const [isDayModalVisible, setDayModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [inputOnTime, setInputOnTime] = useState("");
  const [inputOffTime, setInputOffTime] = useState("");
  const [error, setError] = useState<{ field: string; message: string } | null>(
    null
  );

  const isSubmitDisabled = !selectedDay || !inputOnTime || !inputOffTime;

  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    )
      return NaN;
    return hours * 60 + minutes;
  };

  const handleTimeInputChange = useCallback(
    (text: string, setter: (value: string) => void) => {
      if (error?.field === "time" || error?.field === "submit") {
        setError(null);
      }
      const nums = text.replace(/[^0-9]/g, "");
      if (nums.length > 4) return;
      let formattedText = nums;
      if (nums.length > 2) {
        formattedText = `${nums.slice(0, 2)}:${nums.slice(2)}`;
      }
      setter(formattedText);
    },
    [error]
  );

  const clearForm = useCallback(() => {
    setSelectedDay(null);
    setInputOnTime("");
    setInputOffTime("");
    setError(null);
  }, []);

  const handleLocalSubmit = () => {
    setError(null);
    if (isSubmitDisabled) {
      if (!selectedDay)
        return setError({ field: "day", message: "Please select a day." });
      return setError({
        field: "time",
        message: "Please fill in both On and Off times.",
      });
    }

    const newStartTime = timeToMinutes(inputOnTime);
    const newEndTime = timeToMinutes(inputOffTime);

    if (isNaN(newStartTime) || isNaN(newEndTime)) {
      return setError({
        field: "submit",
        message: "Invalid time format. Please use HH:MM.",
      });
    }
    if (newEndTime <= newStartTime) {
      return setError({
        field: "submit",
        message: "Off time must be after on time.",
      });
    }

    const schedulesForDay = schedulesForDevice.filter(
      (s) => s.day === selectedDay
    );
    for (const schedule of schedulesForDay) {
      const existingStartTime = timeToMinutes(schedule.onTime);
      const existingEndTime = timeToMinutes(schedule.offTime);
      if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
        return setError({
          field: "submit",
          message: "This schedule overlaps with an existing one.",
        });
      }
    }

    onSubmit({ day: selectedDay!, onTime: inputOnTime, offTime: inputOffTime });
    clearForm();
  };

  return (
    // ... JSX dari form Anda tidak berubah ...
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Set {selectedDevice === "lamp" ? "Lamp" : "Fan"} Schedule
        </Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => {
            setError(null);
            setDayModalVisible(true);
          }}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          <Text style={styles.pickerButtonText}>
            {selectedDay || "Select Day"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.primary} />
        </TouchableOpacity>
        {error && error.field === "day" && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        <View style={styles.timeInputContainer}>
          <View style={styles.timeInputRow}>
            <Ionicons name="time-outline" size={20} color={Colors.textLight} />
            <Text style={styles.timeLabel}>On Time</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="HH:MM"
              keyboardType="numeric"
              maxLength={5}
              value={inputOnTime}
              onChangeText={(text) =>
                handleTimeInputChange(text, setInputOnTime)
              }
            />
          </View>
          <View style={styles.timeInputRow}>
            <Ionicons name="time-outline" size={20} color={Colors.textLight} />
            <Text style={styles.timeLabel}>Off Time</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="HH:MM"
              keyboardType="numeric"
              maxLength={5}
              value={inputOffTime}
              onChangeText={(text) =>
                handleTimeInputChange(text, setInputOffTime)
              }
            />
          </View>
        </View>
        {error && error.field === "time" && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitDisabled && styles.submitButtonDisabled,
          ]}
          onPress={handleLocalSubmit}
          disabled={isSubmitDisabled}
        >
          <Text style={styles.submitButtonText}>Save Schedule</Text>
        </TouchableOpacity>
        {error && error.field === "submit" && (
          <Text style={styles.submitErrorText}>{error.message}</Text>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isDayModalVisible}
        onRequestClose={() => setDayModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDayModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>Select a Day</Text>
            {daysOfWeek.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dayItem}
                onPress={() => {
                  setSelectedDay(item);
                  setDayModalVisible(false);
                }}
              >
                <Text style={styles.dayItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// 2. Bungkus komponen bernama tersebut dengan React.memo
const ScheduleForm = React.memo(ScheduleFormComponent);

// --- KOMPONEN UTAMA ---
export default function SettingsScreen() {
  const router = useRouter();
  const [selectedDevice, setSelectedDevice] = useState<Device>("lamp");
  const [schedules, setSchedules] = useState(initialSchedules);
  const [profileImage] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleDeviceChange = useCallback((device: Device) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDevice(device);
  }, []);

  const showSuccessMessage = useCallback(
    (msg: string) => {
      setDeleteMessage(msg);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setDeleteMessage(null));
    },
    [fadeAnim]
  );

  const handleSubmitNewSchedule = useCallback(
    (newScheduleData: Omit<Schedule, "id">) => {
      const newSchedule: Schedule = {
        id: `${selectedDevice}-${Date.now()}`,
        ...newScheduleData,
      };
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setSchedules((prevSchedules) => {
        const updatedDeviceSchedules = [
          ...prevSchedules[selectedDevice],
          newSchedule,
        ].sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));
        return { ...prevSchedules, [selectedDevice]: updatedDeviceSchedules };
      });
      showSuccessMessage("Schedule saved successfully");
    },
    [selectedDevice, showSuccessMessage]
  );

  const handleDelete = useCallback(
    (idToDelete: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSchedules((prevSchedules) => {
        const updatedDeviceSchedules = prevSchedules[selectedDevice].filter(
          (s) => s.id !== idToDelete
        );
        return { ...prevSchedules, [selectedDevice]: updatedDeviceSchedules };
      });
      showSuccessMessage("Schedule removed successfully");
    },
    [selectedDevice, showSuccessMessage]
  );

  const renderHiddenItem = (data: any, rowMap: any) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          rowMap[data.item.id].closeRow();
          handleDelete(data.item.id);
        }}
      >
        <Ionicons name="trash-outline" size={22} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderScheduleItem = ({ item }: { item: Schedule }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleInfo}>
        <Text style={styles.scheduleDay}>{item.day}</Text>
        <View style={styles.scheduleTimeContainer}>
          <View style={styles.scheduleTimeRow}>
            <View style={[styles.dot, { backgroundColor: Colors.greenDot }]} />
            <Text style={styles.scheduleTimeLabel}>On</Text>
            <Text style={styles.scheduleTimeValue}>{item.onTime}</Text>
          </View>
          <View style={styles.scheduleTimeRow}>
            <View style={[styles.dot, { backgroundColor: Colors.redDot }]} />
            <Text style={styles.scheduleTimeLabel}>Off</Text>
            <Text style={styles.scheduleTimeValue}>{item.offTime}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderListHeader = useCallback(
    () => (
      <>
        <View style={styles.profileContainer}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../../assets/images/pp.svg")
            }
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>TimRisetCPS</Text>
          <Text style={styles.profileEmail}>TimRisetCPS@gmail.com</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push("/account-settings")}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modeControlContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedDevice === "lamp" && styles.modeButtonActive,
            ]}
            onPress={() => handleDeviceChange("lamp")}
          >
            <Text
              style={[
                styles.modeButtonText,
                selectedDevice === "lamp" && styles.modeButtonTextActive,
              ]}
            >
              Lamp
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedDevice === "fan" && styles.modeButtonActive,
            ]}
            onPress={() => handleDeviceChange("fan")}
          >
            <Text
              style={[
                styles.modeButtonText,
                selectedDevice === "fan" && styles.modeButtonTextActive,
              ]}
            >
              Fan
            </Text>
          </TouchableOpacity>
        </View>

        <ScheduleForm
          selectedDevice={selectedDevice}
          schedulesForDevice={schedules[selectedDevice]}
          onSubmit={handleSubmitNewSchedule}
        />

        <View style={styles.savedScheduleHeader}>
          <Text style={styles.cardTitle}>Saved Schedules</Text>
        </View>
      </>
    ),
    [
      profileImage,
      selectedDevice,
      schedules,
      router,
      handleDeviceChange,
      handleSubmitNewSchedule,
    ]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <SwipeListView
          style={{ flex: 1 }}
          data={schedules[selectedDevice]}
          renderItem={renderScheduleItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-90}
          disableRightSwipe
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        />
      </Pressable>
      {deleteMessage && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={Colors.white}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.toastText}>{deleteMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.secondary },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 50,
  },
  profileContainer: { alignItems: "center", marginVertical: 20 },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 12,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileEmail: { fontSize: 15, color: Colors.textLight },
  editProfileButton: {
    marginTop: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editProfileText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  modeControlContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  modeButton: { flex: 1, paddingVertical: 10, borderRadius: 20 },
  modeButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modeButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: "600",
  },
  modeButtonTextActive: { color: Colors.primary },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
    textShadowColor: "rgba(0, 0, 0, 0.05)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  savedScheduleHeader: { marginTop: 10 },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
  },
  pickerButtonText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  timeInputContainer: { marginTop: 15 },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  timeLabel: { fontSize: 16, color: Colors.text, marginHorizontal: 10 },
  timeInput: { flex: 1, paddingVertical: 15, fontSize: 16, textAlign: "right" },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 15,
  },
  submitButtonDisabled: { backgroundColor: "#CCCCCC" },
  submitButtonText: { fontSize: 16, fontWeight: "bold", color: Colors.white },
  scheduleCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  scheduleInfo: { flex: 1 },
  scheduleDay: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  scheduleTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scheduleTimeRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  scheduleTimeLabel: { fontSize: 14, color: Colors.textLight, marginRight: 5 },
  scheduleTimeValue: { fontSize: 14, fontWeight: "600", color: Colors.text },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
  },
  modalIndicator: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  dayItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayItemText: { textAlign: "center", fontSize: 16, color: Colors.text },

  errorText: {
    color: Colors.redDot,
    fontSize: 13,
    marginTop: 8,
    marginLeft: 10,
    fontWeight: "500",
  },
  submitErrorText: {
    color: Colors.redDot,
    fontSize: 14,
    textAlign: "center",
    marginTop: 15,
    fontWeight: "500",
  },

  rowBack: {
    alignItems: "center",
    backgroundColor: Colors.redDot,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingLeft: 15,
    marginBottom: 10,
    borderRadius: 15,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 90,
  },
  backRightBtnRight: {
    backgroundColor: Colors.redDot,
    right: 0,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: "row",
    paddingHorizontal: 15,
    gap: 5,
    alignItems: "center",
  },
  toast: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
