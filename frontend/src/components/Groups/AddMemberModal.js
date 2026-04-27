import React, { useState } from 'react';
import { groupService } from '../../services/api';
import Modal from '../Layout/Modal';

export default function AddMemberModal({ group, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await groupService.addMember(group._id, email.trim());
      onAdded(data.group);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add a member" onClose={onClose}>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Enter the email address of an existing SplitX user.
      </p>
      {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email address</label>
          <input type="email" className="form-input" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com" required autoFocus />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Add member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
