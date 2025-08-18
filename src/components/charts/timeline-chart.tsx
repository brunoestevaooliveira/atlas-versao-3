
'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Issue } from '@/lib/types';
import { format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';

interface TimelineChartProps {
  issues: Issue[];
  loading: boolean;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ issues, loading }) => {
  const data = useMemo(() => {
    if (!issues) return [];
    
    const weeklyCounts = issues.reduce((acc, issue) => {
      const weekStart = startOfWeek(issue.reportedAt, { locale: ptBR });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!acc[weekKey]) {
        acc[weekKey] = { date: weekKey, 'Novas ocorrências': 0 };
      }
      acc[weekKey]['Novas ocorrências']++;
      
      return acc;
    }, {} as Record<string, { date: string; 'Novas ocorrências': number }>);

    return Object.values(weeklyCounts).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        date: format(new Date(item.date), "dd/MMM", { locale: ptBR }),
      }));

  }, [issues]);

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (data.length < 2) {
    return <div className="flex items-center justify-center h-[300px] text-muted-foreground">Dados insuficientes para exibir a linha do tempo.</div>;
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
          <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--foreground))" fontSize={12} allowDecimals={false}/>
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="Novas ocorrências" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(var(--primary))' }}
            activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;
