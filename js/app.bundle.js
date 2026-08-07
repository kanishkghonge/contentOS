/**
 * Content OS for Doctors — Standalone Bundle
 * Allows index.html to be double-clicked directly in any browser (file://) or served via Python/HTTP.
 */

(function () {
  'use strict';

  // 1. FORMATS
  const scriptFormats = [
    {
      id: 'talking_head',
      name: 'Talking Head',
      category: 'education',
      duration: '45s',
      icon: '🗣️',
      description: 'Direct-to-camera clinical tip with authoritative clarity and empathetic delivery.',
      promptInstruction: 'Write a direct-to-camera hook, 3 concise points, and a single clear takeaway.'
    },
    {
      id: 'patient_story',
      name: 'Patient Story',
      category: 'story',
      duration: '60s',
      icon: '🩺',
      description: 'Anonymized narrative: symptom discovery to diagnosis, treatment, and recovery.',
      promptInstruction: 'Start with the emotional patient presentation, reveal the hidden cause, and end with the clinical lesson.'
    },
    {
      id: 'myth_vs_fact',
      name: 'Myth vs Fact',
      category: 'myth_busting',
      duration: '45s',
      icon: '⚖️',
      description: 'Busting a common, dangerous medical misconception with evidence-based facts.',
      promptInstruction: 'Rapid-fire debunking of 2-3 persistent myths followed by the exact science in simple language.'
    },
    {
      id: 'qa',
      name: 'Q&A Consultation',
      category: 'education',
      duration: '40s',
      icon: '❓',
      description: 'Answering a question every patient asks in clinic using plain, jargon-free language.',
      promptInstruction: 'State the exact patient question as the hook, explain why it happens, and give actionable guidance.'
    },
    {
      id: 'whiteboard',
      name: 'Whiteboard / Concept Breakdown',
      category: 'breakdown',
      duration: '60s',
      icon: '📋',
      description: 'Conceptual breakdown using a simple everyday analogy (plumbing, wiring, traffic).',
      promptInstruction: 'Use a vivid physical analogy to explain the underlying anatomy/physiology so anyone gets it immediately.'
    },
    {
      id: 'consultation_pov',
      name: 'Consultation POV',
      category: 'story',
      duration: '50s',
      icon: '👁️',
      description: 'Puts the viewer in the patient chair across the doctor desk, speaking to them directly.',
      promptInstruction: 'Speak directly to "you" as if sitting in the consult room discussing their latest test results or symptoms.'
    },
    {
      id: 'carousel',
      name: 'Step-by-Step Carousel',
      category: 'breakdown',
      duration: 'Slide-deck',
      icon: '📑',
      description: 'A 7-slide written guide with headline, concise body bullets, and final saveable summary.',
      promptInstruction: 'Format as Slide 1 (Hook), Slides 2-6 (Bite-sized points), Slide 7 (Summary + CTA).'
    },
    {
      id: 'podcast_clip',
      name: 'Podcast Conversation',
      category: 'conversational',
      duration: '50s',
      icon: '🎙️',
      description: 'Off-the-cuff, candid conversation about a controversial or overlooked clinical topic.',
      promptInstruction: 'Write as an unfiltered, thoughtful reflection on clinical practice that challenges conventional thinking.'
    },
    {
      id: 'interview',
      name: 'Doctor & Patient Interview',
      category: 'conversational',
      duration: '60s',
      icon: '👥',
      description: 'Dialogue format between an interviewer / patient and the doctor explaining the treatment.',
      promptInstruction: 'Host asks a probing question, doctor delivers the reassuring, evidence-based answer.'
    },
    {
      id: 'news_reaction',
      name: 'Medical News Reaction',
      category: 'myth_busting',
      duration: '45s',
      icon: '📰',
      description: 'Reacting to a trending health headline or viral social media fad with scientific reality.',
      promptInstruction: 'Cite the viral claim immediately, evaluate whether the science supports it, and give doctor advice.'
    }
  ];

  function getFormatById(id) {
    return scriptFormats.find((f) => f.id === id) || {
      id,
      name: id,
      category: 'education',
      duration: '45s',
      icon: '💡',
      description: 'Clinical health content.'
    };
  }

  // 2. UTILS
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatFullDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatDateForInput(dateOrString) {
    if (!dateOrString) return '';
    const d = new Date(dateOrString);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(dateOrString, days) {
    const d = new Date(dateOrString);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  function formatRelativeDate(isoDate) {
    if (!isoDate) return '';
    const now = new Date();
    const d = new Date(isoDate);
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 14) return formatDate(isoDate);
    if (diffDay >= 2) return `${diffDay} days ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffHour >= 1) return `${diffHour}h ago`;
    if (diffMin >= 1) return `${diffMin}m ago`;
    return 'Just now';
  }

  async function copyToClipboard(text) {
    if (!navigator.clipboard) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Copied to clipboard!', 'success');
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        showToast('Copy failed.', 'error');
        return false;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard! Ready to paste into ChatGPT/Claude', 'success');
      return true;
    } catch (err) {
      showToast('Failed to copy.', 'error');
      return false;
    }
  }

  function showToast(message, type = 'success', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = type === 'success' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : type === 'error'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    if (navigator.vibrate) navigator.vibrate(20);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
    }, duration);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // 3. DATABASE (IndexedDB)
  const DB_NAME = 'DoctorContentOS_DB';
  const DB_VERSION = 1;
  let dbInstance = null;

  function openDatabase() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = (e) => reject(e.target.error);
      req.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile');
        if (!db.objectStoreNames.contains('notes')) {
          const s = db.createObjectStore('notes', { keyPath: 'id' });
          s.createIndex('by_created', 'created_at', { unique: false });
        }
        if (!db.objectStoreNames.contains('insights')) {
          const s = db.createObjectStore('insights', { keyPath: 'id' });
          s.createIndex('by_status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('scripts')) {
          const s = db.createObjectStore('scripts', { keyPath: 'id' });
          s.createIndex('by_insight', 'insight_id', { unique: false });
          s.createIndex('by_status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('scheduled_reels')) {
          const s = db.createObjectStore('scheduled_reels', { keyPath: 'id' });
          s.createIndex('by_insight', 'insight_id', { unique: false });
          s.createIndex('by_date', 'scheduled_date', { unique: false });
          s.createIndex('by_status', 'status', { unique: false });
        }
      };
    });
  }

  async function performTx(storeName, mode, callback) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let res = null;
      tx.oncomplete = () => resolve(res);
      tx.onerror = (e) => reject(e.target.error);
      try { res = callback(store); } catch (err) { reject(err); }
    });
  }

  const defaultDoctorProfile = {
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiologist & Preventative Health',
    audience: 'Patients',
    language: 'English',
    tone: 'Conversational & Empathetic',
    cta: 'both',
    reelLength: '45-60s',
    postingDays: ['Mon', 'Wed', 'Fri'],
    clinicName: 'Heart & Vascular Institute',
    website: 'drsarahchen.com',
    instagram: '@drsarahchen_md',
    onboarded: true
  };

  const db = {
    async getProfile() {
      return performTx('profile', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.get('doctor_profile');
          req.onsuccess = () => resolve(req.result || { ...defaultDoctorProfile, onboarded: false });
        });
      });
    },
    async saveProfile(profile) {
      return performTx('profile', 'readwrite', (store) => { store.put(profile, 'doctor_profile'); });
    },
    async getNotes() {
      return performTx('notes', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.getAll();
          req.onsuccess = () => {
            const notes = req.result || [];
            notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            resolve(notes);
          };
        });
      });
    },
    async addNote(note) { return performTx('notes', 'readwrite', (store) => { store.put(note); }); },
    async updateNote(note) { return performTx('notes', 'readwrite', (store) => { store.put(note); }); },
    async deleteNote(id) { return performTx('notes', 'readwrite', (store) => { store.delete(id); }); },

    async getInsights() {
      return performTx('insights', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.getAll();
          req.onsuccess = () => {
            const items = req.result || [];
            items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            resolve(items);
          };
        });
      });
    },
    async getInsight(id) {
      return performTx('insights', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result || null);
        });
      });
    },
    async saveInsight(insight) { return performTx('insights', 'readwrite', (store) => { store.put(insight); }); },
    async deleteInsight(id) {
      await performTx('insights', 'readwrite', (store) => { store.delete(id); });
      const scripts = await this.getScripts();
      const insScripts = scripts.filter((s) => s.insight_id === id);
      for (const s of insScripts) await this.deleteScript(s.id);
    },

    async getScripts() {
      return performTx('scripts', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
        });
      });
    },
    async getPendingReviewScripts() {
      return performTx('scripts', 'readonly', (store) => {
        return new Promise((resolve) => {
          const idx = store.index('by_status');
          const req = idx.getAll('pending_review');
          req.onsuccess = () => resolve(req.result || []);
        });
      });
    },
    async saveScript(script) { return performTx('scripts', 'readwrite', (store) => { store.put(script); }); },
    async saveScripts(arr) {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = database.transaction('scripts', 'readwrite');
        const store = tx.objectStore('scripts');
        arr.forEach((s) => store.put(s));
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    },
    async updateScript(script) { return performTx('scripts', 'readwrite', (store) => { store.put(script); }); },
    async deleteScript(id) { return performTx('scripts', 'readwrite', (store) => { store.delete(id); }); },

    async getScheduledReels() {
      return performTx('scheduled_reels', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.getAll();
          req.onsuccess = () => {
            const items = req.result || [];
            items.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
            resolve(items);
          };
        });
      });
    },
    async getScheduledReel(id) {
      return performTx('scheduled_reels', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result || null);
        });
      });
    },
    async saveScheduledReel(reel) { return performTx('scheduled_reels', 'readwrite', (store) => { store.put(reel); }); },
    async saveScheduledReels(arr) {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = database.transaction('scheduled_reels', 'readwrite');
        const store = tx.objectStore('scheduled_reels');
        arr.forEach((r) => store.put(r));
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    },
    async exportFullDatabase() {
      return {
        appName: 'Content OS for Doctors',
        exportedAt: new Date().toISOString(),
        version: 1,
        profile: await this.getProfile(),
        notes: await this.getNotes(),
        insights: await this.getInsights(),
        scripts: await this.getScripts(),
        scheduledReels: await this.getScheduledReels()
      };
    },
    async importFullDatabase(data) {
      if (!data || !data.version) throw new Error('Invalid backup file format');
      if (data.profile) await this.saveProfile(data.profile);
      if (Array.isArray(data.notes)) for (const n of data.notes) await this.addNote(n);
      if (Array.isArray(data.insights)) for (const i of data.insights) await this.saveInsight(i);
      if (Array.isArray(data.scripts)) await this.saveScripts(data.scripts);
      if (Array.isArray(data.scheduledReels)) await this.saveScheduledReels(data.scheduledReels);
      return true;
    },
    async resetAllData() {
      const database = await openDatabase();
      const stores = ['profile', 'notes', 'insights', 'scripts', 'scheduled_reels'];
      for (const s of stores) {
        await new Promise((resolve, reject) => {
          const tx = database.transaction(s, 'readwrite');
          tx.objectStore(s).clear();
          tx.oncomplete = () => resolve();
          tx.onerror = (e) => reject(e.target.error);
        });
      }
      localStorage.clear();

      // Save a clean blank doctor profile marked onboarded so sample data doesn't auto-restore
      await this.saveProfile({
        name: 'Doctor Workspace',
        specialty: 'Clinical Specialist',
        audience: 'Patients',
        language: 'English',
        tone: 'Conversational & Empathetic',
        cta: 'both',
        postingDays: ['Mon', 'Wed', 'Fri'],
        onboarded: true
      });
    },
    async clearAll() {
      return this.resetAllData();
    }
  };

  // 4. PROMPT GENERATOR
  function buildDoctorPrompt(profile, insight) {
    const doctorName = profile.name || 'Doctor';
    const specialty = profile.specialty || 'General Medicine & Preventative Care';
    const audience = profile.audience || 'Patients';
    const language = profile.language || 'English';
    const tone = profile.tone || 'Conversational & Empathetic';
    const cta = profile.cta === 'both' ? 'Generate BOTH versions (1. Read caption and 2. Comment keyword)' : profile.cta;
    const reelLength = profile.reelLength || '45-60s';

    const formatsList = scriptFormats.map((f, i) => `${i + 1}. **${f.name}** (${f.category}): ${f.promptInstruction}`).join('\n');

    return `You are a medical copywriter and clinical communication strategist.
Your task is to transform a doctor's clinical insight into a high-engagement social media content pack.

=======================================================
1. DOCTOR PROFILE & COMMUNICATION PREFERENCES
=======================================================
- Doctor: ${doctorName}
- Specialty: ${specialty}
- Target Audience: ${audience}
- Primary Language / Dialect: ${language}
- Preferred Tone: ${tone}
- Reel Duration Target: ${reelLength}
- Preferred CTA: ${cta}

=======================================================
2. CORE CLINICAL INSIGHT
=======================================================
- Title / Core Idea: ${insight.title}
- Clinical Details & Supporting Notes:
${insight.supporting_points || insight.description || 'Explain the underlying mechanism with clinical clarity.'}

=======================================================
3. REQUESTED SCRIPT FORMATS
=======================================================
${formatsList}

=======================================================
4. OUTPUT INSTRUCTIONS (CRITICAL: JSON ONLY)
=======================================================
Respond ONLY with a valid JSON object matching the schema below.
DO NOT include markdown outside the json.

{
  "version": 1,
  "insight_title": "${insight.title.replace(/"/g, '\\"')}",
  "doctor_specialty": "${specialty.replace(/"/g, '\\"')}",
  "scripts": [
    {
      "format": "Talking Head",
      "title": "Clear punchy title",
      "hook": "Scroll-stopping first sentence...",
      "script": "Complete spoken script with pacing notes...",
      "cta": "Read caption for full medical details.",
      "estimated_duration": "45s",
      "confidence": 9.5
    },
    {
      "format": "Patient Story",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "...",
      "estimated_duration": "60s",
      "confidence": 9.2
    },
    {
      "format": "Myth vs Fact",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "...",
      "estimated_duration": "40s",
      "confidence": 9.4
    }
  ]
}`;
  }

  // 5. AI IMPORTER
  function parseAndValidateAIResponse(rawText, insightId) {
    if (!rawText || typeof rawText !== 'string') throw new Error('Pasted content is empty.');
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
    cleaned = cleaned.trim();

    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) throw new Error('Could not find a valid JSON object.');

    const data = JSON.parse(cleaned.substring(startIdx, endIdx + 1));
    if (!Array.isArray(data.scripts) || data.scripts.length === 0) throw new Error('No "scripts" array found.');

    const normalized = data.scripts.map((item, idx) => ({
      id: uuidv4(),
      insight_id: insightId,
      format: (item.format || 'Talking Head').trim(),
      title: (item.title || `Clinical Script #${idx + 1}`).trim(),
      hook: (item.hook || 'Attention hook...').trim(),
      script: (item.script || 'Clinical explanation...').trim(),
      cta: (item.cta || 'Read caption for more information.').trim(),
      estimated_duration: item.estimated_duration || '45s',
      confidence: typeof item.confidence === 'number' ? item.confidence : 9.0,
      status: 'pending_review',
      review_order: idx,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    return { version: data.version || 1, scripts: normalized };
  }

  // 6. SCHEDULER
  function getNextPostingDates(startDate, count, postingDays = ['Mon', 'Wed', 'Fri']) {
    const dates = [];
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const allowAll = !postingDays || postingDays.length === 0 || postingDays.includes('Daily');

    let safety = 0;
    while (dates.length < count && safety < 365) {
      safety++;
      current.setDate(current.getDate() + 1);
      const name = dayNames[current.getDay()];
      if (allowAll || postingDays.includes(name)) {
        dates.push(formatDateForInput(current));
      }
    }
    return dates;
  }

  function balanceContentQueue(items) {
    if (!items || items.length <= 1) return items;
    const remaining = [...items];
    const balanced = [remaining.shift()];

    while (remaining.length > 0) {
      const lastItem = balanced[balanced.length - 1];
      const lastFormat = lastItem.format;
      const lastInsight = lastItem.insight_id;

      let bestIdx = remaining.findIndex((i) => i.insight_id !== lastInsight && i.format !== lastFormat);
      if (bestIdx === -1) bestIdx = remaining.findIndex((i) => i.format !== lastFormat);
      if (bestIdx === -1) bestIdx = 0;

      balanced.push(remaining.splice(bestIdx, 1)[0]);
    }
    return balanced;
  }

  async function recalculateFutureSchedule() {
    const profile = await db.getProfile();
    const allReels = await db.getScheduledReels();
    const todayStr = formatDateForInput(new Date());

    const frozen = allReels.filter((r) => r.scheduled_date <= todayStr || r.status === 'filmed' || r.status === 'posted' || r.is_locked || r.is_main_reel);
    const mutable = allReels.filter((r) => !frozen.some((f) => f.id === r.id));

    if (mutable.length === 0) return { updatedCount: 0 };

    const reservedDates = new Set(frozen.map((r) => r.scheduled_date));
    const balanced = balanceContentQueue(mutable);

    const postingDays = profile.postingDays || ['Mon', 'Wed', 'Fri'];
    const futureDates = [];
    let runner = new Date();

    while (futureDates.length < balanced.length) {
      const candidates = getNextPostingDates(runner, 5, postingDays);
      for (const cand of candidates) {
        if (!reservedDates.has(cand) && !futureDates.includes(cand)) {
          futureDates.push(cand);
          if (futureDates.length === balanced.length) break;
        }
      }
      runner = new Date(candidates[candidates.length - 1]);
    }

    const updated = balanced.map((reel, idx) => ({
      ...reel,
      scheduled_date: futureDates[idx] || reel.scheduled_date,
      updated_at: new Date().toISOString()
    }));

    await db.saveScheduledReels([...frozen, ...updated]);
    return { updatedCount: updated.length };
  }

  async function scheduleAcceptedScript(script) {
    const existing = await db.getScheduledReels();
    const dup = existing.find((r) => r.script_id === script.id);
    if (dup) return dup;

    const newReel = {
      id: uuidv4(),
      script_id: script.id,
      insight_id: script.insight_id,
      title: script.title,
      format: script.format,
      hook: script.hook,
      script: script.script,
      cta: script.cta,
      estimated_duration: script.estimated_duration || '45s',
      scheduled_date: formatDateForInput(new Date()),
      status: 'scheduled',
      is_locked: false,
      is_main_reel: false,
      created_at: new Date().toISOString()
    };

    await db.saveScheduledReel(newReel);
    await recalculateFutureSchedule();
    return newReel;
  }

  async function promoteToMainReel(trialReelId) {
    const reel = await db.getScheduledReel(trialReelId);
    if (!reel) throw new Error('Reel not found');
    const profile = await db.getProfile();
    const nextDates = getNextPostingDates(new Date(), 8, profile.postingDays || ['Mon', 'Wed', 'Fri']);

    const mainReel = {
      id: uuidv4(),
      parent_trial_reel_id: reel.id,
      script_id: reel.script_id,
      insight_id: reel.insight_id,
      title: `⭐ [Main Reel] ${reel.title}`,
      format: reel.format,
      hook: reel.hook,
      script: reel.script,
      cta: reel.cta,
      estimated_duration: reel.estimated_duration,
      scheduled_date: nextDates[2] || nextDates[0],
      status: 'scheduled',
      is_locked: true,
      is_main_reel: true,
      created_at: new Date().toISOString()
    };

    reel.status = 'winner';
    reel.is_main_reel_winner = true;
    await db.saveScheduledReel(reel);
    await db.saveScheduledReel(mainReel);
    await recalculateFutureSchedule();
    return mainReel;
  }

  // 7. SAMPLE DATA DEMO
  async function populateSampleDoctorWorkspace() {
    await db.resetAllData();
    const todayStr = formatDateForInput(new Date());
    const threeDaysAgoStr = formatDateForInput(addDays(new Date(), -3));

    await db.saveProfile({
      ...defaultDoctorProfile,
      name: 'Dr. Sarah Chen',
      specialty: 'Cardiologist & Preventative Health',
      audience: 'Patients',
      language: 'English',
      tone: 'Conversational & Empathetic',
      onboarded: true
    });

    await db.addNote({ id: 'note-1', text: 'I should explain why high calcium score in younger patients is an opportunity, not a life sentence.', created_at: new Date().toISOString(), is_archived: false });
    await db.addNote({ id: 'note-2', text: 'Had a 42-year-old marathon runner with hidden coronary plaque today.', created_at: new Date().toISOString(), is_archived: false });

    const insight1 = {
      id: 'insight-101',
      title: 'Why Normal Blood Pressure at 25 Does Not Guarantee Clean Arteries at 45',
      description: 'Vascular stiffness and ApoB cholesterol accumulation start decades before blood pressure monitors turn red.',
      supporting_points: '1. Standard cuff BP only measures macro vessel resistance.\n2. Endothelial micro-inflammation happens silently.\n3. Early ApoB testing matters.',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      status: 'active'
    };

    const insight2 = {
      id: 'insight-102',
      title: 'Magnesium Taurate vs Glycinate for Heart Palpitations',
      description: 'Patients are constantly confused by different magnesium chelates for cardiac rhythm stability.',
      supporting_points: '1. Taurine acts on calcium channels in myocardial cells.\n2. Glycinate is superior for sleep and anxiety.',
      created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
      status: 'active'
    };

    await db.saveInsight(insight1);
    await db.saveInsight(insight2);

    const reviewScripts = [
      {
        id: 'script-201',
        insight_id: 'insight-102',
        format: 'Talking Head',
        title: 'If Your Heart Skips a Beat at Night, Watch This',
        hook: 'If your heart ever does that weird flutter or flip-flop the second your head hits the pillow, stop scrolling.',
        script: 'In my cardiology clinic, 8 out of 10 patients with night palpitations are taking the wrong form of magnesium. Magnesium Taurate specifically calms myocardial excitability...',
        cta: 'Read caption for my clinical breakdown and safe dosage guide.',
        estimated_duration: '45s',
        confidence: 9.6,
        status: 'pending_review',
        review_order: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'script-202',
        insight_id: 'insight-102',
        format: 'Patient Story',
        title: 'The 34-Year-Old Designer with 4,000 Extra Heartbeats a Day',
        hook: 'A 34-year-old came to my office convinced they were having daily heart attacks.',
        script: 'Their Holter monitor showed 4,000 PVCs. 4 weeks after switching to targeted cardiac electrolytes, their PVCs dropped by 85%.',
        cta: 'Comment "HEART" and I\'ll DM you the checklist.',
        estimated_duration: '60s',
        confidence: 9.3,
        status: 'pending_review',
        review_order: 1,
        created_at: new Date().toISOString()
      }
    ];

    await db.saveScripts(reviewScripts);

    const scheduledReels = [
      {
        id: 'reel-301',
        script_id: 'script-101-a',
        insight_id: 'insight-101',
        title: 'Why Normal Blood Pressure at 25 is Deceptive',
        format: 'Talking Head',
        hook: 'Your blood pressure cuff can read 120/80 while your coronary arteries are quietly filling with plaque.',
        script: 'Blood pressure is a measure of vessel resistance today, not plaque accumulation over 20 years.',
        cta: 'Read caption for the 3 tests that catch heart disease 10 years earlier.',
        estimated_duration: '45s',
        scheduled_date: todayStr,
        status: 'scheduled',
        is_locked: false,
        is_main_reel: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'reel-302',
        script_id: 'script-103-a',
        insight_id: 'insight-101',
        title: 'The "Fit but Clogged" Myth: Marathon Runners & Heart Plaque',
        format: 'Patient Story',
        hook: 'I just reviewed a CT scan of a 45-year-old marathon runner whose arteries looked like a 70-year-old smoker.',
        script: 'Running 20 miles a week gives you incredible lung capacity, but cannot dissolve genetic cholesterol.',
        cta: 'Comment "CHECK" for my guide.',
        estimated_duration: '60s',
        scheduled_date: threeDaysAgoStr,
        status: 'posted',
        posted_date: threeDaysAgoStr,
        is_locked: true,
        is_main_reel: false,
        created_at: new Date().toISOString()
      }
    ];

    await db.saveScheduledReels(scheduledReels);
    await recalculateFutureSchedule();
  }

  // 8. VIEWS (Dashboard, Notes, ScriptReview, Schedule, Feedback, Library, Settings)
  const DashboardView = {
    async render(container, navigateTo, openModal) {
      const profile = await db.getProfile();
      const todayStr = formatDateForInput(new Date());
      const allReels = await db.getScheduledReels();
      const pendingScripts = await db.getPendingReviewScripts();
      const allNotes = await db.getNotes();

      const todayPosts = allReels.filter((r) => r.scheduled_date === todayStr && r.status !== 'posted' && r.status !== 'archived');
      const filmingQueue = allReels.filter((r) => r.status === 'scheduled' && !r.is_filmed).slice(0, 3);
      const missedPosts = allReels.filter((r) => r.scheduled_date < todayStr && r.status === 'scheduled');
      
      const feedbackDuePosts = allReels.filter((r) => {
        if (r.status !== 'posted' || r.is_main_reel_winner || r.feedback_logged) return false;
        const diff = Math.floor((new Date() - new Date(r.posted_date || r.scheduled_date)) / (1000 * 60 * 60 * 24));
        return diff >= 3;
      });
      const activeNotes = allNotes.filter((n) => !n.is_archived).slice(0, 2);

      let html = `
        <div class="action-deck">
          <div class="card card-hero">
            <h2>Good day, ${profile.name || 'Doctor'}</h2>
            <p>You have <strong>${todayPosts.length}</strong> post scheduled today, <strong>${pendingScripts.length}</strong> scripts waiting for review, and <strong>${feedbackDuePosts.length}</strong> 3-day performance checks due.</p>
            <div class="flex gap-3" style="flex-wrap: wrap;">
              <button class="btn btn-accent btn-lg" id="dash-hero-record-insight">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Record a New Insight</span>
              </button>
              <button class="btn btn-secondary btn-lg" id="dash-hero-quick-note" style="background: rgba(255,255,255,0.15); color: #FFF; border-color: rgba(255,255,255,0.2);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>Quick Thought / Note</span>
              </button>
            </div>
          </div>
      `;

      if (todayPosts.length > 0) {
        html += `
          <div class="action-card" style="border-left: 4px solid var(--accent-blue);">
            <div class="action-card-header">
              <span class="action-card-badge badge-blue">⚡ Scheduled For Today</span>
              <span style="font-size: 12px; color: var(--text-tertiary);">${formatDate(todayStr)}</span>
            </div>
            <h3 class="action-card-title">${todayPosts.length === 1 ? '1 Post to Publish Today' : `${todayPosts.length} Posts to Publish Today`}</h3>
            <p class="action-card-desc">Review your hook and mark as posted once published to social media.</p>
            <div class="today-item-list">
              ${todayPosts.map((post) => `
                <div class="today-item">
                  <div class="today-item-info">
                    <div class="today-item-title">${post.is_main_reel ? '⭐ ' : ''}${escapeHtml(post.title)}</div>
                    <div class="today-item-meta"><span>${escapeHtml(post.format)}</span> • <span>${post.estimated_duration}</span></div>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-secondary btn-mark-filmed" data-id="${post.id}">${post.status === 'filmed' ? '✓ Filmed' : 'Mark Filmed'}</button>
                    <button class="btn btn-sm btn-primary btn-mark-posted" data-id="${post.id}">Mark as Posted</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (pendingScripts.length > 0) {
        html += `
          <div class="action-card" style="border-left: 4px solid var(--accent-amber);">
            <div class="action-card-header">
              <span class="action-card-badge badge-amber">🃏 Review Queue</span>
              <span style="font-size: 12px; font-weight: 600; color: var(--accent-amber);">${pendingScripts.length} Pending</span>
            </div>
            <h3 class="action-card-title">Scripts Waiting for Review</h3>
            <p class="action-card-desc">Swipe through scripts one card at a time. Accept, edit inline, or reject in under 30 seconds.</p>
            <div class="action-card-footer">
              <span style="font-size: 12.5px; color: var(--text-secondary);">Cards ready from recent AI imports</span>
              <button class="btn btn-primary btn-sm" id="dash-btn-start-review">Start Review (${pendingScripts.length} left) →</button>
            </div>
          </div>
        `;
      }

      if (feedbackDuePosts.length > 0) {
        html += `
          <div class="action-card" style="border-left: 4px solid var(--accent-purple);">
            <div class="action-card-header">
              <span class="action-card-badge badge-purple">📊 3-Day Performance Check</span>
              <span style="font-size: 12px; color: var(--accent-purple); font-weight: 600;">${feedbackDuePosts.length} Due</span>
            </div>
            <h3 class="action-card-title">Trial Reel Feedback Due</h3>
            <p class="action-card-desc">Posted 3 days ago. Enter engagement metrics to select the best format and auto-schedule your Main Reel.</p>
            <div class="today-item-list">
              ${feedbackDuePosts.map((post) => `
                <div class="today-item">
                  <div class="today-item-info">
                    <div class="today-item-title">${escapeHtml(post.title)}</div>
                    <div class="today-item-meta"><span>Posted ${formatRelativeDate(post.posted_date || post.scheduled_date)}</span> • <span>${post.format}</span></div>
                  </div>
                  <button class="btn btn-sm btn-primary btn-log-feedback" data-id="${post.id}">Log Feedback & Decide</button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (missedPosts.length > 0) {
        html += `
          <div class="action-card" style="border-left: 4px solid var(--accent-red);">
            <div class="action-card-header">
              <span class="action-card-badge badge-red">⚠️ Past Due</span>
              <span style="font-size: 12px; color: var(--accent-red); font-weight: 600;">${missedPosts.length} Missed</span>
            </div>
            <h3 class="action-card-title">Posts That Were Missed</h3>
            <p class="action-card-desc">Life in clinic gets busy. 1-tap auto-reshuffle will redistribute these into your upcoming open slots.</p>
            <div class="action-card-footer">
              <span style="font-size: 12.5px; color: var(--text-secondary);">${missedPosts.length} posts can be rescheduled</span>
              <button class="btn btn-danger btn-sm" id="dash-btn-auto-reshuffle">Auto Reshuffle Schedule</button>
            </div>
          </div>
        `;
      }

      if (filmingQueue.length > 0) {
        html += `
          <div class="action-card">
            <div class="action-card-header">
              <span class="action-card-badge badge-gray">🎥 Filming Queue</span>
              <span style="font-size: 12px; color: var(--text-tertiary);">Next Up</span>
            </div>
            <h3 class="action-card-title">Trial Reels Not Yet Shot</h3>
            <p class="action-card-desc">Ready to record between patient consultations? Keep these 45-second scripts handy.</p>
            <div class="today-item-list">
              ${filmingQueue.map((post) => `
                <div class="today-item">
                  <div class="today-item-info">
                    <div class="today-item-title">${escapeHtml(post.title)}</div>
                    <div class="today-item-meta"><span>${post.format}</span> • <span>Due ${formatDate(post.scheduled_date)}</span></div>
                  </div>
                  <button class="btn btn-sm btn-secondary btn-mark-filmed" data-id="${post.id}">Mark Shot</button>
                </div>
              `).join('')}
            </div>
            <div class="action-card-footer">
              <span style="font-size: 12.5px; color: var(--text-secondary);">Auto-balanced across formats</span>
              <button class="btn btn-ghost btn-sm" id="dash-btn-view-schedule">View Full Calendar →</button>
            </div>
          </div>
        `;
      }

      if (activeNotes.length > 0) {
        html += `
          <div class="action-card">
            <div class="action-card-header">
              <span class="action-card-badge badge-gray">💡 Recent Thoughts</span>
              <button class="btn btn-ghost btn-sm" id="dash-btn-view-notes">All Notes →</button>
            </div>
            <div class="today-item-list" style="margin-bottom: 0;">
              ${activeNotes.map((note) => `
                <div class="today-item">
                  <div class="today-item-info">
                    <div class="today-item-title" style="font-weight: 500;">"${escapeHtml(note.text)}"</div>
                    <div class="today-item-meta">${formatRelativeDate(note.created_at)}</div>
                  </div>
                  <button class="btn btn-sm btn-secondary btn-convert-note" data-id="${note.id}">Convert to Insight</button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (todayPosts.length === 0 && pendingScripts.length === 0 && feedbackDuePosts.length === 0 && missedPosts.length === 0) {
        html += `
          <div class="action-card text-center" style="padding: 32px 20px; align-items: center;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent-green-subtle); color: var(--accent-green); display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary);">All Caught Up for Today!</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 380px; margin-top: 4px;">
              Your calendar is naturally balanced. Have a new clinical thought from your clinic rounds? Tap below.
            </p>
            <button class="btn btn-primary btn-sm" id="dash-zen-record-insight" style="margin-top: 16px;">Record a New Insight</button>
          </div>
        `;
      }

      html += `</div>`;
      container.innerHTML = html;

      document.getElementById('dash-hero-record-insight')?.addEventListener('click', () => openModal('insightCreate'));
      document.getElementById('dash-zen-record-insight')?.addEventListener('click', () => openModal('insightCreate'));
      document.getElementById('dash-hero-quick-note')?.addEventListener('click', () => openModal('quickNote'));
      document.getElementById('dash-btn-start-review')?.addEventListener('click', () => navigateTo('review'));
      document.getElementById('dash-btn-view-schedule')?.addEventListener('click', () => navigateTo('schedule'));
      document.getElementById('dash-btn-view-notes')?.addEventListener('click', () => navigateTo('notes'));

      document.getElementById('dash-btn-auto-reshuffle')?.addEventListener('click', async () => {
        await recalculateFutureSchedule();
        showToast('Calendar auto-reshuffled and balanced!', 'success');
        DashboardView.render(container, navigateTo, openModal);
      });

      container.querySelectorAll('.btn-mark-filmed').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          const reel = await db.getScheduledReel(id);
          if (reel) {
            reel.status = 'filmed';
            reel.is_filmed = true;
            await db.saveScheduledReel(reel);
            showToast('Marked as Filmed!', 'success');
            DashboardView.render(container, navigateTo, openModal);
          }
        });
      });

      container.querySelectorAll('.btn-mark-posted').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          const reel = await db.getScheduledReel(id);
          if (reel) {
            reel.status = 'posted';
            reel.posted_date = formatDateForInput(new Date());
            await db.saveScheduledReel(reel);
            showToast('Marked as Posted! 3-day feedback timer started.', 'success');
            DashboardView.render(container, navigateTo, openModal);
          }
        });
      });

      container.querySelectorAll('.btn-log-feedback').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          openModal('trialFeedback', { reelId: e.currentTarget.dataset.id });
        });
      });

      container.querySelectorAll('.btn-convert-note').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          const notes = await db.getNotes();
          const note = notes.find((n) => n.id === id);
          if (note) openModal('insightCreate', { prefillTitle: note.text, noteId: note.id });
        });
      });
    }
  };

  const NotesView = {
    async render(container, navigateTo, openModal) {
      const notes = await db.getNotes();
      const activeNotes = notes.filter((n) => !n.is_archived);

      let html = `
        <div class="action-deck">
          <div class="card">
            <h2 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin-bottom: 6px;">Clinical Thoughts & Scratchpad</h2>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">Got an idea during patient rounds? Capture it in 5 seconds. Tap <strong>Convert to Insight</strong> whenever ready.</p>
            <form id="form-quick-note" class="flex flex-col gap-2">
              <textarea id="input-note-text" class="form-textarea" placeholder="e.g. I should explain Vitamin D deficiency..." rows="3" required></textarea>
              <div class="flex justify-between items-center" style="margin-top: 4px;">
                <span style="font-size: 12px; color: var(--text-tertiary);">Saves locally</span>
                <button type="submit" class="btn btn-primary btn-sm">Save Quick Thought</button>
              </div>
            </form>
          </div>
          <div style="margin-top: 10px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary);">Saved Thoughts (${activeNotes.length})</div>
      `;

      if (activeNotes.length === 0) {
        html += `<div class="card text-center" style="padding: 36px 20px;"><p style="font-size: 14px; color: var(--text-tertiary);">No pending thoughts.</p></div>`;
      } else {
        html += `
          <div class="flex flex-col gap-3">
            ${activeNotes.map((n) => `
              <div class="action-card" style="padding: 16px;">
                <div style="font-size: 15px; color: var(--text-primary); line-height: 1.45; margin-bottom: 12px; font-weight: 500;">"${escapeHtml(n.text)}"</div>
                <div class="action-card-footer" style="padding-top: 10px; margin-top: 0;">
                  <span style="font-size: 12px; color: var(--text-tertiary);">${formatRelativeDate(n.created_at)}</span>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm btn-delete-note" data-id="${n.id}" style="color: var(--text-tertiary);">Delete</button>
                    <button class="btn btn-accent btn-sm btn-convert-note-view" data-id="${n.id}">Convert to Insight</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      html += `</div>`;
      container.innerHTML = html;

      document.getElementById('form-quick-note')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('input-note-text');
        const val = input.value.trim();
        if (!val) return;
        await db.addNote({ id: uuidv4(), text: val, created_at: new Date().toISOString(), is_archived: false });
        showToast('Quick thought saved!', 'success');
        NotesView.render(container, navigateTo, openModal);
      });

      container.querySelectorAll('.btn-delete-note').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          await db.deleteNote(e.currentTarget.dataset.id);
          showToast('Note deleted', 'success');
          NotesView.render(container, navigateTo, openModal);
        });
      });

      container.querySelectorAll('.btn-convert-note-view').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const note = activeNotes.find((n) => n.id === e.currentTarget.dataset.id);
          if (note) openModal('insightCreate', { prefillTitle: note.text, noteId: note.id });
        });
      });
    }
  };

  const InsightCreateModal = {
    render(container, options = {}, onDone, openModal) {
      const prefillTitle = options.prefillTitle || '';
      const noteId = options.noteId || null;

      container.innerHTML = `
        <div class="modal-view-step" id="step-insight-form">
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">Turn a clinical experience into a tailored AI prompt pack.</p>
          <form id="form-create-insight">
            <div class="form-group">
              <label class="form-label" for="insight-title">Topic / Core Idea *</label>
              <input type="text" id="insight-title" class="form-input" value="${escapeHtml(prefillTitle)}" placeholder="e.g. Why normal blood pressure doesn't guarantee clean arteries..." required />
            </div>
            <div class="form-group">
              <label class="form-label" for="insight-details">Clinical Explanation & Key Points *</label>
              <textarea id="insight-details" class="form-textarea" rows="4" placeholder="1. Endothelial damage happens early...&#10;2. High ApoB drives plaque..." required></textarea>
            </div>
            <div class="flex justify-between items-center" style="margin-top: 20px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
              <button type="button" class="btn btn-ghost" id="btn-cancel-insight">Cancel</button>
              <button type="submit" class="btn btn-primary btn-lg">Save & Generate Prompt →</button>
            </div>
          </form>
        </div>

        <div class="modal-view-step hidden" id="step-prompt-ready">
          <div style="text-align: center; margin-bottom: 18px;">
            <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700;">Bespoke Doctor Prompt Ready</h3>
            <p style="font-size: 13px; color: var(--text-secondary);">Copy prompt, paste into ChatGPT/Claude, then bring JSON response back.</p>
          </div>
          <div class="form-group">
            <textarea id="generated-prompt-box" class="form-textarea" rows="7" readonly style="font-family: var(--font-mono); font-size: 12px; background: var(--bg-subtle);"></textarea>
          </div>
          <button class="btn btn-accent btn-lg w-full" id="btn-copy-prompt-hero" style="margin-bottom: 12px;">Copy Prompt (1-Tap)</button>
          <div class="flex gap-2" style="margin-bottom: 14px;">
            <a href="https://chatgpt.com" target="_blank" rel="noopener" class="btn btn-secondary btn-sm flex-1" style="text-decoration: none;">Open ChatGPT ↗</a>
            <a href="https://claude.ai" target="_blank" rel="noopener" class="btn btn-secondary btn-sm flex-1" style="text-decoration: none;">Open Claude ↗</a>
          </div>
          <button class="btn btn-primary btn-lg w-full" id="btn-proceed-to-import">I Have the AI Response → Paste JSON</button>
        </div>
      `;

      let activeInsightId = null;
      document.getElementById('form-create-insight')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('insight-title').value.trim();
        const details = document.getElementById('insight-details').value.trim();
        if (!title || !details) return;

        activeInsightId = uuidv4();
        const newInsight = { id: activeInsightId, title, description: details.substring(0, 140) + '...', supporting_points: details, status: 'active', created_at: new Date().toISOString() };
        await db.saveInsight(newInsight);

        if (noteId) {
          const notes = await db.getNotes();
          const n = notes.find((item) => item.id === noteId);
          if (n) { n.is_archived = true; await db.updateNote(n); }
        }

        const profile = await db.getProfile();
        const promptText = buildDoctorPrompt(profile, newInsight);
        document.getElementById('generated-prompt-box').value = promptText;
        document.getElementById('step-insight-form').classList.add('hidden');
        document.getElementById('step-prompt-ready').classList.remove('hidden');
        await copyToClipboard(promptText);
      });

      document.getElementById('btn-cancel-insight')?.addEventListener('click', onDone);
      document.getElementById('btn-copy-prompt-hero')?.addEventListener('click', () => copyToClipboard(document.getElementById('generated-prompt-box').value));
      document.getElementById('btn-proceed-to-import')?.addEventListener('click', () => openModal('aiImport', { insightId: activeInsightId }));
    }
  };

  const AIImportModal = {
    render(container, options = {}, onDone, openModal, navigateTo) {
      const insightId = options.insightId || null;
      container.innerHTML = `
        <div class="ai-importer-flow">
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 14px;">Paste the JSON response from ChatGPT / Claude below:</p>
          <form id="form-ai-import">
            <div class="form-group">
              <textarea id="ai-pasted-text" class="form-textarea" rows="8" placeholder="Paste raw JSON object here..." required style="font-family: var(--font-mono); font-size: 12.5px;"></textarea>
            </div>
            <div id="ai-import-error" class="hidden" style="background: var(--accent-red-subtle); color: var(--accent-red); padding: 10px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 14px;"></div>
            <div class="flex justify-between items-center">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-paste-sample-json">Paste Sample JSON</button>
              <button type="submit" class="btn btn-primary btn-lg">Save & Start Flashcard Review →</button>
            </div>
          </form>
        </div>
      `;

      const textarea = document.getElementById('ai-pasted-text');
      document.getElementById('btn-paste-sample-json')?.addEventListener('click', () => {
        textarea.value = JSON.stringify({
          version: 1,
          insight_title: 'Magnesium Chelates for Palpitations',
          scripts: [
            { format: 'Talking Head', title: 'The #1 Supplement Mistake with Night Palpitations', hook: 'If your heart flutters in bed, listen closely.', script: 'Magnesium Taurate crosses cardiac membranes...', cta: 'Read caption for protocol.', estimated_duration: '45s', confidence: 9.6 },
            { format: 'Patient Story', title: 'From 5,000 PVCs to Normal Rhythm', hook: 'A 29-year-old came in with daily palpitations.', script: 'Targeted cardiac electrolytes dropped PVCs by 90%.', cta: 'Comment "CALM" for guide.', estimated_duration: '60s', confidence: 9.4 }
          ]
        }, null, 2);
      });

      document.getElementById('form-ai-import')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById('ai-import-error');
        errorBox.classList.add('hidden');
        try {
          const parsed = parseAndValidateAIResponse(textarea.value.trim(), insightId);
          await db.saveScripts(parsed.scripts);
          showToast(`Imported ${parsed.scripts.length} scripts!`, 'success');
          onDone();
          navigateTo('review');
        } catch (err) {
          errorBox.textContent = `⚠️ ${err.message}`;
          errorBox.classList.remove('hidden');
        }
      });
    }
  };

  const ScriptReviewView = {
    queue: [],
    currentIndex: 0,
    isEditing: false,

    async render(container, navigateTo, openModal) {
      this.queue = await db.getPendingReviewScripts();
      this.currentIndex = 0;
      this.isEditing = false;
      this.renderCurrentCard(container, navigateTo, openModal);
    },

    renderCurrentCard(container, navigateTo, openModal) {
      if (this.queue.length === 0 || this.currentIndex >= this.queue.length) {
        this.renderCompletionScreen(container, navigateTo);
        return;
      }

      const script = this.queue[this.currentIndex];
      const formatMeta = getFormatById(script.format);
      const progressPercent = Math.round(((this.currentIndex) / this.queue.length) * 100);

      container.innerHTML = `
        <div class="flashcard-wrapper">
          <div class="flashcard-progress-bar">
            <span>Script Review Deck</span>
            <span>Card ${this.currentIndex + 1} of ${this.queue.length}</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width: ${progressPercent}%;"></div></div>

          <div class="flashcard">
            <div class="flashcard-header">
              <div class="flex items-center gap-2">
                <span>${formatMeta.icon || '💡'}</span>
                <span style="font-family: var(--font-heading); font-size: 14px; font-weight: 700;">${escapeHtml(script.format)}</span>
              </div>
              <span class="action-card-badge badge-blue">AI Score ${script.confidence || 9.0}</span>
            </div>

            <div class="flashcard-body ${this.isEditing ? 'flashcard-editable' : ''}">
              <div class="flashcard-section">
                <span class="section-label">Script Title</span>
                ${this.isEditing ? `<input type="text" id="edit-title" value="${escapeHtml(script.title)}" />` : `<h2 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">${escapeHtml(script.title)}</h2>`}
              </div>
              <div class="flashcard-section">
                <span class="section-label">Hook</span>
                ${this.isEditing ? `<textarea id="edit-hook" rows="2">${escapeHtml(script.hook)}</textarea>` : `<div class="flashcard-hook">"${escapeHtml(script.hook)}"</div>`}
              </div>
              <div class="flashcard-section">
                <span class="section-label">Spoken Script</span>
                ${this.isEditing ? `<textarea id="edit-script" rows="6">${escapeHtml(script.script)}</textarea>` : `<div class="flashcard-script-text">${escapeHtml(script.script)}</div>`}
              </div>
              <div class="flashcard-section">
                <span class="section-label">CTA</span>
                ${this.isEditing ? `<input type="text" id="edit-cta" value="${escapeHtml(script.cta)}" />` : `<div class="flashcard-cta"><span>${escapeHtml(script.cta)}</span></div>`}
              </div>
            </div>

            <div class="flashcard-actions">
              <button class="btn btn-reject btn-lg" id="btn-card-reject">✕ Reject</button>
              <button class="btn btn-later btn-lg" id="btn-card-later">⏱ Later</button>
              <button class="btn btn-edit btn-lg" id="btn-card-edit">${this.isEditing ? '✓ Done' : '✎ Edit'}</button>
              <button class="btn btn-accept btn-lg" id="btn-card-accept">Accept (Trial Reel) →</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-card-accept')?.addEventListener('click', async () => {
        if (this.isEditing) this.saveEdits(script);
        script.status = 'accepted';
        await db.updateScript(script);
        await scheduleAcceptedScript(script);
        showToast('Accepted! Added to schedule.', 'success');
        this.isEditing = false;
        this.currentIndex++;
        this.renderCurrentCard(container, navigateTo, openModal);
      });

      document.getElementById('btn-card-edit')?.addEventListener('click', async () => {
        if (this.isEditing) {
          this.saveEdits(script);
          await db.updateScript(script);
          this.isEditing = false;
          showToast('Changes saved!', 'success');
        } else {
          this.isEditing = true;
        }
        this.renderCurrentCard(container, navigateTo, openModal);
      });

      document.getElementById('btn-card-reject')?.addEventListener('click', async () => {
        script.status = 'rejected';
        await db.updateScript(script);
        showToast('Script rejected.', 'error');
        this.isEditing = false;
        this.currentIndex++;
        this.renderCurrentCard(container, navigateTo, openModal);
      });

      document.getElementById('btn-card-later')?.addEventListener('click', () => {
        const [skipped] = this.queue.splice(this.currentIndex, 1);
        this.queue.push(skipped);
        showToast('Moved to end of queue.', 'info');
        this.isEditing = false;
        this.renderCurrentCard(container, navigateTo, openModal);
      });
    },

    saveEdits(script) {
      const t = document.getElementById('edit-title');
      const h = document.getElementById('edit-hook');
      const s = document.getElementById('edit-script');
      const c = document.getElementById('edit-cta');
      if (t) script.title = t.value.trim();
      if (h) script.hook = h.value.trim();
      if (s) script.script = s.value.trim();
      if (c) script.cta = c.value.trim();
    },

    renderCompletionScreen(container, navigateTo) {
      container.innerHTML = `
        <div class="action-deck">
          <div class="card text-center" style="padding: 40px 24px; max-width: 560px; margin: 20px auto;">
            <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 700; margin-bottom: 8px;">All Scripts Reviewed! 🎉</h2>
            <p style="font-size: 14.5px; color: var(--text-secondary); margin-bottom: 24px;">Accepted scripts have been balanced across your content calendar.</p>
            <div class="flex gap-3 justify-center">
              <button class="btn btn-primary btn-lg" id="btn-review-done-sched">View Schedule →</button>
              <button class="btn btn-secondary btn-lg" id="btn-review-done-today">Back to Today</button>
            </div>
          </div>
        </div>
      `;
      document.getElementById('btn-review-done-sched')?.addEventListener('click', () => navigateTo('schedule'));
      document.getElementById('btn-review-done-today')?.addEventListener('click', () => navigateTo('dashboard'));
    }
  };

  const ScheduleView = {
    currentMonthDate: new Date(),

    async render(container, navigateTo, openModal) {
      const allReels = await db.getScheduledReels();
      const todayStr = formatDateForInput(new Date());

      const reelsByDate = {};
      allReels.forEach((reel) => {
        const d = reel.scheduled_date;
        if (!d) return;
        if (!reelsByDate[d]) reelsByDate[d] = [];
        reelsByDate[d].push(reel);
      });

      const year = this.currentMonthDate.getFullYear();
      const month = this.currentMonthDate.getMonth();
      const monthName = this.currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

      let html = `
        <div class="calendar-lane" style="max-width: 900px;">
          <div class="schedule-header">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">Publishing Calendar</h2>
              <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Auto-balanced across formats. Click any day cell to view full post details & actions.</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-recalculate-schedule">Auto Reshuffle Future</button>
          </div>

          <div class="card" style="padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <button class="btn btn-ghost btn-sm" id="btn-prev-month">← Previous</button>
            <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700;">${monthName}</h3>
            <button class="btn btn-ghost btn-sm" id="btn-next-month">Next →</button>
          </div>

          <div class="card" style="padding: 12px; overflow-x: auto;">
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; font-size: 12px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 8px;">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
      `;

      for (let i = 0; i < firstDayIndex; i++) {
        html += `<div style="background: var(--bg-subtle); border-radius: var(--radius-sm); min-height: 78px; opacity: 0.3;"></div>`;
      }

      for (let day = 1; day <= totalDaysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dateStr = formatDateForInput(dateObj);
        const isToday = dateStr === todayStr;
        const reelsOnDay = reelsByDate[dateStr] || [];

        let dayStyle = 'background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 6px; min-height: 84px; display: flex; flex-direction: column; cursor: pointer; transition: all var(--transition-fast);';
        if (isToday) {
          dayStyle = 'background: #FFFFFF; border: 2px solid var(--accent-blue); border-radius: var(--radius-md); padding: 6px; min-height: 84px; display: flex; flex-direction: column; cursor: pointer; box-shadow: var(--shadow-xs);';
        }

        html += `
          <div class="cal-day-cell" data-date="${dateStr}" style="${dayStyle}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: ${isToday ? '800' : '600'}; color: ${isToday ? 'var(--accent-blue)' : 'var(--text-primary)'};">${day} ${isToday ? '📍' : ''}</span>
              ${reelsOnDay.length > 0 ? `<span class="nav-badge" style="font-size: 10px; padding: 1px 5px;">${reelsOnDay.length}</span>` : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px; flex: 1; overflow: hidden;">
              ${reelsOnDay.slice(0, 3).map((r) => {
                const formatMeta = getFormatById(r.format);
                const isMain = r.is_main_reel;
                const isPosted = r.status === 'posted';
                const isFilmed = r.status === 'filmed' || r.is_filmed;

                let badgeBg = 'background: var(--bg-subtle); color: var(--text-primary);';
                if (isMain) badgeBg = 'background: var(--accent-purple-subtle); color: var(--accent-purple); border: 1px solid var(--accent-purple);';
                else if (isPosted) badgeBg = 'background: var(--accent-green-subtle); color: var(--accent-green);';
                else if (isFilmed) badgeBg = 'background: var(--accent-blue-subtle); color: var(--accent-blue);';

                return `
                  <div style="font-size: 10.5px; font-weight: 600; padding: 2px 4px; border-radius: var(--radius-xs); ${badgeBg} white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; items-center; gap: 3px;" title="${escapeHtml(r.title)}">
                    <span>${formatMeta.icon || '💡'}</span>
                    <span>${isMain ? '⭐ ' : ''}${escapeHtml(r.title)}</span>
                  </div>
                `;
              }).join('')}
              ${reelsOnDay.length > 3 ? `<span style="font-size: 10px; color: var(--text-tertiary);">+${reelsOnDay.length - 3} more</span>` : ''}
            </div>
          </div>
        `;
      }

      html += `</div></div></div>`;
      container.innerHTML = html;

      document.getElementById('btn-prev-month')?.addEventListener('click', () => {
        this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
        ScheduleView.render(container, navigateTo, openModal);
      });

      document.getElementById('btn-next-month')?.addEventListener('click', () => {
        this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
        ScheduleView.render(container, navigateTo, openModal);
      });

      document.getElementById('btn-recalculate-schedule')?.addEventListener('click', async () => {
        const res = await recalculateFutureSchedule();
        showToast(`Reshuffled ${res.updatedCount} future trial reels.`, 'success');
        ScheduleView.render(container, navigateTo, openModal);
      });

      container.querySelectorAll('.cal-day-cell').forEach((cell) => {
        cell.addEventListener('click', (e) => {
          const dateStr = e.currentTarget.dataset.date;
          const reelsOnDate = reelsByDate[dateStr] || [];
          this.openDayDetailModal(dateStr, reelsOnDate, navigateTo, openModal);
        });
      });
    },

    openDayDetailModal(dateStr, reels, navigateTo, openModal) {
      const modalOverlay = document.getElementById('modal-overlay');
      const modalBody = document.getElementById('modal-body');
      const modalTitle = document.getElementById('modal-title');

      modalTitle.textContent = `Scheduled Posts for ${formatFullDate(dateStr)}`;

      if (!reels || reels.length === 0) {
        modalBody.innerHTML = `
          <div class="text-center" style="padding: 30px 16px;">
            <p style="font-size: 14px; color: var(--text-tertiary); margin-bottom: 14px;">No content scheduled for this date.</p>
            <button class="btn btn-primary btn-sm" id="btn-modal-capture-for-day">+ Record New Insight for this Date</button>
          </div>
        `;
        modalOverlay.classList.remove('hidden');
        document.getElementById('btn-modal-capture-for-day')?.addEventListener('click', () => {
          modalOverlay.classList.add('hidden');
          openModal('insightCreate');
        });
        return;
      }

      let html = `
        <div class="flex flex-col gap-3">
          ${reels.map((reel) => {
            const formatMeta = getFormatById(reel.format);
            const isFilmed = reel.status === 'filmed' || reel.is_filmed;
            const isPosted = reel.status === 'posted';
            const isMain = reel.is_main_reel;
            const isLocked = reel.is_locked;

            return `
              <div class="card" style="padding: 16px; border-left: 4px solid ${isMain ? 'var(--accent-purple)' : isPosted ? 'var(--accent-green)' : isFilmed ? 'var(--accent-blue)' : 'var(--border-strong)'}">
                <div class="flex items-center justify-between" style="margin-bottom: 6px;">
                  <div class="flex items-center gap-2">
                    <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                    <span class="action-card-badge ${isMain ? 'badge-purple' : 'badge-gray'}">${isMain ? '⭐ Main Reel' : 'Trial Reel'}</span>
                    <span style="font-size: 13px; font-weight: 600;">${escapeHtml(reel.format)}</span>
                  </div>
                  <span class="action-card-badge ${isPosted ? 'badge-green' : isFilmed ? 'badge-blue' : 'badge-amber'}">${isPosted ? '✓ Posted' : isFilmed ? '✓ Filmed' : 'Scheduled'}</span>
                </div>
                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 6px;">${escapeHtml(reel.title)}</h3>
                <div style="font-size: 13.5px; background: var(--bg-subtle); padding: 10px; border-radius: var(--radius-md); margin-bottom: 10px;">"${escapeHtml(reel.hook)}"</div>
                ${reel.script ? `<div style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 10px; border-radius: var(--radius-md); max-height: 140px; overflow-y: auto; margin-bottom: 10px;">${escapeHtml(reel.script)}</div>` : ''}
                <div style="font-size: 12.5px; font-weight: 600; color: var(--accent-blue); margin-bottom: 12px;">CTA: ${escapeHtml(reel.cta)}</div>
                <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                  <button class="btn btn-ghost btn-sm btn-detail-lock" data-id="${reel.id}">${isLocked ? '🔒 Unpin Date' : '📌 Pin Date'}</button>
                  <div class="flex gap-2">
                    ${!isFilmed && !isPosted ? `<button class="btn btn-secondary btn-sm btn-detail-film" data-id="${reel.id}">Mark Filmed</button>` : ''}
                    ${!isPosted ? `<button class="btn btn-primary btn-sm btn-detail-post" data-id="${reel.id}">Mark Posted</button>` : `<button class="btn btn-secondary btn-sm btn-detail-feedback" data-id="${reel.id}">Log 3-Day Feedback</button>`}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      modalBody.innerHTML = html;
      modalOverlay.classList.remove('hidden');

      modalBody.querySelectorAll('.btn-detail-film').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const r = await db.getScheduledReel(e.currentTarget.dataset.id);
          if (r) { r.status = 'filmed'; r.is_filmed = true; await db.saveScheduledReel(r); showToast('Marked Filmed!', 'success'); modalOverlay.classList.add('hidden'); ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal); }
        });
      });

      modalBody.querySelectorAll('.btn-detail-post').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const r = await db.getScheduledReel(e.currentTarget.dataset.id);
          if (r) { r.status = 'posted'; r.posted_date = formatDateForInput(new Date()); await db.saveScheduledReel(r); showToast('Marked Posted!', 'success'); modalOverlay.classList.add('hidden'); ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal); }
        });
      });

      modalBody.querySelectorAll('.btn-detail-feedback').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          modalOverlay.classList.add('hidden');
          openModal('trialFeedback', { reelId: e.currentTarget.dataset.id });
        });
      });

      modalBody.querySelectorAll('.btn-detail-lock').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const r = await db.getScheduledReel(e.currentTarget.dataset.id);
          if (r) { r.is_locked = !r.is_locked; await db.saveScheduledReel(r); showToast(r.is_locked ? 'Locked date' : 'Unlocked date', 'info'); modalOverlay.classList.add('hidden'); ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal); }
        });
      });
    }
  };

  const TrialFeedbackModal = {
    async render(container, options = {}, onDone, openModal, navigateTo) {
      const currentReel = await db.getScheduledReel(options.reelId);
      if (!currentReel) { onDone(); return; }

      const allReels = await db.getScheduledReels();
      const siblingReels = allReels.filter((r) => r.insight_id === currentReel.insight_id);
      const postedSiblings = siblingReels.filter((r) => r.status === 'posted' || r.feedback_logged || r.id === currentReel.id);
      const existingMetrics = currentReel.metrics || {};

      container.innerHTML = `
        <div class="feedback-sheet">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span class="action-card-badge badge-purple">📊 3-Day Post Evaluation</span>
            <span style="font-size: 12px; color: var(--text-tertiary);">Posted ${formatDate(currentReel.posted_date || currentReel.scheduled_date)}</span>
          </div>

          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
            Feedback is recorded <strong>3 days after posting</strong>. Out of all tested trial formats for this insight, the best format will be selected and scheduled as a <strong>Main Reel</strong>.
          </p>

          <div class="card" style="padding: 14px; background: var(--bg-subtle); margin-bottom: 16px; border-left: 4px solid var(--accent-purple);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-purple);">Testing Format: ${escapeHtml(currentReel.format)}</div>
            <div style="font-family: var(--font-heading); font-size: 15px; font-weight: 700;">${escapeHtml(currentReel.title)}</div>
          </div>

          <form id="form-reel-feedback">
            <div class="feedback-grid">
              <div class="metric-input-group"><label>Views</label><input type="number" id="metric-views" placeholder="18500" value="${existingMetrics.views || ''}" required /></div>
              <div class="metric-input-group"><label>Likes</label><input type="number" id="metric-likes" placeholder="920" value="${existingMetrics.likes || ''}" /></div>
              <div class="metric-input-group"><label>Comments</label><input type="number" id="metric-comments" placeholder="84" value="${existingMetrics.comments || ''}" /></div>
              <div class="metric-input-group"><label>Shares / Saves</label><input type="number" id="metric-shares" placeholder="165" value="${existingMetrics.shares || ''}" /></div>
            </div>

            ${postedSiblings.length > 1 ? `
              <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px;">
                <div style="font-size: 12px; font-weight: 700; margin-bottom: 6px;">Tested Formats Comparison for this Insight:</div>
                ${postedSiblings.map((s) => `
                  <div style="display: flex; justify-content: space-between; font-size: 12.5px; padding: 3px 0;">
                    <span>${escapeHtml(s.format)}: <strong>${escapeHtml(s.title)}</strong></span>
                    <span style="font-weight: 600; color: var(--accent-purple);">${s.metrics?.views ? `${s.metrics.views.toLocaleString()} views` : s.id === currentReel.id ? 'Currently Entering' : 'Pending'}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="main-reel-decision-box">
              <h3>Is this the Best-Performing Format?</h3>
              <p style="font-size: 12.5px; color: var(--text-secondary);">Selecting Yes automatically picks this format as the winner for this Insight and schedules it on its own as a Main Reel.</p>
              <div class="decision-button-group">
                <button type="button" class="btn btn-secondary btn-lg flex-1" id="btn-decision-no">No (Archive Trial)</button>
                <button type="button" class="btn btn-primary btn-lg flex-1" id="btn-decision-yes" style="background: var(--accent-purple); border-color: var(--accent-purple);">⭐ Select Best Format & Schedule Main Reel</button>
              </div>
            </div>
          </form>
        </div>
      `;

      const getMetrics = () => ({
        views: parseInt(document.getElementById('metric-views').value) || 0,
        likes: parseInt(document.getElementById('metric-likes').value) || 0,
        comments: parseInt(document.getElementById('metric-comments').value) || 0,
        shares: parseInt(document.getElementById('metric-shares').value) || 0,
        logged_at: new Date().toISOString()
      });

      document.getElementById('btn-decision-yes')?.addEventListener('click', async () => {
        currentReel.metrics = getMetrics();
        currentReel.feedback_logged = true;
        await db.saveScheduledReel(currentReel);
        await promoteToMainReel(currentReel.id);
        showToast('⭐ Best format selected! Main Reel automatically scheduled on your calendar.', 'success');
        onDone();
        navigateTo('schedule');
      });

      document.getElementById('btn-decision-no')?.addEventListener('click', async () => {
        currentReel.metrics = getMetrics();
        currentReel.feedback_logged = true;
        currentReel.status = 'archived';
        await db.saveScheduledReel(currentReel);
        showToast('3-day performance logged. Trial Reel archived.', 'info');
        onDone();
        navigateTo('dashboard');
      });
    }
  };

  const LibraryView = {
    activeInsightId: null,

    async render(container, navigateTo, openModal) {
      const insights = await db.getInsights();
      const scripts = await db.getScripts();
      const reels = await db.getScheduledReels();

      if (this.activeInsightId) {
        this.renderInsightTimeline(container, this.activeInsightId, insights, scripts, reels, navigateTo, openModal);
        return;
      }

      let html = `
        <div class="library-grid">
          <div class="schedule-header">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">Clinical Content Library</h2>
              <p style="font-size: 13px; color: var(--text-secondary);">Unified chronological timeline for every clinical idea.</p>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-new-lib-insight">+ New Insight</button>
          </div>
      `;

      if (insights.length === 0) {
        html += `<div class="card text-center" style="padding: 40px 20px;"><p style="font-size: 14.5px; color: var(--text-tertiary);">No clinical insights yet.</p></div>`;
      } else {
        html += `
          <div class="flex flex-col gap-3">
            ${insights.map((ins) => {
              const insScripts = scripts.filter((s) => s.insight_id === ins.id);
              const insReels = reels.filter((r) => r.insight_id === ins.id);
              return `
                <div class="card btn-open-insight" data-id="${ins.id}" style="cursor: pointer;">
                  <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">${formatRelativeDate(ins.created_at)}</div>
                  <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 6px;">${escapeHtml(ins.title)}</h3>
                  <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(ins.supporting_points || ins.description || '')}</p>
                  <div style="margin-top: 10px; font-size: 12.5px; color: var(--accent-blue); font-weight: 600;">${insScripts.length} Scripts • ${insReels.length} Reels</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
      html += `</div>`;
      container.innerHTML = html;

      container.querySelectorAll('.btn-open-insight').forEach((el) => {
        el.addEventListener('click', (e) => {
          this.activeInsightId = e.currentTarget.dataset.id;
          LibraryView.render(container, navigateTo, openModal);
        });
      });

      document.getElementById('btn-new-lib-insight')?.addEventListener('click', () => openModal('insightCreate'));
    },

    renderInsightTimeline(container, insightId, insights, scripts, reels, navigateTo, openModal) {
      const insight = insights.find((i) => i.id === insightId);
      if (!insight) {
        this.activeInsightId = null;
        LibraryView.render(container, navigateTo, openModal);
        return;
      }
      const insScripts = scripts.filter((s) => s.insight_id === insight.id);
      const insReels = reels.filter((r) => r.insight_id === insight.id);

      let html = `
        <div class="library-grid">
          <button class="btn btn-ghost btn-sm" id="btn-back-to-library" style="margin-bottom: 12px; align-self: flex-start;">← Back to Library</button>
          <div class="card" style="margin-bottom: 16px;">
            <div class="flex justify-between items-center">
              <span style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: var(--accent-blue);">Clinical Insight Timeline</span>
              <button class="btn btn-danger btn-sm" id="btn-delete-insight-timeline" data-id="${insight.id}">Delete Insight</button>
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin: 4px 0 8px;">${escapeHtml(insight.title)}</h2>
            <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.45;">${escapeHtml(insight.supporting_points || insight.description || '')}</p>
          </div>

          <div class="insight-timeline">
            <div class="timeline-node">
              <div class="timeline-dot done">✓</div>
              <div class="timeline-content">
                <div class="flex justify-between items-center" style="margin-bottom: 4px;"><strong style="font-size: 14px;">1. Clinical Idea Captured</strong><span style="font-size: 12px; color: var(--text-tertiary);">${formatDate(insight.created_at)}</span></div>
                <p style="font-size: 13px; color: var(--text-secondary);">Recorded in doctor workspace.</p>
              </div>
            </div>

            <div class="timeline-node">
              <div class="timeline-dot ${insScripts.length > 0 ? 'done' : ''}">${insScripts.length > 0 ? '✓' : '2'}</div>
              <div class="timeline-content">
                <strong style="font-size: 14px;">2. AI Scripts Review (${insScripts.length} Formats)</strong>
                ${insScripts.length === 0 ? `<p style="font-size: 13px; color: var(--text-tertiary);">No scripts imported yet.</p>` : `
                  <div class="flex flex-col gap-2" style="margin-top: 6px;">
                    ${insScripts.map((s) => `
                      <div style="font-size: 12.5px; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding: 3px 0;">
                        <span>${escapeHtml(s.format)}: <strong>${escapeHtml(s.title)}</strong></span>
                        <span class="action-card-badge ${s.status === 'accepted' ? 'badge-green' : 'badge-gray'}">${s.status}</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>

            <div class="timeline-node">
              <div class="timeline-dot ${insReels.length > 0 ? 'done' : ''}">${insReels.length > 0 ? '✓' : '3'}</div>
              <div class="timeline-content">
                <strong style="font-size: 14px;">3. Trial Reels on Calendar</strong>
                ${insReels.map((r) => `<div style="font-size: 13px; margin-top: 4px;">• ${r.is_main_reel ? '⭐ ' : ''}${r.format} scheduled for <strong>${formatDate(r.scheduled_date)}</strong> (${r.status})</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      document.getElementById('btn-back-to-library')?.addEventListener('click', () => {
        this.activeInsightId = null;
        LibraryView.render(container, navigateTo, openModal);
      });

      document.getElementById('btn-delete-insight-timeline')?.addEventListener('click', async (e) => {
        if (confirm('Delete this insight and all associated scripts & reels?')) {
          await db.deleteInsight(e.currentTarget.dataset.id);
          showToast('Insight deleted!', 'info');
          this.activeInsightId = null;
          LibraryView.render(container, navigateTo, openModal);
        }
      });
    }
  };

  const SettingsView = {
    async render(container, navigateTo, openModal) {
      const profile = await db.getProfile();
      let html = `
        <div class="action-deck">
          <div class="schedule-header">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">Doctor Profile & AI Instructions</h2>
              <p style="font-size: 13px; color: var(--text-secondary);">Customized rules compiled into every prompt.</p>
            </div>
          </div>
          <form id="form-doctor-profile" class="card">
            <div class="form-group">
              <label class="form-label" for="prof-name">Doctor Name *</label>
              <input type="text" id="prof-name" class="form-input" value="${escapeHtml(profile.name || '')}" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="prof-specialty">Medical Specialty *</label>
              <input type="text" id="prof-specialty" class="form-input" value="${escapeHtml(profile.specialty || '')}" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 14px;">Save Doctor Profile</button>
          </form>

          <div class="card" style="margin-top: 16px;">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 6px;">Local-First Data</h3>
            <div class="flex gap-2" style="flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" id="btn-export-json">Export Backup JSON</button>
              <button class="btn btn-secondary btn-sm" id="btn-load-demo-settings">Load Cardiology Demo</button>
            </div>
          </div>

          <div class="card" style="margin-top: 16px; border: 1.5px dashed var(--accent-red); background: var(--accent-red-subtle);">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--accent-red); margin-bottom: 4px;">⚠️ Reset All Data & Start Fresh</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">Permanently delete all insights, quick notes, generated scripts, and scheduled reels. This action cannot be undone.</p>
            <button class="btn btn-danger btn-lg" id="btn-reset-all-data">Delete All Data & Reset Workspace</button>
          </div>
        </div>
      `;
      container.innerHTML = html;

      document.getElementById('form-doctor-profile')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        profile.name = document.getElementById('prof-name').value.trim();
        profile.specialty = document.getElementById('prof-specialty').value.trim();
        await db.saveProfile(profile);
        showToast('Profile updated!', 'success');
      });

      document.getElementById('btn-export-json')?.addEventListener('click', async () => {
        const backup = await db.exportFullDatabase();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doctor-content-os-backup.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      document.getElementById('btn-load-demo-settings')?.addEventListener('click', async () => {
        await populateSampleDoctorWorkspace();
        showToast('Demo loaded!', 'success');
        navigateTo('dashboard');
      });

      document.getElementById('btn-reset-all-data')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete ALL data (insights, notes, scripts, scheduled reels) and reset your workspace?')) {
          await db.resetAllData();
          showToast('All workspace data deleted! Workspace is now blank.', 'info');
          window.location.hash = 'dashboard';
          window.location.reload();
        }
      });
    }
  };

  // 9. APP COORDINATOR & ROUTER
  class ContentOSApp {
    constructor() {
      this.currentView = 'dashboard';
      this.modalActive = false;
      this.viewContainer = document.getElementById('view-container');
      this.modalOverlay = document.getElementById('modal-overlay');
      this.modalBody = document.getElementById('modal-body');
      this.modalTitle = document.getElementById('modal-title');
      this.headerViewTitle = document.getElementById('header-view-title');
      this.headerDate = document.getElementById('header-today-date');
    }

    async init() {
      const profile = await db.getProfile();
      if (!profile || !profile.onboarded) {
        await populateSampleDoctorWorkspace();
      }

      const updatedProfile = await db.getProfile();
      const sideName = document.getElementById('sidebar-dr-name');
      if (sideName) sideName.textContent = updatedProfile.name || 'Doctor Workspace';

      if (this.headerDate) this.headerDate.textContent = formatDate(new Date());

      this.setupNavigation();
      this.setupModals();

      const hash = window.location.hash.replace(/^#/, '');
      this.navigateTo(hash || 'dashboard');
      this.updateBadges();
    }

    setupNavigation() {
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace(/^#/, '');
        this.navigateTo(hash || 'dashboard');
      });

      document.getElementById('bnav-fab-capture')?.addEventListener('click', () => this.openModal('insightCreate'));
      document.getElementById('header-btn-note')?.addEventListener('click', () => this.openModal('quickNote'));
      document.getElementById('header-btn-insight')?.addEventListener('click', () => this.openModal('insightCreate'));
      document.getElementById('btn-load-demo-sidebar')?.addEventListener('click', async () => {
        await populateSampleDoctorWorkspace();
        this.navigateTo('dashboard');
        this.updateBadges();
      });
    }

    async navigateTo(viewName) {
      this.currentView = viewName;
      window.location.hash = viewName;

      document.querySelectorAll('.nav-link, .bnav-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.view === viewName);
      });

      const titles = {
        dashboard: "Today's Workspace",
        review: "Script Review Deck",
        schedule: "Content Schedule",
        notes: "Quick Thoughts",
        library: "Content Library",
        settings: "Doctor Profile"
      };

      if (this.headerViewTitle) this.headerViewTitle.textContent = titles[viewName] || "Doctor Workspace";

      if (viewName === 'dashboard') await DashboardView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'review') await ScriptReviewView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'schedule') await ScheduleView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'notes') await NotesView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'library') await LibraryView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'settings') await SettingsView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));

      this.updateBadges();
    }

    setupModals() {
      document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeModal());
      this.modalOverlay?.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) this.closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modalActive) this.closeModal();
      });
    }

    openModal(modalType, options = {}) {
      this.modalActive = true;
      this.modalOverlay.classList.remove('hidden');

      const titles = {
        insightCreate: 'Record New Clinical Insight',
        quickNote: 'Quick Thought / Scratchpad',
        aiImport: 'Import AI Script Pack',
        trialFeedback: '3-Day Trial Reel Feedback'
      };

      this.modalTitle.textContent = titles[modalType] || 'Action Sheet';

      if (modalType === 'insightCreate') {
        InsightCreateModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this));
      } else if (modalType === 'quickNote') {
        this.modalBody.innerHTML = `
          <form id="modal-form-quick-note" class="flex flex-col gap-3">
            <p style="font-size: 13px; color: var(--text-secondary);">Capture an incomplete clinical spark.</p>
            <textarea id="modal-input-note" class="form-textarea" rows="3" placeholder="e.g. I should explain Vitamin D..." required></textarea>
            <div class="flex justify-between items-center">
              <button type="button" class="btn btn-ghost btn-sm" id="btn-modal-cancel-note">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Save Thought</button>
            </div>
          </form>
        `;
        document.getElementById('btn-modal-cancel-note')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modal-form-quick-note')?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const text = document.getElementById('modal-input-note').value.trim();
          if (text) {
            await db.addNote({ id: uuidv4(), text, created_at: new Date().toISOString(), is_archived: false });
            this.closeModal();
            this.navigateTo(this.currentView);
          }
        });
      } else if (modalType === 'aiImport') {
        AIImportModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this), this.navigateTo.bind(this));
      } else if (modalType === 'trialFeedback') {
        TrialFeedbackModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this), this.navigateTo.bind(this));
      }
    }

    closeModal() {
      this.modalActive = false;
      this.modalOverlay.classList.add('hidden');
      this.modalBody.innerHTML = '';
      this.updateBadges();
    }

    async updateBadges() {
      const pendingScripts = await db.getPendingReviewScripts();
      const allNotes = await db.getNotes();

      const reviewCount = pendingScripts.length;
      const badgeReviewD = document.getElementById('badge-review-count');
      const badgeReviewM = document.getElementById('bnav-badge-review');
      if (badgeReviewD && badgeReviewM) {
        badgeReviewD.textContent = reviewCount;
        badgeReviewM.textContent = reviewCount;
        badgeReviewD.classList.toggle('hidden', reviewCount === 0);
        badgeReviewM.classList.toggle('hidden', reviewCount === 0);
      }

      const activeNotesCount = allNotes.filter((n) => !n.is_archived).length;
      const badgeNotesD = document.getElementById('badge-notes-count');
      const badgeNotesM = document.getElementById('bnav-badge-notes');
      if (badgeNotesD && badgeNotesM) {
        badgeNotesD.textContent = activeNotesCount;
        badgeNotesM.textContent = activeNotesCount;
        badgeNotesD.classList.toggle('hidden', activeNotesCount === 0);
        badgeNotesM.classList.toggle('hidden', activeNotesCount === 0);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const app = new ContentOSApp();
    app.init();
  });
})();
