import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-page">
      <header>
        <h1>Dashboard</h1>
      </header>
      <main>
        <section className="dashboard-section">
          <h2>Your Audits</h2>
          <p>No audits yet. Create your first audit to get started.</p>
          <Link to="/audit/new">
            <button>Create New Audit</button>
          </Link>
        </section>
        <section className="dashboard-section">
          <h2>Recent Activity</h2>
          <p>No recent activity.</p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
