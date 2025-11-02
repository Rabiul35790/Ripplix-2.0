<?php

namespace App\Mail;

use App\Models\Sponsor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SponsorFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public $sponsor;
    public $isConfirmation;

    /**
     * Create a new message instance.
     */
    public function __construct(Sponsor $sponsor, bool $isConfirmation = false)
    {
        $this->sponsor = $sponsor;
        $this->isConfirmation = $isConfirmation;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        if ($this->isConfirmation) {
            return new Envelope(
                subject: 'Thank you for your sponsorship inquiry',
            );
        }

        return new Envelope(
            subject: 'New Sponsorship Inquiry from ' . $this->sponsor->company_name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        if ($this->isConfirmation) {
            return new Content(
                view: 'emails.sponsor-confirmation',
                with: [
                    'sponsor' => $this->sponsor,
                ],
            );
        }

        return new Content(
            view: 'emails.sponsor-notification',
            with: [
                'sponsor' => $this->sponsor,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
