import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import './App.css';

const API_BASE = 'http://localhost:8080/api';

function App() {
  const [authState, setAuthState] = useState('LOGIN'); 
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState(''); 
  const [authUserId, setAuthUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [step, setStep] = useState('SETUP');
  const [stepHistory, setStepHistory] = useState([]);
  const [matchId, setMatchId] = useState(null);
  const [matchData, setMatchData] = useState(null);

  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [playerLimit, setPlayerLimit] = useState(5);
  const [maxOvers, setMaxOvers] = useState(2); 

  // --- PLAYER SLOTS STATE (Fetched from Backend) ---
  const [playersList, setPlayersList] = useState([]);
  
  // Player Form States
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pRole, setPRole] = useState('Batsman');
  const [pMatches, setPMatches] = useState('');

  // Global Pool dynamically generated from playersList
  const globalPool = playersList.map(p => p.name);

  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  
  const [tossWinnerLocal, setTossWinnerLocal] = useState('');
  const [coinFlipResult, setCoinFlipResult] = useState('');

  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  const [outPlayers, setOutPlayers] = useState([]); 
  const [lastBowler, setLastBowler] = useState('');
  const [currentOver, setCurrentOver] = useState(0);

  const [scorecard, setScorecard] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [savedTeams, setSavedTeams] = useState([]);

  const [runAnimation, setRunAnimation] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch match history on Dashboard load
  useEffect(() => {
    if (step === 'DASHBOARD' && authUserId) {
        fetch(`${API_BASE}/matches/history/${authUserId}`)
            .then(res => res.json())
            .then(data => setMatchHistory(data))
            .catch(err => console.error("History fetch error:", err));
    }
  }, [step, authUserId]);

  // Fetch saved teams from backend
  useEffect(() => {
    if (authUserId) {
      fetch(`${API_BASE}/teams/${authUserId}`)
        .then(res => res.json())
        .then(data => setSavedTeams(data))
        .catch(err => console.error("Teams fetch error:", err));
    }
  }, [authUserId]);

  // Fetch players from backend on login
  useEffect(() => {
    if (authUserId) {
      fetch(`${API_BASE}/players/user/${authUserId}`)
        .then(res => res.json())
        .then(data => setPlayersList(data))
        .catch(err => console.error("Players fetch error:", err));
    }
  }, [authUserId]);

  const triggerAnimation = (type) => {
    setRunAnimation(type);
    setTimeout(() => setRunAnimation(null), 2500); 
  };

  // --- AUTHENTICATION ---
  const handleRegister = async () => {
    if (!authUsername || !authPassword || !authPhone) return alert("Please fill all fields!");
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword, phoneNumber: authPhone })
      });
      if (response.ok) {
        alert("Registration Successful! Please log in.");
        setAuthState('LOGIN'); setAuthPassword('');
      } else {
        const errData = await response.json(); alert(errData.message || "Registration failed!");
      }
    } catch (err) { alert("Backend connection error."); }
  };

  const handleLogin = async () => {
    if (!authUsername || !authPassword) return alert("Please fill all fields!");
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      if (response.ok) {
        const data = await response.json();
        setAuthUserId(data.userId); 
        setAuthState('AUTHENTICATED'); setStep('DASHBOARD'); 
      } else { alert("Invalid Username or Password!"); }
    } catch (err) { alert("Backend connection error."); }
  };

  // --- PLAYER MANAGEMENT LOGIC ---
  const savePlayer = async () => {
    if(!pName || !pPhone) return alert("Name and Phone are required!");
    try {
      if(editingPlayerId) {
        // Update existing player
        const response = await fetch(`${API_BASE}/players/${editingPlayerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authUserId, name: pName, phone: pPhone, role: pRole, matchesPlayed: Number(pMatches) })
        });
        const updatedPlayer = await response.json();
        setPlayersList(playersList.map(p => p.id === editingPlayerId ? updatedPlayer : p));
      } else {
        // Save new player
        const response = await fetch(`${API_BASE}/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authUserId, name: pName, phone: pPhone, role: pRole, matchesPlayed: Number(pMatches) || 0 })
        });
        const newPlayer = await response.json();
        setPlayersList([...playersList, newPlayer]);
      }
      resetPlayerForm();
      alert(editingPlayerId ? "Player updated successfully!" : "Player saved successfully!");
    } catch (err) {
      alert("Error saving player: " + err.message);
    }
  };

  const editPlayer = (player) => {
    setEditingPlayerId(player.id); setPName(player.name); setPPhone(player.phone); setPRole(player.role); setPMatches(player.matchesPlayed);
  };

  const deletePlayer = async (id) => {
    if(window.confirm("Are you sure you want to delete this player?")) {
      try {
        await fetch(`${API_BASE}/players/${id}`, { method: 'DELETE' });
        setPlayersList(playersList.filter(p => p.id !== id));
        alert("Player deleted successfully!");
      } catch (err) {
        alert("Error deleting player: " + err.message);
      }
    }
  };

  const resetPlayerForm = () => {
    setEditingPlayerId(null); setPName(''); setPPhone(''); setPRole('Batsman'); setPMatches('');
  };

  // --- NAVIGATION ---
  const handleBack = () => {
    const stepFlow = {
      'SETUP': 'DASHBOARD',
      'PLAYERS': 'SETUP',
      'PLAYER_SLOTS': 'DASHBOARD',
      'HISTORY': 'DASHBOARD',
      'TOSS_CALL': 'PLAYERS',
      'TOSS_DECIDE': 'TOSS_CALL',
      'OPENING_PLAYERS': 'TOSS_DECIDE',
      'LIVE': 'OPENING_PLAYERS',
    };
    const previousStep = stepFlow[step] || 'DASHBOARD';
    setStep(previousStep);
    setMatchId(null);
  };

  // --- MATCH SETUP LOGIC ---
  const handlePoolSelection = (player, team) => {
    if (team === 'A') {
      if (teamAPlayers.includes(player)) setTeamAPlayers(teamAPlayers.filter(p => p !== player));
      else if (teamAPlayers.length < playerLimit) setTeamAPlayers([...teamAPlayers, player]);
      else alert(`Max ${playerLimit} players allowed per team!`);
    } else {
      if (teamBPlayers.includes(player)) setTeamBPlayers(teamBPlayers.filter(p => p !== player));
      else if (teamBPlayers.length < playerLimit) setTeamBPlayers([...teamBPlayers, player]);
      else alert(`Max ${playerLimit} players allowed per team!`);
    }
  };

  const handlePlayersSubmit = async () => {
    if (teamAPlayers.length < playerLimit || teamBPlayers.length < playerLimit) {
      const wantsToAdd = window.confirm(
        `Please select exactly ${playerLimit} players for both teams!\n\nCurrently Selected -> Team A: ${teamAPlayers.length}, Team B: ${teamBPlayers.length}\n\nDo you want to switch to the 'Player Profiles' section to add more players?`
      );
      if (wantsToAdd) {
        setStep('PLAYER_SLOTS'); 
      }
      return; 
    }

    try {
      // Save Team A to backend
      const teamAPayload = { 
        userId: authUserId, 
        teamName: teamAName, 
        playerNames: teamAPlayers.join(',') 
      };
      await fetch(`${API_BASE}/teams`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(teamAPayload) 
      });

      // Save Team B to backend
      const teamBPayload = { 
        userId: authUserId, 
        teamName: teamBName, 
        playerNames: teamBPlayers.join(',') 
      };
      await fetch(`${API_BASE}/teams`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(teamBPayload) 
      });

      // Proceed with match setup
      const payload = { 
        userId: authUserId, teamAName, teamBName, playerLimit, maxOvers, 
        teamAPlayers: teamAPlayers.join(','), teamBPlayers: teamBPlayers.join(',') 
      };
      const response = await fetch(`${API_BASE}/matches/setup`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const data = await response.json();
      setMatchId(data.id); setMatchData(data); setStep('TOSS_CALL'); 
    } catch (err) {
      alert("Error saving teams: " + err.message);
    }
  };

  const handleCoinFlip = (choice) => {
    const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
    setCoinFlipResult(flip);
    if (choice === flip) setTossWinnerLocal(teamAName); else setTossWinnerLocal(teamBName);
    setStep('TOSS_DECIDE'); 
  };

  const handleTossDecision = async (decision) => {
    const response = await fetch(`${API_BASE}/matches/${matchId}/start?tossWinner=${tossWinnerLocal}&decision=${decision}`, { method: 'POST' });
    const data = await response.json();
    setMatchData(data); 
    setStep('OPENING_PLAYERS'); 
  };

  // --- CORE SCORING LOGIC ---
  const updateScore = async (type, value, isWide = false, isNoBall = false) => {
    if (!striker || !bowler || !nonStriker) return alert("Select Striker, Non-Striker & Bowler!");
    if (striker === nonStriker) return alert("Striker and Non-Striker cannot be the same person!");

    if (type === 'wicket' && matchData.freeHit) {
        alert("🔥 FREE HIT ACTIVE! Wicket is not considered while Free hit is active (Not Out).\n\nSelect the Run scored by the batsman.");
        return; 
    }

    if (type === 'run' && value === 4 && !isWide && !isNoBall) triggerAnimation('FOUR');
    if (type === 'run' && value === 6 && !isWide && !isNoBall) triggerAnimation('SIX');
    if (type === 'wicket') triggerAnimation('WICKET');

    const response = await fetch(`${API_BASE}/matches/${matchId}/score?type=${type}&value=${value}&striker=${striker}&bowler=${bowler}&isWide=${isWide}&isNoBall=${isNoBall}`, { method: 'PUT' });
    const data = await response.json();

    if (type === 'run' && (value === 1 || value === 3) && !isWide && !isNoBall) {
        const temp = striker; setStriker(nonStriker); setNonStriker(temp);
    }

    if (data.status !== matchData.status && data.status === 'SECOND_INNINGS') {
        alert("Innings Break!");
        setOutPlayers([]); setLastBowler(''); setCurrentOver(0); setStriker(''); setNonStriker(''); setBowler('');
        setMatchData(data); setStep('OPENING_PLAYERS');
        return;
    }

    if (type === 'wicket') {
        setOutPlayers(prev => [...prev, striker]); 
        setStriker('');
    }

    const activeTeam = data.status === 'FIRST_INNINGS' ? data.battingFirstTeam : data.battingSecondTeam;
    const overs = activeTeam === 'TEAM_A' ? data.teamAOvers : data.teamBOvers;
    const balls = activeTeam === 'TEAM_A' ? data.teamABalls : data.teamBBalls;

    if (balls === 0 && overs > 0 && overs !== currentOver) {
        setLastBowler(bowler); setCurrentOver(overs); setBowler(''); 
        const temp = striker; setStriker(nonStriker); setNonStriker(temp);
    }

    setMatchData(data);
    if (data.status === 'FINISHED') setStep('FINISHED');
  };

  const handleUndo = async () => {
      const response = await fetch(`${API_BASE}/matches/${matchId}/undo`, { method: 'POST' });
      const data = await response.json();
      setOutPlayers([]); setLastBowler(''); setMatchData(data);
  };

  useEffect(() => {
    if ((step === 'LIVE' || step === 'FINISHED') && matchId) {
      fetch(`${API_BASE}/matches/${matchId}/stats`).then(res => res.json()).then(data => setScorecard(data));
    }
  }, [step, matchId, matchData]);

  const getBattingTeamPlayers = () => {
    if (!matchData) return [];
    return (matchData.status === 'FIRST_INNINGS' && matchData.battingFirstTeam === 'TEAM_A') || (matchData.status === 'SECOND_INNINGS' && matchData.battingSecondTeam === 'TEAM_A') ? teamAPlayers : teamBPlayers;
  };

  const getBowlingTeamPlayers = () => {
    if (!matchData) return [];
    return (matchData.status === 'FIRST_INNINGS' && matchData.battingFirstTeam === 'TEAM_B') || (matchData.status === 'SECOND_INNINGS' && matchData.battingSecondTeam === 'TEAM_B') ? teamAPlayers : teamBPlayers;
  };

  const getCurrentStrikerStats = () => scorecard.find(s => s.playerName === striker) || { runsScored: 0, ballsFaced: 0 };
  const getCurrentNonStrikerStats = () => scorecard.find(s => s.playerName === nonStriker) || { runsScored: 0, ballsFaced: 0 };

  return (
    <div className="app-container">
      {runAnimation && (
        <div className={`animation-overlay ${runAnimation.toLowerCase()}`}>
            <h1>{runAnimation === 'WICKET' ? 'WICKET!' : `${runAnimation}!`}</h1>
        </div>
      )}

      {authState === 'LOGIN' && (
        <div className="auth-card">
          <h2>🏏 CricAnalytics</h2>
          <div className="form-group">
            <input type="text" placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} />
            <div className="password-input-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <button className="primary-btn wide-btn" onClick={handleLogin}>Log In</button>
          <p className="auth-link" onClick={() => setAuthState('REGISTER')}>Don't have an account? Register here</p>
        </div>
      )}

      {authState === 'REGISTER' && (
        <div className="auth-card">
          <h2>📝 Create Account</h2>
          <div className="form-group">
            <input type="text" placeholder="Choose a Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} />
            <input type="text" placeholder="Phone Number" value={authPhone} onChange={e => setAuthPhone(e.target.value)} />
            <div className="password-input-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="Choose a Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <button className="primary-btn wide-btn" onClick={handleRegister}>Register Account</button>
          <p className="auth-link" onClick={() => setAuthState('LOGIN')}>Already have an account? Log in here</p>
        </div>
      )}

      {authState === 'AUTHENTICATED' && (
        <>
          <header className="main-header">
             <h1 className="logo-title">🏏 CricAnalytics</h1>
             <div className="header-actions">
               {step !== 'DASHBOARD' && <button className="secondary-btn btn-sm" onClick={() => { setStep('DASHBOARD'); setMatchId(null); }}>Dashboard</button>}
               <button className="logout-btn" onClick={() => { setAuthState('LOGIN'); setAuthUsername(''); setAuthPassword(''); setAuthPhone(''); setAuthUserId(null); setPlayersList([]); setStep('SETUP'); }}>Logout</button>
             </div>
          </header>

          {step === 'DASHBOARD' && (
            <div className="dashboard-view">
              <h2 className="welcome-heading">WELCOME, <span style={{textTransform: 'uppercase'}}>{authUsername}</span></h2>
              
              <div className="stats-summary-bar">
                 <div className="stat-box">
                    <h3>{matchHistory.length || 0}</h3>
                    <p>Matches Played</p>
                 </div>
                 <div className="stat-box">
                    <h3>{playersList.length}</h3>
                    <p>Registered Players</p>
                 </div>
              </div>

              <div className="dashboard-grid">
                <button className="dash-btn" onClick={() => setStep('PLAYER_SLOTS')}>👤 Player Profiles</button>
                <button className="dash-btn" onClick={() => setStep('HISTORY')}>📊 Match History</button>
                <button className="dash-btn start-btn" onClick={() => setStep('SETUP')}>⚡ Start New Match</button>
              </div>
            </div>
          )}

          {step === 'PLAYER_SLOTS' && (
            <div className="card-panel">
               <div className="section-header">
                  <button className="back-btn" onClick={handleBack}>← Back</button>
                  <h3 className="section-title">Player Profiles & Slots</h3>
               </div>
               
               <div className="setup-container">
                  <div className="setup-card" style={{gridColumn: 'span 2'}}>
                     <h4>{editingPlayerId ? 'Edit Player' : 'Add New Player'}</h4>
                     <div className="params-grid">
                        <input className="form-input" placeholder="Player Name" value={pName} onChange={e => setPName(e.target.value)} />
                        <input className="form-input" placeholder="Phone Number" value={pPhone} onChange={e => setPPhone(e.target.value)} />
                        <select className="form-select" value={pRole} onChange={e => setPRole(e.target.value)}>
                           <option value="Batsman">Batsman</option>
                           <option value="Bowler">Bowler</option>
                           <option value="All-Rounder">All-Rounder</option>
                           <option value="Wicket Keeper">Wicket Keeper</option>
                        </select>
                        <input className="form-input" type="number" placeholder="Matches Played" value={pMatches} onChange={e => setPMatches(e.target.value)} />
                     </div>
                     <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                        <button className="primary-btn" onClick={savePlayer}>{editingPlayerId ? 'Update Player' : 'Save Player'}</button>
                        {editingPlayerId && <button className="secondary-btn" onClick={resetPlayerForm}>Cancel</button>}
                     </div>
                  </div>
               </div>

               <h4 style={{marginTop: '20px', color: '#94a3b8'}}>Registered Roster ({playersList.length})</h4>
               <div className="player-list-container">
                  {playersList.map(player => (
                     <div className="player-profile-card" key={player.id}>
                        <div className="player-details">
                           <h4>{player.name} <span style={{fontSize: '12px', color: '#f59e0b', fontWeight: 'normal'}}>({player.role})</span></h4>
                           <p>📱 {player.phone} | 🏆 Matches: {player.matchesPlayed}</p>
                        </div>
                        <div className="player-actions">
                           <button className="btn-edit" onClick={() => editPlayer(player)}>Edit</button>
                           <button className="btn-delete" onClick={() => deletePlayer(player.id)}>Delete</button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {step === 'HISTORY' && (
            <div className="card-panel">
              <div className="section-header">
                <button className="back-btn" onClick={handleBack}>← Back</button>
                <h3 className="section-title">Recent Matches</h3>
              </div>
              {matchHistory.length === 0 ? (
                 <p style={{color: '#94a3b8', textAlign: 'center', padding: '20px'}}>No matches played yet.</p>
              ) : (
                 matchHistory.map((m, i) => (
                    <div className={`history-card ${m.winner === 'Match Tied' ? 'tie' : ''}`} key={i}>
                       <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                          <strong style={{color: '#fff', fontSize: '16px'}}>{m.teamAName} vs {m.teamBName}</strong>
                          <span style={{color: '#94a3b8', fontSize: '12px'}}>{m.maxOvers} Overs</span>
                       </div>
                       <div style={{color: 'var(--primary)', fontWeight: 'bold'}}>
                          Winner: {m.winner || 'In Progress'}
                       </div>
                    </div>
                 ))
              )}
            </div>
          )}

          {step === 'SETUP' && (
            <div className="card-panel">
              <div className="section-header">
                <button className="back-btn" onClick={handleBack}>← Back</button>
                <h3 className="section-title">Quick Match Setup</h3>
              </div>
              <div className="params-grid">
                <div className="param-item"><label>Players per side</label><input type="number" className="form-input" value={playerLimit} onChange={e => setPlayerLimit(e.target.value)} /></div>
                <div className="param-item"><label>Overs Per Side</label><input type="number" className="form-input" value={maxOvers} onChange={e => setMaxOvers(e.target.value)} /></div>
              </div>
              <div className="setup-container mt-20">
                <div className="setup-card">
                   <input className="form-input" type="text" value={teamAName} onChange={e => setTeamAName(e.target.value)} placeholder="Team A Name" />
                </div>
                <div className="setup-card">
                   <input className="form-input" type="text" value={teamBName} onChange={e => setTeamBName(e.target.value)} placeholder="Team B Name" />
                </div>
              </div>
              <button className="primary-btn wide-btn mt-20" onClick={() => setStep('PLAYERS')}>Select Squad</button>
            </div>
          )}

          {step === 'PLAYERS' && (
            <div className="card-panel">
              <div className="section-header">
                <button className="back-btn" onClick={handleBack}>← Back</button>
                <h3 className="section-title" style={{marginBottom: '0', borderBottom: 'none'}}>Select Teams from Global Pool</h3>
                 <button className="secondary-btn btn-sm" onClick={() => setStep('PLAYER_SLOTS')} style={{borderColor: 'var(--primary)', color: 'var(--primary)'}}>
                    + Add New Player
                 </button>
              </div>
              <p style={{fontSize: '13px', color: '#94a3b8', marginTop: '0'}}>Assign {playerLimit} players to each team.</p>
              
              <div className="pool-selection-grid">
                <div className="pool-card">
                   <h4 style={{color: '#3b82f6'}}>{teamAName} Selected ({teamAPlayers.length}/{playerLimit})</h4>
                   {globalPool.map(player => (
                     <label key={`a-${player}`} className="pool-item">
                       <input type="checkbox" checked={teamAPlayers.includes(player)} onChange={() => handlePoolSelection(player, 'A')} disabled={teamBPlayers.includes(player)} />
                       {player}
                     </label>
                   ))}
                </div>
                <div className="pool-card">
                   <h4 style={{color: '#ef4444'}}>{teamBName} Selected ({teamBPlayers.length}/{playerLimit})</h4>
                   {globalPool.map(player => (
                     <label key={`b-${player}`} className="pool-item">
                       <input type="checkbox" checked={teamBPlayers.includes(player)} onChange={() => handlePoolSelection(player, 'B')} disabled={teamAPlayers.includes(player)} />
                       {player}
                     </label>
                   ))}
                </div>
              </div>
              <button className="primary-btn wide-btn mt-20" onClick={handlePlayersSubmit}>Confirm & Toss</button>
            </div>
          )}

          {step === 'TOSS_CALL' && (
            <div className="card-panel text-center">
              <button className="back-btn" onClick={handleBack}>← Back</button>
              <h3 className="section-title">The Toss</h3>
              <div className="button-group">
                <button className="primary-btn" onClick={() => handleCoinFlip('Heads')}>Heads</button>
                <button className="primary-btn" onClick={() => handleCoinFlip('Tails')}>Tails</button>
              </div>
            </div>
          )}

          {step === 'TOSS_DECIDE' && (
            <div className="card-panel text-center">
              <button className="back-btn" onClick={handleBack}>← Back</button>
              <h3 className="section-title">Toss Result: {coinFlipResult}</h3>
              <h2 className="toss-announcement">🎉 {tossWinnerLocal} won the toss! 🎉</h2>
              <div className="button-group">
                <button className="primary-btn" onClick={() => handleTossDecision('Bat')}>Choose Batting</button>
                <button className="primary-btn" onClick={() => handleTossDecision('Bowl')}>Choose Bowling</button>
              </div>
            </div>
          )}

          {step === 'OPENING_PLAYERS' && (
            <div className="card-panel text-center">
              <button className="back-btn" onClick={handleBack}>← Back</button>
              <h3 className="section-title">Select Players</h3>
              <div className="player-selects mt-20" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="select-wrapper">
                  <label>Striker 🏏</label>
                  <select value={striker} onChange={e => setStriker(e.target.value)}>
                    <option value="">Select...</option>
                    {getBattingTeamPlayers().filter(p => !outPlayers.includes(p) && p !== nonStriker).map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="select-wrapper">
                  <label>Non-Striker 🏃‍♂️</label>
                  <select value={nonStriker} onChange={e => setNonStriker(e.target.value)}>
                    <option value="">Select...</option>
                    {getBattingTeamPlayers().filter(p => !outPlayers.includes(p) && p !== striker).map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="select-wrapper">
                  <label>Bowler 🎾</label>
                  <select value={bowler} onChange={e => setBowler(e.target.value)}>
                    <option value="">Select...</option>
                    {getBowlingTeamPlayers().map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <button className="primary-btn wide-btn mt-20" onClick={() => {
                if(!striker || !nonStriker || !bowler) return alert("Select all 3 players!");
                setStep('LIVE');
              }}>Play Ball!</button>
            </div>
          )}

          {step === 'LIVE' && matchData && (
            <div className="scoring-arena">
              <div style={{marginBottom: '16px'}}>
                <button className="back-btn" onClick={handleBack}>← Back</button>
              </div>
              <div className="live-score-bar">
                <div className="score-team-section">
                    <div className="score-player-name">{striker || "Striker"} 🏏 <span style={{fontSize: '11px', color: '#9ca3af'}}>{getCurrentStrikerStats().runsScored}({getCurrentStrikerStats().ballsFaced})</span></div>
                    <div className="score-player-name" style={{marginTop: '4px', color: '#d1d5db', fontSize: '13px'}}>{nonStriker || "Non-Striker"} 🏃‍♂️ <span style={{fontSize: '11px'}}>{getCurrentNonStrikerStats().runsScored}({getCurrentNonStrikerStats().ballsFaced})</span></div>
                </div>
                <div className="score-match-section">
                    <div className="current-total">
                        {matchData.battingFirstTeam === 'TEAM_A' ? matchData.teamAName : matchData.teamBName}
                        {' '}{matchData.status === 'FIRST_INNINGS' ? `${matchData.teamARuns}/${matchData.teamAWickets}` : `${matchData.teamBRuns}/${matchData.teamBWickets}`}
                    </div>
                    <div className="current-over">
                        Overs: {matchData.status === 'FIRST_INNINGS' ? `${matchData.teamAOvers}.${matchData.teamABalls}` : `${matchData.teamBOvers}.${matchData.teamBBalls}`}
                    </div>
                </div>
              </div>
              
              <div className="scoring-console">
                 <div className="player-selects" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div className="select-wrapper"><label>Striker</label><select value={striker} onChange={e => setStriker(e.target.value)}><option value="">Select...</option>{getBattingTeamPlayers().filter(p => !outPlayers.includes(p) && p !== nonStriker).map((p, i) => <option key={i} value={p}>{p}</option>)}</select></div>
                    <div className="select-wrapper"><label>Non-Striker</label><select value={nonStriker} onChange={e => setNonStriker(e.target.value)}><option value="">Select...</option>{getBattingTeamPlayers().filter(p => !outPlayers.includes(p) && p !== striker).map((p, i) => <option key={i} value={p}>{p}</option>)}</select></div>
                    <div className="select-wrapper"><label>Bowler</label><select value={bowler} onChange={e => setBowler(e.target.value)}><option value="">Select...</option>{getBowlingTeamPlayers().filter(p => p !== lastBowler).map((p, i) => <option key={i} value={p}>{p}</option>)}</select></div>
                 </div>

                 {matchData.freeHit && <div className="free-hit-banner">🔥 FREE HIT RUNNING 🔥</div>}

                 <div className="runs-action-deck" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    <button className="run-btn" onClick={() => updateScore('run', 0)}>0</button>
                    <button className="run-btn accent" onClick={() => updateScore('run', 1)}>1</button>
                    <button className="run-btn accent" onClick={() => updateScore('run', 2)}>2</button>
                    <button className="run-btn accent" onClick={() => updateScore('run', 3)}>3</button>
                    <button className="run-btn boundaries" onClick={() => updateScore('run', 4)}>4</button>
                    <button className="run-btn boundaries" onClick={() => updateScore('run', 6)}>6</button>
                    
                    <button className="run-btn" style={{backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b'}} onClick={() => updateScore('run', 0, true, false)}>WD</button>
                    <button className="run-btn" style={{backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b'}} onClick={() => updateScore('run', 0, false, true)}>NB</button>
                    
                    <button className="run-btn wicket" onClick={() => updateScore('wicket', 1)}>W</button>
                 </div>
                 
                 <button className="undo-btn mt-20" onClick={handleUndo}>↩ Undo Last Action</button>
              </div>

              <div className="scorecard-container">
                <h4 className="card-table-title">Batting Summary</h4>
                <table className="cric-table mb-20">
                  <thead><tr><th style={{textAlign: 'left'}}>Batsman</th><th>R</th><th>B</th></tr></thead>
                  <tbody>
                    {scorecard.filter(s => s.teamName === (matchData.status === 'FIRST_INNINGS' ? (matchData.battingFirstTeam === 'TEAM_A' ? matchData.teamAName : matchData.teamBName) : (matchData.battingSecondTeam === 'TEAM_A' ? matchData.teamAName : matchData.teamBName)))
                      .map(stat => (
                      <tr key={stat.id}>
                        <td style={{ textAlign: 'left' }}>
                          <span className="table-player-cell">{stat.playerName} {striker === stat.playerName ? '🏏' : (nonStriker === stat.playerName ? '🏃‍♂️' : '')}</span>
                          <span className={`out-status ${stat.out ? 'dismissed' : 'notout'}`}>{stat.out ? 'Out' : 'Not Out'}</span>
                        </td>
                        <td className="bold-run-count">{stat.runsScored}</td>
                        <td>{stat.ballsFaced}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'FINISHED' && matchData && (
            <div className="card-panel match-finished-panel">
              <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.15}/>
              <div className="winner-banner celebration-bounce">
                <h1 className="finished-headline">🏆 CHAMPIONS 🏆</h1>
                <h2 className="finished-winner">{matchData.winner}</h2>
              </div>
              <button className="primary-btn wide-btn mt-20" onClick={() => window.location.reload()}>Back to Dashboard</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default App;