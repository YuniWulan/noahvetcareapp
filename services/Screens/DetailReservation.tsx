import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface ReservationDetailProps {
  route?: {
    params?: {
      reservation?: ReservationData;
    };
  };
}

interface ReservationData {
  id: string;
  petName: string;
  status: 'Terjadwal' | 'Selesai' | 'Dibatalkan';
  doctorName: string;
  date: string;
  time: string;
  notes: string;
  petSpecies: string;
  petBreed: string;
  petAge: string;
  medicalNotes: string;
}

const ReservationDetail: React.FC<ReservationDetailProps> = ({ route }) => {
  const navigation = useNavigation();

  // Sample data - replace with actual data from route params
  const reservationData: ReservationData = route?.params?.reservation || {
    id: '1',
    petName: 'Savannah',
    status: 'Terjadwal',
    doctorName: 'Dr. Teguh Prasetya',
    date: 'Monday, Jun 30',
    time: '04:00 PM',
    notes: 'Vaksin & Grooming',
    petSpecies: 'Mamalia',
    petBreed: 'Kucing',
    petAge: '2 Tahun',
    medicalNotes: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terjadwal':
        return '#E8F5E8';
      case 'Selesai':
        return '#E3F2FD';
      case 'Dibatalkan':
        return '#FFEBEE';
      default:
        return '#F5F5F5';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Terjadwal':
        return '#2E7D32';
      case 'Selesai':
        return '#1976D2';
      case 'Dibatalkan':
        return '#D32F2F';
      default:
        return '#757575';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservasi Anda</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pet Avatar and Name */}
        <View style={styles.petSection}>
          <View style={styles.petAvatar}>
            <Ionicons name="paw" size={32} color="#2196F3" />
          </View>
          <Text style={styles.petName}>{reservationData.petName}</Text>
        </View>

        {/* Reservation Details */}
        <View style={styles.detailsContainer}>
          {/* Status */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status Reservasi</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservationData.status) }]}>
              <Text style={[styles.statusText, { color: getStatusTextColor(reservationData.status) }]}>
                {reservationData.status}
              </Text>
            </View>
          </View>

          {/* Doctor */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dokter</Text>
            <Text style={styles.detailValue}>{reservationData.doctorName}</Text>
          </View>

          {/* Date */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tanggal Reservasi</Text>
            <Text style={styles.detailValue}>{reservationData.date}</Text>
          </View>

          {/* Time */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jam Reservasi</Text>
            <Text style={styles.detailValue}>{reservationData.time}</Text>
          </View>

          {/* Notes */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Catatan</Text>
            <Text style={styles.detailValue}>{reservationData.notes}</Text>
          </View>
        </View>

        {/* Pet Information */}
        <View style={styles.petInfoContainer}>
          {/* Species */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Spesies</Text>
            <Text style={styles.detailValue}>{reservationData.petSpecies}</Text>
          </View>

          {/* Breed */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jenis</Text>
            <Text style={styles.detailValue}>{reservationData.petBreed}</Text>
          </View>

          {/* Age */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Usia</Text>
            <Text style={styles.detailValue}>{reservationData.petAge}</Text>
          </View>
        </View>

        {/* Medical Notes */}
        <View style={styles.medicalNotesContainer}>
          <Text style={styles.medicalNotesTitle}>Catatan Medis</Text>
          <Text style={styles.medicalNotesText}>{reservationData.medicalNotes}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 32,
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
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  petInfoContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#9E9E9E',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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