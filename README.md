# Wellness Marketplace for Alternative Therapies

**React • TypeScript • Spring Boot • MySQL • Java**

**Milestone 2 (Week 3–4) – Booking, Sessions & Product Marketplace**

A full-stack web application that enables users to register as Clients or Practitioners, manage profiles, book therapy sessions, and purchase wellness products through a secure and scalable platform.

---

# 👥 Team Members

* Aditi – Backend Developer
* Arahan Jain – FullStack Developer and Tester
* Hemamalini – Backend Developer
* Poojitha – Backend Developer
* Thanga Kumar – Backend Developer and Tester
* Sudhan – Frontend Developer

---

# 📋 Table of Contents

* Problem Statement
* Milestone 1 Features
* Milestone 2 Features
* Tech Stack
* Prerequisites
* Installation
* Database Setup
* Running the Application
* Project Structure
* Security Features

---

# 🎯 Problem Statement

In the alternative therapy ecosystem, users often struggle to:

* Identify verified practitioners
* Register securely with role-based access
* Book therapy sessions with available practitioners
* Track booking history and session activity
* Purchase wellness products recommended by practitioners

This project focuses on building a **secure wellness marketplace platform** that connects clients with verified practitioners while providing booking management and a product marketplace.

---

# 🚀 Milestone 1 (Week 1–2)

## Implemented

* Registration & Login with JWT Authentication
* Role-based access (CLIENT, PROVIDER, ADMIN)
* Practitioner profile creation
* Specialization tagging
* Practitioner document upload
* Admin verification workflow
* User dashboard foundation

---

# 🚀 Milestone 2 (Week 3–4)

## Implemented

* Practitioner therapy session creation
* Provider availability scheduling
* Client session booking system
* Booking status workflow (Pending / Accepted / Completed)
* Product marketplace for practitioners
* Product ordering system for clients
* Order tracking and history
* Notification system for booking updates
* Session and booking history for users

# 🚀 Milestone 3 (Week 5–6)

## Implemented

* Seamless wellness product browsing and discovery
* Secure product purchasing with cart management
* Interactive community forum for Q&A and discussions
* Product reviews and rating system

---

# 🛠️ Tech Stack

## Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS

## Backend

* Spring Boot 3
* Spring Security
* JWT Authentication
* Spring Data JPA
* Lombok

## Database

* MySQL 8

---

# 📦 Prerequisites

* Java 17+
* Node.js 18+
* npm
* MySQL 8+
* Maven
* Git

---

# 🚀 Installation

```bash
git clone https://github.com/arahanxd/Wellness-Marketplace-for-Alternative-Therapies.git
cd Wellness-Marketplace-for-Alternative-Therapies
```

---

# 🗄️ Database Setup

Open MySQL and run:

```sql
CREATE DATABASE wellness_marketplace;
```

If a database dump is provided (`wellness_marketplace.sql`), import it using **MySQL Workbench**:

Server → Data Import → Select File → Start Import

---

# ⚠️ Important: Database Credentials

The project uses:

```properties
spring.datasource.username=***REMOVED***
spring.datasource.password=***REMOVED***123
```

If your MySQL credentials are different, update:

```
backend/src/main/resources/application.properties
```

Modify:

```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Then restart the backend server.

---

## 🔑 Environment Setup

All sensitive credentials are stored in `.env` (ignored by Git).

Use `.env.example` as a template:

# Admin Credentials
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

# Database
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_jwt_secret_key

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# SMTP (Gmail)
SMTP_USERNAME=your_email@example.com
SMTP_PASSWORD=your_password

Instructions:
1) Copy `.env.example` → `.env`
2) Fill in your real credentials
3) Never commit `.env` with real secrets

# ▶ Running the Application

## Start Backend

```cmd
cd backend
mvn clean
mvn spring-boot:run
```

Backend runs at:

```
http://localhost:8080
```

---

## Start Frontend

```cmd
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔑 Admin Details

Admin credentials can be found in:

```
backend/.env
```

---

# ⚠️ Important: Database Credentials

Update backend/.env or application.properties with your credentials if different.

# 📁 Project Structure

```
.
├── backend
│   ├── src
│   │   ├── main
│   │   │   ├── java/com/wellness/backend
│   │   │   │   ├── config
│   │   │   │   ├── controller
│   │   │   │   ├── dto
│   │   │   │   ├── exception
│   │   │   │   ├── model
│   │   │   │   ├── repository
│   │   │   │   ├── scheduler
│   │   │   │   ├── service
│   │   │   │   ├── user
│   │   │   │   └── util
│   │   │   └── resources
│   │   │       ├── application.properties
│   │   │       ├── data.sql
│   │   │       ├── db/migration
│   │   │       ├── schema.sql
│   │   │       └── session_booking_schema.sql
│   └── pom.xml
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── api.ts
│   │   ├── assets
│   │   ├── components
│   │   ├── config.ts
│   │   ├── constants
│   │   ├── pages
│   │   ├── utils
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
│
├── .vscode
├── LICENSE.txt
├── README.md
├── TODO.md
├── test-booking.js
└── wellness_marketplace.sql
```

---

# 🔒 Security Features

* BCrypt password encryption
* JWT-based stateless authentication
* Role-based authorization
* Secure practitioner verification workflow

---

# 🏆 Milestone Outcomes

## Milestone 1

* Functional Login/Register system
* Profile setup page
* Practitioner verification module

## Milestone 2

* Therapy session booking system
* Practitioner availability scheduling
* Wellness product marketplace
* Product ordering and tracking
* Booking and order history

## Milestone 3

* Seamless wellness product browsing and discovery – Users can explore products by category, popularity, and practitioner recommendations.
* Secure product purchasing and cart management – Easy add-to-cart, checkout, and order tracking experience.
* Interactive community forum – Ask questions, share experiences, and engage with practitioners and other clients.
* Product reviews and ratings system – Users can submit feedback and rate products to guide others.

---

# 📌 Upcoming Features

* AI-powered symptom-based recommendations – Users receive personalized wellness and therapy suggestions based on their symptoms and health data.
* Integration with external health and fitness APIs – Connect with OpenFDA, WHO, and fitness tracking services for enriched data and insights.
* Smart notifications and analytics dashboard – Real-time updates for bookings, product recommendations, and user activity, plus insightful analytics for both clients and practitioners.