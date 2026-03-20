-- Seed data for Wellness Marketplace

-- 1. Users (Admins, Providers, Clients)
-- Password for all is 'password123' (BCrypt: $2a$10$8.t9S5u/WjF.c7l7B.B0De.8R8hL9z1S7wN/7d8q5y9f4g2h1j3k.)
-- Admin: admin123 (BCrypt: $2a$10$Pj9kX0JfP2H4hG5v8yO3kOvL7H5bJgL8W1cQpG6n8fVtR9xH1yI5e)

INSERT INTO users (id, name, email, password, role, city, country, verified, email_verified, verification_status) VALUES
(1, 'Admin User', '***REMOVED***', '$2a$10$Pj9kX0JfP2H4hG5v8yO3kOvL7H5bJgL8W1cQpG6n8fVtR9xH1yI5e', 'ADMIN', 'Bangalore', 'India', TRUE, TRUE, 'APPROVED'),
(2, 'Dr. Sarah Smith', '***REMOVED***', '$2a$10$8.t9S5u/WjF.c7l7B.B0De.8R8hL9z1S7wN/7d8q5y9f4g2h1j3k.', 'PROVIDER', 'Mumbai', 'India', TRUE, TRUE, 'APPROVED'),
(3, 'John Doe', '***REMOVED***', '$2a$10$8.t9S5u/WjF.c7l7B.B0De.8R8hL9z1S7wN/7d8q5y9f4g2h1j3k.', 'CLIENT', 'Delhi', 'India', TRUE, TRUE, 'APPROVED'),
(4, 'Dr. Robert Brown', '***REMOVED***', '$2a$10$8.t9S5u/WjF.c7l7B.B0De.8R8hL9z1S7wN/7d8q5y9f4g2h1j3k.', 'PROVIDER', 'Pune', 'India', TRUE, TRUE, 'APPROVED');

-- 2. Products
INSERT INTO products (product_id, name, description, price, image_url, provider_id, discount_percentage) VALUES
(1, 'Healing Herbal Tea', 'Fine blend of organic herbs for relaxation.', 25.00, 'herbal_tea.jpg', 2, 10),
(2, 'Aromatherapy Oil', 'Lavender essential oil for stress relief.', 45.00, 'essential_oil.jpg', 2, 0),
(3, 'Meditation Cushion', 'Ergonomic cushion for long meditation sessions.', 60.00, 'cushion.jpg', 4, 15);

-- 3. Therapy Sessions
INSERT INTO therapy_sessions (id, name, description, duration_minutes, price, practitioner_id, specialization, image_url) VALUES
(1, 'Mindful Meditation', 'A guided session to help you find inner peace.', 60, 100.00, 2, 'Meditation', 'meditation.jpg'),
(2, 'Holistic Healing', 'Deep tissue massage and energy alignment.', 90, 150.00, 4, 'Massage Therapy', 'healing.jpg');

-- 4. Bookings
INSERT INTO bookings (id, booking_date, notes, practitioner_id, status, user_id, session_fee, duration) VALUES
(1, '2026-03-20 10:00:00', 'Tension in shoulders.', 4, 'CONFIRMED', 3, 150.00, 90),
(2, '2026-03-22 14:00:00', 'First meditation session.', 2, 'PENDING', 3, 100.00, 60);

-- 5. Forum Content
INSERT INTO forum_questions (id, title, content, user_id, product_id, upvotes, view_count) VALUES
(1, 'Best tea for sleep?', 'I have trouble sleeping and want to try herbal options.', 3, 1, 5, 120),
(2, 'How to use essential oils?', 'Can I apply them directly to skin?', 3, 2, 2, 45);

INSERT INTO forum_answers (id, content, user_id, question_id, upvotes, is_accepted) VALUES
(1, 'Try the Healing Herbal Tea, it works wonders!', 2, 1, 10, TRUE),
(2, 'Always dilute them with a carrier oil first.', 4, 2, 3, FALSE);

INSERT INTO forum_comments (id, content, user_id, answer_id) VALUES
(1, 'Thanks for the tip, Dr. Sarah!', 3, 1);

-- 6. Reports (Sample)
INSERT INTO reports (report_id, reporter_id, reported_by_user_id, reported_entity_id, entity_type, reason, status, comment) VALUES
(1, 3, 3, 2, 'FORUM_ANSWER', 'OFFENSIVE', 'PENDING', 'This answer is misleading.');
