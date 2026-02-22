# Wellness Marketplace for Alternative Therapies
**React • TypeScript • Spring Boot • MySQL • Java**

Milestone 1 – Practitioner & User Profiles Module

A full-stack web application that enables users to register as Clients or Practitioners, manage profiles, and implement a secure practitioner verification system.

---

## 👥 Team Members
- Aditi – Backend Developer  
- Arahan Jain – Frontend Developer and Tester  
- Hemamalini – Backend Developer  
- Poojitha – Backend Developer  
- Thanga Kumar – Backend Developer and Tester  
- Sudhan – Frontend Developer  

---

## 📋 Table of Contents
- Problem Statement  
- Milestone 1 Features  
- Tech Stack  
- Prerequisites  
- Installation  
- Database Setup  
- Running the Application  
- Project Structure  
- Security Features  
- Backlog  

---

## 🎯 Problem Statement (Module 1)
In the alternative therapy ecosystem, users often struggle to:

- Identify verified practitioners  
- Register securely with role-based access  
- Manage professional profiles  
- Maintain authentication and session security  

This module focuses on building the foundational authentication and profile management system required for a scalable wellness marketplace.

---

## 🚀 Milestone 1 (Week 1–2)
### Implemented
- Registration & Login with JWT Authentication  
- Role-based access (CLIENT, PROVIDER, ADMIN)  
- Practitioner profile creation  
- Specialization tagging  
- Practitioner document upload  
- Admin verification workflow  
- User dashboard with session history structure  

---

## 🛠️ Tech Stack
### Frontend
- React 18  
- TypeScript  
- Vite  
- Tailwind CSS  

### Backend
- Spring Boot 3  
- Spring Security  
- JWT Authentication  
- Spring Data JPA  
- Lombok  

### Database
- MySQL 8  

---

## 📦 Prerequisites
- Java 17+  
- Node.js 18+  
- npm  
- MySQL 8+  
- Maven  
- Git  

---

## 🚀 Installation
```bash
git clone <https://github.com/arahanxd/Wellness-Marketplace-for-Alternative-Therapies.git>
cd Wellness-Marketplace-for-Alternative-Therapies
```

### 🗄️ Database Setup

Open MySQL and run : 
```sql
CREATE DATABASE wellness_marketplace;
```
If a database dump is provided (wellness_marketplace.sql), import it using MySQL Workbench:
Server → Data Import → Select File → Start Import

### ⚠️ Important: Database Credentials

The project uses : 
```properties
spring.datasource.username=root
spring.datasource.password=root123
```

If your MySQL credentials are different, update : 
```properties
backend/src/main/resources/application.properties
```

Modify : 
```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
Then restart the backend server.

### ▶ Running the Application
Start Backend

```cmd
cd backend
mvn clean
mvn spring-boot:run
```
Backend runs at : 
http://localhost:8080

Start Frontend

```cmd
cd frontend
npm install
npm run dev
```
Frontend runs at : 
http://localhost:5173

## 📁 Project Structure

```text
backend/
│
├── uploads/degrees/
├── src/main/resources/
├── src/main/java/com/wellness/backend/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── exception/
│   ├── model/
│   ├── repository/
│   ├── service/
│   ├── user/
│   ├── util/
│   └── WellnessBackendApplication.java
│
frontend/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── pages/
└── wellness_marketplace.sql
```

## 🔒 Security Features

- BCrypt password encryption
- JWT-based stateless authentication
- Role-based authorizatio
- Secure practitioner verification workflow

## 🏆 Milestone 1 Outcome

- Functional Login/Register system
- Profile setup page
- Practitioner verification module
- Role-based dashboards foundation

## 📌 Upcoming Features (Pending)

- Products tab where practitioners can list and sell their wellness products (e.g., medicines, therapy-related items)
- Users will be able to browse and purchase these products
- Product order history tracking for users
- Sales and order management history for practitioners