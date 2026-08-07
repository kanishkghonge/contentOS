/**
 * Content OS for Doctors — Doctor Profile & System Settings
 * Customizes prompt engine rules and provides local-first JSON backup/restore.
 */

import { db } from '../db.js';
import { populateSampleDoctorWorkspace } from '../sampleData.js';
import { showToast, escapeHtml } from '../utils.js';

export const SettingsView = {
  async render(container, navigateTo, openModal) {
    const profile = await db.getProfile();

    let html = `
      <div class="action-deck">
        <div class="schedule-header">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">
              Doctor Profile & AI Instructions
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
              These preferences are automatically compiled into every custom prompt for ChatGPT & Claude.
            </p>
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

          <div class="form-group">
            <label class="form-label">Target Audience *</label>
            <div class="segmented-control" id="ctrl-audience">
              <button type="button" class="segmented-btn ${profile.audience === 'Patients' ? 'active' : ''}" data-val="Patients">Patients</button>
              <button type="button" class="segmented-btn ${profile.audience === 'Doctors' ? 'active' : ''}" data-val="Doctors">Doctors</button>
              <button type="button" class="segmented-btn ${profile.audience === 'Both' ? 'active' : ''}" data-val="Both">Both</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Primary Language / Dialect *</label>
            <select id="prof-lang" class="form-select">
              <option value="English" ${profile.language === 'English' ? 'selected' : ''}>English (Natural & Clear)</option>
              <option value="Hinglish" ${profile.language === 'Hinglish' ? 'selected' : ''}>Hinglish (Hindi + English conversational)</option>
              <option value="Hindi" ${profile.language === 'Hindi' ? 'selected' : ''}>Hindi (Formal clinical Hindi)</option>
              <option value="Spanish" ${profile.language === 'Spanish' ? 'selected' : ''}>Spanish (Español)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Preferred Tone *</label>
            <select id="prof-tone" class="form-select">
              <option value="Conversational & Empathetic" ${profile.tone === 'Conversational & Empathetic' ? 'selected' : ''}>Conversational & Empathetic (Reassuring clinician)</option>
              <option value="Authoritative & Evidence-Based" ${profile.tone === 'Authoritative & Evidence-Based' ? 'selected' : ''}>Authoritative & Evidence-Based (Senior consultant)</option>
              <option value="Friendly & Approachable" ${profile.tone === 'Friendly & Approachable' ? 'selected' : ''}>Friendly & Approachable (Community health)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Call-To-Action Preference *</label>
            <select id="prof-cta" class="form-select">
              <option value="both" ${profile.cta === 'both' ? 'selected' : ''}>Generate Both Versions (Read caption + Comment keyword)</option>
              <option value="Read caption for full medical details" ${profile.cta === 'Read caption for full medical details' ? 'selected' : ''}>Read Caption Only</option>
              <option value="Comment for guide" ${profile.cta === 'Comment for guide' ? 'selected' : ''}>Comment Keyword ("HEART", "TEST")</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="prof-clinic">Clinic / Hospital Name (Optional)</label>
            <input type="text" id="prof-clinic" class="form-input" value="${escapeHtml(profile.clinicName || '')}" placeholder="e.g. Heart & Vascular Institute" />
          </div>

          <div class="flex justify-between items-center" style="margin-top: 20px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
            <button type="submit" class="btn btn-primary btn-lg">
              <span>Save Doctor Profile</span>
            </button>
          </div>
        </form>

        <!-- Backup & Demo Reset -->
        <div class="card" style="margin-top: 16px;">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 6px;">
            Local-First Backup & Data Management
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
            All your data is stored locally in your browser. Export a zero-loss JSON backup at any time.
          </p>

          <div class="flex gap-2" style="flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-export-json">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Export Backup JSON</span>
            </button>

            <button class="btn btn-secondary btn-sm" id="btn-import-json-trigger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Restore from JSON</span>
            </button>

            <input type="file" id="input-file-backup" accept=".json" class="hidden" />

            <button class="btn btn-secondary btn-sm" id="btn-load-demo-settings">
              <span>Load Cardiology Demo</span>
            </button>
          </div>
        </div>

        <!-- Danger Zone: Reset All Data -->
        <div class="card" style="margin-top: 16px; border: 1.5px dashed var(--accent-red); background: var(--accent-red-subtle);">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--accent-red); margin-bottom: 4px;">
            ⚠️ Reset All Data & Start Fresh
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
            Permanently delete all insights, quick notes, generated scripts, and scheduled reels. This action cannot be undone.
          </p>

          <button class="btn btn-danger btn-lg" id="btn-reset-all-data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Delete All Data & Reset Workspace</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Segmented Audience Control
    let selectedAudience = profile.audience || 'Patients';
    container.querySelectorAll('#ctrl-audience .segmented-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('#ctrl-audience .segmented-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAudience = btn.dataset.val;
      });
    });

    // Save Profile
    document.getElementById('form-doctor-profile')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = {
        ...profile,
        name: document.getElementById('prof-name').value.trim(),
        specialty: document.getElementById('prof-specialty').value.trim(),
        audience: selectedAudience,
        language: document.getElementById('prof-lang').value,
        tone: document.getElementById('prof-tone').value,
        cta: document.getElementById('prof-cta').value,
        clinicName: document.getElementById('prof-clinic').value.trim(),
        onboarded: true
      };

      await db.saveProfile(updated);
      showToast('Doctor Profile updated successfully!', 'success');
      
      // Update sidebar title
      const sideName = document.getElementById('sidebar-dr-name');
      if (sideName) sideName.textContent = updated.name;
    });

    // Export JSON Backup
    document.getElementById('btn-export-json')?.addEventListener('click', async () => {
      const backup = await db.exportFullDatabase();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doctor-content-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON downloaded!', 'success');
    });

    // Trigger file input
    document.getElementById('btn-import-json-trigger')?.addEventListener('click', () => {
      document.getElementById('input-file-backup')?.click();
    });

    // Handle JSON file restore
    document.getElementById('input-file-backup')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        await db.importFullDatabase(parsed);
        showToast('Workspace restored from JSON!', 'success');
        navigateTo('dashboard');
      } catch (err) {
        showToast(`Restore failed: ${err.message}`, 'error');
      }
    });

    // Load Demo Data
    document.getElementById('btn-load-demo-settings')?.addEventListener('click', async () => {
      await populateSampleDoctorWorkspace();
      showToast('Demo workspace loaded!', 'success');
      navigateTo('dashboard');
    });

    // Reset All Data
    document.getElementById('btn-reset-all-data')?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete ALL data (insights, notes, scripts, scheduled reels) and reset your workspace?')) {
        await db.resetAllData();
        showToast('All workspace data deleted!', 'info');
        window.location.reload();
      }
    });
  }
};
