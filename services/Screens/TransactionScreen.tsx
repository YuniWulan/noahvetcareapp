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

// Helper function to create mock response with json method
const createMockResponse = (data: any, ok: boolean = false): Response => {
  return {
    ok,
    json: () => Promise.resolve(data),
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Error'
  } as Response;
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
        console.warn('⚠️ No authentication token found');
        return null;
      }

      let userId = await AsyncStorage.getItem('userId');
      console.log('🆔 User ID from userId key:', userId);
      
      if (!userId) {
        userId = await AsyncStorage.getItem('user_id');
        console.log('🆔 User ID from user_id key:', userId);
      }
      if (!userId) {
        console.warn('⚠️ No user ID found');
        return null;
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
        console.warn(`⚠️ Failed to fetch user details: ${response.status}`);
        return null;
      }

      const userData: APIUserDetail = await response.json();
      console.log('✅ User data received:', { id: userData.id, name: userData.name, email: userData.email });
      return userData;
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      return null;
    }
  };

  // Format tanggal ke bahasa Indonesia
  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return 'Tanggal tidak tersedia';
      
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
      return dateString || 'Tanggal tidak tersedia';
    }
  };

  // Format currency ke Rupiah
  const formatCurrency = (amount: number): string => {
    try {
      if (isNaN(amount) || amount === null || amount === undefined) {
        return 'Rp0';
      }
      return `Rp${amount.toLocaleString('id-ID')}`;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `Rp${amount || 0}`;
    }
  };

  // FIXED: Safe array access with null checks
  const safeArrayAccess = (data: any, fallback: any[] = []): any[] => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    if (data.transactions && Array.isArray(data.transactions)) return data.transactions;
    if (data.appointments && Array.isArray(data.appointments)) return data.appointments;
    if (data.productData && Array.isArray(data.productData)) return data.productData;
    if (data.medical_records && Array.isArray(data.medical_records)) return data.medical_records;
    if (data.pets && Array.isArray(data.pets)) return data.pets;
    if (data.data && Array.isArray(data.data)) return data.data;
    return fallback;
  };

  // OPTIMIZED: Unified API fetcher with consistent endpoints and better error handling
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

      // Parallel fetch for main data with error handling
      const fetchPromises = [
        fetch(API_ENDPOINTS.transactions, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }).catch(err => {
          console.warn('⚠️ Failed to fetch transactions:', err);
          return createMockResponse({ transactions: [] }, false);
        }),
        fetch(API_ENDPOINTS.appointments, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }).catch(err => {
          console.warn('⚠️ Failed to fetch appointments:', err);
          return createMockResponse({ appointments: [] }, false);
        }),
        fetch(API_ENDPOINTS.products, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }).catch(err => {
          console.warn('⚠️ Failed to fetch products:', err);
          return createMockResponse({ productData: [] }, false);
        })
      ];

      const [transactionsResponse, appointmentsResponse, productsResponse] = await Promise.all(fetchPromises);

      // Process transactions with safe access
      let transactionData: APITransactionList = { transactions: [] };
      try {
        if (transactionsResponse.ok) {
          const rawData = await transactionsResponse.json();
          transactionData.transactions = safeArrayAccess(rawData);
          console.log('✅ Transactions fetched:', transactionData.transactions.length);
        }
      } catch (error) {
        console.warn('⚠️ Error processing transaction data:', error);
      }

      // Process appointments with safe access
      let appointmentData: APIAppointmentList = { appointments: [] };
      try {
        if (appointmentsResponse.ok) {
          const rawData = await appointmentsResponse.json();
          appointmentData.appointments = safeArrayAccess(rawData);
          appointmentData.price = rawData?.price;
          console.log('✅ Appointments fetched:', appointmentData.appointments.length);
        }
      } catch (error) {
        console.warn('⚠️ Error processing appointment data:', error);
      }

      // Process products for category mapping with safe access
      let productCategoryMap = new Map<number, string>();
      try {
        if (productsResponse.ok) {
          const rawData = await productsResponse.json();
          const productArray = safeArrayAccess(rawData);
          productArray.forEach((product, index) => {
            if (product && typeof product === 'object') {
              const productId = product.id || product.product_id || (index + 1);
              const category = product.category || 'Unknown';
              productCategoryMap.set(productId, category);
            }
          });
          console.log('✅ Product categories mapped:', productCategoryMap.size);
        }
      } catch (error) {
        console.warn('⚠️ Error processing product data:', error);
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
      // Return safe default data instead of throwing
      return {
        transactionData: { transactions: [] },
        appointmentData: { appointments: [] },
        productCategoryMap: new Map(),
        medicalTransactionIds: new Set(),
        API_ENDPOINTS: {}
      };
    }
  };

  // OPTIMIZED: Medical records fetcher with better error handling
  const fetchMedicalRecordsOptimized = async (userID: number, token: string, endpoints: any) => {
    try {
      console.log('🏥 Fetching medical records for transaction cross-reference...');
      
      if (!endpoints.pets) {
        console.warn('⚠️ No pets endpoint available');
        return new Set();
      }

      const petsResponse = await fetch(endpoints.pets, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }).catch(err => {
        console.warn('⚠️ Failed to fetch pets:', err);
        return createMockResponse(null, false);
      });
      
      if (!petsResponse.ok) {
        console.warn('⚠️ Could not fetch pets, returning empty medical records');
        return new Set();
      }
      
      const petsData = await petsResponse.json().catch(err => {
        console.warn('⚠️ Error parsing pets data:', err);
        return null;
      });

      if (!petsData) {
        return new Set();
      }
      
      const allPets = safeArrayAccess(petsData);
      
      const userPets = allPets.filter((pet: any) => {
        if (!pet || typeof pet !== 'object') return false;
        return pet.user_id === userID || pet.owner_id === userID || 
               pet.userId === userID || pet.ownerId === userID;
      });
      
      const medicalTransactionIds = new Set();
      
      // Fetch medical records for each pet with error handling
      for (const pet of userPets) {
        try {
          if (!pet || typeof pet !== 'object') continue;
          
          const petId = pet.id || pet.pet_id;
          if (!petId) continue;

          const medicalResponse = await fetch(endpoints.medicalRecords(petId), {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }).catch(err => {
            console.warn(`⚠️ Failed to fetch medical records for pet ${petId}:`, err);
            return createMockResponse(null, false);
          });
          
          if (medicalResponse.ok) {
            const medicalData = await medicalResponse.json().catch(err => {
              console.warn(`⚠️ Error parsing medical data for pet ${petId}:`, err);
              return null;
            });
            
            if (medicalData) {
              const records = safeArrayAccess(medicalData);
              records.forEach((record: any) => {
                if (record && record.transaction_id) {
                  medicalTransactionIds.add(record.transaction_id);
                }
              });
            }
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

  // OPTIMIZED: Petshop transactions with better error handling
  const processPetshopTransactions = async (data: any): Promise<TransactionItem[]> => {
    try {
      console.log('🛒 Processing petshop transactions...');
      
      if (!data || !data.transactionData) {
        console.warn('⚠️ No transaction data available for petshop');
        return [];
      }

      const { transactionData, productCategoryMap, medicalTransactionIds, API_ENDPOINTS } = data;
      
      const result: TransactionItem[] = [];
      const token = await getAuthToken();
      
      if (!token) {
        console.warn('⚠️ No token available for fetching transaction details');
        return [];
      }

      const transactions = safeArrayAccess(transactionData);
      
      for (const tx of transactions) {
        try {
          if (!tx || typeof tx !== 'object' || !tx.id) continue;

          // Skip if transaction is medical
          if (medicalTransactionIds.has(tx.id)) {
            console.log(`🏥 Transaction ${tx.id} is medical - skipping from petshop`);
            continue;
          }
          
          if (!API_ENDPOINTS.transactionDetails) continue;

          const detailResponse = await fetch(API_ENDPOINTS.transactionDetails(tx.id), {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }).catch(err => {
            console.warn(`⚠️ Failed to fetch details for transaction ${tx.id}:`, err);
            return createMockResponse(null, false);
          });
          
          if (!detailResponse.ok) continue;
          
          const detail: APITransactionDetail = await detailResponse.json().catch(err => {
            console.warn(`⚠️ Error parsing transaction detail ${tx.id}:`, err);
            return null;
          });
          
          if (!detail || !detail.products) continue;

          const products = safeArrayAccess(detail.products);
          
          if (products.length > 0) {
            // Check if has clinic products
            const hasClinicProducts = products.some(product => {
              if (!product || !product.product_id) return false;
              const category = productCategoryMap.get(product.product_id);
              return category && ['Medical Service', 'Consultation', 'Treatment', 'Surgery'].includes(category);
            });
            
            if (!hasClinicProducts) {
              const itemCount = products.reduce((total, product) => {
                if (!product || typeof product.product_count !== 'number') return total;
                return total + product.product_count;
              }, 0);
              
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
      return [];
    }
  };

  // OPTIMIZED: Petclinic transactions with better error handling
  const processPetclinicTransactions = async (data: any): Promise<TransactionItem[]> => {
    try {
      console.log('🏥 Processing petclinic transactions...');
      
      if (!data || !data.appointmentData) {
        console.warn('⚠️ No appointment data available for petclinic');
        return [];
      }

      const { appointmentData, transactionData } = data;
      const result: TransactionItem[] = [];
      
      const appointments = safeArrayAccess(appointmentData);
      const transactions = safeArrayAccess(transactionData);
      
      // Process appointments
      for (const appointment of appointments) {
        try {
          if (!appointment || typeof appointment !== 'object' || !appointment.appointment_id) continue;

          let appointmentPrice = formatCurrency(75000); // Default consultation price
          
          // Try to get price from related transaction
          const relatedTx = transactions.find((tx: any) => 
            tx && tx.id === appointment.appointment_id
          );
          
          if (relatedTx && typeof relatedTx.price === 'number') {
            appointmentPrice = formatCurrency(relatedTx.price);
          } else if (appointmentData.price && typeof appointmentData.price === 'number') {
            appointmentPrice = formatCurrency(appointmentData.price);
          }
          
          result.push({
            id: `apt-${appointment.appointment_id}`,
            transactionNumber: `#APT-${appointment.appointment_id.toString().padStart(3, '0')}`,
            date: formatDate(appointment.date),
            itemCount: 1,
            totalAmount: appointmentPrice
          });
        } catch (error) {
          console.error(`❌ Error processing appointment ${appointment?.appointment_id}:`, error);
        }
      }
      
      console.log('🏥 Final petclinic transactions:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Error processing petclinic transactions:', error);
      return [];
    }
  };

  // Main effect to load transactions with better error handling
  useEffect(() => {
    const loadTransactions = async () => {
      console.log('🚀 Starting OPTIMIZED transaction loading...');
      setLoading(true);
       
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          console.warn('⚠️ No user data available - showing empty state');
          setTransactions({
            petshop: [],
            petclinic: []
          });
          return;
        }
        
        setCurrentUser(userData);
        
        const token = await getAuthToken();
        if (!token) {
          console.warn('⚠️ No authentication token - showing empty state');
          setTransactions({
            petshop: [],
            petclinic: []
          });
          return;
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
        console.error('❌ Error loading optimized transactions:', err);
        // Set empty data instead of showing error
        setTransactions({
          petshop: [],
          petclinic: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Refresh data with better error handling
  const handleRefresh = async () => {
    console.log('🔄 Refreshing transactions...');
    setLoading(true); 
    
    try {
      console.log('👤 Refresh Step 1: Getting current user details...');
      const userData = await getCurrentUser();
      if (!userData) {
        console.warn('⚠️ No user data available during refresh');
        setTransactions({
          petshop: [],
          petclinic: []
        });
        return;
      }
      
      setCurrentUser(userData);
      
      console.log('🔑 Refresh Step 2: Getting auth token...');
      const token = await getAuthToken();
      if (!token) {
        console.warn('⚠️ No authentication token during refresh');
        setTransactions({
          petshop: [],
          petclinic: []
        });
        return;
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
      console.error('❌ Error refreshing transactions:', err);
      // Just set empty data, don't show error dialog
      setTransactions({
        petshop: [],
        petclinic: []
      });
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
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {transactions[activeTab].length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons 
                  name="receipt-long" 
                  size={64} 
                  color="#E0E0E0" 
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyStateText}>
                  {activeTab === 'petshop' 
                    ? 'Belum ada transaksi petshop' 
                    : 'Belum ada transaksi petclinic'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {activeTab === 'petshop' 
                    ? 'Transaksi pembelian akan muncul di sini' 
                    : 'Transaksi klinik akan muncul di sini'}
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
  // Updated empty state styles to match ReservationListScreen
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9E9E9E',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BDBDBD',
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