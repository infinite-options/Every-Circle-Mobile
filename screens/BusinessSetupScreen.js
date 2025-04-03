import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const BusinessSetupScreen = ({ navigation }) => {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [ein, setEin] = useState('');

  const handleContinue = () => {
    // You can pass form values or navigate to next step here
    navigation.navigate('BusinessStep2'); // Placeholder for next screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.greenHeader}>
        <Text style={styles.title}>Welcome to Every Circle!</Text>
        <Text style={styles.subtitle}>Let's Build Your Business Page!</Text>


        <Text style={styles.formText}>Business Name</Text>
        <TextInput style={styles.input} placeholder="Business Name" value={businessName} onChangeText={setBusinessName} />
        <Text style={styles.formText}>Location</Text>
        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
        <Text style={styles.formText}>Phone number (you control if this info is public or private)</Text>
        <TextInput style={styles.input} placeholder="(000) 000-0000" value={phone} onChangeText={setPhone} />
        <Text style={styles.formText}>EIN (needed to begin business verification process)</Text>
        <TextInput style={styles.input} placeholder="EIN" value={ein} onChangeText={setEin} />

        <View style={styles.dots}>
          <View style={[styles.dot, styles.active]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');
const circleSize = width * 0.3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'flex-start', alignItems: 'center' },
  greenHeader: {
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    height: 700,
    width: '120%',
    backgroundColor: '#00C721',
    padding: 45,
    borderTopLeftRadius: width * 0.55,
    borderTopRightRadius: width * 0.55,
    borderBottomLeftRadius: width * 0.55,
    borderBottomRightRadius: width * 0.55,
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 90,
  },

  
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 14,
    marginVertical: 8,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },
  active: {
    backgroundColor: '#1E88E5',
  },
  continueButton: {
    alignSelf: 'center',
    backgroundColor: '#FFA500',
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formText: {
    width: '90%',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 5,
  },
});

export default BusinessSetupScreen;
