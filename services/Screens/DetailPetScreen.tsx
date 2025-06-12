import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import type { RouteProp } from '@react-navigation/native';

type DetailPetRouteProp = RouteProp<RootStackParamList, 'DetailPetScreen'>;

type Props = {
  route: DetailPetRouteProp;
  navigation: any;
};

type PetData = {
  name: string;
  species: string;
  breed: string;
  age: string;
  medicalNotes: string;
  phone?: string;
  ageInMonths?: number;
  status?: 'healthy' | 'needs_attention' | 'critical';
  lastVisit?: string;
  nextAppointment?: string;
};

type PetApiResponse = {
  pet_name: string;
  species: string;
  breed: string;
  age: number;
  medical_history: string;
  phone?: string;
  status?: 'healthy' | 'needs_attention' | 'critical';
  lastVisit?: string;
  nextAppointment?: string;
};

type DoctorData = {
  username: string;
  email?: string;
  name?: string;
  full_name?: string;
  id?: string;
  user_id?: string;
  _id?: string;
  specialization?: string;
  license_number?: string;
  phone?: string;
  experience?: string;
  education?: string;
  about?: string;
};
const formatAge = (months: number): string => {
  if (months < 12) return `${months} Bulan`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths === 0 ? `${years} Tahun` : `${years} Tahun ${remainingMonths} Bulan`;
};

const getSpeciesIcon = (species: string) => {
  const s = species.toLowerCase();
  if (s.includes('kucing') || s.includes('cat')) return { name: 'pets' as const, color: '#FF6B6B', bgColor: '#FFE5E5' };
  if (s.includes('anjing') || s.includes('dog')) return { name: 'pets' as const, color: '#4ECDC4', bgColor: '#E5F9F6' };
  if (s.includes('burung') || s.includes('bird')) return { name: 'flight' as const, color: '#45B7D1', bgColor: '#E5F4FD' };
  if (s.includes('hamster') || s.includes('kelinci') || s.includes('rabbit')) return { name: 'eco' as const, color: '#96CEB4', bgColor: '#E8F5E8' };
  if (s.includes('ikan') || s.includes('fish')) return { name: 'pool' as const, color: '#3498DB', bgColor: '#EBF4FD' };
  return { name: 'pets' as const, color: '#9B59B6', bgColor: '#F4E5F7' };
};

const getStatusInfo = (status?: string) => {
  switch (status) {
    case 'healthy': return { color: '#27AE60', text: 'Sehat', bgColor: '#E8F5E8' };
    case 'needs_attention': return { color: '#F39C12', text: 'Perlu Perhatian', bgColor: '#FDF2E5' };
    case 'critical': return { color: '#E74C3C', text: 'Kritis', bgColor: '#FDEDEC' };
    default: return { color: '#7F8C8D', text: 'Tidak Diketahui', bgColor: '#F8F9FA' };
  }
};

const formatDate = (date?: string): string => {
  if (!date) return 'Tidak tersedia';
  try {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return 'Format tanggal tidak valid';
  }
};

const DetailPetScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId, petData: routePetData, petName, fromAddPet } = route.params;
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('Pet ID param:', petId);
  console.log('Dari route params:', route.params);
  console.log('State - pet:', pet); 
  console.log('State - loading:', loading); 
  console.log('State - error:', error);

  const fetchPetDetail = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan');

      // Convert id to string jika number
      const petIdString = typeof id === 'number' ? id.toString() : id;

      const response = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/pet/detail/${petIdString}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.status === 404) throw new Error('Hewan tidak ditemukan');
      if (!response.ok) throw new Error(`Gagal: ${response.status}`);

      const data: PetApiResponse = await response.json();
      
      console.log('API Response:', data); 

      setPet({
        name: data.pet_name,
        species: data.species,
        breed: data.breed,
        age: formatAge(data.age),
        ageInMonths: data.age,
        medicalNotes: data.medical_history || 'Tidak ada catatan medis',
        phone: data.phone || 'Tidak tersedia',
        status: data.status,
        lastVisit: data.lastVisit,
        nextAppointment: data.nextAppointment,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui';
      setError(msg);
      Alert.alert('Error', msg, [
        { text: 'Coba Lagi', onPress: () => fetchPetDetail(id) },
        { text: 'Kembali', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ useEffect harus berada di dalam komponen
  useEffect(() => {
    if (petId) {
      fetchPetDetail(petId);
    } else if (routePetData) {
      setPet(routePetData);
      setLoading(false);
    }
  }, [petId]);

  // ✅ Semua conditional returns harus berada di dalam komponen
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Memuat data hewan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={60} color="#f44336" />
          <Text style={styles.errorText}>Terjadi Kesalahan</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => petId && fetchPetDetail(petId)}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Data hewan tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const speciesIcon = getSpeciesIcon(pet.species);
  const statusInfo = getStatusInfo(pet.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Detail Hewan</Text>
          </View>

          {/* Pet Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.petIconContainer, { backgroundColor: speciesIcon.bgColor }]}>
              <MaterialIcons name={speciesIcon.name} size={50} color={speciesIcon.color} />
            </View>
          </View> 

          {/* Pet Name */}
          <Text style={styles.petName}>{pet.name}</Text>

          {/* Pet Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Spesies:</Text>
              <Text style={styles.detailValue}>{pet.species}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Breed:</Text>
              <Text style={styles.detailValue}>{pet.breed}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Umur:</Text>
              <Text style={styles.detailValue}>{pet.age}</Text>
            </View>
              
            {pet.lastVisit && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kunjungan Terakhir:</Text>
                <Text style={styles.detailValue}>{formatDate(pet.lastVisit)}</Text>
              </View>
            )}
            
            {pet.nextAppointment && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Janji Berikutnya:</Text>
                <Text style={styles.detailValue}>{formatDate(pet.nextAppointment)}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Catatan Medis:</Text>
              <Text style={styles.detailValue}>{pet.medicalNotes}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.editButton]}
              onPress={() => {
                console.log('Edit pet');
              }}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.historyButton]}
              onPress={() => {
                console.log('View history');
              }}
            >
              <Text style={styles.buttonText}>Riwayat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailPetScreen; 

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  container: {
    padding: 20,
    flex: 1,
    marginTop: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#f44336',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  petIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 15,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  detailsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 7,
  },
  detailLabel: { 
    fontWeight: '600',
    fontSize: 16,
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#222',
    maxWidth: '60%',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  editButton: {
    backgroundColor: '#2196F3',
    marginRight: 15,
  },
  historyButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16, 
  },
}); 