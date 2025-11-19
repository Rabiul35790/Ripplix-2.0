<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan Confirmation</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F8F8F9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px;
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
            background: linear-gradient(90deg, #382973 0%, #6C44D8 100%);
            color: white;
            padding: 40px 40px;
            text-align: center;
            position: relative;
            aspect-ratio: 5 / 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
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
            }
            .spark-left {
                top: 15px;
                left: 20px;
                width: 50px;
                height: 50px;
            }
            .spark-right {
                bottom: 15px;
                right: 20px;
                width: 50px;
                height: 50px;
            }
            .envelope {
                width: 80px;
                height: 80px;
                margin-bottom: 15px;
            }
            .header h1 {
                font-size: 22px;
            }
            .content {
                padding: 30px 25px 40px 25px;
            }
            .greeting {
                font-size: 16px;
            }
            .message {
                font-size: 15px;
            }
            .cta-button {
                padding: 12px 35px;
                font-size: 15px;
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
            }
            .spark-left {
                top: 10px;
                left: 10px;
                width: 40px;
                height: 40px;
            }
            .spark-right {
                bottom: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
            }
            .envelope {
                width: 70px;
                height: 70px;
                margin-bottom: 10px;
            }
            .header h1 {
                font-size: 20px;
            }
            .content {
                padding: 25px 20px 35px 20px;
            }
            .greeting {
                font-size: 15px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 14px;
            }
            .cta-button {
                padding: 12px 30px;
                font-size: 14px;
                margin: 25px 0;
            }
            .closing, .signature {
                font-size: 14px;
            }
            .transaction-id {
                font-size: 12px;
                margin-top: 25px;
            }
            .footer {
                padding: 25px 15px;
                font-size: 13px;
            }
        }
        .header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 700;
            z-index: 1;
        }
        .content {
            padding: 40px 40px 50px 40px;
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
            margin: 20px 0;
            border: none;
        }
        .cta-button:hover {
            opacity: 0.9;
        }
        .button-wrapper {
            text-align: center;
        }
        .transaction-id {
            font-size: 16px;
            color: #474750;
            margin-top: 30px;
            text-align: left;
        }
        .footer {
            background: #F8F8F9;
            padding: 30px 20px;
            text-align: center;
            color: #8787A8;
            font-size: 16px;
        }
        .footer a {
            color: #8787A8;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-section">
            <img src="{{ asset('images/logo/logo.png') }}" alt="RippliX">
        </div>

        <div class="email-card">
            <div class="header">
                <img src="{{ asset('images/logo/spark.gif') }}" alt="" class="spark-left">
                <img src="{{ asset('images/logo/envelope.png') }}" alt="" class="envelope">
                <h1>
                    @if($transactionType === 'renewal')
                        Plan Renewed Successfully!
                    @else
                        Plan Purchased Successfully!
                    @endif
                </h1>
                <img src="{{ asset('images/logo/spark.gif') }}" alt="" class="spark-right">
            </div>

            <div class="content">
                <div class="greeting">
                    Hello {{ $user->name }},
                </div>

                <p class="message">
                    @if($transactionType === 'renewal')
                        Great news! Your <span class="plan-highlight">{{ $plan->name }}@if($plan->billing_period === 'monthly') {{ ucfirst($plan->billing_period) }}@endif</span> plan has been renewed and your access continues without interruption. Thank you for staying with us.
                    @else
                        Great news! Your <span class="plan-highlight">{{ $plan->name }}@if($plan->billing_period === 'monthly') {{ ucfirst($plan->billing_period) }}@endif</span> plan has been purchased successfully and is now active. You now have full access to all premium features!
                    @endif
                </p>

                <div class="button-wrapper">
                    <a href="{{ config('app.url') }}" class="cta-button">
                        Go to Ripplix
                    </a>
                </div>

                <p class="closing">
                    If you have any questions feel free to contact our team. Thank you for being a valued member!
                </p>

                <p class="signature">
                    Regards,<br>
                    Ripplix
                </p>

                @if($transactionId)
                <p class="transaction-id">
                    Transaction ID: {{ $transactionId }}
                </p>
                @endif
            </div>
        </div>

        <div class="footer">
            <p>
                For any query: Contact us at <a href="mailto:contact@ripplix.com" style="color:#357BFA;">contact@ripplix.com</a>
            </p>
            <p style="margin-top: 10px;">
                © 2025 Ripplix · All Rights Reserved.
            </p>
        </div>
    </div>
</body>
</html>
