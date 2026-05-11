import { useState } from 'react';
import { Plus, User, Trash2, Edit2, Check, X, Users } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

const AVATARS = ['🟠','🔵','🟢','🟣','🔴','🟡'];
const SUGGESTIONS = ['Mi perfil','Hogar','Negocio','Pareja','Familia','Ahorros'];

export default function ProfileSelector({ onSelect }) {
  const { profiles, createProfile, renameProfile, deleteProfile, switchProfile, maxProfiles } = useProfile();
  const [creating, setCreating]   = useState(profiles.length === 0);
  const [newName, setNewName]     = useState('');
  const [editId, setEditId]       = useState(null);
  const [editName, setEditName]   = useState('');
  const [error, setError]         = useState('');

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) { setError('Escribe un nombre para el perfil'); return; }
    if (profiles.some(p => p.name.toLowerCase() === name.toLowerCase())) { setError('Ya existe un perfil con ese nombre'); return; }
    const id = createProfile(name);
    if (id) { switchProfile(id); onSelect(id); }
  };

  const handleSelect = (id) => { switchProfile(id); onSelect(id); };

  const handleRename = (id) => {
    const name = editName.trim();
    if (!name) return;
    renameProfile(id, name);
    setEditId(null);
  };

  const handleDelete = (id, name) => {
    if (!confirm(`¿Eliminar el perfil "${name}" y todos sus datos? Esta acción no se puede deshacer.`)) return;
    deleteProfile(id);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080d16', padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: '#f97316', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24, fontWeight: 700, color: '#fff',
          }}>F</div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>FinanzApp</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            {profiles.length === 0 ? 'Crea tu primer perfil para comenzar' : '¿Con qué perfil vas a trabajar hoy?'}
          </p>
        </div>

        {/* Lista de perfiles */}
        {profiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {profiles.map((p, i) => (
              <div key={p.id} style={{
                background: '#0f1826', border: '0.5px solid #1e3a6e',
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: '#1e3a6e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {AVATARS[i % AVATARS.length]}
                </div>

                {editId === p.id ? (
                  <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(p.id); if (e.key === 'Escape') setEditId(null); }}
                      autoFocus
                      style={{
                        flex: 1, background: '#162032', border: '1px solid #2563eb',
                        borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    <button onClick={() => handleRename(p.id)} style={{ background: '#10b981', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#fff' }}>
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditId(null)} style={{ background: '#1e3a6e', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#94a3b8' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleSelect(p.id)}
                      style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                    >
                      <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                      <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
                        Creado {new Date(p.createdAt).toLocaleDateString('es-CO')}
                      </div>
                    </button>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => { setEditId(p.id); setEditName(p.name); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 6, borderRadius: 8 }}
                        title="Renombrar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 6, borderRadius: 8 }}
                        title="Eliminar perfil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulario crear perfil */}
        {creating ? (
          <div style={{ background: '#0f1826', border: '1px solid #2563eb', borderRadius: 14, padding: 20 }}>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 12px', fontWeight: 500 }}>
              {profiles.length === 0 ? 'Nombre de tu perfil' : 'Nombre del nuevo perfil'}
            </p>
            <input
              value={newName}
              onChange={e => { setNewName(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="Ej: Mi perfil, Hogar, Negocio…"
              autoFocus
              style={{
                width: '100%', background: '#162032', border: `1px solid ${error ? '#ef4444' : '#1e3a6e'}`,
                borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 15,
                outline: 'none', boxSizing: 'border-box', marginBottom: 8,
              }}
            />
            {/* Sugerencias */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {SUGGESTIONS.filter(s => !profiles.some(p => p.name === s)).slice(0, 4).map(s => (
                <button
                  key={s}
                  onClick={() => { setNewName(s); setError(''); }}
                  style={{
                    background: '#162032', border: '0.5px solid #1e3a6e', borderRadius: 20,
                    padding: '4px 12px', color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                  }}
                >{s}</button>
              ))}
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 10px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleCreate}
                style={{
                  flex: 1, background: '#f97316', border: 'none', borderRadius: 10,
                  padding: '11px', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >
                Crear perfil
              </button>
              {profiles.length > 0 && (
                <button
                  onClick={() => { setCreating(false); setError(''); setNewName(''); }}
                  style={{
                    background: '#162032', border: '0.5px solid #1e3a6e', borderRadius: 10,
                    padding: '11px 16px', color: '#94a3b8', fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ) : (
          profiles.length < maxProfiles && (
            <button
              onClick={() => { setCreating(true); setNewName(''); setError(''); }}
              style={{
                width: '100%', background: '#0f1826', border: '0.5px dashed #1e3a6e',
                borderRadius: 14, padding: '14px', color: '#475569', fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Plus size={16} /> Crear nuevo perfil
              <span style={{ fontSize: 11, color: '#334155' }}>({profiles.length}/{maxProfiles})</span>
            </button>
          )
        )}

        <p style={{ textAlign: 'center', color: '#334155', fontSize: 12, marginTop: 20 }}>
          Los datos de cada perfil se guardan en este navegador
        </p>
      </div>
    </div>
  );
}
