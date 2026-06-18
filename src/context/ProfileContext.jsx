// ─────────────────────────────────────────────────────────────────────────────
// ProfileContext.jsx — Contexto de perfiles
//
// QUÉ CAMBIÓ vs la versión anterior:
//   • createProfile ahora acepta un segundo parámetro: gender ('m' | 'f' | 'n')
//     - 'm' → muestra a Finn
//     - 'f' → muestra a Finna
//     - 'n' → neutro (muestra a Finn por defecto)
//   • El resto de la lógica (Firestore, localStorage, sync) está intacta
//
// POR QUÉ CONTEXTO:
//   Un Contexto en React es como una variable global controlada.
//   En vez de pasar el perfil activo como prop por 10 componentes,
//   cualquier componente puede llamar useProfile() y obtenerlo directo.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { loadUserProfiles, saveUserProfiles } from '../services/firestoreService';

const MAX_PROFILES = 6;
const KEY_PROFILES = 'finanzapp_profiles';
const KEY_ACTIVE   = 'finanzapp_active_profile';

const ProfileCtx = createContext(null);

function lsProfiles() {
  try { return JSON.parse(localStorage.getItem(KEY_PROFILES)) || []; } catch { return []; }
}
function lsActive() {
  return localStorage.getItem(KEY_ACTIVE) || null;
}

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(lsProfiles);
  const [activeId, setActiveId] = useState(lsActive);
  const [synced,   setSynced]   = useState(false);

  const activeProfile = profiles.find(p => p.id === activeId) || null;

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        localStorage.removeItem(KEY_PROFILES);
        localStorage.removeItem(KEY_ACTIVE);
        setProfiles([]);
        setActiveId(null);
        setSynced(false);
        return;
      }
      try {
        const remote = await loadUserProfiles(user.uid);
        if (remote?.profiles?.length) {
          setProfiles(remote.profiles);
          setActiveId(remote.activeProfileId || remote.profiles[0]?.id || null);
        } else {
          const local = lsProfiles();
          if (local.length) {
            await saveUserProfiles(user.uid, local, lsActive());
          }
        }
      } catch (e) {
        console.error('Error cargando perfiles:', e);
      }
      setSynced(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeId) localStorage.setItem(KEY_ACTIVE, activeId);
    else localStorage.removeItem(KEY_ACTIVE);
  }, [activeId]);

  useEffect(() => {
    if (!synced) return;
    const user = auth.currentUser;
    if (!user) return;
    saveUserProfiles(user.uid, profiles, activeId).catch(console.error);
  }, [profiles, activeId, synced]);

  // ── NUEVO: gender es el segundo parámetro ──────────────────────────────────
  // 'f' → Finna  |  'm' o 'n' → Finn
  const createProfile = (name, gender = 'n') => {
    if (profiles.length >= MAX_PROFILES) return null;
    const id = 'p_' + Date.now();
    setProfiles(p => [...p, {
      id,
      name:      name.trim(),
      gender,               // ← NUEVO campo
      theme:     'dark-modern',
      createdAt: new Date().toISOString(),
    }]);
    return id;
  };

  const renameProfile = (id, name) => {
    setProfiles(p => p.map(x => x.id === id ? { ...x, name: name.trim() } : x));
  };

  // ── NUEVO: permite cambiar el género después de crear el perfil ────────────
  const updateProfileGender = (id, gender) => {
    setProfiles(p => p.map(x => x.id === id ? { ...x, gender } : x));
  };

  const deleteProfile = (id) => {
    ['deudas', 'ingresos', 'gastos', 'apuntes'].forEach(k =>
      localStorage.removeItem(`finanzapp_${k}_${id}`)
    );
    localStorage.removeItem(`finanzapp_theme_${id}`);
    localStorage.removeItem(`finanzapp_dark_${id}`);
    setProfiles(p => p.filter(x => x.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const switchProfile      = (id)        => setActiveId(id);
  const updateProfileTheme = (id, theme) => setProfiles(p =>
    p.map(x => x.id === id ? { ...x, theme } : x)
  );

  return (
    <ProfileCtx.Provider value={{
      profiles, activeProfile, activeId, maxProfiles: MAX_PROFILES, synced,
      createProfile, renameProfile, deleteProfile,
      switchProfile, updateProfileTheme, updateProfileGender,
    }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export const useProfile = () => useContext(ProfileCtx);
