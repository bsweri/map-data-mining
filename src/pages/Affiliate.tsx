import { DollarSign, Users, Link as LinkIcon, Gift } from 'lucide-react';

export default function Affiliate() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-hanken text-on-surface">Affiliate Program</h1>
        <p className="text-on-surface-variant mt-2 font-inter">Invite your friends and earn up to 30% commission for every successful purchase they make.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <DollarSign size={24} />
          </div>
          <p className="text-sm text-on-surface-variant font-medium">Total Earnings</p>
          <p className="text-2xl font-bold text-on-surface mt-1">$0.00</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <Users size={24} />
          </div>
          <p className="text-sm text-on-surface-variant font-medium">Total Referrals</p>
          <p className="text-2xl font-bold text-on-surface mt-1">0 Users</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <Gift size={24} />
          </div>
          <p className="text-sm text-on-surface-variant font-medium">Commission Rate</p>
          <p className="text-2xl font-bold text-on-surface mt-1">30%</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-3xl shadow-sm text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <LinkIcon size={32} />
        </div>
        <h3 className="text-xl font-bold text-on-surface mb-2">Your Unique Referral Link</h3>
        <p className="text-on-surface-variant text-sm mb-6 max-w-lg mx-auto">Share this link across your social media, blog, or with friends. When they sign up and buy credits, you'll earn automatically.</p>
        
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <input 
            type="text" 
            readOnly 
            value="https://lookinmaps.com/ref/user123" 
            className="flex-grow px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface font-mono text-sm outline-none"
          />
          <button className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95 shadow-sm">
            COPY
          </button>
        </div>
      </div>
    </div>
  );
}
