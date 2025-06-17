import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MiniCard from '../components/MiniCard';
import BottomNavBar from '../components/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import {REACT_APP_STRIPE_PUBLIC_KEY} from "@env";

// Use the publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = REACT_APP_STRIPE_PUBLIC_KEY;
const STRIPE_KEY_ENDPOINT = 'https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/stripe_key/ECTEST';
const CREATE_PAYMENT_INTENT_ENDPOINT = 'https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent';
const TRANSACTIONS_ENDPOINT = 'https://ioec2testsspm.infiniteoptions.com/api/v1/transactions';
const PROFILE_API = 'https://ioec2testsspm.infiniteoptions.com/api/v1/userprofileinfo';

const ShoppingCartScreen = ({ route, navigation }) => {
  const { cartItems: initialCartItems, onRemoveItem, businessName, business_uid } = route.params;
  const [cartItems, setCartItems] = useState(initialCartItems);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [stripeInitialized, setStripeInitialized] = useState(false);

  useEffect(() => {
    console.log('ShoppingCartScreen mounted');
    console.log('Initial cart items:', initialCartItems);
    
    // Initialize Stripe with the publishable key
    if (STRIPE_PUBLISHABLE_KEY) {
      console.log('Initializing Stripe with publishable key');
      setStripeInitialized(true);
    } else {
      console.error('Stripe publishable key not found');
      Alert.alert('Error', 'Payment system is not properly configured');
    }
  }, []);

  // Update local state when initialCartItems changes
  useEffect(() => {
    setCartItems(initialCartItems);
  }, [initialCartItems]);

  const handleRemoveItem = async (index) => {
    try {
      // Get current cart items from AsyncStorage
      const storedCartData = await AsyncStorage.getItem(`cart_${business_uid}`);
      let cartData = storedCartData ? JSON.parse(storedCartData) : { items: [] };
      
      // Remove the item
      cartData.items = cartData.items.filter((_, i) => i !== index);
      
      // Save updated cart
      await AsyncStorage.setItem(`cart_${business_uid}`, JSON.stringify(cartData));
      
      // Update local state immediately
      setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
      
      // Call the parent's onRemoveItem to update the UI in BusinessProfileScreen
      onRemoveItem(index);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((total, item) => {
      const cost = parseFloat(item.bs_cost) || 0;
      return total + cost;
    }, 0);
    console.log('Calculated total:', total);
    return total;
  };

  const createPaymentIntent = async () => {
    try {
      console.log('Creating payment intent...');
      const profile_uid = await AsyncStorage.getItem('user_uid');
      console.log('User profile UID:', profile_uid);
      
      if (!profile_uid) {
        throw new Error('User profile not found');
      }

      const total = calculateTotal();
      console.log('Creating payment intent for amount:', total);

      const response = await fetch(CREATE_PAYMENT_INTENT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_uid: profile_uid,
          business_code: 'ECTEST',
          payment_summary: {
            tax: 0,
            total: total.toString()
          }
        }),
      });

      const data = await response.json();
      console.log('Payment intent created:', data);

      // The API returns the client secret directly as a string
      if (typeof data !== 'string') {
        throw new Error('Invalid response format from payment intent creation');
      }

      return data; // Return the client secret directly
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  const initializePayment = async () => {
    try {
      console.log('Initializing payment...');
      setLoading(true);
      
      const clientSecret = await createPaymentIntent();
      console.log('Initializing payment sheet with client secret');
      
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: businessName,
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: 'Customer Name',
        },
        appearance: {
          colors: {
            primary: '#9C45F7',
          },
        },
      });

      if (initError) {
        console.error('Payment initialization error:', initError);
        Alert.alert('Error', 'Failed to initialize payment');
        return false;
      }

      console.log('Payment sheet initialized successfully');
      return true;
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', 'Failed to initialize payment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getProfileId = async (userUid) => {
    try {
      console.log('Fetching profile ID for user:', userUid);
      const response = await fetch(`${PROFILE_API}/${userUid}`);
      const data = await response.json();
      console.log('Profile data received:', data);
      
      if (data && data.personal_info && data.personal_info.profile_personal_uid) {
        return data.personal_info.profile_personal_uid;
      }
      throw new Error('Profile ID not found');
    } catch (error) {
      console.error('Error fetching profile ID:', error);
      throw error;
    }
  };

  const recordTransactions = async (buyerUid) => {
    try {
      console.log('Recording transactions for items:', cartItems);
      
      // Get the buyer's profile ID
      const buyerProfileId = await getProfileId(buyerUid);
      console.log('Buyer profile ID:', buyerProfileId);
      
      // Process each item in the cart
      for (const item of cartItems) {
        // Hard code the recommender's profile ID
        const recommenderProfileId = "110-000231";
        console.log('Recommender profile ID:', recommenderProfileId);
        
        const transactionData = {
          buyer_id: buyerProfileId,
          recommender_id: recommenderProfileId,
          bs_id: item.bs_uid
        };
        
        console.log('Recording transaction:', transactionData);
        
        const response = await fetch(TRANSACTIONS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        });
        
        const result = await response.json();
        console.log('Transaction recorded:', result);
      }
    } catch (error) {
      console.error('Error recording transactions:', error);
      throw error;
    }
  };

  const handleCheckout = async () => {
    console.log('Checkout button pressed');
    console.log('Current cart items:', cartItems);
    
    if (!stripeInitialized) {
      Alert.alert('Error', 'Payment system is not ready. Please try again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting checkout process...');

      const initialized = await initializePayment();
      if (!initialized) {
        console.log('Payment initialization failed');
        return;
      }

      console.log('Presenting payment sheet...');
      const result = await presentPaymentSheet();
      console.log('Full Stripe Result:', result);

      if (result.error) {
        console.error('Payment error:', result.error);
        Alert.alert('Error', 'Payment failed. Please try again.');
        return;
      }

      console.log('Payment successful!');
      console.log('Payment Intent:', result.paymentIntent);

      // Get the buyer's ID
      const buyerUid = await AsyncStorage.getItem('user_uid');
      if (!buyerUid) {
        throw new Error('User ID not found');
      }

      // Record the transactions
      await recordTransactions(buyerUid);
      
      // Clear the cart
      await AsyncStorage.removeItem(`cart_${business_uid}`);
      setCartItems([]);
      
      Alert.alert(
        "Success",
        "Payment successful! Your order has been placed.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {cartItems.length === 0 ? (
            <Text style={styles.emptyCart}>Your cart is empty</Text>
          ) : (
            <>
              <Text style={styles.businessName}>{businessName}</Text>
              {cartItems.map((item, index) => (
                <View key={index} style={styles.cartItemContainer}>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                  <MiniCard
                    business={{
                      business_name: item.bs_service_name,
                      business_address_line_1: item.bs_service_desc,
                      business_phone_number: `Cost: ${item.bs_cost_currency || 'USD'} ${item.bs_cost}`,
                      business_website: item.bs_bounty ? `Bounty: ${item.bs_bounty_currency || 'USD'} ${item.bs_bounty}` : null,
                    }}
                  />
                </View>
              ))}
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total: ${calculateTotal().toFixed(2)}</Text>
              </View>
            </>
          )}
        </ScrollView>

        {cartItems.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.checkoutButton, loading && styles.disabledButton]}
              onPress={() => {
                console.log('Checkout button pressed - direct handler');
                handleCheckout();
              }}
              disabled={loading}
            >
              <Text style={styles.checkoutButtonText}>
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.returnButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.returnButtonText}>Return to Business</Text>
            </TouchableOpacity>
          </View>
        )}

        <BottomNavBar navigation={navigation} />
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#9C45F7',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 200,
  },
  emptyCart: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  cartItemContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 110,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  checkoutButton: {
    backgroundColor: '#9C45F7',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  returnButton: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  returnButtonText: {
    color: '#9C45F7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ShoppingCartScreen; 