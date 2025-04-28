import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuBar from "../components/MenuBar";
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle } from "react-native-svg";

export default function AccountScreen({ navigation }) {
  const [userUID, setUserUID] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await new Promise(r => setTimeout(r, 500));
        const uid = await AsyncStorage.getItem("user_uid");
        setUserUID(uid || "");
        setIsLoading(false);
        if (!uid) console.warn("AccountScreen - No user UID found");
      } catch (error) {
        console.error("AccountScreen - Error checking authentication:", error);
        setUserUID("");
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

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
    { item: "per Click",      costPer: "$0.10", monthlyCap: "$10.00", currentSpend: "$7.20" },
    { item: "per Request",    costPer: "$1.00", monthlyCap: "$10.00", currentSpend: "$3.00" },
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
        data: [0,0,0,0,0,0,0,0,3390,3390,0,0],
        color: () => "#B71C1C",
        strokeWidth: 3,
      },
      {
        data: [0,0,0,0,0,0,0,0,2890,0,0,0],
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
        return v >= 1000
          ? `$${(v / 1000).toFixed(2)}K`
          : `$${v.toFixed(2)}`;
      }}
      style={{ marginVertical: 8 }}
      renderDotContent={({ x, y, index, dataset }) => {
        // black line single dot at index 8
        if (dataset === data.datasets[0] && [8,10,11].includes(index)) {
          return <Circle cx={x} cy={y} r={4} fill="black" />;
        }
        // red line two dots at indices 8 & 9
        if (dataset === data.datasets[1] && (index === 8 || index === 9)) {
          return <Circle cx={x} cy={y - 4} r={4} fill="#B71C1C" />;
        }
        return null;
      }}
    />
  );

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
                <Text style={[styles.tableHeaderText, { fontSize: 16, fontWeight: "600" }]}>
                  Budget
                </Text>
                <View style={[styles.questionCircle, { marginLeft: 4 }]}>
                  <Text style={styles.questionMark}>?</Text>
                </View>
              </View>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Cost per</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Monthly Cap</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>
                Current Spend
              </Text>
            </View>
            {budgetData.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.5, color: "#777" }]}>{item.item}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: "#777" }]}>{item.costPer}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: "#777" }]}>{item.monthlyCap}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right", color: "#777" }]}>
                  {item.currentSpend}
                </Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5, color: "#777" }]}>
                Max Monthly Spend
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
                <View style={styles.questionCircle}>
                  <Text style={styles.questionMark}>?</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, { flex: 0.2, color: "#777" }]}>:</Text>
              <Text style={[styles.tableCell, { flex: 1, color: "#777" }]}>$30.00</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "right", color: "#777" }]}>
                $10.70
              </Text>
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
      </ScrollView>

      <MenuBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: "#fff" },
  header:               {
    backgroundColor:     "#9C45F7",
    paddingTop:          50,
    paddingBottom:       20,
    alignItems:          "center",
    justifyContent:      "center",
    borderBottomLeftRadius:  100,
    borderBottomRightRadius: 100,
  },
  title:                { fontSize: 24, fontWeight: "bold", color: "#fff" },
  contentContainer:     { flex: 1, padding: 20 },
  balanceContainer:     {
    flexDirection:       "row",
    justifyContent:      "space-between",
    alignItems:          "center",
    marginBottom:        20,  
  },
  sectionLabel:         { fontSize: 16, fontWeight: "600" },
  balanceAmount:        { fontSize: 16, fontWeight: "600" },
  sectionContainer:     { marginBottom: 24 },
  sectionTitle:         { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  sectionTitleRow:      { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  questionCircle:       {
    width:               12,
    height:              12,
    borderRadius:        8,
    borderWidth:         1,
    borderColor:         "#000",
    justifyContent:      "center",
    alignItems:          "center",
    marginLeft:          5,
  },
  questionMark:         { fontSize: 8, fontWeight: "bold" },
  tableContainer:       { backgroundColor: "transparent", paddingVertical: 6 },
  tableHeader:          { flexDirection: "row", paddingVertical: 6 },
  tableHeaderText:      { fontSize: 12, color: "#000" },
  tableRow:             { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  tableCell:            { fontSize: 12 },
  transactionsContainer:{ backgroundColor: "transparent", paddingVertical: 6 },
  transactionRow:       { flexDirection: "row", paddingVertical: 10 },
  transactionDate:      { width: 40,  fontSize: 12, color: "#888" },
  transactionDesc:      { flex: 1,   fontSize: 12 },
  transactionAmount:    { width: 50,  fontSize: 12, textAlign: "right" },
  centeredContainer:    { flex: 1, justifyContent: "center", alignItems: "center" },
});
