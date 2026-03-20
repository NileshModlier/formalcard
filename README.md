# FormalCard - Virtual Business Card Platform

A modern, full-stack business card platform built with Next.js 14, TypeScript, and Prisma. Create, manage, and share professional digital business cards with customizable templates and real-time preview.

## 🚀 Features

### Phase 1 - MVP (Current)
- ✅ Email + Password authentication
- ✅ Google OAuth login
- ✅ Dashboard with card grid view
- ✅ Create business cards with 4 templates
- ✅ Live preview with instant updates
- ✅ PNG export functionality
- ✅ Public card sharing via unique slugs
- ✅ QR code generation
- ✅ Card quota management (40 cards per user)
- ✅ Profile and settings management
- ✅ Mobile-responsive design

### Phase 2 - Coming Soon
- PDF export with vector text
- vCard (.vcf) generation
- Admin dashboard
- Analytics and tracking
- Public directory
- API for mobile apps
- PWA support
- 8 color themes and 3 font pairs

### Phase 3 - Coming Soon
- GST verification (India)
- UPI payment integration
- Refundable deposit system
- Annual subscription (₹599)
- Corporate memberships
- Messaging system
- Multi-role access control

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Image Generation**: Canvas
- **QR Code**: qrcode.js

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials (optional)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd formalcard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/formalcard?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CARD_QUOTA_LIMIT=40
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run db:seed
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Demo Credentials

After running the seed script, you can log in with:
- **Email**: demo@formalcard.com
- **Password**: password123

## 🎨 Templates

FormalCard includes 4 professionally designed templates:

1. **Minimal Light** - Clean and modern design
2. **Corporate Indigo** - Professional blue gradient
3. **Bold Accent** - Vibrant orange-red gradient
4. **Monochrome Pro** - Elegant black and white

Each template supports 3 aspect ratios:
- Landscape (3:2)
- Square (1:1)
- Portrait (2:3)

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please do not submit pull requests.

## 📞 Support

For support, please contact the development team.

## 🔒 Security

- All passwords are hashed using bcrypt
- CSRF protection enabled
- Rate limiting on API endpoints
- Strict ownership enforcement for cards
- Secure session management with NextAuth

## 🗄️ Database Schema

### Core Models
- **User**: Authentication and user data
- **Profile**: User profile information
- **BusinessCard**: Business card data and design settings
- **CardEvent**: Analytics tracking (views, exports, shares)

### Access Control
- Row-level security through ownership checks
- Role-based access control (guest, verified_member, corporate_member, admin)
- Soft-delete for cards

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
Make sure to set these in your production environment:
- `DATABASE_URL` - Production PostgreSQL connection string
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXT_PUBLIC_APP_URL` - Your production domain
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)

### Database Deployment
```bash
# Run production migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 📊 API Routes

### Authentication
- `POST /api/auth/signup` - Create new user
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Cards
- `POST /api/cards` - Create new card
- `GET /api/cards` - List user's cards (protected)
- `GET /api/cards/[id]` - Get card details (protected)
- `PATCH /api/cards/[id]` - Update card (protected)
- `DELETE /api/cards/[id]` - Soft delete card (protected)
- `GET /api/cards/[id]/export/png` - Export card as PNG (protected)

### Settings
- `GET /api/settings` - Get user settings (protected)
- `PATCH /api/settings` - Update user settings (protected)

## 🧪 Testing

### Unit Tests (Coming Soon)
```bash
npm run test
```

### E2E Tests (Coming Soon)
```bash
npm run test:e2e
```

## 📝 Project Structure

```
formalcard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── cards/            # Card management pages
│   │   ├── settings/         # Settings pages
│   │   └── c/[slug]/         # Public card pages
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── dashboard-layout.tsx
│   │   ├── card-grid.tsx
│   │   ├── card-creator.tsx
│   │   ├── card-preview.tsx
│   │   └── settings-form.tsx
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts          # NextAuth configuration
│   │   └── prisma.ts        # Prisma client
│   └── types/               # TypeScript types
├── .env                     # Environment variables
├── .env.example            # Environment variables template
├── middleware.ts           # Next.js middleware
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎯 Roadmap

### Phase 2 - Q2 2025
- [ ] PDF export functionality
- [ ] vCard generation
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Public directory
- [ ] REST API for mobile apps
- [ ] PWA support
- [ ] Enhanced templates (8 colors, 3 fonts)

### Phase 3 - Q3 2025
- [ ] GST verification integration
- [ ] UPI payment system (Razorpay)
- [ ] Refundable deposit flow
- [ ] Annual subscription
- [ ] Corporate memberships
- [ ] Messaging system
- [ ] Multi-role access control
- [ ] Advanced admin features

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-optimized interface
- PWA support (coming in Phase 2)

## 🔄 Continuous Integration

The project uses automated testing and deployment pipelines to ensure code quality and reliability.

## 📄 Privacy Policy

FormalCard is committed to protecting user privacy. User data is stored securely and never shared with third parties without consent.

---

Built with ❤️ by the FormalCard Team