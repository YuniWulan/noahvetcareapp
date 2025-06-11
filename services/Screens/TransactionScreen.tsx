import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TransactionItem = {
  id: string;
  transactionNumber: string;
  date: string;
  itemCount: number;
  totalAmount: string;
};

type TransactionType = 'petshop' | 'petclinic';

type APIUserDetail = {
  id: number;
  name: string;
  email: string;
  username: string;
  is_doctor: boolean;
  speciality: string | null;
  phone: string | null;
};

type APITransactionDetail = {
  date: string;
  price: number;
  products: Array<{
    product_id: number;
    product_base_price: number;
    product_count: number;
  }>;
};

type APITransactionList = {
  transactions: Array<{
    id: number;
    date: string;
    price: number;
  }>;
};

type APIProduct = {
  id?: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
};

type APIProductList = {
  productData: APIProduct[];
};

type APIAppointmentList = {
  price?: number;
  appointments: Array<{
    appointment_id: number;
    pet_name: string;
    doctor_name: string;
    date: string;
    status: string;
    notes: string;
  }>;
};

type APIMedicalRecord = {
  record_id: number;
  doctor_id: number;
  pet_id: number;
  diagnosis: string;
  treatment: string;
  prescription: string;
  date: string;
  transaction_id: number;
};

type APIMedicalRecordList = {
  medical_records: APIMedicalRecord[];
};

const TransactionScreen = () => {
  const [activeTab, setActiveTab] = useState<TransactionType>('petshop');
  const [transactions, setTransactions] = useState<{
    petshop: TransactionItem[];
    petclinic: TransactionItem[];
  }>({
    petshop: [],
    petclinic: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<APIUserDetail | null>(null);

  // Get JWT token from AsyncStorage
  const getAuthToken = async (): Promise<string | null> => {
    try {
      let token = await AsyncStorage.getItem('authToken');
      console.log('🔑 Token from authToken key:', token ? 'Found' : 'Not found');
      
      if (!token) {
        token = await AsyncStorage.getItem('token');
        console.log('🔑 Token from token key:', token ? 'Found' : 'Not found');
      }
      
      if (token) {
        console.log('🔑 Final token (first 20 chars):', token.substring(0, 20) + '...');
      }
      
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  };

  // Get current user details
  const getCurrentUser = async (): Promise<APIUserDetail | null> => {
    try {
      console.log('👤 Getting current user details...');
      
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      let userId = await AsyncStorage.getItem('userId');
      console.log('🆔 User ID from userId key:', userId);
      
      if (!userId) {
        userId = await AsyncStorage.getItem('user_id');
        console.log('🆔 User ID from user_id key:', userId);
      }
      if (!userId) {
        throw new Error('No user ID found');
      }

      console.log('🌐 Fetching user details for ID:', userId);
      const response = await fetch(`https://noahvetcare.naufalalfa.com/v1/api/user/details/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 User details response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication failed - invalid token');
        }
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }

      const userData: APIUserDetail = await response.json();
      console.log('✅ User data received:', { id: userData.id, name: userData.name, email: userData.email });
      return userData;
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      throw error;
    }
  };

  // Format tanggal ke bahasa Indonesia
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long', 
        year: 'numeric'
      };
      return date.toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Format currency ke Rupiah
  const formatCurrency = (amount: number): string => {
    try {
      return `Rp${amount.toLocaleString('id-ID')}`;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `Rp${amount}`;
    }
  };

  // OPTIMIZED: Unified API fetcher with consistent endpoints
  const fetchOptimizedData = async (userID: number, token: string) => {
    try {
      console.log('🚀 Starting OPTIMIZED transaction loading...');
      
      // Define consistent API endpoints
      const API_ENDPOINTS = {
        pets: `https://noahvetcare.naufalalfa.com/v1/api/pet/lists/${userID}`,
        products: `https://noahvetcare.naufalalfa.com/v1/api/product/lists`,
        appointments: `https://noahvetcare.naufalalfa.com/v1/api/appointment/user/${userID}`,
        medicalRecords: (petId: number) => `https://noahvetcare.naufalalfa.com/v1/api/medical-record/pet/${petId}`,
        transactions: `https://noahvetcare.naufalalfa.com/v1/api/transaction/list/${userID}`,
        transactionDetails: (txId: number) => `https://noahvetcare.naufalalfa.com/v1/api/transaction/details/${txId}`
      };

      // Parallel fetch for main data
      const [transactionsResponse, appointmentsResponse, productsResponse] = await Promise.all([
        fetch(API_ENDPOINTS.transactions, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(API_ENDPOINTS.appointments, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(API_ENDPOINTS.products, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ]);

      // Process transactions
      let transactionData: APITransactionList = { transactions: [] };
      if (transactionsResponse.ok) {
        transactionData = await transactionsResponse.json();
        console.log('✅ Transactions fetched:', transactionData.transactions.length);
      }

      // Process appointments
      let appointmentData: APIAppointmentList = { appointments: [] };
      if (appointmentsResponse.ok) {
        appointmentData = await appointmentsResponse.json();
        console.log('✅ Appointments fetched:', appointmentData.appointments.length);
      }

      // Process products for category mapping
      let productCategoryMap = new Map<number, string>();
      if (productsResponse.ok) {
        const productData: APIProductList = await productsResponse.json();
        productData.productData.forEach((product, index) => {
          const productId = (product as any).id || (product as any).product_id || (index + 1);
          productCategoryMap.set(productId, product.category);
        });
        console.log('✅ Product categories mapped:', productCategoryMap.size);
      }

      // Get medical records for cross-reference
      const medicalTransactionIds = await fetchMedicalRecordsOptimized(userID, token, API_ENDPOINTS);

      return {
        transactionData,
        appointmentData,
        productCategoryMap,
        medicalTransactionIds,
        API_ENDPOINTS
      };
    } catch (error) {
      console.error('❌ Error in optimized data fetch:', error);
      throw error;
    }
  };

  // OPTIMIZED: Medical records fetcher
  const fetchMedicalRecordsOptimized = async (userID: number, token: string, endpoints: any) => {
    try {
      console.log('🏥 Fetching medical records for transaction cross-reference...');
      
      const petsResponse = await fetch(endpoints.pets, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      
      if (!petsResponse.ok) {
        console.warn('⚠️ Could not fetch pets, returning empty medical records');
        return new Set();
      }
      
      const petsData = await petsResponse.json();
      let allPets = [];
      
      if (petsData.pets && Array.isArray(petsData.pets)) {
        allPets = petsData.pets;
      } else if (petsData.data && Array.isArray(petsData.data)) {
        allPets = petsData.data;
      } else if (Array.isArray(petsData)) {
        allPets = petsData;
      }
      
      const userPets = allPets.filter((pet: any) => 
        pet.user_id === userID || pet.owner_id === userID || 
        pet.userId === userID || pet.ownerId === userID
      );
      
      const medicalTransactionIds = new Set();
      
      // Fetch medical records for each pet
      for (const pet of userPets) {
        try {
          const petId = pet.id || pet.pet_id;
          const medicalResponse = await fetch(endpoints.medicalRecords(petId), {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          
          if (medicalResponse.ok) {
            const medicalData = await medicalResponse.json();
            let records = [];
            
            if (medicalData.medical_records && Array.isArray(medicalData.medical_records)) {
              records = medicalData.medical_records;
            } else if (medicalData.data && Array.isArray(medicalData.data)) {
              records = medicalData.data;
            } else if (Array.isArray(medicalData)) {
              records = medicalData;
            }
            
            records.forEach((record: any) => {
              if (record.transaction_id) {
                medicalTransactionIds.add(record.transaction_id);
              }
            });
          }
        } catch (error) {
          console.warn(`⚠️ Could not fetch medical records for pet:`, error);
        }
      }
      
      console.log('🏥 Total medical transaction IDs:', medicalTransactionIds.size);
      return medicalTransactionIds;
    } catch (error) {
      console.error('❌ Error fetching medical records:', error);
      return new Set();
    }
  };

  // OPTIMIZED: Petshop transactions
  const processPetshopTransactions = async (data: any): Promise<TransactionItem[]> => {
    try {
      console.log('🛒 Processing petshop transactions...');
      const { transactionData, productCategoryMap, medicalTransactionIds, API_ENDPOINTS } = data;
      
      const result: TransactionItem[] = [];
      const token = await getAuthToken();
      
      for (const tx of transactionData.transactions) {
        try {
          // Skip if transaction is medical
          if (medicalTransactionIds.has(tx.id)) {
            console.log(`🏥 Transaction ${tx.id} is medical - skipping from petshop`);
            continue;
          }
          
          const detailResponse = await fetch(API_ENDPOINTS.transactionDetails(tx.id), {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          
          if (!detailResponse.ok) continue;
          
          const detail: APITransactionDetail = await detailResponse.json();
          
          if (detail.products && detail.products.length > 0) {
            // Check if has clinic products
            const hasClinicProducts = detail.products.some(product => {
              const category = productCategoryMap.get(product.product_id);
              return category && ['Medical Service', 'Consultation', 'Treatment', 'Surgery'].includes(category);
            });
            
            if (!hasClinicProducts) {
              const itemCount = detail.products.reduce((total, product) => total + product.product_count, 0);
              
              result.push({
                id: tx.id.toString(),
                transactionNumber: `#TX-${tx.id.toString().padStart(3, '0')}`,
                date: formatDate(detail.date),
                itemCount,
                totalAmount: formatCurrency(detail.price)
              });
            }
          }
        } catch (error) {
          console.error(`❌ Error processing transaction ${tx.id}:`, error);
        }
      }
      
      console.log('🛒 Final petshop transactions:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Error processing petshop transactions:', error);
      throw error;
    }
  };

  // OPTIMIZED: Petclinic transactions
  const processPetclinicTransactions = async (data: any): Promise<TransactionItem[]> => {
    try {
      console.log('🏥 Processing petclinic transactions...');
      const { appointmentData, transactionData } = data;
      const result: TransactionItem[] = [];
      
      // Process appointments
      for (const appointment of appointmentData.appointments) {
        let appointmentPrice = formatCurrency(75000); // Default consultation price
        
        // Try to get price from related transaction
        const relatedTx = transactionData.transactions.find((tx: any) => tx.id === appointment.appointment_id);
        if (relatedTx) {
          appointmentPrice = formatCurrency(relatedTx.price);
        } else if (appointmentData.price) {
          appointmentPrice = formatCurrency(appointmentData.price);
        }
        
        result.push({
          id: `apt-${appointment.appointment_id}`,
          transactionNumber: `#APT-${appointment.appointment_id.toString().padStart(3, '0')}`,
          date: formatDate(appointment.date),
          itemCount: 1,
          totalAmount: appointmentPrice
        });
      }
      
      console.log('🏥 Final petclinic transactions:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Error processing petclinic transactions:', error);
      throw error;
    }
  };

  // Main effect to load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      console.log('🚀 Starting OPTIMIZED transaction loading...');
      setLoading(true);
      setError(null);
      
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          throw new Error('Failed to get user information');
        }
        
        setCurrentUser(userData);
        
        const token = await getAuthToken();
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // Fetch all data in optimized way
        const optimizedData = await fetchOptimizedData(userData.id, token);
        
        // Process transactions
        const [petshopData, petclinicData] = await Promise.all([
          processPetshopTransactions(optimizedData),
          processPetclinicTransactions(optimizedData)
        ]);

        console.log('📊 OPTIMIZED Final results:');
        console.log('   Petshop transactions:', petshopData.length);
        console.log('   Petclinic records:', petclinicData.length);

        setTransactions({
          petshop: petshopData,
          petclinic: petclinicData
        });
        
        console.log('✅ OPTIMIZED transaction loading completed!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ Error loading optimized transactions:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    console.log('🔄 Refreshing transactions...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('👤 Refresh Step 1: Getting current user details...');
      const userData = await getCurrentUser();
      if (!userData) {
        throw new Error('Failed to get user information');
      }
      
      setCurrentUser(userData);
      
      console.log('🔑 Refresh Step 2: Getting auth token...');
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log('📊 Refresh Step 3: Fetching transactions and appointments...');
      const optimizedData = await fetchOptimizedData(userData.id, token);
      
      const [petshopData, petclinicData] = await Promise.all([
        processPetshopTransactions(optimizedData),
        processPetclinicTransactions(optimizedData)
      ]);

      setTransactions({
        petshop: petshopData,
        petclinic: petclinicData
      });
      
      console.log('✅ Refresh completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error refreshing transactions:', errorMessage);
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication') || errorMessage.includes('token') || errorMessage.includes('login')) {
        Alert.alert(
          'Authentication Required', 
          'Please login to refresh your transactions.',
          [
            { text: 'OK', onPress: () => {
              // Navigate to login screen
              // navigation.navigate('Login');
            }}
          ]
        );
      } else {
        Alert.alert('Error', `Failed to refresh transactions: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Refresh completed');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* FIXED: Simplified header without user name */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Riwayat Transaksi</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <MaterialIcons name="refresh" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'petshop' && styles.activeTab]}
            onPress={() => setActiveTab('petshop')}
          >   
            <Text style={[styles.tabText, activeTab === 'petshop' && styles.activeTabText]}>
              Petshop
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'petclinic' && styles.activeTab]}
            onPress={() => setActiveTab('petclinic')}
          >
            <Text style={[styles.tabText, activeTab === 'petclinic' && styles.activeTabText]}>
              Petclinic
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Memuat riwayat transaksi...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#F44336" />
            <Text style={styles.errorText}>Gagal memuat riwayat transaksi</Text>
            <Text style={styles.errorDetail}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {transactions[activeTab].length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="receipt-long" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>Belum ada riwayat transaksi</Text>
                <Text style={styles.emptySubText}>
                  {activeTab === 'petshop' 
                    ? 'Belum ada pembelian di petshop' 
                    : 'Belum ada kunjungan ke klinik'}
                </Text>
              </View>
            ) : (
              transactions[activeTab].map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <Text style={styles.transactionNumber}>
                    {transaction.transactionNumber}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.detailText}>
                      {activeTab === 'petshop' ? 'Barang' : 'Layanan'}: {transaction.itemCount}
                    </Text>
                    <Text style={styles.detailText}>Total: {transaction.totalAmount}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    marginTop: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TransactionScreen;