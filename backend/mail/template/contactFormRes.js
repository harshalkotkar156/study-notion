exports.contactUsEmail = (
  email,
  firstname,
  lastname,
  message,
  phoneNo,
  countrycode
) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Contact Confirmation</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0;">
      <tr>
        <td align="center">
          
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0; color:#111827;">Contact Form Confirmation</h2>
                <p style="color:#6b7280; font-size:14px; margin-top:5px;">
                  We have received your message successfully.
                </p>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="font-size:16px; color:#374151; padding-bottom:15px;">
                Dear <strong>${firstname} ${lastname}</strong>,
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="font-size:15px; color:#4b5563; line-height:1.6; padding-bottom:20px;">
                Thank you for reaching out to us. Our team has received your message and will respond as soon as possible.
              </td>
            </tr>

            <!-- Details Card -->
            <tr>
              <td style="background:#f9fafb; padding:20px; border-radius:6px; font-size:14px; color:#374151;">
                <p style="margin:5px 0;"><strong>Name:</strong> ${firstname} ${lastname}</p>
                <p style="margin:5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin:5px 0;"><strong>Phone:</strong> +${countrycode} ${phoneNo}</p>
                <p style="margin:5px 0;"><strong>Message:</strong></p>
                <p style="margin:5px 0; color:#6b7280;">${message}</p>
              </td>
            </tr>

            <!-- Closing -->
            <tr>
              <td style="font-size:15px; color:#4b5563; padding-top:20px;">
                We appreciate your interest and will get back to you shortly.
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding-top:30px; font-size:12px; color:#9ca3af;">
                If you need immediate assistance, contact us at 
                <a href="mailto:info@studynotion.com" style="color:#2563eb; text-decoration:none;">
                  info@studynotion.com
                </a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};
