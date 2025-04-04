import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const ExpertiseSection = ({ expertise, setExpertise, toggleVisibility, isPublic }) => {
  const addExpertise = () => {
    const newEntry = {
      name: '',
      description: '',
      cost: '',
      bounty: '',
      isPublic: false,
    };
    setExpertise([...expertise, newEntry]);
  };

  const deleteExpertise = (index) => {
    const updated = expertise.filter((_, i) => i !== index);
    setExpertise(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...expertise];
    updated[index][field] = value;
    setExpertise(updated);
  };

  const toggleEntryVisibility = (index) => {
    const updated = [...expertise];
    updated[index].isPublic = !updated[index].isPublic;
    setExpertise(updated);

    // Sync outer toggle if it's the only one
    if (updated.length === 1) {
      toggleVisibility('expertiseIsPublic');
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Expertise</Text>
          <TouchableOpacity onPress={addExpertise}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={toggleVisibility}>
          <Text style={[styles.toggleText, { color: isPublic ? '#4CAF50' : '#f44336' }]}>
            {isPublic ? 'Public' : 'Private'}
          </Text>
        </TouchableOpacity>
      </View>

      {expertise.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.rowHeader}>
            <Text style={styles.label}>Expertise #{index + 1}</Text>
            <TouchableOpacity onPress={() => toggleEntryVisibility(index)}>
              <Text style={{ color: item.isPublic ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
                {item.isPublic ? 'Public' : 'Private'}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Expertise Name"
            value={item.name}
            onChangeText={(text) => handleInputChange(index, 'name', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={item.description}
            onChangeText={(text) => handleInputChange(index, 'description', text)}
          />

          <View style={styles.amountRow}>
            <Text style={styles.costLabel}>Cost</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="$100/hr or Free"
              value={item.cost}
              onChangeText={(text) => handleInputChange(index, 'cost', text)}
            />
            <Text style={styles.dollar}>💰</Text>
            <TextInput
              style={styles.bountyInput}
              placeholder="Bounty"
              keyboardType="numeric"
              value={item.bounty}
              onChangeText={(text) => handleInputChange(index, 'bounty', text)}
            />
            <TouchableOpacity onPress={() => deleteExpertise(index)}>
              <Image source={require('../assets/delete.png')} style={styles.deleteIcon} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: { fontSize: 18, fontWeight: 'bold' },
  addText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  toggleText: { fontWeight: 'bold' },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  costLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '30%',
  },
  bountyInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '20%',
  },
  dollar: { fontSize: 20, marginHorizontal: 5 },
  deleteIcon: { width: 20, height: 20 },
});

export default ExpertiseSection;
