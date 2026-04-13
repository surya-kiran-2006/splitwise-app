import React, { useState } from 'react';
import { expenseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../Layout/Modal';

export default function AddExpenseModal({ group, onClose, onAdded }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    description: '',
    amount: '',
    paidBy: user._id,
    splitBetween: group.members.map((m) => m._id),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (memberId) => {
    setForm((prev) => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(memberId)
        ? prev.splitBetween.filter((id) => id !== memberId)
        : [...prev.splitBetween, memberId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.splitBetween.length === 0) {
      return setError('Select at least one person to split with.');
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await expenseService.create({
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        groupId: group._id,
        paidBy: form.paidBy,
        splitBetween: form.splitBetween,
      });
      onAdded(data.expense);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  const share = form.splitBetween.length > 0 && form.amount
    ? (parseFloat(form.amount) / form.splitBetween.length).toFixed(2)
    : null;

  return (
    <Modal title="Add an expense" onClose={onClose}>
      {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Description *</label>
          <input name="description" type="text" className="form-input"
            value={form.description} onChange={handleChange}
            placeholder="e.g. Dinner at restaurant" required autoFocus />
        </div>

        <div className="form-group">
          <label>Amount (₹) *</label>
          <input name="amount" type="number" step="0.01" min="0.01"
            className="form-input" value={form.amount} onChange={handleChange}
            placeholder="0.00" required />
        </div>

        <div className="form-group">
          <label>Paid by</label>
          <select name="paidBy" className="form-input" value={form.paidBy} onChange={handleChange}>
            {group.members.map((m) => (
              <option key={m._id} value={m._id}>
                {m._id === user._id ? `You (${m.name})` : m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Split between</label>
          <div className="split-members">
            {group.members.map((m) => {
              const checked = form.splitBetween.includes(m._id);
              return (
                <label key={m._id} className={`split-member-chip ${checked ? 'selected' : ''}`}>
                  <input type="checkbox" checked={checked}
                    onChange={() => toggleMember(m._id)} style={{ display: 'none' }} />
                  <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span>{m._id === user._id ? 'You' : m.name.split(' ')[0]}</span>
                </label>
              );
            })}
          </div>
          {share && (
            <p style={{ fontSize: 13, color: 'var(--brand)', marginTop: 6 }}>
              ₹{share} per person ({form.splitBetween.length} people)
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Add expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
