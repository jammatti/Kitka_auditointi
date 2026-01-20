import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

type TabType = 'setup' | 'journey' | 'time' | 'ease' | 'summary';

const AuditView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('setup');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'setup', label: 'Setup' },
    { key: 'journey', label: 'Journey' },
    { key: 'time', label: 'Time' },
    { key: 'ease', label: 'Ease' },
    { key: 'summary', label: 'Summary' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'setup':
        return (
          <div className="tab-content">
            <h2>Audit Setup</h2>
            <p>Configure your audit parameters and settings.</p>
          </div>
        );
      case 'journey':
        return (
          <div className="tab-content">
            <h2>Service Journey</h2>
            <p>Map out the steps in the service delivery process.</p>
          </div>
        );
      case 'time':
        return (
          <div className="tab-content">
            <h2>Time Analysis</h2>
            <p>Analyze time spent at each step of the journey.</p>
          </div>
        );
      case 'ease':
        return (
          <div className="tab-content">
            <h2>Ease of Use</h2>
            <p>Evaluate the ease of completing each step.</p>
          </div>
        );
      case 'summary':
        return (
          <div className="tab-content">
            <h2>Summary & Insights</h2>
            <p>Review findings and identify key friction points.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="audit-view-page">
      <header>
        <h1>Audit {id || 'New'}</h1>
      </header>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <main>{renderTabContent()}</main>
    </div>
  );
};

export default AuditView;
