# Open-Health.ai

🚑 **Open-Health.ai** is an open-source emergency healthcare platform leveraging **AI, edge computing, and blockchain** for real-time triage, routing, and patient care coordination.  

This repository contains the **React-based frontend application**, which provides the patient and hospital-facing interfaces.

---

## 📦 Features
- ⚡ **Real-time Triage** – Symptom input with AI-driven recommendations  
- 🌍 **Multilingual Support** – Built-in NLP services for accessibility  
- 🏥 **Hospital Dashboard** – Live bed capacity, routing, and predictive analytics  
- 📱 **Mobile-Ready UI** – Responsive design with PWA support  
- 🔒 **Secure & Compliant** – Blockchain-based consent verification  

---

## 🛠️ Prerequisites
Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18+ recommended)  
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)  
- [Git](https://git-scm.com/)  

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/SA-Msweli/open-health.ai.git
cd open-health.ai
```

### 2. Install Dependencies
Using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following (example values shown):

```env
# API Gateway / Backend
REACT_APP_API_BASE_URL=https://api.open-health.ai

# Firebase (if integrated)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Blockchain / Consent
REACT_APP_CHAIN_PROVIDER_URL=https://chain.open-health.ai
REACT_APP_CHAIN_NETWORK_ID=your_network_id
```

> ⚠️ Never commit real secrets to Git! Use `.env.local` for development.

### 4. Run Development Server
```bash
npm start
```
Or:
```bash
yarn start
```
The app will be available at:  
👉 `http://localhost:3000`

---

## 🧪 Running Tests
```bash
npm test
```
Or:
```bash
yarn test
```

For coverage:
```bash
npm run test:coverage
```

---

## 🏗️ Build for Production
```bash
npm run build
```
This will create an optimized build in the `build/` folder.  

To preview locally:
```bash
npm run serve
```

---

## 📦 Deployment

### Vercel (Recommended for React/Next.js)
1. Push to GitHub  
2. Connect repo to [Vercel](https://vercel.com/)  
3. Add environment variables in Vercel dashboard  
4. Deploy 🚀  

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Docker (Optional)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```
Build & run:
```bash
docker build -t open-health-frontend .
docker run -p 3000:3000 open-health-frontend
```

---

## 📂 Project Structure
```
open-health.ai/
│── public/             # Static assets
│── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── services/       # API + Blockchain services
│   ├── context/        # React context providers
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Helpers and utils
│   └── App.js          # Main app entry
│── .env                # Environment variables
│── package.json        # Project metadata & scripts
```

---

## 🤝 Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/new-ui`)  
3. Commit changes (`git commit -m 'Add new UI component'`)  
4. Push branch (`git push origin feature/new-ui`)  
5. Open a Pull Request  

---

## 📜 License
This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.  

---

## 🌍 Community & Support
- 🐛 Report issues via [GitHub Issues](https://github.com/SA-Msweli/open-health.ai/issues)  
- 💬 Join our discussions on [GitHub Discussions](https://github.com/SA-Msweli/open-health.ai/discussions)  
- 📧 Contact: support@open-health.ai  
