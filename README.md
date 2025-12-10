# FloodGuard Delhi - Web Development MVP

## 📋 Project Overview

FloodGuard Delhi is an AI-powered flood monitoring and early warning system for the National Capital Region (NCR) of Delhi. The web application integrates real-time weather data, IoT sensor readings, social media intelligence, and machine learning predictions to provide comprehensive flood risk assessment and automated alert generation.

**Key Value Proposition:**
- Real-time flood risk monitoring across 11 Delhi districts
- AI-powered multi-agent system for intelligent data fusion
- Interactive visualization of flood risk zones on interactive maps
- Automated alert generation for both public and operations teams
- Integration with ML model predictions from collaborative research

---

## 🚀 Quick Start

### Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **pnpm** (Package Manager)
   - Install globally: `npm install -g pnpm`
   - Verify installation: `pnpm --version`

3. **MongoDB** (Optional - for database features)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd floodguard-delhi-deploy
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```
   This will install all required packages (may take 2-5 minutes).

3. **Set up environment variables:**
   
   Create a `.env` file in the `floodguard-delhi-deploy` directory:
   
   ```env
   # Required: Mapbox API Token (for map visualization)
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   
   # Optional: Database Configuration
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=floodguard
   
   # Optional: Gemini AI API Key (for AI agents)
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   
   # Optional: Twitter API (for social media monitoring)
   # TWITTER_API_KEY=your_twitter_api_key_here
   ```

   **How to get API keys:**
   - **Mapbox**: Sign up at https://www.mapbox.com/ → Get your access token
   - **Gemini API**: Get from https://makersuite.google.com/app/apikey (for AI agents)
   - **MongoDB**: Use local installation or MongoDB Atlas connection string

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Access the application:**
   - Open your browser and navigate to: `http://localhost:3000` (or the port shown in terminal)
   - The application should load automatically

---

## 📁 Project Structure

```
floodguard-delhi-deploy/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── MapView.tsx           # Interactive map component
│   │   │   ├── DistrictRiskPanel.tsx # District statistics panel
│   │   │   ├── AgentControls.tsx     # AI agent controls
│   │   │   └── ui/                   # UI component library
│   │   ├── pages/         # Page components
│   │   │   └── Home.tsx   # Main dashboard page
│   │   └── lib/           # Utilities and tRPC client
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── agents/           # AI agent implementations
│   │   ├── weatherAgent.ts      # A1: Weather data collection
│   │   ├── drainAgent.ts        # A2: IoT and incident processing
│   │   ├── socialAgent.ts       # A3: Social media monitoring
│   │   ├── riskFusionAgent.ts   # A4: AI-powered risk assessment
│   │   ├── commsAgent.ts        # A6: Alert generation
│   │   └── orchestrator.ts      # Agent coordination
│   ├── _core/            # Core server utilities
│   ├── data/             # GeoJSON data files
│   │   └── ncr_districts_with_flood_risk.geojson
│   └── routers/          # API routes
│       ├── routers.ts    # Main tRPC router
│       └── iot.ts        # IoT sensor endpoints
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Database table definitions
├── shared/               # Shared types and constants
└── package.json          # Project dependencies
```

---

## 🎯 Key Features

### 1. Interactive Flood Risk Map
- **District-Level Risk Visualization:**
  - Color-coded districts based on ML model flood risk scores
  - Risk levels: Low (Green) → Medium (Yellow/Orange) → High (Red)
  - Clickable districts showing detailed risk information
  - Real-time incident markers overlaid on map
  - Interactive legend with risk level guide

- **Data Source:**
  - Pre-trained Random Forest model output from Google Colab
  - District boundaries with average flood risk per district
  - 22 NCR districts fully mapped and visualized
  - Automatic coordinate conversion (UTM → WGS84) for Mapbox compatibility

### 2. District Risk Analysis Panel
- Top 5 highest-risk districts prominently displayed
- Complete district list sorted by risk level
- Risk percentage with visual progress bars
- Color-coded badges (Low/Medium/High risk)
- Sortable and filterable table view

### 3. AI Agent System

The system uses 5 specialized AI agents working in orchestrated phases:

#### Phase 1: Parallel Data Collection (A1, A2, A3)

**A1 - Weather Agent:**
- Fetches real-time weather data from Open-Meteo API
- Collects rain probability and expected rainfall
- Covers 11 Delhi zones with zone-specific variations
- Updates every cycle (configurable, default 15 seconds)

**A2 - Drain/Grid Agent:**
- Processes IoT sensor data from water level sensors
- Receives citizen incident reports
- Monitors drain conditions and blockages
- Tracks severity levels (low/medium/high)

**A3 - Social Media Agent:**
- Monitors Twitter/X for flood-related posts (ready for integration)
- Currently uses AI to generate realistic social signals
- Identifies high-risk posts with risk flags
- Tracks sentiment and urgency

#### Phase 2: Risk Fusion (A4)

**A4 - Risk Fusion Agent (Powered by Gemini AI):**
- Analyzes aggregated data from A1, A2, A3
- Computes comprehensive flood risk scores
- Identifies high-risk zones
- Determines key contributing factors
- Provides confidence scores and reasoning

#### Phase 3: Alert Generation (A6)

**A6 - Communications Agent (Powered by Gemini AI):**
- Receives risk assessment from A4
- Generates two types of alerts:
  - **Public Alerts:** Clear, actionable messages for citizens
  - **Operations Alerts:** Technical messages with specific actions for emergency teams
- Tailors tone based on risk level (urgent/cautious/informative)

### 4. Weather Forecasts Dashboard
- Zone-by-zone weather forecasts
- Rain probability percentage
- Expected rainfall in mm
- Flood risk scores per zone
- Visual progress bars for risk levels
- Auto-refresh every 10 seconds

### 5. Incident Management
- **Citizen Reporting:**
  - Simple incident report dialog
  - Location selection by zone
  - Type selection (drain blockage / citizen report)
  - Description and optional GPS coordinates
  - Real-time incident markers on map

### 6. Social Media Monitoring
- Real-time social media feed
- Risk-flagged posts highlighted
- User attribution
- Zone tagging
- Sentiment analysis

### 7. IoT Sensor Integration
- RESTful API endpoints for sensor data
- Real-time water level readings
- Danger threshold alerts
- Sensor location mapping

---

## 🔧 Available Commands

### Development
```bash
pnpm dev          # Start development server with hot-reload
```

### Production
```bash
pnpm build        # Build for production
pnpm start        # Start production server
```

### Code Quality
```bash
pnpm check        # Type check without emitting files
pnpm format       # Format code with Prettier
pnpm test         # Run tests
```

### Database
```bash
pnpm db:push      # Push database schema changes
```

---

## 🌐 API Endpoints

The application uses tRPC for type-safe API calls. Key endpoints:

### Flood Data
- `flood.forecasts` - Get weather forecasts
- `flood.incidents` - Get incident reports
- `flood.reportIncident` - Submit new incident
- `flood.alerts` - Get active alerts
- `flood.socialReports` - Get social media posts
- `flood.riskMap` - Get GeoJSON for map visualization
- `flood.districtRisks` - Get district statistics

### Agent Operations
- `ops.run` - Run single agent cycle manually
- `ops.loop.start` - Start continuous agent loop
- `ops.loop.stop` - Stop agent loop
- `ops.loop.status` - Get loop status
- `ops.trace` - Get agent execution timeline

### IoT
- `iot.submitWaterLevel` - Submit sensor reading
- `iot.getWaterLevels` - Get all sensor readings
- `iot.getSensorReading` - Get specific sensor data
- `iot.generateMockData` - Generate test data

---

## 🗄️ Database Setup

### MongoDB (Optional)

The application works without MongoDB, but for full functionality with data persistence:

1. **Local MongoDB:**
   ```bash
   # Start MongoDB service (varies by OS)
   # Windows: MongoDB should run as a service
   # Mac/Linux: mongod
   ```

2. **Update .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=floodguard
   ```

3. **MongoDB Atlas (Cloud):**
   - Create free cluster at https://www.mongodb.com/cloud/atlas
   - Get connection string
   - Update `MONGODB_URI` in `.env`

### MySQL (Optional)

For structured data storage, configure MySQL in `.env`:
```env
DATABASE_URL=mysql://user:password@localhost:3306/floodguard
```

---

## 📊 ML Model Integration

The application includes pre-calculated flood risk data from a Random Forest model:

- **Location**: `server/data/ncr_districts_with_flood_risk.geojson`
- **Format**: GeoJSON with district boundaries and risk scores
- **Coordinate System**: Automatically converted from UTM Zone 43N to WGS84 for web display
- **Features Used**: Rainfall, DEM, TWI, NDBI, distance to drainage
- **Output**: Average flood risk per district (0.0 - 0.0005 scale)

This data is served via the API and visualized on the interactive map.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_MAPBOX_ACCESS_TOKEN` | **Yes** | Mapbox API token for map visualization | `pk.eyJ1Ij...` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI agents | `AIza...` |
| `GEMINI_MODEL` | Optional | Gemini model version | `gemini-1.5-flash` |
| `MONGODB_URI` | Optional | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Optional | MongoDB database name | `floodguard` |
| `DATABASE_URL` | Optional | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `PORT` | Optional | Server port (default: 3000) | `3000` |
| `NODE_ENV` | Optional | Environment mode | `development` |

**Note**: The application will run with just `VITE_MAPBOX_ACCESS_TOKEN`, but some features (AI agents, database persistence) require additional keys.

---

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is busy, the server will automatically find the next available port. Check the terminal for the actual port number.

### Map Not Loading
- Verify `VITE_MAPBOX_ACCESS_TOKEN` is set correctly in `.env`
- Check browser console for errors
- Ensure the token has proper permissions in Mapbox account

### AI Agents Not Working
- Verify `GEMINI_API_KEY` is set in `.env`
- Check server console for API errors
- Agents will fall back to mock data if API fails

### Database Connection Issues
- Verify MongoDB is running (if using local)
- Check connection string format
- Application works without database (data not persisted between restarts)

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
pnpm install
```

### Build Errors
```bash
# Clear cache and rebuild
pnpm install --force
pnpm build
```

### TypeScript Errors
```bash
# Check for type errors
pnpm check

# If errors persist, try:
rm -rf node_modules
pnpm install
```

---

## 🎓 Quick Demo Instructions

1. **Start the application:**
   ```bash
   pnpm dev
   ```

2. **Open the dashboard:**
   - Navigate to `http://localhost:3000`
   - You should see the FloodGuard dashboard

3. **Test AI Agents:**
   - Click "Run Cycle" in the Agent Controls panel
   - Watch the Agent Timeline for execution
   - Check the Status Board for results

4. **View Flood Risk:**
   - Scroll to "District Flood Risk Analysis"
   - Click on colored districts on the map
   - View district statistics in the left panel

5. **Report an Incident:**
   - Click "Report Incident" button
   - Fill in the form (zone, type, description)
   - See the incident appear on the map

6. **Monitor Weather:**
   - View "Weather Forecasts & Risk Zones" section
   - See real-time data from Open-Meteo API

7. **Start Continuous Monitoring:**
   - In Agent Controls, set interval (default 15 seconds)
   - Click "Start Loop"
   - Watch real-time updates in all sections

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend:**
- React 19.1 with TypeScript
- Mapbox GL for interactive mapping
- Tailwind CSS for styling
- Radix UI component library
- tRPC for type-safe API calls
- React Query for data management

**Backend:**
- Express.js server
- TypeScript throughout
- tRPC for end-to-end type safety
- MongoDB for operational data storage
- MySQL (Drizzle ORM) for structured data
- Google Gemini AI for intelligent agents

**Key Integrations:**
- Open-Meteo API (free weather data)
- Mapbox (map visualization)
- Google Gemini AI (risk fusion & alert generation)
- Twitter API v2 (social media monitoring - ready for integration)
- Custom IoT endpoints (sensor data)

### Data Flow

```
External APIs → Backend Agents → Database → Frontend
     ↓              ↓               ↓          ↓
Open-Meteo    →   A1 (Weather)  → MongoDB  → Dashboard
Twitter API   →   A3 (Social)   → MongoDB  → Dashboard
IoT Sensors   →   A2 (Drain)    → MongoDB  → Dashboard
ML Model      →   GeoJSON       → File     → Map Layer
```

---

## 📝 Development Notes

### Adding New Features
- **Frontend components**: `client/src/components/`
- **Backend routes**: `server/routers.ts`
- **AI agents**: `server/agents/`
- **Database schema**: `drizzle/schema.ts`

### Testing
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
```

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting
- Run `pnpm format` before committing

---

## 🚀 Deployment

### Production Build
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Setup
Ensure all environment variables are set in production:
- `VITE_MAPBOX_ACCESS_TOKEN` (required)
- `GEMINI_API_KEY` (for AI agents)
- `MONGODB_URI` (for data persistence)
- `NODE_ENV=production`

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checking: `pnpm check && pnpm test`
4. Format code: `pnpm format`
5. Submit for review

---

## 📄 License

MIT License

---

## 👥 Support & Contact

For issues or questions:
- Check the troubleshooting section above
- Review server console logs
- Check browser console for frontend errors
- Verify all environment variables are set correctly

---

## 📚 Additional Resources

- **Mapbox Documentation**: https://docs.mapbox.com/
- **tRPC Documentation**: https://trpc.io/
- **React Documentation**: https://react.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/
- **Open-Meteo API**: https://open-meteo.com/

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Node Version**: 18+  
**Package Manager**: pnpm

