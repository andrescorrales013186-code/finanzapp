import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ── Perfiles ──────────────────────────────────────────────────────────────────

export async function loadUserProfiles(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveUserProfiles(uid, profiles, activeProfileId) {
  await setDoc(doc(db, 'users', uid), { profiles, activeProfileId }, { merge: true });
}

// ── Datos por perfil ──────────────────────────────────────────────────────────

export async function loadProfileData(uid, pid) {
  const snap = await getDoc(doc(db, 'users', uid, 'data', pid));
  return snap.exists() ? snap.data() : null;
}

export async function saveProfileData(uid, pid, data) {
  await setDoc(doc(db, 'users', uid, 'data', pid), data, { merge: true });
}
