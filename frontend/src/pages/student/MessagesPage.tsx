import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Message } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Lock, 
  User, 
  CheckCheck,
  Building,
  Info,
  Loader2,
  FolderOpen
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetCaseId = searchParams.get('caseId');
  const targetMatchId = searchParams.get('matchId');

  const { studentUser, user } = useAuth();
  const currentUser = studentUser || user;
  const [cases, setCases] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeCaseId, setActiveCaseId] = useState<string>('');
  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // Load active verification / handover cases
  useEffect(() => {
    async function loadCases() {
      try {
        const caseList = await api.verification.listCases();
        if (Array.isArray(caseList) && caseList.length > 0) {
          setCases(caseList);
          if (targetCaseId) {
            const found = caseList.find(c => c.id === targetCaseId || c.case_id === targetCaseId);
            setActiveCaseId(found ? (found.id || found.case_id) : (caseList[0].id || caseList[0].case_id));
          } else if (targetMatchId) {
            const found = caseList.find(c => c.matchId === targetMatchId || c.match_id === targetMatchId);
            setActiveCaseId(found ? (found.id || found.case_id) : (caseList[0].id || caseList[0].case_id));
          } else {
            setActiveCaseId(caseList[0].id || caseList[0].case_id || '');
          }
        } else {
          // If no formal verification case yet, use fallback active case identifier
          setActiveCaseId('c-nie-general');
        }
      } catch (err) {
        console.warn('Failed to load verification cases:', err);
        setActiveCaseId('c-nie-general');
      } finally {
        setLoadingCases(false);
      }
    }
    loadCases();
  }, [targetCaseId, targetMatchId]);

  // Load messages for selected case
  useEffect(() => {
    if (!activeCaseId) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const data = await api.messages.getCaseMessages(activeCaseId);
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (err) {
        console.warn('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadMessages();
  }, [activeCaseId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeCaseId) return;

    const content = inputMessage.trim();
    setInputMessage('');

    // Optimistic message
    const tempMsg: Message = {
      id: `msg-${Date.now()}`,
      caseId: activeCaseId,
      senderId: currentUser?.id || 'std-1',
      senderName: currentUser?.fullName || currentUser?.name || 'Student',
      senderRole: 'CLAIMANT',
      content,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await api.messages.send(activeCaseId, content);
      if (res) {
        // Refresh with server record
        const fresh = await api.messages.getCaseMessages(activeCaseId);
        if (Array.isArray(fresh)) {
          setMessages(fresh);
        }
      }
    } catch (err) {
      console.warn('Failed to persist message to backend:', err);
    }
  };

  const caseMessages = messages.filter(m => m.caseId === activeCaseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Protected In-App Recovery Chat</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Recovery Communications
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Encrypted case messaging between claimant, finder, and NIE Proctor Office.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Case Threads */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-sahayak-text-muted">
            Active Handover Cases ({cases.length})
          </h3>

          {cases.length === 0 ? (
            <NeumorphicCard
              className={`p-4 border transition-all cursor-pointer ${
                activeCaseId === 'c-nie-general'
                  ? 'border-sahayak-blue bg-sahayak-cream-soft shadow-neumorph-sm'
                  : 'border-sahayak-brown/10'
              }`}
              onClick={() => setActiveCaseId('c-nie-general')}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sahayak-blue-ice text-sahayak-blue">
                    Case #NIE-GENERAL
                  </span>
                  <h4 className="font-heading font-bold text-sm text-sahayak-text-primary">
                    Proctor Office Desk
                  </h4>
                  <p className="text-xs text-sahayak-text-muted">Direct Support & Inquiries</p>
                </div>
                <span className="text-[10px] text-sahayak-text-muted font-mono">Live</span>
              </div>
            </NeumorphicCard>
          ) : (
            cases.map((cs) => {
              const cId = cs.id || cs.case_id;
              const isSelected = activeCaseId === cId;
              return (
                <NeumorphicCard
                  key={cId}
                  className={`p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sahayak-blue bg-sahayak-cream-soft shadow-neumorph-sm'
                      : 'border-sahayak-brown/10'
                  }`}
                  onClick={() => setActiveCaseId(cId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sahayak-blue-ice text-sahayak-blue">
                        Case #{cId.slice(0, 8)}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-sahayak-text-primary">
                        {cs.item_title || cs.itemTitle || `Case ${cId.slice(0, 6)}`}
                      </h4>
                      <p className="text-xs text-sahayak-text-muted">Status: {cs.status || 'Active'}</p>
                    </div>
                  </div>
                </NeumorphicCard>
              );
            })
          )}
        </div>

        {/* Right 2 Cols: Chat Window */}
        <NeumorphicCard className="lg:col-span-2 flex flex-col h-[520px] border border-sahayak-brown/15 shadow-neumorph p-0 overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-sahayak-brown/10 bg-sahayak-cream flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sahayak-blue-deep text-sahayak-gold flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-sahayak-text-primary">
                  Noise ColorFit Pro 4 (Case #{activeCaseId})
                </h3>
                <p className="text-[11px] text-sahayak-success font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sahayak-success" />
                  Proctor Verified Room • Safe Channel
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-sahayak-text-muted">NIE North Station</span>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="px-4 py-2 bg-sahayak-blue-ice/30 border-b border-sahayak-blue-sky/20 flex items-center gap-2 text-[11px] text-sahayak-text-secondary">
            <Info className="w-3.5 h-3.5 text-sahayak-blue shrink-0" />
            <span>Personal phone numbers and emails are masked to protect student privacy.</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-sahayak-cream-soft/40">
            {caseMessages.map((msg) => {
              const isMe = msg.senderId === (studentUser?.id || 'std-1');
              const isProctor = msg.senderRole === 'PROCTOR_ADMIN';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-sahayak-text-muted">
                      {msg.senderName} ({msg.senderRole})
                    </span>
                    <span className="text-[10px] text-sahayak-text-muted">{msg.timestamp.slice(11)}</span>
                  </div>

                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-neumorph-sm ${
                      isMe
                        ? 'bg-sahayak-blue text-white rounded-tr-none'
                        : isProctor
                        ? 'bg-sahayak-blue-deep text-sahayak-gold rounded-tl-none border border-sahayak-gold/30'
                        : 'bg-sahayak-cream border border-sahayak-brown/15 text-sahayak-text-primary rounded-tl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-sahayak-brown/10 bg-sahayak-cream flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sahayak-blue text-white font-bold text-xs shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </NeumorphicCard>
      </div>
    </div>
  );
};
