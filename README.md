# UVify

UV Monitoring System - A React + Vite application for real-time UV index tracking and monitoring.

## Overview

UVify is an intelligent UV index monitoring system that provides real-time UV tracking, personalized safety recommendations, and historical data analytics. The application features a modern, responsive UI with multi-language support (English, Tagalog, Ilocano) and dark mode.

## Features

- ☀️ **Real-time UV Monitoring** - Live UV index readings from ESP32 sensors
- 🛡️ **Safety Alerts** - Personalized recommendations based on current UV levels
- 📈 **Historical Data** - Track UV patterns over time with detailed charts
- 👥 **Multi-user Support** - Individual profiles with personalized settings
- 🌐 **Multi-language** - Support for English, Tagalog, and Ilocano
- 🌙 **Dark Mode** - Theme toggle for light/dark mode

## Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UVify
   ```

2. **Install dependencies**

   Using npm:
   ```bash
   npm install
   ```

   Using yarn:
   ```bash
   yarn install
   ```

   Using pnpm (recommended):
   ```bash
   pnpm install
   ```

## Running the Application

### Development Mode

Start the development server:

Using npm:
```bash
npm run dev
```

Using yarn:
```bash
yarn dev
```

Using pnpm:
```bash
pnpm dev
```

The application will be available at `http://localhost:5000` (or the port specified in your vite.config.js).

### Production Build

To create a production build:

Using npm:
```bash
npm run build
```

Using yarn:
```bash
yarn build
```

Using pnpm:
```bash
pnpm build
```

### Preview Production Build

To preview the production build locally:

Using npm:
```bash
npm run preview
```

Using yarn:
```bash
yarn preview
```

Using pnpm:
```bash
pnpm preview
```

## Project Structure

```
UVify/
├── src/
│   ├── api/              # API integrations
│   ├── components/       # Reusable React components
│   ├── contexts/         # React contexts (Theme, Language, UV Data)
│   ├── i18n/            # Internationalization translations
│   ├── pages/           # Page components
│   └── utils/           # Utility functions
├── app/                 # Next.js app directory (if used)
├── components/          # UI components
├── public/             # Static assets
└── package.json        # Project dependencies
```

## Configuration

The application connects to a backend API. Update the backend URL in `src/pages/Login.jsx` if needed:

```javascript
const BACKEND_URL = "https://uvify-backend.onrender.com"
```

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Radix UI** - UI components

## License

Private project
