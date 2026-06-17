import React, { useState, useEffect } from 'react';
import Treemap from './components/Treemap';

// Define the Job interface
export interface JobData {
  id: string;
  name: string;
  sector: string;
  state: string;
  employment: number;
  wage: number;
  growth: number;
  ai_exposure: number;
  ai_rationale: string;
  [key: string]: any;
}

function App() {
  const [data, setData] = useState<JobData[]>([]);
  const [metric, setMetric] = useState('ai_exposure');
  const [selectedState, setSelectedState] = useState('All India');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [hoveredJob, setHoveredJob] = useState<JobData | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  // For zoom state, we can pass it down to Treemap or handle it inside Treemap.
  // We'll let Treemap handle its own zoom state, but App needs to be aware if we want a generic "Back" button, 
  // or we can put the "Back" button inside Treemap. Let's put the back button in Treemap for better encapsulation.

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then((jsonData: JobData[]) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading data", err);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    const filteredData = data.filter(d => d.state === selectedState);
    if (!filteredData.length) return;
    
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map(d => {
      return Object.values(d).map(val => {
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `india_jobs_${selectedState.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
    if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return '₹' + formatNumber(num);
  };

  const uniqueStates = Array.from(new Set(data.map(d => d.state))).sort();
  const filteredData = data.filter(d => d.state === selectedState);

  const handleHover = (job: JobData | null, x: number, y: number) => {
    setHoveredJob(job);
    setHoverPos({ x, y });
  };

  // Prevent tooltip from overflowing viewport
  const tooltipStyle: React.CSSProperties = {
    left: hoverPos.x + 15,
    top: hoverPos.y + 15,
  };
  
  // Basic boundary check (assuming 340px width and ~200px height for tooltip)
  if (hoverPos.x > window.innerWidth - 380) {
    tooltipStyle.left = hoverPos.x - 360;
  }
  if (hoverPos.y > window.innerHeight - 250) {
    tooltipStyle.top = hoverPos.y - 250;
  }

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <div>
            <h1>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
              India Job Market Visualizer
            </h1>
            <p className="subtitle">Exploring employment, wages, and AI exposure across Indian occupations based on NCO classifications.</p>
          </div>
          <button className="btn btn-primary" onClick={handleDownload}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download CSV
          </button>
        </div>
        
        <div className="controls">
          <div className="control-group">
            <label>Color Metric</label>
            <select value={metric} onChange={e => setMetric(e.target.value)}>
              <option value="ai_exposure">Digital AI Exposure (0-10)</option>
              <option value="wage">Median Annual Wage (INR)</option>
              <option value="growth">Projected Growth (%)</option>
            </select>
          </div>
          <div className="control-group">
            <label>State</label>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)}>
              {uniqueStates.map(state => (
                 <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="control-group" style={{ flexGrow: 1, maxWidth: '300px' }}>
            <label>Search Occupation</label>
            <input 
              type="text" 
              placeholder="e.g. Developer, Farmer..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loading">Loading Indian labour data...</div>
        ) : (
          <Treemap 
            data={filteredData} 
            metric={metric} 
            searchQuery={searchQuery}
            onHover={handleHover} 
          />
        )}

        {/* Legend */}
        <div className="legend">
          <div className="legend-title">{metric === 'ai_exposure' ? 'AI Exposure' : metric === 'wage' ? 'Wage' : 'Growth'}</div>
          <div className="legend-gradient" style={{
            background: metric === 'ai_exposure' ? 'linear-gradient(to right, #0d0887, #7e03a8, #cc4778, #f89540, #f0f921)' :
                        metric === 'wage' ? 'linear-gradient(to right, #440154, #31688e, #35b779, #fde725)' :
                        'linear-gradient(to right, #d73027, #fee090, #e0f3f8, #4575b4)' // RdYlBu (low to high)
          }}></div>
          <div className="legend-labels">
            <span>{metric === 'ai_exposure' ? '0 (Low)' : metric === 'wage' ? 'Low' : 'Decline'}</span>
            <span>{metric === 'ai_exposure' ? '10 (High)' : metric === 'wage' ? 'High' : 'High'}</span>
          </div>
        </div>

        {/* Dynamic Detail Panel */}
        <div className={`detail-panel ${hoveredJob ? 'visible' : ''}`} style={tooltipStyle}>
          {hoveredJob && (
            <>
              <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="detail-sector">{hoveredJob.sector}</div>
                  <div className="detail-title">{hoveredJob.name}</div>
                </div>
                <button 
                  onClick={() => setHoveredJob(null)}
                  style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="detail-grid">
                <div className="stat-box">
                  <div className="stat-label">Employment ({selectedState})</div>
                  <div className="stat-value">{formatNumber(hoveredJob.employment)}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Annual Wage</div>
                  <div className="stat-value">{formatCurrency(hoveredJob.wage)}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Projected Growth</div>
                  <div className="stat-value" style={{color: hoveredJob.growth >= 0 ? '#4ade80' : '#f87171'}}>
                    {hoveredJob.growth > 0 ? '+' : ''}{hoveredJob.growth}%
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">AI Exposure Score</div>
                  <div className="stat-value" style={{color: '#a5b4fc'}}>{hoveredJob.ai_exposure}/10</div>
                </div>
              </div>

              <div className="detail-rationale">
                <strong>LLM AI Exposure Rationale:</strong><br/>
                {hoveredJob.ai_rationale}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
