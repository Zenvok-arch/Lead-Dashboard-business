🚀 Lead Management Dashboard (Private SaaS)

A personal lead management system built to organize, filter, and act on scraped business data efficiently. Designed for private use with secure access via Tailscale.

---

✨ Features

- 📂 CSV Upload
  
  - Import leads directly from scraper output
  - Automatic parsing and database storage

- 📊 Dashboard View
  
  - Clean table layout (desktop)
  - Responsive card layout (mobile)

- 🔍 Smart Filters
  
  - Minimum rating filter
  - Minimum reviews filter
  - “No Website” filter (🔥 hot leads)

- 📞 Quick Actions
  
  - One-click call ("tel:")
  - WhatsApp redirect
  - Open Google Maps link

- 📝 Lead Management
  
  - Add / Edit / Delete leads
  - Status tracking (Not Called, Called, Interested, Closed)
  - Notes for follow-ups

- 🔥 Hot Leads Highlight
  
  - Automatically shows high-potential leads:
    - Rating ≥ 4
    - Reviews ≥ 50
    - No website

- 📱 Mobile Optimized
  
  - Hamburger sidebar menu
  - Card-based lead display

---

🧠 Tech Stack

Frontend

- React
- Tailwind CSS

Backend

- Node.js
- Express

Database

- MongoDB

Process Manager

- PM2

Private Network

- Tailscale



---

⚙️ Setup Instructions

1. Clone Repository

git clone <your-repo>
cd project

---

2. Backend Setup

cd backend
npm install

Create ".env" file:

MONGO_URI=your_mongodb_connection

PORT=4000

Run server:

node server.js

---

3. Frontend Setup

cd frontend
npm install
npm run build

---

4. Serve Frontend from Backend

Ensure Express serves React build:

app.use(express.static('frontend/build'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend/build', 'index.html'));
});

---

📂 CSV Format

Ensure your CSV follows this structure:

Name,Rating,Reviews,Website,Phone,MapsLink

Example:

 FITNESS,4.7,120,,0000000010,https://maps.google.com/...

---

🔐 Private Hosting (Tailscale)

Install Tailscale:

curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

Access your app via:

http://100.x.x.x:4000

Only devices in your Tailscale network can access it.

---

⚡ Run with PM2 (Production)

npm install -g pm2
pm2 start server.js --name dashboard
pm2 save
pm2 startup

---

🧠 Usage Workflow

1. Upload CSV from scraper
2. Leads stored in database
3. Filter high-quality leads
4. Call / WhatsApp directly
5. Track status and notes

---

🔥 Future Improvements

- Call next lead automation
- Follow-up reminders
- Analytics dashboard
- Export filtered leads

---

💡 Purpose

This project is built as a personal lead generation tool to:

- Identify high-quality businesses
- Quickly contact them
- Track outreach efficiently

---

⚠️ Note

This is a private tool intended for personal use over a secure network (Tailscale). Not publicly exposed.

---

👑 Author

Built as part of a real-world learning + business system.

---