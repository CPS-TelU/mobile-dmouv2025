import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FullLogo from "../../assets/images/fulldmouv.svg";
import { Colors } from "../../constants/Colors";
import { login, storeUserSession } from "../../api/auth";

// --- VALIDATION FUNCTIONS (Tidak ada perubahan) ---
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Fill this field";
  }
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return "";
};
const validatePassword = (password: string) => {
  if (!password) {
    return "Fill this field";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return "";
};

// --- MAIN COMPONENT ---
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");

  const clearErrorsOnChange = () => {
    setLoginError("");
    if (errors.email || errors.password) {
      setErrors({ email: "", password: "" });
    }
  };

  // --- PERUBAHAN 2: Logika handleLogin diperbarui ---
  const handleLogin = async () => {
    setLoginError("");
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }
    setIsLoading(true);
    try {
      // Panggil API login palsu
      const user = await login(email, password);

      if (user) {
        // Jika login berhasil, simpan token dan peran
        await storeUserSession(user.token, user.role);

        if (!rememberMe) {
          // Jika "remember me" tidak dicentang, hapus token setelahnya
          // (logika ini mungkin perlu disesuaikan, tapi untuk sekarang kita biarkan)
          // await AsyncStorage.removeItem("userToken");
        }

        console.log(`Login berhasil sebagai: ${user.role}`);
        router.replace("/(tabs)/home");
      } else {
        // Jika login gagal
        setLoginError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again.");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.headerContainer}>
          <FullLogo width={306} height={66} style={styles.logo} />
          <Text style={styles.title}>Welcome to D&apos;mouv</Text>
          <Text style={styles.subtitle}>
            {"Your smart way to sense, react,\nand save energy"}
          </Text>
        </View>

        <View style={styles.card}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "email" && styles.inputFocused,
                !!errors.email && styles.inputError,
              ]}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearErrorsOnChange();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.passwordWrapper,
                focusedInput === "password" && styles.inputFocused,
                !!errors.password && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearErrorsOnChange();
                }}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor={Colors.textLight}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color={Colors.primary}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* --- PERUBAHAN STRUKTUR JSX DI SINI --- */}
          <View style={styles.optionsContainer}>
            {/* Bagian Kiri: Remember Me */}
            <View style={styles.rememberMeContainer}>
              <Checkbox
                style={styles.checkbox}
                value={rememberMe}
                onValueChange={setRememberMe}
                color={rememberMe ? Colors.primary : undefined}
              />
              <Text style={styles.rememberMeLabel}>Keep me Signed in</Text>
            </View>
            {/* Bagian Kanan: Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.connectButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.connectButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          {loginError ? (
            <Text style={styles.loginErrorText}>{loginError}</Text>
          ) : null}

          {/* Footer "Don't have an account?" dipindahkan ke sini */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 60,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontFamily: "Poppins-Medium",
    fontSize: 22,
    color: Colors.primary,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontFamily: "Poppins-ExtraLight",
    fontSize: 16,
    color: Colors.primary,
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.cardgray,
    borderRadius: 20,
    padding: 25,
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: Colors.text,
    backgroundColor: Colors.white,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.white,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: Colors.text,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  // --- STYLE BARU DAN PERUBAHAN DI BAWAH INI ---
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30, // Jarak ke tombol Sign In
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    // Margin Bottom dihapus dari sini
  },
  rememberMeLabel: {
    fontFamily: "Roboto-Regular",
    fontSize: 12,
    color: Colors.textLight,
  },
  checkbox: {
    marginRight: 8,
  },
  forgotPasswordText: {
    fontFamily: "Roboto-Regular",
    fontSize: 12, // Ukuran font disamakan dengan "Keep me signed in"
    color: Colors.primary,
  },
  connectButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: Colors.primary,
  },
  connectButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: Colors.white,
  },
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: Colors.redDot,
  },
  errorText: {
    color: Colors.redDot,
    fontFamily: "Roboto-Regular",
    fontSize: 12,
    marginTop: 5,
    paddingLeft: 4,
  },
  loginErrorText: {
    color: Colors.redDot,
    fontFamily: "Roboto-Medium",
    fontSize: 14,
    textAlign: "center",
    marginTop: 15,
  },
});
