# DorCall - Call Center System UI

A modern, professional call center management system built with React, TypeScript, Vite, and Tailwind CSS. Inspired by Telnyx's clean developer-focused design.

## Features

### Agent Dashboard
- **Dialer**: Full-featured phone dialer with quick dial contacts
- **Call History**: View and filter past calls with detailed information
- **SMS Chat**: Real-time messaging with customers
- **Contact List**: Manage customer contacts with full CRUD operations
- **Agent Status**: Real-time status management (Available, Busy, Offline)

### Admin Dashboard
- **Agent Management**: Create, edit, and monitor agents
- **Call Monitoring**: Real-time view of active calls with listen/end call capabilities
- **Analytics**: Comprehensive reports and metrics
  - Call volume by hour
  - Top performing agents
  - Call status distribution
  - Trend analysis
- **SMS Logs**: Track all SMS communications

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Axios** - HTTP client (for API integration)
- **Socket.io Client** - Real-time communications

## Design Theme

The UI follows Telnyx's design philosophy:
- Dark theme with professional color scheme
- Clean, modern interface
- Excellent readability
- Intuitive navigation
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
cd dorcall-fe
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
dorcall-fe/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AgentManagement.tsx
│   │   ├── Analytics.tsx
│   │   ├── CallHistory.tsx
│   │   ├── CallMonitoring.tsx
│   │   ├── ContactList.tsx
│   │   ├── Dialer.tsx
│   │   └── SmsChat.tsx
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── AgentDashboard.tsx
│   │   └── Login.tsx
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles and Tailwind
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Default Login

For demo purposes, the login accepts any credentials:
- Select "Agent" role to access Agent Dashboard
- Select "Admin" role to access Admin Dashboard

## Future Integration

This UI is designed to integrate with the backend API documented in `test.md`. API endpoints to implement:

- `POST /auth/login` - Authentication
- `GET /agents` - Fetch agents
- `POST /call` - Initiate calls
- `GET /call/history` - Get call logs
- `POST /sms/send` - Send SMS
- `GET /sms/history` - Get SMS logs
- WebSocket connection for real-time events

## Color Palette

- **Primary**: Green/Teal (`#22c55e` - `#15803d`) - Telnyx-inspired
- **Dark Background**: Navy/Slate (`#0f172a` - `#1e293b`)
- **Accents**: 
  - Green (success/available): `#22c55e`
  - Yellow (warning/busy): `#eab308`
  - Red (error/offline): `#ef4444`

## License

This project is part of the DorCall call center system.
