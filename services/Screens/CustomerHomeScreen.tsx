import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';  

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabParamList = {
  Home: undefined;
  ReservationList: undefined;
  Transaction: undefined;
  Profile: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const pets = [
    { name: 'Arthur', image: require('../../assets/dog2.jpg') },
    { name: 'Angel', image: require('../../assets/dog1.jpg') },
    { name: 'Mitchell', image: require('../../assets/dog3.jpg') },
    { name: 'Bembi', image: require('../../assets/cat1.jpg') },
    { name: 'Ronald', image: require('../../assets/dog4.jpg') }
  ];
  
  const reservations = [
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
      date: 'Wednesday, Dec 21',
      time: '10.30 AM',
      status: 'Menunggu',
      image: require('../../assets/dog2.jpg')
    },
    {
      id: '3',
      petName: 'Bembi',
      gender: 'Female',
      date: 'Thursday, Dec 22',
      time: '02.15 PM',
      status: 'Terjadwal',
      image: require('../../assets/cat1.jpg')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return '#4CAF50';
      case 'Terjadwal': return '#2196F3';
      case 'Menunggu': return '#FFC107';
      case 'Ditolak': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Hallo, Bob!</Text>
          <Text style={styles.subHeaderText}>Jangan lupa cek-up peliharaanmu!</Text>
        </View>

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
              Reservasi dokter hewan lebih simpel —{'\n'}
              karena mereka layak yang terbaik.
            </Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => navigation.navigate('Reservasi')}
            >
              <Text style={styles.heroButtonText}>Reservasi sekarang</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peliharaan Anda</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petsContainer}
          >
            {pets.map((pet, index) => (
              <TouchableOpacity key={index} style={styles.petCard}>
                <Image source={pet.image} style={styles.petImage} />
                <Text style={styles.petName}>{pet.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reservasi</Text>
            <TouchableOpacity 
              style={styles.lihatButton}
              onPress={() => navigation.navigate('ReservationList')}
            >
              <Text style={styles.lihatButtonText}>Lihat</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reservationsContainer}
          >
            {reservations.map((reservation) => (
              <TouchableOpacity 
                key={reservation.id} 
                style={styles.reservationCard}
              >
                <View style={styles.reservationTopRow}>
                  <Image source={reservation.image} style={styles.reservationImage} />
                  <View style={styles.reservationTextContainer}>
                    <Text style={styles.reservationName}>{reservation.petName}</Text>
                    <Text style={styles.reservationGender}>{reservation.gender}</Text>
                  </View>
                </View>
                
                <View style={styles.reservationBottomRow}>
                  <View style={styles.datetimeContainer}>
                    <Text style={styles.reservationDate}>{reservation.date}</Text>
                    <Text style={styles.reservationTime}>{reservation.time}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Text style={[styles.statusValue, { color: getStatusColor(reservation.status) }]}>
                      {reservation.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dokter Tersedia</Text>
          <View style={styles.doctorsContainer}>
            <View style={styles.doctorCard}>
              <MaterialIcons name="medical-services" size={24} color="#4CAF50" />
              <Text style={styles.doctorName}>Dr. Smith</Text>
              <Text style={styles.doctorSpecialty}>Dokter Hewan</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
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
  heroContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  heroBackground: {
    height: 220,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroBackgroundImage: {
    opacity: 0.9,
  },
  heroOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroDescription: {
    fontSize: 14,
    fontWeight: 500,
    color: '#333',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
    textShadowColor: 'rgba(239, 240, 255, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  heroImage: {
    width: 200,
    height: 'auto',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  lihatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lihatButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  petsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  petCard: {
    alignItems: 'center',
    width: 80,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  petName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  reservationsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 10,
  },
  reservationCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  doctorsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  doctorCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  doctorName: {
    marginTop: 8,
    fontWeight: '500',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default HomeScreen;