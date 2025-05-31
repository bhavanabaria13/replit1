import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { TrendingUp, Users, Ticket } from 'lucide-react';
import type { Ticket as TicketType } from '@shared/schema';

interface LotteryStatsChartProps {
  tickets: TicketType[];
  userAddress?: string | null;
  contractData?: { total: number; purchased: number; available: number };
}

export function LotteryStatsChart({ tickets, userAddress, contractData }: LotteryStatsChartProps) {
  // Use authentic SCAI contract data when available
  const stats = contractData ? {
    available: contractData.available,
    yourTickets: 0, // Will be updated with getUserTickets function
    soldToOthers: contractData.purchased,
    total: contractData.total
  } : {
    available: tickets.filter(t => t.isAvailable).length,
    yourTickets: tickets.filter(t => !t.isAvailable && t.purchaserAddress === userAddress).length,
    soldToOthers: tickets.filter(t => !t.isAvailable && t.purchaserAddress !== userAddress).length,
    total: tickets.length
  };

  const pieData = [
    { name: 'Available', value: stats.available, color: '#10b981' },
    { name: 'Your Tickets', value: stats.yourTickets, color: '#fbbf24' },
    { name: 'Sold to Others', value: stats.soldToOthers, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Available', count: stats.available, fill: '#10b981' },
    { name: 'Your Tickets', count: stats.yourTickets, fill: '#fbbf24' },
    { name: 'Sold to Others', count: stats.soldToOthers, fill: '#ef4444' }
  ];

  const renderCustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0];
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-emerald-400">
            {data.value} tickets ({((data.value / stats.total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <TrendingUp className="w-5 h-5 text-indigo-500 mr-2" />
            Ticket Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend 
                  wrapperStyle={{ color: '#e2e8f0' }}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Users className="w-5 h-5 text-purple-500 mr-2" />
            Ticket Count Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#e2e8f0', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                />
                <YAxis 
                  tick={{ fill: '#e2e8f0', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-slate-800/80 border-slate-700 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Ticket className="w-5 h-5 text-emerald-500 mr-2" />
            Lottery Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400">{stats.available}</div>
              <div className="text-sm text-slate-400">Available</div>
              <div className="text-xs text-emerald-300">
                {((stats.available / stats.total) * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">{stats.yourTickets}</div>
              <div className="text-sm text-slate-400">Your Tickets</div>
              <div className="text-xs text-yellow-300">
                {stats.yourTickets > 0 ? ((stats.yourTickets / stats.total) * 100).toFixed(1) : '0'}%
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">{stats.soldToOthers}</div>
              <div className="text-sm text-slate-400">Sold to Others</div>
              <div className="text-xs text-red-300">
                {stats.soldToOthers > 0 ? ((stats.soldToOthers / stats.total) * 100).toFixed(1) : '0'}%
              </div>
            </div>
            
            <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/20">
              <div className="text-2xl font-bold text-slate-300">{stats.total}</div>
              <div className="text-sm text-slate-400">Total Tickets</div>
              <div className="text-xs text-slate-500">100%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}