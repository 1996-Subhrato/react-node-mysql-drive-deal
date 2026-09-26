# 🚗 DRIVE DEAL — Enterprise Automotive Marketplace & Dealership Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.2.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.10-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand%205.0-4338CA?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![JWT](https://img.shields.io/badge/Auth-JWT%20Cookies-FF5722?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

---

## 📌 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Key Capabilities & Features](#-key-capabilities--features)
   - [Public Experience & Car Shoppers](#1-public-experience--car-shoppers)
   - [Customer / Buyer Portal](#2-customer--buyer-portal)
   - [Dealership & Seller Management](#3-dealership--seller-management)
   - [Platform Administration](#4-platform-administration)
3. [System Architecture](#-system-architecture)
   - [Frontend Architecture](#frontend-architecture)
   - [Backend Service Architecture](#backend-service-architecture)
   - [Data Tier](#data-tier)
4. [Database Architecture & Data Dictionary](#-database-architecture--data-dictionary)
   - [Entity Relationship Diagram (Conceptual)](#entity-relationship-diagram-conceptual)
   - [Table Specifications](#table-specifications)
5. [RESTful API Specification](#-restful-api-specification)
   - [Public Routes (`/api/v1`)](#public-routes-apiv1)
   - [Customer Routes (`/api/v1/user`)](#customer-routes-apiv1user)
   - [Seller Routes (`/api/v1/seller`)](#seller-routes-apiv1seller)
   - [Admin Routes (`/api/v1/admin`)](#admin-routes-apiv1admin)
6. [Security & Business Invariants](#-security--business-invariants)
7. [Automated Email & Notification System](#-automated-email--notification-system)
8. [Directory & Project Layout](#-directory--project-layout)
9. [Getting Started & Local Setup](#-getting-started--local-setup)
   - [Prerequisites](#prerequisites)
   - [1. Database Setup](#1-database-setup)
   - [2. Backend Setup](#2-backend-setup)
   - [3. Frontend Setup](#3-frontend-setup)
10. [Seed Accounts & Credentials](#-seed-accounts--credentials)
11. [Environment Configuration Reference](#-environment-configuration-reference)
12. [Troubleshooting & FAQ](#-troubleshooting--faq)
13. [License & Acknowledgments](#-license--acknowledgments)

---

## 📖 Executive Summary

**Drive Deal** is a full-stack, enterprise-ready B2C/C2B automotive marketplace and dealership showroom management platform. Designed for modern vehicle trading operations, it bridges car dealerships/private sellers with prospective automobile buyers through an intuitive, reactive user interface and a rock-solid, transactional backend.

The platform provides granular **Role-Based Access Control (RBAC)** across three distinct authorization domains: **Platform Administrators**, **Verified Dealerships / Sellers**, and **Registered Vehicle Buyers**, alongside a high-performance public vehicle exploration engine.

Built on an asynchronous **Node.js/Express** micro-ready architecture and backed by **MySQL 8.0** with connection pooling and relational cascading integrity, **Drive Deal** ensures strict data consistency, automated transaction workflows (inquiry → approval → sale → automated invoicing notice), KYC dealership compliance checks, and real-time email notifications.

---

## 🌟 Key Capabilities & Features

### 1. Public Experience & Car Shoppers
* **Dynamic Vehicle Exploration**: Real-time paginated catalog filtering by vehicle category (SUV, Sedan, Hatchback, etc.), brand, fuel type (*Petrol, Diesel, CNG, Electric, Hybrid*), transmission (*Manual, Automatic, CVT*), and budget brackets.
* **Smart Sorting Engine**: Multi-column sorting by price, mileage, brand, or listing date.
* **Side-by-Side Car Comparison**: Compare multiple vehicles head-to-head across critical specs (engine displacement, fuel economy, transmission, pricing, dimensions, and ownership history).
* **Comprehensive Vehicle Dossiers**: Detailed vehicle page showcasing high-definition media, comprehensive mechanical attributes, registration and chassis verification details, seller profile, and verified buyer reviews.
* **Social Proof & Reviews**: Verified customer ratings (1 to 5 stars) and feedback testimonials.

### 2. Customer / Buyer Portal
* **Streamlined Onboarding**: Registration with identity verification, avatar uploads, and automated welcome email onboarding.
* **Cookie-Secured JWT Session**: Stateless authentication backed by secure HTTP cookies (`UserToken`).
* **Interactive Buyer Dashboard**: High-level KPI summary displaying total purchase inquiries, pending dealer reviews, and finalized vehicle acquisitions.
* **Purchase Intent / Test-Drive Inquiries**: One-click inquiry transmission to sellers with instant collision prevention (disallowing redundant requests on the same vehicle).
* **Order Tracking Pipeline**: Live status monitoring (`Pending`, `Approved`, `Sold`, `Rejected`) with seller contact details and vehicle specs.
* **Post-Sale Rating & Feedback**: Leave or update star ratings and feedback for purchased vehicles, triggering instant alerts to dealerships.
* **Profile & Security**: Manage contact address, mobile number, avatar picture, and credential rotations.

### 3. Dealership & Seller Management
* **KYC-Enforced Registration**: Mandatory onboarding requiring Aadhaar card number, PAN card number, official mobile, city, address, and profile photo. Accounts default to `Inactive` pending Administrator KYC vetting.
* **Administrative KYC Gate**: Sellers cannot log in or manage stock until an administrator approves their credentials.
* **Commercial Dealer Dashboard**: Real-time sales analytics tracking total showroom inventory, active leads, units sold, and aggregate gross revenue generated.
* **Inventory Management (CRUD)**:
  * Complete spec registration: Brand, model, manufacturing year, engine capacity (cc), fuel type, transmission, color, mileage (km/l), km driven, VIN/Chassis Number (unique constraint), license plate/Registration Number (unique constraint), insurance validity, price, owner hierarchy, and vehicle imagery.
  * **Data Integrity Safeguards**: Vehicle records with active purchase requests are automatically locked against unauthorized modifications or deletions to prevent fraudulent manipulation during pending transactions.
* **Inquiry Lifecycle Orchestration**:
  * Review incoming customer inquiries with buyer contact information.
  * State transitions: **Approve** (reserves car and sets other requests to `Rejected`), **Mark as Sold** (marks vehicle as `Sold`, permanently settles transaction, dispatches automated purchase confirmation email to the buyer, and recalculates dealer revenue), or **Revert to Pending**.
* **Showroom Branding**: Update dealership banner, profile photo, and public-facing contact information.

### 4. Platform Administration
* **Dedicated Admin Portal**: Isolated authorization layer accessed via `AdminToken`.
* **Platform Intelligence & KPI Monitor**: Live aggregated metrics tracking registered dealerships, vehicle inventories, buyer accounts, total categories, and transaction requests.
* **Seller Governance & KYC Verification**: Inspect dealer credentials (Aadhaar, PAN, contact, location), approve or suspend accounts with automated status update emails sent to the applicant.
* **Taxonomy & Category Control**: Create, update, or decommission vehicle classes with custom icon/graphic assets.
* **Transaction Auditing**: Global visibility over all customer-to-dealer purchase requests across the entire marketplace.
* **User Management**: Audit registered buyer accounts and activity.

---

## 🏗 System Architecture

The application adopts a decoupled client-server architecture with separation of concerns:

```
                           +----------------------------------------+
                           |          Web Browser / Client          |
                           +----------------------------------------+
                                        |              ^
                 HTTP Requests / Cookie |              | JSON / Assets
                                        v              |
+-----------------------------------------------------------------------------------+
|                            Vite + React 19 Frontend                               |
|  - React Router DOM v7 (Lazy-loaded route splitting & role guards)                |
|  - Zustand Store (Auth session state with persistence & vehicle cache)             |
|  - Axios Client (Interceptors for global error toasts & withCredentials cookies)  |
|  - CSS Modules + Custom Design System                                             |
+-----------------------------------------------------------------------------------+
                                        |              ^
                            REST API    |              | JSON Responses
                         (Port 5000)    v              |
+-----------------------------------------------------------------------------------+
|                            Express.js Backend Service                             |
|  - Express Validator (Request body and schema validation)                         |
|  - Role-Based Authorization Middleware (AuthorizeAdmin, AuthorizeSeller, User)    |
|  - Express FileUpload (Multipart binary storage for /uploads, /sellersPic, etc.)   |
|  - Cookie-Parser & Morgan Logger                                                  |
|  - Nodemailer Service (Responsive HTML transaction emails via SMTP)               |
+-----------------------------------------------------------------------------------+
                    |                                           |
                    v                                           v
+----------------------------------------+     +------------------------------------+
|         MySQL 8.0 Engine               |     |       Static Asset Server          |
|  - mysql2/promise Connection Pool      |     |  - public/uploads/ (Vehicles)      |
|  - Relational FKs with CASCADE DELETE  |     |  - public/categoryPic/ (Badges)    |
|  - Unique VIN & License Indexing       |     |  - public/sellersPic/ (KYC Docs)   |
|  - Parametrized Prepared Statements    |     |  - public/usersPic/ (Avatars)      |
+----------------------------------------+     +------------------------------------+
```

### Frontend Architecture
* **Framework**: React 19 bootstrapped with Vite for instant Hot Module Replacement (HMR).
* **State Management**:
  * `authStore.js` (Zustand): Persists active user details, role classification, and JWT state to `localStorage` under `drive-deal-auth`.
  * `carStore.js` (Zustand): In-memory cache for vehicle inventory, category listings, and featured showroom vehicles to eliminate redundant network traffic.
* **Routing & Guards**: React Router DOM v7 with code-split asynchronous chunks (`React.lazy` + `Suspense`). Route access is controlled by [`ProtectedRoute.jsx`](file:///d:/__VMM__/___Student%20Projects___/Node%20Js/__6%20Month%20Projects__/Drive%20Deal/react_node_mysql/frontend/src/components/ProtectedRoute.jsx) validating server-side authorization tokens prior to rendering protected layouts.
* **Networking**: Centralized Axios client (`apiService.js`) configured with `withCredentials: true` and interceptors for automatic session expiry toasts and error normalization.

### Backend Service Architecture
* **Runtime**: Node.js with Express 4.x.
* **Session & Security Model**: JWT tokens minted with 24-hour expiration (`expiresIn: '1D'`), written directly into HTTP response cookies (`AdminToken`, `SellerToken`, `UserToken`).
* **Validation Layer**: Declarative input sanitization and verification using `express-validator`.
* **File Processing**: Native multipart handling via `express-fileupload`, writing file uploads to scoped static directories under `/public`.

### Data Tier
* **Primary Relational Store**: MySQL 8.x accessed via `mysql2/promise` with an optimized connection pool (10 concurrent connections).
* **Relational Integrity**: Foreign key constraints with `ON DELETE CASCADE` guarantee that deleting a category, seller, or car cleanly prunes child records (photos, purchase requests, reviews).
* **Secondary NoSQL Schemas**: The repository includes MongoDB schemas in [`backend/mongo_models`](file:///d:/__VMM__/___Student%20Projects___/Node%20Js/__6%20Month%20Projects__/Drive%20Deal/react_node_mysql/backend/mongo_models) and an automated data migration pipeline ([`manual_migrate.js`](file:///d:/__VMM__/___Student%20Projects___/Node%20Js/__6%20Month%20Projects__/Drive%20Deal/react_node_mysql/backend/scripts/manual_migrate.js)) allowing flexible deployment across MySQL or MongoDB environments.

---

## 🗄 Database Architecture & Data Dictionary

### Entity Relationship Diagram (Conceptual)

```
  +---------------+             1:N             +-----------------------+
  |  CATEGORIES   |<----------------------------|         CARS          |
  +---------------+                             +-----------------------+
  | id (PK)       |                                    | 1          | 1
  | name          |                                    |            |
  | photo         |                                    | N          | N
  +---------------+                             +--------------+ +-------------+
                                                |  PURCHASE_   | |   REVIEWS   |
  +---------------+             1:N             |   REQUESTS   | +-------------+
  |    SELLERS    |<----------------------------|--------------| | id (PK)     |
  +---------------+                             | id (PK)      | | rating (1-5)|
  | id (PK)       |                             | status       | | feedback    |
  | email (UQ)    |                             +--------------+ +-------------+
  | adhar_card    |                                    | N          | N
  | pan_card      |                                    |            |
  | status (ENUM) |                                    | 1          | 1
  +---------------+                             +-----------------------+
                                                |         USERS         |
  +---------------+                             +-----------------------+
  |    ADMINS     |                             | id (PK)               |
  +---------------+                             | email (UQ)            |
  | id (PK)       |                             | status (Active/Block) |
  | email (UQ)    |                             +-----------------------+
  +---------------+
```

### Table Specifications

#### 1. `admins`
Stores master platform administrator credentials.
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Administrator legal name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Administrator email (login username) |
| `password` | VARCHAR(255) | NOT NULL | Master password |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updatedAt` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

#### 2. `categories`
Vehicle taxonomy classifications (SUV, Sedan, Hatchback, Sports, etc.).
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Category identifier |
| `name` | VARCHAR(100) | NOT NULL | Category name |
| `photo` | VARCHAR(255) | NULL | Server path to category badge/icon |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updatedAt` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

#### 3. `sellers`
Dealership and private merchant profiles with regulatory KYC data.
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Seller identifier |
| `name` | VARCHAR(255) | NOT NULL | Dealership / individual legal name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email (unique across sellers) |
| `password` | VARCHAR(255) | NOT NULL | Authentication password |
| `adhar_card` | VARCHAR(255) | NULL | Government Aadhaar number for KYC |
| `pan_card` | VARCHAR(255) | NULL | Government PAN card number for tax/KYC |
| `mobile` | VARCHAR(20) | NULL | Primary contact phone |
| `gender` | VARCHAR(10) | NULL | Gender designation |
| `photo` | VARCHAR(255) | NULL | Path to uploaded seller avatar |
| `banner` | VARCHAR(255) | NULL | Path to showroom storefront banner |
| `address` | TEXT | NULL | Registered business address |
| `city` | VARCHAR(100) | NULL | Base city of operation |
| `status` | ENUM('Inactive','Active') | DEFAULT 'Inactive' | Admin approval gate |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Signup timestamp |
| `updatedAt` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

#### 4. `users`
End-consumer / car buyer accounts.
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Customer identifier |
| `first_name` | VARCHAR(100) | NOT NULL | Customer first name |
| `last_name` | VARCHAR(100) | NOT NULL | Customer last name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Customer email address |
| `password` | VARCHAR(255) | NOT NULL | Password |
| `mobile` | VARCHAR(20) | NULL | Mobile contact number |
| `gender` | VARCHAR(10) | NULL | Gender |
| `photo` | VARCHAR(255) | NULL | Profile image path |
| `address` | TEXT | NULL | Billing / delivery residential address |
| `city` | VARCHAR(100) | NULL | City of residence |
| `status` | ENUM('Active','Blocked') | DEFAULT 'Active' | Buyer standing status |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |
| `updatedAt` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Modification timestamp |

#### 5. `cars`
Detailed vehicle inventory records.
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Vehicle unique identifier |
| `seller_id` | INT | FK -> `sellers.id` | Dealership that listed the vehicle |
| `category_id` | INT | FK -> `categories.id` | Vehicle body style category |
| `brand` | VARCHAR(100) | NOT NULL | Manufacturer (e.g., Hyundai, Toyota) |
| `model` | VARCHAR(100) | NOT NULL | Model year / edition |
| `name` | VARCHAR(255) | NULL | Vehicle model name (e.g., Creta, Fortuner) |
| `manufacturingYear` | INT | NOT NULL | Year of factory production |
| `fuelType` | ENUM | NOT NULL | `Petrol`, `Diesel`, `CNG`, `Electric`, `Hybrid` |
| `transmissionType` | ENUM | NOT NULL | `Manual`, `Automatic`, `CVT` |
| `mileage` | FLOAT | NOT NULL | Fuel economy in km/l |
| `kmDriven` | INT | NOT NULL | Odometer reading in kilometers |
| `engineCapacity` | INT | NOT NULL | Engine displacement in cc |
| `color` | VARCHAR(50) | NOT NULL | Exterior paint color |
| `chassisNumber` | VARCHAR(100) | NOT NULL, UNIQUE | Vehicle Identification Number (VIN) |
| `registrationNumber` | VARCHAR(100) | NOT NULL, UNIQUE | Official government license plate number |
| `insuranceValidity` | VARCHAR(100) | NOT NULL | Policy expiration month & year |
| `price` | DECIMAL(15,2)| NOT NULL | Listed asking price in INR (₹) |
| `ownerType` | ENUM | NOT NULL | `First Owner`, `Second Owner`, `Third Owner`, etc. |
| `address` | TEXT | NOT NULL | Physical vehicle inspection address |
| `location` | TEXT | NOT NULL | City / State location |
| `contact` | VARCHAR(20) | NULL | Seller contact phone for this vehicle |
| `photo` | VARCHAR(255) | NULL | Primary vehicle image file path |
| `status` | ENUM | DEFAULT 'Available' | `Available`, `Pending`, `Approved`, `Sold` |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Listing creation timestamp |
| `updatedAt` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

#### 6. `purchase_requests`
Transactional booking inquiries linking buyers, sellers, and specific vehicles.
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Inbound request identifier |
| `car_id` | INT | FK -> `cars.id` | Target vehicle |
| `seller_id` | INT | FK -> `sellers.id` | Target dealership |
| `user_id` | INT | FK -> `users.id` | Buyer issuing the purchase interest |
| `status` | VARCHAR(50) | DEFAULT 'Pending' | `Pending`, `Approved`, `Sold`, `Rejected` |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |
| `updatedAt` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Status update timestamp |

#### 7. `reviews`
Post-purchase customer ratings and qualitative reviews.
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Review identifier |
| `user_id` | INT | FK -> `users.id` | Buyer authoring the review |
| `car_id` | INT | FK -> `cars.id` | Vehicle being reviewed |
| `rating` | INT | CHECK (`rating` BETWEEN 1 AND 5) | Numerical rating score (1-5) |
| `feedback` | TEXT | NULL | Written assessment |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Review creation timestamp |
| `updatedAt` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

---

## 📡 RESTful API Specification

Base URL: `http://localhost:5000/api/v1`

### Public Routes (`/api/v1`)
| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/` | API status health check | None |
| `GET` | `/ping` | Connectivity ping | Returns `{ success: true, message: "pong" }` |
| `GET` | `/fetchCategories` | Retrieve all vehicle categories | None |
| `GET` | `/fetchcars/:id` | Fetch cars by category ID or `all` with filtering | `page`, `limit`, `brand`, `fuelType`, `transmissionType`, `minPrice`, `maxPrice`, `sortBy`, `order` |
| `GET` | `/fetchSingleCar/:id`| Full dossier of a single car including seller info | `id` (Param) |
| `GET` | `/fetchreviews` | Retrieve latest vehicle customer reviews | `page`, `limit` |

### Customer Routes (`/api/v1/user`)
All protected customer endpoints require a valid `UserToken` cookie.
| Method | Endpoint | Auth | Description | Payload |
|---|---|---|---|---|
| `POST` | `/user/register` | None | Register new customer account | Multipart form: `first_name`, `last_name`, `email`, `password`, `mobile`, `gender`, `address`, `city`, `photo` |
| `POST` | `/user/login` | None | Authenticate customer & set `UserToken` | JSON: `{ "email": "...", "password": "..." }` |
| `GET` | `/user/token` | User | Verify current user session | None |
| `GET` | `/user/stats` | User | Fetch buyer dashboard metrics | Returns total, pending, and sold counts |
| `GET` | `/user/logout` | User | Clear session cookie | Clears `UserToken` |
| `GET` | `/user/showProfile` | User | Fetch buyer profile information | None |
| `POST`/`PUT`| `/user/updateProfile`| User | Update user profile & avatar | Multipart form data |
| `PUT` | `/user/changePassword` | User | Update customer password | JSON: `{ "password": "old", "new_password": "new" }` |
| `POST` | `/user/addPurchaseRequest`| User | Express purchase intent on vehicle | JSON: `{ "car": car_id, "seller": seller_id }` |
| `GET` | `/user/check_request/:carId`| User | Check if user already requested this car | None |
| `GET` | `/user/fetchMyPurchaseRequests`| User | Paginated order history with car & seller | `page`, `limit` |
| `POST` | `/user/addreview` | User | Submit / update rating and feedback | JSON: `{ "carId": id, "rating": 5, "feedback": "..." }` |

### Seller Routes (`/api/v1/seller`)
Protected seller endpoints require a valid `SellerToken` cookie and an `Active` account status.
| Method | Endpoint | Auth | Description | Payload |
|---|---|---|---|---|
| `POST` | `/seller/register` | None | Register dealership (defaults to Inactive) | Multipart: `name`, `email`, `password`, `adhar_card`, `pan_card`, `mobile`, `gender`, `address`, `city`, `photo` |
| `POST` | `/seller/login` | None | Authenticate seller (fails if KYC pending) | JSON: `{ "email": "...", "password": "..." }` |
| `GET` | `/seller/token` | Seller | Check seller authentication | None |
| `GET` | `/seller/stats` | Seller | Retrieve showroom KPI metrics | Returns vehicles, pending, sold, revenue |
| `GET` | `/seller/logout` | Seller | Clear seller session cookie | Clears `SellerToken` |
| `GET` | `/seller/showProfile` | Seller | Fetch dealership profile | None |
| `POST`/`PUT`| `/seller/updateProfile`| Seller | Update dealership info, avatar, banner | Multipart form data |
| `PUT` | `/seller/changePassword` | Seller | Change seller password | JSON: `{ "password": "...", "new_password": "..." }` |
| `POST` | `/seller/addcar` | Seller | Create a new vehicle listing | Multipart: all car specs + `photo` |
| `GET` | `/seller/fetchcars` | Seller | Fetch seller's own listings with request tags | `page`, `limit`, `status` |
| `PUT` | `/seller/updatecar/:id` | Seller | Update vehicle listing (blocked if leads exist)| Multipart form data |
| `DELETE` | `/seller/deletecar/:id` | Seller | Remove listing (blocked if leads exist) | `id` (Param) |
| `GET` | `/seller/fetchcarreq` | Seller | Fetch purchase inquiries for seller | `page`, `limit`, `status` |
| `PUT` | `/seller/updatereq/:id` | Seller | Update inquiry status (`Approved`, `Sold`) | JSON: `{ "status": "Approved" \| "Sold" }` |
| `GET` | `/seller/fetchapprovedbooking`| Seller | Fetch completed sales / sold vehicles | `page`, `limit` |

### Admin Routes (`/api/v1/admin`)
Requires valid `AdminToken` cookie.
| Method | Endpoint | Auth | Description | Payload |
|---|---|---|---|---|
| `POST` | `/admin/login` | None | Master administrator login | JSON: `{ "email": "...", "password": "..." }` |
| `GET` | `/admin/token` | Admin | Validate admin session | None |
| `GET` | `/admin/stats` | Admin | Fetch system-wide platform statistics | Returns totals: sellers, categories, requests, users, cars |
| `GET` | `/admin/fetchSeller` | Admin | Paginated list of sellers | `page`, `limit`, `status` |
| `PUT` | `/admin/update_sellerstatus/:id`| Admin | Approve / Suspend seller account | JSON: `{ "status": "Active" \| "Inactive" }` |
| `DELETE` | `/admin/delete_seller/:id` | Admin | Delete a seller account | `id` (Param) |
| `GET` | `/admin/viewcategory` | Admin | Fetch all categories | None |
| `POST` | `/admin/add_category` | Admin | Create new category with icon | Multipart: `name`, `photo` |
| `PUT` | `/admin/update_category/:id` | Admin | Update category details/icon | Multipart: `name`, optional `photo` |
| `DELETE` | `/admin/delete_category/:id` | Admin | Delete category (cascades to cars) | `id` (Param) |
| `GET` | `/admin/fetchpurchase_requests`| Admin | Audit all purchase requests | `page`, `limit`, `status` |
| `GET` | `/admin/fetchUsers` | Admin | Paginated list of registered buyers | `page`, `limit` |
| `PUT` | `/admin/changePassword` | Admin | Rotate administrator password | JSON: `{ "password": "...", "new_password": "..." }` |
| `GET` | `/admin/logout` | Admin | Invalidate admin session | Clears `AdminToken` |

---

## 🔒 Security & Business Invariants

1. **Email Domain Segregation & Collision Prevention**:
   The registration controllers for both Users and Sellers cross-query both tables to prevent account email collisions across user roles. An email registered as a seller cannot simultaneously register as a buyer.
2. **KYC Gatekeeper Enforcement**:
   Sellers registering on the platform cannot log in or manage vehicle stock until an Administrator explicitly sets their status to `Active`. Unverified attempts return a `403 Forbidden` with `"KYC DETAILS ARE UNDER PROCESS"`.
3. **Transaction Immutability & Modification Guards**:
   In [`sellerController.js`](file:///d:/__VMM__/___Student%20Projects___/Node%20Js/__6%20Month%20Projects__/Drive%20Deal/react_node_mysql/backend/controllers/sellerController.js), vehicles with active purchase requests are protected against updates or deletions (`SELECT 1 FROM purchase_requests WHERE car_id = ?`). This prevents bait-and-switch price modifications while prospective buyers are negotiating.
4. **State Machine Synchronization**:
   When a seller marks a request as `Approved`, competing `Pending` requests on that car are automatically marked `Rejected`, and the car status moves to `Approved`. When marked `Sold`, the car is permanently locked as `Sold`, and an automated sales invoice is dispatched via email.
5. **SQL Injection Defense**:
   All database queries use parameterized prepared statements (`pool.execute(query, params)`) provided by `mysql2/promise`.
6. **Stateless HTTP-Only Cookie Tokens**:
   JWT tokens are verified on every protected request. Sessions automatically expire after 24 hours.

---

## ✉ Automated Email & Notification System

Drive Deal features an asynchronous email engine implemented via Nodemailer with responsive HTML templates:

| Event Trigger | Recipient | Subject / Description |
|---|---|---|
| **Seller Onboarding** | New Dealer | *"Welcome to DRIVE DEAL - Your Seller Registration"* — Confirms application receipt and explains that the account is in KYC review. |
| **User Onboarding** | New Buyer | *"Welcome to Drive Deal - Your Premium Car Journey Starts Here"* — Confirms customer registration. |
| **KYC Status Updated** | Dealer | *"Account Status Update: Active / Inactive"* — Alerts dealer when Admin approves or suspends their account. |
| **New Purchase Inquiry** | Dealer | *"Action Required: New Purchase Request for [Brand Model]"* — Contains customer name, email, and mobile number. |
| **Vehicle Sale Confirmed** | Buyer | *"Congratulations! Your purchase of [Brand Model] is confirmed!"* — Formatted purchase receipt with model details and price. |
| **New Review Submitted** | Dealer | *"New Review for [Brand Model]"* — Displays star rating and buyer feedback comments. |

---

## 📂 Directory & Project Layout

```
react_node_mysql/
├── .gitignore
├── README.md                      # Project documentation (this file)
├── drive_deal_db.sql              # Complete MySQL database export (schema + seed data)
├── ERD_DFD_DB/                    # Architectural artifacts
│   ├── Database Tables.docx       # Data dictionary specifications
│   ├── DFD.pptx                   # Data Flow Diagrams
│   └── ERD.pdf                    # Entity Relationship Diagram
│
├── backend/                       # Express REST API application
│   ├── app.js                     # Server entrypoint, middleware, and route mounting
│   ├── package.json               # Backend dependencies and scripts
│   ├── mysql.config.js            # MySQL connection pool configuration
│   ├── mongodb.config.js          # MongoDB connection helper (alternative)
│   ├── controllers/               # Business logic and query controllers
│   │   ├── adminController.js     # Admin operations (KYC, categories, stats)
│   │   ├── indexController.js     # Public catalog, filters, details
│   │   ├── sellerController.js    # Dealership inventory and request management
│   │   └── userController.js      # Customer profile, orders, and reviews
│   ├── middleware/
│   │   └── validationMiddleware.js# express-validator result handler
│   ├── routes/
│   │   ├── admin.js               # Admin routes & AuthorizeAdmin middleware
│   │   ├── index.js               # Public catalog and comparison routes
│   │   ├── seller.js              # Seller routes & AuthorizeSeller middleware
│   │   └── user.js                # Buyer routes & AuthorizeUser middleware
│   ├── utils/
│   │   └── emailService.js        # Nodemailer transport & HTML email templates
│   ├── scripts/
│   │   ├── setupDb.js             # Automated database creation runner
│   │   └── manual_migrate.js      # Migration script for MongoDB
│   └── public/                    # Static uploaded assets
│       ├── categoryPic/           # Category badges
│       ├── sellersPic/            # Seller avatars & KYC documents
│       ├── usersPic/              # Customer profile avatars
│       └── uploads/               # Vehicle photography
│
└── frontend/                      # React 19 Single Page Application (Vite)
    ├── index.html                 # Root HTML template
    ├── vite.config.js             # Vite configuration
    ├── package.json               # Frontend dependencies and scripts
    ├── .env                       # Vite environment variables (API base URL)
    └── src/
        ├── main.jsx               # React DOM entrypoint
        ├── App.jsx                # Root router wrapper with Toast container
        ├── index.css              # Global design tokens and reset styles
        ├── routes/
        │   └── AppRoutes.jsx      # Lazy-loaded route map & role protection
        ├── layouts/
        │   ├── PublicLayout.jsx   # Header, Footer, and Outlet
        │   ├── AdminLayout.jsx    # Admin dashboard sidebar & header
        │   ├── SellerLayout.jsx   # Seller showroom sidebar & header
        │   └── UserLayout.jsx     # Buyer portal sidebar & header
        ├── components/
        │   ├── ProtectedRoute.jsx # Role-aware route guard
        │   ├── Header.jsx / Footer.jsx
        │   ├── AdminHeader.jsx / AdminSidebar.jsx
        │   ├── SellerHeader.jsx / SellerSidebar.jsx
        │   ├── UserHeader.jsx / UserSidebar.jsx
        │   ├── home/              # HeroSection, FeaturedCars, AboutSection
        │   └── ui/                # CarCard, Button, Modal, ConfirmModal, Loaders
        ├── pages/
        │   ├── Home.jsx           # Landing page
        │   ├── Cars.jsx           # Catalog with multifaceted filtering
        │   ├── SingleCar.jsx      # Vehicle dossier & inquiry modal
        │   ├── Compare.jsx        # Vehicle comparison engine
        │   ├── About.jsx / Contact.jsx
        │   ├── UserLogin.jsx / UserSignup.jsx
        │   ├── SellerLogin.jsx / SellerSignup.jsx
        │   ├── AdminLogin.jsx
        │   ├── admin/             # AdminDashboard, ManageSellers, Categories
        │   ├── seller/            # SellerDashboard, ManageCars, Inquiries, Profile
        │   ├── user/              # UserDashboard, UserMyCars, Profile
        │   └── common/            # ChangePassword component
        ├── services/
        │   ├── apiService.js      # Axios instance with global toast interceptors
        │   ├── authService.js     # User, Seller, Admin auth calls
        │   ├── carService.js      # Inventory and purchase request calls
        │   └── adminService.js    # Admin administrative API calls
        ├── store/
        │   ├── authStore.js       # Zustand auth store with localStorage persistence
        │   └── carStore.js        # Zustand car catalog & category cache
        └── context/
            └── AuthContext.jsx    # Authentication React context provider
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MySQL Server**: v8.0 or higher (running on `localhost:3306`)

---

### 1. Database Setup

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or terminal CLI).
2. Create the target database:
   ```sql
   CREATE DATABASE IF NOT EXISTS drive_deal_db;
   ```
3. Import the provided schema and sample seed records from the project root:
   ```bash
   mysql -u root -p drive_deal_db < drive_deal_db.sql
   ```
   *(Alternatively, execute the queries in [`drive_deal_db.sql`](file:///d:/__VMM__/___Student%20Projects___/Node%20Js/__6%20Month%20Projects__/Drive%20Deal/react_node_mysql/drive_deal_db.sql) directly within your database GUI).*

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Verify your database credentials in [`backend/mysql.config.js`](file:///d:/__VMM__/___Student%20Projects___/Node%20Js/__6%20Month%20Projects__/Drive%20Deal/react_node_mysql/backend/mysql.config.js):
   ```javascript
   const pool = mysql.createPool({
       host: 'localhost',
       user: 'root',
       password: 'YOUR_MYSQL_PASSWORD', // Adjust to match your local setup
       database: 'drive_deal_db',
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0
   });
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server starts on `http://localhost:5000` with Morgan request logging enabled.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify the environment variable in [`frontend/.env`](file:///d:/__VMM__/___Student%20Projects___/Node%20Js/__6%20Month%20Projects__/Drive%20Deal/react_node_mysql/frontend/.env):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔑 Seed Accounts & Credentials

The imported database includes pre-configured seed accounts across all system tiers:

| Role | Portal URL | Email | Password | Status / Notes |
|---|---|---|---|---|
| **Platform Administrator** | `http://localhost:5173/admin/login` | `admin@gmail.com` | `123456` | Full administrative privileges |
| **Verified Dealership** | `http://localhost:5173/seller/login` | `subhratosingh@gmail.com` | `123456` | Status: `Active` (Inventory loaded) |
| **Registered Buyer** | `http://localhost:5173/user/login` | `subhratosingh2@gmail.com` | `123456` | Status: `Active` |

---

## ⚙ Environment Configuration Reference

### Backend Configuration
Parameters are currently managed via `backend/mysql.config.js` and `backend/utils/emailService.js`. For production deployments, move them to a root `.env`:

| Key | Description | Default (Development) |
|---|---|---|
| `PORT` | API server listen port | `5000` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `system` |
| `DB_NAME` | MySQL database name | `drive_deal_db` |
| `JWT_SECRET` | Secret key for JWT signing | `abcd#$%@12345678` |
| `EMAIL_USER` | Gmail address for Nodemailer | `dummymail2003s@gmail.com` |
| `EMAIL_PASS` | Gmail App Password for SMTP | Provided in `emailService.js` |

### Frontend Configuration (`frontend/.env`)
| Key | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base endpoint for the Express backend | `http://localhost:5000/api/v1` |

---

## 🛠 Troubleshooting & FAQ

#### 1. "Database connection failed: Access denied for user 'root'@'localhost'"
* Open `backend/mysql.config.js` and verify that the `password` property matches your local MySQL installation root password.

#### 2. "KYC DETAILS ARE UNDER PROCESS" upon Seller Login
* New sellers are created with status `Inactive`. Log in as Admin (`admin@gmail.com` / `123456`), go to **Manage Sellers**, and toggle the status to **Active**.

#### 3. Image uploads not displaying
* The backend serves uploaded static assets from the `backend/public/` folder. Ensure the backend server is running on port 5000 and images are referenced with absolute URLs or relative paths pointing to the backend host.

#### 4. CORS Issues during development
* The backend CORS configuration in `backend/app.js` is set to accept requests from `http://localhost:5173` with credentials enabled. If your Vite server runs on a different port, update the `cors({ origin: '...' })` option in `app.js`.

---

## 📄 License & Acknowledgments

This project is licensed under the **ISC License**. Developed as an automotive trading platform and vehicle dealership management system. Built with React 19, Vite, Express, and MySQL.
