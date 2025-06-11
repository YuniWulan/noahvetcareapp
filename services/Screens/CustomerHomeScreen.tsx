
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ImageBackground, 
  Alert,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';


type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
 
interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  is_doctor: boolean;
  speciality: string | null;
  phone: string | null;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  username: string;
  is_doctor: boolean;
  speciality: string | null;
  phone: string | null;
}

interface Reservation {
  originalDate: string;
  id: string;
  petName: string; 
  date: string;
  time: string;
  status: string;
  gender: string;
  doctorName?: string;  
  doctor_name?: string; 
  notes?: string;       
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // API Configuration
  const API_BASE_URL = 'https://noahvetcare.naufalalfa.com';
  const API_TIMEOUT = 10000; // 10 seconds

  // State management
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced fetch function with timeout and better error handling
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = API_TIMEOUT): Promise<Response> => {
    console.log('🌐 Fetching URL:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timeout for URL:', url);
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response OK:', response.ok);

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Fetch error for URL:', url, error);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  };

  // Secure token management
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Auth token retrieved:', token ? 'Token exists' : 'No token found');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const getUserId = async (): Promise<string | null> => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      console.log('👤 User ID retrieved:', userId);
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

   const fetchFromAPI = async (endpoint: string, token: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const responseText = await response.text();
    console.log(`📄 Raw response for ${endpoint}:`, responseText);

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('Invalid JSON response');
    }
  };

  // Enhanced user data fetching
  const fetchUserData = async (): Promise<User | null> => {
    console.log('👤 Starting fetchUserData...');
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');
      
      console.log('👤 Credentials check - Token:', !!token, 'UserId:', userId);
      if (!token || !userId) {
        console.log('⚠️ Missing auth credentials');
        throw new Error('Authentication credentials not found');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/v1/api/user/details/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ User API response not OK:', response.status, response.statusText);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw user response:', responseText);

      let userData: any;
      try {
        userData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse error for user data:', parseError);
        throw new Error('Invalid JSON response from user API');
      }

      console.log('👤 Parsed user data:', JSON.stringify(userData, null, 2));
      
      // Handle different response structures
      let user: User | null = null;
      
      if (userData.success && userData.data) {
        user = userData.data;
      } else if (userData.data) {
        user = userData.data;
      } else if ('id' in userData) {
        user = userData as User;
      }

      if (!user || !user.id) {
        throw new Error('Invalid user data structure');
      }

      // Normalize user data
      return {
        id: user.id,
        name: user.name || user.username || 'User',
        email: user.email || '',
        username: user.username || user.name || 'user',
        is_doctor: user.is_doctor || false,
        speciality: user.speciality || null,
        phone: user.phone || null,
      };

    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  // Enhanced pets data fetching with better logging
  const fetchPetsData = async (): Promise<Pet[]> => {
  console.log('🐾 Starting fetchPetsData...');
  try {
    const token = await getAuthToken();
    const userId = await getUserId();
    
    if (!token || !userId) {
      throw new Error('Authentication credentials not found');
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/v1/api/pet/lists/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API result:", data);
    
    // Handle the response structure from ProfileScreen
    let pets: any[] = [];
    if (data.petData && Array.isArray(data.petData)) {
      pets = data.petData;
    } else if (data.data && Array.isArray(data.data)) {
      pets = data.data;
    } else if (Array.isArray(data)) {
      pets = data;
    }

    console.log(`🐾 Found ${pets.length} pets`);

      // Transform and validate pet data
     const transformedPets = pets.map((pet: any, index: number) => {
      return {
        id: (pet.id || pet.pet_id || `pet_${index}`).toString(),
        name: pet.name || pet.pet_name || `Pet ${index + 1}`,
        pet_name: pet.pet_name || pet.name || `Pet ${index + 1}`, // Keep both for compatibility
        type: pet.type || pet.pet_type || pet.species || 'Unknown',
        breed: pet.breed || pet.pet_breed || 'Unknown',
        age: Math.max(0, parseInt(pet.age || pet.pet_age || '0') || 0),
      };
    });

    return transformedPets;

  } catch (error) {
    console.error('Error fetching pets data:', error);
    // Return empty array instead of mock data to match ProfileScreen behavior
    return [];
  }
};

// Enhanced doctor data fetching
 const fetchDoctorsData = async (): Promise<Doctor[]> => {
  console.log('👨‍⚕️ Starting fetchDoctorsData...');

 try {
    const token = await getAuthToken();
    if (!token) return getMockDoctorsData();

    // Ambil daftar doctorId dari janji terlebih dahulu (misal dari fetchReservationsData)
    const appointmentDoctorsIds = [8]; // Contoh ambil dari hasil janji
    
    // Gabungkan dengan doctorIds tetap kalau perlu
    const doctorId = Array.from(new Set([...appointmentDoctorsIds, 1]));

    const doctorIds = [7, 8,]; // contoh beberapa dokter

    const fetchDoctorById = async (id: number): Promise<Doctor | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/api/user/details/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`⚠️ Doctor with ID ${id} not found (404)`);
          } else {
            console.warn(`⚠️ Failed to fetch doctor with ID ${id}, status: ${response.status}`);
          }
          return null;
        }

        const doctor = await response.json();
        if (!doctor.is_doctor) {
          console.warn(`⚠️ User ID ${id} is not a doctor`);
          return null;
        }

        return {
          id: doctor.id,
          name: doctor.name || doctor.username || `Doctor ${id}`,
          email: doctor.email || '',
          username: doctor.username || `doctor${id}`,
          is_doctor: true,
          speciality: doctor.speciality || 'Dokter Hewan Umum',
          phone: doctor.phone || null,
        };
      } catch (err) {
        console.error(`❌ Error fetching doctor ID ${id}:`, err);
        return null;
      }
    };

      const doctorPromises = doctorIds.map(fetchDoctorById);
    const doctorResults = await Promise.all(doctorPromises);
    const validDoctors = doctorResults.filter((d): d is Doctor => d !== null);
    return validDoctors.length > 0 ? validDoctors : getMockDoctorsData();

  } catch (error) {
    console.error('Error fetching doctors data:', error);
    return getMockDoctorsData();
  }
};

  // Enhanced reservations data fetching with better logging
  const fetchReservationsData = async (): Promise<Reservation[]> => {
    console.log('📅 Starting fetchReservationsData...');
    try {
      const token = await getAuthToken();
      const userId = await getUserId();
      
      if (!token || !userId) {
        throw new Error('Authentication credentials not found');
      }

      // Updated to use the appointment API endpoint from paste.txt
      const response = await fetchWithTimeout(`${API_BASE_URL}/v1/api/appointment/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access forbidden. Please login again.');
        }
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();
      console.log('📄 Raw appointments response:', data);
      
      // Handle the appointments response structure
      let appointments: any[] = [];
      if (data.appointments && Array.isArray(data.appointments)) {
        appointments = data.appointments;
      } else if (Array.isArray(data)) {
        appointments = data;
      } else if (data.data && Array.isArray(data.data)) {
        appointments = data.data;
      }

      console.log(`📅 Found ${appointments.length} appointments`);

      // Transform appointments to reservations format
      const transformedReservations = appointments.map((appointment: any, index: number) => {
        console.log(`📅 Processing appointment ${index}:`, JSON.stringify(appointment, null, 2));
        
        return {
          id: (appointment.id || appointment.appointment_id || `res_${index}`).toString(),
          petName: appointment.pet_name || appointment.petName || 'Unknown Pet',
          gender: appointment.pet_gender || appointment.gender || 'Unknown',
          date: formatDate(appointment.date || appointment.appointment_date || new Date().toISOString()),
          time: formatTime(appointment.date || appointment.appointment_date || '09:00'),
          status: mapStatus(appointment.status || 'Pending'),
          doctorName: appointment.doctor_name || appointment.doctorName,
          notes: appointment.notes || '',
          originalDate: ''
        };
      });

      return transformedReservations;

    } catch (error) {
      console.error('Error fetching appointments data:', error);
      
      // Handle specific authentication errors
      if (error instanceof Error) {
        if (error.message.includes('Authentication required') || error.message.includes('Access forbidden')) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
              {
                text: 'Login',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }
              }
            ]
          );
        }
      }
      
      return [];
    }
  };


  const formatDate = (dateString: string): string => {
  if (!dateString) return 'Tanggal tidak ditentukan';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid';
    }
     // Mapping nama hari dalam bahasa Indonesia
    const dayNames = [
      'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];
    
    // Mapping nama bulan dalam bahasa Indonesia
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    
    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    const dayNumber = date.getDate();
    
    return `${dayName}, ${dayNumber} ${monthName}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Tanggal tidak valid';
  }
};

 const formatTime = (dateString: string): string => {
  if (!dateString) return 'Time not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    
    return `${displayHour.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

  const mapStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'completed': 'Selesai',
      'selesai': 'Selesai',
      'scheduled': 'Terjadwal', 
      'confirmed': 'Terjadwal',
      'terjadwal': 'Terjadwal',
      'pending': 'Menunggu',
      'menunggu': 'Menunggu',
      'cancelled': 'Ditolak',
      'ditolak': 'Ditolak',
    };
    
    return statusMap[status.toLowerCase()] || 'Menunggu';
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'Selesai': '#4CAF50',
      'Terjadwal': '#2196F3',
      'Menunggu': '#FFC107',
      'Ditolak': '#F44336',
    };
    
    return colorMap[status] || '#9E9E9E';
  };

  // Mock data for fallback (reduced for testing)
  const getMockPetsData = (): Pet[] => [
    { 
      id: '1',
      name: 'Arthur', 
      type: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
    }
  ];

  const getMockReservationsData = (): Reservation[] => [
    {
      id: '1',
      petName: 'Savannah',
      gender: 'Female',
      date: 'Tuesday, Dec 20',
      time: '09.00 AM',
      status: 'Terjadwal',
      originalDate: ''
    }
  ];

  const getMockDoctorsData = (): Doctor[] => [
    {
      id: 1,
      name: 'Dr. Teguh Prasetya',
      email: 'teguh@example.com',
      username: 'dr_teguh',
      is_doctor: true,
      speciality: 'Dokter Hewan Umum',
      phone: null,
    }
  ];

  // Main data loading function with better error handling
  const loadAllData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const token = await getAuthToken();
      const userId = await getUserId();
      
      console.log('🔧 LoadAllData - Credentials check:');
      console.log('- Token exists:', !!token);
      console.log('- Token length:', token?.length || 0);
      console.log('- UserId:', userId);
      
      if (!token || !userId) {
        console.log('⚠️ Missing auth credentials, redirecting to login...');
        
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'Login',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
        return;
      }
      
      // Load all data concurrently
      console.log('🔧 Starting concurrent data fetch...');
      const [userData, petsData, reservationsData, doctorIds] = await Promise.allSettled([
        fetchUserData(),
        fetchPetsData(),
        fetchReservationsData(),
        fetchDoctorsData()
      ]);

      console.log('📊 API Results:');
      console.log('- User data:', userData.status);
      console.log('- Pets data:', petsData.status);
      console.log('- Reservations data:', reservationsData.status);

      // Handle user data
      if (userData.status === 'fulfilled' && userData.value) {
        console.log('✅ Setting user data:', userData.value);
        setUser(userData.value);
      } else {
        console.log('❌ User data failed:', userData.status === 'rejected' ? userData.reason : 'No data');
        setUser({
          id: 1,
          name: 'Pengguna',
          email: '',
          username: 'Pengguna',
          is_doctor: false,
          speciality: null,
          phone: null,
        });
      }
      
      // Handle pets data
      if (petsData.status === 'fulfilled') {
        console.log('✅ Setting pets data:', petsData.value);
        // Always show API data if available, otherwise show mock data
        setPets(petsData.value.length > 0 ? petsData.value : getMockPetsData());
      } else {
        console.log('❌ Pets data failed:', petsData.status === 'rejected' ? petsData.reason : 'No data');
        setPets(getMockPetsData());
      }
      
      // Handle reservations data
      if (reservationsData.status === 'fulfilled') {
        console.log('✅ Setting reservations data:', reservationsData.value);
        // Always show API data if available, otherwise show mock data
        setReservations(reservationsData.value.length > 0 ? reservationsData.value : getMockReservationsData());
      } else {
        console.log('❌ Reservations data failed:', reservationsData.status === 'rejected' ? reservationsData.reason : 'No data');
        setReservations(getMockReservationsData());
      }
      
      if (doctorIds.status === 'fulfilled' && doctorIds.value) {
        console.log('✅ Setting doctors data:', doctorIds.value);
        setDoctors(doctorIds.value.length > 0 ? doctorIds.value : getMockDoctorsData());
    } else {
        console.log('❌ Doctors data failed:', doctorIds.status === 'rejected' ? doctorIds.reason : 'No data');
        setDoctors(getMockDoctorsData());
    }


    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Fallback to mock data only if there's a critical error
      setUser({
        id: 1,
        name: 'Pengguna',
        email: '',
        username: 'Pengguna',
        is_doctor: false,
        speciality: null,
        phone: null,
      });
      setPets(getMockPetsData());
      setReservations(getMockReservationsData());
      setDoctors(getMockDoctorsData());
      
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [navigation]);

  // Initial data loading
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData(true);
  }, [loadAllData]);

  const handlePetPress = useCallback((pet: Pet) => {
    console.log('Pet selected:', pet);
    //navigation.navigate('DetailPetScreen', { petId: pet.id });
  }, []);

  const handleReservationPress = useCallback((reservation: Reservation) => {
    console.log('Reservation selected:', reservation);
    // navigation.navigate('ReservationDetail', { reservationId: reservation.id });
  }, []);

  const handleReservationButton = useCallback(() => {
    navigation.navigate('Reservasi');
  }, [navigation]);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    console.log('Doctor selected:', doctor);
    // navigation.navigate('DoctorDetail', { doctorId: doctor.id });
  }, []);

  const handleViewReservations = useCallback(() => {
    navigation.navigate('ReservationList');
  }, [navigation]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadAllData(true);
      }
    }, [loading, loadAllData])
  );

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>
                Hallo, {user?.name || user?.username || 'Pengguna'}!
              </Text>
              <Text style={styles.subHeaderText}>
                {user?.is_doctor ? 'Selamat datang kembali, Dokter!' : 'Jangan lupa cek-up peliharaanmu!'}
              </Text>
              {user?.is_doctor && user?.speciality && (
                <Text style={styles.specialityText}>Spesialisasi: {user.speciality}</Text>
              )}
              {error && (
                <Text style={styles.errorText}>⚠️ {error}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Hero Section */}
        <ImageBackground 
          source={require('../../assets/hero-image.png')}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Pet Care,</Text>
            <Text style={styles.heroTitle}>Made Simple.</Text>
            <Text style={styles.heroDescription}>
              Reservasi dokter hewan lebih simpel —{'\n'}
              karena mereka layak yang terbaik.
            </Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={handleReservationButton}
              activeOpacity={0.8}
            >
              <Text style={styles.heroButtonText}>Reservasi sekarang</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

      <View style={styles.section}>
      <Text style={styles.sectionTitle}>Peliharaan Anda</Text>
      {pets.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petListContainer}
        >
          {pets.map((pet) => (
            <View key={pet.id} style={styles.petCard}>
              <MaterialIcons name="pets" size={32} color="#2196F3" />
              <Text style={styles.petName}>{pet.name}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="pets" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada peliharaan</Text>
          <TouchableOpacity 
            style={styles.addPetButton}
            onPress={() => console.log('Add pet pressed')}
            activeOpacity={0.8}
          >
            <Text style={styles.addPetButtonText}>Tambah Peliharaan</Text>
          </TouchableOpacity>
      </View>
    )}
  </View>

      {/* Reservations Section */}
        <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reservasi</Text>
          <TouchableOpacity
            style={styles.ViewAllButton}
            onPress={handleViewReservations}
            activeOpacity={0.8}
          >
        <Text style={styles.ViewAllButtonText}>Lihat Semua</Text>
      </TouchableOpacity>
    </View>
  
  {reservations.length > 0 ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.reservationsContainer}
    >
      {/* Tampilkan 3 reservasi yang paling dekat dengan deadline */}
      {[...reservations]
        .filter((reservation) => {
          // Filter hanya reservasi yang belum lewat dan belum selesai
          try {
            const reservationDate = reservation.originalDate || reservation.date;
            const reservationTime = reservation.time;
            
            // Function untuk parse tanggal Indonesia
            const parseIndonesianDate = (dateStr: string, timeStr?: string) => {
              // Map hari Indonesia ke Inggris
              const dayMap: { [key: string]: string } = {
                'Senin': 'Monday', 'Selasa': 'Tuesday', 'Rabu': 'Wednesday',
                'Kamis': 'Thursday', 'Jumat': 'Friday', 'Sabtu': 'Saturday', 'Minggu': 'Sunday'
              };
              
              // Map bulan Indonesia ke angka
              const monthMap: { [key: string]: number } = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
                'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
              };
              
              // Parse tanggal: "Senin, 30 Jun" -> 30 Jun 2025
              const dateMatch = dateStr.match(/\w+,\s*(\d+)\s*(\w+)/);
              if (!dateMatch) return null;
              
              const day = parseInt(dateMatch[1]);
              const month = monthMap[dateMatch[2]];
              const year = 2025; // Asumsikan tahun 2025
              
              if (month === undefined) return null;
              
              let date = new Date(year, month, day);
              
              // Parse waktu jika ada: "04.00 PM" -> 16:00
              if (timeStr) {
                const timeMatch = timeStr.match(/(\d+)\.(\d+)\s*(AM|PM)/);
                if (timeMatch) {
                  let hours = parseInt(timeMatch[1]);
                  const minutes = parseInt(timeMatch[2]);
                  const period = timeMatch[3];
                  
                  if (period === 'PM' && hours !== 12) hours += 12;
                  if (period === 'AM' && hours === 12) hours = 0;
                  
                  date.setHours(hours, minutes, 0, 0);
                }
              }
              
              return date;
            };
            
            const parsedDate = parseIndonesianDate(reservationDate, reservationTime);
            
            if (!parsedDate) {
              console.log('Could not parse date:', reservationDate, reservationTime);
              return reservation.status !== 'Selesai';
            }
            
            const now = new Date();
            console.log('DateTime comparison:', { 
              original: reservationDate + ' ' + reservationTime,
              parsed: parsedDate.toISOString(), 
              now: now.toISOString(),
              isAfter: parsedDate > now 
            });
            
            return parsedDate > now && reservation.status !== 'Selesai';
          } catch (error) {
            console.log('Error parsing date:', error);
            return reservation.status !== 'Selesai';
          }
        })
        .sort((a: any, b: any) => {
          // Sort berdasarkan tanggal dan waktu (yang paling dekat duluan)
          try {
            // Function helper untuk parse tanggal Indonesia (sama seperti di atas)
            const parseIndonesianDate = (dateStr: string, timeStr?: string) => {
              const dayMap: { [key: string]: string } = {
                'Senin': 'Monday', 'Selasa': 'Tuesday', 'Rabu': 'Wednesday',
                'Kamis': 'Thursday', 'Jumat': 'Friday', 'Sabtu': 'Saturday', 'Minggu': 'Sunday'
              };
              const monthMap: { [key: string]: number } = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
                'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
              };
              
              const dateMatch = dateStr.match(/\w+,\s*(\d+)\s*(\w+)/);
              if (!dateMatch) return null;
              
              const day = parseInt(dateMatch[1]);
              const month = monthMap[dateMatch[2]];
              const year = 2025;
              
              if (month === undefined) return null;
              
              let date = new Date(year, month, day);
              
              if (timeStr) {
                const timeMatch = timeStr.match(/(\d+)\.(\d+)\s*(AM|PM)/);
                if (timeMatch) {
                  let hours = parseInt(timeMatch[1]);
                  const minutes = parseInt(timeMatch[2]);
                  const period = timeMatch[3];
                  
                  if (period === 'PM' && hours !== 12) hours += 12;
                  if (period === 'AM' && hours === 12) hours = 0;
                  
                  date.setHours(hours, minutes, 0, 0);
                }
              }
              return date;
            };
            
            const dateA = parseIndonesianDate(a.originalDate || a.date, a.time);
            const dateB = parseIndonesianDate(b.originalDate || b.date, b.time);
            
            if (!dateA || !dateB) return 0;
            
            return dateA.getTime() - dateB.getTime();
          } catch (error) {
            console.log('Error sorting dates:', error);
            return 0;
          }
        })
        .slice(0, 3) // Ambil 3 reservasi yang paling dekat deadline
        .map((reservation: Reservation) => (
          <TouchableOpacity
            key={reservation.id}
            style={styles.reservationCard}
            onPress={() => handleReservationPress(reservation)}
            activeOpacity={0.8}
          >
            <View style={styles.reservationTopRow}>
              <View style={styles.reservationIconContainer}>
                <MaterialIcons name="pets" size={36} color="#2196F3" />
              </View>
              <View style={styles.reservationTextContainer}>
                <Text style={styles.reservationName} numberOfLines={1}>
                  {reservation.petName}
                </Text>
                <Text style={styles.reservationDoctorName}>
                  Dr. {reservation?.doctorName || reservation?.doctor_name || 'Unknown'}
                </Text>
                <View style={styles.reservationTimeContainer}>
                  <Text style={styles.reservationTimeLabel}>
                    {(() => {
                      try {
                        // Function helper untuk parse tanggal Indonesia
                        const parseIndonesianDate = (dateStr: string, timeStr?: string) => {
                          const monthMap: { [key: string]: number } = {
                            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
                            'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
                          };
              
                          const dateMatch = dateStr.match(/\w+,\s*(\d+)\s*(\w+)/);
                          if (!dateMatch) return null;
              
                          const day = parseInt(dateMatch[1]);
                          const month = monthMap[dateMatch[2]];
                          const year = 2025;
              
                          if (month === undefined) return null;
              
                          let date = new Date(year, month, day);
              
                          if (timeStr) {
                            const timeMatch = timeStr.match(/(\d+)\.(\d+)\s*(AM|PM)/);
                            if (timeMatch) {
                              let hours = parseInt(timeMatch[1]);
                              const minutes = parseInt(timeMatch[2]);
                              const period = timeMatch[3];
                          
                              if (period === 'PM' && hours !== 12) hours += 12;
                              if (period === 'AM' && hours === 12) hours = 0;
                          
                              date.setHours(hours, minutes, 0, 0);
                            }
                          }
                          return date;
                        };
                    
                        const reservationDate = reservation.originalDate || reservation.date;
                        const reservationTime = reservation.time;
                        const parsedDate = parseIndonesianDate(reservationDate, reservationTime);
                    
                        if (!parsedDate) return '';
                    
                        const now = new Date();
                        const timeDiff = parsedDate.getTime() - now.getTime();
                        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    
                        if (daysDiff === 0) return 'Hari ini';
                        if (daysDiff === 1) return 'Besok';
                        if (daysDiff > 1) return `${daysDiff} hari lagi`;
                        return `${Math.abs(daysDiff)} hari yang lalu`;
                      } catch (error) {
                        return '';
                      }
                    })()}
                  </Text>
                  <Text style={styles.reservationDateTime}>
                    {reservation.date} • {reservation.time}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
            </View>
          </TouchableOpacity>
        ))}
    </ScrollView>
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.errorText}>Tidak ada reservasi</Text>
    </View>
  )}
</View>

       {/* Doctors Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dokter Tersedia</Text>
        <View style={styles.doctorsContainer}>
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={styles.doctorCard}
                onPress={() => handleDoctorPress(doctor)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="medical-services" size={24} color="#008CFC" />
                <Text style={styles.doctorCard}>{doctor.name}</Text>

              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="medical-services" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Belum ada dokter tersedia</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  </View>
);
};
export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 32,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  specialityText: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    marginLeft: 16,
  },
  heroBackground: {
    height: 220,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroBackgroundImage: {
    opacity: 0.9,
  },
  heroOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
    textShadowColor: 'rgba(239, 240, 255, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }, 
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ViewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ViewAllButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  petsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  petListContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  petCard: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E6F3FE',
    borderRadius: 12,
  },
  petIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#008CFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  petType: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  emptyPetsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPetsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  addPetButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addPetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reservationsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 10,
  },
  reservationCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,  
    elevation: 3,
  },
  reservationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  // Updated: Change from reservationInfo to reservationTextContainer
  reservationTextContainer: {
    flex: 1,
  },
  reservationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // Added: Reservation doctor name style (same as reservation list)
  reservationDoctorName: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginTop: 2,
  },
  // Added: Notes style (same as reservation list)
  reservationNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Removed: reservationGender (not needed anymore)
  reservationBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  reservationTimeContainer: {
    alignItems: 'flex-start',
  },
  
  reservationTimeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  
  reservationDateTime: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '400',
  },

  datetimeContainer: {
    flex: 1,
  },
  reservationDate: {
    fontSize: 14,
    color: '#333',
  },
  reservationTime: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Added: Status badge style (same as reservation list)
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  doctorsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  doctorCard: {
    backgroundColor: '#E6F3FE',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  availableDoctorName: {
    marginTop: 8,
    fontWeight: '500',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
}); 