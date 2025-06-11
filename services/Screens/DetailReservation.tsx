import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReservationDetailProps {
  route?: {
    params?: {
      reservationId?: string;
      appointmentId?: string;
      reservation?: ReservationData;
      reservationData?: any;
      appointmentData?: any;
      fromReservasiList?: boolean;
    };
  };
  navigation?: any;
}

interface ReservationData {
  id: string;
  petName: string;
  petId?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  doctorName: string;
  date: string;
  time: string;
  notes: string;
  petSpecies?: string;
  petBreed?: string;
  petAge?: string;
  medicalNotes?: string;
  phone?: string;
  ageInMonths?: number;
  lastVisit?: string;
  nextAppointment?: string;
}

interface ApiResponse {
  appointment_id: string;
  pet_id: string;
  doctor_id: string;
  date: string;
  status?: 'scheduled' | 'completed' | 'canceled' | 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
  pet_name?: string;
  doctor_name?: string;
  pet_species?: string;
  pet_breed?: string;
  pet_age?: string;
  phone?: string;
  last_visit?: string;
  next_appointment?: string;
}

interface PetApiResponse {
  pet_name: string;
  species: string;
  breed: string;
  age: number;
  medical_history: string;
  phone?: string;
  status?: 'healthy' | 'needs_attention' | 'critical';
  lastVisit?: string;
  nextAppointment?: string;
}

interface DoctorApiResponse {
  doctor_id: string;
  name: string;
  specialization?: string;
  phone?: string;
  email?: string;
}

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
    case 'Scheduled': return { color: '#27AE60', text: 'Terjadwal', bgColor: '#E8F5E8' };
    case 'Completed': return { color: '#F39C12', text: 'Selesai', bgColor: '#FDF2E5' };
    case 'Cancelled': return { color: '#E74C3C', text: 'Dibatalkan', bgColor: '#FDEDEC' };
    default: return { color: '#7F8C8D', text: 'Tidak Diketahui', bgColor: '#F8F9FA' };
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Tidak tersedia';
  try {
    // Handle both ISO string and already formatted dates
    if (dateString.includes('T') || dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
    return dateString; // Return as-is if already formatted
  } catch {
    return dateString;
  }
};

const formatTime = (dateString?: string): string => {
  if (!dateString) return 'Tidak tersedia';
  try {
    // Handle both ISO string and already formatted times
    if (dateString.includes('T') || dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return dateString; // Return as-is if already formatted (like "01.00 PM")
  } catch {
    return dateString;
  }
};

const ReservationDetail: React.FC<ReservationDetailProps> = ({ route, navigation }) => {
  const { 
    reservationId, 
    appointmentId, 
    reservation: fallbackReservation, 
    reservationData,
    appointmentData, 
    fromReservasiList 
  } = route?.params || {};

  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [petDetailsLoading, setPetDetailsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const currentId = reservationId || appointmentId;
  const currentData = reservationData || appointmentData;

  // Enhanced logging function
  const logDebug = (message: string, data?: any) => {
    console.log(`[ReservationDetail] ${message}`, data || '');
    setDebugInfo(prev => `${prev}\n${message}: ${JSON.stringify(data || {}, null, 2)}`);
  };

  // Enhanced API call with better error handling and logging
  const makeApiCall = async (url: string, errorContext: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      logDebug(`Making API call to: ${url}`);
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
      });

      logDebug(`API Response Status: ${response.status} for ${errorContext}`);

      if (!response.ok) {
        const errorText = await response.text();
        logDebug(`API Error Response: ${errorText} for ${errorContext}`);
        throw new Error(`${errorContext} failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      logDebug(`API Success Response for ${errorContext}:`, data);
      return data;
    } catch (error) {
      logDebug(`API Call Error for ${errorContext}:`, error);
      throw error;
    }
  };

  // Enhanced fetchPetDetail with better logging
  const fetchPetDetail = async (petId: string): Promise<PetApiResponse | null> => {
    try {
      logDebug(`Fetching pet details for petId: ${petId}`);
      
      const petData = await makeApiCall(
        `https://noahvetcare.naufalalfa.com/v1/api/pet/detail/${petId}`,
        'Pet detail fetch'
      );
      
      return petData;
    } catch (error) {
      logDebug('Error fetching pet detail:', error);
      return null;
    }
  };

  // NEW: Fetch doctor details
  const fetchDoctorDetail = async (doctorId: string): Promise<DoctorApiResponse | null> => {
    try {
      logDebug(`Fetching doctor details for doctorId: ${doctorId}`);
      
      const doctorData = await makeApiCall(
        `https://noahvetcare.naufalalfa.com/v1/api/doctor/detail/${doctorId}`,
        'Doctor detail fetch'
      );
      
      return doctorData;
    } catch (error) {
      logDebug('Error fetching doctor detail:', error);
      return null;
    }
  };

  // Enhanced fetchAppointmentDetail with better error handling and doctor fetching
  const fetchAppointmentDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      logDebug(`Fetching appointment detail for ID: ${id}`);

      const data: ApiResponse = await makeApiCall(
        `https://noahvetcare.naufalalfa.com/v1/api/appointment/details/${id}`,
        'Appointment detail fetch'
      );

      const mapApiStatusToDisplayStatus = (apiStatus: string): 'Scheduled' | 'Completed' | 'Cancelled' => {
        const status = apiStatus.toLowerCase();
        switch (status) {
          case 'scheduled': return 'Scheduled';
          case 'completed': return 'Completed';
          case 'canceled': 
          case 'cancelled': return 'Cancelled';
          default: return 'Scheduled';
        }
      };

      // Fetch doctor details if available
      let doctorName = data.doctor_name || 'Dr. Tidak Diketahui';
      if (data.doctor_id && !data.doctor_name) {
        logDebug(`Fetching doctor name for doctor_id: ${data.doctor_id}`);
        try {
          const doctorDetail = await fetchDoctorDetail(data.doctor_id);
          if (doctorDetail?.name) {
            doctorName = doctorDetail.name.startsWith('Dr.') ? doctorDetail.name : `Dr. ${doctorDetail.name}`;
          }
        } catch (error) {
          logDebug('Failed to fetch doctor details:', error);
        }
      }

      const mappedReservation: ReservationData = {
        id: data.appointment_id,
        petId: data.pet_id,
        petName: data.pet_name || 'Hewan Tidak Diketahui',
        status: mapApiStatusToDisplayStatus(data.status || 'scheduled'),
        doctorName: doctorName,
        date: formatDate(data.date),
        time: formatTime(data.date),
        notes: data.notes || 'Tidak ada catatan',
        petSpecies: data.pet_species || 'Tidak Diketahui',
        petBreed: data.pet_breed || 'Tidak Diketahui',
        petAge: data.pet_age || 'Tidak Diketahui',
        medicalNotes: data.notes || 'Tidak ada catatan medis',
        phone: data.phone || 'Tidak tersedia',
        lastVisit: data.last_visit,
        nextAppointment: data.next_appointment,
      };

      logDebug('Mapped reservation data:', mappedReservation);
      setReservation(mappedReservation);

      // Try to fetch additional pet details if we have petId
      if (data.pet_id) {
        await enrichReservationWithPetDetails(mappedReservation);
      }

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui';
      logDebug('Fetch appointment detail error:', msg);
      setError(msg);
      Alert.alert('Error', msg, [
        { text: 'Coba Lagi', onPress: () => fetchAppointmentDetail(id) },
        { text: 'Kembali', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced data conversion with better pet detail fetching and preserved original data
  const convertReservationDataFromParams = async (data: any): Promise<ReservationData> => {
    logDebug('Converting reservation data from params:', data);
    
    let petDetails = null;
    let completeAppointmentData = null;
    let doctorDetails = null;
    
    // Try to get complete appointment data first
    const appointmentId = data.id || data.appointment_id;
    if (appointmentId) {
      logDebug(`Attempting to fetch complete appointment data for ID: ${appointmentId}`);
      setPetDetailsLoading(true);
      
      try {
        completeAppointmentData = await makeApiCall(
          `https://noahvetcare.naufalalfa.com/v1/api/appointment/details/${appointmentId}`,
          'Complete appointment data fetch'
        );
      } catch (error) {
        logDebug('Failed to fetch complete appointment data:', error);
      }
      
      setPetDetailsLoading(false);
    }

    // Use complete appointment data if available, otherwise use params data
    const sourceData = completeAppointmentData || data;
    const possiblePetId = sourceData.pet_id || sourceData.petId;
    const possibleDoctorId = sourceData.doctor_id || sourceData.doctorId;
    
    // Try to fetch pet details if we have a pet ID
    if (possiblePetId) {
      logDebug(`Attempting to fetch pet details for petId: ${possiblePetId}`);
      setPetDetailsLoading(true);
      petDetails = await fetchPetDetail(possiblePetId);
      setPetDetailsLoading(false);
    }

    // Try to fetch doctor details if we have a doctor ID and no doctor name
    let finalDoctorName = data.doctorName || sourceData.doctor_name || 'Dr. Tidak Diketahui';
    if (possibleDoctorId && (!sourceData.doctor_name && !data.doctorName)) {
      logDebug(`Attempting to fetch doctor details for doctorId: ${possibleDoctorId}`);
      setPetDetailsLoading(true);
      try {
        doctorDetails = await fetchDoctorDetail(possibleDoctorId);
        if (doctorDetails?.name) {
          finalDoctorName = doctorDetails.name.startsWith('Dr.') ? doctorDetails.name : `Dr. ${doctorDetails.name}`;
        }
      } catch (error) {
        logDebug('Failed to fetch doctor details in conversion:', error);
      }
      setPetDetailsLoading(false);
    }

    // Preserve original formatted data when possible, use API data as fallback
    const finalReservation: ReservationData = {
      id: sourceData.appointment_id || sourceData.id || appointmentId || '',
      petName: petDetails?.pet_name || sourceData.pet_name || data.petName || 'Hewan Tidak Diketahui',
      petId: possiblePetId,
      status: data.status === 'Terjadwal' ? 'Scheduled' : 
              data.status === 'Selesai' ? 'Completed' : 
              data.status === 'Dibatalkan' ? 'Cancelled' : 
              sourceData.status === 'scheduled' ? 'Scheduled' :
              sourceData.status === 'completed' ? 'Completed' :
              sourceData.status === 'canceled' ? 'Cancelled' :
              sourceData.status === 'Scheduled' ? 'Scheduled' :
              sourceData.status === 'Completed' ? 'Completed' :
              sourceData.status === 'Cancelled' ? 'Cancelled' : 'Scheduled',
      doctorName: finalDoctorName,
      // Preserve original formatted date/time if available, otherwise format from API
      date: data.date || formatDate(sourceData.date) || 'Tidak tersedia',
      time: data.time || formatTime(sourceData.date) || 'Tidak tersedia',
      notes: sourceData.notes || data.notes || 'Tidak ada catatan',
      petSpecies: petDetails?.species || sourceData.pet_species || data.petSpecies || 'Tidak Diketahui',
      petBreed: petDetails?.breed || sourceData.pet_breed || data.petBreed || 'Tidak Diketahui',
      petAge: petDetails?.age ? (typeof petDetails.age === 'number' ? formatAge(petDetails.age) : String(petDetails.age)) : 
               sourceData.pet_age || data.petAge || 'Tidak Diketahui',
      phone: (petDetails?.phone && petDetails.phone.trim()) || sourceData.phone || data.phone || 'Tidak tersedia',
      lastVisit: sourceData.last_visit || data.lastVisit,
      nextAppointment: sourceData.next_appointment || data.nextAppointment,
    };

    logDebug('Final converted reservation data:', finalReservation);
    return finalReservation;
  };

  // Enhanced pet detail enrichment
  const enrichReservationWithPetDetails = async (reservationData: ReservationData) => {
    if (reservationData.petId && 
        (reservationData.petSpecies === 'Tidak Diketahui' || 
         reservationData.petBreed === 'Tidak Diketahui' || 
         reservationData.petAge === 'Tidak Diketahui' ||
         reservationData.phone === 'Tidak tersedia')) {
      
      logDebug(`Enriching pet details for petId: ${reservationData.petId}`);
      setPetDetailsLoading(true);
      
      const petDetails = await fetchPetDetail(reservationData.petId);
      
      if (petDetails) {
        logDebug('Enriching reservation with pet details:', petDetails);
        setReservation(prevReservation => ({
          ...prevReservation!,
          petSpecies: petDetails.species || prevReservation!.petSpecies,
          petBreed: petDetails.breed || prevReservation!.petBreed,
          petAge: petDetails.age ? (typeof petDetails.age === 'number' ? formatAge(petDetails.age) : String(petDetails.age)) : prevReservation!.petAge,
          phone: (petDetails.phone && petDetails.phone.trim()) || prevReservation!.phone,
        }));
      } else {
        logDebug('No pet details received for enrichment');
      }
      
      setPetDetailsLoading(false);
    }
  };

  const handleNavigateToPetDetail = () => {
    if (reservation?.petId && reservation?.petName) {
      logDebug(`Navigating to pet detail with petId: ${reservation.petId}`);
      navigation.navigate('DetailPetScreen', {
        petId: reservation.petId,
        petName: reservation.petName,
      });
    } else {
      Alert.alert('Info', 'Data hewan peliharaan tidak lengkap untuk navigasi');
    }
  };

  // Enhanced useEffect with better error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        logDebug('Starting data load process');
        logDebug('Current ID:', currentId);
        logDebug('Current Data:', currentData);
        logDebug('Fallback Reservation:', fallbackReservation);

        if (currentData) {
          logDebug('Using data from parameters');
          setLoading(true);
          const convertedData = await convertReservationDataFromParams(currentData);
          setReservation(convertedData);
          setLoading(false);
          
        } else if (fallbackReservation) {
          logDebug('Using fallback reservation data');
          setReservation(fallbackReservation);
          setLoading(false);
          await enrichReservationWithPetDetails(fallbackReservation);
          
        } else if (currentId) {
          logDebug('Fetching from API with ID');
          await fetchAppointmentDetail(currentId);
        } else {
          logDebug('No data source available');
          setError('Data reservasi tidak tersedia');
          setLoading(false);
        }
      } catch (error) {
        logDebug('Error in loadData:', error);
        setError('Terjadi kesalahan saat memuat data');
        setLoading(false);
      }
    };

    loadData();
  }, [currentId, currentData, fallbackReservation]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Memuat data reservasi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={60} color="#f44336" />
          <Text style={styles.errorText}>Terjadi Kesalahan</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => currentId && fetchAppointmentDetail(currentId)}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
          {__DEV__ && (
            <ScrollView style={styles.debugContainer}>
              <Text style={styles.debugText}>{debugInfo}</Text>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // No data state
  if (!reservation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Data reservasi tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const speciesIcon = getSpeciesIcon(reservation.petSpecies || '');
  const statusInfo = getStatusInfo(reservation.status);

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
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reservasi Anda</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Loading indicator for pet details */}
          {petDetailsLoading && (
            <View style={styles.petDetailsLoadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.petDetailsLoadingText}>Memuat detail...</Text>
            </View>
          )}
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pet Avatar and Name */}
        <View style={styles.petSection}>
          <View style={styles.petAvatar}>
            <Ionicons name="paw" size={32} color="#2196F3" />
          </View>
          <Text style={styles.petName}>{reservationData.petName}</Text>
        </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>

          {/* Reservation Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dokter</Text>
              <Text style={styles.detailValue}>{reservation.doctorName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal Reservasi</Text>
              <Text style={styles.detailValue}>{reservation.date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Waktu Reservasi</Text>
              <Text style={styles.detailValue}>{reservation.time}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>catatan</Text>
              <Text style={styles.detailValue}>{reservation.notes}</Text>
            </View>
            
             {/* Pet Information */}
              <View style={styles.petInfoContainer}>
              {/* Species */}
                <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Spesies</Text>
                <Text style={styles.detailValue}>{reservation.petSpecies}</Text>
                </View>

              {/* Breed */}
                <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Jenis</Text>
                <Text style={styles.detailValue}>{reservation.petBreed}</Text>
              </View>

              {/* Age */}
                <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Usia</Text>
                <Text style={styles.detailValue}>{reservation.petAge}</Text>
              </View>
            </View>
  
            <View style={styles.medicalNotesContainer}>
              <Text style={styles.medicalNotesTitle}>Catatan Medis</Text>
              <Text style={[styles.detailValue, styles.medicalNotesText]}>{reservation.notes}</Text>
            </View>
          </View>
        </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  petSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  petAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  petDetailsLoadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  petDetailsLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
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
   petInfoContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  petIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
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
  debugContainer: {
    marginTop: 20,
    maxHeight: 200,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
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
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16, 
  },
  disabledButtonText: {
    color: '#888888',
  },
   medicalNotesContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  medicalNotesTitle: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  medicalNotesText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
});

export default ReservationDetail;