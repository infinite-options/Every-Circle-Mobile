import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const ProfileScreen = ({ route }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch user details from backend
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const email = route.params?.email || "pmtest4@gmail.com"; // Fetch email from login (or default for testing)
      
      const response = await axios.post(
        'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE',
        { email }
      );

      if (response.status === 200 && response.data.result) {
        setUser(response.data.result); // Set user data
      } else {
        Alert.alert('Error', 'Failed to load profile data.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Could not load user profile.');
    } finally {
      setLoading(false);
    }
  };

  // Handle editing profile
  const handleEdit = () => setIsEditing(!isEditing);

  // Handle saving the profile
  const handleSave = async () => {
    try {
      const updatedData = { ...user };

      const response = await axios.post(
        'https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE',
        updatedData
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.profileName}>{user?.user_first_name || "User"}</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <Image source={{ uri: user?.user_profile_picture || 'https://via.placeholder.com/100' }} style={styles.profileImage} />

      <TextInput
        style={styles.input}
        editable={isEditing}
        value={user?.user_bio || ''}
        onChangeText={(text) => setUser({ ...user, user_bio: text })}
      />

      <TextInput
        style={styles.input}
        editable={isEditing}
        value={user?.user_phone_number || ''}
        onChangeText={(text) => setUser({ ...user, user_phone_number: text })}
      />

      <TextInput
        style={styles.input}
        editable={false}
        value={user?.user_email_id || ''}
      />

      <Text style={styles.sectionTitle}>Experience</Text>
      <TextInput
        style={styles.input}
        editable={isEditing}
        value={user?.user_experience || ''}
        onChangeText={(text) => setUser({ ...user, user_experience: text })}
      />

      <Text style={styles.sectionTitle}>Education</Text>
      <TextInput
        style={styles.input}
        editable={isEditing}
        value={user?.user_education || ''}
        onChangeText={(text) => setUser({ ...user, user_education: text })}
      />

      <Text style={styles.sectionTitle}>Social Links</Text>
      <TextInput
        style={styles.input}
        placeholder="Facebook (optional)"
        editable={isEditing}
        value={user?.user_facebook || ''}
        onChangeText={(text) => setUser({ ...user, user_facebook: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Twitter (optional)"
        editable={isEditing}
        value={user?.user_twitter || ''}
        onChangeText={(text) => setUser({ ...user, user_twitter: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="LinkedIn (optional)"
        editable={isEditing}
        value={user?.user_linkedin || ''}
        onChangeText={(text) => setUser({ ...user, user_linkedin: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="YouTube (optional)"
        editable={isEditing}
        value={user?.user_youtube || ''}
        onChangeText={(text) => setUser({ ...user, user_youtube: text })}
      />

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileName: { fontSize: 20, fontWeight: 'bold' },
  editButton: { color: '#007BFF', fontSize: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  saveButton: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ProfileScreen;
