// BusinessProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity
} from 'react-native';
import MiniCard from '../components/MiniCard';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const BusinessProfileApi = 'https://ioec2testsspm.infiniteoptions.com/api/v1/businessinfo/';

export default function BusinessProfileScreen({ route, navigation }) {
  const { business_uid } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchBusinessInfo = async () => {
  //     try {
  //       const response = await fetch(`${BusinessProfileApi}${business_uid}`);
  //       const result = await response.json();

  //       console.log('Fetching Business Info:', result);

  //       if (!result || !result.business) throw new Error("Business not found");

  //       const rawBusiness = result.business;
  //       const socialLinks = rawBusiness.social_links ? JSON.parse(rawBusiness.social_links) : {};

  //       let images = [];
  //       try {
  //         if (Array.isArray(rawBusiness.business_google_photos)) {
  //           images = rawBusiness.business_google_photos;
  //         } else if (typeof rawBusiness.business_google_photos === 'string') {
  //           images = JSON.parse(rawBusiness.business_google_photos);
  //         }
  //       } catch (err) {
  //         console.warn("Error parsing business_google_photos:", err);
  //       }
        
  //       setBusiness({
  //         ...rawBusiness,
  //         facebook: socialLinks.facebook || '',
  //         instagram: socialLinks.instagram || '',
  //         twitter: socialLinks.twitter || '',
  //         linkedin: socialLinks.linkedin || '',
  //         youtube: socialLinks.youtube || '',
  //         images: images || [],
  //         emailIsPublic: String(rawBusiness.business_email_id_is_public) === '1',
  //         phoneIsPublic: String(rawBusiness.business_phone_number_is_public) === '1',
          
  //         taglineIsPublic: String(rawBusiness.business_tagline_is_public) === '1',
  //         shortBioIsPublic: String(rawBusiness.business_short_bio_is_public) === '1',
  //       });
  //     } catch (err) {
  //       console.error('Error fetching business data:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchBusinessInfo();
  // }, [business_uid]);



  useFocusEffect(
    useCallback(() => {
      const fetchBusinessInfo = async () => {
        try {
          const response = await fetch(`${BusinessProfileApi}${business_uid}`);
          const result = await response.json();
          const rawBusiness = result.business;
  
          const socialLinks = rawBusiness.social_links ? JSON.parse(rawBusiness.social_links) : {};
          let images = [];
  
          try {
            images = Array.isArray(rawBusiness.business_google_photos)
              ? rawBusiness.business_google_photos
              : JSON.parse(rawBusiness.business_google_photos || '[]');
          } catch (err) {
            console.warn('Error parsing business_google_photos:', err);
          }
  
          setBusiness({
            ...rawBusiness,
            facebook: socialLinks.facebook || '',
            instagram: socialLinks.instagram || '',
            twitter: socialLinks.twitter || '',
            linkedin: socialLinks.linkedin || '',
            youtube: socialLinks.youtube || '',
            images,
            emailIsPublic: String(rawBusiness.business_email_id_is_public) === '1',
            phoneIsPublic: String(rawBusiness.business_phone_number_is_public) === '1',
            taglineIsPublic: String(rawBusiness.business_tag_line_is_public) === '1',
            shortBioIsPublic: String(rawBusiness.business_short_bio_is_public) === '1',
          });
        } catch (err) {
          console.error('Error fetching business data:', err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchBusinessInfo();
    }, [business_uid])
  );

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
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate('EditBusinessProfile', {
            
            business_uid,
          })
        }
      >
        <Image source={require('../assets/Edit.png')} style={styles.editIcon} />
      </TouchableOpacity>

      <Text style={styles.header}>{business.business_name}</Text>
      <Text style={styles.value}>{business.business_address_line_1}</Text>

      {business.phoneIsPublic && (
        <>
          <Text style={styles.value}>{business.business_phone_number}</Text>
        </>
      )}




      {business.emailIsPublic && (
        <>
          <Text style={styles.value}>{business.business_email}</Text>
        </>
      )}

      {business.taglineIsPublic && business.business_tag_line ? (
        <Text style={styles.tagline}>{business.business_tag_line}</Text>
      ) : null}

      {business.shortBioIsPublic && business.business_short_bio ? (
        <Text style={styles.description}>{business.business_short_bio}</Text>
      ) : null}

    

     

      <View style={styles.carouselContainer}>
  <ScrollView horizontal  showsHorizontalScrollIndicator={true} style={styles.carousel}>
    {(business.images || []).map((uri, index) => (
      <View key={index} style={styles.imagePage}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      </View>
    ))}
  </ScrollView>
</View>




      {/* Social Links Section */}
      <View style={styles.socialSection}>
        {business.facebook ? <Text style={styles.link}>📘 {business.facebook}</Text> : null}
        {business.twitter ? <Text style={styles.link}>🐦 {business.twitter}</Text> : null}
        {business.instagram ? <Text style={styles.link}>📸 {business.instagram}</Text> : null}
        {business.linkedin ? <Text style={styles.link}>🔗 {business.linkedin}</Text> : null}
        {business.youtube ? <Text style={styles.link}>▶️ {business.youtube}</Text> : null}
      </View>

      {/* Optional MiniCard Preview for Service or Promo */}
      {/* <MiniCard business={{
        business_name: business.business_name,
        business_phone_number: business.business_phone_number,
        business_email: business.business_email,
        tagline: business.business_tagline,
        business_short_bio: business.business_short_bio,
      }} /> */}

<MiniCard business={business} type="business" />



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
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#777',
    marginVertical: 10,
  },
  description: {
    fontSize: 15,
    color: '#333',
    marginBottom: 15,
  },
  value: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
  },
  link: {
    fontSize: 14,
    color: '#1a73e8',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  imageRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  socialSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: '#00C721',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  editIcon: {
    width: 24,
    height: 24,
  },
});
