<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Board Shared</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2B235A;
            margin: 0;
            padding: 10px;
            background-color: #F5F5FA;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        .email-container {
            background-color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            border: 1px solid #E0DAC8;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #E3E2FF;
        }

        .header h1 {
            color: #0A081B;
            font-size: 28px;
            margin-bottom: 8px;
            line-height: 1.3;
            font-weight: 600;
        }

        .header p {
            color: #2B235A;
            font-size: 16px;
            margin: 0;
            opacity: 0.8;
        }

        .board-info {
            background: linear-gradient(135deg, #F5F5FA 0%, #FAFAFA 100%);
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #E3E2FF;
            margin: 20px 0;
        }

        .board-name {
            font-size: 20px;
            font-weight: 600;
            color: #0A081B;
            margin-bottom: 12px;
            word-wrap: break-word;
        }

        .board-creator {
            color: #2B235A;
            margin-bottom: 18px;
            word-wrap: break-word;
            font-size: 15px;
        }

        .board-creator strong {
            color: #1A04B0;
        }

        .board-info > p {
            margin: 18px 0;
            color: #2B235A;
            line-height: 1.6;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(360deg, #1A04B0 -126.39%, #260F63 76.39%);
            color: white !important;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            min-width: 220px;
            transition: opacity 0.3s ease;
            touch-action: manipulation;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(26, 4, 176, 0.25);
        }

        .cta-button:hover {
            opacity: 0.95;
        }

        .cta-container {
            text-align: center;
            margin: 28px 0;
        }

        .direct-link-section {
            background-color: #FAFAFA;
            padding: 18px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #E3E2FF;
        }

        .direct-link-section h3 {
            color: #0A081B;
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 600;
        }

        .share-url {
            background-color: white;
            padding: 14px;
            border-radius: 6px;
            border: 1px solid #E3E2FF;
            font-family: 'Courier New', monospace;
            word-break: break-all;
            margin: 12px 0;
            font-size: 14px;
            line-height: 1.5;
            color: #2B235A;
        }

        .direct-link-section p {
            font-size: 13px;
            color: #2B235A;
            margin-bottom: 0;
            margin-top: 10px;
            opacity: 0.8;
        }

        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E3E2FF;
            text-align: center;
            color: #2B235A;
            font-size: 14px;
        }

        .footer p {
            margin: 10px 0;
            opacity: 0.7;
        }

        .emoji {
            font-size: 32px;
            margin-bottom: 10px;
            display: block;
        }

        /* Tablet styles */
        @media screen and (min-width: 480px) {
            body {
                padding: 20px;
            }

            .email-container {
                padding: 35px;
            }

            .header h1 {
                font-size: 30px;
            }

            .board-name {
                font-size: 22px;
            }

            .board-info {
                padding: 28px;
            }

            .direct-link-section {
                padding: 22px;
            }
        }

        /* Desktop styles */
        @media screen and (min-width: 768px) {
            body {
                padding: 30px;
            }

            .email-container {
                padding: 45px;
            }

            .header {
                margin-bottom: 35px;
            }

            .header h1 {
                font-size: 32px;
            }

            .board-name {
                font-size: 24px;
            }

            .footer {
                margin-top: 35px;
            }

            .direct-link-section h3 {
                font-size: 18px;
            }

            .cta-button {
                font-size: 17px;
                padding: 18px 36px;
            }
        }

        /* Very small mobile devices */
        @media screen and (max-width: 320px) {
            .header h1 {
                font-size: 24px;
            }

            .board-name {
                font-size: 18px;
            }

            .cta-button {
                padding: 14px 24px;
                min-width: 200px;
                font-size: 15px;
            }

            .share-url {
                font-size: 12px;
                padding: 12px;
            }
        }

        /* Email client specific fixes */
        @media screen and (max-width: 600px) {
            .email-container {
                border-radius: 0 !important;
                box-shadow: none !important;
            }

            body {
                background-color: white !important;
                padding: 0 !important;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0A081B;
                color: #E5E5E5;
            }

            .email-container {
                background-color: #1A1825;
                color: #E5E5E5;
                border-color: #2B235A;
            }

            .header h1, .board-name, .direct-link-section h3 {
                color: white;
            }

            .header {
                border-bottom-color: #2B235A;
            }

            .board-info {
                background: linear-gradient(135deg, #1A1825 0%, #2B235A 100%);
                border-color: #2B235A;
            }

            .board-creator {
                color: #E5E5E5;
            }

            .board-creator strong {
                color: #8B7FFF;
            }

            .board-info > p {
                color: #E5E5E5;
            }

            .direct-link-section {
                background-color: #1A1825;
                border-color: #2B235A;
            }

            .share-url {
                background-color: #2B235A;
                border-color: #3D3570;
                color: #E5E5E5;
            }

            .footer {
                border-top-color: #2B235A;
                color: #E5E5E5;
            }

            .direct-link-section p {
                color: #E5E5E5;
            }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .cta-button {
                border: 2px solid #1A04B0;
            }

            .board-info, .direct-link-section {
                border-width: 2px;
            }
        }

        /* Print styles */
        @media print {
            body {
                background-color: white !important;
                color: black !important;
            }

            .email-container {
                box-shadow: none !important;
                border: 1px solid #ccc;
            }

            .cta-button {
                border: 2px solid #1A04B0 !important;
                color: #1A04B0 !important;
                background: transparent !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <span class="emoji">
                🎨
            </span>
            <h1>You've Been Invited!</h1>
        </div>

        <div class="board-info">
            <div class="board-name">{{ $board->name }}</div>
            <div class="board-creator">
                Shared by <strong>{{ $creatorName }}</strong> ({{ $board->creator_email }})
            </div>

            <p>You've been invited to view this interactive collection. Click the button below to explore the shared content and discover amazing interactions.</p>

            <div class="cta-container">
                <a href="{{ $shareUrl }}" class="cta-button">View Collection</a>
            </div>
        </div>

        <div class="direct-link-section">
            <h3>Direct Link:</h3>
            <div class="share-url">{{ $shareUrl }}</div>
            <p>You can also copy and paste this link directly into your browser.</p>
        </div>

        <div class="footer">
            <p>This invitation was sent because {{ $creatorName }} shared a collection with your email address.</p>
            <p>If you believe this was sent in error, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>
