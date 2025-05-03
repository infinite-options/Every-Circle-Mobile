import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Every Circle Privacy Policy</Text>
        <Text style={styles.body}>
            Last updated: August 1, 2024 {'\n\n'}

            Privacy Policy 
            Infinite Options, LLC (”us”, "we", or "our") operates Manifest My Space (the “Application"). This page informs you of our policies regarding the collection, use and disclosure of Personal Information we receive from users of the mobile application and web applications (the “Platforms”). 
            We use your Personal Information only for providing and improving the Application. By using the Application, you agree to the collection and use of information in accordance with this policy. 
            Information Collection And Use 
            While using our Application, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to your name, email, social id (if you used social media to log in), street address, phone number, and payment information ("Personal Information”). This data is stored within our secure databases and we use this data to identify you with your account and purchases. We also use this data to pre-populate the information into your Application profile. 
            Log Data 
            Like many application operators, we collect information that your Platform sends whenever you visit our Application ("Log Data"). 
            This Log Data may include information such as your phone’s Internet Protocol ("IP") address, phone type, software version, the pages of our Application that you visit, the time and date of your visit, the time spent on those pages and other statistics. 
            In addition, we may use third party services such as Google Analytics that collect, monitor and analyze this information to improve the Application. 
            Communications 
            We may use your Personal Information to contact you with newsletters, marketing or promotional materials and other information regarding the mobile application.
            Security 
            The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security. 
            Your Rights to Your Data 
            We believe that your personal data is your data. As such, should you ever request to be removed from our email lists or database you need only send us an email at info@infiniteoptions.com stating your request. We will comply within 5 working days of receiving your email. 
            Changes To This Privacy Policy 
            This Privacy Policy is effective as of August 1, 2024 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page. 
            We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy. 
            If we make any material changes to this Privacy Policy, we will notify you either through the email address you have provided us, or by placing a prominent notice on our mobile application. 
            Contact Us 
            If you have any questions about this Privacy Policy, please contact us: 
            Infinite Options, LLC 
            info@infiniteoptions.com

        </Text>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Bottom Navigation Bar */}
      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-outline" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Home")}>
          <MaterialIcons name="account-balance" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Network")}>
          <Ionicons name="share-social-outline" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Search")}>
          <Ionicons name="search-outline" size={24} color="#333" />
          <Text style={styles.navLabel}></Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333'
  },
  closeButton: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: '#8b58f9',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  navButton: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
