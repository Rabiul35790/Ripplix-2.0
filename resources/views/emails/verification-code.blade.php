<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Email Verification</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse: collapse; border-spacing: 0; margin: 0;}
        div, td {padding: 0;}
        div {margin: 0 !important;}
    </style>
    <![endif]-->
    <style type="text/css">
        @media only screen and (max-width: 620px) {
            .email-container {
                width: 100% !important;
                margin: auto !important;
            }
            .content-padding {
                padding: 30px 20px !important;
            }
            .footer-padding {
                padding: 20px 20px 30px !important;
            }
            .logo-img {
                max-width: 160px !important;
            }
            .verification-code {
                font-size: 36px !important;
                letter-spacing: 8px !important;
            }
            .instruction-text {
                font-size: 14px !important;
            }
        }
        @media only screen and (max-width: 480px) {
            .verification-code {
                font-size: 32px !important;
                letter-spacing: 6px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8F8F9;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; background-color: #F8F8F9;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 600px; width: 100%; margin: 0 auto;">

                    <!-- White Content Box -->
                    <tr>
                        <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                                <tr>
                                    <td class="content-padding" style="padding: 50px 60px; text-align: center;">

                                        <!-- Logo -->
                                        <div style="margin-bottom: 40px;">
                                            <img src="{{ asset('images/logo/logo.png') }}" alt="RippliX" class="logo-img" style="max-width: 200px; height: auto; display: inline-block;">
                                        </div>

                                        <!-- Verification Text -->
                                        <p style="margin: 0 0 30px; color: #474750; font-size: 16px; line-height: 1.5; font-family: Arial, Helvetica, sans-serif;">
                                            Your verification code:
                                        </p>

                                        <!-- Verification Code -->
                                        <div style="margin: 0 0 30px;">
                                            <p class="verification-code" style="margin: 0; color: #0A081B; font-size: 48px; font-weight: 600; letter-spacing: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                                {{ $code }}
                                            </p>
                                        </div>

                                        <!-- Instructions -->
                                        <p class="instruction-text" style="margin: 0; color: #474750; font-size: 15px; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                                            Enter this code within the next 15 minutes<br>
                                            to log in to your Ripplix Account.
                                        </p>

                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer (Outside White Background) -->
                    <tr>
                        <td class="footer-padding" style="padding: 30px 20px 20px; text-align: center; background-color: transparent;">
                            <p style="margin: 0 0 15px; color: #8787A8; font-size: 14px;">
                                © Ripplix
                            </p>
                            <p style="margin: 0;">
                                <a href="{{ url('privacy') }}" style="color: #4a7cff; font-size: 14px; text-decoration: none; margin: 0 10px;">Privacy policy</a>
                                <a href="{{ url('terms') }}" style="color: #4a7cff; font-size: 14px; text-decoration: none; margin: 0 10px;">Terms of service</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
