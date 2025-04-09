// BusinessStep1.js (Name, Location, Phone Number, EIN Number)
import React from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function BusinessStep1({ formData, setFormData }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Every Circle!</Text>
      <Text style={styles.subtitle}>Let's Build Your Business Page!</Text>

      <Text style={styles.label}>Business Name</Text>
      <TextInput
        style={styles.input}
        value={formData.businessName}
        placeholder="Enter Business Name"
        onChangeText={text => setFormData({ ...formData, businessName: text })}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={formData.location}
        placeholder="Enter Location"
        onChangeText={text => setFormData({ ...formData, location: text })}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        keyboardType='phone-pad'
        value={formData.phoneNumber}
        placeholder="(000) 000-0000"
        onChangeText={text => setFormData({ ...formData, phoneNumber: text })}
      />

      <Text style={styles.label}>EIN Number</Text>
      <TextInput
        style={styles.input}
        value={formData.einNumber}
        placeholder="Enter EIN"
        onChangeText={text => setFormData({ ...formData, einNumber: text })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: width*1.3,
    flex: 1,
    backgroundColor: '#00C721',
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    padding: 90,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 15,
  },
});
