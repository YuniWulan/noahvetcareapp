import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';

type SuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ReservationSuccessScreen = () => {
  const navigation = useNavigation<SuccessScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.successTitle}>Pesanan Anda Berhasil Dibuat</Text>
        
        <Text style={styles.successMessage}>
          Reservasi Anda telah berhasil dicatat. Anda dapat melihat detail reservasi di halaman Reservasi.
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.buttonText}>Cek Reservasi Anda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReservationSuccessScreen;