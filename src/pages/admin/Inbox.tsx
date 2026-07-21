import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Trash2, Search, Inbox as InboxIcon, Calendar, User, Clock } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function Inbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-container-max mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-hanken font-bold text-on-surface flex items-center gap-2">
            <InboxIcon className="text-primary" size={28} />
            Inbox Messages
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Manage contact form submissions from users.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/50"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p>Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant flex flex-col items-center">
            <InboxIcon size={48} className="opacity-20 mb-4" />
            <h3 className="text-lg font-medium text-on-surface mb-1">No messages found</h3>
            <p className="text-sm">There are currently no contact messages matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="p-5 hover:bg-surface-container-low transition-colors group">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Avatar/Icon */}
                  <div className="hidden sm:flex shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-full items-center justify-center">
                    <Mail size={20} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-bold font-hanken text-on-surface truncate">
                        {msg.subject}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant bg-surface-container py-1 px-2.5 rounded-full">
                        <Calendar size={12} />
                        {new Date(msg.created_at).toLocaleDateString()}
                        <Clock size={12} className="ml-1" />
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-3">
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span className="font-medium text-on-surface">{msg.name}</span>
                      </div>
                      <a href={`mailto:${msg.email}`} className="text-primary hover:underline truncate">
                        {msg.email}
                      </a>
                    </div>
                    
                    <div className="bg-surface-container rounded-lg p-4 text-sm text-on-surface whitespace-pre-wrap leading-relaxed border border-outline-variant/30">
                      {msg.message}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start shrink-0">
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      disabled={isDeleting === msg.id}
                      className="p-2 text-error/70 hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                      title="Delete message"
                    >
                      {isDeleting === msg.id ? (
                        <div className="w-5 h-5 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
