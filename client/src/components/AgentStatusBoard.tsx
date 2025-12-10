import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';
import { Activity, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

type A2AItem = {
  dir?: '→' | '←';
  env?: {
    id?: string;
    from?: string;
    to?: string;
    type?: 'request' | 'response' | 'event';
    timestamp?: string;
    correlationId?: string;
  };
};

type Status = 'idle' | 'running' | 'success';

const AGENTS = [
  { key: 'A1', label: 'Weather (A1)', desc: 'AI-powered rainfall analysis' },
  { key: 'A2', label: 'Drain/Grid (A2)', desc: 'Incident report processing' },
  { key: 'A3', label: 'Social (A3)', desc: 'AI social media monitoring' },
  { key: 'A4', label: 'Risk Fusion (A4)', desc: 'AI risk score computation' },
  { key: 'A6', label: 'Comms (A6)', desc: 'Alert generation' },
] as const;

const KEYS = ['A1', 'A2', 'A3', 'A4', 'A6'] as const;

export default function AgentStatusBoard() {
  const [trace, setTrace] = useState<A2AItem[]>([]);
  const [lastStamp, setLastStamp] = useState<number>(0);
  const [isLive, setIsLive] = useState(true);

  const { data: traceData } = trpc.ops.trace.useQuery(undefined, {
    enabled: isLive,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (traceData && Array.isArray(traceData) && traceData.length > 0) {
      const clean = traceData.filter(b => b && b.env && typeof b.env.timestamp === 'string');
      if (clean.length) {
        setTrace(prev => [...prev, ...clean].slice(-120));
        setLastStamp(Date.now());
      }
    }
  }, [traceData]);

  const { statusMap, mode } = useMemo(() => {
    const windowMs = 20000;
    const now = Date.now();
    const recent = trace.filter(t => {
      const ts = t?.env?.timestamp;
      const time = ts ? new Date(ts).getTime() : NaN;
      return Number.isFinite(time) && (now - time) <= windowMs;
    });

    const reqSeen: Record<string, A2AItem | undefined> = {};
    const resSeen: Record<string, A2AItem | undefined> = {};

    for (const it of recent) {
      const to = String(it?.env?.to ?? '');
      const from = String(it?.env?.from ?? '');
      const agent = (KEYS as readonly string[]).includes(to) ? to :
                    (KEYS as readonly string[]).includes(from) ? from : undefined;
      if (!agent) continue;
      if (it?.env?.type === 'request' && it.dir === '→') reqSeen[agent] = it;
      if (it?.env?.type === 'response' && it.dir === '←') resSeen[agent] = it;
    }

    const status: Record<string, Status> = {};
    for (const k of KEYS) {
      if (reqSeen[k] && !resSeen[k]) status[k] = 'running';
      else if (resSeen[k])           status[k] = 'success';
      else                           status[k] = 'idle';
    }

    const mode = (Date.now() - lastStamp) < 6000 ? 'Looping' : 'One-shot';
    return { statusMap: status, mode };
  }, [trace, lastStamp]);

  const getStatusBadge = (s: Status) => {
    if (s === 'idle') {
      return (
        <Badge variant="outline" className="text-slate-400">
          <Activity className="h-3.5 w-3.5 mr-1" />
          Idle
        </Badge>
      );
    }
    if (s === 'running') {
      return (
        <Badge variant="default" className="bg-sky-500">
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          Running
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-emerald-500">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        Success
      </Badge>
    );
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Agent Status</span>
          <Button
            size="sm"
            variant={isLive ? "outline" : "default"}
            onClick={() => setIsLive(v => !v)}
          >
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <div className="space-y-1 text-xs text-slate-400">
          <div><strong className="text-slate-300">Parallel</strong> — A1/A2/A3 collect data simultaneously</div>
          <div><strong className="text-slate-300">Fuse</strong> — A4 computes risk scores using AI</div>
          <div><strong className="text-slate-300">Comms</strong> — A6 generates alerts</div>
        </div>

        {/* Mode badge */}
        <div>
          <Badge variant="outline" className={mode === 'Looping' ? 'border-purple-500 text-purple-400' : 'border-teal-500 text-teal-400'}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Mode: {mode}
          </Badge>
        </div>

        {/* Agent cards */}
        <div className="space-y-2">
          {AGENTS.map(a => (
            <div
              key={a.key}
              className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white">{a.label}</span>
                {getStatusBadge(statusMap[a.key] as Status)}
              </div>
              <div className="text-xs text-slate-400">{a.desc}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
