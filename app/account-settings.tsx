import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserRole } from "../api/auth";
import AboutAppModal from "../components/modal/about-app";
import { ChangeNameModal } from "../components/modal/ChangeNameModal";
import { ChangePasswordModal } from "../components/modal/ChangePasswordModal";
import { Colors } from "../constants/Colors";

const initialUserData = {
  name: "TimRisetCPS",
  email: "TimRisetCPS@gmail.com",
  profilePicture: require("../assets/images/pp.svg"),
};

const AccountSettingsScreen: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>(initialUserData.name);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // --- PERUBAHAN 4: State untuk menyimpan peran pengguna ---
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // State untuk modal
  const [isPasswordModalVisible, setPasswordModalVisible] =
    useState<boolean>(false);
  const [isAboutAppModalVisible, setAboutAppModalVisible] =
    useState<boolean>(false);
  const [isNameModalVisible, setNameModalVisible] = useState<boolean>(false);

  const insets = useSafeAreaInsets();

  // --- PERUBAHAN 5: useEffect untuk mengambil peran dari AsyncStorage ---
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = (await AsyncStorage.getItem(
          "userRole"
        )) as UserRole | null;
        setUserRole(role);
      } catch (e) {
        console.error("Gagal mengambil peran pengguna", e);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          // Hapus sesi saat logout
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userRole");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleChangeProfilePicture = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission required",
        "You need to allow access to your photos."
      );
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!pickerResult.canceled) {
      setProfileImage(pickerResult.assets[0].uri);
      Alert.alert(
        "Profile Picture Updated",
        "Your new profile picture is ready to be uploaded!"
      );
    }
  };

  const handleSubmitPasswordChange = (passwords: {
    current: string;
    new: string;
  }) => {
    console.log("Password data to send to backend:", passwords);
    Alert.alert("Success", "Your password has been changed successfully!");
  };

  const handleSubmitNameChange = (newName: string) => {
    setUserName(newName);
    setNameModalVisible(false);
    Alert.alert("Name Updated", "Your name has been successfully changed.");
  };

  return (
    <View style={styles.fullScreenContainer}>
      <View style={[styles.blueSection, { paddingTop: insets.top }]}>
        <View style={styles.profileContainer}>
          <View>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : initialUserData.profilePicture
              }
              style={styles.profilePicture}
            />
            <TouchableOpacity
              style={styles.addPictureButton}
              onPress={handleChangeProfilePicture}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.whiteSection}>
        <View style={styles.grabber} />
        <View style={styles.menuOptions}>
          {/* Email */}
          <View style={styles.optionRow}>
            <Ionicons
              name="mail-outline"
              size={24}
              color={Colors.primary}
              style={styles.optionIcon}
            />
            <View>
              <Text style={styles.optionTitle}>Email</Text>
              <Text style={styles.optionValue}>{initialUserData.email}</Text>
            </View>
          </View>

          {/* Name */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setNameModalVisible(true)}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={Colors.primary}
              style={styles.optionIcon}
            />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Name</Text>
              <Text style={styles.optionValue}>{userName}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colors.textLight}
            />
          </TouchableOpacity>

          {/* Password */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Ionicons
              name="key-outline"
              size={24}
              color={Colors.primary}
              style={styles.optionIcon}
            />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Password</Text>
              <Text style={styles.optionValue}>Change your password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colors.textLight}
            />
          </TouchableOpacity>

          {/* --- PERUBAHAN 6: Tampilkan "Add Account" secara kondisional --- */}
          {userRole === "superuser" && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => router.push("/adduser")}
            >
              <Ionicons
                name="person-add-outline"
                size={24}
                color={Colors.primary}
                style={styles.optionIcon}
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Add Account</Text>
                <Text style={styles.optionValue}>
                  Create a new user profile
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={Colors.textLight}
              />
            </TouchableOpacity>
          )}

          {/* About App */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setAboutAppModalVisible(true)}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={Colors.primary}
              style={styles.optionIcon}
            />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>About App</Text>
              <Text style={styles.optionValue}>Learn more about the app</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Components */}
      <ChangePasswordModal
        visible={isPasswordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        onSubmit={handleSubmitPasswordChange}
      />

      <AboutAppModal
        visible={isAboutAppModalVisible}
        onClose={() => setAboutAppModalVisible(false)}
      />

      <ChangeNameModal
        visible={isNameModalVisible}
        onClose={() => setNameModalVisible(false)}
        onSubmit={handleSubmitNameChange}
        currentName={userName}
      />
    </View>
  );
};

export default AccountSettingsScreen;

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  blueSection: {
    height: "40%",
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  profilePicture: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  addPictureButton: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileName: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    marginTop: 15,
  },
  whiteSection: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  grabber: {
    width: 50,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 30,
  },
  menuOptions: {
    width: "100%",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionIcon: {
    marginRight: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.text,
  },
  optionValue: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 50,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});
