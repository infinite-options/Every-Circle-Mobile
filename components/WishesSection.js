import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";

const WishesSection = ({ wishes, setWishes, toggleVisibility, isPublic, handleDelete }) => {
  const addWish = () => {
    const newEntry = { helpNeeds: "", details: "", amount: "", isPublic: false };
    setWishes([...wishes, newEntry]);
  };

  const deleteWish = (index) => {
    handleDelete(index);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...wishes];
    updated[index][field] = value;
    setWishes(updated);
  };

  const toggleEntryVisibility = (index) => {
    const updated = [...wishes];
    updated[index].isPublic = !updated[index].isPublic;
    setWishes(updated);
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Wishes</Text>
          <TouchableOpacity onPress={addWish}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={toggleVisibility}>
          <Text style={[styles.toggleText, { color: isPublic ? "#4CAF50" : "#f44336" }]}>{isPublic ? "Public" : "Private"}</Text>
        </TouchableOpacity>
      </View>

      {wishes.map((item, index) => (
        <View key={index} style={[styles.card, index > 0 && styles.cardSpacing]}>
          <View style={styles.rowHeader}>
            <Text style={styles.label}>Wish #{index + 1}</Text>
            <TouchableOpacity onPress={() => toggleEntryVisibility(index)}>
              <Text style={{ color: item.isPublic ? "#4CAF50" : "#f44336", fontWeight: "bold" }}>{item.isPublic ? "Public" : "Private"}</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder='Wish Name' value={item.helpNeeds} onChangeText={(text) => handleInputChange(index, "helpNeeds", text)} />
          <TextInput 
            style={styles.descriptionInput} 
            placeholder='Description' 
            value={item.details} 
            onChangeText={(text) => handleInputChange(index, "details", text)}
            multiline={true}
            textAlignVertical="top"
            scrollEnabled={false}
          />

          <View style={styles.amountRow}>
            <Text style={styles.dollar}>💰</Text>
            <TextInput style={styles.amountInput} placeholder='Amount' keyboardType='numeric' value={item.amount} onChangeText={(text) => handleInputChange(index, "amount", text)} />
            <TouchableOpacity onPress={() => deleteWish(index)}>
              <Image source={require("../assets/delete.png")} style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: { fontSize: 18, fontWeight: "bold" },
  addText: { color: "#000000", fontWeight: "bold", fontSize: 24 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // spacing between label and +
  },
  toggleText: { fontWeight: "bold" },
  card: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 5,
    minHeight: 40,
    maxHeight: 120,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  dollar: { fontSize: 20, marginRight: 8 },
  amountInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "70%",
  },
  deleteIcon: { width: 20, height: 20 },
  cardSpacing: {
    marginTop: 16,
  },
});

export default WishesSection;
