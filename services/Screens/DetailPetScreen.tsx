import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';


const DetailPetScreen = () => {
  const navigation = useNavigation();

  // Sample pet data - in a real app, this would come from props or state
  const pet = {
    name: 'Savannah',
    species: 'Mamalia',
    type: 'Kucing',
    age: '2 Tahun',
    medicalNotes: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header with back button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Hewan Anda</Text>
          </View>

          {/* Pet Icons */}
          <View style={styles.iconContainer}>
            <View style={styles.petIconContainer}>
                <MaterialIcons name="pets" size={50} color="#2196F3" />
            </View>
          </View>
          

          {/* Pet Name */}
          <Text style={styles.petName}>{pet.name}</Text>

          {/* Pet Details Table */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Species</Text>
              <Text style={styles.detailValue}>{pet.species}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jenis</Text>
              <Text style={styles.detailValue}>{pet.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Usia</Text>
              <Text style={styles.detailValue}>{pet.age}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Medical Notes Section */}
          <Text style={styles.sectionTitle}>Catatan Medis</Text>
          <Text style={styles.medicalNotes}>{pet.medicalNotes}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  petIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    width: 64,
    height: 64,
    backgroundColor: '#CCE8FE',
    borderRadius: 300,
    },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  detailsContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  medicalNotes: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
});

export default DetailPetScreen;