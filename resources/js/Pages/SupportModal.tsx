import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MessageSquare, Plus } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface SupportReply {
    id: number;
    message: string;
    sender_type: 'user' | 'admin';
    created_at: string;
    is_read: boolean;
}

interface SupportTicket {
    id: number;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    replies: SupportReply[];
}

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    auth: {
        user: User;
    };
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, auth }) => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            fetchTickets();
            fetchUnreadCount();
        }
    }, [isOpen]);

    const fetchTickets = async () => {
        try {
            const response = await axios.get('/support');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('/support/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const createTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/support', newTicket);
            setNewTicket({ subject: '', message: '' });
            setShowNewTicketForm(false);
            fetchTickets();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error creating ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !replyMessage.trim()) return;

        setLoading(true);

        try {
            await axios.post(`/support/${selectedTicket.id}/reply`, {
                message: replyMessage
            });
            setReplyMessage('');
            fetchTickets();
            fetchUnreadCount();

            // Refresh selected ticket
            const response = await axios.get(`/support/${selectedTicket.id}`);
            setSelectedTicket(response.data);
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectTicket = async (ticket: SupportTicket) => {
        setSelectedTicket(ticket);

        // Mark ticket as read
        try {
            await axios.get(`/support/${ticket.id}`);
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking ticket as read:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sora">
            <div className="bg-[#FFFFFF] border border-[#E0DDE9] dark:bg-gray-900 rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#E0DAC8]">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="w-6 h-6 text-[#564638]" />
                        <h2 className="text-2xl font-bold text-[#564638] dark:text-white">Support</h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#564638] bg-[#FAF9F6] hover:text-black focus:outline-none focus:ring-0 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Tickets List */}
                    <div className="w-1/3 flex flex-col">
                        <div className="p-4">
                            <button
                                onClick={() => setShowNewTicketForm(true)}
                                className="w-full bg-[#333333] hover:bg-black focus:outline-none focus:ring-0 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Ticket</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {tickets.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    No tickets found
                                </div>
                            ) : (
                                tickets.map((ticket) => {
                                    const hasUnreadReplies = ticket.replies.some(
                                        reply => reply.sender_type === 'admin' && !reply.is_read
                                    );

                                    return (
                                        <div
                                            key={ticket.id}
                                            onClick={() => selectTicket(ticket)}
                                            className={`p-4 rounded-md shadow-md cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors ${
                                                selectedTicket?.id === ticket.id ? 'bg-[#FAF9F6] dark:bg-blue-900' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
                                                    {ticket.subject}
                                                </h4>
                                                <div className="flex items-center space-x-1">
                                                    {hasUnreadReplies && (
                                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    )}
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                                {ticket.message}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="flex-1 flex flex-col border-l border-[#E0DAC8]">
                        {selectedTicket ? (
                            <>
                                {/* Ticket Header */}
                                <div className="p-4 shadow-md rounded-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {selectedTicket.subject}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Created {new Date(selectedTicket.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 ">
                                    {/* Original Message */}
                                    <div className="mb-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {auth.user.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(selectedTicket.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                                        {selectedTicket.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {selectedTicket.replies.map((reply) => (
                                        <div key={reply.id} className="mb-4">
                                            <div className="flex items-start space-x-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                                    reply.sender_type === 'admin' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}>
                                                    {reply.sender_type === 'admin' ? 'T' : auth.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`rounded-lg p-3 ${
                                                        reply.sender_type === 'admin'
                                                            ? 'bg-green-50 dark:bg-green-900'
                                                            : 'bg-gray-100 dark:bg-gray-700'
                                                    }`}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {reply.sender_type === 'admin' ? 'Team Ripplix' : auth.user.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(reply.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                                            {reply.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Form */}
                                {selectedTicket.status !== 'closed' && (
                                    <div className="p-4">
                                        <form onSubmit={sendReply} className="space-y-3">
                                            <textarea
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Type your reply..."
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-md bg-[#FAF9F6] border border-[#E0DAC8] dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-0 focus:border-[#E0DAC8]"
                                                required
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={loading || !replyMessage.trim()}
                                                    className="bg-[#333333] hover:bg-black text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
                                                >
                                                    {loading ? 'Sending...' : 'Send Reply'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center text-gray-400 dark:text-gray-500">
                                    <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Select a ticket
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Choose a support ticket from the list to view details and replies.
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>

            {/* New Ticket Form Modal */}
            {showNewTicketForm && (
                <div className="fixed inset-0 transition-opacity bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center p-4 z-60">
                    <div className="bg-[#FFFFFF] border border-[#E0DDE9] dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#564638] dark:text-white">
                                Create New Support Ticket
                            </h3>
                            <button
                                onClick={() => setShowNewTicketForm(false)}
                                className="text-[#564638] bg-[#FAF9F6] hover:text-black dark:hover:text-gray-300 focus:outline-none focus:ring-0"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={createTicket} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#564638] dark:text-gray-300 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md bg-[#FAF9F6] border border-[#E0DDE9] dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-[#E0DAC8]"
                                    required
                                    placeholder="Subject of your issue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#564638] dark:text-gray-300 mb-1">
                                    Message
                                </label>
                                <textarea
                                    value={newTicket.message}
                                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 rounded-md bg-[#FAF9F6] border border-[#E0DDE9] dark:bg-gray-700 text-gray-900 resize-none dark:text-white focus:outline-none focus:ring-0 focus:border-[#E0DAC8]"
                                    required
                                    placeholder="Please describe your issue in detail..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-[#333333] hover:bg-black text-white py-2 rounded-md font-medium disabled:opacity-50 focus:outline-none focus:ring-0 transition-colors"
                                >
                                    {loading ? 'Creating...' : 'Create Ticket'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewTicketForm(false)}
                                    className="flex-1 bg-white hover:bg-gray-200 border border-[#E0DDE9] text-gray-700 py-2 rounded-md font-medium focus:outline-none focus:ring-0 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default SupportModal;
