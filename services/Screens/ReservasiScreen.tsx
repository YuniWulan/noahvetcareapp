import React, { useEffect, useState } from 'react';
import {
  View,
  Text, 
  Alert,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type ReservasiNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Reservasi() {
  const navigation = useNavigation<ReservasiNavigationProp>();
  const [token, setToken] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Use single state for selected pet (object instead of string)
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(8);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const userDataStr = await AsyncStorage.getItem('user');
        console.log('Isi userDataStr:', userDataStr);
        let storedUserID = null;
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          storedUserID = userData.user_id || userData.id || null;
        }
        setToken(storedToken);
        setUserID(storedUserID);
      } catch (error) {
        Alert.alert('Error', 'Gagal memuat data autentikasi');
      }
    };
    loadAuthData();
  }, []);

  const pets = [
    { id: 1, name: 'Arthur', image: require('../../assets/dog1.jpg') },
    { id: 2, name: 'Angel', image: require('../../assets/dog2.jpg') },
    { id: 3, name: 'Mitchell', image: require('../../assets/dog3.jpg') },
    { id: 4, name: 'Bembi', image: require('../../assets/cat1.jpg') },
    { id: 5, name: 'Ronald', image: require('../../assets/dog4.jpg') },
  ];

  const doctors = [
    { id: 8, name: 'Dr. Smith', specialty: 'General' },
    { id: 9, name: 'Dr. Johnson', specialty: 'Surgery' },
  ];

  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return days;
  };

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    return `${day} ${dayName}`;
  };

  const formatMonthYear = (date: Date) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const calendarDays = generateCalendar();

  const appointmentData = {
    pet_id: selectedPet?.id,
    doctor_id: selectedDoctor,
    date: selectedDate?.toISOString().split('T')[0],
    time: selectedTime,
    notes: notes,
    user_id: userID,
  };

  console.log('Sending appointment data:', appointmentData);
 
  const createAppointment = async () => {
  if (!token || !userID) {
    Alert.alert('Error', 'Token atau user ID belum tersedia');
    return;
  }
  if (!selectedPet || !selectedDate || !selectedTime || !selectedDoctor) {
    Alert.alert('Error', 'Harap pilih peliharaan, tanggal, waktu, dan dokter terlebih dahulu');
    return;
  }
  setIsLoading(true);
  try {
    const dateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    dateTime.setHours(hours, minutes, 0, 0);

    const doctor = doctors.find((d) => d.id === selectedDoctor);
    if (!doctor) throw new Error('Dokter tidak ditemukan');

    const response = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/appointment/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pet_id: selectedPet.id,
        doctor_id: selectedDoctor,
        date: dateTime.toISOString(),
        status: 'Scheduled',
        notes,
      }),
    });

    // Log response details
    console.log('Response status:', response.status);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('Non-JSON response:', text);
      throw new Error(`Response bukan JSON: ${text}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Gagal membuat appointment');
    }

    // Fixed: Use appointment_id instead of data.appointment.id
    const newReservation = {
      id: data.appointment_id.toString(), // Changed from data.appointment.id
      petName: selectedPet.name,
      gender: 'Unknown',
      date: dateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      time: selectedTime,
      status: 'Menunggu' as const,
      image: selectedPet.image,
    };

    Alert.alert('Sukses', 'Appointment berhasil dibuat');
    navigation.navigate('ReservationList', { newReservation });     

    // Reset form
    setSelectedPet(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setNotes(''); 
  } catch (error: any) { 
    console.error('Create appointment error:', error);
    Alert.alert('Error', error.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleReservation = () => {
    createAppointment();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat Reservasi</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Pilih Peliharaan Anda</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll} nestedScrollEnabled>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[styles.petItem, selectedPet?.id === pet.id && styles.selectedPetItem]}
              onPress={() => setSelectedPet(pet)} // Fixed: set the entire pet object
            >
              <Image source={pet.image} style={styles.petImage} />
              <Text style={selectedPet?.id === pet.id ? styles.selectedPetText : styles.petText}>
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Pilih Dokter</Text>
        <View style={styles.doctorList}>
          {doctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={[styles.doctorItem, selectedDoctor === doctor.id && styles.selectedDoctorItem]}
              onPress={() => setSelectedDoctor(doctor.id)}
            >
              <Text style={selectedDoctor === doctor.id ? styles.selectedDoctorText : styles.doctorText}>
                {doctor.name} ({doctor.specialty})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Pilih Tanggal</Text>
        <View style={styles.monthPicker}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.calendarDayLabel}>
              {day}
            </Text>
          ))} 
          {calendarDays.map((date, index) =>
            date ? (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  selectedDate &&
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear()
                    ? styles.selectedCalendarDay
                    : null,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text>{date.getDate()}</Text>
              </TouchableOpacity>
            ) : (
              <View key={index} style={styles.calendarDayEmpty} />
            )
          )}
        </View>

        <Text style={styles.sectionTitle}>Pilih Waktu</Text>
        <View style={styles.timeList}>
          {times.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeItem, selectedTime === time && styles.selectedTimeItem]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={selectedTime === time ? styles.selectedTimeText : styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Catatan</Text>
        <TextInput 
          multiline
          placeholder="Tulis catatan tambahan..."
          style={styles.textInput}
          value={notes}
          onChangeText={setNotes}
        /> 

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleReservation}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>{isLoading ? 'Loading...' : 'Buat Reservasi'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#f2f2f2',
    justifyContent: 'space-between',
  }, 
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  petScroll: {
    marginBottom: 15,
  },
  petItem: {
    alignItems: 'center',
    marginRight: 15,
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedPetItem: {
    borderColor: '#007bff',
    backgroundColor: '#dbeeff',
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 5,
  },
  petText: {
    color: '#333',
  },
  selectedPetText: {
    color: '#007bff',
    fontWeight: '700',
  },
  doctorList: {
    flexDirection: 'row', 
    marginBottom: 15,
  },
  doctorItem: {
    marginRight: 15,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedDoctorItem: {
    backgroundColor: '#dbeeff',
    borderColor: '#007bff',
  },
  doctorText: {
    color: '#333',
  },
  selectedDoctorText: {
    color: '#007bff',
    fontWeight: '700',
  },
  monthPicker: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  monthButton: {
    padding: 5,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    color: '#333',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 5,
  }, 
  selectedCalendarDay: {
    backgroundColor: '#007bff',
  },
  calendarDayEmpty: {
    width: `${100 / 7}%`,
    paddingVertical: 10,
    marginBottom: 5,
  },
  timeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  timeItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTimeItem: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  timeText: {
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: '700',
  },
  textInput: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  }, 
  submitButtonDisabled: {
    backgroundColor: '#7aa7e9',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  }, 
});