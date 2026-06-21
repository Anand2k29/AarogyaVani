import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { colors, typography } from '../theme/colors';
import { analyzePrescription } from '../services/aiDecoder';
import { addMedicationSync } from '../services/syncService';

const LANGUAGES = [
  { id: 'en', label: 'English', code: 'en-US' },
  { id: 'hi', label: 'Hindi',   code: 'hi-IN' },
  { id: 'or', label: 'Odia',    code: 'or-IN' },
  { id: 'kn', label: 'Kannada', code: 'kn-IN' },
  { id: 'te', label: 'Telugu',  code: 'te-IN' },
  { id: 'ta', label: 'Tamil',   code: 'ta-IN' },
  { id: 'bn', label: 'Bengali', code: 'bn-IN' },
  { id: 'mr', label: 'Marathi', code: 'mr-IN' },
  { id: 'gu', label: 'Gujarati',code: 'gu-IN' },
];

export default function DetailsScreen({ route, navigation }) {
  const { imageUri, imageBase64 } = route.params;
  const [loading, setLoading] = useState(true);
  const [resultText, setResultText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isSaving, setIsSaving] = useState(false);
  const [fullData, setFullData] = useState(null);

  useEffect(() => {
    runAnalysis(selectedLang);
  }, []);

  const runAnalysis = async (language) => {
    setLoading(true);
    setResultText('');
    try {
      if (imageBase64) {
        const data = await analyzePrescription(imageBase64, language);
        setFullData(data);
        // On mobile, we'll store the full object but display the summary for now
        setResultText(data.rawSummary);
        
        // Auto-play the voice instruction for accessibility with fallbacks
        speakInstructions(data, language);
      } else {
        setResultText("No image data provided.");
      }
    } catch (error) {
      setResultText("Error analyzing the prescription. Please check your API key or network.\n\n" + error.message);
    } finally {
      setLoading(false);
    }
  };

  const speakInstructions = (data, langId) => {
    if (!data || !data.ttsScript) return;
    
    setIsPlaying(true);
    const langObj = LANGUAGES.find(l => l.id === langId);
    
    Speech.speak(data.ttsScript, {
      language: langObj?.code || 'en-US',
      onDone: () => setIsPlaying(false),
      onError: (err) => {
        console.warn(`Speech failed for ${langObj?.code}`, err);
        setIsPlaying(false);
      }
    });
  };

  const stopSpeaking = async () => {
    await Speech.stop();
    setIsPlaying(false);
  };

  const handleLanguageChange = (langId) => {
    setSelectedLang(langId);
    runAnalysis(langId);
  };

  const handleSaveMedication = async () => {
    if (!resultText || loading || isSaving) return;
    
    setIsSaving(true);
    try {
      await addMedicationSync({
        name: resultText.split('\n')[0].slice(0, 30) || "Scanned Medication",
        instructions: resultText,
        dosage: "Parsed from Scan",
        dateAdded: new Date().toISOString(),
        language: selectedLang
      });
      Alert.alert("Success", "Medication added to your reminders!");
      navigation.navigate('MainTabs');
    } catch (e) {
      Alert.alert("Error", "Could not save medication.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
        if (fullData) {
            speakInstructions(fullData, selectedLang);
        } else {
            runAnalysis(selectedLang); 
        }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      )}
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Analysis Results</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.languageContainer}
        >
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.id}
              style={[styles.langChip, selectedLang === lang.id && styles.langChipActive]}
              onPress={() => handleLanguageChange(lang.id)}
            >
              <Text style={[styles.langText, selectedLang === lang.id && styles.langTextActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing Prescription with AI...</Text>
            <Text style={styles.loadingSubtext}>Translating to {LANGUAGES.find(l => l.id === selectedLang)?.label || 'English'}...</Text>
          </View>
        ) : fullData ? (
          <View style={{ gap: 14 }}>
            {/* Summary Card */}
            {fullData.rawSummary ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>📋 Summary</Text>
                <Text style={styles.summaryText}>{fullData.rawSummary}</Text>
              </View>
            ) : null}

            {/* Provider badge */}
            {fullData.provider ? (
              <View style={styles.providerBadge}>
                <Text style={styles.providerText}>✨ via {fullData.provider} • {fullData.processingTimeMs}ms</Text>
              </View>
            ) : null}

            {/* Medicine Item Cards */}
            {fullData.items && fullData.items.length > 0 ? (
              fullData.items.map((item, idx) => (
                <View key={idx} style={styles.medicineCard}>
                  <View style={styles.medicineHeader}>
                    <View style={styles.medicineAccent} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medicineLabel}>Medicine {idx + 1}</Text>
                      <Text style={styles.medicineName}>{item.medicineName}</Text>
                      {item.usedFor ? <Text style={styles.medicineUsage}>{item.usedFor}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.dosageBox}>
                    <Text style={styles.dosageLabel}>💊 Instructions</Text>
                    <Text style={styles.dosageText}>{item.translatedDosage}</Text>
                  </View>

                  {item.warning ? (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>⚠️ {item.warning}</Text>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <View style={styles.resultCard}>
                <Text style={styles.resultText}>No medicines found. Try a clearer photo.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{resultText || 'No results available.'}</Text>
          </View>
        )}

        <View style={styles.audioPanel}>
          <Text style={styles.audioTitle}>Audio Explanation</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
              <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, (loading || isSaving) && styles.saveButtonDisabled]} 
          onPress={handleSaveMedication}
          disabled={loading || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save to Reminders</Text>
          )}
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
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.title,
  },
  languageContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  langChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    marginRight: 10,
  },
  langChipActive: {
    backgroundColor: colors.primaryLight,
  },
  langText: {
    ...typography.body,
    fontSize: 14,
    color: '#333333'
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  loadingText: {
    ...typography.body,
    marginTop: 15,
    color: colors.primary,
  },
  resultCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  resultText: {
    ...typography.body,
    lineHeight: 24,
  },
  audioPanel: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  audioTitle: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  playButtonText: {
    ...typography.button,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    ...typography.button,
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingSubtext: {
    ...typography.body,
    marginTop: 8,
    fontSize: 13,
    color: colors.primaryLight,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  summaryText: {
    ...typography.body,
    lineHeight: 22,
    fontStyle: 'italic',
    color: '#555',
  },
  providerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  medicineCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    gap: 14,
  },
  medicineHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  medicineAccent: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  medicineLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 2,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  medicineUsage: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  dosageBox: {
    backgroundColor: 'rgba(29,185,84,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(29,185,84,0.2)',
    borderRadius: 14,
    padding: 16,
  },
  dosageLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.primary,
    marginBottom: 6,
  },
  dosageText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: 'rgba(229,57,53,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.2)',
    borderRadius: 12,
    padding: 14,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c62828',
  },
});
