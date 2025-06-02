import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './App'; 

type ChangePasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen = () => {
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    console.log({
      currentPassword,
      newPassword,
      confirmPassword
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubah Password</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password Lama*</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              placeholder="Masukkan password lama"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons 
                name={showCurrentPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password Baru*</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholder="Masukkan password baru"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Konfirmasi Password Baru*</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Konfirmasi password baru"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Simpan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChangePasswordScreen;