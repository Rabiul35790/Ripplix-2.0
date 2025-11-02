<?php

// app/Http/Controllers/SupportController.php
namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportReply;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SupportController extends Controller
{
    public function index(): JsonResponse
    {
        $tickets = SupportTicket::where('user_id', Auth::id())
            ->with(['replies' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $ticket = SupportTicket::create([
            'user_id' => Auth::id(),
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'open',
            'priority' => 'medium',
            'last_reply_at' => now(),
        ]);

        return response()->json([
            'message' => 'Support ticket created successfully',
            'ticket' => $ticket->load('replies')
        ], 201);
    }

    public function show(SupportTicket $ticket): JsonResponse
    {
        if ($ticket->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $ticket->load(['replies' => function ($query) {
            $query->orderBy('created_at', 'asc');
        }]);

        // Mark replies as read by user
        $ticket->replies()
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $ticket->update(['is_read_by_user' => true]);

        return response()->json($ticket);
    }

    public function reply(Request $request, SupportTicket $ticket): JsonResponse
    {
        if ($ticket->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $reply = SupportReply::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $request->message,
            'sender_type' => 'user',
            'is_read' => false,
        ]);

        $ticket->update([
            'last_reply_at' => now(),
            'is_read_by_admin' => false,
        ]);

        return response()->json([
            'message' => 'Reply sent successfully',
            'reply' => $reply
        ], 201);
    }

    public function getUnreadCount(): JsonResponse
    {
        $count = SupportReply::join('support_tickets', 'support_replies.support_ticket_id', '=', 'support_tickets.id')
            ->where('support_tickets.user_id', Auth::id())
            ->where('support_replies.sender_type', 'admin')
            ->where('support_replies.is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}
