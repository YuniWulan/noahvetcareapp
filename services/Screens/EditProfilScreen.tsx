import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

 useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (!token || !storedUserId) throw new Error('Token atau User ID tidak ditemukan');

        setUserId(storedUserId);

        const response = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/user/details/${storedUserId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Gagal fetch data user');

        const data = await response.json();
        console.log('Data user di-fetch:', data);
        setUsername(data.username || '');
        setEmail(data.email || '');
      } catch (err) {
        console.error('Gagal ambil data user:', err);
        Alert.alert('Error', 'Tidak dapat mengambil data pengguna');
      }
    };

    fetchUserDetails();
  }, []);

  const handleSave = async () => {
    try {
      console.log('Data yang dikirim ke server:', {
        username: username.trim(),
        email: email.trim()
      });

      const token = await AsyncStorage.getItem('token');
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (!token || !storedUserId) throw new Error('Token atau User ID tidak ditemukan');

      const response = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim()
        }),
      });

      if (!response.ok) throw new Error('Update gagal');
      
      const updatedResult = await response.json();
      console.log('Update berhasil, response API:', updatedResult);
      if (!updatedResult.success) throw new Error('Update gagal (success = false)');

      // Fetch data terbaru dari API
      const userDetailsResponse = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/user/details/${storedUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userDetailsResponse.ok) throw new Error('Gagal mengambil ulang data user');

      const updatedUserData = await userDetailsResponse.json();
      console.log('Data user terbaru setelah update:', updatedUserData);

      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));

      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      navigation.goBack();
    } catch (error) {
      console.error('Error saat update:', error);
      Alert.alert('Error', 'Gagal memperbarui profil');
    }
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
            source={require('../../assets/user-image.jpg')}
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
    marginTop: 32,
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
