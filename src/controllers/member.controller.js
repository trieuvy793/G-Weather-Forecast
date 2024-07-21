const crypto = require('crypto');
const axios = require('axios');
const transporter = require('../utils/mailer');

// Hàm gửi email xác thực
const sendVerificationEmail = async (email, verificationCode) => {
  const url = `http://localhost:3000/api/member/verify-email?code=${verificationCode}`;

  await transporter.sendMail({
    from: 'no-reply@weather.com',
    to: email,
    subject: 'Email Verification',
    html: `<p>Please verify your email by clicking the link: <a href="${url}">${url}</a></p>`
  });
};

// Hàm xử lý đăng ký email
const subscribeEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const verificationCode = crypto.randomBytes(16).toString('hex');

  try {
    const mutation = `
      mutation MyMutation($email: String!, $code: [String!]!) {
        upsertVerificationCode(
          where: { email: $email }
          upsert: {
            create: { email: $email, code: $code }
            update: { email: $email, code: $code }
          }
        ) {
          email
          code
        }
        
        publishVerificationCode(where: {email: $email}) {
          email
        }
      }
    `;

    const variables = { email, code: [verificationCode] };

    const response = await axios.post(
      process.env.HYGRAPH_ENDPOINT,
      { query: mutation, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HYGRAPH_API_TOKEN}`
        }
      }
    );

    await sendVerificationEmail(email, verificationCode);
    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hàm xử lý xác thực email
const verifyEmail = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  try {
    const query = `
      query GetLatestVerificationCode($code: [String!]) {
        verificationCodes(where: { code: $code }, orderBy: updatedAt_DESC, first: 1) {
          email
          code
          createdAt
        }
      }
    `;

    const response = await axios.post(
      process.env.HYGRAPH_ENDPOINT,
      { query, variables: { code: [code] } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HYGRAPH_API_TOKEN}`
        }
      }
    );

    const data = response.data.data.verificationCodes;

    if (!data) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    const email = data[0].email;

    const mutation = `
      mutation MyMutation($email: String!) {
        upsertMembersWeather(
          upsert: {create: {email: $email, registered: true}, update: {email: $email, registered: true}}
          where: {email: $email}
        ) {
          email
          registered
        }
        publishMembersWeather(where: {email: $email}) {
          email
        }
      }
    `;

    const responseUpsert = await axios.post(
      process.env.HYGRAPH_ENDPOINT,
      { query: mutation, variables: { email } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HYGRAPH_API_TOKEN}`
        }
      }
    );

    const upsertData = responseUpsert.data;

    res.status(201).json({ message: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { subscribeEmail, verifyEmail };