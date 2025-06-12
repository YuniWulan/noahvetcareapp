import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

const PasswordUpdatedModal = ({ visible, onClose, autoCloseDelay = 1000 }) => {
  // Auto close modal setelah delay tertentu
 useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      // Cleanup timer jika modal ditutup manual atau component unmount
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, autoCloseDelay]);
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.popup}>
              <Image
                source={require('./checkmark.png')}
                style={styles.icon}
              />
              <Text style={styles.title}>Kata Sandi Berhasil Diperbarui</Text>
              <Text style={styles.message}>
                <Text style={styles.success}>Selamat! </Text>
                Kata sandi anda telah berhasil untuk diperbarui
              </Text> 
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    width: 96,
    height: 96,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  message: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Lexend-Regular',
  },
  success: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
});

export default PasswordUpdatedModal; 