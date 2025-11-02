<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color:#333333">New Contact Form Submission</h2>
            <p style="color: 564638">You have received a new message from your website contact form.</p>
        </div>

        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div class="value">{{ $contact->name }}</div>
            </div>

            <div class="field">
                <div class="label">Email:</div>
                <div class="value">{{ $contact->email }}</div>
            </div>

            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">{{ $contact->subject }}</div>
            </div>

            <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">{{ nl2br(e($contact->message)) }}</div>
            </div>

            <div class="field">
                <div class="label">Submitted:</div>
                <div class="value">{{ $contact->created_at->format('M j, Y \a\t g:i A') }}</div>
            </div>

            <div class="field">
                <div class="label">IP Address:</div>
                <div class="value">{{ $contact->ip_address }}</div>
            </div>
        </div>
    </div>
</body>
</html>
