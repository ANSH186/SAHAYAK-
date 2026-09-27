import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Crown, 
  Medal, 
  CheckCircle2,
  GraduationCap,
  Users
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await api.rewards.getLeaderboard();
        if (data) {
          setLeaderboard(data);
        }
      } catch (err) {
        console.warn('Live leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const filteredLeaderboard = departmentFilter === 'ALL'
    ? leaderboard
    : leaderboard.filter(e => (e.department || '').includes(departmentFilter));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-gold-soft text-sahayak-blue-deep font-semibold text-xs mb-1">
            <Trophy className="w-3.5 h-3.5 text-sahayak-gold" />
            <span>Campus Good Samaritan Rankings</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            NIE Honor Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Recognizing students who uphold campus integrity through verified item returns.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {['ALL', 'CSE', 'ISE', 'ECE', 'Mechanical'].map((d) => (
            <button
              key={d}
              onClick={() => setDepartmentFilter(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                departmentFilter === d
                  ? 'bg-sahayak-blue text-white shadow-neumorph-sm'
                  : 'bg-sahayak-cream-soft border border-sahayak-brown/15 text-sahayak-text-secondary hover:border-sahayak-blue'
              }`}
            >
              {d === 'ALL' ? 'All Branches' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {filteredLeaderboard.length === 0 ? (
        <NeumorphicCard className="p-8 text-center border border-sahayak-brown/15 space-y-2">
          <Users className="w-10 h-10 text-sahayak-blue mx-auto opacity-50" />
          <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep">Leaderboard Updating</h3>
          <p className="text-xs text-sahayak-text-muted">No student rankings recorded for this department filter yet.</p>
        </NeumorphicCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            {filteredLeaderboard.slice(0, 3).map((entry, idx) => {
              const isGold = idx === 0;
              const name = entry.studentName || entry.name || entry.fullName || 'Student';
              const avatarImg = entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.usn || name}`;
              const usnStr = entry.usn || '';
              const count = entry.recoveredCount || entry.recoveriesCount || 0;
              const score = entry.points || 0;

              return (
                <NeumorphicCard
                  key={`podium-${entry.rank}-${usnStr}`}
                  className={`p-6 border text-center space-y-3 relative overflow-hidden ${
                    isGold
                      ? 'border-sahayak-gold shadow-neumorph-lg bg-gradient-to-b from-sahayak-gold-soft/40 to-sahayak-cream-soft md:-translate-y-2'
                      : 'border-sahayak-brown/15 shadow-neumorph'
                  }`}
                >
                  {isGold && (
                    <div className="absolute top-3 right-3 text-sahayak-gold animate-bounce">
                      <Crown className="w-6 h-6 fill-sahayak-gold" />
                    </div>
                  )}

                  <div className="w-16 h-16 rounded-full mx-auto p-1 bg-sahayak-cream border-2 border-sahayak-brown/20 shadow-neumorph-sm flex items-center justify-center">
                    <img
                      src={avatarImg}
                      alt={name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-sahayak-blue">
                      <span>Rank #{entry.rank || idx + 1}</span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-sahayak-text-primary mt-0.5">
                      {name}
                    </h3>
                    <p className="text-xs text-sahayak-text-muted font-mono">{usnStr} • {entry.department}</p>
                  </div>

                  <div className="pt-2 border-t border-sahayak-brown/10 flex justify-around text-xs">
                    <div>
                      <p className="font-bold text-sahayak-blue-deep">{count}</p>
                      <p className="text-[10px] text-sahayak-text-muted">Recovered</p>
                    </div>
                    <div className="h-6 w-px bg-sahayak-brown/20" />
                    <div>
                      <p className="font-bold text-sahayak-gold">{score} PTS</p>
                      <p className="text-[10px] text-sahayak-text-muted">Total Score</p>
                    </div>
                  </div>
                </NeumorphicCard>
              );
            })}
          </div>

          {/* Full Leaderboard Table */}
          <NeumorphicCard className="p-0 border border-sahayak-brown/15 overflow-hidden shadow-neumorph">
            <div className="p-4 border-b border-sahayak-brown/10 bg-sahayak-cream">
              <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep">
                Campus Leaderboard Table ({filteredLeaderboard.length} Verified Champions)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sahayak-cream border-b border-sahayak-brown/10 text-sahayak-text-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3.5">Rank</th>
                    <th className="p-3.5">Student / USN</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Items Recovered</th>
                    <th className="p-3.5 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sahayak-brown/10">
                  {filteredLeaderboard.map((entry, idx) => {
                    const name = entry.studentName || entry.name || entry.fullName || 'Student';
                    const avatarImg = entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.usn || name}`;
                    const usnStr = entry.usn || '';
                    const count = entry.recoveredCount || entry.recoveriesCount || 0;
                    const score = entry.points || 0;

                    return (
                      <tr key={`table-${entry.rank || idx}-${usnStr}`} className="hover:bg-sahayak-cream-soft/50 transition-colors">
                        <td className="p-3.5 font-bold text-sahayak-blue">
                          #{entry.rank || idx + 1}
                        </td>
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={avatarImg}
                            alt={name}
                            className="w-8 h-8 rounded-full object-cover border border-sahayak-brown/15"
                          />
                          <div>
                            <span className="font-bold text-sahayak-text-primary block">{name}</span>
                            <span className="font-mono text-[11px] text-sahayak-text-muted">{usnStr}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-sahayak-text-secondary">
                          {entry.department}
                        </td>
                        <td className="p-3.5 font-bold text-sahayak-text-primary">
                          {count} verified
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-sahayak-gold">
                          {score} PTS
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </NeumorphicCard>
        </>
      )}
    </div>
  );
};
