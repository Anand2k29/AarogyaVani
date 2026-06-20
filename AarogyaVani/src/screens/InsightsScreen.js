import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography } from '../theme/colors';

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Caregiver Insights</Text>
        <Text style={styles.subtitle}>Supporting your journey with love</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adherence Report</Text>
        
        <View style={styles.whiteCard}>
          <View style={styles.headerRow}>
            <Text style={styles.cardHeader}>Overall Compliance</Text>
            <Text style={styles.percentText}>92%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '92%' }]} />
          </View>
          <Text style={styles.cardInfo}>Excellent progress! You missed only 2 doses this week.</Text>
        </View>

        <Text style={styles.sectionTitle}>Care Anchor Activity</Text>
        <View style={styles.whiteCard}>
          <Text style={styles.activityLabel}>Last Logged-in Caregiver</Text>
          <Text style={styles.activityValue}>Family Member (John)</Text>
          <Text style={styles.activityTime}>Checked 45 mins ago</Text>
          <View style={styles.divider} />
          <Text style={styles.activityLabel}>Emergency Alerts Sent</Text>
          <Text style={styles.activityValue}>None</Text>
          <Text style={styles.activityTime}>Last 30 Days</Text>
        </View>

        <Text style={styles.sectionTitle}>AI Health Prediction</Text>
        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <Text style={styles.predictionIcon}>✨</Text>
            <Text style={styles.predictionTitle}>Trajectoy: Optimal</Text>
          </View>
          <Text style={styles.predictionText}>
            Based on current adherence (92%), your recovery trajectory is <Text style={{fontWeight:'bold'}}>Optimal</Text>. Continuing this streak will reduce fatigue by 12% next week.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.reassuranceButton}
          onPress={() => alert("Peace of mind activated: Your family can see your logs and support you.")}
        >
          <Text style={styles.reassuranceText}>👨‍👩‍👧 Privacy & Security Information</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingBottom: 30,
  },
  title: {
    ...typography.header,
    color: '#fff',
    fontSize: 24,
  },
  subtitle: {
    ...typography.body,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 15,
    marginTop: 10,
  },
  whiteCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  cardHeader: {
    ...typography.title,
    fontSize: 16,
    color: colors.primary,
  },
  percentText: {
    ...typography.header,
    fontSize: 24,
    color: colors.primary,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#FCE4EC',
    borderRadius: 6,
    width: '100%',
    marginBottom: 15,
  },
  progressBarFill: {
    height: 12,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  cardInfo: {
    ...typography.body,
    fontSize: 14,
    color: '#666',
  },
  activityLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activityValue: {
    ...typography.title,
    fontSize: 18,
    marginTop: 4,
    color: colors.text,
  },
  activityTime: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  reassuranceButton: {
    padding: 15,
    backgroundColor: '#E1F5FE',
    borderRadius: 15,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  reassuranceText: {
    ...typography.body,
    color: '#0288D1',
    fontWeight: 'bold',
  }
});
