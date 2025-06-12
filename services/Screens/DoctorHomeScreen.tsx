
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  Alert,
  RefreshControl,
  ActivityIndicator, 
  GestureResponderEvent
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';

type DoctorHomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  is_doctor: boolean;
  speciality: string | null;
  phone: string | null;
}

interface Reservation {
  ownerName: string;
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

const DoctorHomeScreen: React.FC = () => {
  const navigation = useNavigation<DoctorHomeScreenNavigationProp>();
  
  // API Configuration
  const API_BASE_URL = 'https://noahvetcare.naufalalfa.com';
  const API_TIMEOUT = 10000;

  // State management
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data untuk fallback
  const getMockReservationsData = (): Reservation[] => [
    {
      id: '1',
      petName: 'Tia',
      gender: 'Female',
      date: 'Jumat, 13 Jun',
      time: '02.00 PM',
      status: 'Terjadwal',
      originalDate: '2024-12-20T09:00:00Z',
      ownerName: 'Ahmad Naufal'
    },
    {
      id: '2',
      petName: 'Raya',
      gender: 'Male',
      date: 'Rabu, 18 Jun',
      time: '01.00 PM',
      status: 'Menunggu',
      originalDate: '2024-12-20T10:00:00Z',
      ownerName: 'Ahmad Naufal'
    },
    {
      id: '3',
      petName: 'Dika',
      gender: 'Male',
      date: 'Minggu, 22 Jun',
      time: '09.00 AM',
      status: 'Terjadwal',
      originalDate: '2024-12-20T11:00:00Z',
      ownerName: 'Ahmad Naufal'
    }
  ];

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
        name: user.name || user.username || 'Doctor',
        email: user.email || '',
        username: user.username || user.name || 'doctor',
        is_doctor: user.is_doctor || true,
        speciality: user.speciality || 'Dokter Hewan Umum',
        phone: user.phone || null,
      };

    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  // Helper functions
  const mapStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'scheduled': 'Terjadwal',
      'confirmed': 'Terjadwal',
      'completed': 'Selesai',
      'pending': 'Menunggu',
      'cancelled': 'Dibatalkan',
      'rejected': 'Ditolak'
    };
    return statusMap[status.toLowerCase()] || 'Menunggu';
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'Selesai': '#4CAF50',
      'Terjadwal': '#2196F3',
      'Menunggu': '#FFC107',
      'Ditolak': '#F44336',
      'Dibatalkan': '#F44336',
    };
    return colorMap[status] || '#9E9E9E';
  };

  const getStatusBackgroundColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'Selesai': '#E8F5E8',
      'Terjadwal': '#E3F2FD',
      'Menunggu': '#FFF3CD',
      'Ditolak': '#FFEBEE',
      'Dibatalkan': '#FFEBEE',
    };
    return colorMap[status] || '#f5f5f5';
  };

  // Fungsi untuk parsing tanggal yang lebih robust
  const parseAppointmentDate = (dateStr: string): Date | null => {
    try {
      // Jika dateStr adalah format ISO 8601 (dari API)
      if (dateStr.includes('T') && (dateStr.includes('Z') || dateStr.includes('+'))) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Jika dateStr adalah format Indonesia (dari display)
      const dayMap: { [key: string]: string } = {
        'Senin': 'Monday', 'Selasa': 'Tuesday', 'Rabu': 'Wednesday',
        'Kamis': 'Thursday', 'Jumat': 'Friday', 'Sabtu': 'Saturday', 'Minggu': 'Sunday'
      };
      
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
        'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
      };
      
      const dateMatch = dateStr.match(/\w+,\s*(\d+)\s*(\w+)/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = monthMap[dateMatch[2]];
        const year = 2025;
        
        if (month !== undefined) {
          return new Date(year, month, day);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  // Function helper untuk parse tanggal Indonesia dengan waktu
  const parseIndonesianDate = (dateStr: string, timeStr?: string): Date | null => {
    try {
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
      const year = 2025;
      
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
    } catch (error) {
      console.error('Error parsing Indonesian date:', error);
      return null;
    }
  };

  // Fungsi untuk menghitung label waktu
  const getTimeLabel = (reservation: Reservation): string => {
    try {
      // Gunakan originalDate yang berformat ISO 8601
      const appointmentDate = parseAppointmentDate(reservation.originalDate);
      
      if (!appointmentDate) {
        // Fallback ke parsing tanggal Indonesia
        const fallbackDate = parseIndonesianDate(reservation.date, reservation.time);
        if (!fallbackDate) return '';
        
        const now = new Date();
        const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const appointmentStart = new Date(
          fallbackDate.getFullYear(), 
          fallbackDate.getMonth(), 
          fallbackDate.getDate()
        );
        
        const timeDiff = appointmentStart.getTime() - nowStart.getTime();
        const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) return 'Hari ini';
        if (daysDiff === 1) return 'Besok';
        if (daysDiff > 1) return `${daysDiff} hari lagi`;
        if (daysDiff === -1) return 'Kemarin';
        return `${Math.abs(daysDiff)} hari yang lalu`;
      }
      
      const now = new Date();
      const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const appointmentStart = new Date(
        appointmentDate.getFullYear(), 
        appointmentDate.getMonth(), 
        appointmentDate.getDate()
      );
      
      const timeDiff = appointmentStart.getTime() - nowStart.getTime();
      const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) return 'Hari ini';
      if (daysDiff === 1) return 'Besok';
      if (daysDiff > 1) return `${daysDiff} hari lagi`;
      if (daysDiff === -1) return 'Kemarin';
      return `${Math.abs(daysDiff)} hari yang lalu`;
      
    } catch (error) {
      console.error('Error calculating time label:', error);
      return '';
    }
  };

  // Fetch appointments function
  const fetchAppointments = async (): Promise<Reservation[]> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');
      
      if (!token || !userId) {
        throw new Error('Authentication credentials not found');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/v1/api/appointment/doctor/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const appointmentsData = await response.json();
      console.log('📅 API Response:', appointmentsData);
      
      const appointments = appointmentsData.appointments || [];

      return appointments.map((appointment: any) => {
        // Parse tanggal ISO 8601
        const appointmentDate = new Date(appointment.date);
        
        // Pastikan tanggal valid
        if (isNaN(appointmentDate.getTime())) {
          console.error('Invalid date:', appointment.date);
          const fallbackDate = new Date();
          
          const dateStr = fallbackDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            timeZone: 'Asia/Jakarta'
          });
          
          const timeStr = fallbackDate.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Jakarta'
          });

          return {
            id: appointment.appointment_id?.toString() || `temp-${Date.now()}`,
            petName: appointment.pet_name || 'Unknown Pet',
            ownerName: appointment.owner_name || 'Unknown Owner', 
            date: dateStr,
            time: timeStr,
            status: mapStatus(appointment.status || 'pending'),
            gender: appointment.pet_gender || 'Unknown',
            originalDate: appointment.date,
            doctorName: appointment.doctor_name,
            notes: appointment.notes || ''
          };
        }
        
        // Format tanggal Indonesia dengan timezone yang benar
        const dateStr = appointmentDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          timeZone: 'Asia/Jakarta'
        });
        
        const timeStr = appointmentDate.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Jakarta'
        });

        return {
          id: appointment.appointment_id?.toString() || `temp-${Date.now()}`,
          petName: appointment.pet_name || 'Unknown Pet',
          ownerName: appointment.owner_name || 'Unknown Owner', 
          date: dateStr,
          time: timeStr,
          status: mapStatus(appointment.status || 'pending'),
          gender: appointment.pet_gender || 'Unknown',
          originalDate: appointment.date,
          doctorName: appointment.doctor_name,
          notes: appointment.notes || ''
        };
      });

    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      throw error;
    }
  };

  // Filter upcoming reservations
  const filterUpcomingReservations = (reservations: Reservation[]) => {
    return reservations
      .filter((reservation) => {
        try {
          // Dapatkan waktu sekarang dalam timezone Indonesia
          const now = new Date();

          let appointmentDateTime: Date | null = null;

          // Coba parse dari originalDate (format ISO 8601)
          if (reservation.originalDate) {
            appointmentDateTime = new Date(reservation.originalDate);
            // Pastikan tanggal valid
            if (isNaN(appointmentDateTime.getTime())) {
              appointmentDateTime = null;
            }
          }

          // Jika gagal, coba parse dari format Indonesia
          if (!appointmentDateTime) {
            appointmentDateTime = parseIndonesianDateImproved(reservation.date, reservation.time);
          }

          if (!appointmentDateTime) {
            // Jika tidak bisa parse tanggal, hanya tampilkan yang statusnya bukan 'Selesai'
            return reservation.status !== 'Selesai' && reservation.status !== 'Dibatalkan';
          }

          // Bandingkan dengan waktu sekarang
          // Untuk appointment yang sudah lewat lebih dari 2 jam, jangan tampilkan
          const timeDifference = appointmentDateTime.getTime() - now.getTime();
          const hoursDifference = timeDifference / (1000 * 60 * 60);

          // Reservasi dianggap upcoming jika:
          // 1. Masih di masa depan ATAU baru lewat kurang dari 2 jam (untuk handling buffer)
          // 2. Status bukan 'Selesai' atau 'Dibatalkan'
          const isUpcoming = hoursDifference > -2; // Lewat kurang dari 2 jam masih ok
          const isValidStatus = reservation.status !== 'Selesai' && reservation.status !== 'Dibatalkan';

          console.log(`Reservation ${reservation.petName}:`, {
            appointmentTime: appointmentDateTime.toISOString(),
            currentTime: now.toISOString(),
            hoursDifference: Math.round(hoursDifference * 100) / 100,
            isUpcoming,
            isValidStatus,
            status: reservation.status,
            willShow: isUpcoming && isValidStatus
          });

          return isUpcoming && isValidStatus;

        } catch (error) {
          console.error('Error filtering reservation:', error);
          // Fallback: tampilkan jika statusnya bukan 'Selesai' atau 'Dibatalkan'
          return reservation.status !== 'Selesai' && reservation.status !== 'Dibatalkan';
        }
      })
      .sort((a, b) => {
        try {
          let dateA = null;
          let dateB = null;

          // Parse tanggal A
          if (a.originalDate) {
            dateA = new Date(a.originalDate);
            if (isNaN(dateA.getTime())) {
              dateA = parseIndonesianDateImproved(a.date, a.time);
            }
          } else {
            dateA = parseIndonesianDateImproved(a.date, a.time);
          }

          // Parse tanggal B
          if (b.originalDate) {
            dateB = new Date(b.originalDate);
            if (isNaN(dateB.getTime())) {
              dateB = parseIndonesianDateImproved(b.date, b.time);
            }
          } else {
            dateB = parseIndonesianDateImproved(b.date, b.time);
          }

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error('Error sorting reservations:', error);
          return 0;
        }
      });
  };

  // Tambahkan juga fungsi helper yang lebih robust untuk parsing tanggal Indonesia
  const parseIndonesianDateImproved = (dateStr: string, timeStr?: string): Date | null => {
    try {
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

      // Gunakan tahun yang lebih dinamis
      const currentYear = new Date().getFullYear();
      const year = currentYear; // atau currentYear + 1 jika needed

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
      } else {
        // Set default time ke 12:00 jika tidak ada waktu
        date.setHours(12, 0, 0, 0);
      }

      return date;
    } catch (error) {
      console.error('Error parsing Indonesian date:', error);
      return null;
    }
  };

  // Update fungsi getTimeLabel untuk lebih akurat
  const getTimeLabelImproved = (reservation: Reservation): string => {
    try {
      // Gunakan originalDate yang berformat ISO 8601
      let appointmentDate = parseAppointmentDate(reservation.originalDate);

      if (!appointmentDate) {
        // Fallback ke parsing tanggal Indonesia yang diperbaiki
        appointmentDate = parseIndonesianDateImproved(reservation.date, reservation.time);
        if (!appointmentDate) return '';
      }

      const now = new Date();
      const currentTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

      // Hitung selisih dalam milidetik
      const timeDiff = appointmentDate.getTime() - currentTime.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));

      // Jika kurang dari 24 jam
      if (Math.abs(timeDiff) < 24 * 60 * 60 * 1000) {
        if (hoursDiff >= 0 && hoursDiff < 2) return 'Segera';
        if (hoursDiff >= 0) return `${hoursDiff} jam lagi`;
        if (hoursDiff >= -2) return 'Baru saja';
        return 'Hari ini';
      }

      // Untuk hari-hari
      if (daysDiff === 0) return 'Hari ini';
      if (daysDiff === 1) return 'Besok';
      if (daysDiff > 1) return `${daysDiff} hari lagi`;
      if (daysDiff === -1) return 'Kemarin';
      return `${Math.abs(daysDiff)} hari yang lalu`;

    } catch (error) {
      console.error('Error calculating time label:', error);
      return '';
    }
  };

  // Main load data function
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user data
      let userData: User | null = null;
      try {
        userData = await fetchUserData();
        setUser(userData);
      } catch (userError) {
        console.log('Using fallback user data');
        setUser({
          id: 1,
          name: 'Doctor',
          email: '',
          username: 'doctor',
          is_doctor: true,
          speciality: 'Dokter Hewan Umum',
          phone: null
        });
      }

      // Load appointments data
      try {
        const appointmentsData = await fetchAppointments();
        setReservations(appointmentsData);
      } catch (appointmentsError) {
        console.log('Using mock data for appointments');
        setReservations(getMockReservationsData());
      }

    } catch (error) {
      setError('Terjadi kesalahan saat memuat data');
      setReservations(getMockReservationsData());
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleViewAllReservations = useCallback((event: GestureResponderEvent) => {
    try {
      navigation.navigate('DoctorTabs' as any, { screen: 'DoctorReservations' });
    } catch (error) {
      console.log('Navigation error (silent):', error);
    }
  }, [navigation]);

  const handleReservationPress = useCallback((reservation: Reservation) => {
    try {
      navigation.navigate('DetailReservation', {
        reservationId: reservation.id,
        reservationData: reservation
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Tidak dapat membuka detail reservasi');
    }
  }, [navigation]);

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Show loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Get upcoming reservations for display
  const upcomingReservations = filterUpcomingReservations(reservations).slice(0, 3);

  // Main render
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
                Hallo, {user?.name || 'Anne'}!
              </Text>
              <Text style={styles.subHeaderText}>
                Selamat datang kembali dokter
              </Text>
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
              Kelola jadwal pasien dengan mudah dan efisien
            </Text>
          </View>
        </ImageBackground>

        {/* Upcoming Appointments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jadwal Mendatang</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleViewAllReservations}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllButtonText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
        
          {upcomingReservations.length > 0 ? (
            <View style={styles.reservationsContainer}>
              {upcomingReservations.map((reservation) => (
                <TouchableOpacity
                  key={reservation.id}
                  style={styles.reservationCard}
                  // onPress={() => handleReservationPress(reservation)}
                  activeOpacity={0.8}
                >
                  <View style={styles.reservationContent}>
                    <View style={styles.reservationHeader}>
                      <View style={styles.petIconContainer}>
                        <MaterialIcons name="pets" size={28} color="#2196F3" />
                      </View>
                      <View style={styles.reservationInfo}>
                        <Text style={styles.petName} numberOfLines={1}>
                          {reservation.petName}
                        </Text>
                        <Text style={styles.ownerName} numberOfLines={1}>
                          {reservation.ownerName}
                        </Text>
                        <Text style={styles.timeLabel}>
                          {getTimeLabel(reservation)}
                        </Text>
                      </View>
                      <View style={styles.statusContainer}>
                        <View style={[
                          styles.statusBadge, 
                          { backgroundColor: getStatusBackgroundColor(reservation.status) }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(reservation.status) }
                          ]}>
                            {reservation.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.appointmentDetails}>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="calendar-today" size={16} color="#666" />
                        <Text style={styles.detailText}>{reservation.date}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="access-time" size={16} color="#666" />
                        <Text style={styles.detailText}>{reservation.time}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Tidak ada reservasi mendatang</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DoctorHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  heroBackground: {
    height: 200,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroBackgroundImage: {
    opacity: 0.9,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginTop: 12,
    lineHeight: 22,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f8ff',
  },
  viewAllButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  reservationsContainer: {
    gap: 12,
  }, 
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  reservationContent: {
    flex: 1,
  },
  reservationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  petIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reservationInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
}); 
 