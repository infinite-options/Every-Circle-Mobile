import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const socialIcons = {
  facebook: require('../assets/facebook.png'),
  twitter: require('../assets/twitter.png'),
  linkedin: require('../assets/linkedin.png'),
  youtube: require('../assets/youtube.png'),
  website: require('../assets/www.png'),
};

const BusinessStep3Screen = ({ navigation }) => {
  const [links, setLinks] = useState({
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    website: '',
    other: '',
  });

  const handleChange = (key, value) => {
    setLinks({ ...links, [key]: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.greenHeader}>
        <Text style={styles.header}>Social Media Links</Text>

        {Object.keys(socialIcons).map((key, index) => (
          <View key={key} style={styles.inputRow}>
            <Image source={socialIcons[key]} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={`${key}.com (optional)`}
              placeholderTextColor="#aaa"
              value={links[key]}
              onChangeText={(text) => handleChange(key, text)}
            />
          </View>
        ))}

        {/* Last input for other link */}
        <TextInput
          style={styles.inputFull}
          placeholder="other relevant link"
          placeholderTextColor="#aaa"
          value={links.other}
          onChangeText={(text) => handleChange('other', text)}
        />

        {/* Progress Dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('BusinessStep4')}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  greenHeader: {
    backgroundColor: '#00C721',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 10,
    width: '100%',
    height: 45,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  inputFull: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    marginBottom: 20,
    color: '#333',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  activeDot: {
    backgroundColor: '#00C7BE',
  },
  continueButton: {
    backgroundColor: '#FF9500',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BusinessStep3Screen;
