import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import NoahLogo from "../../assets/noah-logo.png";
import { CheckBox } from "./CheckBox";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

export const RegisterScreen = ({ navigation }: Props): React.ReactElement => {
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
  if (!username || !email || !password) {
    Alert.alert("Error", "Harap isi semua kolom.");
    return;
  }
  if (!isChecked) {
    Alert.alert(
      "Error",
      "Anda harus menyetujui syarat layanan dan kebijakan privasi."
    );
    return;
  }

  setLoading(true);
  try {
    const apiUrl = "https://noahvetcare.naufalalfa.com/v1/api/user/register/customer";
    console.log("Sending:", { username, email, password });
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, email, password }),
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", data); 

    if (!response.ok) {
      Alert.alert("Error", data.message || "Gagal melakukan pendaftaran.");
      setLoading(false);
      return;
    }

    Alert.alert("Sukses", "Pendaftaran berhasil! Silakan login.");
    setLoading(false);
    navigation.navigate("Login");
  } catch (error) {
    setLoading(false);
    console.error("Register error:", error);
    Alert.alert(
      "Error",
      "Terjadi kesalahan saat pendaftaran. Coba lagi nanti."
    );
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={NoahLogo} style={styles.logo} />
      </View>

      <Text style={styles.welcomeTitle}>Daftar Sekarang!</Text>
      <Text style={styles.welcomeSubTitle}>
        Mulai perjalanan perawatan terbaik untuk hewan peliharaan Anda — daftar
        sekarang!
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Nama Pengguna<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nama pengguna"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Email<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Kata Sandi<Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInputFull}
            placeholder="Masukkan kata sandi"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="none"
            importantForAutofill="no"
          />
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.termsContainer}>
        <CheckBox checked={isChecked} onToggle={() => setIsChecked(!isChecked)} label="" />
        <Text style={styles.termsText}>
          Dengan mendaftar, Anda menyetujui
          <Text style={styles.link}> Syarat Layanan </Text> dan
          <Text style={styles.link}> Kebijakan Privasi </Text> kami.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, (!isChecked || loading) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={!isChecked || loading}
      >
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Daftar"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    color: "#444444",
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 15,
    borderRadius: 12,
    padding: 10,
    width: "100%",
  },
  termsText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: "90%",
    flexWrap: "wrap",
  },
  link: {
    color: "#007BFF",
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
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
  },
});
