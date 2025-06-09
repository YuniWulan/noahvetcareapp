import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type TransactionItem = {
  id: string;
  transactionNumber: string;
  date: string;
  itemCount: number;
  totalAmount: string;
};

type TransactionType = 'petshop' | 'petclinic';

const TransactionScreen = () => {
  const [activeTab, setActiveTab] = useState<TransactionType>('petshop');

  const transactions = {
    petshop: [
      {
        id: '1',
        transactionNumber: '#017',
        date: 'Senin, 19 Mei 2025',
        itemCount: 2,
        totalAmount: 'Rp128.000'
      },
      {
        id: '2',
        transactionNumber: '#018',
        date: 'Selasa, 20 Mei 2025',
        itemCount: 3,
        totalAmount: 'Rp185.000'
      },
    ],
    petclinic: [
      {
        id: '1',
        transactionNumber: '#CL-005',
        date: 'Rabu, 21 Mei 2025',
        itemCount: 1,
        totalAmount: 'Rp75.000'
      },
      {
        id: '2',
        transactionNumber: '#CL-006',
        date: 'Kamis, 22 Mei 2025',
        itemCount: 2,
        totalAmount: 'Rp150.000'
      },
    ]
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Transaction</Text>
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {transactions[activeTab].map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <Text style={styles.transactionNumber}>
              Transaksi {transaction.transactionNumber}
            </Text>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
            <View style={styles.transactionDetails}>
              <Text style={styles.detailText}>Items: {transaction.itemCount}</Text>
              <Text style={styles.detailText}>Total: {transaction.totalAmount}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 20,
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