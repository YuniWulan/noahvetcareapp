import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList} from '../../App'; // IMPORT DoctorData dari App.tsx

type ViewDoctorProfileNavigationProp = StackNavigationProp<RootStackParamList, 'ViewDoctorProfile'>;
type ViewDoctorProfileRouteProp = RouteProp<RootStackParamList, 'ViewDoctorProfile'>;


const ViewDoctorProfile = () => {
  const navigation = useNavigation<ViewDoctorProfileNavigationProp>();
  const route = useRoute<ViewDoctorProfileRouteProp>();
  const { doctorData } = route.params;

  return (
    <View style={styles.container}>
      {/* Header dengan tombol kembali */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Dokter</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={100} color="#2196F3" />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.doctorName}>
              Dr. {doctorData?.username || doctorData?.name || doctorData?.full_name || 'Dokter'}
            </Text>
            <Text style={styles.doctorEmail}>{doctorData?.email || '-'}</Text>
            {doctorData?.specialization && (
              <Text style={styles.specialization}>{doctorData.specialization}</Text>
            )}
            {doctorData?.license_number && (
              <Text style={styles.licenseNumber}>SIP: {doctorData.license_number}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Doctor Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informasi Dokter</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{doctorData?.email || '-'}</Text>
              </View>
            </View>
          </View>

          {doctorData?.phone && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telepon</Text>
                  <Text style={styles.infoValue}>{doctorData.phone}</Text>
                </View>
              </View>
            </View>
          )}

          {doctorData?.specialization && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="local-hospital" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Spesialisasi</Text>
                  <Text style={styles.infoValue}>{doctorData.specialization}</Text>
                </View>
              </View>
            </View>
          )}

          {doctorData?.experience && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="work" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Pengalaman</Text>
                  <Text style={styles.infoValue}>{doctorData.experience}</Text>
                </View>
              </View>
            </View>
          )}

          {doctorData?.education && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="school" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Pendidikan</Text>
                  <Text style={styles.infoValue}>{doctorData.education}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* About Section */}
        {doctorData?.about && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Tentang Dokter</Text>
              <Text style={styles.aboutText}>{doctorData.about}</Text>
            </View>
          </>
        )}

        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => {
              // Navigate ke screen reservasi dengan data dokter
              navigation.navigate('Reservasi', { selectedDoctor: doctorData });
            }}
          >
            <MaterialIcons name="calendar-today" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>Buat Reservasi</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => {
              // Implement contact functionality
              console.log('Contact doctor:', doctorData.phone);
            }}
          >
            <MaterialIcons name="phone" size={20} color="#2196F3" />
            <Text style={styles.contactButtonText}>Hubungi Dokter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ViewDoctorProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44, // untuk safe area
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40, // untuk balance dengan back button
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  doctorEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  specialization: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 2,
  },
  licenseNumber: {
    fontSize: 12,
    color: '#888',
  },
  divider: {
    height: 10,
    backgroundColor: '#f5f5f5',
  },
  infoSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  bookButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    gap: 8,
  },
  contactButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});