import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { trpc } from '@/lib/trpc';
import { Play, Square, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentControls() {
  const [intervalMs, setIntervalMs] = useState(15000);
  const [incidentCount, setIncidentCount] = useState(1);
  const [socialCount, setSocialCount] = useState(2);

  const { data: loopStatus } = trpc.ops.loop.status.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const runCycle = trpc.ops.run.useMutation({
    onSuccess: () => {
      toast.success('Agent cycle completed successfully!');
    },
    onError: (error) => {
      toast.error(`Cycle failed: ${error.message}`);
    },
  });

  const startLoop = trpc.ops.loop.start.useMutation({
    onSuccess: () => {
      toast.success('Continuous loop started');
    },
    onError: (error) => {
      toast.error(`Failed to start loop: ${error.message}`);
    },
  });

  const stopLoop = trpc.ops.loop.stop.useMutation({
    onSuccess: () => {
      toast.success('Loop stopped');
    },
    onError: (error) => {
      toast.error(`Failed to stop loop: ${error.message}`);
    },
  });

  const handleRunCycle = () => {
    runCycle.mutate({
      inc: incidentCount,
      soc: socialCount,
    });
  };

  const handleStartLoop = () => {
    startLoop.mutate({
      intervalMs,
      inc: incidentCount,
      soc: socialCount,
    });
  };

  const handleStopLoop = () => {
    stopLoop.mutate();
  };

  const isLoopRunning = loopStatus?.isRunning || false;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Agent Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="incidents" className="text-slate-300">Incidents per cycle</Label>
            <Input
              id="incidents"
              type="number"
              min="1"
              max="10"
              value={incidentCount}
              onChange={(e) => setIncidentCount(parseInt(e.target.value) || 1)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social" className="text-slate-300">Social posts per cycle</Label>
            <Input
              id="social"
              type="number"
              min="1"
              max="10"
              value={socialCount}
              onChange={(e) => setSocialCount(parseInt(e.target.value) || 2)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval" className="text-slate-300">Loop interval (ms)</Label>
          <Input
            id="interval"
            type="number"
            min="5000"
            max="60000"
            step="1000"
            value={intervalMs}
            onChange={(e) => setIntervalMs(parseInt(e.target.value) || 15000)}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRunCycle}
            disabled={runCycle.isPending || isLoopRunning}
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-2" />
            Run Single Cycle
          </Button>
          
          {!isLoopRunning ? (
            <Button
              onClick={handleStartLoop}
              disabled={startLoop.isPending}
              variant="default"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Loop
            </Button>
          ) : (
            <Button
              onClick={handleStopLoop}
              disabled={stopLoop.isPending}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Loop
            </Button>
          )}
        </div>

        {isLoopRunning && (
          <div className="text-xs text-emerald-400 text-center">
            🔄 Loop is running (every {intervalMs / 1000}s)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
