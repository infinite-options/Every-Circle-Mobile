// ContinueButton.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ContinueButton({ onNext, onBack, showBack = true }) {
  return (
    <View style={styles.buttonRow}>
      {showBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.continueButton} onPress={onNext}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#FFA500',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#333',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
