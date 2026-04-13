import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groupService, expenseService, balanceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ExpenseList from '../Expenses/ExpenseList';
import AddExpenseModal from '../Expenses/AddExpenseModal';
import BalanceView from '../Balances/BalanceView';
import AddMemberModal from './AddMemberModal';
import './Groups.css';

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [tab, setTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        groupService.getById(id),
        expenseService.getByGroup(id),
        balanceService.getByGroup(id),
      ]);
      setGroup(groupRes.data.group);
      setExpenses(expenseRes.data.expenses);
      setBalances(balanceRes.data.settlements);
    } catch (err) {
      setError('Failed to load group data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExpenseAdded = (expense) => {
    setExpenses((prev) => [expense, ...prev]);
    setShowExpenseModal(false);
    balanceService.getByGroup(id).then(({ data }) => setBalances(data.settlements));
  };

  const handleExpenseDeleted = (expenseId) => {
    setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
    balanceService.getByGroup(id).then(({ data }) => setBalances(data.settlements));
  };

  const handleMemberAdded = (updatedGroup) => {
    setGroup(updatedGroup);
    setShowMemberModal(false);
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const myExpenses = expenses.filter((e) => e.paidBy._id === user._id);
  const myTotal = myExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) return <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;
  if (error) return <div className="page"><div className="error-msg">{error}</div></div>;
  if (!group) return null;

  const isCreator = group.createdBy._id === user._id;

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/groups">Groups</Link>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 2l5 5-5 5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>{group.name}</span>
      </div>

      <div className="group-detail-header">
        <div className="group-detail-info">
          <div className="group-detail-icon">{group.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <h1>{group.name}</h1>
            {group.description && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{group.description}</p>}
          </div>
        </div>
        <div className="group-actions">
          {isCreator && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
              + Add member
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseModal(true)}>
            + Add expense
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total spent</span>
          <span className="stat-value">₹{totalSpent.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">You paid</span>
          <span className="stat-value">₹{myTotal.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Members</span>
          <span className="stat-value">{group.members.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Expenses</span>
          <span className="stat-value">{expenses.length}</span>
        </div>
      </div>

      {/* Members strip */}
      <div className="members-strip">
        {group.members.map((m) => (
          <div key={m._id} className="member-chip" title={m.email}>
            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
              {m.name.slice(0, 2).toUpperCase()}
            </div>
            <span>{m.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>
          Expenses
          <span className="tab-count">{expenses.length}</span>
        </button>
        <button className={`tab-btn ${tab === 'balances' ? 'active' : ''}`} onClick={() => setTab('balances')}>
          Balances
          {balances.length > 0 && <span className="tab-count tab-count-red">{balances.length}</span>}
        </button>
      </div>

      {tab === 'expenses' && (
        <ExpenseList
          expenses={expenses}
          currentUser={user}
          onDeleted={handleExpenseDeleted}
        />
      )}
      {tab === 'balances' && (
        <BalanceView settlements={balances} currentUser={user} />
      )}

      {showExpenseModal && (
        <AddExpenseModal
          group={group}
          onClose={() => setShowExpenseModal(false)}
          onAdded={handleExpenseAdded}
        />
      )}
      {showMemberModal && (
        <AddMemberModal
          group={group}
          onClose={() => setShowMemberModal(false)}
          onAdded={handleMemberAdded}
        />
      )}
    </div>
  );
}
