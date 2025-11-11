<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #2B235A 0%, #784AEF 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 15px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2B235A;
            margin-bottom: 25px;
            font-weight: 500;
        }
        .transaction-badge {
            display: inline-block;
            background: {{ $transactionType === 'renewal' ? '#10B981' : '#3B82F6' }};
            color: white;
            padding: 8px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .plan-box {
            background: #F7F7FC;
            border: 2px solid #E3E2FF;
            border-radius: 12px;
            padding: 30px;
            margin: 25px 0;
            text-align: center;
        }
        .plan-name {
            color: #2B235A;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
        }
        .plan-type {
            color: #666;
            font-size: 16px;
            margin-top: 10px;
        }
        .message {
            color: #555;
            font-size: 16px;
            line-height: 1.8;
            margin: 25px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2B235A 0%, #784AEF 100%);
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
        }
        .cta-button:hover {
            opacity: 0.9;
        }
        .footer {
            background: #F7F7FC;
            padding: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: #784AEF;
            text-decoration: none;
        }
        .transaction-id {
            font-size: 12px;
            color: #999;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                @if($transactionType === 'renewal')
                    🎉 Plan Renewed Successfully!
                @else
                    🎉 Congratulations!
                @endif
            </h1>
            {{-- <p>
                @if($transactionType === 'renewal')
                    Your subscription has been renewed
                @else
                    Thank you for your purchase
                @endif
            </p> --}}
        </div>

        <div class="content">
            <div class="greeting">
                Hi {{ $user->name }},
            </div>

            <div class="transaction-badge">
                @if($transactionType === 'renewal')
                    PLAN RENEWED
                @else
                    NEW PLAN PURCHASED
                @endif
            </div>

            <p class="message">
                @if($transactionType === 'renewal')
                    Great news! Your subscription has been successfully renewed.
                @else
                    Thank you for your purchase! Your payment has been processed successfully.
                @endif
            </p>

            <div class="plan-box">
                <h2 class="plan-name">{{ $plan->name }} {{ ucfirst($plan->billing_period) }}</h2>
                <p class="plan-type">
                    @if($transactionType === 'renewal')
                        has been renewed
                    @else
                        is now active
                    @endif
                </p>
            </div>

            <p class="message">
                @if($transactionType === 'renewal')
                    Your <strong>{{ $plan->name }} {{ ucfirst($plan->billing_period) }}</strong> plan has been renewed and your access continues without interruption. Thank you for staying with us!
                @else
                    You now have full access to your <strong>{{ $plan->name }} {{ ucfirst($plan->billing_period) }}</strong> plan. Enjoy all the premium features!
                @endif
            </p>

            <center>
                <a href="{{ config('app.url') }}" class="cta-button">
                    Go to Website
                </a>
            </center>

            <p class="message" style="margin-top: 40px; font-size: 14px;">
                If you have any questions, feel free to contact our team.
            </p>

            <p class="message" style="font-size: 14px;">
                Thank you for being a valued member!
            </p>

            @if($transactionId)
            <p class="transaction-id">
                Transaction ID: {{ $transactionId }}
            </p>
            @endif
        </div>

        <div class="footer">
            <p>
                This is an automated confirmation email.<br>
                For any query, contact us at <a href="mailto:contact@ripplix.com">contact@ripplix.com</a>
            </p>
            <p style="margin-top: 15px;">
                Visit Our Website
                <a href="{{ config('app.url') }}"> Ripplix</a> |

            </p>
        </div>
    </div>
</body>
</html>
