<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Thank you for contacting us</title>
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
            <h2 style="color: #333333">Thank You for Contacting Us!</h2>
        </div>

        <div class="content">
            <p>Dear {{ $contact->name }},</p>

            <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>

            <div class="highlight">
                <strong>Your message details:</strong><br>
                <strong>Subject:</strong> {{ $contact->subject }}<br>
                <strong>Submitted:</strong> {{ $contact->created_at->format('M j, Y \a\t g:i A') }}
            </div>

            <p>We typically respond within 24-48 hours during business days. If your inquiry is urgent, please don't hesitate to contact us directly.</p>

            <p>Best regards,<br>{{ config('app.name') }} Team</p>
        </div>
    </div>
</body>
</html>
