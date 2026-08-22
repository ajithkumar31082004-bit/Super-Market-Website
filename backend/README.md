# ⚡ SuperMarket Pro — Backend API & Cloud Services

The **SuperMarket Pro Backend** is a production-grade Node.js and Express RESTful API integrating with multi-tier AWS cloud infrastructure and Google Gemini AI.

---

## 🛠️ Architecture & Technology Stack

* **Runtime**: Node.js 20 LTS
* **Framework**: Express.js 4.19
* **Databases**:
  * **Relational**: Amazon RDS MySQL 8.0 (Users, Catalog, Orders, Reviews, Coupons)
  * **NoSQL**: Amazon DynamoDB (Real-time Shopping Cart sessions & Activity Logs)
* **Storage**: Amazon S3 (Product Media & Direct Presigned Uploads)
* **Messaging & Events**: Amazon SNS (Order Notifications) & AWS Lambda (Asynchronous Order Processor)
* **Artificial Intelligence**: Google Gemini 2.5 Flash SDK (`@google/genai`)
* **Security & Auth**: JWT (JSON Web Tokens) & `bcrypt` password hashing

---

## 📁 Directory Structure

```text
backend/
├── config/
│   ├── db.js             # MySQL connection pool configuration
│   └── aws.js            # AWS SDK v3 client singletons (S3, DynamoDB, SNS, Lambda)
├── routes/
│   ├── users.js          # User registration, JWT login, profile management
│   ├── products.js       # Product catalog CRUD & filtering
│   ├── cart.js           # DynamoDB shopping cart state handlers
│   ├── orders.js         # Order processing, RDS storage, SNS & Lambda triggers
│   ├── reviews.js        # Customer ratings & reviews
│   ├── coupons.js        # Coupon verification & discount calculations
│   ├── upload.js         # Direct S3 uploads & Presigned URL generation
│   └── ai.js             # Google Gemini AI assistant chat endpoint
├── services/
│   ├── rdsService.js     # MySQL query abstractions
│   ├── dynamoService.js  # DynamoDB cart operations
│   ├── s3Service.js      # S3 putObject and presigned upload generators
│   ├── snsService.js     # SNS publish order notification emails/SMS
│   └── lambdaService.js  # Lambda async worker invocation
├── lambdaHandler.js      # Standalone AWS Lambda handler for background processing
├── init_db.js            # Database initializer & sample data seeder
├── schema.sql            # MySQL table DDL and initial schema
└── server.js             # Express server setup and route registration
```

---

## ⚙️ Environment Variables Configuration

Create a `.env` file in the `backend/` directory:

```env
# Application Port & Mode
PORT=5000
NODE_ENV=development

# MySQL Database (AWS RDS or Local MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=supermarket_db

# JWT Authentication
JWT_SECRET=supermarket_jwt_secret_key_2026

# Google Gemini AI API
GEMINI_API_KEY=AIzaSy...

# AWS Cloud Services
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key      # Required for local run (or use IAM role in AWS)
AWS_SECRET_ACCESS_KEY=your_secret_key  # Required for local run (or use IAM role in AWS)
AWS_S3_BUCKET_NAME=supermarket-product-images-unique
AWS_DYNAMODB_CARTS_TABLE=SuperMarket_Carts
AWS_DYNAMODB_LOGS_TABLE=SuperMarket_Logs
AWS_SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:123456789012:SuperMarketOrderNotifications
AWS_LAMBDA_BG_WORKER=supermarket-order-processor
```

---

## 💾 Database Initialization

To create all MySQL tables, foreign keys, and seed initial demo data:

```bash
node init_db.js
```

This executes [schema.sql](file:///c:/Users/ajith/Downloads/Super-Market-Website/backend/schema.sql) and seeds:
- Admin user: `admin@supermarket.com` (Password: `Admin@123`)
- Sample grocery categories & products
- Initial discount coupons

---

## 📡 REST API Reference

### 1. Health Probe
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Kubernetes & Docker health check probe |

### 2. User Authentication (`/api/users`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/users/register` | Register a new customer | Public |
| `POST` | `/api/users/login` | Login and receive JWT token | Public |
| `GET` | `/api/users/profile` | Retrieve logged-in user profile | Bearer JWT |

### 3. Products Catalog (`/api/products`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/products` | Get products list (supports `?category=`, `?search=`) | Public |
| `GET` | `/api/products/:id` | Get single product details | Public |
| `POST` | `/api/products` | Add new product | Admin JWT |
| `PUT` | `/api/products/:id` | Update product details | Admin JWT |
| `DELETE` | `/api/products/:id` | Delete a product | Admin JWT |

### 4. DynamoDB Shopping Cart (`/api/cart`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/cart/:userId` | Retrieve user cart from DynamoDB | Bearer JWT |
| `POST` | `/api/cart/:userId/item` | Add/Update item in cart | Bearer JWT |
| `DELETE` | `/api/cart/:userId/item/:productId` | Remove product from cart | Bearer JWT |
| `DELETE` | `/api/cart/:userId` | Clear entire cart | Bearer JWT |

### 5. Orders & Processing (`/api/orders`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/orders/checkout` | Process order (RDS + SNS notification + Lambda trigger) | Bearer JWT |
| `GET` | `/api/orders/user/:userId` | Get user order history | Bearer JWT |
| `GET` | `/api/orders/:orderId` | Get order tracking details | Bearer JWT |
| `PUT` | `/api/orders/:orderId/status`| Update order fulfillment status | Admin JWT |

### 6. S3 Media Uploads (`/api/upload`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/upload` | Multipart form-data direct image upload to S3 | Admin JWT |
| `POST` | `/api/upload/presigned` | Request S3 Presigned PUT URL for browser-direct upload | Admin JWT |

### 7. Google Gemini AI Assistant (`/api/ai`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Chat with Gemini AI shopping assistant | Public |

### 8. Reviews & Ratings (`/api/reviews`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/reviews/product/:productId` | Get reviews for a product | Public |
| `POST` | `/api/reviews` | Submit product review & rating | Bearer JWT |

### 9. Coupons (`/api/coupons`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/coupons/validate` | Check coupon validity and discount value | Bearer JWT |

---

## 🧪 Local Testing & Development

Run development server with auto-reload:
```bash
npm run dev
```

Run production server:
```bash
npm start
```
