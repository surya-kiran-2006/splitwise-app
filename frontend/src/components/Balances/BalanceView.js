import React from 'react';
import './Balances.css';

export default function BalanceView({ settlements, currentUser }) {
  if (settlements.length === 0) {
    return (
      <div className="card empty-state">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="18" stroke="#94a3b8" strokeWidth="2" />
          <path d="M14 22l6 6 10-12" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>All settled up!</h3>
        <p>No outstanding balances in this group.</p>
      </div>
    );
  }

  return (
    <div className="balance-list">
      <p className="balance-info">
        {settlements.length} outstanding balance{settlements.length !== 1 ? 's' : ''}
      </p>
      {settlements.map((s, i) => {
        const isMe = s.from._id === currentUser._id;
        const owesMe = s.to._id === currentUser._id;

        return (
          <div key={i} className={`balance-row card ${isMe ? 'balance-row-me' : ''}`}>
            <div className="balance-from">
              <div className="avatar">{s.from.name.slice(0, 2).toUpperCase()}</div>
              <div className="balance-name">
                <span className="balance-person">{isMe ? 'You' : s.from.name}</span>
                {isMe && <span className="balance-tag">you</span>}
              </div>
            </div>

            <div className="balance-middle">
              <div className="balance-arrow">
                <svg width="60" height="18" viewBox="0 0 60 18" fill="none">
                  <path d="M4 9h52M44 3l12 6-12 6" stroke={isMe ? 'var(--danger)' : owesMe ? 'var(--brand)' : 'var(--text-muted)'}
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className={`balance-amount ${isMe ? 'amount-negative' : owesMe ? 'amount-positive' : ''}`}>
                ₹{s.amount.toFixed(2)}
              </span>
            </div>

            <div className="balance-to">
              <div className="balance-name" style={{ textAlign: 'right' }}>
                <span className="balance-person">{owesMe ? 'You' : s.to.name}</span>
                {owesMe && <span className="balance-tag">you</span>}
              </div>
              <div className="avatar">{s.to.name.slice(0, 2).toUpperCase()}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
