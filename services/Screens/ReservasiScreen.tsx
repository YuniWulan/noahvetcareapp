import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../assets/api'
import { RootStackParamList } from '../../App';  


type ReservasiNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Reservasi() {
  const navigation = useNavigation<ReservasiNavigationProp>();
  const Stack = createNativeStackNavigator<RootStackParamList>();

  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number>(8);

  const pets = [
    { id: 1, name: 'Arthur', image: require('../../assets/dog1.jpg') },
    { id: 2, name: 'Angel', image: require('../../assets/dog2.jpg') },
    { id: 3, name: 'Mitchell', image: require('../../assets/dog3.jpg') },
    { id: 4, name: 'Bembi', image: require('../../assets/cat1.jpg') },
    { id: 5, name: 'Ronald', image: require('../../assets/dog4.jpg') }
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
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

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
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const calendarDays = generateCalendar();

  const handleReservation = async () => {
    if (!selectedPet || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select pet, date, and time');
      return;
    }

    setIsLoading(true);

    try {
      const [day] = selectedDate.split(' ');
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}T${selectedTime}:00Z`;

      const selectedPetId = pets.find(pet => pet.name === selectedPet)?.id;

      const response = await api.post('/appointment/create', {
        pet_id: selectedPetId,
        doctor_id: selectedDoctor,
        date: formattedDate,
        status: "Scheduled",
        notes: notes || "No notes provided"
      });

      Alert.alert('Success', 'Appointment created successfully!');
      navigation.navigate('ReservationSuccess', { 
          appointmentId: response.data.appointment_id 
        });
      } catch (error: any) { 
          console.error('Appointment error:', error.response?.data);
          Alert.alert(
            'Error',
            error.response?.data?.message || 'Failed to create appointment'
          );
        } finally {
        setIsLoading(false);
      }
    };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat Reservasi</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Pilih Peliharaan Anda</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.petScroll}
          nestedScrollEnabled={true}
        >
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.name}
              style={[styles.petItem, selectedPet === pet.name && styles.selectedPetItem]}
              onPress={() => setSelectedPet(pet.name)}
            >
              <Image source={pet.image} style={styles.petImage} />
              <Text style={selectedPet === pet.name ? styles.selectedPetText : styles.petText}>
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Pilih Dokter</Text>
        <View style={styles.doctorsContainer}>
          {doctors.map(doctor => (
            <TouchableOpacity
              key={doctor.id}
              style={[
                styles.doctorButton,
                selectedDoctor === doctor.id && styles.selectedDoctorButton
              ]}
              onPress={() => setSelectedDoctor(doctor.id)}
            >
              <Text style={selectedDoctor === doctor.id ? 
                styles.selectedDoctorText : styles.doctorText}>
                {doctor.name} ({doctor.specialty})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Pilih Tanggal</Text>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysContainer}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarContainer}>
          {calendarDays.map((date, index) =>
            date ? (
              <TouchableOpacity
                key={index}
                style={[styles.calendarDay, selectedDate === formatDate(date) && styles.selectedCalendarDay]}
                onPress={() => setSelectedDate(formatDate(date))}
              >
                <Text style={selectedDate === formatDate(date) ? styles.selectedCalendarDayText : styles.calendarDayText}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ) : (
              <View key={index} style={styles.emptyCalendarDay} />
            )
          )}
        </View>

        <Text style={styles.sectionTitle}>Jam yang tersedia</Text>
        <View style={styles.timeContainer}>
          {times.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeButton, selectedTime === time && styles.selectedTimeButton]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={selectedTime === time ? styles.selectedTimeText : styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Catatan</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Tulis catatan di sini..."
          multiline
          numberOfLines={4}
          maxLength={250}
          value={notes}
          onChangeText={setNotes}
        />
        <Text style={styles.charCount}>{notes.length}/250</Text>

        <TouchableOpacity 
          style={[styles.confirmButton, isLoading && styles.disabledButton]} 
          onPress={handleReservation}
          disabled={isLoading}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? 'Processing...' : 'Konfirmasi Reservasi'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: 32,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  petScroll: {
    marginBottom: 10,
  },
  petItem: {
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedPetItem: {
    backgroundColor: '#2196F3',
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
    color: '#fff',
    fontWeight: 'bold',
  },
  doctorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  doctorButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedDoctorButton: {
    backgroundColor: '#2196F3',
  },
  doctorText: {
    color: '#333',
  },
  selectedDoctorText: {
    color: '#fff',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderRadius: 20,
  },
  selectedCalendarDay: {
    backgroundColor: '#2196F3',
  },
  calendarDayText: {
    color: '#333',
  },
  selectedCalendarDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyCalendarDay: {
    width: '14.28%',
    height: 40,
    marginBottom: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTimeButton: {
    backgroundColor: '#2196F3',
  },
  timeText: {
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 5,
    minHeight: 80,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
});