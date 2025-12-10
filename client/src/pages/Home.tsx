import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  CloudRain,
  MapPin,
  MessageSquare,
  Droplets,
  Bot,
} from "lucide-react";
import { APP_TITLE } from "@/const";
import AgentTimeline from "@/components/AgentTimeline";
import AgentStatusBoard from "@/components/AgentStatusBoard";
import AgentControls from "@/components/AgentControls";
import MapView from "@/components/MapView";
import { ReportIncidentDialog } from "@/components/ReportIncidentDialog";
import { DistrictRiskPanel } from "@/components/DistrictRiskPanel";
import { useEffect } from "react";

export default function Home() {
  const utils = trpc.useUtils();
  const { data: forecasts, isLoading: loadingForecasts } = trpc.flood.forecasts.useQuery();
  const { data: incidents, isLoading: loadingIncidents } = trpc.flood.incidents.useQuery();
  const { data: alerts, isLoading: loadingAlerts } = trpc.flood.alerts.useQuery();
  const { data: socialReports, isLoading: loadingSocial } = trpc.flood.socialReports.useQuery();

  // Auto-refresh data every 10 seconds to show latest agent cycle results
  useEffect(() => {
    const interval = setInterval(() => {
      utils.flood.forecasts.invalidate();
      utils.flood.incidents.invalidate();
      utils.flood.alerts.invalidate();
      utils.flood.socialReports.invalidate();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [utils]);

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return "bg-red-500";
    if (score >= 0.6) return "bg-orange-500";
    return "bg-yellow-500";
  };

  const getAlertVariant = (tier: string) => {
    if (tier === "HIGH") return "destructive";
    if (tier === "MEDIUM") return "default";
    return "secondary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Droplets className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">{APP_TITLE}</h1>
              <p className="text-sm text-slate-300">AI-Powered Flood Monitoring & Early Warning System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* AI Agent System */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-400" />
            AI Agent System
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <AgentControls />
            </div>
            <div className="lg:col-span-1">
              <AgentStatusBoard />
            </div>
            <div className="lg:col-span-1">
              <AgentTimeline />
            </div>
          </div>
        </section>
        {/* Alerts Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            Active Alerts
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingAlerts ? (
              <p className="text-slate-300">Loading alerts...</p>
            ) : (
              alerts?.map((alert) => (
                <Card key={alert.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="text-sm uppercase">{alert.audience}</span>
                      <Badge variant={getAlertVariant(alert.riskTier)}>
                        {alert.riskTier}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">{alert.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Weather Forecasts */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CloudRain className="h-6 w-6 text-blue-400" />
            Weather Forecasts & Risk Zones
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loadingForecasts ? (
              <p className="text-slate-300">Loading forecasts...</p>
            ) : (
              forecasts?.map((forecast) => (
                <Card key={forecast.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base">{forecast.zone}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Rain Probability</span>
                      <span className="text-white font-semibold">{forecast.rainProb}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Expected Rainfall</span>
                      <span className="text-white font-semibold">{forecast.rainAmount}mm</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-sm">Flood Risk</span>
                        <span className="text-white font-semibold">{(forecast.riskScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getRiskColor(forecast.riskScore)}`}
                          style={{ width: `${forecast.riskScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* District Flood Risk Analysis */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-400" />
            District Flood Risk Analysis
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <DistrictRiskPanel />
            </div>
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <MapView incidents={incidents || []} forecasts={forecasts || []} showFloodRisk={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-400" />
            Incident Map
          </h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <MapView incidents={incidents || []} forecasts={forecasts || []} showFloodRisk={false} />
          </div>
        </section>

        {/* Reported Incidents */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="h-6 w-6 text-red-400" />
              Reported Incidents
            </h2>
            <ReportIncidentDialog />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {loadingIncidents ? (
              <p className="text-slate-300">Loading incidents...</p>
            ) : (
              incidents?.map((incident) => (
                <Card key={incident.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center justify-between">
                      <span>{incident.locationName || incident.zone}</span>
                      <Badge variant={incident.type === "drain" ? "secondary" : "default"}>
                        {incident.type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-slate-300 text-sm">{incident.description}</p>
                    {incident.latitude && incident.longitude && (
                      <p className="text-slate-400 text-xs">
                        📍 {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                      </p>
                    )}
                    <p className="text-slate-500 text-xs">
                      {new Date(incident.timestamp).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Social Media Reports */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-400" />
            Social Media Reports
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingSocial ? (
              <p className="text-slate-300">Loading social reports...</p>
            ) : (
              socialReports?.map((report) => (
                <Card key={report.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center justify-between">
                      <span className="text-blue-400">{report.user}</span>
                      {report.riskFlag === 1 && (
                        <Badge variant="destructive" className="text-xs">High Risk</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-slate-300 text-sm">{report.text}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{report.zone}</span>
                      <span className="text-slate-500">
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          <p>FloodGuard Delhi - Protecting lives through early flood detection and community alerts</p>
        </div>
      </footer>
    </div>
  );
}
