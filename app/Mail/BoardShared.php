<?php

namespace App\Mail;

use App\Models\Board;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BoardShared extends Mailable
{
    use Queueable, SerializesModels;

    public $board;

    /**
     * Create a new message instance.
     */
    public function __construct(Board $board)
    {
        $this->board = $board;

        // Ensure user relationship is loaded
        if (!$board->relationLoaded('user')) {
            $this->board->load('user');
        }
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('You have been invited to view a board: ' . $this->board->name)
                    ->view('emails.board-shared')
                    ->with([
                        'board' => $this->board,
                        'shareUrl' => $this->board->getShareUrl(),
                        'creatorName' => $this->board->user->name ?? 'Unknown User',
                    ]);
    }

}
