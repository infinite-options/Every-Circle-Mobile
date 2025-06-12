// BusinessStep3.js (Social Media Links with AsyncStorage)
import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from "../components/BottomNavBar";

const { width } = Dimensions.get('window');

export default function BusinessStep3({ formData, setFormData, navigation }) {
  useEffect(() => {
    console.log('In BusinessStep3');
    const loadSavedForm = async () => {
      try {
        const stored = await AsyncStorage.getItem('businessFormData');
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error('Error loading saved form data:', err);
      }
    };
    loadSavedForm();
  }, []);

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

    const updated = {
      ...formData,
      social_links: updatedLinks,
    };
    setFormData(updated);
    AsyncStorage.setItem('businessFormData', JSON.stringify(updated)).catch(err => console.error('Save error', err));
  };

  const handleWebsiteChange = (url) => {
    const updated = {
      ...formData,
      website: url,
    };
    setFormData(updated);
    AsyncStorage.setItem('businessFormData', JSON.stringify(updated)).catch(err => console.error('Save error', err));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#00C721' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingBottom: 120 }}
      >
        <View style={styles.formCard}>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
        backgroundColor: '#00C721',
        flex: 1,
        borderTopLeftRadius: width,
        borderTopRightRadius: width,
        // borderBottomLeftRadius: width,
        // borderBottomRightRadius: width,
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
      formCard: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        width: '90%',
        maxWidth: 420,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      },
});
