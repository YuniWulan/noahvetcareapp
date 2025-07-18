import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Keyboard } from "react-native";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';  
 
type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  
  const { email } = route.params;
 
  const [otp, setOtp] = useState(Array(6).fill("")); 
  const inputRefs = Array(6).fill(0).map(() => React.createRef<TextInput>());

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.charAt(text.length - 1); 
    }
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < inputRefs.length - 1) {
      inputRefs[index + 1].current?.focus();
    }

    if (!text && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyCode = () => {
    const code = otp.join("");
    if (code.length < otp.length || otp.some((digit) => digit === "")) {
      Alert.alert("Error", "Harap isi semua digit kode OTP.");
      Keyboard.dismiss();
      return;
    }

    // Gunakan setTimeout untuk memastikan Alert tertutup sebelum navigasi
    Alert.alert(
      "Sukses", 
      "Kode OTP benar. Silakan atur ulang kata sandi Anda.",
      [
        {
          text: "OK",
          onPress: () => {
            // Navigasi setelah user menekan OK
            setTimeout(() => {
              navigation.navigate("ResetPassword");
            }, 100);
          }
        }
      ]
    );
  };

  const handleResendCode = () => {
    Alert.alert(
      "Info",
      "Kode OTP baru telah dikirim ke email Anda.",
      [
        {
          text: "OK",
          onPress: () => {
            setOtp(Array(6).fill(""));
            setTimeout(() => {
              inputRefs[0].current?.focus();
            }, 100);
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Verifikasi OTP</Text>
          <Text style={styles.subtitle}>
            Masukkan kode verifikasi yang baru saja kami kirim ke alamat email Anda.
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                autoFocus={index === 0}
                returnKeyType="done"
                textAlign="center"
                importantForAutofill="no"
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleResendCode} style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Tidak menerima kode? <Text style={styles.resendLink}>Kirimkan ulang</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
              <Text style={styles.buttonText}>Verifikasi</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Lexend-Regular",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
    fontFamily: "Lexend-Regular",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 18,
    width: 45, 
    backgroundColor: "#F5F5F5",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  resendText: {
    color: "#333",
    fontSize: 14,
    fontFamily: "Lexend-Regular",
  },
  resendLink: {
    color: "red",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Lexend-Regular",
  },
}); 