import { useState, useEffect } from 'react';
import type React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { QRCodeSVG } from 'qrcode.react';
import { ClaudeCharacter } from '../components/ClaudeCharacter';
import { EventHeader } from '../components/EventHeader';
import './MobileFlow.css';

const STORAGE_KEY = 'claude-event-attendee-id';

const SUGGESTIONS = [
  'Agents in production',
  'Evals',
  'MCP',
  'Claude Code',
  'Voice',
  'Shipping faster',
  'Design with AI',
  'Managed Agents',
  'Regulation',
];

type Screen = 'name' | 'interest' | 'done';

export function MobileFlow() {
  const submitAttendee = useMutation(api.attendees.submitAttendee);
  const updateInterest = useMutation(api.attendees.updateAttendeeInterest);
  const generateUploadUrl = useMutation(api.attendees.generateUploadUrl);
  const setPhoto = useMutation(api.attendees.setPhoto);

  // Stored ID (returning user)
  const [storedId] = useState<string | null>(
    () => (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
  );
  const existing = useQuery(
    api.attendees.getById,
    storedId ? { id: storedId as Id<'attendees'> } : 'skip'
  );

  const [screen, setScreen] = useState<Screen>('name');
  const [attendeeId, setAttendeeId] = useState<Id<'attendees'> | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [interest, setInterest] = useState('');

  // Hydrate returning user → land on Screen 2 prefilled
  useEffect(() => {
    if (existing && !attendeeId) {
      setAttendeeId(existing._id);
      setName(existing.name);
      setRole(existing.role);
      setInterest(existing.interest ?? '');
      setScreen('interest');
    }
  }, [existing, attendeeId]);

  function submitName() {
    if (!name.trim() || !role.trim()) return;
    setScreen('interest');
  }

  async function submitInterestForm() {
    const trimmed = interest.trim();
    if (attendeeId) {
      // Returning user — just patch the interest
      await updateInterest({ id: attendeeId, interest: trimmed });
    } else {
      // First-time submit
      const id = await submitAttendee({
        name: name.trim(),
        role: role.trim(),
        interest: trimmed || undefined,
      });
      setAttendeeId(id);
      localStorage.setItem(STORAGE_KEY, id);
    }
    setScreen('done');
  }

  function appendSuggestion(s: string) {
    setInterest((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return s;
      // avoid duplicates
      if (trimmed.toLowerCase().includes(s.toLowerCase())) return trimmed;
      return `${trimmed}, ${s}`;
    });
  }

  function editInterest() {
    setScreen('interest');
  }

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !attendeeId) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await generateUploadUrl({});
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      });
      if (!res.ok) throw new Error(`upload failed: ${res.status}`);
      const { storageId } = await res.json();
      await setPhoto({ id: attendeeId, storageId });
    } catch (err) {
      console.error(err);
      setUploadError('Upload failed. Try again?');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mobile">
      <EventHeader compact />

      {screen === 'name' && (
        <div className="mobile__screen">
          <ClaudeCharacter size="medium" />
          <h1 className="mobile__title">Welcome 👋</h1>
          <p className="mobile__sub">Tell us who you are. This goes on the wall.</p>

          <div className="mobile__field">
            <label className="mobile__label" htmlFor="m-name">Name</label>
            <input
              id="m-name"
              className="mobile__input"
              type="text"
              placeholder="Your name"
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mobile__field">
            <label className="mobile__label" htmlFor="m-role">Role</label>
            <input
              id="m-role"
              className="mobile__input"
              type="text"
              placeholder='e.g. "Founder", "Product Manager at Acme"'
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <button
            className="mobile__btn mobile__btn--primary"
            onClick={submitName}
            disabled={!name.trim() || !role.trim()}
          >
            Next →
          </button>
        </div>
      )}

      {screen === 'interest' && (
        <div className="mobile__screen">
          <h1 className="mobile__title">
            {attendeeId ? 'Update your topic' : 'What do you want to talk about?'}
          </h1>
          <p className="mobile__sub">
            One line. It goes on the big screen.
          </p>

          <div className="mobile__field">
            <textarea
              className="mobile__textarea"
              placeholder="e.g. shipping agents to production, evals, MCP..."
              maxLength={140}
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              autoFocus
              rows={3}
            />
            <div className="mobile__counter">{interest.length} / 140</div>
          </div>

          <div className="mobile__chips">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="mobile__chip"
                onClick={() => appendSuggestion(s)}
              >
                + {s}
              </button>
            ))}
          </div>

          <div className="mobile__actions">
            <button
              className="mobile__btn mobile__btn--ghost"
              onClick={submitInterestForm}
            >
              Skip
            </button>
            <button
              className="mobile__btn mobile__btn--primary"
              onClick={submitInterestForm}
            >
              {attendeeId ? 'Save' : "I'm in →"}
            </button>
          </div>
        </div>
      )}

      {screen === 'done' && (
        <div className="mobile__screen mobile__screen--done">
          <ClaudeCharacter size="large" />
          <h1 className="mobile__title">You're in the room 🎉</h1>
          <p className="mobile__sub">Look at the big screen. You're on the wall.</p>

          {interest && (
            <div className="mobile__pill">
              <span className="mobile__pill-label">Your topic</span>
              <span className="mobile__pill-text">{interest}</span>
            </div>
          )}

          <div className="mobile__photo">
            {existing?.photoUrl ? (
              <img src={existing.photoUrl} alt="You" className="mobile__photo-preview" />
            ) : (
              <div className="mobile__photo-placeholder">📸</div>
            )}
            <label className="mobile__btn mobile__btn--ghost mobile__photo-btn">
              {uploading ? 'Uploading…' : existing?.photoUrl ? 'Change photo' : 'Add your photo (optional)'}
              <input
                type="file"
                accept="image/*"
                capture="user"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
                disabled={uploading}
              />
            </label>
            {uploadError && <p className="mobile__photo-error">{uploadError}</p>}
            <p className="mobile__photo-hint">Your face will appear on the big-screen room.</p>
          </div>

          <div className="mobile__share">
            <p className="mobile__share-label">Share with someone next to you</p>
            <div className="mobile__qr">
              <QRCodeSVG
                value={typeof window !== 'undefined' ? `${window.location.origin}/join` : '/join'}
                size={160}
                bgColor="transparent"
                fgColor="#e8e0d8"
                level="M"
              />
            </div>
          </div>

          <button className="mobile__btn mobile__btn--ghost" onClick={editInterest}>
            Edit my topic
          </button>
        </div>
      )}
    </div>
  );
}
