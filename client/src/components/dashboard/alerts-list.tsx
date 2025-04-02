import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert as AlertIcon, AlertCircle } from 'lucide-react';
import { Alert } from '@/lib/types';
import { getAlertBgColor, getAlertTextColor } from '@/lib/utils';

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="py-4 px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            Recent Alerts
          </CardTitle>
          <Link 
            href="/notifications" 
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-200">
          {alerts.length > 0 ? (
            alerts.map((alert) => {
              const bgColor = getAlertBgColor(alert.type);
              const textColor = getAlertTextColor(alert.type);
              
              return (
                <li key={alert.id}>
                  <div className="px-6 py-4 flex items-center">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${bgColor}`}>
                        <AlertCircle className={`h-6 w-6 ${textColor}`} />
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {alert.time}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {alert.message}
                      </p>
                      <div className="mt-2">
                        <Link 
                          href={`/patients/${alert.patientId}`}
                          className="text-sm font-medium text-primary hover:text-primary-dark"
                        >
                          View Patient
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">No alerts at this time</p>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
