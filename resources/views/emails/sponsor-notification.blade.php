<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Sponsorship Inquiry</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Sora:wght@100..800&display=swap" rel="stylesheet">
    <style>
        body { font-family: Sora, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FAF9F6; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #333333; }
        .value { margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 3px; }
        .message-box { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #333333; }
        .budget-info { background: #e8f4f8; padding: 10px; border-radius: 3px; border-left: 4px solid #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color:#333333">New Sponsorship Inquiry</h2>
            <p style="color: #564638">You have received a new sponsorship inquiry from {{ $sponsor->company_name }}.</p>
        </div>

        <div class="content">
            <div class="field">
                <div class="label">Contact Person:</div>
                <div class="value">{{ $sponsor->name }}</div>
            </div>

            <div class="field">
                <div class="label">Company/Brand:</div>
                <div class="value">{{ $sponsor->company_name }}</div>
            </div>

            <div class="field">
                <div class="label">Email:</div>
                <div class="value">{{ $sponsor->email }}</div>
            </div>

            <div class="field">
                <div class="label">Phone:</div>
                <div class="value">{{ $sponsor->phone }}</div>
            </div>

            <div class="field">
                <div class="label">Address:</div>
                <div class="value">{{ nl2br(e($sponsor->address)) }}</div>
            </div>

            @if($sponsor->budget_range_min || $sponsor->budget_range_max)
            <div class="field">
                <div class="label">Budget Range:</div>
                <div class="budget-info">
                    @if($sponsor->budget_range_min && $sponsor->budget_range_max)
                        ${{ number_format($sponsor->budget_range_min, 0) }} - ${{ number_format($sponsor->budget_range_max, 0) }}
                    @elseif($sponsor->budget_range_min)
                        From ${{ number_format($sponsor->budget_range_min, 0) }}
                    @elseif($sponsor->budget_range_max)
                        Up to ${{ number_format($sponsor->budget_range_max, 0) }}
                    @endif
                </div>
            </div>
            @endif

            @if($sponsor->sponsorship_goals)
            <div class="field">
                <div class="label">Sponsorship Goals:</div>
                <div class="message-box">{{ nl2br(e($sponsor->sponsorship_goals)) }}</div>
            </div>
            @endif

            <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">{{ nl2br(e($sponsor->message)) }}</div>
            </div>

            <div class="field">
                <div class="label">Submitted:</div>
                <div class="value">{{ $sponsor->created_at->format('M j, Y \a\t g:i A') }}</div>
            </div>

            <div class="field">
                <div class="label">IP Address:</div>
                <div class="value">{{ $sponsor->ip_address }}</div>
            </div>
        </div>
    </div>
</body>
</html>
