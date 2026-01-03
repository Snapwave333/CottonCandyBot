/**
 * CSVExport: Utility to convert trade logs to CSV and trigger browser download.
 */
import { StrategyLog } from '@/types';

export function exportLogsToCSV(logs: StrategyLog[]): void {
  if (!logs || logs.length === 0) return;

  const headers = ['Timestamp', 'Type', 'Message'];
  const rows = logs.map(log => [
    new Date(log.timestamp).toISOString(),
    log.type,
    // Sanitize message for CSV (remove commas, wrap in quotes if needed)
    `"${log.message.replaceAll('"', '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `cotton_candy_logs_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  link.remove();
}
