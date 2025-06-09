import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definitions
type ReservationStatus = 'Terjadwal' | 'Menunggu' | 'Ditolak' | 'Selesai';

interface ReservationItem {
  id: string;
  petName: string;
  doctorName: string;
  date: string;
  time: string;
  status: ReservationStatus;
  notes?: string;
}

type RootStackParamList = {
  ReservationList: {
    shouldRefresh?: boolean;
  };
  ReservationDetail: {
    reservationId: string;
    reservationData: ReservationItem;
  };
  Reservasi: undefined;
};

type RouteParams = {
  shouldRefresh?: boolean;
};

type ReservationListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReservationList'>;
type ReservationListRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

// API Configuration
const API_BASE_URL = 'https://noahvetcare.naufalalfa.com/v1/api';

// API service functions
const appointmentAPI = {
  getUserAppointments: async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/appointment/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      return data.appointments || [];
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      throw error;
    }
  },

  getAppointmentDetails: async (appointmentId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/appointment/details/${appointmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Appointment not found');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`Failed to fetch appointment details: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      throw error;
    }
  },

  createAppointment: async (appointmentData: {
    pet_id: number;
    doctor_id: number;
    date: string;
    status: string;
    notes: string;
  }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/appointment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create appointment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }
};

// Helper functions
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Date not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
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
const transformAppointmentData = (appointmentData: any): ReservationItem => {
  return {
    id: appointmentData.appointment_id?.toString() || Date.now().toString() + Math.random().toString(36).substr(2, 9),
    petName: appointmentData.pet_name || 'Unknown Pet',
    doctorName: appointmentData.doctor_name || 'Unknown Doctor',
    date: formatDate(appointmentData.date),
    time: formatTime(appointmentData.date),
    status: mapStatus(appointmentData.status),
    notes: appointmentData.notes || '',
  };
};

// Utility function to safely decode JWT token
const decodeJWT = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const ReservationListScreen = () => {
  const navigation = useNavigation<ReservationListNavigationProp>();
  const route = useRoute<ReservationListRouteProp>();

  const [userId, setUserId] = useState<string | null>(null);
  const [allReservations, setAllReservations] = useState<ReservationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Reservasi' | 'Selesai'>('Reservasi');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get user ID from token
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const payload = decodeJWT(token);
          if (payload) {
            setUserId(payload.user_id?.toString() || payload.id?.toString() || null);
          } else {
            throw new Error('Invalid token format');
          }
        } else {
          throw new Error('No token found');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
        Alert.alert('Authentication Error', 'Failed to get user information. Please login again.');
      }
    };

    fetchUserId();
  }, []);

  // Load reservations from backend
  const loadReservations = useCallback(async (showLoading = true) => {
    if (!userId) {
      console.warn('No userId available for loading reservations');
      return;
    }

    try {
      if (showLoading) setIsLoading(true);
      
      const appointments = await appointmentAPI.getUserAppointments(userId);
      const transformedReservations = appointments.map(transformAppointmentData);
      
      // Sort by date (newest first) - use the original date from backend for accurate sorting
      transformedReservations.sort((a: any, b: any) => {
        // You might need to store the original date for sorting
        // For now, let's try to parse the formatted date
        const parseFormattedDate = (dateStr: string, timeStr: string) => {
          try {
            // This is a simple approach - you might need to adjust based on your date format
            return new Date(`${dateStr} ${timeStr}`).getTime();
          } catch {
            return 0;
          }
        };
        
        const dateA = parseFormattedDate(a.date, a.time);
        const dateB = parseFormattedDate(b.date, b.time);
        return dateB - dateA;
      });
      
      // Replace all reservations with fresh data from API
      setAllReservations(transformedReservations);
      
      console.log('Loaded reservations:', transformedReservations.length);
    } catch (error) {
      console.error('Error loading reservations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reservations. Please try again.';
      
      Alert.alert(
        'Error', 
        errorMessage,
        [
          { text: 'Retry', onPress: () => loadReservations() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [userId]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReservations(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadReservations]);

  // Load data when userId is available
  useEffect(() => {
    if (userId) {
      loadReservations();
    }
  }, [userId, loadReservations]);

  // Handle focus effect and navigation params
  useFocusEffect(
    useCallback(() => {
      // Always refresh data when screen comes into focus
      // This ensures we get the latest data from the server
      if (userId && route.params?.shouldRefresh) {
        console.log('Refreshing due to shouldRefresh param');
        loadReservations(false);
        
        // Clear the param to prevent infinite refresh
        navigation.setParams({ shouldRefresh: undefined });
      }
    }, [route.params?.shouldRefresh, loadReservations, navigation, userId])
  );

  const filteredReservations = allReservations.filter(reservation => 
    activeTab === 'Reservasi' 
      ? reservation.status !== 'Selesai' 
      : reservation.status === 'Selesai'
  );

  const getStatusColor = (status: ReservationStatus): string => {
    switch (status) {
      case 'Selesai': return '#4CAF50';
      case 'Terjadwal': return '#009C41';
      case 'Menunggu': return '#FFC107';
      case 'Ditolak': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const handleAddReservation = () => {
    navigation.navigate('Reservasi'); 
  };

  const handleReservationPress = async (reservation: ReservationItem) => {
    try {
      // Show loading feedback
      // You might want to add a loading state here
      
      // Fetch detailed appointment data
      const details = await appointmentAPI.getAppointmentDetails(reservation.id);
      
      // Navigate to detail screen with complete data
      navigation.navigate('ReservationDetail', { 
        reservationId: reservation.id,
        reservationData: { ...reservation, ...details }
      });
    } catch (error) {
      console.error('Error fetching reservation detail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reservation details';
      Alert.alert('Error', errorMessage);
    }
  };

  // Show loading if no userId yet
  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <MaterialIcons name="refresh" size={32} color="#2196F3" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Reservasi</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Reservasi' && styles.activeTab]}
            onPress={() => setActiveTab('Reservasi')}
          >
            <Text style={[styles.tabText, activeTab === 'Reservasi' && styles.activeTabText]}>
              Reservasi Anda
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
 
        <TouchableOpacity style={styles.addButton} onPress={handleAddReservation}>
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Buat Reservasi Baru</Text>
        </TouchableOpacity>
 
        <ScrollView 
          style={styles.reservationList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
              tintColor="#2196F3"
            />
          }
        >
          {isLoading && allReservations.length === 0 ? (
            <View style={styles.loadingState}>
              <MaterialIcons name="refresh" size={32} color="#2196F3" />
              <Text style={styles.loadingText}>Loading reservations...</Text>
            </View>
          ) : filteredReservations.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons 
                name="event-note" 
                size={64} 
                color="#E0E0E0" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyStateText}>
                {activeTab === 'Reservasi' 
                  ? 'Tidak ada reservasi aktif' 
                  : 'Tidak ada reservasi selesai'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {activeTab === 'Reservasi' 
                  ? 'Buat reservasi baru untuk memulai' 
                  : 'Reservasi yang selesai akan muncul di sini'}
              </Text>
            </View>
          ) : (
            filteredReservations.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.reservationCard}
                onPress={() => handleReservationPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.reservationTopRow}>
                  <View style={styles.reservationIconContainer}>
                    <MaterialIcons name="pets" size={36} color="#2196F3" />
                  </View>
                  <View style={styles.reservationTextContainer}>
                    <Text style={styles.reservationName}>{item.petName}</Text>
                    <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
                    {item.notes && (
                      <Text style={styles.reservationNotes} numberOfLines={1}>
                        {item.notes}
                      </Text>
                    )}
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
                </View>
                
                <View style={styles.reservationBottomRow}>
                  <View style={styles.datetimeContainer}>
                    <Text style={styles.reservationDate}>{item.date}</Text>
                    <Text style={styles.reservationTime}>{item.time}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                      <Text style={[styles.statusValue, { color: getStatusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

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
  titleContainer: {
    // paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reservationList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9E9E9E',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
  },
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
    marginRight: 24,
  },
  reservationTextContainer: {
    flex: 1,
  },
  reservationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorName: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  reservationNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  reservationBottomRow: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusValue: {
    fontWeight: 'bold',
    fontSize: 12,
  }, 
});

export default ReservationListScreen; 