# Autochek Vehicle Financing API

A production-grade backend API for vehicle valuation and loan financing services built with NestJS, TypeORM, and SQLite.

## 🌟 Features

- 🚗 **Vehicle Management**: Complete CRUD operations with VIN validation
- 💰 **Real-time Valuation**: External API integration with intelligent fallback
- 📝 **Loan Processing**: Automated eligibility checks and offer generation
- 🎁 **Smart Offers**: Multiple loan offers with different terms
- 🔐 **Security**: Input validation, SQL injection prevention, error handling
- 📚 **Interactive Documentation**: Swagger/OpenAPI UI
- ✅ **Tested**: Unit and E2E tests included
- 🎯 **Production-Ready**: Clean architecture, logging, best practices

## 📋 Prerequisites

- Node.js v16 or higher
- npm v8 or higher

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/autochek-api.git
cd autochek-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
PORT=3000
NODE_ENV=development

# Optional: RapidAPI key for real vehicle valuations
# Get free key at https://rapidapi.com/
# RAPIDAPI_KEY=your_key_here
# RAPIDAPI_HOST=vin-lookup.p.rapidapi.com
```

**Note**: The application works perfectly without RapidAPI key using intelligent simulation.

### 4. Start the Application

```bash
npm run start:dev
```

**Expected Output:**

🚀 Application is running on: <http://localhost:3000>
📚 Swagger documentation: <http://localhost:3000/api/docs>
🔥 Environment: development

### 5. Test the API

Open your browser and go to:

<http://localhost:3000/api/docs>

You'll see interactive API documentation where you can test all endpoints!

## 📖 API Documentation

Once the application is running, visit the interactive Swagger documentation:

**URL**: <http://localhost:3000/api/docs>

### Available Endpoints

#### Vehicles

- `POST /api/vehicles` - Create a vehicle
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `PATCH /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

#### Valuations

- `POST /api/valuations` - Request vehicle valuation
- `GET /api/valuations/:id` - Get valuation details
- `GET /api/valuations/vehicle/:vehicleId` - Get vehicle valuation history

#### Loans

- `POST /api/loans` - Submit loan application
- `GET /api/loans` - List loan applications
- `GET /api/loans/:id` - Get loan details
- `GET /api/loans/:id/eligibility` - Check eligibility
- `PATCH /api/loans/:id/status` - Update loan status

#### Offers

- `GET /api/offers/loan/:loanId` - Get loan offers
- `GET /api/offers/:id` - Get offer details
- `POST /api/offers/:id/accept` - Accept an offer
- `POST /api/offers/:id/reject` - Reject an offer

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Manual Testing

#### Quick Test with cURL

```bash
# 1. Create a vehicle
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGBH41JXMN109186",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "mileage": 35000
  }'

# 2. Request valuation
curl -X POST http://localhost:3000/api/valuations \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": 1}'

# 3. Submit loan application
curl -X POST http://localhost:3000/api/loans \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "requestedAmount": 18000,
    "applicantName": "John Doe",
    "applicantAge": 32,
    "monthlyIncome": 5500,
    "creditScore": 720,
    "loanTerm": 48
  }'

# 4. View generated offers
curl http://localhost:3000/api/offers/loan/1
```

## 💼 Business Logic

### Loan Eligibility Criteria

The system checks the following criteria:

- **Age**: 18-65 years
- **Vehicle Value**: Minimum $5,000
- **Loan-to-Value Ratio**: Maximum 80%
- **Credit Score**: Minimum 600 (if provided)
- **Monthly Income**: Minimum $2,000 (if provided)
- **Debt-to-Income Ratio**: Maximum 40%

### Vehicle Valuation

**With RapidAPI Key:**

- Fetches real-time market data
- Provides accurate valuations

**Without API Key (Simulation):**

- Intelligent algorithm based on:
  - Vehicle age and depreciation
  - Mileage impact
  - Vehicle condition
  - Make and model base values

### Offer Generation

For eligible loans, the system automatically generates 2-3 offers:

- **Standard term**: 6.5% APR (preferred term)
- **Short term**: 5.9% APR (36 months)
- **Long term**: 7.2% APR (60 months)

## 📁 Project Structure

src/
├── common/                  # Shared utilities
│   ├── filters/             # Exception filters
│   └── interceptors/        # Response interceptors
├── config/                  # Configuration files
│   └── database.config.ts
├── database/
│   ├── entities/            # TypeORM entities
│   │   ├── vehicle.entity.ts
│   │   ├── valuation.entity.ts
│   │   ├── loan.entity.ts
│   │   └── offer.entity.ts
│   └── seeders/             # Database seeders
├── modules/
│   ├── vehicles/            # Vehicle management
│   ├── valuations/          # Valuation services
│   ├── loans/               # Loan processing
│   └── offers/              # Offer management
├── app.module.ts            # Root module
└── main.ts                  # Application entry

## 🛠️ Technology Stack

- **NestJS 10.x** - Progressive Node.js framework
- **TypeORM 0.3.x** - ORM for database operations
- **SQLite3** - In-memory database (easily switchable)
- **TypeScript 5.x** - Type-safe development
- **Swagger/OpenAPI** - API documentation
- **class-validator** - DTO validation
- **Jest** - Testing framework
- **Axios** - HTTP client for external APIs

## 🔒 Security Features

- ✅ Input validation using class-validator
- ✅ SQL injection prevention via TypeORM
- ✅ VIN format validation with regex
- ✅ Comprehensive error handling
- ✅ No sensitive data in error messages
- ✅ CORS configuration

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request successful",
  "data": { ... },
  "timestamp": "2025-12-11T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["Validation failed"],
  "timestamp": "2025-12-11T10:30:00.000Z",
  "path": "/api/vehicles"
}
```

## 🚦 Build Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm test

# Generate test coverage
npm run test:cov

# Lint code
npm run lint
```

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Application port | No | 3000 |
| NODE_ENV | Environment | No | development |
| RAPIDAPI_KEY | RapidAPI key | No | - |
| RAPIDAPI_HOST | RapidAPI host | No | vin-lookup.p.rapidapi.com |

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

### Module Not Found Errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clean rebuild
rm -rf dist
npm run build
```

## 📚 Additional Documentation

- **ARCHITECTURE.md** - System design and patterns
- **API_USAGE_GUIDE.md** - Detailed API examples
- **RUNNING_AND_TESTING_GUIDE.md** - Complete testing guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Ayanleke Anjolajesu Stephen

- GitHub: [@diddlecodes](https://github.com/diddlecodes)
- Email: <anjolajesuayanleke@gmail.com>

## 🙏 Acknowledgments

Built as part of the Autochek technical assessment.

## 📞 Support

For questions or issues:

- Open an issue in this repository
- Contact: <anjolajesuayanleke@gmail.com>

---
December 2025
