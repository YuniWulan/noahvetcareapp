import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, 
  Alert, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

type MenuItemType = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
};

type PetType = {
  id: number;
  pet_name: string;
  species: string;
  age: number;
  image?: any;
};

type UserData = {
  username: string;
  email?: string;
  name?: string;
  full_name?: string;
  id?: string;
  user_id?: string;
  _id?: string;
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<PetType[]>([]);

  const menuItems: MenuItemType[] = [
    { icon: 'password', title: 'Ubah Kata Sandi' },
    { icon: 'security', title: 'Syarat & Ketentuan' },
    { icon: 'logout', title: 'Log Out' }
  ];

  const loadUser = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) {
        Alert.alert('Error', 'Data user tidak ditemukan. Silakan login ulang.');
        navigation.replace('Login');
        return;
      }
      const userData = JSON.parse(userString);
      setUser(userData);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat data user.');
    }
  };

  const fetchPetsFromAPI = async (userId: string, token: string) => {
    try {
      const response = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/pet/lists/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal mengambil data hewan');

      const data = await response.json();
      console.log("API result:", data);
      setPets(data.petData || []); 
    } catch (error) {
      console.log('Gagal fetch pets dari API:', error);
      fetchPetsFromStorage(); // fallback
    }
  };

  const fetchPetsFromStorage = async () => {
    try {
      const petsString = await AsyncStorage.getItem('pets');
      if (petsString) {
        setPets(JSON.parse(petsString));
      } else {
        setPets([]);
      }
    } catch (error) {
      console.log('Fetch pets from storage error:', error);
    }
  };

  const fetchPets = async () => {
    const token = await AsyncStorage.getItem("token");
    const userString = await AsyncStorage.getItem("user");
    if (!token || !userString) return;

    const parsedUser = JSON.parse(userString);
    const userId = parsedUser.id || parsedUser.user_id || parsedUser._id;
    if (!userId) return;

    await fetchPetsFromAPI(userId, token);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadUser();
      await fetchPets();
      setLoading(false);
    };
    init();
  }, []);

  useFocusEffect(
  useCallback(() => {
    const refresh = async () => {
      setLoading(true);
      await loadUser();
      await fetchPets();
      setLoading(false);
    };
    refresh();
    }, [])
  );

  const handleAddPet = () => {
    navigation.navigate('AddPetScreen');
  };

  const handleMenuItemPress = async (title: string) => {
    switch (title) {
      case 'Ubah Kata Sandi':
        navigation.navigate('ChangePassword');
        break;
      case 'Syarat & Ketentuan':
        break; 
      case 'Log Out':
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.replace('Login');
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
        <View style={styles.profileHeader}>
          <Image 
            source={require('../../assets/user-image.jpg')} 
            style={styles.petImage}
          />
         
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.username || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email || '-'}</Text>
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
          {pets.map((pet, index) => (
            <View key={index} style={styles.petContainer}>
              <Image 
                source={
                  pet.image 
                    ? pet.image 
                    : require('../../assets/asset-hidog.png') // default
                } 
                style={styles.petImage} 
              />
              <Text style={styles.petText}>{pet.pet_name}</Text>
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
              style={[styles.menuItem, index !== menuItems.length - 1 && styles.menuItemBorder]}
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
