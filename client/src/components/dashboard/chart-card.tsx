import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from 'chart.js/auto';
import { Filter } from 'lucide-react';

interface ChartCardProps {
  title: string;
  type: 'pie' | 'line' | 'bar';
  data: any;
  className?: string;
  height?: string;
}

export function ChartCard({ title, type, data, className, height = 'h-64' }: ChartCardProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Configure chart based on type
    if (type === 'pie') {
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: [
              '#10B981', // Green - Stage 1
              '#FBBF24', // Yellow - Stage 2
              '#F59E0B', // Amber - Stage 3A
              '#FB923C', // Orange - Stage 3B
              '#EF4444', // Red - Stage 4
              '#7F1D1D'  // Dark Red - Stage 5
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 15,
                padding: 15
              }
            }
          }
        }
      });
    } else if (type === 'line') {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((item: any) => item.month),
          datasets: [{
            label: 'Average eGFR (mL/min)',
            data: data.map((item: any) => item.value),
            fill: false,
            borderColor: '#0F766E',
            tension: 0.4,
            pointBackgroundColor: '#0F766E'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: 30,
              max: 60,
              title: {
                display: true,
                text: 'eGFR (mL/min)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            }
          }
        }
      });
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data]);

  return (
    <Card className={`bg-white shadow rounded-lg p-4 ${className}`}>
      <CardHeader className="p-0 mb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
          <div className="flex items-center">
            <button className="text-sm text-gray-500 hover:text-gray-700">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`p-0 ${height}`}>
        <canvas ref={chartRef}></canvas>
      </CardContent>
    </Card>
  );
}