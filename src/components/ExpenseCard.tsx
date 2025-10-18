import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ExpenseCardProps {
  title: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  title,
  value,
  icon,
  iconColor,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Feather name={icon} size={24} color={iconColor} />
        </View>
      </View>
      <View style={[styles.glow, { backgroundColor: iconColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d2d44',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    color: '#b4b4c8',
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  glow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.5,
  },
});