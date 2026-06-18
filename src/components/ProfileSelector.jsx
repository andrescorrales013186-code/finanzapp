// ─────────────────────────────────────────────────────────────────────────────
// ProfileSelector.jsx — Pantalla de selección / creación de perfiles
//
// QUÉ CAMBIÓ:
//   • Al crear un perfil, el usuario elige género → determina la mascota
//   • Los perfiles existentes muestran a Finn o Finna según su género
//   • Diseño rediseñado: más limpio, premium, sin fondo azul custom
//
// CONCEPTO CLAVE — props vs estado:
//   - Props: datos que el padre le pasa al hijo (ej: onSelect)
//   - Estado (useState): datos que el componente maneja internamente
//     y que cuando cambian, React re-dibuja la pantalla automáticamente
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import Finn from './Finn';
import Finna from './Finna';

const SUGGESTIONS = ['Mi perfil', 'Hogar', 'Negocio', 'Pareja', 'Familia', 'Ahorros'];

// Componente auxiliar: muestra la mascota correcta según género
// Si el género es 'f' → Finna. Cualquier otro → Finn.
function Mascot({ gender = 'n', mood = 'happy', size = 48 }) {
  return gender === 'f'
    ? <Finna mood={mood} size={size} />
    : <Finn  mood={mood} size={size} />;
}

export default function ProfileSelector({ onSelect }) {
  const {
    profiles, createProfile, renameProfile,
    deleteProfile, switchProfile, maxProfiles,
  } = useProfile();

  const [creating,    setCreating]   = useState(profiles.length === 0);
  const [newName,     setNewName]    = useState('');
  const [newGender,   setNewGender]  = useState('n'); // 'n' | 'm' | 'f'
  const [editId,      setEditId]     = useState(null);
  const [editName,    setEditName]   = useState('');
  const [error,       setError]      = useState('');

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) { setError('Escribe un nombre para el perfil'); return; }
    if (profiles.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError('Ya existe un perfil con ese nombre'); return;
    }
    // Pasamos nombre Y género al contexto
    const id = createProfile(name, newGender);
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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080f1e',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {/* La mascota del header cambia según si estamos creando (muestra "thinking")
              o eligiendo (muestra "happy") */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Finn mood={creating ? 'thinking' : 'happy'} size={72}/>
          </div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 500, margin: '0 0 5px' }}>
            FinanzApp
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            {profiles.length === 0
              ? 'Crea tu primer perfil para comenzar'
              : '¿Con qué perfil trabajas hoy?'}
          </p>
        </div>

        {/* ── LISTA DE PERFILES EXISTENTES ── */}
        {profiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {profiles.map((p) => (
              <div key={p.id} style={{
                background: '#0f1826',
                border: '0.5px solid #1e3a6e',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>

                {/* Mascota pequeña del perfil */}
                <div style={{ flexShrink: 0 }}>
                  <Mascot gender={p.gender} mood="happy" size={44}/>
                </div>

                {editId === p.id ? (
                  /* Modo edición: input de texto + botones confirmar/cancelar */
                  <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(p.id);
                        if (e.key === 'Escape') setEditId(null);
                      }}
                      autoFocus
                      style={{
                        flex: 1, background: '#162032',
                        border: '1px solid #2563eb', borderRadius: 8,
                        padding: '6px 10px', color: '#fff',
                        fontSize: 14, outline: 'none',
                      }}
                    />
                    <button onClick={() => handleRename(p.id)} style={{
                      background: '#10b981', border: 'none', borderRadius: 8,
                      padding: '6px 10px', cursor: 'pointer', color: '#fff',
                    }}>
                      <Check size={14}/>
                    </button>
                    <button onClick={() => setEditId(null)} style={{
                      background: '#1e3a6e', border: 'none', borderRadius: 8,
                      padding: '6px 10px', cursor: 'pointer', color: '#94a3b8',
                    }}>
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Nombre y fecha — clickeable para seleccionar */}
                    <button
                      onClick={() => handleSelect(p.id)}
                      style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                    >
                      <div style={{ color: '#f1f5f9', fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                      <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                        {p.gender === 'f' ? 'Perfil Finna' : 'Perfil Finn'} · {new Date(p.createdAt).toLocaleDateString('es-CO')}
                      </div>
                    </button>
                    {/* Acciones editar/eliminar */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => { setEditId(p.id); setEditName(p.name); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 6, borderRadius: 8 }}
                        title="Renombrar"
                      >
                        <Edit2 size={14}/>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 6, borderRadius: 8 }}
                        title="Eliminar perfil"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── FORMULARIO CREAR PERFIL ── */}
        {creating ? (
          <div style={{
            background: '#0f1826',
            border: '0.5px solid #2563eb',
            borderRadius: 14,
            padding: 20,
          }}>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 14px', fontWeight: 500 }}>
              {profiles.length === 0 ? 'Crea tu primer perfil' : 'Nuevo perfil'}
            </p>

            {/* Input del nombre */}
            <input
              value={newName}
              onChange={e => { setNewName(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="Ej: Mi perfil, Hogar, Negocio…"
              autoFocus
              style={{
                width: '100%', background: '#162032',
                border: `0.5px solid ${error ? '#ef4444' : '#1e3a6e'}`,
                borderRadius: 10, padding: '10px 14px',
                color: '#fff', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', marginBottom: 10,
              }}
            />

            {/* Sugerencias de nombre */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {SUGGESTIONS
                .filter(s => !profiles.some(p => p.name === s))
                .slice(0, 4)
                .map(s => (
                  <button key={s} onClick={() => { setNewName(s); setError(''); }} style={{
                    background: '#162032', border: '0.5px solid #1e3a6e',
                    borderRadius: 20, padding: '4px 12px',
                    color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                  }}>
                    {s}
                  </button>
                ))}
            </div>

            {/* ── SELECTOR DE MASCOTA / GÉNERO ── */}
            {/* Este es el bloque nuevo más importante del formulario */}
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 10px', fontWeight: 500 }}>
              Elige tu mascota
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>

              {/* Opción Finn (masculino) */}
              <button
                onClick={() => setNewGender('m')}
                style={{
                  background: newGender === 'm' ? 'rgba(249,115,22,0.1)' : '#162032',
                  border: `1.5px solid ${newGender === 'm' ? '#f97316' : '#1e3a6e'}`,
                  borderRadius: 12, padding: '12px 8px',
                  cursor: 'pointer', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all .15s',
                }}
              >
                <Finn mood="happy" size={52}/>
                <span style={{ fontSize: 11, color: newGender === 'm' ? '#fb923c' : '#64748b', fontWeight: 500 }}>Finn</span>
              </button>

              {/* Opción Finna (femenino) */}
              <button
                onClick={() => setNewGender('f')}
                style={{
                  background: newGender === 'f' ? 'rgba(236,72,153,0.1)' : '#162032',
                  border: `1.5px solid ${newGender === 'f' ? '#ec4899' : '#1e3a6e'}`,
                  borderRadius: 12, padding: '12px 8px',
                  cursor: 'pointer', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all .15s',
                }}
              >
                <Finna mood="happy" size={52}/>
                <span style={{ fontSize: 11, color: newGender === 'f' ? '#ec4899' : '#64748b', fontWeight: 500 }}>Finna</span>
              </button>

              {/* Opción neutro */}
              <button
                onClick={() => setNewGender('n')}
                style={{
                  background: newGender === 'n' ? 'rgba(249,115,22,0.1)' : '#162032',
                  border: `1.5px solid ${newGender === 'n' ? '#f97316' : '#1e3a6e'}`,
                  borderRadius: 12, padding: '12px 8px',
                  cursor: 'pointer', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all .15s',
                }}
              >
                {/* Neutro: mostramos a Finn pensando */}
                <Finn mood="thinking" size={52}/>
                <span style={{ fontSize: 11, color: newGender === 'n' ? '#fb923c' : '#64748b', fontWeight: 500 }}>Neutro</span>
              </button>

            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 10px' }}>{error}</p>}

            {/* Botones crear / cancelar */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCreate} style={{
                flex: 1, background: '#f97316', border: 'none',
                borderRadius: 10, padding: 11, color: '#fff',
                fontWeight: 500, fontSize: 14, cursor: 'pointer',
              }}>
                Crear perfil
              </button>
              {profiles.length > 0 && (
                <button
                  onClick={() => { setCreating(false); setError(''); setNewName(''); setNewGender('n'); }}
                  style={{
                    background: '#162032', border: '0.5px solid #1e3a6e',
                    borderRadius: 10, padding: '11px 16px',
                    color: '#94a3b8', fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

        ) : (
          /* Botón para abrir el formulario de nuevo perfil */
          profiles.length < maxProfiles && (
            <button
              onClick={() => { setCreating(true); setNewName(''); setError(''); setNewGender('n'); }}
              style={{
                width: '100%', background: '#0f1826',
                border: '0.5px dashed #1e3a6e',
                borderRadius: 14, padding: 14,
                color: '#475569', fontSize: 14,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Plus size={16}/> Crear nuevo perfil
              <span style={{ fontSize: 11, color: '#334155' }}>({profiles.length}/{maxProfiles})</span>
            </button>
          )
        )}

        <p style={{ textAlign: 'center', color: '#334155', fontSize: 11, marginTop: 18 }}>
          Tus datos se guardan de forma segura en la nube.
        </p>
      </div>
    </div>
  );
}
