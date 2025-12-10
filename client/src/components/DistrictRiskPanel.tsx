import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, TrendingUp } from "lucide-react";

type DistrictRisk = {
  name: string;
  riskScore: number;
  riskPercentage: string;
};

export function DistrictRiskPanel() {
  const { data: districts, isLoading } = trpc.flood.districtRisks.useQuery();

  const getRiskLevel = (score: number) => {
    if (score >= 0.0003) return { label: 'High', color: 'bg-red-500', variant: 'destructive' as const };
    if (score >= 0.0001) return { label: 'Medium', color: 'bg-orange-500', variant: 'default' as const };
    return { label: 'Low', color: 'bg-green-500', variant: 'secondary' as const };
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">District Flood Risks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">Loading district data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!districts || districts.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">District Flood Risks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">No district data available</p>
        </CardContent>
      </Card>
    );
  }

  // Get top 5 highest risk districts
  const highRiskDistricts = districts.slice(0, 5);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          District Flood Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Top risk districts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Highest Risk Districts
            </h3>
            <div className="space-y-2">
              {highRiskDistricts.map((district: DistrictRisk, index: number) => {
                const risk = getRiskLevel(district.riskScore);
                return (
                  <div
                    key={index}
                    className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">
                        {district.name}
                      </span>
                      <Badge variant={risk.variant} className="text-xs">
                        {risk.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${risk.color}`}
                          style={{ width: `${Math.min(district.riskScore * 1000, 100)}%` }}
                        />
                      </div>
                      <span className="text-slate-300 text-xs font-semibold min-w-[4rem] text-right">
                        {district.riskPercentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full table view (scrollable) */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              All Districts ({districts.length})
            </h3>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left text-slate-400 py-2 px-2">District</th>
                    <th className="text-right text-slate-400 py-2 px-2">Risk %</th>
                    <th className="text-center text-slate-400 py-2 px-2">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((district: DistrictRisk, index: number) => {
                    const risk = getRiskLevel(district.riskScore);
                    return (
                      <tr
                        key={index}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30"
                      >
                        <td className="text-white py-2 px-2">{district.name}</td>
                        <td className="text-slate-300 py-2 px-2 text-right font-medium">
                          {district.riskPercentage}%
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Badge variant={risk.variant} className="text-xs">
                            {risk.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

