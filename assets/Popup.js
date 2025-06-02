import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';

const PasswordUpdatedModal = ({ visible, onClose }) => {
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
                source={require('../checkmark.png')}
                style={styles.icon}
              />
              <Text style={styles.title}>Kata Sandi Berhasil Diperbarui</Text>
              <Text style={styles.message}>
                <Text style={styles.success}>Selamat! </Text>
                Kata sandi anda telah berhasil untuk diperbarui
              </Text>
              
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>

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
  },
  message: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  success: {
    color: '#007AFF', 
    fontWeight: 'bold',
  },
});

export default PasswordUpdatedModal;
