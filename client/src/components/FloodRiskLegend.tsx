export function FloodRiskLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200 z-10">
      <div className="text-sm font-semibold mb-2 text-slate-800">Flood Risk Level</div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-slate-700">Low (0-0.01%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-slate-700">Medium-Low (0.01-0.02%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500"></div>
          <span className="text-slate-700">Medium (0.02-0.03%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-slate-700">High (0.03%+)</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
        Click on districts for details
      </div>
    </div>
  );
}

