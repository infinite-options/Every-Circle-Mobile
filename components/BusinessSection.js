import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal, ScrollView } from "react-native";

const BusinessSection = ({ businesses, setBusinesses, toggleVisibility, isPublic }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [businessList, setBusinessList] = useState([]);
  const [activeBusinessIndex, setActiveBusinessIndex] = useState(null);

  const addBusiness = () => {
    const newEntry = { name: "", role: "", isPublic: false, isNew: false };
    setBusinesses([...businesses, newEntry]);
  };

  const fetchBusinesses = async (index) => {
    try {
      const response = await fetch("https://ioec2ecaspm.infiniteoptions.com/businesses");
      const data = await response.json();
      setBusinessList(data);
      setActiveBusinessIndex(index);
      setModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    }
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
      toggleVisibility("businessIsPublic");
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
          <Text style={[styles.toggleText, { color: isPublic ? "#4CAF50" : "#f44336" }]}>{isPublic ? "Public" : "Private"}</Text>
        </TouchableOpacity>
      </View>

      {businesses.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.rowHeader}>
            <Text style={styles.label}>Business #{index + 1}</Text>
            <TouchableOpacity onPress={() => toggleEntryVisibility(index)}>
              <Text style={{ color: item.isPublic ? "#4CAF50" : "#f44336", fontWeight: "bold", marginLeft: 10 }}>{item.isPublic ? "Public" : "Private"}</Text>
            </TouchableOpacity>
          </View>

          {item.profile_business_uid ? (
            // Show Approved box for existing businesses
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  backgroundColor: item.isApproved ? "#4CAF50" : "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.isApproved && <View style={{ width: 12, height: 12, backgroundColor: "#4CAF50" }} />}
              </View>
              <Text style={{ fontSize: 16, marginLeft: 8 }}>Approved</Text>
            </View>
          ) : (
            // Show Existing Business checkbox for new businesses
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <TouchableOpacity
                onPress={async () => {
                  const updated = [...businesses];
                  updated[index].isNew = !updated[index].isNew;
                  setBusinesses(updated);
                  if (!updated[index].isNew) return;
                  await fetchBusinesses(index);
                }}
                style={{ marginRight: 8 }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    backgroundColor: item.isNew ? "#4CAF50" : "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.isNew && <View style={{ width: 12, height: 12, backgroundColor: "#4CAF50" }} />}
                </View>
              </TouchableOpacity>
              <Text style={{ fontSize: 16 }}>Existing Business?</Text>
            </View>
          )}

          <TextInput style={styles.input} placeholder='Business Name' value={item.name} onChangeText={(text) => handleInputChange(index, "name", text)} />
          <TextInput style={styles.input} placeholder='Your Role / Designation' value={item.role} onChangeText={(text) => handleInputChange(index, "role", text)} />

          <TouchableOpacity onPress={() => deleteBusiness(index)} style={styles.deleteButton}>
            <Image source={require("../assets/delete.png")} style={styles.deleteIcon} />
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal for selecting existing business */}
      <Modal visible={modalVisible} transparent={true} animationType='slide' onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 20, width: "80%", maxHeight: "70%" }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>Select a Business</Text>
            <ScrollView>
              {businessList.map((biz) => (
                <TouchableOpacity
                  key={biz.business_uid}
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: "#eee" }}
                  onPress={() => {
                    if (activeBusinessIndex !== null) {
                      const updated = [...businesses];
                      // For new businesses, don't include profile_business_uid at all
                      const newBusiness = {
                        name: biz.business_name,
                        business_uid: biz.business_uid,
                        isNew: false,
                        isPublic: false,
                        isApproved: false,
                        role: updated[activeBusinessIndex].role || "",
                      };
                      updated[activeBusinessIndex] = newBusiness;
                      console.log("Updated business after selection:", updated[activeBusinessIndex]);
                      setBusinesses(updated);
                    }
                    setModalVisible(false);
                  }}
                >
                  <Text>{biz.business_name || "(No Name)"}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 15, alignSelf: "flex-end" }}>
              <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: { fontSize: 18, fontWeight: "bold" },
  addText: { fontSize: 24, fontWeight: "bold", color: "#000" },
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
