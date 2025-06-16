import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MiniCard from '../components/MiniCard';
import BottomNavBar from '../components/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShoppingCartScreen = ({ route, navigation }) => {
  const { cartItems: initialCartItems, onRemoveItem, businessName, business_uid } = route.params;
  const [cartItems, setCartItems] = useState(initialCartItems);

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

  const handleCheckout = () => {
    Alert.alert(
      "Checkout",
      "Proceed to checkout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Proceed",
          onPress: async () => {
            try {
              // Clear the cart after successful checkout
              await AsyncStorage.removeItem(`cart_${business_uid}`);
              setCartItems([]); // Clear local state
              Alert.alert("Success", "Order placed successfully!");
              navigation.navigate('Home');
            } catch (error) {
              console.error('Error during checkout:', error);
              Alert.alert('Error', 'Failed to process checkout');
            }
          }
        }
      ]
    );
  };

  return (
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
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.returnButtonText}>Return to Business</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomNavBar navigation={navigation} />
    </View>
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
});

export default ShoppingCartScreen; 