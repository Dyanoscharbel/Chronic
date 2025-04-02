import React from 'react';
import { Link } from 'wouter';
import { AvatarName } from '@/components/ui/avatar-name';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils';
import { Appointment } from '@/lib/types';

interface AppointmentsListProps {
  appointments: Appointment[];
}

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="py-4 px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            Upcoming Appointments
          </CardTitle>
          <Link 
            href="/appointments" 
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-200">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <li key={appointment.id}>
                <div className="px-6 py-4 flex items-center">
                  <div className="min-w-0 flex-1 flex items-center">
                    {appointment.patient && (
                      <AvatarName
                        firstName={appointment.patient.firstName}
                        lastName={appointment.patient.lastName}
                        initials={appointment.patient.initials}
                      />
                    )}
                    <div className="min-w-0 flex-1 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {appointment.patient
                            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                            : 'Unknown Patient'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.purpose || 'General consultation'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTime(appointment.appointmentDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">No upcoming appointments</p>
              <Link 
                href="/appointments/add" 
                className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-dark"
              >
                Schedule an appointment
              </Link>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
