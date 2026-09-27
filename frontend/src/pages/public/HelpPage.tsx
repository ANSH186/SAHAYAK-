import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  ShieldCheck, 
  Lock, 
  MapPin, 
  FileQuestion, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';

const faqs = [
  {
    q: 'How does AI matching work on SAHAYAK?',
    a: 'When an item is reported lost or found, SAHAYAK extracts visual features from images (color, form, logos) and combines them with categorical information, incident location coordinates, and timestamps. It calculates transparent match signals without exposing private student information.'
  },
  {
    q: 'What should I do if I find an item on campus?',
    a: '1. Take a clear photo of the item.\n2. Submit a "Report Found" form with the location where it was found.\n3. Deposit the item immediately at the nearest official collection point (NIE Main Security Desk or Department Proctor Office).'
  },
  {
    q: 'How do I prove that an item belongs to me?',
    a: 'During ownership verification, you will be prompted to provide private distinguishing marks (e.g. wallpaper description, scratch marks, unique serial code, case color). Security or the proctor reviews these details before issuing a secure handover OTP.'
  },
  {
    q: 'Where are official NIE Lost & Found collection points?',
    a: 'Collection desks are stationed at:\n- Main Campus Security Desk (Main Entrance, Ground Floor)\n- Sir MV Block Administrative Office (Room 102)\n- Central Library Helpdesk\n- North Canteen Security Point'
  },
  {
    q: 'Are my phone number and email publicly visible?',
    a: 'No. SAHAYAK protects all personal student data. In-app recovery chats are anonymized, and handover OTPs are processed through official NIE Proctor / Security authorization desks.'
  }
];

export const HelpPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(
    f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Knowledge Center</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-sahayak-blue-deep">
          Frequently Asked Questions
        </h1>
        <p className="text-sahayak-text-secondary text-sm max-w-xl mx-auto">
          Need assistance recovering an item or navigating NIE North Campus Lost & Found protocols? Find quick answers below.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
          <input
            type="text"
            placeholder="Search questions, handover procedures, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sahayak-cream-soft border border-sahayak-brown/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue shadow-neumorph-sm"
          />
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <NeumorphicCard
              key={idx}
              className="p-5 border border-sahayak-brown/10 transition-all cursor-pointer select-none"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
                  {faq.q}
                </h3>
                <div className="p-1 rounded-lg bg-sahayak-cream border border-sahayak-brown/15 text-sahayak-blue shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              {isOpen && (
                <div className="mt-3 pt-3 border-t border-sahayak-brown/10 text-sm text-sahayak-text-secondary whitespace-pre-line leading-relaxed">
                  {faq.a}
                </div>
              )}
            </NeumorphicCard>
          );
        })}
      </div>

      {/* Emergency / Campus Contact Contacts */}
      <NeumorphicCard className="p-6 border border-sahayak-brown/15 bg-gradient-to-r from-sahayak-cream-soft to-sahayak-cream">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-heading font-bold text-lg text-sahayak-blue-deep">
              Need immediate security assistance?
            </h3>
            <p className="text-xs sm:text-sm text-sahayak-text-secondary">
              Reach out to the NIE North Campus Security Office or Department Proctor directly.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+918212480475"
              className="px-4 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0821-2480475</span>
            </a>
            <Link
              to="/student/assistant"
              className="px-4 py-2.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-blue text-xs font-bold shadow-neumorph hover:border-sahayak-blue transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};
