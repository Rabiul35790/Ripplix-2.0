<?php

namespace App\Mail;

use App\Models\User;
use App\Models\PricingPlan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlanPurchaseConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public PricingPlan $plan,
        public string $transactionType, // 'purchase' or 'renewal'
        public ?string $transactionId = null
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->transactionType === 'renewal'
            ? "Plan Renewed: {$this->plan->name} {$this->plan->billing_period}"
            : "Plan Purchased: {$this->plan->name} {$this->plan->billing_period}";

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.plan-purchase-confirmation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
