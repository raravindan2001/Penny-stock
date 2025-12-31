
import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, ReferenceLine, LabelList
} from 'recharts';
import { TrajectoryPoint } from '../types';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
}

const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  
  return (
    <div className="bg-[#0a111a] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
      <div className="flex justify-between items-center mb-12">
        <div>
          <h3 className="text-white text-lg font-black uppercase tracking-[0.3em] italic">Growth Horizon</h3>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em] mt-2">5 Year | 10 Year | 15 Year Valuation Alpha</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projection Vector</span>
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sortedData} margin={{ top: 30, right: 30, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="label" 
              stroke="#ffffff10" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              dy={15}
              className="font-black uppercase italic"
            />
            <YAxis 
              stroke="#ffffff10" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
              className="font-black"
            />
            <Tooltip 
              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }}
              contentStyle={{ 
                backgroundColor: '#05090f', 
                border: '1px solid #ffffff10', 
                borderRadius: '24px', 
                padding: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ color: '#10b981', fontWeight: '900', fontSize: '18px', fontFamily: 'JetBrains Mono' }}
              labelStyle={{ color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}
              formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Projected Asset Value']}
            />
            
            <Area 
              type="monotone" 
              dataKey="price"
              stroke="#10b981" 
              strokeWidth={5}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={2000}
              animationEasing="ease-in-out"
            >
              <LabelList 
                dataKey="price" 
                position="top" 
                offset={15} 
                formatter={(v: number) => `₹${v}`}
                style={{ fill: '#10b981', fontSize: 10, fontWeight: 900, fontFamily: 'JetBrains Mono' }}
              />
            </Area>

            <ReferenceLine 
              x={sortedData.find(p => !p.isProjection)?.label}
              stroke="#ffffff20"
              strokeDasharray="5 5"
              label={{ value: 'CURRENT NODAL ENTRY', position: 'top', fill: '#64748b', fontSize: 10, fontWeight: '900', letterSpacing: '0.2em' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrajectoryChart;
