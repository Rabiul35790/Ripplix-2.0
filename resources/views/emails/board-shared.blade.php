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
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #F8F8F9;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        .container {
            max-width: 700px;
            margin: 40px auto;
            background: #F8F8F9;
            padding: 20px;
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
        }

        .header {
            background-image: url('{{ asset('images/logo/topbg.png') }}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            min-height: 280px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .envelope {
            width: 90px;
            height: 90px;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            z-index: 1;
        }

        .content {
            padding: 40px 40px 50px 40px;
        }

        .board-name {
            font-size: 24px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 15px;
        }

        .board-creator {
            color: #474750;
            margin-bottom: 20px;
            font-size: 18px;
        }

        .board-creator .creator-name {
            color: #9943EE;
            font-weight: 600;
        }

        .message {
            color: #474750;
            font-size: 18px;
            line-height: 1.8;
            margin: 20px 0 30px 0;
        }

        .cta-button {
            display: inline-block;
            background: #9943EE;
            color: white !important;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 20px;
            margin: 0;
            border: none;
        }

        .cta-button:hover {
            opacity: 0.9;
        }

        .button-wrapper {
            text-align: center;
            margin-bottom: 35px;
        }

        .direct-link-section {
            margin-top: 30px;
            padding-top: 25px;
        }

        .direct-link-section p {
            color: #474750;
            font-size: 18px;
            margin-bottom: 15px;
        }

        .link-box {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #F5F5F7;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
        }

        .share-url {
            flex: 1;
            font-size: 16px;
            color: #474750;
            word-break: break-all;
            line-height: 1.5;
        }

        .copy-button {
            background: #E8E8F0;
            color: #474750;
            border: none;
            padding: 8px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            white-space: nowrap;
        }

        .copy-button:hover {
            background: #DCDCE5;
        }

        .footer {
            background: #F8F8F9;
            padding: 30px 20px;
            text-align: center;
            color: #8787A8;
            font-size: 16px;
        }

        .footer p {
            margin: 5px 0;
        }

        /* Responsive Design */
        @media only screen and (max-width: 768px) {
            .container {
                margin: 20px auto;
                padding: 15px;
            }

            .logo-section img {
                height: 40px;
            }

            .email-card {
                border-radius: 15px;
            }

            .header {
                padding: 40px 20px;
                min-height: 240px;
            }

            .envelope {
                width: 90px;
                height: 90px;
                margin-bottom: 15px;
            }

            .header h1 {
                font-size: 24px;
            }

            .content {
                padding: 30px 25px 40px 25px;
            }

            .board-name {
                font-size: 20px;
            }

            .board-creator {
                font-size: 14px;
            }

            .message {
                font-size: 15px;
            }

            .cta-button {
                padding: 12px 35px;
                font-size: 15px;
            }

            .link-box {
                flex-direction: column;
                align-items: stretch;
                gap: 12px;
            }

            .copy-button {
                width: 100%;
            }
        }

        @media only screen and (max-width: 480px) {
            .container {
                margin: 10px auto;
                padding: 10px;
            }

            .logo-section {
                margin-bottom: 20px;
            }

            .logo-section img {
                height: 35px;
            }

            .header {
                padding: 30px 15px;
                min-height: 220px;
            }

            .envelope {
                width: 80px;
                height: 80px;
                margin-bottom: 10px;
            }

            .header h1 {
                font-size: 22px;
            }

            .content {
                padding: 25px 20px 35px 20px;
            }

            .board-name {
                font-size: 18px;
                margin-bottom: 12px;
            }

            .board-creator {
                font-size: 13px;
                margin-bottom: 18px;
            }

            .message {
                font-size: 14px;
                margin: 18px 0 25px 0;
            }

            .cta-button {
                padding: 12px 30px;
                font-size: 14px;
            }

            .button-wrapper {
                margin-bottom: 30px;
            }

            .direct-link-section {
                margin-top: 25px;
                padding-top: 20px;
            }

            .direct-link-section p {
                font-size: 14px;
                margin-bottom: 12px;
            }

            .share-url {
                font-size: 13px;
            }

            .copy-button {
                font-size: 13px;
                padding: 8px 18px;
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
                <img src="{{ asset('images/logo/enve.png') }}" alt="" class="envelope">
                <h1>You've been invited!</h1>
            </div>

            <div class="content">
                <div class="board-name">{{ $board->name }}</div>

                <div class="board-creator">
                    Shared by <span class="creator-name">{{ $creatorName }}</span> ({{ $board->creator_email }})
                </div>

                <p class="message">
                    You've been invited to view this interactive collection. Click the button below to explore the shared content and discover amazing interactions.
                </p>

                <div class="button-wrapper">
                    <a href="{{ $shareUrl }}" class="cta-button">View Board</a>
                </div>

                <div class="direct-link-section">
                    <p>You can also copy and paste this link directly into your browser: <strong>Direct Link:</strong></p>

                    <div class="link-box">
                        <div class="share-url">{{ $shareUrl }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>© 2025 Ripplix · All Rights Reserved.</p>
        </div>
    </div>

    <script>
        function copyToClipboard() {
            const url = '{{ $shareUrl }}';
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function() {
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    setTimeout(function() {
                        button.textContent = originalText;
                    }, 2000);
                }).catch(function(err) {
                    console.error('Failed to copy:', err);
                });
            }
        }
    </script>
</body>
</html>
