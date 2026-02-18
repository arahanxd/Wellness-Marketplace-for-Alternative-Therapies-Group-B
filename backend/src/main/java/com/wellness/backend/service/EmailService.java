package com.wellness.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public void sendVerificationEmail(String to, String token) {
        String verificationUrl = "http://localhost:5173/verify?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Email Verification");
        message.setText("Welcome to Wellness Hub!\n\n" +
                "Please verify your email by clicking the link below:\n" +
                verificationUrl + "\n\n" +
                "If you did not create an account, please ignore this email.");

        sendEmail(message);
    }

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Your OTP Verification Code");
        message.setText("Welcome to Wellness Hub!\n\n" +
                "Your OTP code for registration is: " + otp + "\n\n" +
                "This code will expire in 10 minutes.\n" +
                "If you did not request this, please ignore this email.");
        sendEmail(message);
    }

    public void sendApprovalEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Account Approved");
        message.setText("Congratulations!\n\n" +
                "Your Wellness Hub account has been approved by the admin. You can now access all professional features.\n\n"
                +
                "Login here: http://localhost:5173/login");
        sendEmail(message);
    }

    public void sendRejectionEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Account Application Update");
        message.setText("Hello,\n\n" +
                "We regret to inform you that your application for a Wellness Hub professional account has been rejected at this time.\n"
                +
                "If you believe this is an error, please contact support.");
        sendEmail(message);
    }

    public void sendForgotPasswordEmail(String to, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Password Reset");
        message.setText("Hello,\n\n" +
                "Your password has been reset as requested.\n" +
                "Temporary Password: " + newPassword + "\n\n" +
                "Please login and change your password as soon as possible for security reasons.\n" +
                "Login here: http://localhost:5173/login");
        sendEmail(message);
    }

    private void sendEmail(SimpleMailMessage message) {
        String recipient = (message.getTo() != null && message.getTo().length > 0) ? message.getTo()[0] : "unknown";
        try {
            log.info("📧 Attempting to send email to {}...", recipient);
            mailSender.send(message);
            log.info("✅ Email sent successfully to {}", recipient);
        } catch (org.springframework.mail.MailException e) {
            log.error("❌ SMTP Error while sending to {}: {}", recipient, e.getMessage());
            throw e; // Rethrow for @Retryable if applicable, or for the controller catch
        }
    }

    @Recover
    public void recover(Exception e, SimpleMailMessage message) {
        String recipient = (message.getTo() != null && message.getTo().length > 0) ? message.getTo()[0] : "unknown";
        log.error("❌ FINAL FAILURE: Could not send email to {} after retries. Error: {}", recipient, e.getMessage());
    }
}
