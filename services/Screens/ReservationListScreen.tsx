import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';  


type ReservationListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ReservationStatus = 'Terjadwal' | 'Menunggu' | 'Ditolak' | 'Selesai';

interface ReservationItem {
  id: string;
  petName: string;
  gender: string;
  date: string;
  time: string;
  status: ReservationStatus;
  image: any; // Add image property
}

const ReservationListScreen = () => {
  const navigation = useNavigation<ReservationListNavigationProp>();
  const [activeTab, setActiveTab] = useState<'Reservasi' | 'Selesai'>('Reservasi');

  const allReservations: ReservationItem[] = [
    {
      id: '1',
      petName: 'Savannah',
      gender: 'Female',
      date: 'Tuesday, Dec 20',
      time: '09.00 AM',
      status: 'Terjadwal',
      image: require('../../assets/dog1.jpg')
    },
    {
      id: '2',
      petName: 'Angel',
      gender: 'Female',
      date: 'Tuesday, Dec 20',
      time: '09.00 AM',
      status: 'Menunggu',
      image: require('../../assets/dog2.jpg')
    },
    {
      id: '3',
      petName: 'Bembi',
      gender: 'Female',
      date: 'Tuesday, Dec 20',
      time: '09.00 AM',
      status: 'Terjadwal',
      image: require('../../assets/cat1.jpg')
    },
    {
      id: '4',
      petName: 'Savannah',
      gender: 'Female',
      date: 'Tuesday, Dec 15',
      time: '09.00 AM',
      status: 'Ditolak',
      image: require('../../assets/dog1.jpg')
    },
    {
      id: '5',
      petName: 'Raya',
      gender: 'Female',
      date: 'Monday, Dec 19',
      time: '10.00 AM',
      status: 'Selesai',
      image: require('../../assets/dog3.jpg')
    },
    {
      id: '6',
      petName: 'Milo',
      gender: 'Male',
      date: 'Friday, Dec 16',
      time: '02.00 PM',
      status: 'Selesai',
      image: require('../../assets/dog4.jpg')
    },
  ];

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

  const handleAddReservation = () => {
    navigation.navigate('Reservasi');
    console.log('Add new reservation');
  };

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

        {/* Add Reservation Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddReservation}>
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Buat Reservasi Baru</Text>
        </TouchableOpacity>

        {/* Reservation List */}
        <ScrollView style={styles.reservationList}>
          {filteredReservations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {activeTab === 'Reservasi' 
                  ? 'Tidak ada reservasi aktif' 
                  : 'Tidak ada reservasi selesai'}
              </Text>
            </View>
          ) : (
            filteredReservations.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.reservationCard}
              >
                <View style={styles.reservationTopRow}>
                  <Image source={item.image} style={styles.reservationImage} />
                  <View style={styles.reservationTextContainer}>
                    <Text style={styles.reservationName}>{item.petName}</Text>
                    <Text style={styles.reservationGender}>{item.gender}</Text>
                  </View>
                </View>
                
                <View style={styles.reservationBottomRow}>
                  <View style={styles.datetimeContainer}>
                    <Text style={styles.reservationDate}>{item.date}</Text>
                    <Text style={styles.reservationTime}>{item.time}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Text style={[styles.statusValue, { color: getStatusColor(item.status) }]}>
                      {item.status}
                    </Text>
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9E9E9E',
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
  reservationImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  reservationTextContainer: {
    flex: 1,
  },
  reservationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reservationGender: {
    fontSize: 14,
    color: '#666',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  value: {
    fontSize: 16,
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
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReservationListScreen;