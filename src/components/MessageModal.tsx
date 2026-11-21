import { X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  hostelId?: string;
  hostelName?: string;
  defaultSubject?: string;
}

export function MessageModal({
  open,
  onClose,
  recipientId,
  recipientName,
  hostelId,
  hostelName,
  defaultSubject = '',
}: MessageModalProps) {
  const { user, showToast } = useAuth();
  const [subject, setSubject] = useState(
    defaultSubject || (hostelName ? `Inquiry about ${hostelName}` : `Roommate introduction`)
  );
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!subject.trim() || !body.trim()) {
      setError('Please enter both a subject and message.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/messages', {
        recipientId,
        hostelId,
        subject: subject.trim(),
        body: body.trim(),
      });
      showToast(`Message sent to ${recipientName}.`, 'success');
      setBody('');
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not send message.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="message-modal-title" className="font-display text-lg font-bold text-[#142B4A]">
              Message {recipientName}
            </h2>
            {hostelName && (
              <p className="text-xs text-slate-500 mt-0.5">Regarding: {hostelName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label="Close message dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!user ? (
          <div className="py-4 space-y-3 text-sm text-slate-600">
            <p>Please sign in to send direct messages to hostel owners and potential roommates.</p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66]"
            >
              Sign In to Continue
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Introduce yourself, university, preferred move-in date, or questions..."
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
