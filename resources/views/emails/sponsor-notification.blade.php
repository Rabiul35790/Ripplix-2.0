<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Sponsorship Inquiry</title>
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

        .logo-section img {
            height: 50px;
        }

        .email-card {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(90deg, #382973 0%, #6C44D8 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h2 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
            color: #ffffff;
        }

        .header p {
            margin: 0;
            font-size: 16px;
            color: #ffffff;
            opacity: 0.9;
        }

        .field-label {
            color: #000000;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .field-value {
            background: #F8F9FA;
            padding: 10px;
            border-radius: 5px;
            color: #474750;
            font-size: 16px;
            line-height: 1.6;
        }

        .message-box {
            background: #F5F5F7;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #9943EE;
            color: #474750;
            font-size: 16px;
            line-height: 1.6;
        }

        .budget-box {
            background: #E8F4F8;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #17A2B8;
            color: #474750;
            font-size: 16px;
            font-weight: 600;
        }

        .footer {
            background: transparent;
            padding: 30px 20px;
            text-align: center;
            color: #8787A8;
            font-size: 14px;
        }

        /* Responsive Design */
        @media only screen and (max-width: 768px) {
            .logo-section img {
                height: 40px !important;
            }

            .header {
                padding: 30px 25px !important;
            }

            .header h2 {
                font-size: 24px !important;
            }

            .header p {
                font-size: 14px !important;
            }

            .field-value, .message-box, .budget-box {
                font-size: 15px !important;
            }
        }

        @media only screen and (max-width: 480px) {
            .logo-section img {
                height: 35px !important;
            }

            .header {
                padding: 25px 20px !important;
            }

            .header h2 {
                font-size: 22px !important;
            }

            .header p {
                font-size: 13px !important;
            }

            .field-label {
                font-size: 13px !important;
            }

            .field-value, .message-box, .budget-box {
                font-size: 14px !important;
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
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">

                    <!-- Logo Section -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <img src="{{ config('app.url') }}/images/logo/logo.png" alt="RippliX" style="height: 50px; display: block;">
                        </td>
                    </tr>

                    <!-- Email Card -->
                    <tr>
                        <td align="center">
                            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; margin: 0 auto;">

                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background: linear-gradient(90deg, #382973 0%, #6C44D8 100%); color: white; padding: 40px;">
                                        <h2 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 600; color: #ffffff;">New Sponsorship Inquiry</h2>
                                        <p style="margin: 0; font-size: 16px; color: #ffffff; opacity: 0.9;">You have received a new sponsorship inquiry from {{ $sponsor->company_name }}.</p>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                                            <!-- Contact Person -->
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Contact Person:</div>
                                                    <div style="background: #F8F9FA; padding: 10px; border-radius: 5px; color: #474750; font-size: 16px;">{{ $sponsor->name }}</div>
                                                </td>
                                            </tr>

                                            <!-- Company/Brand -->
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Company/Brand:</div>
                                                    <div style="background: #F8F9FA; padding: 10px; border-radius: 5px; color: #474750; font-size: 16px;">{{ $sponsor->company_name }}</div>
                                                </td>
                                            </tr>

                                            <!-- Email -->
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Email:</div>
                                                    <div style="background: #F8F9FA; padding: 10px; border-radius: 5px; color: #474750; font-size: 16px;">{{ $sponsor->email }}</div>
                                                </td>
                                            </tr>

                                            <!-- Phone -->
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Phone:</div>
                                                    <div style="background: #F8F9FA; padding: 10px; border-radius: 5px; color: #474750; font-size: 16px;">{{ $sponsor->phone }}</div>
                                                </td>
                                            </tr>

                                            <!-- Address -->
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Address:</div>
                                                    <div style="background: #F8F9FA; padding: 10px; border-radius: 5px; color: #474750; font-size: 16px; line-height: 1.6;">{{ nl2br(e($sponsor->address)) }}</div>
                                                </td>
                                            </tr>

                                            <!-- Budget Range -->
                                            @if($sponsor->budget_range_min || $sponsor->budget_range_max)
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Budget Range:</div>
                                                    <div style="background: #E8F4F8; padding: 10px; border-radius: 5px; border-left: 4px solid #17A2B8; color: #474750; font-size: 16px; font-weight: 600;">
                                                        @if($sponsor->budget_range_min && $sponsor->budget_range_max)
                                                            ${{ number_format($sponsor->budget_range_min, 0) }} - ${{ number_format($sponsor->budget_range_max, 0) }}
                                                        @elseif($sponsor->budget_range_min)
                                                            From ${{ number_format($sponsor->budget_range_min, 0) }}
                                                        @elseif($sponsor->budget_range_max)
                                                            Up to ${{ number_format($sponsor->budget_range_max, 0) }}
                                                        @endif
                                                    </div>
                                                </td>
                                            </tr>
                                            @endif

                                            <!-- Sponsorship Goals -->
                                            @if($sponsor->sponsorship_goals)
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Sponsorship Goals:</div>
                                                    <div style="background: #F5F5F7; padding: 15px; border-radius: 5px; border-left: 4px solid #9943EE; color: #474750; font-size: 16px; line-height: 1.6;">{{ nl2br(e($sponsor->sponsorship_goals)) }}</div>
                                                </td>
                                            </tr>
                                            @endif

                                            <!-- Message -->
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Message:</div>
                                                    <div style="background: #F5F5F7; padding: 15px; border-radius: 5px; border-left: 4px solid #9943EE; color: #474750; font-size: 16px; line-height: 1.6;">{{ nl2br(e($sponsor->message)) }}</div>
                                                </td>
                                            </tr>

                                            <!-- Submitted -->
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Submitted:</div>
                                                    <div style="background: #F8F9FA; padding: 10px; border-radius: 5px; color: #474750; font-size: 16px;">{{ $sponsor->created_at->format('M j, Y \a\t g:i A') }}</div>
                                                </td>
                                            </tr>

                                            <!-- IP Address -->
                                            <tr>
                                                <td style="padding-bottom: 0;">
                                                    <div style="color: #000000; font-size: 14px; font-weight: 600; margin-bottom: 5px;">IP Address:</div>
                                                    <div style="background: #F8F9FA; padding: 10px; border-radius: 5px; color: #474750; font-size: 16px;">{{ $sponsor->ip_address }}</div>
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
                        <td align="center" style="background: transparent; padding: 30px 20px;">
                            <p style="margin: 5px 0; color: #8787A8; font-size: 14px;">
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
