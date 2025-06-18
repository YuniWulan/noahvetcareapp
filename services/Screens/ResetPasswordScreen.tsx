import React, { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../App';  
import PasswordUpdatedModal from '../../assets/Popup';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;

type Props = {
  navigation: ResetPasswordScreenNavigationProp;
};

export const ResetPasswordScreen = ({ navigation }: Props) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Kedua kolom harus diisi!");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Kata sandi minimal 8 karakter!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Kata sandi tidak cocok!");
      return;
    }

    // Show modal with slight delay to ensure state is properly set
    setTimeout(() => {
      setModalVisible(true);
    }, 100);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleToggleConfirmVisibility = () => {
    setShowConfirm(prev => !prev);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    // Add delay before navigation to ensure modal closes properly
    setTimeout(() => {
      navigation.navigate("Login");
    }, 200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>Buat Kata Sandi Baru</Text>
              <Text style={styles.subtitle}>
                Kata sandi baru Anda harus berbeda dari kata sandi yang sebelumnya digunakan.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Kata Sandi Baru <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInputFull}
                    placeholder="Kata Sandi Baru"
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={handleTogglePasswordVisibility}
                    style={styles.icon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={24}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>Minimal 8 karakter</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Konfirmasi Kata Sandi <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInputFull}
                    placeholder="Konfirmasi Kata Sandi Baru"
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={handleToggleConfirmVisibility}
                    style={styles.icon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirm ? "eye" : "eye-off"}
                      size={24}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>Harus sama dengan kata sandi baru</Text>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleResetPassword}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Ubah Kata Sandi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <PasswordUpdatedModal
          visible={modalVisible}
          onClose={handleModalClose}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    fontFamily: "Lexend-Regular",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    fontFamily: "Lexend-Regular",
  },
  formGroup: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F5F5F5",
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#F5F5F5",
    marginBottom: 10,
  },
  passwordInputFull: {
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 40,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -18 }],
    padding: 5,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    fontFamily: "Lexend-Regular",
  },
  footer: {
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Lexend-Regular",
  },
}); 