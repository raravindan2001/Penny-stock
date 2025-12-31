
import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { TrajectoryPoint } from '../types';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
}

const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ data }) => {
  // Sort data by year to ensure correct rendering
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  
  // Find the transition point (where projection starts)
  const projectionStartIndex = sortedData.findIndex(p => p.isProjection);
  const currentYearData = projectionStartIndex > 0 ? sortedData[projectionStartIndex - 1] : null;

  return (
    <div className="h-[400px] w-full mt-6 bg-slate-900/30 p-6 rounded-[2rem] border border-white/5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white text-sm font-black uppercase tracking-widest">Growth Vector Analysis</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Historical Trends vs. AI Projections</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-emerald-500"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Past</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t border-dashed border-emerald-400"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Projected</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="label" 
            stroke="#ffffff20" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            dy={10}
            className="font-black uppercase"
          />
          <YAxis 
            stroke="#ffffff20" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
            className="font-black"
          />
          <Tooltip 
            cursor={{ stroke: '#10b98130', strokeWidth: 1 }}
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}
            formatter={(value: any, name: any, props: any) => [
              `₹${value}`, 
              props.payload.isProjection ? 'Projected Price' : 'Historical Price'
            ]}
          />
          
          {/* Historical Data Area */}
          <Area 
            type="monotone" 
            dataKey={(p) => p.isProjection ? null : p.price}
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorPast)" 
            strokeWidth={3}
            connectNulls={false}
          />

          {/* Projected Data Area - Dotted Line */}
          <Area 
            type="monotone" 
            dataKey={(p) => p.isProjection ? p.price : (p.year === currentYearData?.year ? p.price : null)}
            stroke="#34d399" 
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorProjected)" 
            strokeWidth={2}
            connectNulls={true}
          />

          {currentYearData && (
            <ReferenceLine 
              x={currentYearData.label} 
              stroke="#ffffff30" 
              strokeDasharray="3 3"
              label={{ value: 'NOW', position: 'top', fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }} 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrajectoryChart;
