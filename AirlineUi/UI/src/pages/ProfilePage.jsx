import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, ArrowLeft, User, Mail, Phone, MapPin, Calendar,
  Shield, Star, Edit3, Check, X, Plus, Trash2, Camera,
  Settings, Users, ChevronRight, LogOut, Heart,
  AlertCircle, CheckCircle, Loader2, ChevronDown,
} from 'lucide-react';
import { useTheme }       from '../context/ThemeContext';
import { useAuth }        from '../context/AuthContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useWishlist }    from '../context/WishlistContext';
import { validateEmail, validatePhone, validateName, validateDob }
  from '../services/userService';
import { GENDERS, SEAT_PREFS, MEAL_PREFS, CURRENCIES } from '../data/user.js';
import { RELATIONS } from '../data/passengers.js';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════
   THEME HELPERS
═══════════════════════════════════════════════════════════ */
function useStyles(isDark) {
  return {
    textH:  isDark ? 'text-white'     : 'text-slate-800',
    textS:  isDark ? 'text-white/50'  : 'text-slate-500',
    card:   isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]',
    input:  `w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all focus:border-[#1956D6]/60 focus:ring-2 focus:ring-[#1956D6]/10 ${
              isDark ? 'bg-white/[0.04] border-white/10 text-white placeholder-white/25'
                     : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`,
    select: `w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all focus:border-[#1956D6]/60 focus:ring-2 focus:ring-[#1956D6]/10 ${
              isDark ? 'bg-[#0A1428] border-white/10 text-white [color-scheme:dark]'
                     : 'bg-white border-slate-200 text-slate-800'}`,
    sep:    isDark ? 'border-white/[0.06]' : 'border-slate-100',
    subCard: isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-slate-50 border-slate-100',
  };
}

/* ═══════════════════════════════════════════════════════════
   REUSABLE ATOMS
═══════════════════════════════════════════════════════════ */
function FieldLabel({ children, textS }) {
  return <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${textS}`}>{children}</label>;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{msg}</p>;
}

function SaveButton({ loading, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-primary px-5 py-2 rounded-xl text-sm gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      {loading ? 'Saving…' : 'Save'}
    </button>
  );
}

function CancelButton({ onClick, textS, isDark }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${isDark ? 'border-white/10 text-white/50 hover:border-white/20' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
      Cancel
    </button>
  );
}

function SectionCard({ title, subtitle, icon: Icon, action, children, isDark }) {
  const { textH, textS, card } = useStyles(isDark);
  return (
    <div className={`border rounded-2xl overflow-hidden ${card}`}>
      <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
            <Icon size={16} className="text-[#1956D6]" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${textH}`}>{title}</h2>
            {subtitle && <p className={`text-[11px] ${textS}`}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function DisplayRow({ label, value, textH, textS, sep }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b ${sep}`}>
      <span className={`text-xs font-semibold ${textS}`}>{label}</span>
      <span className={`text-sm font-medium ${value ? textH : textS}`}>{value || '—'}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AVATAR UPLOADER
═══════════════════════════════════════════════════════════ */
function AvatarUploader({ profile, onUpload, isDark }) {
  const ref     = useRef();
  const [busy, setBusy] = useState(false);
  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5 MB.'); return; }
    setBusy(true);
    try {
      await onUpload(file);
      toast.success('Profile picture updated');
    } catch {
      toast.error('Upload failed. Try again.');
    } finally { setBusy(false); }
  };

  return (
    <div className="relative group w-fit">
      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl shadow-[#1956D6]/20 flex-shrink-0">
        {profile?.avatar
          ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[#1956D6] to-[#3B82F6] flex items-center justify-center text-white text-2xl font-bold">{initials}</div>
        }
      </div>
      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 ${isDark ? 'bg-black/50' : 'bg-black/40'}`}
        title="Change photo"
      >
        {busy ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 1 — PERSONAL INFORMATION
═══════════════════════════════════════════════════════════ */
function PersonalInfoSection({ profile, onSave, isDark }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({});
  const [errors,  setErrors]  = useState({});
  const st = useStyles(isDark);

  const startEdit = () => {
    setForm({ name: profile.name ?? '', gender: profile.gender ?? '', dob: profile.dob ?? '', nationality: profile.nationality ?? '', frequentFlyer: profile.frequentFlyer ?? '' });
    setErrors({});
    setEditing(true);
  };

  const validate = () => {
    const e = {};
    if (!validateName(form.name))  e.name   = 'Name must be at least 2 characters.';
    if (!form.gender)              e.gender  = 'Please select a gender.';
    if (form.dob && !validateDob(form.dob)) e.dob = 'Please enter a valid date of birth.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ name: form.name, gender: form.gender, dob: form.dob, nationality: form.nationality, frequentFlyer: form.frequentFlyer });
      toast.success('Personal information updated');
      setEditing(false);
    } catch { toast.error('Save failed. Try again.'); }
    finally { setSaving(false); }
  };

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })); };

  const editBtn = !editing && (
    <button onClick={startEdit} className="flex items-center gap-1.5 text-xs font-semibold text-[#1956D6] hover:underline">
      <Edit3 size={13}/> Edit
    </button>
  );

  return (
    <SectionCard title="Personal Information" subtitle="Your basic details" icon={User} action={editBtn} isDark={isDark}>
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <FieldLabel textS={st.textS}>Full Name *</FieldLabel>
              <input className={st.input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahul Sharma" />
              <FieldError msg={errors.name} />
            </div>
            {/* Gender */}
            <div>
              <FieldLabel textS={st.textS}>Gender *</FieldLabel>
              <select className={st.select} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <FieldError msg={errors.gender} />
            </div>
            {/* DOB */}
            <div>
              <FieldLabel textS={st.textS}>Date of Birth</FieldLabel>
              <input type="date" className={st.input} value={form.dob} max={new Date().toISOString().split('T')[0]} onChange={e => set('dob', e.target.value)} />
              <FieldError msg={errors.dob} />
            </div>
            {/* Nationality */}
            <div>
              <FieldLabel textS={st.textS}>Nationality</FieldLabel>
              <input className={st.input} value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g. Indian" />
            </div>
            {/* Frequent Flyer */}
            <div className="sm:col-span-2">
              <FieldLabel textS={st.textS}>Frequent Flyer Number</FieldLabel>
              <input className={st.input} value={form.frequentFlyer} onChange={e => set('frequentFlyer', e.target.value)} placeholder="e.g. SV-FF-12345678" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <SaveButton loading={saving} onClick={handleSave} />
            <CancelButton onClick={() => setEditing(false)} isDark={isDark} />
          </div>
        </div>
      ) : (
        <div>
          <DisplayRow label="Full Name"        value={profile?.name}          textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Gender"           value={profile?.gender}        textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Date of Birth"    value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Nationality"      value={profile?.nationality}   textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Frequent Flyer"   value={profile?.frequentFlyer} textH={st.textH} textS={st.textS} sep={st.sep} />
        </div>
      )}
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 2 — CONTACT DETAILS
═══════════════════════════════════════════════════════════ */
function ContactSection({ profile, onSave, isDark }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({});
  const [errors,  setErrors]  = useState({});
  const st = useStyles(isDark);

  const startEdit = () => {
    setForm({ email: profile.email ?? '', phone: profile.phone ?? '', city: profile.city ?? '' });
    setErrors({});
    setEditing(true);
  };

  const validate = () => {
    const e = {};
    if (!form.email || !validateEmail(form.email)) e.email = 'Please enter a valid email address.';
    if (form.phone && !validatePhone(form.phone))  e.phone = 'Please enter a valid phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ email: form.email.trim(), phone: form.phone.trim(), city: form.city.trim() });
      toast.success('Contact details updated');
      setEditing(false);
    } catch { toast.error('Save failed. Try again.'); }
    finally { setSaving(false); }
  };

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })); };

  const editBtn = !editing && (
    <button onClick={startEdit} className="flex items-center gap-1.5 text-xs font-semibold text-[#1956D6] hover:underline">
      <Edit3 size={13}/> Edit
    </button>
  );

  return (
    <SectionCard title="Contact Details" subtitle="How we reach you" icon={Phone} action={editBtn} isDark={isDark}>
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FieldLabel textS={st.textS}>Email Address *</FieldLabel>
              <input type="email" className={st.input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              <FieldError msg={errors.email} />
            </div>
            <div>
              <FieldLabel textS={st.textS}>Phone Number</FieldLabel>
              <input
                type="tel"
                className={st.input}
                value={form.phone}
                maxLength={10}
                placeholder="10-digit mobile number"
                onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
              <FieldError msg={errors.phone} />
            </div>
            <div>
              <FieldLabel textS={st.textS}>Home City</FieldLabel>
              <input className={st.input} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Mumbai" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <SaveButton loading={saving} onClick={handleSave} />
            <CancelButton onClick={() => setEditing(false)} isDark={isDark} />
          </div>
        </div>
      ) : (
        <div>
          <DisplayRow label="Email"      value={profile?.email} textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Phone"      value={profile?.phone} textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Home City"  value={profile?.city}  textH={st.textH} textS={st.textS} sep={st.sep} />
        </div>
      )}
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   PASSENGER FORM (add / edit inline)
═══════════════════════════════════════════════════════════ */
function PassengerForm({ initial, onSave, onCancel, saving, isDark }) {
  const [form,   setForm]   = useState(initial || { name: '', email: '', phone: '', age: '', gender: '', relation: '', dob: '' });
  const [errors, setErrors] = useState({});
  const st = useStyles(isDark);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })); };

  const validate = () => {
    const e = {};
    if (!validateName(form.name)) e.name = 'Name is required (min 2 chars).';
    if (!form.gender)             e.gender = 'Gender is required.';
    if (form.age && (isNaN(form.age) || form.age < 0 || form.age > 120)) e.age = 'Enter a valid age.';
    if (form.email && !validateEmail(form.email)) e.email = 'Invalid email format.';
    if (form.phone && !validatePhone(form.phone)) e.phone = 'Invalid phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => { if (validate()) onSave({ ...form, age: form.age ? Number(form.age) : null }); };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-slate-50 border-slate-100'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <FieldLabel textS={st.textS}>Full Name *</FieldLabel>
          <input className={st.input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Passenger name" />
          <FieldError msg={errors.name} />
        </div>
        <div>
          <FieldLabel textS={st.textS}>Gender *</FieldLabel>
          <select className={st.select} value={form.gender} onChange={e => set('gender', e.target.value)}>
            <option value="">Select gender</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <FieldError msg={errors.gender} />
        </div>
        <div>
          <FieldLabel textS={st.textS}>Age</FieldLabel>
          <input type="number" min="0" max="120" className={st.input} value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 28" />
          <FieldError msg={errors.age} />
        </div>
        <div>
          <FieldLabel textS={st.textS}>Date of Birth</FieldLabel>
          <input type="date" className={st.input} value={form.dob} max={new Date().toISOString().split('T')[0]} onChange={e => set('dob', e.target.value)} />
        </div>
        <div>
          <FieldLabel textS={st.textS}>Relation</FieldLabel>
          <select className={st.select} value={form.relation} onChange={e => set('relation', e.target.value)}>
            <option value="">Select relation</option>
            {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel textS={st.textS}>Email</FieldLabel>
          <input type="email" className={st.input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="Optional" />
          <FieldError msg={errors.email} />
        </div>
        <div>
          <FieldLabel textS={st.textS}>Phone</FieldLabel>
          <input
            type="tel"
            className={st.input}
            value={form.phone}
            maxLength={10}
            placeholder="10-digit mobile number"
            onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
          <FieldError msg={errors.phone} />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <SaveButton loading={saving} onClick={handleSave} />
        <CancelButton onClick={onCancel} isDark={isDark} />
      </div>
    </div>
  );
}

/* ── Passenger card (display mode) ── */
function PassengerCard({ pax, onEdit, onDelete, isDark }) {
  const { textH, textS, sep } = useStyles(isDark);
  const [deleting, setDeleting] = useState(false);
  const initials = pax.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const GENDER_COLORS = { Male: '#1956D6', Female: '#EC4899', 'Non-binary': '#8B5CF6', default: '#6B7280' };
  const color = GENDER_COLORS[pax.gender] ?? GENDER_COLORS.default;

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(pax.id); toast.success(`${pax.name} removed`); }
    catch { toast.error('Delete failed.'); setDeleting(false); }
  };

  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-4 transition-all hover:shadow-md ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-white border-slate-100'}`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow" style={{ background: color }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm ${textH}`}>{pax.name}</div>
        <div className={`text-xs mt-0.5 ${textS} flex flex-wrap items-center gap-2`}>
          {pax.gender && <span>{pax.gender}</span>}
          {pax.age    && <span>· Age {pax.age}</span>}
          {pax.relation && <span className="px-2 py-0.5 rounded-full bg-[#1956D6]/10 text-[#1956D6] font-semibold">{pax.relation}</span>}
        </div>
        {pax.email && <div className={`text-[11px] mt-1 flex items-center gap-1 ${textS}`}><Mail size={10}/> {pax.email}</div>}
        {pax.phone && <div className={`text-[11px] mt-0.5 flex items-center gap-1 ${textS}`}><Phone size={10}/> {pax.phone}</div>}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button onClick={() => onEdit(pax)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[#1956D6] transition ${isDark ? 'hover:bg-[#1956D6]/10' : 'hover:bg-blue-50'}`}>
          <Edit3 size={14}/>
        </button>
        <button onClick={handleDelete} disabled={deleting} className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'} disabled:opacity-40`}>
          {deleting ? <Loader2 size={13} className="animate-spin"/> : <Trash2 size={13}/>}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BULK PASSENGER FORM
═══════════════════════════════════════════════════════════ */
function BulkPassengerForm({ onSave, onCancel, saving, isDark }) {
  const st = useStyles(isDark);
  const emptyRow = () => ({ name: '', age: '', gender: '', relation: '', dob: '', email: '', phone: '' });
  const [rows,   setRows]   = useState([emptyRow()]);
  const [errors, setErrors] = useState([{}]);

  const update = (i, field, val) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
    setErrors(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: '' } : e));
  };

  const addRow    = () => { setRows(p => [...p, emptyRow()]); setErrors(p => [...p, {}]); };
  const removeRow = (i) => {
    if (rows.length === 1) return;
    setRows(p => p.filter((_, idx) => idx !== i));
    setErrors(p => p.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    let valid = true;
    const errs = rows.map(r => {
      const e = {};
      if (!r.name.trim())                          { e.name   = 'Name is required.';    valid = false; }
      if (!r.gender)                               { e.gender = 'Gender is required.';  valid = false; }
      if (r.email && !validateEmail(r.email))      { e.email  = 'Invalid email.';       valid = false; }
      if (r.phone && !validatePhone(r.phone))      { e.phone  = 'Invalid phone.';       valid = false; }
      return e;
    });
    setErrors(errs);
    return valid;
  };

  const handleSave = () => { if (validate()) onSave(rows); };

  return (
    <div className="space-y-4">
      {rows.map((r, i) => (
        <div key={i} className={`rounded-2xl border p-4 space-y-3 ${
          isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <span className="w-6 h-6 rounded-full bg-[#1956D6] text-white text-xs flex items-center justify-center">{i + 1}</span>
              Passenger {i + 1}
            </span>
            {rows.length > 1 && (
              <button onClick={() => removeRow(i)}
                className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="sm:col-span-2">
              <FieldLabel textS={st.textS}>Full Name *</FieldLabel>
              <input className={st.input} value={r.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Passenger name" />
              <FieldError msg={errors[i]?.name} />
            </div>
            {/* Gender */}
            <div>
              <FieldLabel textS={st.textS}>Gender *</FieldLabel>
              <select className={st.select} value={r.gender} onChange={e => update(i, 'gender', e.target.value)}>
                <option value="">Select gender</option>
                {['Male','Female','Other'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <FieldError msg={errors[i]?.gender} />
            </div>
            {/* Age */}
            <div>
              <FieldLabel textS={st.textS}>Age</FieldLabel>
              <input type="number" min="0" max="120" className={st.input} value={r.age}
                onChange={e => update(i, 'age', e.target.value)} placeholder="e.g. 28" />
            </div>
            {/* Relation */}
            <div>
              <FieldLabel textS={st.textS}>Relation</FieldLabel>
              <select className={st.select} value={r.relation} onChange={e => update(i, 'relation', e.target.value)}>
                <option value="">Select relation</option>
                {RELATIONS.map(rel => <option key={rel} value={rel}>{rel}</option>)}
              </select>
            </div>
            {/* DOB */}
            <div>
              <FieldLabel textS={st.textS}>Date of Birth</FieldLabel>
              <input type="date" className={st.input} value={r.dob}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => update(i, 'dob', e.target.value)} />
            </div>
            {/* Email */}
            <div>
              <FieldLabel textS={st.textS}>Email</FieldLabel>
              <input type="email" className={st.input} value={r.email}
                onChange={e => update(i, 'email', e.target.value)} placeholder="Optional" />
              <FieldError msg={errors[i]?.email} />
            </div>
            {/* Phone */}
            <div>
              <FieldLabel textS={st.textS}>Phone</FieldLabel>
              <input
                type="tel"
                className={st.input}
                value={r.phone}
                maxLength={10}
                placeholder="10-digit mobile number"
                onChange={e => update(i, 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
              <FieldError msg={errors[i]?.phone} />
            </div>
          </div>
        </div>
      ))}

      {/* Add row */}
      <button onClick={addRow}
        className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-semibold text-sm transition-colors ${
          isDark ? 'border-white/20 text-white/60 hover:bg-white/[0.04] hover:text-white'
                 : 'border-[#1956D6]/30 text-[#1956D6] hover:bg-[#1956D6]/5'
        }`}>
        <Plus size={14} /> Add Another Passenger
      </button>

      <div className="flex gap-3 pt-1">
        <SaveButton loading={saving} onClick={handleSave} />
        <CancelButton onClick={onCancel} isDark={isDark} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3 — SAVED PASSENGERS
═══════════════════════════════════════════════════════════ */
function PassengersSection({ passengers, onAdd, onBulkAdd, onEdit, onDelete, loading, userId, isDark }) {
  const [mode,       setMode]       = useState('list'); // 'list' | 'add' | 'edit' | 'bulk'
  const [editingPax, setEditingPax] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [bulkResult, setBulkResult] = useState(null);  // success banner data
  const [bulkErr,    setBulkErr]    = useState('');
  const st = useStyles(isDark);

  const handleAdd = async (data) => {
    setSaving(true);
    try { await onAdd(data); toast.success('Passenger added'); setMode('list'); }
    catch { toast.error('Could not add passenger.'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try { await onEdit(editingPax.id, data); toast.success('Passenger updated'); setMode('list'); setEditingPax(null); }
    catch { toast.error('Could not update passenger.'); }
    finally { setSaving(false); }
  };

  const handleBulkSave = async (rows) => {
    setSaving(true);
    setBulkErr('');
    try {
      const result = await onBulkAdd(userId, rows);
      setBulkResult(result);
      setMode('list');
      toast.success(`${result.savedCount ?? rows.length} passenger(s) saved!`);
    } catch (err) {
      setBulkErr(err.message || 'Failed to save passengers. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (pax) => { setEditingPax(pax); setMode('edit'); };

  const addBtn = mode === 'list' && (
    <div className="flex items-center gap-2">
      <button onClick={() => { setBulkResult(null); setBulkErr(''); setMode('bulk'); }}
        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:underline">
        <Plus size={13}/> Add Multiple
      </button>
      <span className={`text-xs ${isDark ? 'text-white/20' : 'text-slate-300'}`}>|</span>
      <button onClick={() => setMode('add')} className="flex items-center gap-1.5 text-xs font-semibold text-[#1956D6] hover:underline">
        <Plus size={13}/> Add passenger
      </button>
    </div>
  );

  return (
    <SectionCard title="Saved Passengers" subtitle={`${passengers.length} passenger${passengers.length !== 1 ? 's' : ''} saved · Reused in booking`} icon={Users} action={addBtn} isDark={isDark}>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={24} className="text-[#1956D6] animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {/* Bulk save success banner */}
          {bulkResult && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                     : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">{bulkResult.message ?? 'Passengers saved!'}</p>
                {bulkResult.passengers?.length > 0 && (
                  <p className="text-xs mt-0.5 opacity-80">
                    Saved: {bulkResult.passengers.map(p => p.name).join(', ')}
                  </p>
                )}
              </div>
              <button onClick={() => setBulkResult(null)} className="ml-auto opacity-50 hover:opacity-100"><X size={14}/></button>
            </div>
          )}
          {/* Bulk save error banner */}
          {bulkErr && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
              isDark ? 'bg-red-500/10 border-red-500/25 text-red-400'
                     : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <AlertCircle size={15} className="shrink-0" />
              <span className="text-sm font-medium flex-1">{bulkErr}</span>
              <button onClick={() => setBulkErr('')} className="opacity-50 hover:opacity-100"><X size={13}/></button>
            </div>
          )}

          {mode === 'add' && (
            <PassengerForm onSave={handleAdd} onCancel={() => setMode('list')} saving={saving} isDark={isDark} />
          )}
          {mode === 'edit' && editingPax && (
            <PassengerForm initial={editingPax} onSave={handleEdit} onCancel={() => { setMode('list'); setEditingPax(null); }} saving={saving} isDark={isDark} />
          )}
          {mode === 'bulk' && (
            <BulkPassengerForm
              onSave={handleBulkSave}
              onCancel={() => { setMode('list'); setBulkErr(''); }}
              saving={saving}
              isDark={isDark}
            />
          )}
          {passengers.length === 0 && mode === 'list' && (
            <div className={`text-center py-8 ${st.textS} text-sm`}>
              No saved passengers yet. Add family members for faster booking.
            </div>
          )}
          {mode === 'list' && passengers.map(pax => (
            <PassengerCard key={pax.id} pax={pax} onEdit={startEdit} onDelete={onDelete} isDark={isDark} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4 — PREFERENCES
═══════════════════════════════════════════════════════════ */
function PreferencesSection({ profile, onSave, isDark }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [prefs,   setPrefs]   = useState({});
  const st = useStyles(isDark);

  const startEdit = () => {
    setPrefs({ ...(profile?.preferences ?? {}) });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ preferences: prefs });
      toast.success('Preferences saved');
      setEditing(false);
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  const set = (f, v) => setPrefs(p => ({ ...p, [f]: v }));

  const editBtn = !editing && (
    <button onClick={startEdit} className="flex items-center gap-1.5 text-xs font-semibold text-[#1956D6] hover:underline">
      <Edit3 size={13}/> Edit
    </button>
  );

  const currentPrefs = profile?.preferences ?? {};

  // Toggle option button
  const TogglePill = ({ value, label, field, icon }) => {
    const active = prefs[field] === value;
    return (
      <button
        type="button"
        onClick={() => set(field, value)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
          active
            ? 'bg-[#1956D6] border-[#1956D6] text-white shadow-md shadow-[#1956D6]/25'
            : isDark ? 'border-white/10 text-white/60 hover:border-[#1956D6]/30' : 'border-slate-200 text-slate-600 hover:border-[#1956D6]/30 hover:text-[#1956D6]'
        }`}
      >
        {icon && <span>{icon}</span>}
        {label}
      </button>
    );
  };

  return (
    <SectionCard title="Preferences" subtitle="Defaults applied to every booking" icon={Settings} action={editBtn} isDark={isDark}>
      {editing ? (
        <div className="space-y-6">
          {/* Seat preference */}
          <div>
            <FieldLabel textS={st.textS}>Seat Preference</FieldLabel>
            <div className="flex flex-wrap gap-2 mt-1">
              {SEAT_PREFS.map(s => <TogglePill key={s} value={s} label={s.charAt(0).toUpperCase() + s.slice(1)} field="seat" />)}
            </div>
          </div>
          {/* Meal preference */}
          <div>
            <FieldLabel textS={st.textS}>Meal Preference</FieldLabel>
            <div className="flex flex-wrap gap-2 mt-1">
              {MEAL_PREFS.map(m => <TogglePill key={m.value} value={m.value} label={m.label} field="meal" />)}
            </div>
          </div>
          {/* Currency */}
          <div>
            <FieldLabel textS={st.textS}>Display Currency</FieldLabel>
            <select className={`${st.select} w-40 mt-1`} value={prefs.currency ?? 'INR'} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Notifications */}
          <div>
            <FieldLabel textS={st.textS}>Email Notifications</FieldLabel>
            <label className="flex items-center gap-3 mt-1 cursor-pointer">
              <div
                onClick={() => set('notifications', !prefs.notifications)}
                className={`relative w-11 h-6 rounded-full transition-all duration-200 ${prefs.notifications ? 'bg-[#1956D6]' : isDark ? 'bg-white/10' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${prefs.notifications ? 'left-6' : 'left-1'}`} />
              </div>
              <span className={`text-sm font-medium ${st.textH}`}>{prefs.notifications ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <SaveButton loading={saving} onClick={handleSave} />
            <CancelButton onClick={() => setEditing(false)} isDark={isDark} />
          </div>
        </div>
      ) : (
        <div>
          <DisplayRow label="Seat Preference" value={currentPrefs.seat ? currentPrefs.seat.charAt(0).toUpperCase() + currentPrefs.seat.slice(1) : ''} textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Meal Preference" value={MEAL_PREFS.find(m => m.value === currentPrefs.meal)?.label ?? ''} textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Currency"        value={currentPrefs.currency} textH={st.textH} textS={st.textS} sep={st.sep} />
          <DisplayRow label="Notifications"   value={currentPrefs.notifications !== false ? 'Enabled' : 'Disabled'} textH={st.textH} textS={st.textS} sep={st.sep} />
        </div>
      )}
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR NAV
═══════════════════════════════════════════════════════════ */
const SECTIONS = [
  { id: 'personal',   label: 'Personal Info',    icon: User },
  { id: 'contact',    label: 'Contact Details',  icon: Phone },
  { id: 'passengers', label: 'Saved Passengers', icon: Users },
  { id: 'prefs',      label: 'Preferences',      icon: Settings },
];

function SidebarNav({ active, onChange, isDark }) {
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  return (
    <nav className={`border rounded-2xl overflow-hidden sticky top-24 ${card}`}>
      {SECTIONS.map((s, i) => {
        const Icon   = s.icon;
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all ${i > 0 ? `border-t ${isDark ? 'border-white/[0.05]' : 'border-slate-100'}` : ''} ${
              isActive
                ? 'text-[#1956D6] bg-[#1956D6]/5'
                : `${textS} hover:${textH}`
            }`}
          >
            <Icon size={16} className={isActive ? 'text-[#1956D6]' : ''} />
            <span>{s.label}</span>
            {isActive && <ChevronRight size={14} className="ml-auto text-[#1956D6]" />}
          </button>
        );
      })}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROFILE PAGE (main)
═══════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const { logout, user } = useAuth();
  const { wishlist } = useWishlist();
  const {
    profile, profileLoading,
    passengers, passengerLoading,
    saveProfile, saveAvatar,
    addPax, editPax, removePax, bulkAddPax,
  } = useUserProfile();

  const [activeSection, setActiveSection] = useState('personal');

  const bg    = isDark ? 'bg-[#060B17]'  : 'bg-[#F4F7FF]';
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const navBg = isDark ? 'bg-[#060B17]/95 border-white/[0.07]' : 'bg-white/95 border-black/[0.07]';

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  // Scroll active section into view on small screens
  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (profileLoading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <Loader2 size={36} className="text-[#1956D6] animate-spin" />
      </div>
    );
  }

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* ── Nav ── */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${navBg}`}>
        <div className="container h-16 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            <ArrowLeft size={16}/> Dashboard
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-6 h-6 rounded-md bg-[#1956D6] flex items-center justify-center">
              <Plane size={11} className="text-white -rotate-45"/>
            </div>
            <span className={`font-bold text-sm ${textH}`}>My Profile</span>
          </div>
          <button onClick={handleLogout} className={`ml-auto flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10 border border-red-500/20' : 'text-red-600 hover:bg-red-50 border border-red-200'}`}>
            <LogOut size={14}/> Sign out
          </button>
        </div>
      </nav>

      <div className="container py-8">
        {/* ── Hero card ── */}
        <div className={`border rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 ${card}`}>
          <AvatarUploader profile={profile} onUpload={saveAvatar} isDark={isDark} />
          <div className="flex-1 text-center sm:text-left">
            <h1 className={`text-2xl font-bold ${textH}`}>{profile?.name || 'Your Name'}</h1>
            <p className={`text-sm mt-0.5 ${textS}`}>{profile?.email || 'your@email.com'}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1956D6]/10 text-[#1956D6] flex items-center gap-1">
                <Shield size={11}/> Verified Member
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                profile?.tier === 'gold'     ? 'bg-yellow-500/10 text-yellow-500' :
                profile?.tier === 'platinum' ? 'bg-purple-500/10 text-purple-500' :
                                               'bg-slate-500/10 text-slate-500'
              }`}>
                <Star size={11} fill="currentColor"/>
                {(profile?.tier ?? 'Silver').charAt(0).toUpperCase() + (profile?.tier ?? 'silver').slice(1)} Tier
              </span>
              {wishlist.length > 0 && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 flex items-center gap-1">
                  <Heart size={11} fill="currentColor"/> {wishlist.length} saved
                </span>
              )}
            </div>
            {profile?.frequentFlyer && (
              <p className={`text-xs mt-2 font-mono ${textS}`}>FF# {profile.frequentFlyer}</p>
            )}
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button onClick={() => navigate('/my-bookings')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${isDark ? 'border-white/10 text-white/60 hover:border-[#1956D6]/30 hover:text-[#1956D6]' : 'border-slate-200 text-slate-600 hover:border-[#1956D6]/30 hover:text-[#1956D6]'}`}>
              <Plane size={13} className="-rotate-45"/> My Bookings
            </button>
          </div>
        </div>

        {/* ── Mobile tab pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 md:hidden hide-scrollbar">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollToSection(s.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeSection === s.id
                  ? 'bg-[#1956D6] text-white'
                  : isDark ? 'bg-white/[0.06] text-white/60' : 'bg-white border border-slate-200 text-slate-600'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Main layout ── */}
        <div className="flex gap-8 items-start">
          {/* Sidebar (desktop) */}
          <div className="hidden md:block w-52 shrink-0">
            <SidebarNav active={activeSection} onChange={setActiveSection} isDark={isDark} />
          </div>

          {/* Sections */}
          <div className="flex-1 min-w-0 space-y-6">
            {(activeSection === 'personal' || window.innerWidth < 768) && (
              <div id="section-personal">
                <PersonalInfoSection profile={profile} onSave={saveProfile} isDark={isDark} />
              </div>
            )}
            {(activeSection === 'contact' || window.innerWidth < 768) && (
              <div id="section-contact">
                <ContactSection profile={profile} onSave={saveProfile} isDark={isDark} />
              </div>
            )}
            {(activeSection === 'passengers' || window.innerWidth < 768) && (
              <div id="section-passengers">
                <PassengersSection
                  passengers={passengers}
                  onAdd={addPax}
                  onBulkAdd={bulkAddPax}
                  onEdit={editPax}
                  onDelete={removePax}
                  loading={passengerLoading}
                  userId={user?.user_id || user?.id || 'U103'}
                  isDark={isDark}
                />
              </div>
            )}
            {(activeSection === 'prefs' || window.innerWidth < 768) && (
              <div id="section-prefs">
                <PreferencesSection profile={profile} onSave={saveProfile} isDark={isDark} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
