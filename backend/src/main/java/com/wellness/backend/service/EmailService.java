package com.wellness.backend.service;

import com.sendgrid.SendGrid;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.Method;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Content;
import com.wellness.backend.model.Booking;
import com.wellness.backend.model.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.retry.annotation.Recover;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;

import java.io.IOException;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${SENDGRID_API_KEY:}")
    private String apiKey;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_REAL_SENDGRID_API_KEY")) {
            log.warn("❌ SENDGRID_API_KEY is not configured!");
        } else {
            log.info("✅ SendGrid API key loaded.");
        }
    }

    public void sendVerificationEmail(String to, String token) {
        String verificationUrl = "http://localhost:5173/verify?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Email Verification");
        message.setText("Verify your email: " + verificationUrl);
        sendEmail(message);
    }

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Your OTP Verification Code");
        message.setText("Your OTP code is: " + otp);
        sendEmail(message);
    }

    public void sendApprovalEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Account Approved");
        message.setText("Your account has been approved.");
        sendEmail(message);
    }

    public void sendRejectionEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Account Application Update");
        message.setText("Your application has been rejected.");
        sendEmail(message);
    }

    public void sendForgotPasswordEmail(String to, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Wellness Hub - Password Reset");
        message.setText("Your logic password has been reset: " + newPassword);
        sendEmail(message);
    }

    public void sendSessionConfirmedToClient(Booking booking) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(booking.getClient().getEmail());
        message.setSubject("✅ Wellness Hub – Session Confirmed!");
        message.setText(String.format("Dear %s,\n\nYour session with %s on %s at %s has been confirmed.\n\nBest regards,\nWellness Hub",
                booking.getClient().getName(), booking.getProvider().getName(), booking.getSessionDate(), booking.getStartTime()));
        sendEmail(message);
    }

    public void sendSessionRejectedToClient(Booking booking) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(booking.getClient().getEmail());
        message.setSubject("❌ Wellness Hub – Session Request Update");
        message.setText(String.format("Dear %s,\n\nUnfortunately, your session request with %s on %s was rejected.\n\nBest regards,\nWellness Hub",
                booking.getClient().getName(), booking.getProvider().getName(), booking.getSessionDate()));
        sendEmail(message);
    }

    public void sendSessionCancelledEmail(Booking booking, UserEntity canceller) {
        UserEntity recipient = canceller.getId().equals(booking.getProvider().getId()) ? booking.getClient() : booking.getProvider();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(recipient.getEmail());
        message.setSubject("🚫 Wellness Hub – Session Cancelled");
        message.setText(String.format("Dear %s,\n\nYour session on %s at %s has been cancelled by %s.\n\nBest regards,\nWellness Hub",
                recipient.getName(), booking.getSessionDate(), booking.getStartTime(), canceller.getName()));
        sendEmail(message);
    }

    public void sendSessionCompletedEmail(Booking booking) {
        String commonText = String.format("The session on %s at %s is COMPLETED.", 
                booking.getSessionDate(), booking.getStartTime());
        sendImmediateSendGridEmail(booking.getClient().getEmail(), "✅ Session Completed", "Dear " + booking.getClient().getName() + ",\n\n" + commonText);
        sendImmediateSendGridEmail(booking.getProvider().getEmail(), "✅ Session Completed", "Dear " + booking.getProvider().getName() + ",\n\n" + commonText);
    }

    public void sendSessionNotCompletedEmail(Booking booking) {
        String commonText = String.format("The session on %s at %s is NOT COMPLETED. A refund has been issued.", 
                booking.getSessionDate(), booking.getStartTime());
        sendImmediateSendGridEmail(booking.getClient().getEmail(), "⚠️ Session Not Completed", "Dear " + booking.getClient().getName() + ",\n\n" + commonText);
        sendImmediateSendGridEmail(booking.getProvider().getEmail(), "⚠️ Session Not Completed", "Dear " + booking.getProvider().getName() + ",\n\n" + commonText);
    }

    public String sendScheduledReminder(String to, String subject, String body, long sendAt) {
        if (apiKey == null || apiKey.isBlank()) return null;
        Email from = new Email(fromEmail);
        Email recipient = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, recipient, content);
        mail.setSendAt(sendAt);
        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return response.getHeaders().getOrDefault("X-Message-Id", "SENT");
            }
            return null;
        } catch (IOException ex) {
            log.error("SendGrid error: {}", ex.getMessage());
            return null;
        }
    }

    private void sendEmail(SimpleMailMessage message) {
        try {
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
        }
    }

    private void sendImmediateSendGridEmail(String to, String subject, String body) {
        if (apiKey == null || apiKey.isBlank()) return;
        Email from = new Email(fromEmail);
        Email recipient = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, recipient, content);
        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);
        } catch (IOException ex) {
            log.error("SendGrid immediate error: {}", ex.getMessage());
        }
    }

    @Recover
    public void recover(Exception e, SimpleMailMessage message) {
        log.error("Final email failure: {}", e.getMessage());
    }
}
