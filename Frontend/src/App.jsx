import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from './socket';
import { Lock, Unlock, AlertTriangle, CheckCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function App() {
  const [tickets, setTickets] = useState([]);
  const [liveLocks, setLiveLocks] = useState({});
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentAgent, setCurrentAgent] = useState('');
  const [activeEditingTicket, setActiveEditingTicket] = useState(null);

  useEffect(() => {
    const randomAgentName = `Agent_${Math.floor(Math.random() * 1000)}`;
    setCurrentAgent(randomAgentName);

    // 1. Fetch initial live tickets via standard REST route
    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/tickets`);
        if (response.data.success) setTickets(response.data.data);
      } catch (err) {
        console.error("REST API hydration failed:", err);
      }
    };
    fetchTickets();

    // 2. Start global socket lifecycle connection
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      socket.emit('join_dashboard');
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onCurrentLocks(locksData) {
      setLiveLocks(locksData);
    }

    function onTicketLocked({ ticket_id, agent_name }) {
      setLiveLocks((prev) => ({ ...prev, [ticket_id]: { agent_name } }));
    }

    function onTicketUnlocked({ ticket_id }) {
      setLiveLocks((prev) => {
        const updated = { ...prev };
        delete updated[ticket_id];
        return updated;
      });
    }

    // Connect lifecycle bindings safely
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('current_locks', onCurrentLocks);
    socket.on('ticket_locked', onTicketLocked);
    socket.on('ticket_unlocked', onTicketUnlocked);

    // Cleanup events listeners for avoid dual execution traps in React StrictMode
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('current_locks', onCurrentLocks);
      socket.off('ticket_locked', onTicketLocked);
      socket.off('ticket_unlocked', onTicketUnlocked);
      socket.disconnect();
    };
  }, []);

  // Action methods to lock and unlock active rows
  const handleLockClick = (ticket_id) => {
    socket.emit('lock_ticket', { ticket_id, agent_name: currentAgent });
    setActiveEditingTicket(ticket_id);
  };

  const handleUnlockClick = (ticket_id) => {
    socket.emit('unlock_ticket', { ticket_id });
    setActiveEditingTicket(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-6">
      {!isConnected && (
        <div className="bg-red-600 text-white p-3 rounded-md mb-6 flex items-center gap-2 font-bold animate-pulse">
          <AlertTriangle size={20} />
          <span>Connection Lost: Reconnecting to RapidDispatch Live Ops Network...</span>
        </div>
      )}

      <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Live Ops Helpdesk Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Client: Marcus Thorne | RapidDispatch Freight & Logistics</p>
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-sm">
          Active Identity: <span className="text-yellow-400 font-mono font-bold">{currentAgent}</span>
        </div>
      </header>

      <main className="grid gap-4">
        {tickets.map((ticket) => {
          const lockInfo = liveLocks[ticket.ticket_id];
          const isRowLockedBySomeoneElse = lockInfo && lockInfo.agent_name !== currentAgent;
          const isRowLockedByMe = lockInfo && lockInfo.agent_name === currentAgent;

          return (
            <div
              key={ticket.ticket_id}
              className={`p-5 rounded-xl transition-all duration-200 border flex items-center justify-between ${isRowLockedBySomeoneElse
                ? 'bg-gray-800/40 border-gray-800 opacity-60'
                : isRowLockedByMe
                  ? 'bg-gray-800 border-yellow-500/50 shadow-md shadow-yellow-500/5'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm bg-gray-700 px-2 py-0.5 rounded text-gray-300">{ticket.ticket_id}</span>
                  <h3 className="font-semibold text-lg text-white">{ticket.customer}</h3>
                </div>
                <p className="text-gray-400 text-sm">{ticket.issue}</p>

                {lockInfo && (
                  <div className="flex items-center gap-1.5 text-xs font-medium mt-2 text-yellow-400">
                    <Lock size={12} />
                    <span>Locked by: {lockInfo.agent_name} {isRowLockedByMe && '(You)'}</span>
                  </div>
                )}
              </div>

              <div>
                {isRowLockedBySomeoneElse ? (
                  <button disabled className="px-4 py-2 bg-gray-700 text-gray-500 font-medium rounded-lg flex items-center gap-2 cursor-not-allowed text-sm">
                    <Lock size={16} /> Edit Locked
                  </button>
                ) : isRowLockedByMe ? (
                  <button
                    onClick={() => handleUnlockClick(ticket.ticket_id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all shadow text-sm"
                  >
                    <CheckCircle size={16} /> Save & Release
                  </button>
                ) : (
                  <button
                    onClick={() => handleLockClick(ticket.ticket_id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all shadow text-sm"
                  >
                    <Unlock size={16} /> Open for Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

export default App;