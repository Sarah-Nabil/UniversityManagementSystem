# University Management System

A full-stack University Management System built with **ASP.NET Core Web API (.NET 8), C#, Entity Framework Core, SQL Server, HTML, Tailwind CSS, and JavaScript**.

The project provides a centralized platform for managing university data, including students, teachers, departments, courses, and enrollments. It features an administrative dashboard, authentication, authorization, and a responsive web interface connected to a RESTful backend API.

## 🎥 Project Demo

**[▶ Watch the University Management System Demo](https://drive.google.com/file/d/1rr49rMaPHCUUGEtX5ELB00OKM6_fxlCC/view?usp=sharing)**

Watch the video to see the application running and explore its interface and main features.

## ✨ Features

### 1. Authentication & Account Management

- User login with email and password.
- JWT-based authentication.
- Access token and refresh token handling.
- Refresh token rotation and revocation.
- Secure password hashing using BCrypt.
- Change password with current-password verification.
- Validation of authenticated user identity.
- Rate limiting for login and token refresh requests.

### 2. Admin Dashboard

- Centralized overview of university data.
- Summary counts for students, teachers, courses, and enrollments.
- Recent enrollment information.
- Navigation to the main management sections.
- Access to administrative features according to user permissions.

### 3. Student Management

- View and manage student records.
- Add new students.
- Update existing student information.
- Delete student records.
- Search and navigate student information through the management interface.
- Manage student details such as name, email, department, academic level, and contact information.
- Associate student accounts with the appropriate user identity and role.

### 4. Teacher Management

- View teacher records.
- Add new teachers.
- Update teacher information.
- Delete teacher records.
- Search and review teacher information.
- Display relevant information such as name, email, department, academic degree, and assigned course where available.

### 5. Department Management

- View university departments.
- Add new departments.
- Update department information.
- Delete departments.
- Search and manage department records through the interface.

### 6. Course Management

- View available courses.
- Add new courses.
- Update course information.
- Delete courses.
- Search and manage course records.
- Support the relationships between courses, departments, and teaching assignments.

### 7. Enrollment Management

- View student enrollment records.
- Manage enrollment information.
- Support the relationship between students and courses.
- Review recent enrollment activity through the administrative dashboard.

### 8. Settings & User Experience

- Dedicated settings page.
- Change password functionality.
- Consistent navigation between management pages.
- Dark-themed interface.
- Shared authentication handling for protected API requests.
- JavaScript-based integration between the frontend and backend.

## 🖥️ Frontend Technologies

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and forms |
| Tailwind CSS | Styling and responsive UI |
| JavaScript | API integration and interactive behavior |
| Fetch API | HTTP requests to the backend |
| Local Storage | Persisting the access token and user information |
| Session Storage | Storing the refresh token during the browser session |

The frontend is organized into separate pages and JavaScript files, keeping the user interface separate from the backend business logic.

## ⚙️ Backend Technologies

| Technology | Purpose |
|---|---|
| C# | Backend programming language |
| ASP.NET Core Web API (.NET 8) | REST API and HTTP endpoints |
| Entity Framework Core | Object-relational mapping and database access |
| SQL Server | Relational database |
| LINQ | Querying and manipulating data |
| DTOs | Controlling request and response data |
| Dependency Injection | Managing application dependencies |
| JWT Bearer Authentication | Securing API requests |
| BCrypt.Net-Next | Password and refresh token hashing |
| Swagger / OpenAPI | API documentation and testing |
| Asynchronous Programming | Non-blocking database and service operations |

## 🏗️ Backend Architecture

The backend is organized into separate projects, following a layered architecture inspired by Clean Architecture principles.

```text
UniversitySystem/
│
├── Domain/
│   └── Entities and core domain models
│
├── Application/
│   ├── DTOs/
│   ├── Interfaces/
│   └── Services/
│
├── Infrastructure/
│   ├── Persistence/
│   ├── Repositories/
│   └── Security/
│
└── UniversitySystem/
    ├── Controllers/
    ├── Program.cs
    └── Configuration
```

### Layer Responsibilities

- **Domain:** Contains the core entities and domain models.
- **Application:** Contains DTOs, service interfaces, repository interfaces, and application services.
- **Infrastructure:** Implements database access, repositories, password hashing, and token generation.
- **UniversitySystem API:** Exposes HTTP endpoints through controllers and configures authentication, authorization, dependency injection, CORS, and rate limiting.

This separation improves maintainability, organization, and the ability to test and extend the application.

## 🔐 Security Implementation

Security is an important part of the backend design.

- **JWT validation:** Validates token issuer, audience, lifetime, and signing key.
- **Role-based authorization:** Restricts protected operations according to user roles.
- **Custom authorization policy:** Implements a `StudentOwnerOrAdmin` policy for student-related access control.
- **Password hashing:** Uses BCrypt instead of storing passwords as plain text.
- **Refresh token security:** Generates cryptographically random refresh tokens and stores their hashes rather than the raw token values.
- **Refresh token rotation:** Issues a replacement refresh token when a valid refresh token is used.
- **Rate limiting:** Limits login and refresh requests to five requests per minute per IP address under the configured policy.
- **Access-denied logging:** Logs information about forbidden requests.
- **CORS configuration:** Restricts browser-based cross-origin requests to the configured frontend origin.

## 🔌 API Overview

The API exposes endpoints through ASP.NET Core controllers.

| Area | Main operations |
|---|---|
| Authentication | Login, refresh token, logout, change password |
| Students | Retrieve and manage student records |
| Teachers | Retrieve and manage teacher records |
| Departments | Retrieve and manage departments |
| Courses | Retrieve and manage courses |
| Enrollments | Retrieve and manage enrollment records |
| Admin Dashboard | Retrieve dashboard statistics and recent enrollment data |

### Authentication Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/Auth/Login` | Authenticate a user |
| POST | `/api/Auth/Refresh` | Renew authentication tokens |
| POST | `/api/Auth/Logout` | Revoke the refresh token |
| PUT | `/api/Auth/ChangePassword` | Change the authenticated user's password |

Protected endpoints use JWT Bearer authentication where required. Swagger is configured to support supplying a Bearer token when testing secured endpoints.

## 🗄️ Database

The application uses **Microsoft SQL Server** with Entity Framework Core.

The domain model includes entities and relationships for:

- Persons
- Students
- Teachers
- Users
- Roles
- Departments
- Courses
- Enrollments
- Teacher-course assignments

The system uses relational data modeling to connect user accounts with their associated identities and connect students, teachers, departments, courses, and enrollments.

A database backup is included in the repository under the `Database` directory.

## 🚀 Getting Started

### Prerequisites

- Visual Studio 2022 or another compatible .NET development environment.
- .NET 8 SDK.
- Microsoft SQL Server.
- SQL Server Management Studio (SSMS), recommended for database management.
- Visual Studio Code or another editor for the frontend.
- A browser for running and testing the application.

### 1. Clone the Repository

```bash
git clone https://github.com/Sarah-Nabil/UniversityManagementSystem.git
cd UniversityManagementSystem
```

### 2. Restore the Database

1. Open SQL Server Management Studio.
2. Restore the database using the backup file located in the `Database` directory.
3. Confirm the restored database name and SQL Server instance.

### 3. Configure the Backend

Open the backend solution in Visual Studio.

Configure the database connection string and JWT settings using your local development configuration or User Secrets.

The backend requires configuration values for:

- `ConnectionStrings:DefaultConnection`
- `Jwt:Key`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:ExpiresInMinutes`

Use your own local credentials and a strong secret key. Do not commit database passwords, JWT signing keys, or other secrets to GitHub.

### 4. Restore Dependencies

From the backend project directory, run:

```bash
dotnet restore
```

### 5. Run the Backend

Run the `UniversitySystem` API project from Visual Studio, or use:

```bash
dotnet run --project UniversitySystem/UniversitySystem.csproj
```

Run the command from the `UniversitySystem-Backend` directory. Confirm the HTTPS URL assigned to the API by your local launch settings.

In the Development environment, open the Swagger UI using the API's configured HTTPS address followed by `/swagger`.

### 6. Run the Frontend

1. Open the `UniversitySystem-Frontend` directory in Visual Studio Code.
2. Run the frontend using the Live Server extension or another local HTTP server.
3. Ensure that the frontend origin matches the CORS policy configured in the backend.
4. If the local frontend URL or backend HTTPS port differs from the configured values, update the relevant frontend API URLs and backend CORS configuration.

The current CORS policy allows the origin:

```text
http://127.0.0.1:5500
```

## 📁 Repository Structure

```text
UniversityManagementSystem/
│
├── Database/
│   └── UniversitySystemDatabase.bak
│
├── UniversitySystem-Backend/
│   ├── Domain/
│   ├── Application/
│   ├── Infrastructure/
│   └── UniversitySystem/
│
├── UniversitySystem-Frontend/
│   ├── HTML pages
│   └── JavaScript/
│
├── .gitignore
└── README.md
```

## 🎯 Project Goals

This project demonstrates practical application of:

- Building RESTful APIs with ASP.NET Core.
- Applying layered architecture and separation of concerns.
- Implementing authentication and authorization.
- Working with SQL Server and Entity Framework Core.
- Using repositories, services, DTOs, and dependency injection.
- Integrating a JavaScript frontend with a .NET backend.
- Managing related entities in a relational database.
- Implementing token-based authentication and security measures.

## 👩‍💻 Author

**Sarah Nabil**

GitHub: [Sarah-Nabil](https://github.com/Sarah-Nabil)

---

*University Management System — a full-stack project built to apply and demonstrate practical .NET development skills.*
