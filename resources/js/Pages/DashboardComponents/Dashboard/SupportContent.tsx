// resources/js/Pages/DashboardComponents/Dashboard/SupportContent.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
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

interface SupportContentProps {
    auth: {
        user: User;
    };
}

const SupportContent: React.FC<SupportContentProps> = ({ auth }) => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get('/support');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
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

            // Refresh selected ticket
            const response = await axios.get(`/support/${selectedTicket.id}`);
            setSelectedTicket(response.data);
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setLoading(false);
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

    // const getPriorityColor = (priority: string) => {
    //     switch (priority) {
    //         case 'low': return 'bg-gray-100 text-gray-800';
    //         case 'medium': return 'bg-yellow-100 text-yellow-800';
    //         case 'high': return 'bg-orange-100 text-orange-800';
    //         case 'urgent': return 'bg-red-100 text-red-800';
    //         default: return 'bg-gray-100 text-gray-800';
    //     }
    // };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h2>
                <button
                    onClick={() => setShowNewTicketForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    New Ticket
                </button>
            </div>

            {/* New Ticket Form Modal */}
            {showNewTicketForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Create New Support Ticket
                        </h3>
                        <form onSubmit={createTicket} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Message
                                </label>
                                <textarea
                                    value={newTicket.message}
                                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Ticket'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewTicketForm(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div className="p-4 border-b dark:border-gray-700">
                            <h3 className="font-medium text-gray-900 dark:text-white">Your Tickets</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {tickets.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    No tickets found
                                </div>
                            ) : (
                                tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                            selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {ticket.subject}
                                            </h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Ticket Details */}
                <div className="md:col-span-2">
                    {selectedTicket ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                            {/* Ticket Header */}
                            <div className="p-4 border-b dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedTicket.subject}
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </span>
                                        {/* <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority}
                                        </span> */}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Ticket #{selectedTicket.id} • Created {new Date(selectedTicket.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Messages */}
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {/* Original Message */}
                                <div className="mb-4">
                                    <div className="flex items-start gap-3">
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
                                        <div className="flex items-start gap-3">
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
                                <div className="p-4 border-t dark:border-gray-700">
                                    <form onSubmit={sendReply} className="space-y-3">
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder="Type your reply..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading || !replyMessage.trim()}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                                            >
                                                {loading ? 'Sending...' : 'Send Reply'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-8 text-center">
                            <div className="text-gray-400 dark:text-gray-500">
                                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
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
        </div>
    );
};

export default SupportContent;
