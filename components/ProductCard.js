import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const ProductCard = ({ service, onPress, onEdit, showEditButton }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.header}>
        <Text style={styles.name}>{service.bs_service_name}</Text>
        {showEditButton && onEdit && (
        <TouchableOpacity onPress={() => onEdit(service)} style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        )}
      </View>
      <View style={styles.textContainer}>
        {service.bs_service_desc ? (
          <Text style={styles.desc}>{service.bs_service_desc}</Text>
        ) : null}
        <View style={styles.row}>
          {service.bs_cost ? (
            <Text style={styles.amountText}>💰 Cost: {service.bs_cost_currency || 'USD'} {service.bs_cost}</Text>
          ) : null}
          {service.bs_bounty ? (
            <Text style={[styles.amountText, { marginLeft: 12 }]}>💰 Bounty: {service.bs_bounty_currency || 'USD'} {service.bs_bounty}</Text>
          ) : null}
        </View>
        {/* Placeholder for future transaction button or details */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "column",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 5,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  editButton: {
    padding: 5,
  },
  textContainer: {
    flex: 1,
  },
  desc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  amountText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
});

export default ProductCard; 