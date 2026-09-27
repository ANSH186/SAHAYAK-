import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, PlusCircle, Map, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BottomNav: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard, exact: true },
    { name: 'Matches', path: '/student/matches', icon: Sparkles },
    { name: 'Report', path: '/student/report-lost', icon: PlusCircle, isCenter: true },
    { name: 'Messages', path: '/student/messages', icon: MessageSquare },
    { name: 'Map', path: '/student/map', icon: Map },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-cream-soft/95 backdrop-blur-md border-t border-cream-warm lg:hidden px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
              item.isCenter
                ? 'bg-primary-dark text-white p-2.5 -mt-5 shadow-neu-blue rounded-full border-2 border-cream-soft'
                : isActive
                  ? 'text-primary-dark font-bold'
                  : 'text-sahayak-muted hover:text-sahayak-text'
            )}
          >
            <item.icon className={cn(item.isCenter ? 'w-5 h-5' : 'w-4 h-4')} />
            {!item.isCenter && <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
