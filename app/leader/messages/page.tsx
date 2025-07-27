'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  title: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  recipient_type: 'individual' | 'group' | 'all_parents';
  created_at: string;
  status: 'draft' | 'sent';
}

interface Group {
  id: string;
  name: string;
  division: string;
  scouts: any[];
}

export default function LeaderMessagesPage() {
  const { userDetails, loading: authLoading, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    recipient_type: 'group' as 'individual' | 'group' | 'all_parents',
    group_id: '',
    scout_ids: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !userDetails) {
      router.push('/login');
      return;
    }
    
    if (userDetails) {
      loadData();
    }
  }, [userDetails, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load leader's groups
      const groupsRes = await fetch(`/api/groups?leaderId=${userDetails?.id}&limit=100`);
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        const leaderGroups = groupsData.data?.groups || [];
        setGroups(leaderGroups);
      }

      // Load messages
      const messagesRes = await fetch(`/api/messages?userId=${userDetails?.id}&limit=50`);
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        const messagesList = messagesData.data?.messages || [];
        
        // Transform messages to match interface
        const transformedMessages = messagesList.map((msg: any) => ({
          id: msg.id,
          title: msg.title || msg.subject || 'No Subject',
          content: msg.content || msg.message || '',
          sender_id: msg.sender_id,
          sender_name: msg.sender_name || 'Unknown',
          recipient_type: msg.recipient_type || 'group',
          created_at: msg.created_at,
          status: msg.status || 'sent'
        }));
        
        setMessages(transformedMessages);
      } else {
        // Set sample messages for demonstration
        setMessages([
          {
            id: '1',
            title: 'Weekly Meeting Reminder',
            content: 'Don\'t forget about our weekly scout meeting this Saturday at 10 AM.',
            sender_id: userDetails?.id || '',
            sender_name: userDetails?.name || '',
            recipient_type: 'group',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'sent'
          },
          {
            id: '2',
            title: 'Camp Permission Forms',
            content: 'Please ensure all camp permission forms are submitted by Friday.',
            sender_id: userDetails?.id || '',
            sender_name: userDetails?.name || '',
            recipient_type: 'all_parents',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'sent'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    try {
      setSendingMessage(true);
      setError('');

      // Prepare message data
      const messageData = {
        title: newMessage.title,
        content: newMessage.content,
        sender_id: userDetails?.id,
        sender_name: userDetails?.name,
        recipient_type: newMessage.recipient_type,
        group_id: newMessage.group_id || null,
        scout_ids: newMessage.scout_ids,
        status: 'sent',
        created_at: new Date().toISOString()
      };

      // For now, simulate sending by adding to local state
      // In a real implementation, this would POST to /api/messages
      const newMessageRecord: Message = {
        id: Date.now().toString(),
        ...messageData
      };

      setMessages(prev => [newMessageRecord, ...prev]);
      
      // Reset form
      setNewMessage({
        title: '',
        content: '',
        recipient_type: 'group',
        group_id: '',
        scout_ids: []
      });
      setShowCompose(false);

      // In a real implementation:
      // const response = await fetch('/api/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(messageData)
      // });

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getRecipientText = (message: Message) => {
    switch (message.recipient_type) {
      case 'group':
        const group = groups.find(g => g.id === message.group_id);
        return group ? `Group: ${group.name}` : 'Group';
      case 'all_parents':
        return 'All Parents';
      case 'individual':
        return 'Individual';
      default:
        return 'Unknown';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">Communicate with parents and scouts</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/leader/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Compose Message Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Compose Message</h3>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="message-title" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="message-title"
                      value={newMessage.title}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      placeholder="Enter message subject..."
                    />
                  </div>

                  <div>
                    <label htmlFor="recipient-type" className="block text-sm font-medium text-gray-700">
                      Send To
                    </label>
                    <select
                      id="recipient-type"
                      value={newMessage.recipient_type}
                      onChange={(e) => setNewMessage(prev => ({ 
                        ...prev, 
                        recipient_type: e.target.value as 'individual' | 'group' | 'all_parents'
                      }))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                    >
                      <option value="group">Specific Group</option>
                      <option value="all_parents">All Parents</option>
                      <option value="individual">Individual Parent</option>
                    </select>
                  </div>

                  {newMessage.recipient_type === 'group' && (
                    <div>
                      <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">
                        Select Group
                      </label>
                      <select
                        id="group-select"
                        value={newMessage.group_id}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, group_id: e.target.value }))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a group...</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label htmlFor="message-content" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message-content"
                      rows={6}
                      value={newMessage.content}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      placeholder="Enter your message..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage}
                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Sent Messages ({messages.length})
              </h3>
              <button
                onClick={() => setShowCompose(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              >
                Compose Message
              </button>
            </div>
            
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4 bg-pink-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-medium text-gray-900">{message.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            message.status === 'sent' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{message.content}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>To: {getRecipientText(message)}</span>
                            <span>•</span>
                            <span>{new Date(message.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(message.created_at).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-shrink-0">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by sending your first message to parents.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCompose(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Compose Message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}