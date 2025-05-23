import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationLink = `https://inventorymanagement-cf18.onrender.com/api/auth/verify/${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify Your Email',
    html: `
      <h1>Email Verification</h1>
      <p>Dear ${user.name},</p>
      <p>Thank you for registering. Please click the link below to verify your email:</p>
      <a href="${verificationLink}"></a>
      <p>This link will expire in 24 hours.</p>
      <p>Use Gmail website if the link is not active</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendLowStockAlert = async (user, item) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Low Stock Alert',
    html: `
      <h1>Low Stock Alert</h1>
      <p>Dear ${user.name},</p>
      <p>The stock for item "${item.name}" is running low. Current quantity: ${item.quantity}</p>
      <p>Please restock soon to maintain inventory levels.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendSaleNotification = async (user, sale, item) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'New Sale Processed',
    html: `
      <h1>Sale Confirmation</h1>
      <p>Dear ${user.name},</p>
      <p>A new sale has been processed:</p>
      <ul>
        <li>Item: ${item.name}</li>
        <li>Quantity: ${sale.quantity}</li>
        <li>Total Amount: ₹${sale.totalAmount}</li>
      </ul>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendDailySalesSummary = async (user, sales) => {
  const totalAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Daily Sales Summary',
    html: `
      <h1>Daily Sales Summary</h1>
      <p>Dear ${user.name},</p>
      <p>Here's your sales summary for today:</p>
      <p>Total Sales: ₹${totalAmount}</p>
      <p>Number of Transactions: ${sales.length}</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetLink = async (user, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>Dear ${user.name},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};
