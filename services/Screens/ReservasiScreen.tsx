import React, { useEffect, useState } from 'react';
import {
  View,
  Text, 
  Alert,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type ReservasiNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Pet interface for better type safety - Updated to match API response
interface Pet {
  id: number;
  pet_name: string;
  species: string;
  age: number;
  breed?: string;
  type?: string;
  gender?: string;
  owner_id?: number;
  image?: any; // Keep for UI compatibility
  name?: string; // Keep for backward compatibility
}

export default function Reservasi() {
  const navigation = useNavigation<ReservasiNavigationProp>();
  const [token, setToken] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Pet states
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isPetsLoading, setIsPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState<string | null>(null);
  
  // Other states
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(8);

  // Function to fetch pets from API - Fixed to match API documentation
  const fetchUserPets = async (token: string, userID: string) => {
    setIsPetsLoading(true);
    setPetsError(null);
    
    try {
      console.log('Fetching pets for userID:', userID);
      console.log('Using token:', token ? 'Token available' : 'No token');

      // Fixed URL to match documentation
      const response = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/pet/lists/${userID}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('API Pets Response:', data);
     
      if (response.ok) {
        // Fixed to match API response structure: petData instead of pets
        if (data.petData && Array.isArray(data.petData) && data.petData.length > 0) {
          // Transform API pets to match your pet structure
          const transformedApiPets: Pet[] = data.petData.map((pet: any) => ({
            id: pet.id,
            pet_name: pet.pet_name,
            species: pet.species,
            age: pet.age,
            // Add backward compatibility fields
            name: pet.pet_name, // For UI compatibility
            breed: pet.species, // Use species as breed for now
            type: pet.species,
            // Keep existing fields that might be used in UI
            gender: pet.gender,
            owner_id: pet.owner_id,
            image: pet.image,
          }));
          
          setPets(transformedApiPets);
          console.log('Pets loaded successfully:', transformedApiPets);
        } else {
          // No pets found
          setPets([]);
          console.log('No pets found for user');
        }
      } else {
        // Handle specific error responses
        if (response.status === 403) {
          setPetsError('Anda hanya dapat melihat pets Anda sendiri');
        } else if (response.status === 404) {
          setPetsError('Data pets tidak ditemukan');
        } else {
          const errorMessage = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
          console.warn('Failed to fetch pets from API:', errorMessage);
          setPetsError(`Gagal memuat data pets: ${errorMessage}`);
        }
        setPets([]);
      }
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      setPetsError(`Error: ${error.message || 'Gagal terhubung ke server'}`);
      setPets([]);
    } finally {
      setIsPetsLoading(false);
    }
  };

  // Load auth data and fetch pets
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const userDataStr = await AsyncStorage.getItem('user');
        console.log('User data string:', userDataStr);
        
        let storedUserID = null;
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          storedUserID = userData.user_id || userData.id || null;
        }

        setToken(storedToken);
        setUserID(storedUserID);

        // Fetch API pets after token and userID are available
        if (storedToken && storedUserID) {
          await fetchUserPets(storedToken, storedUserID);
        } else {
          console.warn('Token or UserID not available');
          if (!storedToken) setPetsError('Token tidak tersedia');
          if (!storedUserID) setPetsError('User ID tidak tersedia');
        }

      } catch (error: any) {
        console.error('Auth data loading error:', error);
        Alert.alert('Error', 'Gagal memuat data autentikasi');
        setPetsError('Gagal memuat data autentikasi');
      }
    };

    loadAuthData();
  }, []);

  // Refresh pets function
  const refreshPets = () => {
    if (token && userID) {
      fetchUserPets(token, userID);
    }
  };
 
  const doctors = [
    { id: 8, name: 'Dr. Smith', specialty: 'General' },
    { id: 9, name: 'Dr. Johnson', specialty: 'Surgery' },
  ];

  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return days;
  };

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    return `${day} ${dayName}`;
  };

  const formatMonthYear = (date: Date) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const calendarDays = generateCalendar(); 
 
  const createAppointment = async () => {
    if (!token || !userID) {
      Alert.alert('Error', 'Token atau user ID belum tersedia');
      return;
    }
    if (!selectedPet || !selectedDate || !selectedTime || !selectedDoctor) {
      Alert.alert('Error', 'Harap pilih peliharaan, tanggal, waktu, dan dokter terlebih dahulu');
      return;
    }
    
    setIsLoading(true);
    try {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);

      const doctor = doctors.find((d) => d.id === selectedDoctor);
      if (!doctor) throw new Error('Dokter tidak ditemukan');

      const response = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/appointment/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pet_id: selectedPet.id,
          doctor_id: selectedDoctor,
          date: dateTime.toISOString(),
          status: 'Scheduled',
          notes,
        }),
      });

      console.log('Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        throw new Error(`Response bukan JSON: ${text}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal membuat appointment');
      }

      Alert.alert('Sukses', 'Appointment berhasil dibuat', [
        {
          text: 'OK',
          onPress: () => {
            (navigation as any).navigate('MainTabs', { 
              screen: 'ReservationList',
              params: { shouldRefresh: true }
            });
          }
        }
      ]);

      const newReservation = {
        id: data.appointment_id.toString(),
        petName: selectedPet?.pet_name || 'Unknown Pet',
        gender: selectedPet.gender || 'Unknown',
        date: dateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        time: selectedTime,
        status: 'Menunggu' as const,
        image: selectedPet.image,
      };

      // Reset form
      setSelectedPet(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setNotes(''); 
    } catch (error: any) { 
      console.error('Create appointment error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservation = () => {
    createAppointment();
  };

  // Get pet display name - helper function
  const getPetDisplayName = (pet: Pet) => {
    return pet.pet_name || pet.name || 'Unknown Pet';
  };

  // Get pet display breed - helper function  
  const getPetDisplayBreed = (pet: Pet) => {
    return pet.breed || pet.species || 'Unknown Breed';
  };

  // Render pet section
  const renderPetSection = () => {
    if (isPetsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Memuat pets...</Text>
        </View>
      );
    }

    if (petsError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{petsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshPets}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (pets.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada pets yang terdaftar</Text>
          <Text style={styles.emptySubText}>Silakan tambahkan pets Anda terlebih dahulu</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshPets}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll} nestedScrollEnabled>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[styles.petItem, selectedPet?.id === pet.id && styles.selectedPetItem]}
            onPress={() => setSelectedPet(pet)}
          >
            <Text style={selectedPet?.id === pet.id ? styles.selectedPetText : styles.petText}>
              {getPetDisplayName(pet)}
            </Text>
            <Text style={styles.petBreed}>{getPetDisplayBreed(pet)}</Text>
            <View style={styles.petInfoContainer}>
              <Text style={styles.petInfo}>
                {pet.age ? `${pet.age} tahun` : ''} {pet.gender ? `• ${pet.gender}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
  <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat Reservasi</Text>
        <TouchableOpacity onPress={refreshPets} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#007bff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Pilih Peliharaan Anda</Text>
        {renderPetSection()}

        <Text style={styles.sectionTitle}>Pilih Dokter</Text>
        <View style={styles.doctorList}>
          {doctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={[styles.doctorItem, selectedDoctor === doctor.id && styles.selectedDoctorItem]}
              onPress={() => setSelectedDoctor(doctor.id)}
            >
              <Text style={selectedDoctor === doctor.id ? styles.selectedDoctorText : styles.doctorText}>
                {doctor.name} ({doctor.specialty})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Pilih Tanggal</Text>
        <View style={styles.monthPicker}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.calendarDayLabel}>
              {day}
            </Text>
          ))} 
          {calendarDays.map((date, index) =>
            date ? (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  selectedDate &&
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear()
                    ? styles.selectedCalendarDay
                    : null,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.calendarDayText,
                  selectedDate &&
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear()
                    ? styles.selectedCalendarDayText
                    : null,
                ]}>{date.getDate()}</Text>
              </TouchableOpacity>
            ) : (
              <View key={index} style={styles.calendarDayEmpty} />
            )
          )}
        </View>

        <Text style={styles.sectionTitle}>Pilih Waktu</Text>
        <View style={styles.timeList}>
          {times.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeItem, selectedTime === time && styles.selectedTimeItem]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={selectedTime === time ? styles.selectedTimeText : styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Catatan</Text>
        <TextInput 
          multiline
          placeholder="Tulis catatan tambahan..."
          style={styles.textInput}
          value={notes}
          onChangeText={setNotes}
        /> 

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleReservation}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>{isLoading ? 'Loading...' : 'Buat Reservasi'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    marginTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  }, 
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 5,
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  
  // Pet section styles
  petScroll: {
    marginBottom: 15,
  },
  petItem: {
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    minWidth: 100,
  },
  selectedPetItem: {
    borderColor: '#007bff',
    backgroundColor: '#e8f4fd',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  petText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedPetText: {
    color: '#007bff',
    fontWeight: '700',
    fontSize: 14,
  },
  petBreed: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  petInfoContainer: {
    marginTop: 4,
  },
  petInfo: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
  },

  // Loading, error, and empty states
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#ffeaa7',
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#d63031',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 15,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  emptySubText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Doctor section
  doctorList: {
    flexDirection: 'row', 
    marginBottom: 15,
  },
  doctorItem: {
    marginRight: 15,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedDoctorItem: {
    backgroundColor: '#dbeeff',
    borderColor: '#007bff',
  },
  doctorText: {
    color: '#333',
  },
  selectedDoctorText: {
    color: '#007bff',
    fontWeight: '700',
  },

  // Calendar section
  monthPicker: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  monthButton: {
    padding: 5,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    color: '#333',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 5,
  }, 
  selectedCalendarDay: {
    backgroundColor: '#007bff',
  },
  calendarDayText: {
    color: '#333',
  },
  selectedCalendarDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  calendarDayEmpty: {
    width: `${100 / 7}%`,
    paddingVertical: 10,
    marginBottom: 5,
  },

  // Time section
  timeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  timeItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 14,
    marginBottom: 10,
  },
  selectedTimeItem: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  timeText: {
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Input and button
  textInput: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  }, 
  submitButtonDisabled: {
    backgroundColor: '#7aa7e9',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  }, 
});