<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for contacting us</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Sora:wght@100..800&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Sora, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #F8F8F9;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: transparent;
            padding: 40px 20px;
            min-height: 100vh;
        }

        .logo-section {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo-section img {
            height: 50px;
        }

        .email-card {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid purple;
        }

        .header {
            background: linear-gradient(90deg, #382973 0%, #6C44D8 100%);
            color: white;
            padding: 40px;
            border-radius: 0;
            text-align: center;
        }

        .header h2 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            color: #ffffff;
        }

        .content {
            background: #ffffff;
            padding: 40px;
        }

        .content p {
            color: #474750;
            font-size: 16px;
            line-height: 1.8;
            margin: 15px 0;
        }

        .greeting {
            color: #000000;
            font-size: 18px;
            font-weight: 600;
        }

        .highlight {
            background: #F5F5F7;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #9943EE;
        }

        .highlight strong {
            color: #000000;
            font-size: 16px;
        }

        .highlight br {
            margin-bottom: 8px;
        }

        .signature {
            color: #474750;
            font-size: 16px;
            margin-top: 30px;
        }

        .footer {
            background: transparent;
            padding: 30px 20px;
            text-align: center;
            color: #8787A8;
            font-size: 14px;
        }

        .footer p {
            margin: 5px 0;
        }

        /* Responsive Design */
        @media only screen and (max-width: 768px) {
            .container {
                padding: 20px 15px;
            }

            .logo-section img {
                height: 40px;
            }

            .header {
                padding: 30px 25px;
            }

            .header h2 {
                font-size: 24px;
            }

            .content {
                padding: 30px 25px;
            }

            .content p {
                font-size: 15px;
            }

            .highlight {
                padding: 18px;
            }
        }

        @media only screen and (max-width: 480px) {
            .container {
                padding: 10px;
            }

            .logo-section {
                margin-bottom: 20px;
            }

            .logo-section img {
                height: 35px;
            }

            .header {
                padding: 25px 20px;
            }

            .header h2 {
                font-size: 22px;
            }

            .content {
                padding: 25px 20px;
            }

            .content p {
                font-size: 14px;
            }

            .greeting {
                font-size: 16px;
            }

            .highlight {
                padding: 15px;
                margin: 20px 0;
            }

            .highlight strong {
                font-size: 14px;
            }

            .signature {
                font-size: 14px;
            }

            .footer {
                padding: 25px 15px;
                font-size: 13px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-section">
            <img src="{{ asset('images/logo/logo.png') }}" alt="RippliX">
        </div>

        <div class="email-card">
            <div class="header">
                <h2>Thank You for Contacting Us!</h2>
            </div>

            <div class="content">
                <p class="greeting">Dear {{ $contact->name }},</p>

                <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>

                <div class="highlight">
                    <strong>Your message details:</strong><br><br>
                    <strong>Subject:</strong> {{ $contact->subject }}<br>
                    <strong>Submitted:</strong> {{ $contact->created_at->format('M j, Y \a\t g:i A') }}
                </div>

                <p>We typically respond within 24-48 hours during business days. If your inquiry is urgent, please don't hesitate to contact us directly.</p>

                <p class="signature">Best regards,<br>{{ config('app.name') }} Team</p>
            </div>
        </div>

        <div class="footer">
            <p>© 2025 Ripplix · All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
