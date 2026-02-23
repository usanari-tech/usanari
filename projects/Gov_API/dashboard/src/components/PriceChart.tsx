'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface ChartProps {
    data: {
        period: string;
        unitPrice: number;
        totalPrice?: number; // Optional for history
        count?: number;
    }[];
    metric: 'unitPrice' | 'totalPrice' | 'history';
}

const PriceChart: React.FC<ChartProps> = ({ data, metric }) => {
    // Determine chart configuration based on metric
    const isHistory = metric === 'history';
    const isUnitPrice = metric === 'unitPrice' || isHistory; // History uses unitPrice for now

    const dataKey = isUnitPrice ? 'unitPrice' : 'totalPrice';
    const label = isHistory ? '平均平米単価 (推移)' : (isUnitPrice ? '平均平米単価' : '平均取引総額');
    const color = isHistory ? '#0d9488' : (isUnitPrice ? '#1c1917' : '#0d9488'); // Teal for history & totalPrice, dark for unitPrice

    const formatYAxis = (value: number) => {
        if (value >= 100000000) return `¥${(value / 100000000).toFixed(1)}億`;
        return `¥${(value / 10000).toLocaleString()}万`;
    };

    return (
        <>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="period"
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatYAxis}
                        domain={[0, 'auto']}
                        allowDataOverflow={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                        labelStyle={{ color: '#1E293B', fontWeight: 'bold' }}
                        formatter={(value: any) => [value ? `¥${value.toLocaleString()}` : '¥0', label]}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name={label}
                        stroke={color}
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4, strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};

export default PriceChart;
