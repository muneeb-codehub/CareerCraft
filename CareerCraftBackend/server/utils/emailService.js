import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
    // Using Ethereal Email for testing (free, no signup needed for testing)
    // For production, use Gmail with App Password or services like SendGrid
    
    if (process.env.EMAIL_SERVICE === 'ethereal') {
        // Ethereal test account (emails visible at ethereal.email)
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    
    // Gmail configuration
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send login notification email
export const sendLoginNotification = async (userEmail, userName, loginTime, ipAddress = 'Unknown', password = null) => {
    // Skip email if credentials not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'your-email@gmail.com') {
        console.log('Email not configured - Skipping login notification');
        return { success: false, error: 'Email credentials not configured' };
    }

    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"CareerCraft by Muneeb" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'New Login Detected - CareerCraft',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .info-box {
                            background: #f8f9fa;
                            border-left: 4px solid #667eea;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .password-box {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .password-text {
                            font-family: 'Courier New', monospace;
                            font-size: 18px;
                            font-weight: bold;
                            color: #856404;
                            background: white;
                            padding: 10px;
                            border-radius: 5px;
                            display: inline-block;
                            margin-top: 10px;
                        }
                        .footer {
                            text-align: center;
                            padding: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 CareerCraft Login Notification</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${userName}!</h2>
                            <p>You are logging in to CareerCraft by Muneeb website. If this was you, you can safely ignore this email.</p>
                            
                            <div class="info-box">
                                <strong>Login Details:</strong><br>
                                📧 Email: ${userEmail}<br>
                                🕐 Time: ${loginTime}<br>
                                🌐 IP Address: ${ipAddress}
                            </div>

                            ${password ? `
                            <div class="password-box">
                                <strong>⚠️ Your Password:</strong><br>
                                <span class="password-text">${password}</span>
                                <p style="margin-top: 10px; font-size: 14px; color: #856404;">
                                    <strong>Important:</strong> Please keep this password safe and secure. We recommend changing it after your first login.
                                </p>
                            </div>
                            ` : ''}

                            <p><strong>Was this you?</strong></p>
                            <p>If you recognize this login, no further action is needed. Your account is secure.</p>

                            <p><strong>Didn't log in?</strong></p>
                            <p>If you did not authorize this login, please secure your account immediately by changing your password.</p>

                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
                        </div>
                        <div class="footer">
                            <p>© 2024 CareerCraft by Muneeb. All rights reserved.</p>
                            <p>This is an automated security notification. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Login notification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending login notification email:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email for new signups
export const sendWelcomeEmail = async (userEmail, userName, password) => {
    // Skip email if credentials not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'your-email@gmail.com') {
        console.log('Email not configured - Skipping welcome email');
        return { success: false, error: 'Email credentials not configured' };
    }

    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"CareerCraft by Muneeb" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Welcome to CareerCraft! 🎉 - Your Login Credentials',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .credentials-box {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .credential-item {
                            margin: 10px 0;
                            padding: 10px;
                            background: white;
                            border-radius: 5px;
                        }
                        .credential-label {
                            font-weight: bold;
                            color: #856404;
                            font-size: 14px;
                        }
                        .credential-value {
                            font-family: 'Courier New', monospace;
                            font-size: 16px;
                            font-weight: bold;
                            color: #333;
                            margin-top: 5px;
                        }
                        .feature {
                            padding: 15px;
                            margin: 10px 0;
                            background: #f8f9fa;
                            border-radius: 5px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        .footer {
                            text-align: center;
                            padding: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        .warning {
                            background: #f8d7da;
                            border-left: 4px solid #dc3545;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 5px;
                            color: #721c24;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome to CareerCraft!</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${userName}!</h2>
                            <p>Thank you for joining <strong>CareerCraft by Muneeb</strong> - Your AI-Powered Career Development Platform!</p>
                            
                            <div class="credentials-box">
                                <h3 style="margin-top: 0; color: #856404;">🔐 Your Login Credentials</h3>
                                
                                <div class="credential-item">
                                    <div class="credential-label">📧 Email:</div>
                                    <div class="credential-value">${userEmail}</div>
                                </div>
                                
                                <div class="credential-item">
                                    <div class="credential-label">🔑 Password:</div>
                                    <div class="credential-value">${password}</div>
                                </div>
                            </div>

                            <div class="warning">
                                <strong>⚠️ Important Security Notice:</strong><br>
                                Please keep these credentials safe and secure. We recommend changing your password after your first login for enhanced security.
                            </div>

                            <p><strong>What you can do with CareerCraft:</strong></p>

                            <div class="feature">
                                📝 <strong>Resume Builder</strong> - Create professional resumes instantly
                            </div>
                            <div class="feature">
                                🎯 <strong>Skill Gap Analysis</strong> - Identify areas for improvement
                            </div>
                            <div class="feature">
                                💬 <strong>Interview Simulator</strong> - Practice with AI-powered mock interviews
                            </div>
                            <div class="feature">
                                🗺️ <strong>Career Roadmap</strong> - Get personalized career guidance
                            </div>
                            <div class="feature">
                                📊 <strong>Portfolio Tracker</strong> - Track your progress and achievements
                            </div>

                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Login to Your Account</a>
                        </div>
                        <div class="footer">
                            <p>© 2024 CareerCraft by Muneeb. All rights reserved.</p>
                            <p>Need help? Contact us at contact@careercraft.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};
