import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
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
          <View style={styles.UserIcon}>
            <MaterialIcons name="account-circle" size={120} color="#2196F3" />
          </View>
         
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Peliharaan Anda</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
            <MaterialIcons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {pets.length > 0 ? (
          <View style={styles.petListContainer}>
            {pets.map((pet) => (
              <TouchableOpacity 
                key={pet.id} 
                style={styles.petCard}
                onPress={() => navigation.navigate('DetailPetScreen')}
              >
                <MaterialIcons name="pets" size={24} color="#2196F3" style={styles.petIcon} />
                <Text style={styles.petName}>{pet.pet_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="pets" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada peliharaan</Text>
            <TouchableOpacity 
              style={styles.addPetButton}
              onPress={handleAddPet}
              activeOpacity={0.8}
            >
              <Text style={styles.addPetButtonText}>Tambah Peliharaan</Text>
            </TouchableOpacity>
          </View>
        )}

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
    marginTop: 32,
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
  UserIcon: {
    marginRight: 18,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 18,
    fontWeight: 'normal',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  petListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  petCard: {
    width: '48%',
    backgroundColor: '#E6F3FE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#8FA3CB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 5,
    shadowRadius: 2,
  },
  petIcon: {
    marginRight: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  addPetButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addPetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    width: 32,
    height: 32,
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
