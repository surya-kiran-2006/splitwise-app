import React, { useState } from 'react';
import { groupService } from '../../services/api';
import Modal from '../Layout/Modal';

export default function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', memberEmails: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const emails = form.memberEmails
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      const { data } = await groupService.create({
        name: form.name.trim(),
        description: form.description.trim(),
        memberEmails: emails,
      });
      onCreated(data.group);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create a new group" onClose={onClose}>
      {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Group name *</label>
          <input name="name" type="text" className="form-input"
            value={form.name} onChange={handleChange}
            placeholder="e.g. Goa Trip, Flat Expenses" required autoFocus />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input name="description" type="text" className="form-input"
            value={form.description} onChange={handleChange}
            placeholder="Optional description" />
        </div>

        <div className="form-group">
          <label>Invite members by email</label>
          <input name="memberEmails" type="text" className="form-input"
            value={form.memberEmails} onChange={handleChange}
            placeholder="alice@email.com, bob@email.com" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Separate multiple emails with commas. Only existing users will be added.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create group'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
