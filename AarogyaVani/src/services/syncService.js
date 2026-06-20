import { db, auth } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDocs,
  setDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';

// Collection Names
const MEDS_COLL = 'medications';
const APPTS_COLL = 'appointments';
const USERS_COLL = 'users';

/**
 * Sync medications for a specific user (Patient or Caregiver's patient)
 */
export const subscribeToMedications = (userId, callback) => {
  const q = query(
    collection(db, MEDS_COLL), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(meds);
  });
};

/**
 * Add a new medication for the current user
 */
export const addMedicationSync = async (medData) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  return await addDoc(collection(db, MEDS_COLL), {
    ...medData,
    userId,
    createdAt: serverTimestamp(),
  });
};

/**
 * Sync appointments for a patient
 */
export const subscribeToAppointments = (userId, callback) => {
  const q = query(
    collection(db, APPTS_COLL),
    where('patientId', '==', userId),
    orderBy('dateTime', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const appts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(appts);
  });
};

/**
 * Add an appointment (Used by Caregiver or Patient)
 */
export const addAppointmentSync = async (appointmentData) => {
  const creatorId = auth.currentUser?.uid;
  if (!creatorId) throw new Error("User not authenticated");

  return await addDoc(collection(db, APPTS_COLL), {
    ...appointmentData,
    creatorId,
    createdAt: serverTimestamp(),
  });
};

/**
 * Link a caregiver to a patient
 */
export const linkCaregiverToPatient = async (patientId) => {
  const caregiverId = auth.currentUser?.uid;
  if (!caregiverId) throw new Error("User not authenticated");

  // Update caregiver's profile to point to their patient
  await setDoc(doc(db, USERS_COLL, caregiverId), {
    role: 'caregiver',
    linkedPatientId: patientId,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return patientId;
};

/**
 * Trigger an SOS event in the cloud
 */
export const triggerSOSSync = async (patientId) => {
  return await addDoc(collection(db, 'sos_alerts'), {
    patientId,
    timestamp: serverTimestamp(),
    status: 'active',
    location: 'Current Location' // Mocked
  });
};

/**
 * Add a Health Record (Vitals) for the patient
 */
export const addHealthRecordSync = async (recordData) => {
  const creatorId = auth.currentUser?.uid;
  if (!creatorId) throw new Error("User not authenticated");

  return await addDoc(collection(db, 'health_records'), {
    ...recordData,
    creatorId,
    createdAt: serverTimestamp(),
  });
};

/**
 * Fetch a user profile (e.g. for Name resolution)
 */
export const getUserProfileSync = async (userId) => {
  if (!userId) return null;
  const userDoc = await getDocs(query(collection(db, USERS_COLL), where('uid', '==', userId)));
  if (!userDoc.empty) {
    return { id: userDoc.docs[0].id, ...userDoc.docs[0].data() };
  }
  // Fallback to direct doc fetch if UID is used as document ID
  try {
    const directDoc = await getDocs(query(collection(db, USERS_COLL), where('__name__', '==', userId)));
    if (!directDoc.empty) return { id: directDoc.docs[0].id, ...directDoc.docs[0].data() };
  } catch (e) {}
  return null;
};

/**
 * Update the user's own profile
 */
export const updateUserProfileSync = async (userId, data) => {
  const userRef = doc(db, USERS_COLL, userId);
  await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};
