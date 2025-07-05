import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';

// Type definitions
type ReservationStatus = 'Terjadwal' | 'Menunggu' | 'Ditolak' | 'Selesai';

interface ReservationItem {
  id: string;
  petName: string;
  ownerName: string;
  date: string;
  time: string;
  status: ReservationStatus;
  notes?: string;
}

interface DoctorInfo {
  id: string;
  name: string;
  specialization?: string;
  email?: string;
}

type DoctorReservationsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorReservations'>;

// API Configuration
const API_BASE_URL = 'https://noahvetcare.naufalalfa.com/v1/api';

// Local storage key for status updates
const STATUS_UPDATES_KEY = 'doctor_status_updates';

// API service functions
const appointmentAPI = {
  getDoctorAppointments: async (UserID: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching appointments for doctor ID:', UserID);
      
      const response = await fetch(`${API_BASE_URL}/appointment/doctor/${UserID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API Response status:', response.status);

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
      console.log('API Response data:', data);
      return data.appointments || data.data || data || [];
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }
  },

  // Get doctor info from doctor list
  getDoctorInfo: async (userId: string): Promise<DoctorInfo | null> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching doctor info for ID:', userId);
      
      const response = await fetch(`${API_BASE_URL}/v1/api/user/details/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch doctor list:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('Doctor list response:', data);
      
      const doctors = data.doctors || data.data || data || [];
      
      if (!Array.isArray(doctors)) {
        console.warn('Doctors data is not an array:', doctors);
        return null;
      }

      const doctor = doctors.find((doc: any) => 
        doc.id?.toString() === userId || 
        doc.doctor_id?.toString() === userId ||
        doc.user_id?.toString() === userId
      );

      if (doctor) {
        return {
          id: doctor.id?.toString() || doctor.doctor_id?.toString() || userId,
          name: doctor.name || doctor.doctor_name || doctor.full_name || 'Dr. Unknown',
          specialization: doctor.specialization || doctor.specialty || '',
          email: doctor.email || ''
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching doctor info:', error);
      return null;
    }
  },

  // Real API update (COMMENTED OUT - backend endpoint not ready yet)
  
  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/appointment/update/update/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update appointment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },
  

  // Store status updates locally only (backend endpoint not ready yet)
  updateAppointmentStatusLocal: async (appointmentId: string, status: string) => {
    try {
      // Get existing status updates
      const existingUpdates = await AsyncStorage.getItem(STATUS_UPDATES_KEY);
      const updates = existingUpdates ? JSON.parse(existingUpdates) : {};
      
      // Store the new status
      updates[appointmentId] = {
        status,
        timestamp: new Date().toISOString(),
        synced: false // Mark as not synced to backend (backend endpoint not ready yet)
      };
      
      // Save back to storage
      await AsyncStorage.setItem(STATUS_UPDATES_KEY, JSON.stringify(updates));
      
      console.log(`Status updated locally for appointment ${appointmentId}: ${status}`);
      return { success: true, message: 'Status updated locally (backend endpoint not ready yet)' };
    } catch (error) {
      console.error('Error updating status locally:', error);
      throw error;
    }
  },

  // Get local status updates
  getLocalStatusUpdates: async () => {
    try {
      const existingUpdates = await AsyncStorage.getItem(STATUS_UPDATES_KEY);
      return existingUpdates ? JSON.parse(existingUpdates) : {};
    } catch (error) {
      console.error('Error getting local status updates:', error);
      return {};
    }
  },

  // Clear local status updates (for when backend endpoint becomes available)
  clearLocalStatusUpdates: async () => {
    try {
      await AsyncStorage.removeItem(STATUS_UPDATES_KEY);
      console.log('Local status updates cleared');
    } catch (error) {
      console.error('Error clearing local status updates:', error);
    }
  }
};

// Helper functions
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Tanggal tidak ditentukan';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid';
    }
    
    const dayNames = [
      'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];

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
  if (!dateString) return 'Waktu tidak ditentukan';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Waktu tidak valid';
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}.${minutes}`; // Example: 14.30
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Waktu tidak valid';
  }
};

const mapStatus = (backendStatus: string): ReservationStatus => {
  if (!backendStatus) return 'Menunggu';
  
  const statusMap: { [key: string]: ReservationStatus } = {
    'Scheduled': 'Terjadwal',
    'Pending': 'Menunggu', 
    'Confirmed': 'Terjadwal',
    'Completed': 'Selesai',
    'Cancelled': 'Ditolak',
    'Rejected': 'Ditolak',
  };
  
  return statusMap[backendStatus] || 'Menunggu';
};

// Transform backend data to frontend format
const transformAppointmentData = (appointmentData: any, localStatusUpdates: any = {}): ReservationItem => {
  const appointmentId = appointmentData.appointment_id?.toString() || 
                       appointmentData.id?.toString() || 
                       Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  // Check if there's a local status update
  const localUpdate = localStatusUpdates[appointmentId];
  const finalStatus = localUpdate ? mapStatus(localUpdate.status) : mapStatus(appointmentData.status);
  
  return {
    id: appointmentId,
    petName: appointmentData.pet_name || appointmentData.petName || 'Unknown Pet',
    ownerName: appointmentData.owner_name || 
               appointmentData.user_name || 
               appointmentData.ownerName || 
               'Unknown Owner',
    date: formatDate(appointmentData.date || appointmentData.appointment_date),
    time: formatTime(appointmentData.date || appointmentData.appointment_date),
    status: finalStatus,
    notes: appointmentData.notes || appointmentData.description || '',
  };
};

// Utility function to safely decode JWT token
const decodeJWT = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Decoded JWT payload:', payload);
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const DoctorReservations = () => {
  const navigation = useNavigation<DoctorReservationsNavigationProp>();

  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [allReservations, setAllReservations] = useState<ReservationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Reservasi' | 'Selesai'>('Reservasi');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDoctorInfoLoading, setIsDoctorInfoLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Status options
  const statusOptions: { label: string; value: string; color: string }[] = [
    { label: 'Menunggu', value: 'Pending', color: '#FFC107' },
    { label: 'Terjadwal', value: 'Confirmed', color: '#2196F3' },
    { label: 'Ditolak', value: 'Rejected', color: '#F44336' },
    { label: 'Selesai', value: 'Completed', color: '#4CAF50' },
  ];

  // Updated handleStatusUpdate function (using local storage only for now)
  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedReservation) return;

    try {
      setIsUpdatingStatus(true);
      
      // Only update locally since backend endpoint not ready yet
      // TODO: Uncomment below when backend PUT /appointment/{id} endpoint is ready
      // await appointmentAPI.updateAppointmentStatus(selectedReservation.id, newStatus);
      
      await appointmentAPI.updateAppointmentStatusLocal(selectedReservation.id, newStatus);
      
      // Update the local state immediately for better UX
      setAllReservations(prev => 
        prev.map(reservation => 
          reservation.id === selectedReservation.id
            ? { ...reservation, status: mapStatus(newStatus) }
            : reservation
        )
      );
      
      setStatusModalVisible(false);
      setSelectedReservation(null);
      
      Alert.alert(
        'Success', 
        'Status berhasil diupdate! (Disimpan sementara secara lokal)'
      );
      
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        'Error', 
        'Gagal mengupdate status. Silakan coba lagi.'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Get doctor ID from token
  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        console.log('Fetching doctor ID from token...');
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          throw new Error('No token found');
        }

        console.log('Token found, decoding...');
        const payload = decodeJWT(token);
        
        if (!payload) {
          throw new Error('Invalid token format');
        }

        const extractedDoctorId = payload.doctor_id?.toString() || 
                                 payload.id?.toString() || 
                                 payload.user_id?.toString() || 
                                 payload.doctorId?.toString();

        console.log('Extracted doctor ID:', extractedDoctorId);
        
        if (!extractedDoctorId) {
          console.warn('No doctor ID found in token, using user ID as fallback');
          setDoctorId(payload.id?.toString() || '1');
        } else {
          setDoctorId(extractedDoctorId);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching doctor ID:', error);
        setError('Failed to get doctor information');
      }
    };

    fetchDoctorId();
  }, []);

  // Load doctor info when doctorId is available
  useEffect(() => {
    const loadDoctorInfo = async () => {
      if (!doctorId) return;
      
      try {
        setIsDoctorInfoLoading(true);
        console.log('Loading doctor info for ID:', doctorId);
        const info = await appointmentAPI.getDoctorInfo(doctorId);
        setDoctorInfo(info);
        console.log('Doctor info loaded:', info);
      } catch (error) {
        console.error('Error loading doctor info:', error);
      } finally {
        setIsDoctorInfoLoading(false);
      }
    };

    loadDoctorInfo();
  }, [doctorId]);

  // Load reservations from backend
  const loadReservations = useCallback(async (showLoading = true) => {
    if (!doctorId) {
      console.warn('No doctorId available for loading reservations');
      return;
    }

    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      
      console.log('Loading reservations for doctor:', doctorId);
      const appointments = await appointmentAPI.getDoctorAppointments(doctorId);
      const localStatusUpdates = await appointmentAPI.getLocalStatusUpdates();
      
      console.log('Raw appointments data:', appointments);
      console.log('Local status updates:', localStatusUpdates);
      
      if (!Array.isArray(appointments)) {
        console.warn('Appointments data is not an array:', appointments);
        setAllReservations([]);
        return;
      }

      const transformedReservations = appointments.map(apt => 
        transformAppointmentData(apt, localStatusUpdates)
      );
      console.log('Transformed reservations:', transformedReservations);
      
      // Sort by date (newest first)
      transformedReservations.sort((a: any, b: any) => {
        const parseFormattedDate = (dateStr: string, timeStr: string) => {
          try {
            return new Date(`${dateStr} ${timeStr}`).getTime();
          } catch {
            return 0;
          }
        };
        
        const dateA = parseFormattedDate(a.date, a.time);
        const dateB = parseFormattedDate(b.date, b.time);
        return dateB - dateA;
      });
      
      setAllReservations(transformedReservations);
      console.log('Successfully loaded reservations:', transformedReservations.length);
      
    } catch (error) {
      console.error('Error loading reservations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reservations';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication') || errorMessage.includes('forbidden')) {
        Alert.alert(
          'Authentication Error', 
          errorMessage,
          [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]
        );
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [doctorId, navigation]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReservations(false);
      if (doctorId) {
        const info = await appointmentAPI.getDoctorInfo(doctorId);
        setDoctorInfo(info);
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadReservations, doctorId]);

  // Load data when doctorId is available
  useEffect(() => {
    if (doctorId) {
      console.log('Doctor ID is available, loading reservations...');
      loadReservations();
    }
  }, [doctorId, loadReservations]);

  // Handle focus effect
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, refreshing data...');
      const refresh = async () => {
        if (doctorId) {
          await loadReservations(false);
        }
      };
      refresh();
    }, [doctorId, loadReservations])
  );

  const filteredReservations = allReservations.filter(reservation => 
    activeTab === 'Reservasi' 
      ? reservation.status !== 'Selesai' 
      : reservation.status === 'Selesai'
  );

  const getStatusColor = (status: ReservationStatus): string => {
    switch (status) {
      case 'Selesai': return '#4CAF50';
      case 'Terjadwal': return '#2196F3';
      case 'Menunggu': return '#FFC107';
      case 'Ditolak': return '#F44336';
      default: return '#9E9E9E';
    }
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

  const handleReservationPress = (reservation: ReservationItem) => {
    // Long press to open status update modal
    setSelectedReservation(reservation);
    setStatusModalVisible(true);
  };

  const handleReservationNavigation = (reservation: ReservationItem) => {
    console.log('Navigasi ke DetailReservation dengan reservationId:', reservation.id);
    navigation.navigate('DetailReservation', { 
      reservationId: reservation.id,
      reservationData: reservation
    });
  };

  const handleRetry = () => {
    if (doctorId) {
      loadReservations();
    } else {
      setError(null);
      const fetchDoctorId = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            const payload = decodeJWT(token);
            if (payload) {
              const extractedDoctorId = payload.doctor_id?.toString() || 
                                     payload.id?.toString() || 
                                     payload.user_id?.toString();
              setDoctorId(extractedDoctorId || '1');
            }
          }
        } catch (error) {
          setError('Failed to authenticate');
        }
      };
      fetchDoctorId();
    }
  };

  if (!doctorId && !error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reservasi Dokter</Text>
            {isDoctorInfoLoading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.headerSubtitle}>
                {doctorInfo?.name || ''}
                {doctorInfo?.specialization && ` - ${doctorInfo.specialization}`}
              </Text>
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Reservasi' && styles.activeTab]}
            onPress={() => setActiveTab('Reservasi')}
          >
            <Text style={[styles.tabText, activeTab === 'Reservasi' && styles.activeTabText]}>
              Reservasi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Selesai' && styles.activeTab]}
            onPress={() => setActiveTab('Selesai')}
          >
            <Text style={[styles.tabText, activeTab === 'Selesai' && styles.activeTabText]}>
              Selesai
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {(
          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredReservations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons 
                  name="event-busy" 
                  size={64} 
                  color="#BDBDBD" 
                />
                <Text style={styles.emptyText}>
                  {activeTab === 'Reservasi' 
                    ? 'Tidak ada reservasi aktif' 
                    : 'Tidak ada reservasi selesai'
                  }
                </Text>
              </View>
            ) : (
              filteredReservations.map((reservation) => (
                <TouchableOpacity
                  key={reservation.id}
                  style={styles.reservationCard}
                  onPress={() => handleReservationNavigation(reservation)}
                  onLongPress={() => handleReservationPress(reservation)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.petIconContainer}>
                      <MaterialIcons name="pets" size={28} color="#2196F3" />
                    </View>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.petName}>{reservation.petName}</Text>
                      <Text style={styles.ownerName}>{reservation.ownerName}</Text>
                    </View>
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
                  
                  <View style={styles.cardContent}>
                    <View style={styles.dateTimeContainer}>
                      <View style={styles.dateTimeItem}>
                        <MaterialIcons name="calendar-today" size={16} color="#666" />
                        <Text style={styles.dateTimeText}>{reservation.date}</Text>
                      </View>
                      <View style={styles.dateTimeItem}>
                        <MaterialIcons name="access-time" size={16} color="#666" />
                        <Text style={styles.dateTimeText}>{reservation.time}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.tapHint}>Tap untuk detail • Long press untuk ubah status</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        {/* Status Update Modal */}
        <Modal
          visible={statusModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Status</Text>
                <TouchableOpacity
                  onPress={() => setStatusModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {selectedReservation && (
                <View style={styles.modalBody}>
                  <Text style={styles.modalSubtitle}>
                    {selectedReservation.petName} - {selectedReservation.ownerName}
                  </Text>
                  <Text style={styles.modalDate}>
                    {selectedReservation.date} • {selectedReservation.time}
                  </Text>
                  
                  <Text style={styles.modalLabel}>Pilih Status:</Text>
                  
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusOption,
                        selectedReservation.status === option.label && styles.statusOptionActive
                      ]}
                      onPress={() => handleStatusUpdate(option.value)}
                      disabled={isUpdatingStatus}
                    >
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: option.color }
                      ]} />
                      <Text style={[
                        styles.statusOptionText,
                        selectedReservation.status === option.label && styles.statusOptionTextActive
                      ]}>
                        {option.label}
                      </Text>
                      {selectedReservation.status === option.label && (
                        <MaterialIcons name="check" size={20} color="#2196F3" />
                      )}
                      {isUpdatingStatus && (
                        <ActivityIndicator size="small" color="#2196F3" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default DoctorReservations 

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    marginTop: 32,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9E9E9E',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  // Content styles
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Loading and error states
  loadingText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  // Reservation card styles
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
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
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  tapHint: {
    fontSize: 11,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusOptionTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  // Doctor info loading states
  isDoctorInfoLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInfoLoadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});