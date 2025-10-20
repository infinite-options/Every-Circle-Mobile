import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { BOUNTY_RESULTS_ENDPOINT } from "../apiConfig";
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle } from "react-native-svg";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
export default function AccountScreen({ navigation }) {
  const [userUID, setUserUID] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bountyData, setBountyData] = useState(null);
  const [bountyLoading, setBountyLoading] = useState(true);
  // above your effect or focus logic
  const checkAuth = async () => {
    try {
      const uid = await AsyncStorage.getItem("user_uid");
      setUserUID(uid ?? "");
    } catch {
      setUserUID("");
    } finally {
      setIsLoading(false);
    }
  };

  // Bounty data loader
  const refreshBountyData = async () => {
    try {
      setBountyLoading(true);
      const profileId = await AsyncStorage.getItem("profile_uid");
      if (profileId) {
        const response = await fetch(`${BOUNTY_RESULTS_ENDPOINT}/${profileId}`);

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check content type to ensure we're getting JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("Non-JSON response received:", textResponse.substring(0, 200));
          throw new Error("API returned non-JSON response. Please check the endpoint.");
        }

        const result = await response.json();
        console.log("Bounty results:", result);
        setBountyData(result);
      }
    } catch (error) {
      console.error("Error loading bounty data:", error);
      setBountyData({ error: error.message });
    } finally {
      setBountyLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth();
      refreshBountyData();
    }, [])
  );

  const transactions = [
    { date: "1/10", description: "Santa Claus & ABC Plumbing", amount: "$0.10" },
    { date: "1/10", description: "Santa Claus & ABC Plumbing", amount: "$0.10" },
    { date: "1/10", description: "Santa Claus & ABC Plumbing", amount: "$0.10" },
    { date: "1/10", description: "Santa Claus & ABC Plumbing", amount: "$0.10" },
    { date: "1/10", description: "Santa Claus & ABC Plumbing", amount: "$0.10" },
    { date: "1/10", description: "Santa Claus & ABC Plumbing", amount: "$0.10" },
  ];

  const budgetData = [
    { item: "per Impression", costPer: "$0.01", monthlyCap: "$10.00", currentSpend: "$0.50" },
    { item: "per Click", costPer: "$0.10", monthlyCap: "$10.00", currentSpend: "$7.20" },
    { item: "per Request", costPer: "$1.00", monthlyCap: "$10.00", currentSpend: "$3.00" },
  ];

  const screenWidth = Dimensions.get("window").width - 40;

  const chartConfig = {
    backgroundColor: "#f5f5f5",
    backgroundGradientFrom: "#f5f5f5",
    backgroundGradientTo: "#f5f5f5",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(100,100,100,${opacity})`,
    labelColor: (opacity = 1) => `rgba(100,100,100,${opacity})`,
    propsForBackgroundLines: {
      stroke: "#ddd",
      strokeWidth: 1,
    },
  };

  const data = {
    labels: Array(12).fill(""),
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0, 0, 3390, 3390, 0, 0],
        color: () => "#B71C1C",
        strokeWidth: 3,
      },
      {
        data: [0, 0, 0, 0, 0, 0, 0, 0, 2890, 0, 0, 0],
        color: () => "black",
        strokeWidth: 3,
      },
    ],
  };

  const NetEarningChart = () => (
    <LineChart
      data={data}
      width={screenWidth}
      height={180}
      chartConfig={chartConfig}
      segments={7}
      withHorizontalLines={true}
      withVerticalLines={false}
      withDots={true}
      propsForDots={{ r: 0 }}
      withShadow={false}
      formatYLabel={(y) => {
        const v = parseFloat(y);
        return v >= 1000 ? `$${(v / 1000).toFixed(2)}K` : `$${v.toFixed(2)}`;
      }}
      style={{ marginVertical: 8 }}
      renderDotContent={({ x, y, index, dataset }) => {
        // black line single dot at index 8
        if (dataset === data.datasets[0] && [8, 10, 11].includes(index)) {
          return <Circle cx={x} cy={y} r={4} fill='black' />;
        }
        // red line two dots at indices 8 & 9
        if (dataset === data.datasets[1] && (index === 8 || index === 9)) {
          return <Circle cx={x} cy={y - 4} r={4} fill='#B71C1C' />;
        }
        return null;
      }}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size='large' color='#007BFF' />
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
      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={true}>
        {/* Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.sectionLabel}>Balance:</Text>
          <Text style={styles.balanceAmount}>$48.20</Text>
        </View>

        {/* Budget */}
        <View style={styles.sectionContainer}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.tableHeaderText, { fontSize: 16, fontWeight: "600" }]}>Budget</Text>
                <View style={[styles.questionCircle, { marginLeft: 4 }]}>
                  <Text style={styles.questionMark}>?</Text>
                </View>
              </View>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Cost per</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Monthly Cap</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>Current Spend</Text>
            </View>
            {budgetData.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.5, color: "#777" }]}>{item.item}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: "#777" }]}>{item.costPer}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: "#777" }]}>{item.monthlyCap}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right", color: "#777" }]}>{item.currentSpend}</Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5, color: "#777" }]}>Max Monthly Spend</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
                <View style={styles.questionCircle}>
                  <Text style={styles.questionMark}>?</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, { flex: 0.2, color: "#777" }]}>:</Text>
              <Text style={[styles.tableCell, { flex: 1, color: "#777" }]}>$30.00</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "right", color: "#777" }]}>$10.70</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <View style={styles.questionCircle}>
              <Text style={styles.questionMark}>?</Text>
            </View>
          </View>
          <View style={styles.transactionsContainer}>
            {transactions.map((t, i) => (
              <View key={i} style={styles.transactionRow}>
                <Text style={styles.transactionDate}>{t.date}</Text>
                <Text style={styles.transactionDesc}>{t.description}</Text>
                <Text style={styles.transactionAmount}>{t.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Net Earning */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Net Earning</Text>
          <NetEarningChart />
        </View>

        {/* Bounty Results */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Bounty Results</Text>
          {bountyLoading ? (
            <Text style={styles.loadingText}>Loading bounty data...</Text>
          ) : bountyData?.error ? (
            <Text style={styles.errorText}>Error: {bountyData.error}</Text>
          ) : bountyData?.data ? (
            <View>
              {/* Totals */}
              <View style={styles.bountyTotals}>
                <Text style={styles.bountyTotalText}>Total Transactions: {bountyData.total_bounties}</Text>
                <Text style={styles.bountyTotalText}>Total Earned: ${bountyData.total_bounty_earned?.toFixed(2)}</Text>
              </View>
              {/* Table Header */}
              <View style={styles.bountyTableHeader}>
                <Text style={styles.bountyTableHeaderCell}>ID</Text>
                <Text style={styles.bountyTableHeaderCell}>Date</Text>
                <Text style={styles.bountyTableHeaderCell}>Purchaser</Text>
                <Text style={styles.bountyTableHeaderCell}>Business</Text>
                <Text style={styles.bountyTableHeaderCell}>Bounty</Text>
              </View>
              {/* Table Rows */}
              {bountyData.data.map((transaction, index) => {
                // Format date to MM/DD
                const formatDate = (dateString) => {
                  if (!dateString) return "N/A";
                  const date = new Date(dateString);
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  return `${month}/${day}`;
                };
                return (
                  <View key={transaction.transaction_uid || index} style={styles.bountyTableRow}>
                    <Text style={styles.bountyTableCell}>{transaction.transaction_uid}</Text>
                    <Text style={styles.bountyTableCell}>{formatDate(transaction.transaction_datetime)}</Text>
                    <Text style={styles.bountyTableCell}>{transaction.transaction_profile_id || "N/A"}</Text>
                    <Text style={styles.bountyTableCell}>{transaction.transaction_business_id || "N/A"}</Text>
                    <Text style={styles.bountyTableCell}>${transaction.bounty_earned?.toFixed(2)}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noDataText}>No bounty data available.</Text>
          )}
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#9C45F7",
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  contentContainer: { flex: 1, padding: 20 },
  scrollContentContainer: {
    paddingBottom: 120, // Extra padding to ensure content is visible above BottomNavBar
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionLabel: { fontSize: 16, fontWeight: "600" },
  balanceAmount: { fontSize: 16, fontWeight: "600" },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  questionCircle: {
    width: 12,
    height: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  questionMark: { fontSize: 8, fontWeight: "bold" },
  tableContainer: { backgroundColor: "transparent", paddingVertical: 6 },
  tableHeader: { flexDirection: "row", paddingVertical: 6 },
  tableHeaderText: { fontSize: 12, color: "#000" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  tableCell: { fontSize: 12 },
  transactionsContainer: { backgroundColor: "transparent", paddingVertical: 6 },
  transactionRow: { flexDirection: "row", paddingVertical: 10 },
  transactionDate: { width: 40, fontSize: 12, color: "#888" },
  transactionDesc: { flex: 1, fontSize: 12 },
  transactionAmount: { width: 50, fontSize: 12, textAlign: "right" },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Bounty Results styles
  bountyTotals: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  bountyTotalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  bountyTableHeader: {
    flexDirection: "row",
    backgroundColor: "#9C45F7",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 2,
  },
  bountyTableHeaderCell: {
    flex: 0.2,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    paddingHorizontal: 0,
  },
  bountyTableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bountyTableCell: {
    flex: 0.2,
    fontSize: 12,
    paddingHorizontal: 0,
    color: "#333",
  },
  loadingText: {
    color: "#888",
  },
  errorText: {
    color: "red",
  },
  noDataText: {
    color: "#888",
  },
});
