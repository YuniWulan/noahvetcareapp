import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NoahLogo from "../../assets/noah-logo.png";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../App';  

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export const LoginScreen = ({ navigation }: Props) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  
    const handleInputFocus = useCallback((yOffset: number) => {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: yOffset,
          animated: true,
        });
      }, 100);
    }, []);

  const handleLogin = async () => {
    if (!name || !password) {
      Alert.alert("Peringatan", "Nama pengguna dan kata sandi harus diisi!");
      return;
    }

    try {
      setLoading(true);

      

      const loginResponse = await fetch(
        "https://noahvetcare.naufalalfa.com/v1/api/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: name.trim(),
            password: password.trim(),
          }),
        }
      );

      const loginData = await loginResponse.json();
      console.log("Login response:", loginData);
    
      if (!loginResponse.ok) {
        console.log("Login error response:", loginData);
        throw new Error(loginData.message || "Login gagal.");
      }

      const { token, user_id } = loginData;

      const userResponse = await fetch(
        `https://noahvetcare.naufalalfa.com/v1/api/user/details/${user_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userData = await userResponse.json();
       console.log("User details:", userData);

      if (!userResponse.ok) {
        throw new Error("Gagal mengambil data pengguna.");
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("user_id", user_id.toString());

      if (userData.is_doctor) {
        navigation.navigate("DoctorHome");
      } else {
        navigation.navigate("MainTabs");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
        <View style={styles.logoContainer}>
          <Image source={NoahLogo} style={styles.logo} />
        </View>

        <Text style={styles.welcomeTitle}>Halo, Selamat Datang!</Text>
        <Text style={styles.welcomeSubTitle}>
          Pastikan hewan peliharaan selalu sehat - atur janji dan pantau riwayat
          perawatannya!
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nama Pengguna<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan Nama Pengguna"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Kata Sandi<Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInputFull}
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan Kata Sandi"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotPasswordText}>Lupa kata sandi?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "Masuk"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>
            Belum punya akun?{" "}
            <Text style={styles.registerLink}>Daftar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Lexend-Regular",
    marginBottom: 5,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  welcomeSubTitle: {
    fontSize: 14,
    fontFamily: "Lexend-Regular",
    textAlign: "left",
    alignSelf: "flex-start",
    marginBottom: 20,
    color: "#A0A0A0",
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
  iconContainer: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -18 }],
    padding: 5,
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "red",
    fontWeight: "normal",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  registerText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  registerLink: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});
