import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

const BusinessSection = ({ businesses, setBusinesses, toggleVisibility, isPublic }) => {
  const addBusiness = () => {
    const newEntry = { name: "", role: "", isPublic: false };
    setBusinesses([...businesses, newEntry]);
  };

  const deleteBusiness = (index) => {
    const updated = businesses.filter((_, i) => i !== index);
    setBusinesses(updated);
  };    

  const handleInputChange = (index, field, value) => {
    const updated = [...businesses];
    updated[index][field] = value;
    setBusinesses(updated);
  };

  const toggleEntryVisibility = (index) => {
    const updated = [...businesses];
    updated[index].isPublic = !updated[index].isPublic;
    setBusinesses(updated);

    // Sync outer toggle if it's the only one
    if (updated.length === 1) {
      toggleVisibility('businessIsPublic');
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Businesses</Text>
        <TouchableOpacity onPress={addBusiness}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={toggleVisibility}>
        <Text style={[styles.toggleText, { color: isPublic ? '#4CAF50' : '#f44336' }]}>
          {isPublic ? 'Public' : 'Private'}
        </Text>
    </TouchableOpacity>
    </View>

      {businesses.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.rowHeader}>
            <Text style={styles.label}>Business #{index + 1}</Text>
            <TouchableOpacity onPress={() => toggleEntryVisibility(index)}>
              <Text style={{ color: item.isPublic ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
                {item.isPublic ? 'Public' : 'Private'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Business Name"
            value={item.name}
            onChangeText={(text) => handleInputChange(index, "name", text)}
        />
          <TextInput
            style={styles.input}
            placeholder="Your Role / Designation"
            value={item.role}
            onChangeText={(text) => handleInputChange(index, "role", text)}
          />
          <TouchableOpacity onPress={() => deleteBusiness(index)} style={styles.deleteButton}>
            <Image source={require("../assets/delete.png")} style={styles.deleteIcon} />
          </TouchableOpacity>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: { fontSize: 18, fontWeight: "bold" },
  addText: { fontSize: 24, fontWeight: "bold", color: "#000" },
  card: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  deleteButton: {
    alignItems: "flex-end",
    marginTop: 5,
  },
  deleteIcon: { width: 20, height: 20 },
});

export default BusinessSection;
