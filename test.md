Documentation for Call center system for Dory
All the listed features  below can be manipulated once the development is started, Due to complex technologies that the developers should learn and adopt.
1. Project Objective
Build a self-hosted communication platform capable of handling:
• inbound voice calls
 • outbound voice calls
 • SMS messaging
 • call logging
 • agent management
 • real-time call monitoring

2. System Architecture Overview




Frontend runs on Windows PC.
Backend and PBX(Asterisk) runs on Linux server.

3. Core Technology Stack
Component
Technology
Frontend Dialer
React.js
Backend API
Node.js + Express
PBX Engine
Asterisk
PBX Interface
AMI (Asterisk Manager Interface)
Database
MySQL
Softphone
Zoiper (For local testing)
SMS Gateway
GSM Gateway (For Production)
Realtime Events
WebSocket (2nd option)
Reverse Proxy
Nginx


4. Infrastructure Requirements
Minimum development environment:
Resource
Recommendation
CPU
4 cores
RAM
8 GB
Storage
100 GB SSD
Network
stable internet

Production environment:
Resource
Recommendation
CPU
4-8 cores
RAM
8–16 GB
Storage
500 GB SSD
Network
1 Gbps


5. Step 1 — Environment Setup
Install required packages on Linux server.
Ubuntu example:
sudo apt update
sudo apt install git curl build-essential
Install Node.js:
sudo apt install nodejs npm
Verify installation:
node -v
npm -v
Install MySQL:
sudo apt install mysql-server

6. Step 2 — Install Asterisk PBX
Sample : 
Install Asterisk PBX.
Ubuntu/Mint example:
sudo apt install asterisk
Verify Asterisk is running:
sudo systemctl status asterisk
Access Asterisk CLI:
sudo asterisk -rvvv

7. Step 3 — Configure SIP Extensions
Sample configuration file:
/etc/asterisk/pjsip.conf
Example extension:
[1001]
type=endpoint
context=internal
disallow=all
allow=ulaw
auth=1001auth
aors=1001

[1001auth]
type=auth
auth_type=userpass
password=1234
username=1001

[1001]
type=aor
max_contacts=1
Reload configuration:
asterisk -rx "pjsip reload"

8. Step 4 — Configure Dialplan (Optional)
Edit dialplan file:
/etc/asterisk/extensions.conf
Example outbound call rule:
[internal]

exten => _X.,1,Dial(PJSIP/${EXTEN})
Example test extension:
exten => 1000,1,Answer()
same => n,Playback(hello-world)
same => n,Hangup()
Reload dialplan:
asterisk -rx "dialplan reload"

9. Step 5 — Setup Softphone
Install Zoiper on agent computer.
This will be used while the team have not yet developed the CRM or Dashboard + WebRtc and GSM
Configure account:
Field
Value
Username
1001
Password
1234
Domain
server-ip

After configuration the agent can:
• make calls
 • receive calls

10. Step 6 — Setup Node.js Backend API
Create backend project.
mkdir voip-backend
cd voip-backend
npm init -y
Install dependencies:
npm install express mysql2 socket.io
Install AMI client library:
npm install asterisk-ami-client
Project structure:
backend
│
├── controllers
│
├── services
│
├── routes
│
├── websocket
│
└── server.js

11. Step 7 — Connect Node.js to Asterisk AMI
Example AMI connection.
const AmiClient = require('asterisk-ami-client');

const ami = new AmiClient();

ami.connect('password','admin',{
 host: '127.0.0.1',
 port: 5038
});
AMI allows Node.js to:
• start calls
 • monitor calls
 • receive events



12. Step 9 — Setup MySQL Database
Create database.
CREATE DATABASE call_center;
Main tables.

users

id
INT
name
STRING
email
STRING
password
STRING
role
ENUM(“agent”, “admin”)
created_at
DATETIME
updated_at
DATETIME



agents

id
INT
fullName
STRING
status
STRING
sip_extension
STRING
sip_password
STRING
sip_domain
DATETIME
created_at
DATETIME
updated_at
DATETIME



call_logs

id
INT
customer_number
STRING
call_type
ENUM('inbound', 'outbound')
call_status
ENUM('answered', 'missed', 'failed', 'busy')
answer_time
STRING
end_time
STRING
duration
STRING
sip_extension
STRING
created_at
DATETIME
updated_at
DATETIME



sms_logs

id
INT
agents_id
BIGINT
phone_number
STRING
message
STRING
message_type
STRING
delivery_status
ENUM('sent', 'delivered', 'failed')
created_at
DATETIME
updated_at
DATETIME



customer_contacts

id
INT
name
STRING
phone_number
STRING
message
STRING
created_at
DATETIME
updated_at
DATETIME



13. Step 10 — Build React Dialer Frontend
Frontend runs on Windows PC.
Install React project.
npx create-react-app react-dialer
Install dependencies:
npm install axios socket.io-client

14. Frontend Application Structure
frontend
│
├── pages
│     ├── AgentDashboard
│     ├── AdminDashboard
│
├── components
│     ├── Dialer
│     ├── CallHistory
│     ├── SmsChat
│     ├── ContactList
│
├── services
│     ├── api.js
│
└── socket
     └── callEvents.js

15. Agent Dashboard Features
Agent role includes:
Agent Dashboard
│
├── Dialer
│
├── Call History
│
├── SMS Chat
│
├── Contact List
│
└── Agent Status
Agent can:
• dial numbers
 • receive calls
 • send SMS
 • view call history

16. Admin Dashboard Features
Admin role includes:
Admin Dashboard
│
├── Agent Management
│
├── Call Monitoring
│
├── Call Logs
│
├── SMS Logs
│
├── SIP Extension Manager
│
└── System Analytics
Admin capabilities:
• create agents
 • assign SIP extensions
 • monitor active calls

17. Real-Time Event System
Use WebSocket or AMI for live updates.
Events include:
incoming-call
call-started
call-ended
agent-status
sms-received
These update the React UI instantly.

18. SMS Gateway Integration
Two SMS options:
Option 1 — GSM Gateway
Asterisk
   │
   ▼
GSM Gateway Device
   │
   ▼
Mobile Network
Option 2 — SMS API providers.
Examples:
• Twilio
 • Telnyx

19. Security
Implement:
• JWT authentication
 • HTTPS encryption
 • firewall protection
 • SIP password security
 • rate limiting

20. Future Improvements
Possible upgrades:
• browser WebRTC calling
 • call recording
 • CRM integration

21. Deliverables
The final platform must expose these APIs:
/call
/sms/send
/sms/history
/call/history
/agents
/auth/login
These APIs power the React dialer and admin dashboard.

22. Expected Benefits
Feature
Result
Customization
full control
Scalability
high
Call center capability
enterprise-level


