import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { SERVER_URL } from '@/constants/config';
import type { Lead } from '@/types/lead';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseLeadsReturn {
  leads: Lead[];
  status: ConnectionStatus;
  newLeadId: string | null;
  sendTestLead: () => void;
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [newLeadId, setNewLeadId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const handleNewLead = useCallback((lead: Lead) => {
    setLeads((prev) => {
      if (prev.some((l) => l.id === String(lead.id))) return prev;
      return [{ ...lead, id: String(lead.id) }, ...prev];
    });
    setNewLeadId(String(lead.id));
    setTimeout(() => setNewLeadId(null), 3000);
  }, []);

  useEffect(() => {
    console.log(`[Socket.IO] Connecting to ${SERVER_URL}...`);

    const socket = io(SERVER_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected', socket.id);
      setStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
      setStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket.IO] Connection error:', err.message);
      setStatus('error');
    });

    socket.on('reconnect', () => {
      console.log('[Socket.IO] Reconnected');
      setStatus('connected');
    });

    socket.on('newLead', handleNewLead);

    return () => {
      socket.off('newLead', handleNewLead);
      socket.disconnect();
    };
  }, [handleNewLead]);

  const sendTestLead = useCallback(async () => {
    try {
      await fetch(`${SERVER_URL}/test-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (err) {
      const socket = socketRef.current;
      if (socket) {
        const testLead: Lead = {
          id: `test_${Date.now()}`,
          pageId: 'test_page',
          formId: 'test_form',
          adName: 'Test Lead Ad',
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          phone: '+91 98765 43210',
          city: 'Mumbai',
          createdAt: new Date().toISOString(),
          receivedAt: new Date().toISOString(),
          isTest: true,
        };
        handleNewLead(testLead);
      }
    }
  }, [handleNewLead]);

  return { leads, status, newLeadId, sendTestLead };
}
