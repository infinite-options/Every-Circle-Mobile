import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "../components/BottomNavBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BOUNTY_RESULTS_ENDPOINT } from '../apiConfig';

const NetworkScreen = ({ navigation }) => {
  const [storageData, setStorageData] = useState([]);
  const [bountyData, setBountyData] = useState(null);
  const [bountyLoading, setBountyLoading] = useState(true);

  // Refactored bounty data loader
  const refreshBountyData = async () => {
    try {
      setBountyLoading(true);
      const profileId = await AsyncStorage.getItem('profile_uid');
      if (profileId) {
        const response = await fetch(`${BOUNTY_RESULTS_ENDPOINT}/${profileId}`);
        const result = await response.json();
        console.log('Bounty results:', result);
        setBountyData(result);
      }
    } catch (error) {
      console.error('Error loading bounty data:', error);
      setBountyData({ error: error.message });
    } finally {
      setBountyLoading(false);
    }
  };

  useEffect(() => {
    const loadAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const stores = await AsyncStorage.multiGet(keys);
        setStorageData(stores);
      } catch (e) {
        setStorageData([["error", e.message]]);
      }
    };
    loadAsyncStorage();
  }, []);

  useEffect(() => {
    refreshBountyData();
  }, []);

  return (
    <View style={styles.pageContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerBg}>
          <Text style={styles.header}>Network</Text>
        </View>
        {/* Main Content Card */}
        <ScrollView contentContainerStyle={styles.contentCard}>
          {/* AsyncStorage Debug Info */}
          <View style={{ marginTop: 0 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>AsyncStorage Contents:</Text>
            {storageData.length === 0 ? (
              <Text style={{ color: '#888' }}>No data in AsyncStorage.</Text>
            ) : (
              storageData.map(([key, value]) => (
                <View key={key} style={{ marginBottom: 8 }}>
                  <Text style={{ fontWeight: 'bold', color: '#333' }}>{key}:</Text>
                  <Text style={{ color: '#555', fontSize: 13 }}>{value}</Text>
                </View>
              ))
            )}
          </View>

          {/* Bounty Results */}
          <View style={{ marginTop: 30 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Bounty Results:</Text>
            {bountyLoading ? (
              <Text style={{ color: '#888' }}>Loading bounty data...</Text>
            ) : bountyData?.error ? (
              <Text style={{ color: 'red' }}>Error: {bountyData.error}</Text>
            ) : bountyData?.data ? (
              <View>
                {/* Totals */}
                <View style={styles.bountyTotals}>
                  <Text style={styles.bountyTotalText}>Total Transactions: {bountyData.total_bounties}</Text>
                  <Text style={styles.bountyTotalText}>Total Earned: ${bountyData.total_bounty_earned?.toFixed(2)}</Text>
                </View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>ID</Text>
                  <Text style={styles.tableHeaderCell}>Date</Text>
                  <Text style={styles.tableHeaderCell}>Purchaser</Text>
                  <Text style={styles.tableHeaderCell}>Business</Text>
                  <Text style={styles.tableHeaderCell}>Bounty</Text>
                </View>
                {/* Table Rows */}
                {bountyData.data.map((transaction, index) => {
                  // Format date to MM/DD
                  const formatDate = (dateString) => {
                    if (!dateString) return 'N/A';
                    const date = new Date(dateString);
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${month}/${day}`;
                  };
                  return (
                    <View key={transaction.transaction_uid || index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{transaction.transaction_uid}</Text>
                      <Text style={styles.tableCell}>{formatDate(transaction.transaction_datetime)}</Text>
                      <Text style={styles.tableCell}>{transaction.transaction_profile_id || 'N/A'}</Text>
                      <Text style={styles.tableCell}>{transaction.transaction_business_id || 'N/A'}</Text>
                      <Text style={styles.tableCell}>${transaction.bounty_earned?.toFixed(2)}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: '#888' }}>No bounty data available.</Text>
            )}
          </View>
        </ScrollView>
        <BottomNavBar navigation={navigation} onSharePress={refreshBountyData} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBg: {
    backgroundColor: "#8b58f9",
    paddingVertical: 15,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 0,
  },
  header: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 6,
    padding: 4,
    flexGrow: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bountyTotals: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  bountyTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#9C45F7',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 2,
  },
  tableHeaderCell: {
    flex: 0.2,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 0,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 0.2,
    fontSize: 12,
    paddingHorizontal: 0,
    color: '#333',
  },
});

export default NetworkScreen;
