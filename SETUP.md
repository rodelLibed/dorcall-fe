# Quick Setup Guide

## Installation Steps

Since you're on Windows with PowerShell execution policy restrictions, here are alternative ways to set up the project:

### Option 1: Using CMD (Command Prompt)
Open Command Prompt (not PowerShell) and run:
```cmd
cd dorcall-fe
npm install
npm run dev
```

### Option 2: Bypass PowerShell Execution Policy (Temporary)
In PowerShell (Run as Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
cd dorcall-fe
npm install
npm run dev
```

### Option 3: Using Node Directly
```powershell
cd dorcall-fe
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```

## After Installation

1. Open your browser to `http://localhost:3000`
2. You'll see the login page
3. Enter any email/password
4. Select either "Agent" or "Admin" role
5. Click "Sign In"

### Agent Dashboard Features
- **Dialer**: Make calls with dialpad
- **Call History**: View past calls
- **SMS Chat**: Send/receive messages
- **Contacts**: Manage customer contacts

### Admin Dashboard Features
- **Agent Management**: Add/edit agents
- **Call Monitoring**: View active calls in real-time
- **Analytics**: View call statistics and reports
- **SMS Logs**: Track all SMS communications

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Next Steps for Integration

1. Set up the backend API (Node.js + Express)
2. Configure Asterisk PBX
3. Update API endpoints in components
4. Implement WebSocket for real-time updates
5. Add authentication with JWT
6. Connect to actual SMS gateway

## Troubleshooting

**If npm commands don't work:**
- Try using CMD instead of PowerShell
- Or run PowerShell as Administrator and change execution policy
- Or use the full node path as shown in Option 3

**If port 3000 is already in use:**
- The dev server will automatically try port 3001, 3002, etc.
- Or you can change the port in `vite.config.ts`

**If you see CORS errors:**
- This is expected until you set up the backend API
- The UI is ready to connect once the backend is running
