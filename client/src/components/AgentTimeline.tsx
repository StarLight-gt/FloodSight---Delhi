import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';
import { Activity, ArrowRight, CheckCircle2, Clock, Pause, Play, Zap } from 'lucide-react';

type A2AItem = {
  dir: '→' | '←';
  env: {
    a2a: string;
    id: string;
    from: string;
    to: string;
    type: 'request' | 'response' | 'event';
    timestamp: string;
    payload?: any;
    correlationId?: string;
  };
};

type PhaseKey = 'PARALLEL' | 'FUSE' | 'COMMS';

export default function AgentTimeline() {
  const [items, setItems] = useState<A2AItem[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Poll for trace updates
  const { data: traceData } = trpc.ops.trace.useQuery(undefined, {
    enabled: isPolling,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (traceData && Array.isArray(traceData) && traceData.length > 0) {
      setItems(prev => {
        const seen = new Set(prev.map(p => p.dir + p.env.id + (p.env.correlationId ?? '')));
        const merged = [...prev];
        for (const item of traceData) {
          const key = item.dir + item.env.id + (item.env.correlationId ?? '');
          if (!seen.has(key)) {
            merged.push(item);
          }
        }
        return merged.slice(-80);
      });
      setLastUpdated(Date.now());
    }
  }, [traceData]);

  const rows = useMemo(() => {
    return items.slice(-40).map((it) => {
      const { env, dir } = it;
      const phase: PhaseKey =
        env.to === 'A1' || env.to === 'A2' || env.to === 'A3' ? 'PARALLEL'
        : env.to === 'A4' || env.from === 'A4' ? 'FUSE'
        : 'COMMS';
      const ts = new Date(env.timestamp).toLocaleTimeString();
      return { 
        key: env.id + (env.correlationId ?? '') + dir, 
        dir, 
        phase, 
        from: env.from, 
        to: env.to, 
        type: env.type, 
        ts 
      };
    });
  }, [items]);

  const phaseStatus = useMemo(() => {
    const hasReq = (to: string) => rows.some(r => r.type === 'request' && r.to === to);
    const hasRes = (from: string) => rows.some(r => r.type === 'response' && r.from === from);
    const parallelDone = (hasReq('A1') && hasRes('A1')) || (hasReq('A2') && hasRes('A2')) || (hasReq('A3') && hasRes('A3'));
    const allParallelDone = ['A1','A2','A3'].every(a => hasReq(a) && hasRes(a));
    const fuseDone = hasReq('A4') && hasRes('A4');
    const commsDone = hasReq('A6') && hasRes('A6');
    return { parallelDone, allParallelDone, fuseDone, commsDone };
  }, [rows]);

  const phasePct = useMemo(() => {
    let pct = 0;
    if (phaseStatus.parallelDone) pct = 33;
    if (phaseStatus.allParallelDone) pct = 45;
    if (phaseStatus.fuseDone) pct = 75;
    if (phaseStatus.commsDone) pct = 100;
    return pct;
  }, [phaseStatus]);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Agent Activity</span>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-slate-400 font-normal">
                {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <Button
              size="sm"
              variant={isPolling ? "outline" : "default"}
              onClick={() => setIsPolling(p => !p)}
            >
              {isPolling ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPolling ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase progress */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Parallel
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Fuse
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Comms
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${phasePct}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {phasePct === 0 && 'Waiting for next cycle…'}
            {phasePct > 0 && phasePct < 100 && 'Cycle in progress…'}
            {phasePct === 100 && 'Cycle complete'}
          </div>
        </div>

        {/* Timeline */}
        <div className="max-h-72 overflow-auto space-y-2">
          {rows.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              No agent activity yet. Run a cycle to see agents in action.
            </p>
          ) : (
            rows.map(row => (
              <div
                key={row.key}
                className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={row.type === 'request' ? 'default' : 'secondary'} className="text-xs">
                    {row.type === 'request' ? 'REQ' : 'RES'}
                  </Badge>
                  <span className="text-white font-semibold">{row.from}</span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  <span className="text-white font-semibold">{row.to}</span>
                  <Badge variant="outline" className="ml-2">
                    {row.phase}
                  </Badge>
                  <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" /> {row.ts}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
