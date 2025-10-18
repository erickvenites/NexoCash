import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="inbox" size={64} color="#6b7280" style={styles.icon} />
          <View style={styles.iconGlow} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        {actionLabel && onAction && (
          <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
            <Feather name="plus" size={20} color="#0f0f1e" />
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2d2d44',
    padding: 48,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  icon: {
    opacity: 0.4,
  },
  iconGlow: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 10,
    backgroundColor: '#6b7280',
    opacity: 0.2,
    borderRadius: 20,
    shadowColor: '#6b7280',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#b4b4c8',
    marginBottom: 28,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#00d4ff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#0f0f1e',
    fontSize: 16,
    fontWeight: '700',
  },
});