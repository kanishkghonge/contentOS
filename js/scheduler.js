/**
 * Content OS for Doctors — Intelligent Auto-Scheduler
 * Balances content formats and medical topics across calendar days.
 * Reshuffles ONLY future, unfilmed, unlocked Trial Reels.
 */

import { db } from './db.js';
import { scriptFormats, getFormatById } from './formats.js';
import { uuidv4, addDays, formatDateForInput } from './utils.js';

/**
 * Returns an array of target posting dates starting from tomorrow or the next valid day,
 * matching the doctor's posting schedule (e.g. Mon/Wed/Fri or Daily).
 */
export function getNextPostingDates(startDate, count, postingDays = ['Mon', 'Wed', 'Fri']) {
  const dates = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allowAllDays = !postingDays || postingDays.length === 0 || postingDays.includes('Daily');

  let safetyCount = 0;
  while (dates.length < count && safetyCount < 365) {
    safetyCount++;
    current.setDate(current.getDate() + 1);
    const dayName = dayNames[current.getDay()];

    if (allowAllDays || postingDays.includes(dayName)) {
      dates.push(formatDateForInput(current));
    }
  }

  return dates;
}

/**
 * Intelligently interleaves scripts so adjacent dates have distinct formats and topics.
 */
export function balanceContentQueue(items) {
  if (!items || items.length <= 1) return items;

  const remaining = [...items];
  const balanced = [];

  // Pick first item (prefer strong format like Patient Story or Talking Head)
  balanced.push(remaining.shift());

  while (remaining.length > 0) {
    const lastItem = balanced[balanced.length - 1];
    const lastFormat = lastItem.format;
    const lastCategory = getFormatById(lastFormat).category;
    const lastInsight = lastItem.insight_id;

    // Find best candidate: different topic, different format, different category
    let bestIdx = remaining.findIndex(
      (item) => item.insight_id !== lastInsight && item.format !== lastFormat && getFormatById(item.format).category !== lastCategory
    );

    // Fallback 1: different format
    if (bestIdx === -1) {
      bestIdx = remaining.findIndex((item) => item.format !== lastFormat);
    }

    // Fallback 2: different insight
    if (bestIdx === -1) {
      bestIdx = remaining.findIndex((item) => item.insight_id !== lastInsight);
    }

    // Fallback 3: take next available
    if (bestIdx === -1) {
      bestIdx = 0;
    }

    const [chosen] = remaining.splice(bestIdx, 1);
    balanced.push(chosen);
  }

  return balanced;
}

/**
 * Core Auto-Scheduling Routine
 * - Preserves all filmed, posted, locked, or past reels.
 * - Collects all future unfilmed trial reels + newly accepted scripts.
 * - Balances the queue and re-assigns future calendar dates.
 */
export async function recalculateFutureSchedule() {
  const profile = await db.getProfile();
  const allReels = await db.getScheduledReels();
  const todayStr = formatDateForInput(new Date());

  // 1. Separate FROZEN reels from MUTABLE reels
  // Frozen: already posted, filmed, locked, or date <= today
  const frozenReels = allReels.filter((reel) => {
    const isPastOrToday = reel.scheduled_date <= todayStr;
    const isFilmedOrPosted = reel.status === 'filmed' || reel.status === 'posted';
    const isLocked = reel.is_locked === true;
    const isMainReel = reel.is_main_reel === true;

    return isPastOrToday || isFilmedOrPosted || isLocked || isMainReel;
  });

  // Mutable reels: future, unfilmed, unlocked trial reels
  const mutableReels = allReels.filter((reel) => {
    return !frozenReels.some((f) => f.id === reel.id);
  });

  if (mutableReels.length === 0) {
    return { updatedCount: 0, totalReels: allReels.length };
  }

  // 2. Extract locked dates so the scheduler doesn't collide
  const reservedDates = new Set(frozenReels.map((r) => r.scheduled_date));

  // 3. Balance the mutable queue (interleave formats & topics)
  const balancedQueue = balanceContentQueue(mutableReels);

  // 4. Generate next posting dates skipping reserved dates
  const postingDays = profile.postingDays || ['Mon', 'Wed', 'Fri'];
  const futureDates = [];
  let runnerDate = new Date();

  while (futureDates.length < balancedQueue.length) {
    const nextCandidates = getNextPostingDates(runnerDate, 5, postingDays);
    for (const cand of nextCandidates) {
      if (!reservedDates.has(cand) && !futureDates.includes(cand)) {
        futureDates.push(cand);
        if (futureDates.length === balancedQueue.length) break;
      }
    }
    runnerDate = new Date(nextCandidates[nextCandidates.length - 1]);
  }

  // 5. Assign updated dates to the balanced queue
  const updatedReels = balancedQueue.map((reel, idx) => {
    return {
      ...reel,
      scheduled_date: futureDates[idx] || reel.scheduled_date,
      updated_at: new Date().toISOString()
    };
  });

  // 6. Save back to IndexedDB
  await db.saveScheduledReels([...frozenReels, ...updatedReels]);

  return {
    updatedCount: updatedReels.length,
    totalReels: frozenReels.length + updatedReels.length
  };
}

/**
 * Creates a Trial Reel from an accepted script and triggers auto-scheduling.
 */
export async function scheduleAcceptedScript(script) {
  const existingReels = await db.getScheduledReels();
  const duplicate = existingReels.find((r) => r.script_id === script.id);

  if (duplicate) {
    return duplicate;
  }

  const todayStr = formatDateForInput(new Date());

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
    scheduled_date: todayStr, // Temporary, will be positioned by recalculate
    status: 'scheduled', // 'scheduled' | 'filmed' | 'posted' | 'winner' | 'archived'
    is_locked: false,
    is_main_reel: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await db.saveScheduledReel(newReel);
  await recalculateFutureSchedule();

  return newReel;
}

/**
 * Promotes a tested Trial Reel to a permanent Main Reel.
 */
export async function promoteToMainReel(trialReelId) {
  const reel = await db.getScheduledReel(trialReelId);
  if (!reel) throw new Error('Reel not found');

  const profile = await db.getProfile();
  const nextDates = getNextPostingDates(new Date(), 8, profile.postingDays || ['Mon', 'Wed', 'Fri']);
  // Place Main Reel 5-7 days out into prime slot
  const mainReelDate = nextDates[2] || nextDates[0];

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
    scheduled_date: mainReelDate,
    status: 'scheduled',
    is_locked: true,
    is_main_reel: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Mark original trial reel as winner
  reel.status = 'winner';
  reel.promoted_to_main_reel_id = mainReel.id;
  reel.is_main_reel_winner = true;

  await db.saveScheduledReel(reel);
  await db.saveScheduledReel(mainReel);
  await recalculateFutureSchedule();

  return mainReel;
}
