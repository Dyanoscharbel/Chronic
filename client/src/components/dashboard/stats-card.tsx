import React, { ReactNode } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Link } from 'wouter';

interface StatsCardProps {
  icon: ReactNode;
  iconBgColor: string;
  title: string;
  value: string | number;
  footerLink: string;
  footerText: string;
  footerLinkColor: string;
}

export function StatsCard({
  icon,
  iconBgColor,
  title,
  value,
  footerLink,
  footerText,
  footerLinkColor
}: StatsCardProps) {
  return (
    <Card className="card bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 bg-primary text-primary-foreground`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-foreground/70 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-foreground">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-3 sm:px-6">
        <div className="text-sm">
          <Link 
            href={footerLink} 
            className={`font-medium ${footerLinkColor} hover:opacity-90`}
          >
            {footerText}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}