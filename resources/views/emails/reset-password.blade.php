<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #F8F8F9;
            padding: 20px 0;
        }
        .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background-color: #F8F8F9;
        }
        .email-header {
            background-color: #F8F8F9;
            padding: 40px 30px 30px;
            text-align: center;
        }
        .email-logo {
            display: inline-block;
            max-width: 200px;
            height: auto;
        }
        .email-logo img {
            width: 100%;
            height: auto;
            display: block;
        }
        .email-body {
            background-color: #ffffff;
            padding: 40px 45px;
            border-radius: 12px;
            margin: 0 20px;
        }
        .email-title {
            font-size: 30px;
            font-weight: 700;
            color: #0A081B;
            margin-bottom: 24px;
        }
        .email-text {
            font-size: 16px;
            color: #474750;
            margin-bottom: 16px;
            line-height: 1.7;
        }
        .button-container {
            text-align: left;
        }
        .reset-button {
            display: inline-block;
            padding: 14px 36px;
            background: linear-gradient(360deg, #1A04B0 -126.39%, #260F63 76.39%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .reset-button:hover {
            background-color: #4C1D95;
            box-shadow: 0 4px 12px rgba(91, 33, 182, 0.3);
        }
        .expiry-notice p {
            font-size: 16px;
            color: #474750;
            margin: 0;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .alternative-link {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #E7E7F3;
        }
        .alternative-link p {
            font-size: 16px;
            color: #6B7280;
            margin-bottom: 12px;
        }
        .link-text {
            font-size: 16px;
            color: #357BFA;
            word-break: break-all;
        }
        .email-footer {
            background-color: #F8F8F9;
            padding: 30px;
            text-align: center;
        }
        .footer-text {
            font-size: 14px;
            color: #8787A8;
            margin: 0;
        }

        /* Mobile Responsiveness */
        @media only screen and (max-width: 640px) {
            body {
                padding: 10px 0;
            }
            .email-header {
                padding: 30px 20px 20px;
            }
            .email-logo {
                max-width: 160px;
            }
            .email-body {
                padding: 30px 20px;
                margin: 0 10px;
                border-radius: 6px;
            }
            .email-title {
                font-size: 20px;
                margin-bottom: 20px;
            }
            .email-text {
                font-size: 14px;
            }
            .reset-button {
                padding: 12px 28px;
                font-size: 14px;
                width: 100%;
                max-width: 280px;
            }
            .button-container {
                margin: 24px 0;
            }
            .expiry-notice {
                padding: 14px;
                margin: 24px 0;
            }
            .expiry-notice p {
                font-size: 13px;
            }
            .alternative-link {
                margin-top: 28px;
                padding-top: 24px;
            }
            .alternative-link p {
                font-size: 12px;
            }
            .link-text {
                font-size: 11px;
                padding: 10px;
            }
            .email-footer {
                padding: 25px 20px;
            }
            .footer-text {
                font-size: 12px;
            }
        }

        @media only screen and (max-width: 480px) {
            .email-header {
                padding: 25px 15px 15px;
            }
            .email-logo {
                max-width: 140px;
            }
            .email-body {
                padding: 25px 15px;
            }
            .email-title {
                font-size: 18px;
            }
            .reset-button {
                padding: 11px 24px;
                font-size: 13px;
            }
        }

        /* Tablet Responsiveness */
        @media only screen and (min-width: 641px) and (max-width: 768px) {
            .email-body {
                margin: 0 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header with Logo -->
        <div class="email-header">
            <div class="email-logo">
                <img src="{{ asset('images/logo/logo.png') }}" alt="Ripplix Logo">
            </div>
        </div>

        <!-- Email Body -->
        <div class="email-body">
            <h1 class="email-title">Reset Password</h1>

            <p class="email-text">
                Hello,
            </p>

            <p class="email-text">
                You are receiving this email because we received a password reset request for your account.
            </p>
            <p class="email-text">
                To reset your password, click on the button below:
            </p>

            <div class="button-container">
                <a href="{{ $url }}" class="reset-button">
                    Reset Password
                </a>
            </div>

            <div class="expiry-notice">
                <p>
                    This password reset link will expire in {{ $count }} minutes.
                </p>
            </div>

            <p class="email-text">
                If you did not request a password reset, no further action is required.
            </p>
            <p class="email-text">
                Regards,<br/>
                Ripplix
            </p>

            <div class="alternative-link">
                <p>If the button above doesn't work, you can copy and paste the URL below into your web browser:</p>
                <div class="link-text">{{ $url }}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">
                © {{ date('Y') }} Ripplix. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
