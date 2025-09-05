
'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Issue } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface StatusChartProps {
  issues: Issue[];
  loading: boolean;
}

const StatusChart: React.FC<StatusChartProps> = ({ issues, loading }) => {
  const data = useMemo(() => {
    if (!issues) return [];
    const statusCounts = {
      'Recebido': 0,
      'Em análise': 0,
      'Resolvido': 0,
    };
    issues.forEach(issue => {
      statusCounts[issue.status]++;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, 'ocorrências': value }));
  }, [issues]);

  if (loading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[250px] text-muted-foreground">Nenhum dado para exibir.</div>;
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
          <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--foreground))" fontSize={12} allowDecimals={false}/>
          <Tooltip
             cursor={{ fill: 'hsl(var(--muted))' }}
             contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Bar dataKey="ocorrências" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
