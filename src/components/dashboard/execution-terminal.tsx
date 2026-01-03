"use client";

import { ArrowDownUp, Settings } from 'lucide-react';
import { ELI5Tooltip } from '@/components/ui/ELI5Tooltip';
import { TerminalLog } from './terminal-log';

export function ExecutionTerminal() {
  // botStatus and setBotStatus are now managed in the Header


  return (
    <div className="flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-[var(--glass-border)] rounded-xl h-full overflow-hidden glass" data-testid="execution-terminal">
      {/* Terminal Header */}
      <div className="flex justify-between items-center bg-black/20 p-4 border-[var(--glass-border)] border-b">
        <h2 className="flex items-center gap-2 font-bold text-[var(--cotton-blue)]">
          <ELI5Tooltip description="Control center for your trading bot swarm." example="Start/Stop the bot here">
            <div className="flex items-center gap-2">
              <ArrowDownUp className="shadow-[0_0_8px_rgba(169,222,249,0.5)] w-4 h-4" />
              TERMINAL
            </div>
          </ELI5Tooltip>
        </h2>
        <button className="group hover:bg-white/5 p-2 rounded-full transition-colors">
          <Settings className="w-4 h-4 text-gray-400 group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col flex-1 gap-4 p-4">

        {/* Status Area */}
        <div className="z-0 relative flex-1 rounded-lg min-h-0 overflow-hidden">
            <TerminalLog />
        </div>
      </div>
    </div>
  );
}
