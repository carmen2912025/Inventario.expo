import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function ModalForm({ visible, onClose, title, children, actions }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {children}
          <View style={styles.actions}>{actions}</View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    width: 320,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2563eb',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  closeBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
  closeText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
