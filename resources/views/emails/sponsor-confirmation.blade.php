<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Thank you for your sponsorship inquiry</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Sora:wght@100..800&display=swap" rel="stylesheet">
    <style>
        body { font-family: Sora, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FAF9F6; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
        .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
        .highlight { background: #FAF9F6; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #333333">Thank You for Your Sponsorship Inquiry!</h2>
        </div>

        <div class="content">
            <p>Dear {{ $sponsor->name }},</p>

            <p>Thank you for your interest in sponsoring us! We have received your sponsorship inquiry and are excited about the potential partnership with {{ $sponsor->company_name }}.</p>

            <div class="highlight">
                <strong>Your inquiry details:</strong><br>
                <strong>Company:</strong> {{ $sponsor->company_name }}<br>
                <strong>Contact:</strong> {{ $sponsor->phone }}<br>
                @if($sponsor->budget_range)
                <strong>Budget Range:</strong> {{ $sponsor->budget_range }}<br>
                @endif
                <strong>Submitted:</strong> {{ $sponsor->created_at->format('M j, Y \a\t g:i A') }}
            </div>

            <p>Our sponsorship team will carefully review your proposal and get back to you within 3-5 business days. We'll discuss the sponsorship opportunities that align with your goals and budget.</p>

            <p>If you have any urgent questions or would like to provide additional information, please don't hesitate to contact us directly.</p>

            <p>We look forward to exploring how we can work together to create a mutually beneficial partnership.</p>

            <p>Best regards,<br>{{ config('app.name') }} Sponsorship Team</p>
        </div>
    </div>
</body>
</html>
