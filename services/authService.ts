/**
 * authService.ts — AarogyaVani Dual-Login Auth
 *
 * Two account types:
 *  - "patient"  → the elderly user (signs up normally, gets a Care Anchor Code)
 *  - "anchor"   → the child/guardian (logs in with their phone + the patient's 6-char code)
 *
 * Anchors are now explicitly pre-registered by the patient (max 5).
 * All data is stored in localStorage.
 */

export type AccountRole = 'patient' | 'anchor';

export interface AllowedAnchor {
    phone: string;      // +91... — the anchor's phone number
    name: string;       // display name
    addedAt: number;    // Date.now()
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: AccountRole;
    age?: number;
    language?: string;
    careAnchorCode?: string;        // only for 'patient' — the shared code
    allowedAnchors?: AllowedAnchor[]; // only for 'patient' — max 5
    linkedPatientId?: string;       // only for 'anchor'
    linkedPatientName?: string;     // only for 'anchor' — display name
    linkedPatientEmail?: string;    // only for 'anchor' — to look up patient
    createdAt: number;
}

const SESSION_KEY = 'av_user';
const USERS_KEY = 'av_users';
const CODES_KEY = 'av_anchor_codes';
const MAX_ANCHORS = 5;

/* ── Helpers ─────────────────────────────────────────── */
function simpleHash(str: string): string {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return h.toString(16);
}

function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function normalizePhone(phone: string): string {
    return phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
}

function getUsers(): Record<string, { pwdHash: string; profile: UserProfile }> {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || 'null') ?? {}; }
    catch { return {}; }
}

function saveUsers(users: Record<string, { pwdHash: string; profile: UserProfile }>) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCodes(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem(CODES_KEY) || 'null') ?? {}; }
    catch { return {}; }
}

/* ── Public API ──────────────────────────────────────── */

export function getCurrentUser(): UserProfile | null {
    try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
}

export interface AuthResult {
    success: boolean;
    error?: string;
    user?: UserProfile;
}

/** Register a new PATIENT account. Optionally pre-register first anchor. */
export function signUp(
    name: string,
    email: string,
    password: string,
    age?: number,
    firstAnchor?: { name: string; phone: string },
): AuthResult {
    if (!name.trim() || !email.trim() || !password)
        return { success: false, error: 'All fields are required.' };
    if (password.length < 6)
        return { success: false, error: 'Password must be at least 6 characters.' };

    const users = getUsers();
    const codes = getCodes();
    const emailKey = email.toLowerCase().trim();

    if (users[emailKey])
        return { success: false, error: 'An account with this email already exists.' };

    let code = generateCode();
    while (codes[code]) code = generateCode();

    const allowedAnchors: AllowedAnchor[] = [];
    if (firstAnchor?.name?.trim() && firstAnchor?.phone?.trim()) {
        allowedAnchors.push({ name: firstAnchor.name.trim(), phone: normalizePhone(firstAnchor.phone), addedAt: Date.now() });
    }

    const profile: UserProfile = {
        id: Date.now().toString(36),
        name: name.trim(),
        email: emailKey,
        role: 'patient',
        age,
        language: 'Kannada',
        careAnchorCode: code,
        allowedAnchors,
        createdAt: Date.now(),
    };

    users[emailKey] = { pwdHash: simpleHash(password), profile };
    codes[code] = emailKey;
    saveUsers(users);
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));

    return { success: true, user: profile };
}

/** Log in an existing PATIENT account. */
export function logIn(email: string, password: string): AuthResult {
    const users = getUsers();
    const emailKey = email.toLowerCase().trim();
    const record = users[emailKey];

    if (!record) return { success: false, error: 'No account found with this email.' };
    if (record.pwdHash !== simpleHash(password)) return { success: false, error: 'Incorrect password.' };

    localStorage.setItem(SESSION_KEY, JSON.stringify(record.profile));
    return { success: true, user: record.profile };
}

/**
 * Register a new Care Anchor account (First-time Link).
 * Requires: name, phone, password, and the patient's 6-char code.
 */
export function signUpAnchor(name: string, phone: string, password: string, code: string): AuthResult {
    if (!name.trim() || !phone.trim() || !password || !code.trim())
        return { success: false, error: 'All fields are required.' };
    if (password.length < 6)
        return { success: false, error: 'Password must be at least 6 characters.' };

    const users = getUsers();
    const codes = getCodes();
    const normalizedPhone = normalizePhone(phone);
    const anchorKey = `anchor_${normalizedPhone}`;

    if (users[anchorKey])
        return { success: false, error: 'An anchor account with this phone number already exists. Please log in.' };

    const emailKey = codes[code.trim().toUpperCase()];
    if (!emailKey)
        return { success: false, error: 'Invalid Care Anchor Code. Please check with your family member.' };

    const patientRecord = users[emailKey];
    if (!patientRecord)
        return { success: false, error: 'Patient account not found.' };

    const allowed = patientRecord.profile.allowedAnchors ?? [];
    if (allowed.length > 0) {
        const match = allowed.find(a => normalizePhone(a.phone) === normalizedPhone);
        if (!match)
            return { success: false, error: 'Your phone number is not registered for this patient. Ask them to add you in their Anchor settings.' };
    }

    const anchorProfile: UserProfile = {
        id: 'anchor_' + Date.now().toString(36),
        name: name.trim(),
        email: anchorKey, // internal use
        role: 'anchor',
        linkedPatientId: patientRecord.profile.id,
        linkedPatientName: patientRecord.profile.name,
        linkedPatientEmail: emailKey,
        createdAt: Date.now(),
    };

    users[anchorKey] = { pwdHash: simpleHash(password), profile: anchorProfile };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(anchorProfile));

    return { success: true, user: anchorProfile };
}

/**
 * Log in an existing Care Anchor.
 * Requires: phone and password.
 */
export function loginAnchor(phone: string, password: string): AuthResult {
    const users = getUsers();
    const normalizedPhone = normalizePhone(phone);
    const anchorKey = `anchor_${normalizedPhone}`;
    const record = users[anchorKey];

    if (!record) return { success: false, error: 'No Care Anchor account found with this phone number. Have you signed up?' };
    if (record.pwdHash !== simpleHash(password)) return { success: false, error: 'Incorrect password.' };

    localStorage.setItem(SESSION_KEY, JSON.stringify(record.profile));
    return { success: true, user: record.profile };
}

/** Add an allowed anchor to a patient's profile (max 5) */
export function addAllowedAnchor(phone: string, name: string): AuthResult {
    const current = getCurrentUser();
    if (!current || current.role !== 'patient') return { success: false, error: 'Only patients can add anchors.' };

    const users = getUsers();
    const record = users[current.email];
    if (!record) return { success: false, error: 'Account not found.' };

    const list = record.profile.allowedAnchors ?? [];
    if (list.length >= MAX_ANCHORS)
        return { success: false, error: `You can only add up to ${MAX_ANCHORS} Care Anchors.` };

    const normalized = normalizePhone(phone);
    if (list.some(a => normalizePhone(a.phone) === normalized))
        return { success: false, error: 'This phone number is already registered as an anchor.' };

    const newEntry: AllowedAnchor = { name: name.trim(), phone: normalized, addedAt: Date.now() };
    const updated = { ...record.profile, allowedAnchors: [...list, newEntry] };

    record.profile = updated;
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    return { success: true, user: updated };
}

/** Remove an allowed anchor from a patient's profile */
export function removeAllowedAnchor(phone: string): AuthResult {
    const current = getCurrentUser();
    if (!current || current.role !== 'patient') return { success: false, error: 'Only patients can remove anchors.' };

    const users = getUsers();
    const record = users[current.email];
    if (!record) return { success: false, error: 'Account not found.' };

    const normalized = normalizePhone(phone);
    const updated = { ...record.profile, allowedAnchors: (record.profile.allowedAnchors ?? []).filter(a => normalizePhone(a.phone) !== normalized) };

    record.profile = updated;
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    return { success: true, user: updated };
}

/** Log out the current user */
export function logOut() {
    localStorage.removeItem(SESSION_KEY);
}

/** Update profile fields for the current patient user */
export function updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = getCurrentUser();
    if (!current || current.role !== 'patient') return null;

    const updated = { ...current, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));

    const users = getUsers();
    if (users[current.email]) {
        users[current.email].profile = updated;
        saveUsers(users);
    }
    return updated;
}

/**
 * Returns the localStorage key prefix to use for data.
 * Both patient and their anchor use the patient's ID as the namespace.
 */
export function getDataNamespace(): string {
    const user = getCurrentUser();
    if (!user) return 'av';
    if (user.role === 'patient') return `av_${user.id}`;
    if (user.role === 'anchor' && user.linkedPatientId) return `av_${user.linkedPatientId}`;
    return 'av';
}
