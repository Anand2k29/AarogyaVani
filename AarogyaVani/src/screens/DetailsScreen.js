import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { colors, typography } from '../theme/colors';
import { analyzePrescription } from '../services/groqApi';
import { addMedicationSync } from '../services/syncService';

const LANGUAGES = [
  { id: 'en', label: 'English', code: 'en-US' },
  { id: 'hi', label: 'Hindi', code: 'hi-IN' },
  { id: 'or', label: 'Odia', code: 'or-IN' },
  { id: 'kn', label: 'Kannada', code: 'kn-IN' },
  { id: 'te', label: 'Telugu', code: 'te-IN' }
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
    if (!data) return;
    
    setIsPlaying(true);

    const langObj = LANGUAGES.find(l => l.id === langId);
    
    // Fallback logic for Expo Speech
    const trySpeak = (text, code, onFail) => {
        Speech.speak(text, {
          language: code,
          onDone: () => setIsPlaying(false),
          onError: (err) => {
            console.warn(`Speech failed for ${code}`, err);
            if (onFail) onFail();
            else setIsPlaying(false);
          }
        });
    };

    // 1. Try Target Language (Assembled from items)
    let fullText = (typeof data === 'string' ? data : data.rawSummary) + '. ';
    if (data.items && data.items.length > 0) {
        data.items.forEach((item, i) => {
            const medLabel = langId === 'hi' ? 'दवाई' : 'Medicine';
            const usedLabel = langId === 'hi' ? 'इसके लिए है' : 'Used for';
            const doseLabel = langId === 'hi' ? 'इस्तेमाल करने का तरीका' : 'Instructions';
            
            fullText += `${medLabel} ${i + 1}: ${item.medicineName}. ${usedLabel}: ${item.usedFor}. ${doseLabel}: ${item.translatedDosage}. `;
            if (item.warning) {
                const warnLabel = langId === 'hi' ? 'सावधानी' : 'Warning';
                fullText += `${warnLabel}: ${item.warning}. `;
            }
        });
    }

    trySpeak(fullText, langObj?.code || 'en-US', () => {
        // Fallbacks use rawSummaries
        if (data.rawSummaryHindi) {
            console.log("Falling back to Hindi audio on mobile");
            trySpeak(data.rawSummaryHindi, 'hi-IN', () => {
                if (data.rawSummaryEnglish) {
                    console.log("Falling back to English audio on mobile");
                    trySpeak(data.rawSummaryEnglish, 'en-US');
                }
            });
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

        <View style={styles.languageContainer}>
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
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing Prescription with AI...</Text>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{resultText}</Text>
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
    marginBottom: 15,
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
  }
});
