// BusinessProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

const BusinessProfileApi = 'https://ioec2testsspm.infiniteoptions.com/api/v1/businessinfo/';

export default function BusinessProfileScreen({ route }) {
  const { business_uid } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        console.log('ProfilePage BusinessProfileApi', `${BusinessProfileApi}${business_uid}`);
        const response = await fetch(`${BusinessProfileApi}${business_uid}`);
        const result = await response.json();
        setBusiness(result.business);
      } catch (err) {
        console.error('Error fetching business data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessInfo();
  }, [business_uid]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00C721" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load business data.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{business.business_name}</Text>
      <Text style={styles.label}>Location:</Text>
      <Text style={styles.value}>{business.business_address_line_1 || 'N/A'}</Text>

      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.value}>{business.business_phone_number || 'N/A'}</Text>

      <Text style={styles.label}>EIN:</Text>
      <Text style={styles.value}>{business.business_ein_number || 'N/A'}</Text>

      <Text style={styles.label}>Short Bio:</Text>
      <Text style={styles.value}>{business.business_short_bio || 'N/A'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});