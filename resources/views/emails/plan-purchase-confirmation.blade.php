<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan Confirmation</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F8F8F9;
            margin: 0;
            padding: 0;
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
            padding: 40px 40px;
            text-align: center;
            position: relative;
        }

        .spark-left {
            position: absolute;
            top: 30px;
            left: 30px;
            width: 160px;
            height: 160px;
        }

        .spark-right {
            position: absolute;
            bottom: 30px;
            right: 30px;
            width: 160px;
            height: 160px;
        }

        .envelope {
            width: 160px;
            height: 120px;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 700;
            color: white;
        }

        .greeting {
            font-size: 20px;
            color: #000000;
            margin-bottom: 25px;
            font-weight: 700;
        }

        .message {
            color: #474750;
            font-size: 18px;
            line-height: 1.8;
            margin: 20px 0;
        }

        .plan-highlight {
            color: #9943EE;
            font-weight: 700;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(360deg, #1A04B0 -126.39%, #260F63 76.39%);
            color: white !important;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 20px;
            border: none;
        }

        .cta-button:hover {
            opacity: 0.9;
        }

        .transaction-id {
            font-size: 16px;
            color: #474750;
            margin-top: 30px;
        }

        .footer {
            background: transparent;
            padding: 30px 20px;
            text-align: center;
            color: #8787A8;
            font-size: 16px;
        }

        .footer a {
            color: #357BFA;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        .closing {
            color: #474750;
            font-size: 18px;
            margin-top: 35px;
        }

        .signature {
            color: #474750;
            font-size: 18px;
            margin-top: 10px;
        }

        /* Responsive Design */
        @media only screen and (max-width: 768px) {
            .logo-section img {
                height: 40px !important;
            }

            .email-card {
                border-radius: 15px;
            }

            .header {
                padding: 40px 20px !important;
            }

            .spark-left {
                top: 15px !important;
                left: 20px !important;
                width: 50px !important;
                height: 50px !important;
            }

            .spark-right {
                bottom: 15px !important;
                right: 20px !important;
                width: 50px !important;
                height: 50px !important;
            }

            .envelope {
                width: 80px !important;
                height: 80px !important;
                margin-bottom: 15px !important;
            }

            .header h1 {
                font-size: 22px !important;
            }

            .greeting {
                font-size: 16px !important;
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
            .logo-section img {
                height: 35px !important;
            }

            .header {
                padding: 30px 15px !important;
            }

            .spark-left {
                top: 10px !important;
                left: 10px !important;
                width: 40px !important;
                height: 40px !important;
            }

            .spark-right {
                bottom: 10px !important;
                right: 10px !important;
                width: 40px !important;
                height: 40px !important;
            }

            .envelope {
                width: 70px !important;
                height: 70px !important;
                margin-bottom: 10px !important;
            }

            .header h1 {
                font-size: 20px !important;
            }

            .greeting {
                font-size: 15px !important;
                margin-bottom: 20px;
            }

            .message {
                font-size: 14px !important;
            }

            .cta-button {
                padding: 12px 30px !important;
                font-size: 14px !important;
            }

            .closing, .signature {
                font-size: 14px !important;
            }

            .transaction-id {
                font-size: 12px !important;
                margin-top: 25px;
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
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 800px;">

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
                                    <td align="center" style="background: linear-gradient(90deg, #382973 0%, #6C44D8 100%); color: white; padding: 40px 40px; position: relative;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <!-- Spark Left (absolute positioned images don't work well in email, so we skip or use table cells) -->
                                            <tr>
                                                <td align="center">
                                                    <img src="{{ asset('images/logo/spark.gif') }}" alt="" style="width: 160px; height: 120px; display: block; margin: 0 auto 20px auto;">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: white;">
                                                        @if($transactionType === 'renewal')
                                                            Plan Renewed Successfully!
                                                        @else
                                                            Plan Purchased Successfully!
                                                        @endif
                                                    </h1>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 40px 50px 40px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                                            <!-- Greeting -->
                                            <tr>
                                                <td style="font-size: 20px; color: #000000; margin-bottom: 25px; font-weight: 700; padding-bottom: 25px;">
                                                    Hello {{ $user->name }},
                                                </td>
                                            </tr>

                                            <!-- Message -->
                                            <tr>
                                                <td style="color: #474750; font-size: 18px; line-height: 1.8; padding: 20px 0;">
                                                    @if($transactionType === 'renewal')
                                                        Great news! Your <span style="color: #9943EE; font-weight: 700;">{{ $plan->name }}@if($plan->billing_period === 'monthly') {{ ucfirst($plan->billing_period) }}@endif</span> plan has been renewed and your access continues without interruption. Thank you for staying with us.
                                                    @else
                                                        Great news! Your <span style="color: #9943EE; font-weight: 700;">{{ $plan->name }}@if($plan->billing_period === 'monthly') {{ ucfirst($plan->billing_period) }}@endif</span> plan has been purchased successfully and is now active. You now have full access to all premium features!
                                                    @endif
                                                </td>
                                            </tr>

                                            <!-- Button -->
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <a href="{{ config('app.url') }}" style="display: inline-block; background: linear-gradient(360deg, #1A04B0 -126.39%, #260F63 76.39%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 20px;">Go to Ripplix</a>
                                                </td>
                                            </tr>

                                            <!-- Closing -->
                                            <tr>
                                                <td style="color: #474750; font-size: 18px; padding-top: 35px;">
                                                    If you have any questions feel free to contact our team. Thank you for being a valued member!
                                                </td>
                                            </tr>

                                            <!-- Signature -->
                                            <tr>
                                                <td style="color: #474750; font-size: 18px; padding-top: 10px;">
                                                    Regards,<br>
                                                    Ripplix
                                                </td>
                                            </tr>

                                            <!-- Transaction ID -->
                                            @if($transactionId)
                                            <tr>
                                                <td style="font-size: 16px; color: #474750; padding-top: 30px;">
                                                    Transaction ID: {{ $transactionId }}
                                                </td>
                                            </tr>
                                            @endif

                                        </table>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background: transparent; padding: 30px 20px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="color: #8787A8; font-size: 16px;">
                                        For any query: Contact us at <a href="mailto:contact@ripplix.com" style="color: #357BFA; text-decoration: none;">contact@ripplix.com</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="color: #8787A8; font-size: 16px; padding-top: 10px;">
                                        © 2025 Ripplix · All Rights Reserved.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
