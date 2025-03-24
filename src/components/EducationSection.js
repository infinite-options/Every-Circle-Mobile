import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

const EducationSection = ({ education, setEducation, toggleVisibility, isPublic }) => {
  const addEducation = () => {
    const newEntry = { school: "", degree: "", startDate: "", endDate: "", isPublic: true };
    setEducation([...education, newEntry]);
  };

  const deleteEducation = (index) => {
    const updated = education.filter((_, i) => i !== index);
    setEducation(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const toggleEntryVisibility = (index) => {
    const updated = [...education];
    updated[index].isPublic = !updated[index].isPublic;
    setEducation(updated);
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Education</Text>
        <TouchableOpacity onPress={addEducation}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleVisibility}>
          <Text style={[styles.toggleText, { color: isPublic ? "#4CAF50" : "#f44336" }]}> {isPublic ? "Public" : "Private"}</Text>
        </TouchableOpacity>
      </View>



        {education.map((item, index) => (
            <View key={index} style={styles.card}>
                    <View style={styles.rowHeader}>
                    <Text style={styles.label}>Entry #{index + 1}</Text>






              {/* Individual public/private toggle */}
              <TouchableOpacity onPress={() => toggleEntryVisibility(index)}>
                <Text style={{ color: item.isPublic ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
                  {item.isPublic ? 'Public' : 'Private'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="School"
              value={item.school}
              onChangeText={(text) => handleInputChange(index, "school", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Degree"
              value={item.degree}
              onChangeText={(text) => handleInputChange(index, "degree", text)}
            />
            <View style={styles.dateRow}>
              <TextInput
                style={styles.dateInput}
                placeholder="MM/YYYY"
                value={item.startDate}
                onChangeText={(text) => handleInputChange(index, "startDate", text)}
              />
              <Text style={styles.dash}> - </Text>
              <TextInput
                style={styles.dateInput}
                placeholder="MM/YYYY"
                value={item.endDate}
                onChangeText={(text) => handleInputChange(index, "endDate", text)}
              />
              <TouchableOpacity onPress={() => deleteEducation(index)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
 ) )}

       
      
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
  addText: { color: "#000000", fontWeight: "bold",fontSize: 20},
  toggleText: { fontWeight: "bold" },
  card: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "35%",
  },
  dash: { fontSize: 16, fontWeight: "bold" },
  deleteText: { color: "red", fontWeight: "bold" },
});

export default EducationSection;
