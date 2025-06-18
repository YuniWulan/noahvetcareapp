import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type DoctorProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DoctorProfiles'>;

type MenuItemType = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
};

type DoctorData = {
  username: string;
  email?: string;
  name?: string;
  full_name?: string;
  id?: string;
  user_id?: string;
  _id?: string;
  specialization?: string;
  license_number?: string;
  phone?: string;
};

const DoctorProfile = () => {
  const navigation = useNavigation<DoctorProfileScreenNavigationProp>();
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);

  const menuItems: MenuItemType[] = [
    { icon: 'password', title: 'Ubah Kata Sandi' },
    { icon: 'security', title: 'Syarat & Ketentuan' },
    { icon: 'help', title: 'Bantuan' },
    { icon: 'logout', title: 'Log Out' }
  ];

  const loadDoctor = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) {
        Alert.alert('Error', 'Data dokter tidak ditemukan. Silakan login ulang.');
        navigation.replace('Login');
        return;
      }
      const doctorData = JSON.parse(userString);
      setDoctor(doctorData);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat data dokter.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadDoctor();
      setLoading(false);
    };
    init();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        setLoading(true);
        await loadDoctor();
        setLoading(false);
      };
      refresh();
    }, [])
  );

  const handleMenuItemPress = async (title: string) => {
    switch (title) {
      case 'Ubah Kata Sandi':
        navigation.navigate('ChangePassword');
        break;
      case 'Syarat & Ketentuan':
        Alert.alert('Info', 'Halaman Syarat & Ketentuan akan segera tersedia.');
        break;
      case 'Bantuan':
        Alert.alert('Info', 'Halaman Bantuan akan segera tersedia.');
        break;
      case 'Log Out':
        Alert.alert(
          'Konfirmasi',
          'Apakah Anda yakin ingin keluar?',
          [
            { text: 'Batal', style: 'cancel' },
            {
              text: 'Ya',
              onPress: async () => {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                navigation.replace('Login');
              }
            }
          ]
        );
        break;
      default:
        console.log(`${title} pressed`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={100} color="#2196F3" />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.doctorName}>
              Dr. {doctor?.username || doctor?.name || doctor?.full_name || 'Dokter'}
            </Text>
            <Text style={styles.doctorEmail}>{doctor?.email || '-'}</Text>
            {doctor?.specialization && (
              <Text style={styles.specialization}>{doctor.specialization}</Text>
            )}
            {doctor?.license_number && (
              <Text style={styles.licenseNumber}>SIP: {doctor.license_number}</Text>
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
                <Text style={styles.infoValue}>{doctor?.email || '-'}</Text>
              </View>
            </View>
          </View>

          {doctor?.phone && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telepon</Text>
                  <Text style={styles.infoValue}>{doctor.phone}</Text>
                </View>
              </View>
            </View>
          )}

          {doctor?.specialization && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="local-hospital" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Spesialisasi</Text>
                  <Text style={styles.infoValue}>{doctor.specialization}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem, 
                index !== menuItems.length - 1 && styles.menuItemBorder
              ]}
              onPress={() => handleMenuItemPress(item.title)}
            >
              <View style={styles.menuContent}>
                <MaterialIcons 
                  name={item.icon} 
                  size={24} 
                  color="#333" 
                />
                <Text style={styles.menuText}>
                  {item.title}
                </Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default DoctorProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 32,
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
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
});