<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for your sponsorship inquiry</title>
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
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            color: #ffffff;
        }

        .greeting {
            color: #000000;
            font-size: 18px;
            font-weight: 600;
        }

        .content-text {
            color: #474750;
            font-size: 16px;
            line-height: 1.8;
            margin: 15px 0;
        }

        .highlight {
            background: #F5F5F7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #9943EE;
        }

        .highlight-text {
            color: #000000;
            font-size: 16px;
            font-weight: 600;
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

            .content-text {
                font-size: 15px !important;
            }

            .highlight {
                padding: 18px !important;
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

            .content-text {
                font-size: 14px !important;
            }

            .greeting {
                font-size: 16px !important;
            }

            .highlight {
                padding: 15px !important;
            }

            .highlight-text {
                font-size: 14px !important;
            }

            .signature {
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
                                        <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff;">Thank You for Your Sponsorship Inquiry!</h2>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                                            <!-- Greeting -->
                                            <tr>
                                                <td style="color: #000000; font-size: 18px; font-weight: 600; padding-bottom: 15px;">
                                                    Dear {{ $sponsor->name }},
                                                </td>
                                            </tr>

                                            <!-- First Message -->
                                            <tr>
                                                <td style="color: #474750; font-size: 16px; line-height: 1.8; padding: 15px 0;">
                                                    Thank you for your interest in sponsoring us! We have received your sponsorship inquiry and are excited about the potential partnership with {{ $sponsor->company_name }}.
                                                </td>
                                            </tr>

                                            <!-- Highlight Box -->
                                            <tr>
                                                <td style="padding: 25px 0;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F5F5F7; border-radius: 8px; border-left: 4px solid #9943EE;">
                                                        <tr>
                                                            <td style="padding: 20px;">
                                                                <p style="margin: 0 0 15px 0; color: #000000; font-size: 16px; font-weight: 600;">Your inquiry details:</p>
                                                                <p style="margin: 8px 0; color: #474750; font-size: 16px; line-height: 1.8;">
                                                                    <strong style="color: #000000;">Company:</strong> {{ $sponsor->company_name }}
                                                                </p>
                                                                <p style="margin: 8px 0; color: #474750; font-size: 16px; line-height: 1.8;">
                                                                    <strong style="color: #000000;">Contact:</strong> {{ $sponsor->phone }}
                                                                </p>
                                                                @if($sponsor->budget_range)
                                                                <p style="margin: 8px 0; color: #474750; font-size: 16px; line-height: 1.8;">
                                                                    <strong style="color: #000000;">Budget Range:</strong> {{ $sponsor->budget_range }}
                                                                </p>
                                                                @endif
                                                                <p style="margin: 8px 0; color: #474750; font-size: 16px; line-height: 1.8;">
                                                                    <strong style="color: #000000;">Submitted:</strong> {{ $sponsor->created_at->format('M j, Y \a\t g:i A') }}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- Second Message -->
                                            <tr>
                                                <td style="color: #474750; font-size: 16px; line-height: 1.8; padding: 15px 0;">
                                                    Our sponsorship team will carefully review your proposal and get back to you within 3-5 business days. We'll discuss the sponsorship opportunities that align with your goals and budget.
                                                </td>
                                            </tr>

                                            <!-- Third Message -->
                                            <tr>
                                                <td style="color: #474750; font-size: 16px; line-height: 1.8; padding: 15px 0;">
                                                    If you have any urgent questions or would like to provide additional information, please don't hesitate to contact us directly.
                                                </td>
                                            </tr>

                                            <!-- Fourth Message -->
                                            <tr>
                                                <td style="color: #474750; font-size: 16px; line-height: 1.8; padding: 15px 0;">
                                                    We look forward to exploring how we can work together to create a mutually beneficial partnership.
                                                </td>
                                            </tr>

                                            <!-- Signature -->
                                            <tr>
                                                <td style="color: #474750; font-size: 16px; padding-top: 30px;">
                                                    Best regards,<br>
                                                    {{ config('app.name') }} Sponsorship Team
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
