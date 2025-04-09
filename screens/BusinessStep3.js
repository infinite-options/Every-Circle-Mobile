// // BusinessStep3.js (Social Media Links)


import React from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

export default function BusinessStep3({ formData, setFormData }) {
  const getLink = (platform) => {
    const entry = formData.social_links?.find(link => link.social_link_name === platform);
    return entry?.business_link_url || '';
  };

  const handleChange = (platform, url) => {
    const updatedLinks = [...(formData.social_links || [])];
    const index = updatedLinks.findIndex(link => link.social_link_name === platform);

    if (index !== -1) {
      updatedLinks[index].business_link_url = url;
    } else {
      updatedLinks.push({ social_link_name: platform, business_link_url: url });
    }

    setFormData(prev => ({
      ...prev,
      social_links: updatedLinks
    }));
  };

  const handleWebsiteChange = (url) => {
    setFormData(prev => ({
      ...prev,
      website: url
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Social Media Links</Text>

      {['facebook', 'twitter', 'linkedin', 'youtube'].map((platform) => (
        <View key={platform} style={{ width: '100%' }}>
          <Text style={styles.label}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
          <TextInput
            style={styles.input}
            placeholder={`https://${platform}.com/yourpage`}
            value={getLink(platform)}
            onChangeText={(text) => handleChange(platform, text)}
          />
        </View>
      ))}

      <Text style={styles.label}>Website</Text>
      <TextInput
        style={styles.input}
        placeholder="https://yourwebsite.com"
        value={formData.website || ''}
        onChangeText={handleWebsiteChange}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00C721',
    flex: 1,
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    padding: 90,
    paddingTop: 80,
    alignSelf: 'center',
    width: width * 1.3,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
});
