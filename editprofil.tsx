import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';
import { Ionicons } from '@expo/vector-icons';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const [username, setUsername] = useState('Bob Johnson Andreas');
  const [email, setEmail] = useState('andreasbobj@gmail.com');

  const handleSave = () => {
    console.log('Saved:', { username, email });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubah Profil</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.container}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={require('./assets/user-image.jpg')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nama Pengguna*</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email*</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleSave}>
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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  editImageButton: {
    position: 'absolute',
    right: 100,
    bottom: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;