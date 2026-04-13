# SplitEase — Expense Splitting App

A full-stack expense splitting app (Splitwise clone) built with React, Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Axios    |
| Backend    | Node.js, Express 4                  |
| Database   | MongoDB with Mongoose               |
| Auth       | JWT + bcrypt                        |

---

## Project Structure

```
splitwise-app/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers (auth, groups, expenses, balances)
│   ├── middleware/     # JWT auth guard
│   ├── models/         # Mongoose schemas (User, Group, Expense)
│   ├── routes/         # Express route definitions
│   ├── .env            # Environment variables
│   └── server.js       # App entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── Auth/       # Login, Register pages
        │   ├── Balances/   # Balance view
        │   ├── Expenses/   # Expense list, add modal
        │   ├── Groups/     # Groups list, detail, modals
        │   └── Layout/     # Navbar, Modal
        ├── context/        # AuthContext (global user state)
        ├── services/       # Axios API service layer
        └── styles/         # Global CSS
```

---

## Mac Setup (Step by Step)

### Prerequisites (one-time)

```bash
# 1. Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js
brew install node

# 3. Install MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Backend Setup

```bash
cd splitwise-app/backend
npm install
# .env is already configured — edit JWT_SECRET for production
npm run dev
# → Server running on port 5000
# → MongoDB connected
```

### Frontend Setup

```bash
cd splitwise-app/frontend
npm install
npm start
# → App opens at http://localhost:3000
```

---

## Environment Variables

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/splitwise
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### frontend/.env
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth

#### POST /api/auth/register
```json
// Request
{ "name": "Alice Smith", "email": "alice@example.com", "password": "secret123" }

// Response 201
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { "_id": "...", "name": "Alice Smith", "email": "alice@example.com" }
}
```

#### POST /api/auth/login
```json
// Request
{ "email": "alice@example.com", "password": "secret123" }

// Response 200
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { "_id": "...", "name": "Alice Smith", "email": "alice@example.com" }
}
```

#### GET /api/auth/me  🔒
```json
// Response 200
{ "success": true, "user": { "_id": "...", "name": "Alice Smith", "email": "alice@example.com" } }
```

#### GET /api/auth/users/search?email=bob  🔒
```json
// Response 200
{ "success": true, "users": [{ "_id": "...", "name": "Bob Jones", "email": "bob@example.com" }] }
```

---

### Groups

#### GET /api/groups  🔒
```json
// Response 200
{ "success": true, "groups": [ { "_id": "...", "name": "Goa Trip", "members": [...], ... } ] }
```

#### POST /api/groups  🔒
```json
// Request
{ "name": "Goa Trip", "description": "Beach holiday", "memberEmails": ["bob@example.com"] }

// Response 201
{ "success": true, "group": { "_id": "...", "name": "Goa Trip", "members": [...] } }
```

#### GET /api/groups/:id  🔒
```json
// Response 200
{ "success": true, "group": { "_id": "...", "name": "Goa Trip", "members": [...] } }
```

#### POST /api/groups/:id/members  🔒
```json
// Request
{ "email": "charlie@example.com" }

// Response 200
{ "success": true, "group": { "_id": "...", "members": [...] } }
```

---

### Expenses

#### POST /api/expenses  🔒
```json
// Request
{
  "description": "Hotel booking",
  "amount": 3000,
  "groupId": "<group_id>",
  "paidBy": "<user_id>",
  "splitBetween": ["<user_id_1>", "<user_id_2>", "<user_id_3>"]
}

// Response 201
{
  "success": true,
  "expense": {
    "_id": "...",
    "description": "Hotel booking",
    "amount": 3000,
    "paidBy": { "_id": "...", "name": "Alice Smith" },
    "splitBetween": [...],
    "groupId": { "_id": "...", "name": "Goa Trip" }
  }
}
```

#### GET /api/expenses/group/:groupId  🔒
```json
// Response 200
{ "success": true, "expenses": [ ... ] }
```

#### DELETE /api/expenses/:id  🔒
```json
// Response 200
{ "success": true, "message": "Expense deleted." }
```

---

### Balances

#### GET /api/balances/group/:groupId  🔒
```json
// Response 200
{
  "success": true,
  "settlements": [
    {
      "from": { "_id": "...", "name": "Bob Jones", "email": "bob@example.com" },
      "to":   { "_id": "...", "name": "Alice Smith", "email": "alice@example.com" },
      "amount": 1000
    }
  ]
}
```

---

## Example curl Commands (Test in Terminal)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"pass1234"}'

# Login (save the token)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"pass1234"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Create a group
curl -X POST http://localhost:5000/api/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Weekend Trip","description":"Road trip expenses"}'
```

---

## Future Scalability (Design Hooks)

The codebase is structured to easily support:

| Feature              | Where to extend                                      |
|----------------------|------------------------------------------------------|
| Unequal splits       | Add `splitType` + `splitAmounts` to Expense model    |
| Payment integration  | New `payments` route + Razorpay/Stripe controller    |
| Notifications        | New `notifications` model + email service in `utils/`|
| Real-time updates    | Add Socket.io to `server.js`, emit on expense create |
| AI expense insights  | New `/api/insights` route calling an LLM API         |
| Currency support     | Add `currency` field to Group model                  |
| Expense categories   | Extend `category` enum in Expense model              |

---

## Stopping the App

```bash
# In each terminal window press:
Ctrl + C

# Stop MongoDB (optional)
brew services stop mongodb-community
```
