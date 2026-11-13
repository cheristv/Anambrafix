# ANAMBRAFIX
### Your Community. Your Voice.

A digital civic reporting platform connecting Anambra State residents with community information, public services, and opportunities to participate in community development.

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-087A43)](https://github.com/cheristv/Anambrafix)
[![Framework](https://img.shields.io/badge/Framework-Expo-4630EB)](https://expo.dev/)
[![Language](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![Backend](https://img.shields.io/badge/Backend-Supabase-3ECF8E)](https://supabase.com/)

---

## 1. Project Overview

**AnambraFix** is a digital civic engagement and community reporting platform designed to improve communication between residents and their communities across Anambra State, Nigeria.

The platform provides a centralized digital environment where citizens can access relevant government and community information, submit reports about issues affecting their surroundings, receive announcements, and stay informed about development projects and public services.

AnambraFix is built around the idea that community development begins with accessible information, citizen participation, transparency, and effective communication.

Its goal is to make it easier for residents to find useful information, raise concerns, and remain connected to the development of their communities.

## 2. Problem Statement

Many communities experience challenges relating to communication, access to public information, reporting of community problems, and awareness of government activities.

Traditional reporting channels may be difficult to access, while important announcements and public-service information can be scattered across different platforms.

AnambraFix addresses these challenges by providing a centralized digital platform that aims to:

- Improve access to community and government information.
- Provide a digital channel for reporting community problems.
- Increase awareness of public announcements and development projects.
- Make important public-service information easier to access.
- Encourage citizen participation in community development.

## 3. Project Objectives

The major objectives of AnambraFix are to:

1. Develop a user-friendly digital platform for residents of Anambra State.
2. Provide a convenient system for reporting community issues.
3. Improve access to relevant government and public information.
4. Provide information about community development projects.
5. Make emergency and hospital information accessible.
6. Support user accounts, profiles, and notification features.
7. Promote digital civic engagement and community awareness.

## 4. Key Features

### Citizen Reporting
Allows users to access the reporting section and submit information about issues affecting their communities.

### Community Projects
Provides a section for viewing community development projects and related information.

### Announcements
Provides access to important announcements and updates relevant to residents.

### Emergency Information
Includes an emergency information section designed to make important emergency-related information easier to access.

### Hospital Information
Provides a dedicated section for hospital-related information.

### Government Information
Organizes information about government leadership, including:

- Governors.
- Government chairmen.
- Government history.
- Related government information.

### User Authentication
Includes registration, login, email confirmation, and account-related functionality.

### User Profiles
Provides a profile section for users to manage their account information.

### Notifications
Includes a notification section for keeping users informed about relevant updates.

### Application Settings
Provides settings for application preferences, including appearance customization.

### Responsive Web Experience
The application supports web export through Expo, allowing it to be accessed through a web browser.

## 5. Technology Stack

AnambraFix is developed using modern cross-platform application technologies.

| Technology | Purpose |
|---|---|
| React Native | Cross-platform application development |
| Expo | Development and deployment framework |
| Expo Router | File-based application navigation |
| TypeScript | Type-safe application development |
| Supabase | Backend services and database integration |
| Supabase Auth | User authentication |
| Git | Version control |
| GitHub | Source-code hosting |

## 6. Application Architecture

The project follows a modular structure to make the application easier to maintain and extend.

```text
AnambraFix/
│
├── app/
│   ├── auth/
│   │   └── callback.tsx
│   │
│   ├── project/
│   │   └── [id].tsx
│   │
│   ├── index.tsx
│   ├── home.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── report.tsx
│   ├── my-reports.tsx
│   ├── projects.tsx
│   ├── announcements.tsx
│   ├── emergency.tsx
│   ├── hospitals.tsx
│   ├── government.tsx
│   ├── government-governors.tsx
│   ├── government-chairmen.tsx
│   ├── government-history.tsx
│   ├── profile.tsx
│   ├── notifications.tsx
│   ├── settings.tsx
│   └── appearance.tsx
│
├── assets/
│   └── Application images and branding
│
├── components/
│   ├── AppButton.tsx
│   └── AppTextInput.tsx
│
├── constants/
│   └── colors.ts
│
├── context/
│   └── ThemeContext.tsx
│
├── lib/
│   └── supabase.ts
│
├── public/
│   ├── manifest.json
│   ├── app-icon.png
│   └── apple-touch-icon.png
│
├── App.js
├── app.json
├── index.js
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 7. Installation and Setup

Follow these instructions to run AnambraFix locally.

### Prerequisites

Install the following:

- Node.js
- npm
- Git
- A Supabase account
- Expo development tools

### Step 1: Clone the Repository

```bash
git clone https://github.com/cheristv/Anambrafix.git
```

### Step 2: Enter the Project Directory

```bash
cd Anambrafix
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root.

Add your Supabase project credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Replace the placeholders with your actual Supabase project values.

**Security:** Never upload your `.env` file, Supabase service-role keys, database passwords, or other private credentials to GitHub.

### Step 5: Start the Application

```bash
npx expo start
```

To run the web version:

```bash
npx expo start --web
```

## 8. Backend and Database

AnambraFix uses Supabase for backend services.

The Supabase integration is configured in:

```text
lib/supabase.ts
```

The application uses Supabase environment variables to connect to the configured backend.

Backend functionality depends on the corresponding Supabase project configuration, database objects, authentication settings, and access policies.

For a complete deployment, the required backend configuration must be maintained separately from the public source-code repository.

## 9. Security Considerations

Security and responsible handling of user information are important considerations in the development of AnambraFix.

The project follows these principles:

- Environment variables are excluded from Git uploads.
- Private backend credentials must not be exposed in client-side code.
- Supabase authentication is used for account-related functionality.
- Database access should be controlled through appropriate Row Level Security policies.
- Sensitive operations should be protected by appropriate authentication and authorization checks.

**Demo configuration notice:** The current demonstration version routes visitors from the startup screen directly to the home screen. This is a temporary demonstration arrangement. Authentication and authorization protections must be restored and verified for protected functionality before a production release.

## 10. Expected Benefits

AnambraFix is intended to provide benefits to both residents and the wider community.

**For residents:**

- Easier access to relevant information.
- A convenient digital reporting channel.
- Better awareness of community projects.
- Access to organized public-service information.

**For communities:**

- Improved digital communication.
- Greater opportunities for citizen participation.
- Better visibility of community concerns.
- Support for community awareness and development.

**For public administration:**

- An additional digital communication channel.
- A platform that can support more organized citizen engagement.
- Opportunities to improve access to public information.

## 11. Future Improvements

Future development opportunities include:

- A dedicated administrative management platform.
- Improved report tracking and status updates.
- Administrative management of announcements.
- Homepage promotional and information management.
- Improved notification delivery.
- Expanded community information services.
- Additional reporting and analytics capabilities.
- Further security, accessibility, and performance improvements.

These improvements are intended to support the long-term development of AnambraFix.

## 12. AI Tools and Development Assistance

Artificial Intelligence (AI) tools, particularly ChatGPT, were used as supporting resources during the development of AnambraFix.

However, AnambraFix was not entirely generated or developed by AI. The developer actively participated in the planning, implementation, configuration, testing, troubleshooting, and technical decision-making throughout the project.

AI assistance was used where necessary to support and improve the development process, including:

- **Debugging and troubleshooting:** Helping identify programming errors, understand their causes, and explore possible solutions.
- **Code explanation:** Explaining programming concepts, functions, and technical implementations.
- **Problem-solving:** Providing guidance when encountering technical challenges during development.
- **Code improvement:** Suggesting improvements to code structure, readability, and organization.
- **Technical guidance:** Supporting the integration and use of React Native, Expo, TypeScript, and Supabase.
- **UI/UX improvement:** Exploring ideas for improving the application's interface and user experience.
- **Documentation:** Assisting with technical documentation and project write-up.

AI tools served as development assistants and problem-solving resources, not as replacements for the developer's work, judgment, or involvement.

The developer remained actively responsible for the project's direction, implementation, configuration, testing, review, and overall development.

## 13. Project Information

**Project Name:** AnambraFix

**Project Slogan:** Your Community. Your Voice.

**Project Category:** Civic Technology / Community Development

**Project Type:** Cross-Platform Mobile and Web Application

**Primary Location:** Anambra State, Nigeria

**Developer:** EYAH CHRISTIAN CHINECHEREM

**Department:** Computer Science

**Institution:** Chukwuemeka Odumegwu Ojukwu University

**Head of Department:** Prof. Ike Mbgbeafuike

## 14. Repository

GitHub Repository:

https://github.com/cheristv/Anambrafix

## 15. License

This project includes a LICENSE file in the repository. Refer to that file for the applicable licensing terms.

---

## Conclusion

AnambraFix represents an effort to use technology to address practical community challenges through digital communication, civic reporting, accessible information, and citizen participation.

By bringing relevant community information and reporting features into one platform, AnambraFix aims to contribute to a more informed, connected, and digitally engaged Anambra State.

**ANAMBRAFIX — Your Community. Your Voice.**
