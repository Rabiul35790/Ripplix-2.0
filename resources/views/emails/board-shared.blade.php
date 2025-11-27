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

        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
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
            background: #F5F5F7;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
        }

        .share-url {
            font-size: 16px;
            color: #474750;
            word-break: break-all;
            line-height: 1.5;
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
            .logo-section img {
                height: 40px;
            }

            .email-card {
                border-radius: 15px;
            }

            .header {
                padding: 40px 20px !important;
                min-height: 240px !important;
            }

            .envelope {
                width: 90px !important;
                height: 90px !important;
                margin-bottom: 15px;
            }

            .header h1 {
                font-size: 24px !important;
            }

            .content {
                padding: 30px 25px 40px 25px !important;
            }

            .board-name {
                font-size: 20px !important;
            }

            .board-creator {
                font-size: 14px !important;
            }

            .message {
                font-size: 15px !important;
            }

            .cta-button {
                padding: 12px 35px !important;
                font-size: 15px !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .logo-section {
                margin-bottom: 20px;
            }

            .logo-section img {
                height: 35px !important;
            }

            .header {
                padding: 30px 15px !important;
                min-height: 220px !important;
            }

            .envelope {
                width: 80px !important;
                height: 80px !important;
                margin-bottom: 10px;
            }

            .header h1 {
                font-size: 22px !important;
            }

            .content {
                padding: 25px 20px 35px 20px !important;
            }

            .board-name {
                font-size: 18px !important;
                margin-bottom: 12px;
            }

            .board-creator {
                font-size: 13px !important;
                margin-bottom: 18px;
            }

            .message {
                font-size: 14px !important;
                margin: 18px 0 25px 0 !important;
            }

            .cta-button {
                padding: 12px 30px !important;
                font-size: 14px !important;
            }

            .button-wrapper {
                margin-bottom: 30px;
            }

            .direct-link-section {
                margin-top: 25px;
                padding-top: 20px;
            }

            .direct-link-section p {
                font-size: 14px !important;
                margin-bottom: 12px;
            }

            .share-url {
                font-size: 13px !important;
            }

            .footer {
                padding: 25px 15px !important;
                font-size: 13px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F8F9;">
    <!-- Main Container Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8F8F9;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Content Wrapper -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 700px;">

                    <!-- Logo Section -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <img src="{{ asset('images/logo/logo.png') }}" alt="RippliX" style="height: 50px; display: block;">
                        </td>
                    </tr>

                    <!-- Email Card -->
                    <tr>
                        <td align="center">
                            <table role="presentation" width="700" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; margin: 0 auto;">

                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background-image: url('{{ asset('images/logo/topbg.png') }}'); background-size: cover; background-position: center; background-repeat: no-repeat; color: white; padding: 60px 40px; min-height: 280px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td align="center">
                                                    <img src="{{ asset('images/logo/enve.png') }}" alt="" style="width: 90px; height: 90px; display: block; margin-bottom: 20px;">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: white;">You've been invited!</h1>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 40px 50px 40px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                                            <!-- Board Name -->
                                            <tr>
                                                <td style="font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 15px; padding-bottom: 15px;">
                                                    {{ $board->name }}
                                                </td>
                                            </tr>

                                            <!-- Board Creator -->
                                            <tr>
                                                <td style="color: #474750; font-size: 18px; padding-bottom: 20px;">
                                                    Shared by <span style="color: #9943EE; font-weight: 600;">{{ $creatorName }}</span> ({{ $board->creator_email }})
                                                </td>
                                            </tr>

                                            <!-- Message -->
                                            <tr>
                                                <td style="color: #474750; font-size: 18px; line-height: 1.8; padding: 20px 0 30px 0;">
                                                    You've been invited to view this interactive collection. Click the button below to explore the shared content and discover amazing interactions.
                                                </td>
                                            </tr>

                                            <!-- Button -->
                                            <tr>
                                                <td align="center" style="padding-bottom: 35px;">
                                                    <a href="{{ $shareUrl }}" style="display: inline-block; background: #9943EE; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 20px;">View Board</a>
                                                </td>
                                            </tr>

                                            <!-- Direct Link Section -->
                                            <tr>
                                                <td style="padding-top: 25px; border-top: 1px solid #E8E8F0;">
                                                    <p style="color: #474750; font-size: 18px; margin: 0 0 15px 0;">
                                                        You can also copy and paste this link directly into your browser: <strong>Direct Link:</strong>
                                                    </p>
                                                </td>
                                            </tr>

                                            <!-- Link Box -->
                                            <tr>
                                                <td>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F5F5F7; border-radius: 8px;">
                                                        <tr>
                                                            <td style="padding: 12px 16px; font-size: 16px; color: #474750; word-break: break-all; line-height: 1.5;">
                                                                {{ $shareUrl }}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                        </table>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background: #F8F8F9; padding: 30px 20px;">
                            <p style="margin: 5px 0; color: #8787A8; font-size: 16px;">
                                © 2025 Ripplix · All Rights Reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
