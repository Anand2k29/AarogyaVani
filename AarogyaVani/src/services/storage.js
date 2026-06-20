import AsyncStorage from '@react-native-async-storage/async-storage';

const MEDS_KEY = '@aarogyavani_meds';
const ADHERENCE_KEY = '@aarogyavani_adherence';

export const saveMedication = async (med) => {
  try {
    const existingMeds = await getMedications();
    const newMeds = [...existingMeds, { ...med, id: Date.now().toString(), active: true }];
    await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(newMeds));
    return newMeds;
  } catch (e) {
    console.error("Error saving medication", e);
    return null;
  }
};

export const getMedications = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(MEDS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error fetching medications", e);
    return [];
  }
};

export const logAdherence = async (date, medId, taken) => {
  try {
    const existingLogs = await getAdherenceLogs();
    const newLogs = { ...existingLogs, [date]: { ...(existingLogs[date] || {}), [medId]: taken } };
    await AsyncStorage.setItem(ADHERENCE_KEY, JSON.stringify(newLogs));
    return newLogs;
  } catch (e) {
    console.error("Error logging adherence", e);
    return null;
  }
};

export const getAdherenceLogs = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(ADHERENCE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error("Error fetching logs", e);
    return {};
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([MEDS_KEY, ADHERENCE_KEY]);
  } catch (e) {
    console.error("Error clearing data", e);
  }
};
