import os
import smtplib
from email.message import EmailMessage


def send_otp_email(to_email: str, otp: str):
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    msg = EmailMessage()
    msg["Subject"] = "GreenCode Insight – Password Reset OTP"
    msg["From"] = f"GreenCode Insight <{smtp_email}>"
    msg["To"] = to_email

    msg.set_content(
        f"""
Hello,

Your OTP for resetting your GreenCode Insight password is:

{otp}

This OTP is valid for 10 minutes.
If you did not request this, please ignore this email.

– GreenCode Insight Team
"""
    )

    msg.add_alternative(
        f"""
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#0b0e14; font-family:Arial, sans-serif;">

    <div style="max-width:600px; margin:0 auto; padding:24px;">
      
      <div style="
        background:#111827;
        border-radius:12px;
        padding:32px;
        color:#e5e7eb;
        box-shadow:0 10px 30px rgba(0,0,0,0.4);
      ">

        <h1 style="
          margin:0 0 16px 0;
          font-size:24px;
          font-weight:600;
          color:#ffffff;
        ">
          GreenCode Insight
        </h1>

        <p style="
          margin:0 0 20px 0;
          font-size:15px;
          line-height:1.6;
          color:#c7d2fe;
        ">
          You requested to reset your password.
          Use the OTP below to continue.
        </p>

        <div style="
          text-align:center;
          margin:32px 0;
        ">
          <span style="
            display:inline-block;
            background:#1f2937;
            border-radius:10px;
            padding:16px 28px;
            font-size:28px;
            letter-spacing:6px;
            font-weight:700;
            color:#ffffff;
            border:1px solid #374151;
          ">
            {otp}
          </span>
        </div>

        <p style="
          margin:0 0 16px 0;
          font-size:14px;
          color:#9ca3af;
        ">
          This OTP is valid for <strong>10 minutes</strong>.
        </p>

        <p style="
          margin:0;
          font-size:14px;
          color:#6b7280;
        ">
          If you did not request this password reset, you can safely ignore this email.
        </p>

        <hr style="
          margin:32px 0;
          border:none;
          border-top:1px solid #1f2937;
        ">

        <p style="
          margin:0;
          font-size:12px;
          color:#6b7280;
          text-align:center;
        ">
          © 2026 GreenCode Insight
          <br />
          Secure • Sustainable • Smart Code
        </p>

      </div>
    </div>

  </body>
</html>
""",
        subtype="html",
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(smtp_email, smtp_password)
        server.send_message(msg)


def send_contact_email(name: str, email: str, message: str):
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    msg = EmailMessage()
    msg["Subject"] = f"New Contact Message – {name}"
    msg["From"] = f"GreenCode Insight <{smtp_email}>"
    msg["To"] = smtp_email
    msg["Reply-To"] = email

    msg.set_content(
        f"""
New Contact Message

Name: {name}
Email: {email}

Message:
{message}
"""
    )

    msg.add_alternative(
        f"""
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#0b0e14; font-family:Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; padding:24px;">

      <div style="
        background:#111827;
        border-radius:14px;
        padding:32px;
        color:#e5e7eb;
        box-shadow:0 10px 35px rgba(0,0,0,0.45);
      ">

        <h1 style="
          margin:0 0 12px 0;
          font-size:22px;
          color:#ffffff;
        ">
          GreenCode Insight
        </h1>

        <p style="
          margin:0 0 24px 0;
          font-size:14px;
          color:#c7d2fe;
        ">
          You’ve received a new message from the Contact page.
        </p>

        <div style="
          background:#020617;
          border:1px solid #1f2937;
          border-radius:12px;
          padding:18px;
          margin-bottom:24px;
        ">
          <p style="margin:0 0 6px 0; font-size:13px; color:#9ca3af;">
            <strong>Name:</strong> {name}
          </p>
          <p style="margin:0 0 6px 0; font-size:13px; color:#9ca3af;">
            <strong>Email:</strong> {email}
          </p>
        </div>

        <p style="
          font-size:15px;
          line-height:1.7;
          color:#e5e7eb;
          white-space:pre-wrap;
        ">
          {message}
        </p>

        <hr style="
          margin:32px 0;
          border:none;
          border-top:1px solid #1f2937;
        ">

        <p style="
          margin:0;
          font-size:12px;
          color:#6b7280;
          text-align:center;
        ">
          © 2026 GreenCode Insight
          <br />
          Secure • Sustainable • Smart Code
        </p>

      </div>
    </div>
  </body>
</html>
""",
        subtype="html",
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
