import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from './App';

type ProfileScreenNavigationProp = BottomTabNavigationProp<RootStackParamList, 'Profile'>;

type MenuItemType = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
};

type PetType = {
  name: string;
  image: any;
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const petsRow1: PetType[] = [
    { name: 'Arthur', image: require('./assets/dog1.jpg') },
    { name: 'Angel', image: require('./assets/dog2.jpg') },
    { name: 'Mitchell', image: require('./assets/dog3.jpg') },
    { name: 'Raya', image: require('./assets/cat1.jpg') },
  ];

  const menuItems: MenuItemType[] = [
    { icon: 'password', title: 'Ubah Kata Sandi' },
    { icon: 'security', title: 'Syarat & Ketentuan ' },
    { icon: 'logout', title: 'Log Out' }
  ];

  const handleAddPet = () => {
    console.log('Add pet pressed');
    // navigation.navigate('AddPet');
  };

  const handleMenuItemPress = (title: string) => {
  switch (title) {
    case 'Ubah Kata Sandi':
      navigation.navigate('ChangePassword');
      break;
    case 'Syarat & Ketentuan':
      break;
    case 'Log Out':
      break;
    default:
      console.log(`${title} pressed`);
  }
};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <Image 
            source={require('./assets/user-image.jpg')} 
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Bob Johnson Andreas</Text>
            <Text style={styles.profileEmail}>andreasbobj@gmail.com</Text>
             <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile')}
             >
              <FontAwesome name="pencil" size={16} color="#fff" />
              <Text style={styles.editButtonText}>Ubah Profil</Text>
            </TouchableOpacity>
          </View>
         
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Peliharaan Anda</Text>
        
        <View style={styles.petsRow}>
          {petsRow1.map((pet, index) => (
            <View key={index} style={styles.petContainer}>
              <Image source={pet.image} style={styles.petImage} />
              <Text style={styles.petText}>{pet.name}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
            <MaterialIcons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

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
                <MaterialIcons name={item.icon} size={24} color="#333" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
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
  scrollContainer: {
    paddingBottom: 80,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    flexDirection: 'row',
    width: 120,
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 16,
    borderRadius: 20,
    right: 20,
    top: 12,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  petsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  petContainer: {
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
    width: 80,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  petText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addPetText: {
    fontSize: 12,
    color: '#333',
  },
  smallAddButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  menuContainer: {
    marginTop: 8,
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
    borderBottomColor: '#eee',
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

export default ProfileScreen;