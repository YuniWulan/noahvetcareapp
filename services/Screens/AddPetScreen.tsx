import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddPetScreen = () => {
  const [pet_name, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const navigation = useNavigation();

  type PetType = {
  pet_name: string;
  species: string;
  breed: string;
  age: number;
  medicalHistory: string;
};
  
  const addNewPet = async (newPet: PetType) => {
    try {
      const petsString = await AsyncStorage.getItem('pets');
      const petsArray = petsString ? JSON.parse(petsString) : [];
      petsArray.push(newPet);
      await AsyncStorage.setItem('pets', JSON.stringify(petsArray));
      navigation.goBack();
    } catch (error) {
      console.log('Error adding pet:', error);
    }
  };


  const handleSubmit = async () => {
    // Trim all inputs
    const trimmedPetName = pet_name.trim();
    const trimmedSpecies = species.trim();
    const trimmedBreed = breed.trim();
    const trimmedAge = age.trim();
    const trimmedMedicalHistory = medicalHistory.trim();

    // Validate required fields
    if (!trimmedPetName || !trimmedSpecies) {
      Alert.alert('Error', 'Pet name and species are required');
      return;
    }

    // Validate age is a positive number
    const ageNumber = parseInt(trimmedAge);
    if (isNaN(ageNumber)) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");

      if (!token || !userString) {
        Alert.alert("Error", "User data not found. Please login again.");
        return;
      }

      const parsedUser = JSON.parse(userString);
      console.log("User object from storage:", parsedUser);
    
      // Get user ID based on your API's expected format
      const userId = parsedUser.id || parsedUser.user_id || parsedUser._id;
    
      if (!userId) {
        Alert.alert("Error", "Could not determine user ID");
        return;
      }

    const ownerPhone = parsedUser.phone || "";

      // Prepare request body
    const requestBody = {
        user_id: userId,     // snake_case
        pet_name: trimmedPetName,    // snake_case
        species: trimmedSpecies,
        breed: trimmedBreed,
        age: ageNumber,
        medical_history: trimmedMedicalHistory,
        phone: ownerPhone || "",      // bisa kosong
    };
      console.log("Sending request with payload:", requestBody);
      console.log('petName:', JSON.stringify(trimmedPetName));
      console.log('species:', JSON.stringify(trimmedSpecies));


      const response = await fetch("https://noahvetcare.naufalalfa.com/v1/api/pet/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('API Error:', responseData);
        Alert.alert('Error', responseData.error || 'Failed to register pet');
        return;
      }

      Alert.alert("Success", "Pet added successfully!");
      // Reset form
      setPetName('');
      setSpecies('');
      setBreed('');
      setAge('');
      setMedicalHistory('');
      navigation.goBack();

    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header with back button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.header}>Hewan Baru</Text>
          </View>

          {/* Pet Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Nama Hewan*</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama Hewan Anda"
              value={pet_name}
              onChangeText={setPetName}
              autoCapitalize="words"
            />
          </View>

          {/* Species */}
          <View style={styles.section}>
            <Text style={styles.label}>Spesies*</Text>
            <TextInput
              style={styles.input}
              placeholder="Spesies Hewan Anda"
              value={species}
              onChangeText={setSpecies}
              autoCapitalize="words"
            />
          </View>

          {/* Breed */}
          <View style={styles.section}>
            <Text style={styles.label}>Breed*</Text>
            <TextInput
              style={styles.input}
              placeholder="Breed Hewan Anda"
              value={breed}
              onChangeText={setBreed}
              autoCapitalize="words"
            />
          </View>

          {/* Age */}
          <View style={styles.section}>
            <Text style={styles.label}>Usia*</Text>
            <TextInput
              style={styles.input}
              placeholder="Usia Hewan Anda"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          {/* Medical Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Catatan Medis</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Catatan Medis Hewan"
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>Tambah Hewan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddPetScreen;