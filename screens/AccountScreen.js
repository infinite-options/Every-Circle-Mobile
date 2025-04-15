import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuBar from "../components/MenuBar";

export default function AccountScreen({ navigation }) {
  const [userUID, setUserUID] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  // Check authentication on mount to ensure we're not losing the auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add a small delay to ensure AsyncStorage is properly populated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const uid = await AsyncStorage.getItem("user_uid");
        console.log("AccountScreen - User UID:", uid);
        
        // Update state with UID and stop loading
        setUserUID(uid || '');
        setIsLoading(false);
        
        // Log a warning if UID is missing but don't redirect
        if (!uid) {
          console.warn("AccountScreen - No user UID found, but not redirecting");
        }
      } catch (error) {
        console.error("AccountScreen - Error checking authentication:", error);
        setIsLoading(false);
        setUserUID('');
      }
    };
    
    checkAuth();
  }, []);

  // Transaction history data
  const transactions = [
    { date: '1/10', description: 'Santa Claus & ABC Plumbing', amount: '$0.10' },
    { date: '1/10', description: 'Santa Claus & ABC Plumbing', amount: '$0.10' },
    { date: '1/10', description: 'Santa Claus & ABC Plumbing', amount: '$0.10' },
    { date: '1/10', description: 'Santa Claus & ABC Plumbing', amount: '$0.10' },
    { date: '1/10', description: 'Santa Claus & ABC Plumbing', amount: '$0.10' },
    { date: '1/10', description: 'Santa Claus & ABC Plumbing', amount: '$0.10' }
  ];

  // Budget data
  const budgetData = [
    { item: 'per Impression', costPer: '$0.01', monthlyCap: '$10.00', currentSpend: '$ 0.50' },
    { item: 'per Click', costPer: '$0.10', monthlyCap: '$10.00', currentSpend: '$ 7.20' },
    { item: 'per Request', costPer: '$1.00', monthlyCap: '$10.00', currentSpend: '$ 3.00' }
  ];

  // Simple chart component
  const NetEarningChart = () => {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          <View style={styles.chartBar}></View>
          <View style={styles.chartBar}></View>
          <View style={styles.chartBar}></View>
          <View style={styles.chartBar}></View>
          <View style={styles.chartBar}></View>
          <View style={styles.chartBar}></View>
          <View style={styles.chartBar}></View>
          <View style={[styles.chartBar, { height: 80 }]}></View>
          <View style={[styles.chartBar, { height: 100 }]}></View>
          <View style={[styles.chartBar, { height: 120, backgroundColor: '#B71C1C' }]}></View>
          <View style={[styles.chartBar, { height: 60, backgroundColor: '#B71C1C' }]}></View>
          <View style={styles.chartBar}></View>
        </View>
      </View>
    );
  };

  // Display a loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Loading account data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      {/* Main content */}
      <ScrollView style={styles.contentContainer}>
        {/* Balance section */}
        <View style={styles.balanceContainer}>
          <Text style={styles.sectionLabel}>Balance:</Text>
          <Text style={styles.balanceAmount}>$48.20</Text>
        </View>

        {/* Budget section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Budget</Text>
            <View style={styles.questionCircle}>
              <Text style={styles.questionMark}>?</Text>
            </View>
          </View>
          
          <View style={styles.tableContainer}>
            {/* Budget header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}></Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Cost per</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Monthly Cap</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Current Spend</Text>
            </View>
            
            {/* Budget rows */}
            {budgetData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.5, color: '#777' }]}>{item.item}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: '#777' }]}>{item.costPer}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: '#777' }]}>{item.monthlyCap}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', color: '#777' }]}>{item.currentSpend}</Text>
              </View>
            ))}
            
            {/* Max monthly spend */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5, color: '#777' }]}>Max Monthly Spend</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 5}}>
                <View style={styles.questionCircle}>
                  <Text style={styles.questionMark}>?</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, { flex: 0.2, color: '#777' }]}>:</Text>
              <Text style={[styles.tableCell, { flex: 1, color: '#777' }]}>$30.00</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', color: '#777' }]}>$10.70</Text>
            </View>
          </View>
        </View>
        
        {/* Transaction history */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <View style={styles.questionCircle}>
              <Text style={styles.questionMark}>?</Text>
            </View>
          </View>
          
          <View style={styles.transactionsContainer}>
            {transactions.map((transaction, index) => (
              <View key={index} style={styles.transactionRow}>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                <Text style={styles.transactionDesc}>{transaction.description}</Text>
                <Text style={styles.transactionAmount}>{transaction.amount}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Net Earning */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Net Earning</Text>
          <NetEarningChart />
        </View>
      </ScrollView>
      
      {/* Bottom Menu Bar - passing navigation to ensure proper functioning */}
      <MenuBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#9C45F7",
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  questionCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  questionMark: {
    fontSize: 10,
    fontWeight: "bold",
  },
  tableContainer: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  tableHeaderText: {
    fontSize: 12,
    color: "#888",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  tableCell: {
    fontSize: 12,
  },
  transactionsContainer: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 6,
  },
  transactionRow: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  transactionDate: {
    width: 40,
    fontSize: 12,
    color: "#888",
  },
  transactionDesc: {
    flex: 1,
    fontSize: 12,
  },
  transactionAmount: {
    width: 50,
    fontSize: 12,
    textAlign: "right",
  },
  chartContainer: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
  },
  chartBar: {
    width: 4,
    height: 2,
    backgroundColor: "black",
    marginHorizontal: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});
