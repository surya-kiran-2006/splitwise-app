import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { groupService } from '../../services/api';
import CreateGroupModal from './CreateGroupModal';
import './Groups.css';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await groupService.getAll();
      setGroups(data.groups);
    } catch (err) {
      setError('Failed to load groups.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setShowModal(false);
  };

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Your groups</h1>
          <p className="page-subtitle">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New group
        </button>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

      {groups.length === 0 ? (
        <div className="card empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#94a3b8" strokeWidth="2" />
            <path d="M16 24h16M24 16v16" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No groups yet</h3>
          <p>Create a group to start splitting expenses with friends.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
            Create your first group
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <Link to={`/groups/${group._id}`} key={group._id} className="group-card card">
              <div className="group-card-icon">
                {group.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="group-card-body">
                <h3>{group.name}</h3>
                {group.description && <p className="group-description">{group.description}</p>}
                <div className="group-meta">
                  <span className="badge badge-gray">
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                  </span>
                  <span className="group-date">
                    {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <svg className="group-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M6 3l6 6-6 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}
