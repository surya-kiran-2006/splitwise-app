import React, { useState } from 'react';
import { expenseService } from '../../services/api';
import './Expenses.css';

export default function ExpenseList({ expenses, currentUser, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    setDeletingId(expenseId);
    try {
      await expenseService.delete(expenseId);
      onDeleted(expenseId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense.');
    } finally {
      setDeletingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="card empty-state">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect x="6" y="10" width="32" height="26" rx="4" stroke="#94a3b8" strokeWidth="2" />
          <path d="M14 18h16M14 24h10" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>No expenses yet</h3>
        <p>Add the first expense to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => {
        const share = expense.amount / expense.splitBetween.length;
        const iPaid = expense.paidBy._id === currentUser._id;
        const iInSplit = expense.splitBetween.some((m) => m._id === currentUser._id);

        let myNet = 0;
        if (iPaid && iInSplit) myNet = expense.amount - share;
        else if (iPaid) myNet = expense.amount;
        else if (iInSplit) myNet = -share;

        return (
          <div key={expense._id} className="expense-row card">
            <div className="expense-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="12" rx="2" stroke="var(--brand)" strokeWidth="1.5" />
                <path d="M2 9h16" stroke="var(--brand)" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="expense-body">
              <div className="expense-top">
                <span className="expense-desc">{expense.description}</span>
                <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
              </div>
              <div className="expense-meta">
                <span>Paid by <strong>{iPaid ? 'you' : expense.paidBy.name}</strong></span>
                <span className="dot">·</span>
                <span>Split {expense.splitBetween.length} ways (₹{share.toFixed(2)} each)</span>
                <span className="dot">·</span>
                <span className="expense-date">
                  {new Date(expense.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="expense-right">
              {myNet !== 0 && (
                <div className={`expense-net ${myNet > 0 ? 'positive' : 'negative'}`}>
                  {myNet > 0 ? '+' : ''}₹{Math.abs(myNet).toFixed(2)}
                </div>
              )}
              {iPaid && (
                <button
                  className="btn btn-danger btn-sm expense-delete"
                  onClick={() => handleDelete(expense._id)}
                  disabled={deletingId === expense._id}
                  title="Delete expense"
                >
                  {deletingId === expense._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M6 6v4M8 6v4M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
