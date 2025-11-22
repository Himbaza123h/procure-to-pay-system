# Procure-to-Pay System

A modern Purchase Request & Approval System with AI-powered document processing capabilities.

**Live Demo:** [https://app.onrender.com](https://app.onrender.com)  
**API Documentation:** [https://app.onrender.com/swagger/](https://app.onrender.com/swagger/)

---

## 🎯 Overview

This system streamlines the procurement process from purchase request to payment approval, featuring:

- **Multi-level approval workflow** - Requests require approval from Level 1 and Level 2 approvers
- **AI document processing** - Automatic extraction of vendor details, items, and prices from proformas
- **Smart PO generation** - Automatic PDF purchase order creation upon final approval
- **Receipt validation** - AI-powered comparison of receipts against purchase orders to flag discrepancies
- **Role-based access** - Staff, Approver Level 1, Approver Level 2, and Finance roles

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Running Locally

```bash
# Clone the repository
git clone https://github.com/Himbaza123h/procure-to-pay-system.git
cd procure-to-pay-system

# Build and run with Docker
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Swagger Docs: http://localhost:8000/swagger/
```

### Default Test Users

| Role | Username | Password |
|------|----------|----------|
| Staff | staff | staff123 |
| Approver L1 | approver1 | approver123 |
| Approver L2 | approver2 | approver123 |
| Finance | finance | finance123 |

---

## 🤖 AI-Powered Features

### 1. Proforma Processing
When staff uploads a proforma/quotation:
- **Extracts vendor name** from document
- **Identifies line items** with quantities and prices
- **Stores structured data** for PO generation

### 2. Automatic PO Generation
When request receives final approval (Level 2):
- **Generates PDF** purchase order automatically
- **Includes** vendor info, items, prices, approval signatures
- **Assigns PO number** (format: PO-000001)

### 3. Receipt Validation
When staff submits receipt after purchase:
- **Compares vendor** name with PO
- **Validates amount** (within 5% tolerance)
- **Checks items** match what was ordered
- **Flags discrepancies** if mismatch detected

---

## 📚 API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/token/` | Login (get JWT) | All |
| POST | `/api/requests/` | Create request | Staff |
| GET | `/api/requests/` | List requests | All |
| GET | `/api/requests/{id}/` | Request details | All |
| PUT | `/api/requests/{id}/` | Update request | Staff (owner) |
| PATCH | `/api/requests/{id}/approve/` | Approve | Approvers |
| PATCH | `/api/requests/{id}/reject/` | Reject | Approvers |
| POST | `/api/requests/{id}/submit-receipt/` | Submit receipt | Staff (owner) |

Full interactive docs at `/swagger/`

---

## 🏗️ Approval Workflow

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│ PENDING │ ──► │ APPROVER L1 │ ──► │ APPROVER L2 │ ──► │ APPROVED │
└─────────┘     └─────────────┘     └─────────────┘     └──────────┘
                      │                    │                  │
                      ▼                    ▼                  ▼
                 ┌──────────┐        ┌──────────┐      ┌─────────┐
                 │ REJECTED │        │ REJECTED │      │ PO Generated │
                 └──────────┘        └──────────┘      └─────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 4.2, Django REST Framework |
| Database | PostgreSQL 15 |
| Auth | JWT (SimpleJWT) |
| Frontend | React 18, Tailwind CSS |
| AI/OCR | Tesseract, pdfplumber, OpenAI (optional) |
| PDF Gen | ReportLab |
| DevOps | Docker, Docker Compose |

---

## 📁 Project Structure

```
procure-to-pay-system/
├── backend/
│   ├── api/                 # Main Django app
│   │   ├── models.py        # User, PurchaseRequest, Approval
│   │   ├── views.py         # API ViewSets
│   │   ├── serializers.py   # DRF Serializers
│   │   └── permissions.py   # Role-based permissions
│   ├── services/            # AI Services
│   │   ├── document_processor.py  # Proforma extraction
│   │   ├── po_generator.py        # PO PDF generation
│   │   └── receipt_validator.py   # Receipt validation
│   ├── config/              # Django settings
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── services/        # API service
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🧪 Testing the AI Features

### Test Proforma Processing
1. Login as staff
2. Create new request with PDF/image proforma
3. Check if `vendor_name` and `extracted_items` appear in response

### Test PO Generation
1. Create request as staff
2. Approve as approver_level_1
3. Approve as approver_level_2
4. Check if `purchase_order` field has PDF link

### Test Receipt Validation
1. After request is approved, login as staff
2. Submit receipt via `/api/requests/{id}/submit-receipt/`
3. Check `receipt_validated` and `validation_errors` in response

---

## 🔐 Security

- JWT authentication with 5-hour access token
- Role-based access control (RBAC)
- File upload validation (10MB max, PDF/images only)
- CORS configured for frontend origin
- Environment variables for secrets

---

## 👤 Author

**Alain Honore**

Technical Assessment for IST Africa - Full Stack Python/Django Developer

---

## 📄 License

Created for technical assessment purposes.