import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

type Reservation = {
  id: string;
  petName: string;
  gender: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
};

const DoctorHomeScreen = () => {
  const reservations: Reservation[] = [
    {
      id: '1',
      petName: 'Savannah',
      gender: 'Female',
      serviceType: 'Grooming',
      date: 'Tuesday, Dec 20',
      time: '09.00 AM',
      status: 'Terjadwal',
    },
    {
      id: '2',
      petName: 'Angel',
      gender: 'Female',
      serviceType: 'Grooming',
      date: 'Tuesday, Dec 20',
      time: '10.00 AM',
      status: 'Menunggu',
    },
    {
      id: '3',
      petName: 'Bembi',
      gender: 'Female',
      serviceType: 'Grooming',
      date: 'Tuesday, Dec 20',
      time: '11.00 AM',
      status: 'Terjadwal',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai':
        return '#4CAF50';
      case 'Terjadwal':
        return '#2196F3';
      case 'Menunggu':
        return '#FFC107';
      case 'Ditolak':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Hallo, Dr. Anne!</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Pet Care, Made Simple.</Text>
          <Text style={styles.heroText}>
            Atur jadwal, terima pasien dan fokus pada perawatan.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jadwal Mendatang</Text>
          {reservations.map((reservation) => (
            <View key={reservation.id} style={styles.reservationCard}>
              <View style={styles.reservationHeader}>
                <Text style={styles.reservationPetName}>{reservation.petName}</Text>
                <Text style={styles.reservationGender}>{reservation.gender}</Text>
              </View>
              <Text style={styles.reservationLabel}>Service</Text>
              <Text style={styles.reservationValue}>{reservation.serviceType}</Text>
              <Text style={styles.reservationDate}>{reservation.date}</Text>
              <Text style={styles.reservationTime}>{reservation.time}</Text>
              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                  {reservation.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 20 },
  header: { padding: 20, paddingTop: 40 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subHeaderText: { fontSize: 16, color: '#666', marginTop: 4 },
  heroCard: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  heroTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  heroText: { fontSize: 14, color: '#555' },
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  reservationCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  reservationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reservationPetName: { fontSize: 16, fontWeight: 'bold' },
  reservationGender: { fontSize: 14, color: '#757575' },
  reservationLabel: { fontSize: 12, color: '#757575', marginBottom: 2 },
  reservationValue: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  reservationDate: { fontSize: 14, marginBottom: 2 },
  reservationTime: { fontSize: 14, color: '#2196F3' },
  statusContainer: { marginTop: 8, alignItems: 'flex-end' },
  statusText: { fontWeight: 'bold', fontSize: 14 },
});

export default DoctorHomeScreen;
