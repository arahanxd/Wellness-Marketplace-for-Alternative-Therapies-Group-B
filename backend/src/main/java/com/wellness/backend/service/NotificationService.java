package com.wellness.backend.service;

import com.wellness.backend.dto.NotificationDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.Booking;
import com.wellness.backend.model.NotificationEntity;
import com.wellness.backend.model.NotificationType;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.NotificationRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id, String email) {
        NotificationEntity notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));

        if (!notification.getRecipient().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalStateException("You are not allowed to modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyBookingRequest(Booking booking) {
        UserEntity practitioner = booking.getProvider();
        String clientName = booking.getClient().getName();
        String message = "New booking request from " + clientName;
        createNotification(practitioner, NotificationType.BOOKING_REQUEST, message, booking.getId());
    }

    @Transactional
    public void notifySessionConfirmedForClient(Booking booking) {
        UserEntity client = booking.getClient();
        String providerName = booking.getProvider().getName();
        String message = String.format("✅ Dr. %s has confirmed your session on %s at %s",
                providerName, booking.getSessionDate(), booking.getStartTime());
        createNotification(client, NotificationType.SESSION_CONFIRMED, message, booking.getId());
    }

    @Transactional
    public void notifySessionRejectedForClient(Booking booking) {
        UserEntity client = booking.getClient();
        String message = "Your session request was rejected.";
        createNotification(client, NotificationType.SESSION_REJECTED, message, booking.getId());
    }

    @Transactional
    public void notifySessionRescheduleSuggested(Booking booking) {
        UserEntity client = booking.getClient();
        String providerName = booking.getProvider().getName();
        String message = String.format("🔄 Dr. %s suggested a new time on %s at %s",
                providerName, booking.getSessionDate(), booking.getStartTime());
        createNotification(client, NotificationType.SESSION_RESCHEDULE_SUGGESTED, message, booking.getId());
    }

    @Transactional
    public void notifySessionReminder(Booking booking) {
        UserEntity client = booking.getClient();
        UserEntity provider = booking.getProvider();

        String clientMsg = String.format("Reminder: your session with Dr. %s starts at %s",
                provider.getName(), booking.getStartTime());
        String providerMsg = String.format("Reminder: your session with %s starts at %s",
                client.getName(), booking.getStartTime());

        createNotification(client, NotificationType.SESSION_REMINDER, clientMsg, booking.getId());
        createNotification(provider, NotificationType.SESSION_REMINDER, providerMsg, booking.getId());
    }

    @Transactional
    public void notifySessionCancelled(Booking booking, UserEntity canceller) {
        boolean cancelledByProvider = canceller.getId().equals(booking.getProvider().getId());
        UserEntity recipient = cancelledByProvider ? booking.getClient() : booking.getProvider();
        String message = String.format("🚫 %s has cancelled the session scheduled for %s at %s",
                canceller.getName(), booking.getSessionDate(), booking.getStartTime());
        createNotification(recipient, NotificationType.SESSION_CANCELLED, message, booking.getId());
    }

    @Transactional
    public void notifySessionNotCompleted(Booking booking) {
        UserEntity client = booking.getClient();
        UserEntity provider = booking.getProvider();
        String message = String.format("⚠️ Session on %s at %s was marked as not completed. A refund has been initiated.",
                booking.getSessionDate(), booking.getStartTime());
        createNotification(client, NotificationType.SESSION_NOT_COMPLETED, message, booking.getId());
        createNotification(provider, NotificationType.SESSION_NOT_COMPLETED, message, booking.getId());
    }

    @Transactional
    public void notifySessionCompleted(Booking booking) {
        UserEntity client = booking.getClient();
        UserEntity provider = booking.getProvider();
        String message = String.format("✅ Your session on %s at %s has been marked as COMPLETED.",
                booking.getSessionDate(), booking.getStartTime());
        createNotification(client, NotificationType.SESSION_COMPLETED, message, booking.getId());
        createNotification(provider, NotificationType.SESSION_COMPLETED, message, booking.getId());
    }

    private void createNotification(UserEntity recipient, NotificationType type, String message, Long relatedId) {
        if (notificationRepository.existsByRecipient_IdAndTypeAndRelatedBookingId(recipient.getId(), type, relatedId)) {
            return;
        }
        NotificationEntity entity = new NotificationEntity();
        entity.setRecipient(recipient);
        entity.setType(type);
        entity.setMessage(message);
        entity.setRelatedBookingId(relatedId);
        entity.setRead(false);
        notificationRepository.save(entity);
    }

    private NotificationDTO toDto(NotificationEntity entity) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(entity.getId());
        dto.setType(entity.getType());
        dto.setMessage(entity.getMessage());
        dto.setRead(entity.isRead());
        dto.setRelatedBookingId(entity.getRelatedBookingId());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
