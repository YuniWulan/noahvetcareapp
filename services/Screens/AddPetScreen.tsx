import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';

type NavigationProps = NavigationProp<RootStackParamList>;


const AddPetScreen = () => {
  const [pet_name, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  // Clear all form fields
  const clearForm = () => {
    setPetName('');
    setSpecies('');
    setBreed('');
    setAge('');
    setMedicalHistory('');
  };

  // Extract pet ID from API response with comprehensive fallback
  const extractPetId = (responseData: any): string | null => {
    console.log('=== EXTRACTING PET ID ===');
    console.log('Full API Response:', JSON.stringify(responseData, null, 2));
    
    // Check all possible ID fields
    const possibleIds = [
      responseData.pet_id,
      responseData.id,
      responseData.petId,
      responseData._id,
      responseData.data?.id,
      responseData.data?.pet_id,
      responseData.pet?.id,
      responseData.pet?.pet_id,
      responseData.petData?.[0]?.id,
      responseData.petData?.[0]?.pet_id,
      responseData.success?.id,
      responseData.success?.pet_id,
      responseData.result?.id,
      responseData.result?.pet_id,
    ];
    
    console.log('Possible ID values:', possibleIds);
    
    
    // Find the first valid ID
     for (const id of possibleIds) {
    if (id !== undefined && id !== null && id !== '') {
      const petId = typeof id === 'number' ? id.toString() : String(id);
      if (petId !== 'undefined' && petId !== 'null') {
        console.log('✅ Found valid pet ID:', petId);
        return petId;
      }
    }
  }
    
    console.log('❌ No valid pet ID found');
    return null;
  };

  // Navigate to pet details with error handling
  const navigateToPetDetails = (petId: string, responseData: any, petFormData: any) => {
  console.log('🚀 Preparing navigation to DetailPetScreen');
  console.log('🚀 Pet ID:', petId);
  console.log('🚀 Response Data:', responseData);
  console.log('🚀 Form Data:', petFormData);
   try {
    // Validate petId
    const validPetId = petId?.toString();
    if (!validPetId || validPetId === 'undefined' || validPetId === 'null') {
      throw new Error('Invalid pet ID for navigation');
    }

    // Prepare comprehensive pet data
    const petData = {
      pet_name: petFormData.pet_name,
      species: petFormData.species,
      breed: petFormData.breed,
      age: petFormData.age,
      medical_history: petFormData.medical_history,
      phone: petFormData.phone || "",
      id: validPetId,
      // Include any additional data from API response
      ...responseData.pet,
      ...responseData.data
    };

    const navigationParams = {
      petId: validPetId,
      petName: petFormData.pet_name,
      petData: petData,
      fromAddPet: true
    };

    console.log('🚀 Final navigation params:', navigationParams);

    // Use setTimeout to ensure navigation state is ready
    setTimeout(() => {
      try {
        navigation.navigate('DetailPetScreen', navigationParams);
        console.log('✅ Navigation completed successfully');
      } catch (navError) {
        console.error('❌ Navigation failed:', navError);
        Alert.alert('Navigation Error', 'Hewan berhasil ditambahkan tapi tidak dapat membuka detail.');
      }
    }, 200);
    
  } catch (error) {
    console.error('❌ Navigation preparation failed:', error);
    Alert.alert('Error', 'Gagal mempersiapkan navigasi ke detail hewan.');
  }
};
 
  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isLoading) return;

    // Trim all inputs
    const trimmedPetName = pet_name.trim();
    const trimmedSpecies = species.trim();
    const trimmedBreed = breed.trim();
    const trimmedAge = age.trim();
    const trimmedMedicalHistory = medicalHistory.trim();

    // Validate required fields
    if (!trimmedPetName || !trimmedSpecies || !trimmedBreed) {
      Alert.alert('Error', 'Pet name, species, and breed are required');
      return;
    }

    // Validate age is a positive number
    const ageNumber = parseInt(trimmedAge);
    if (isNaN(ageNumber) || ageNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid age (positive number)');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get authentication data - use consistent keys
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");

      console.log('Token from storage:', token ? 'Token exists' : 'No token found');
      console.log('User from storage:', userString ? 'User data exists' : 'No user data');

      if (!token || !userString) {
        Alert.alert("Error", "User data not found. Please login again.");
        return;
      }

      const parsedUser = JSON.parse(userString);
      console.log("User object from storage:", parsedUser);
    
      // Get user ID with multiple fallbacks
      const userId = parsedUser.id || parsedUser.user_id || parsedUser._id;
    
      if (!userId) {
        console.error("User ID tidak ditemukan dalam data user:", parsedUser);
        Alert.alert("Error", "Could not determine user ID");
        return;
      }

      const ownerPhone = parsedUser.phone || "";

      // Prepare request body
      const requestBody = {
        user_id: userId,
        pet_name: trimmedPetName,
        species: trimmedSpecies,
        breed: trimmedBreed,
        age: ageNumber,
        medical_history: trimmedMedicalHistory,
        phone: ownerPhone,
      };
      
      console.log("Sending request with payload:", requestBody);
 
      const response = await fetch("https://noahvetcare.naufalalfa.com/v1/api/pet/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      const responseData = await response.json();
      console.log('API Response data:', JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        console.error('API Error:', responseData);
        Alert.alert('Error', responseData.error || responseData.message || 'Failed to register pet');
        return;
      }

      console.log('✅ Pet added successfully:', responseData);

       const formData = {
      pet_name: trimmedPetName,
      species: trimmedSpecies,
      breed: trimmedBreed,
      age: ageNumber,
      medical_history: trimmedMedicalHistory,
      phone: ownerPhone
    };
    
      // Extract pet ID from response
      const petId = extractPetId(responseData);
      console.log('Extracted pet ID:', petId);

      // Show success alert with appropriate options
      Alert.alert(
        "Success", 
        "Pet added successfully!",
        [
          {
            text: "View Details",
            onPress: () => {
              if (petId) {
                // Add delay to ensure navigation state is ready
                setTimeout(() => {
                  navigateToPetDetails(petId, responseData, formData);
                }, 100);
              } else {
                console.warn('Pet ID not found, cannot navigate to details');
                Alert.alert(
                  'Navigation Error', 
                  'Pet berhasil ditambahkan tapi tidak dapat menavigasi ke detail. Silakan cek di daftar hewan.',
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            }
          },
          {
            text: "Add Another",
            onPress: clearForm
          },
          {
            text: "Go Back",
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
                editable={!isLoading}
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
                editable={!isLoading}
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
                editable={!isLoading}
              />
            </View>

            {/* Age */}
            <View style={styles.section}>
              <Text style={styles.label}>Usia (dalam bulan)*</Text>
              <TextInput
                style={styles.input}
                placeholder="Usia Hewan Anda"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                editable={!isLoading}
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
                editable={!isLoading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Menambahkan...' : 'Tambah Hewan'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 32,
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
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddPetScreen;