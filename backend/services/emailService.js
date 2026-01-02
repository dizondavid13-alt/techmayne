const nodemailer = require('nodemailer');
const supabase = require('../config/supabase');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendLeadNotification(clientId, lead) {
  try {
    // Get client details
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (!client) {
      console.error('Client not found for notification');
      return;
    }

    // Get conversation transcript
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', lead.conversation_id)
      .order('created_at', { ascending: true });

    const transcript = messages
      .map(m => `${m.role === 'user' ? 'Visitor' : 'Bot'}: ${m.content}`)
      .join('\n');

    const emailBody = `
New Lead from Your Website Chat!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEAD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}

${lead.event_type ? `Event Type: ${lead.event_type}` : ''}
${lead.event_date ? `Date: ${lead.event_date}` : ''}
${lead.location ? `Location: ${lead.location}` : ''}
${lead.coverage_range ? `Coverage: ${lead.coverage_range}` : ''}
${lead.additional_notes ? `\nNotes: ${lead.additional_notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION TRANSCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${transcript}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick Tip: Respond within 1 hour to increase booking chances by 60%!

Powered by TechMayne
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.notification_email,
      subject: `New Lead: ${lead.name} - ${lead.event_type || 'Inquiry'}`,
      text: emailBody
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Lead notification sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendLeadNotification };
