
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrajectoryPoint } from '../types';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
}

const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ data }) => {
  return (
    <div className="h-[400px] w-full mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Projected Growth Trajectory (5, 10, 15 Years)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="label" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            itemStyle={{ color: '#10b981' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrajectoryChart;
