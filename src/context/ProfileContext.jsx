import { createContext, useContext, useState, useEffect } from 'react';

const MAX_PROFILES = 6;
const KEY_PROFILES = 'finanzapp_profiles';
const KEY_ACTIVE   = 'finanzapp_active_profile';

const ProfileCtx = createContext(null);

function loadProfiles() {
  try { return JSON.parse(localStorage.getItem(KEY_PROFILES)) || []; } catch { return []; }
}
function loadActive() {
  return localStorage.getItem(KEY_ACTIVE) || null;
}

export function ProfileProvider({ children }) {
  const [profiles, setProfiles]       = useState(loadProfiles);
  const [activeId, setActiveId]       = useState(loadActive);

  const activeProfile = profiles.find(p => p.id === activeId) || null;

  useEffect(() => {
    localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeId) localStorage.setItem(KEY_ACTIVE, activeId);
    else localStorage.removeItem(KEY_ACTIVE);
  }, [activeId]);

  const createProfile = (name) => {
    if (profiles.length >= MAX_PROFILES) return null;
    const id = 'p_' + Date.now();
    const newProfile = { id, name: name.trim(), theme: 'dark-modern', createdAt: new Date().toISOString() };
    setProfiles(p => [...p, newProfile]);
    return id;
  };

  const renameProfile = (id, name) => {
    setProfiles(p => p.map(x => x.id === id ? { ...x, name: name.trim() } : x));
  };

  const deleteProfile = (id) => {
    // Borrar datos del perfil
    ['deudas','ingresos','gastos'].forEach(k => localStorage.removeItem(`finanzapp_${k}_${id}`));
    localStorage.removeItem(`finanzapp_theme_${id}`);
    localStorage.removeItem(`finanzapp_dark_${id}`);
    setProfiles(p => p.filter(x => x.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const switchProfile = (id) => setActiveId(id);

  const updateProfileTheme = (id, theme) => {
    setProfiles(p => p.map(x => x.id === id ? { ...x, theme } : x));
  };

  return (
    <ProfileCtx.Provider value={{
      profiles, activeProfile, activeId, maxProfiles: MAX_PROFILES,
      createProfile, renameProfile, deleteProfile, switchProfile, updateProfileTheme,
    }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export const useProfile = () => useContext(ProfileCtx);
