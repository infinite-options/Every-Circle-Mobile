import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";

const ExperienceSection = ({ experience, setExperience, toggleVisibility, isPublic, handleDelete }) => {
  const addExperience = () => {
    const newEntry = {
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      isPublic: false,
    };
    setExperience([...experience, newEntry]);
  };

  const deleteExperience = (index) => {
    handleDelete(index);
  };

  const handleInputChange = (index, field, value) => {
    const updatedExperience = [...experience];
    updatedExperience[index][field] = value;
    setExperience(updatedExperience);
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Experience</Text>

          {/* Add Experience Button */}
          <TouchableOpacity onPress={addExperience}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Public Toggle */}
        <TouchableOpacity onPress={toggleVisibility}>
          <Text style={[styles.toggleText, { color: isPublic ? "#4CAF50" : "#f44336" }]}>{isPublic ? "Public" : "Private"}</Text>
        </TouchableOpacity>
      </View>

      {/* Experience List */}
      {experience.map((item, index) => (
        <View key={index} style={[styles.experienceCard, index > 0 && styles.cardSpacing]}>
          <View style={styles.expHeaderRow}>
            <Text style={styles.label}>Experience #{index + 1}</Text>
            {/* Individual public/private toggle */}
            <TouchableOpacity
              onPress={() => {
                const updated = [...experience];
                updated[index].isPublic = !updated[index].isPublic;
                setExperience(updated);
                if (updated.length === 1) {
                  toggleVisibility("experienceIsPublic");
                }
              }}
            >
              <Text style={{ color: item.isPublic ? "#4CAF50" : "#f44336", fontWeight: "bold", marginLeft: 10 }}>{item.isPublic ? "Public" : "Private"}</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder='Company' value={item.company} onChangeText={(text) => handleInputChange(index, "company", text)} />

          <TextInput style={styles.input} placeholder='Job Title' value={item.title} onChangeText={(text) => handleInputChange(index, "title", text)} />

          <View style={styles.dateContainer}>
            <TextInput style={styles.dateInput} placeholder='MM/YYYY' value={item.startDate} onChangeText={(text) => handleInputChange(index, "startDate", text)} />
            <Text> - </Text>
            <TextInput style={styles.dateInput} placeholder='MM/YYYY' value={item.endDate} onChangeText={(text) => handleInputChange(index, "endDate", text)} />
            <TouchableOpacity onPress={() => deleteExperience(index)} style={styles.deleteButton}>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: { fontSize: 18, fontWeight: "bold" },
  addText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // spacing between label and +
  },

  toggleText: { fontSize: 14, fontWeight: "bold" },
  experienceCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "35%",
  },
  dateSeparator: { fontSize: 16, fontWeight: "bold" },

  deleteIcon: { width: 20, height: 20 },
  expHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardSpacing: {
    marginTop: 16,
  },
});

export default ExperienceSection;
