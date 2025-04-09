import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Check, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, PatientLabResult, Appointment, LabTest, Doctor } from '@/lib/types';
import { formatDate, formatTime, getCKDStageColor, calculateAge } from '@/lib/utils';
import { determineProgressionRisk } from '@/lib/ckd-utils';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface GenerateReportProps {
  patient: Patient;
  trigger?: React.ReactNode;
}

export function GenerateReport({ patient, trigger }: GenerateReportProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportSections, setReportSections] = useState<ReportSection[]>([
    { id: "personalInfo", name: "Personal Information", enabled: true },
    { id: "medicalHistory", name: "Medical History", enabled: true },
    { id: "labResults", name: "Laboratory Results", enabled: true },
    { id: "appointments", name: "Appointments", enabled: true },
    { id: "riskAssessment", name: "Risk Assessment", enabled: true }
  ]);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Fetch additional data needed for the report
  const { data: labResults } = useQuery<PatientLabResult[]>({
    queryKey: [`/api/patient-lab-results/patient/${patient.id}`],
    enabled: open,
  });

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments/patient/${patient.id}`],
    enabled: open,
  });

  const { data: labTests } = useQuery<LabTest[]>({
    queryKey: ['/api/lab-tests'],
    enabled: open,
  });

  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
    enabled: open,
  });


  const handleSectionToggle = (sectionId: string) => {
    setReportSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return { ...section, enabled: !section.enabled };
        }
        return section;
      });
    });
  };

  const generatePDF = async () => {
    setGenerating(true);
    setReportGenerated(false);

    try {
      const doc = new jsPDF();

      // Add report title and date
      doc.setFontSize(20);
      doc.text('Patient Medical Report', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

      let yPos = 40;

      // Patient Identification Section
      doc.setFontSize(16);
      doc.text('Patient Identification', 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`Patient ID: P-${patient.id.toString().padStart(5, '0')}`, 14, yPos);
      yPos += 7;
      doc.text(`Name: ${patient.user.firstName} ${patient.user.lastName}`, 14, yPos);
      yPos += 7;
      doc.text(`Email: ${patient.user.email}`, 14, yPos);
      yPos += 10;

      // Personal Information Section
      if (reportSections.find(s => s.id === 'personalInfo')?.enabled) {
        doc.setFontSize(16);
        doc.text('Personal Information', 14, yPos);
        yPos += 10;

        const age = calculateAge(patient.birthDate);

        doc.setFontSize(12);
        doc.text(`Age: ${age} years`, 14, yPos);
        yPos += 7;
        doc.text(`Gender: ${patient.gender}`, 14, yPos);
        yPos += 7;
        doc.text(`Birth Date: ${formatDate(patient.birthDate)}`, 14, yPos);
        yPos += 7;

        if (patient.phone) {
          doc.text(`Phone: ${patient.phone}`, 14, yPos);
          yPos += 7;
        }

        if (patient.address) {
          doc.text(`Address: ${patient.address}`, 14, yPos);
          yPos += 7;
        }

        yPos += 5;
      }

      // Medical History Section
      if (reportSections.find(s => s.id === 'medicalHistory')?.enabled) {
        doc.setFontSize(16);
        doc.text('Medical History', 14, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.text(`CKD Stage: ${patient.ckdStage}`, 14, yPos);
        yPos += 7;

        if (patient.proteinuriaLevel) {
          doc.text(`Proteinuria Level: ${patient.proteinuriaLevel}`, 14, yPos);
          yPos += 7;
        }

        if (patient.lastEgfrValue) {
          doc.text(`Last eGFR Value: ${patient.lastEgfrValue} mL/min/1.73m²`, 14, yPos);
          yPos += 7;
        }

        if (patient.lastProteinuriaValue) {
          doc.text(`Last Proteinuria Value: ${patient.lastProteinuriaValue} mg/g`, 14, yPos);
          yPos += 7;
        }

        yPos += 5;
      }

      // Risk Assessment Section
      if (reportSections.find(s => s.id === 'riskAssessment')?.enabled && patient.lastEgfrValue && patient.proteinuriaLevel) {
        doc.setFontSize(16);
        doc.text('Risk Assessment', 14, yPos);
        yPos += 10;

        const risk = determineProgressionRisk(patient.lastEgfrValue, patient.proteinuriaLevel);

        doc.setFontSize(12);
        doc.text(`CKD Progression Risk: ${risk}`, 14, yPos);
        yPos += 7;

        // Add risk explanation
        let riskExplanation = '';
        switch (risk) {
          case 'Low':
            riskExplanation = 'The patient has a low risk of CKD progression. Regular monitoring is recommended.';
            break;
          case 'Moderate':
            riskExplanation = 'The patient has a moderate risk of CKD progression. More frequent monitoring is advised.';
            break;
          case 'High':
            riskExplanation = 'The patient has a high risk of CKD progression. Close monitoring and management is necessary.';
            break;
          case 'Very High':
            riskExplanation = 'The patient has a very high risk of CKD progression. Specialist referral and intensive management is required.';
            break;
        }

        doc.text('Risk Explanation:', 14, yPos);
        yPos += 7;

        // Split the explanation into multiple lines if needed
        const splitText = doc.splitTextToSize(riskExplanation, 180);
        doc.text(splitText, 14, yPos);
        yPos += splitText.length * 7 + 5;
      }

      // Laboratory Results Section
      if (reportSections.find(s => s.id === 'labResults')?.enabled && labResults && labResults.length > 0 && labTests) {
        doc.setFontSize(16);
        doc.text('Laboratory Results', 14, yPos);
        yPos += 10;

        // Prepare data for the table
        const tableData = labResults.map(result => {
          const test = labTests.find(t => t._id === result.labTest._id);
          const value = parseFloat(result.resultValue.toString());
          const unit = result.labTest.unit || '';
          const min = result.labTest.normalMin ? parseFloat(result.labTest.normalMin.toString()) : undefined;
          const max = result.labTest.normalMax ? parseFloat(result.labTest.normalMax.toString()) : undefined;

          let status = 'Normal';
          if (min !== undefined && max !== undefined) {
            if (value < min) status = 'Below Normal';
            else if (value > max) status = 'Above Normal';
          }

          const range = (min !== undefined && max !== undefined) 
            ? `${min} - ${max} ${unit}` 
            : 'Not specified';

          return [
            result.labTest.testName || `Test #${result.labTest._id}`,
            `${value} ${unit}`,
            range,
            status,
            formatDate(result.resultDate)
          ];
        });

        // Add table with lab results
        autoTable(doc, {
          head: [['Test', 'Result', 'Normal Range', 'Status', 'Date']],
          body: tableData,
          startY: yPos,
          theme: 'grid',
          headStyles: { fillColor: [66, 133, 244] },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });

        // Update yPos based on the table height
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Check if need to add a new page for appointments
      if (yPos > 250 && reportSections.find(s => s.id === 'appointments')?.enabled && appointments && appointments.length > 0) {
        doc.addPage();
        yPos = 20;
      }

      // Appointments Section
      if (reportSections.find(s => s.id === 'appointments')?.enabled && appointments && appointments.length > 0 && doctors) {
        doc.setFontSize(16);
        doc.text('Appointments', 14, yPos);
        yPos += 10;

        // Upcoming appointments
        const upcomingAppointments = appointments
          .filter(a => new Date(a.appointmentDate) >= new Date() && a.status !== 'cancelled')
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

        if (upcomingAppointments.length > 0) {
          doc.setFontSize(14);
          doc.text('Upcoming Appointments', 14, yPos);
          yPos += 8;

          // Prepare data for the table
          const tableData = upcomingAppointments.map(appointment => {
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            const doctorName = doctor 
              ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` 
              : 'Unknown Doctor';

            return [
              formatDate(appointment.appointmentDate),
              formatTime(appointment.appointmentDate),
              doctorName,
              appointment.purpose || 'General consultation',
              appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
            ];
          });

          // Add table with upcoming appointments
          autoTable(doc, {
            head: [['Date', 'Time', 'Doctor', 'Purpose', 'Status']],
            body: tableData,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [76, 175, 80] },
            alternateRowStyles: { fillColor: [240, 240, 240] }
          });

          // Update yPos based on the table height
          yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // Past appointments (last 5)
        const pastAppointments = appointments
          .filter(a => new Date(a.appointmentDate) < new Date() || a.status === 'cancelled')
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
          .slice(0, 5);

        if (pastAppointments.length > 0) {
          // Check if need to add a new page
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(14);
          doc.text('Past Appointments (Last 5)', 14, yPos);
          yPos += 8;

          // Prepare data for the table
          const tableData = pastAppointments.map(appointment => {
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            const doctorName = doctor 
              ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` 
              : 'Unknown Doctor';

            return [
              formatDate(appointment.appointmentDate),
              formatTime(appointment.appointmentDate),
              doctorName,
              appointment.purpose || 'General consultation',
              appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
            ];
          });

          // Add table with past appointments
          autoTable(doc, {
            head: [['Date', 'Time', 'Doctor', 'Purpose', 'Status']],
            body: tableData,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [158, 158, 158] },
            alternateRowStyles: { fillColor: [240, 240, 240] }
          });
        }
      }

      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text(`Confidential Medical Record - ${patient.user.firstName} ${patient.user.lastName}`, 105, doc.internal.pageSize.height - 5, { align: 'center' });
      }

      // Save the PDF
      doc.save(`patient-report-${patient.id}.pdf`);
      setReportGenerated(true);
    } catch (error) {
      console.error('Error generating PDF report:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Patient Report</DialogTitle>
          <DialogDescription>
            {patient.user ? (
              <>Create a comprehensive PDF report for <span className="font-medium text-foreground">{patient.user.firstName} {patient.user.lastName}</span></>
            ) : (
              'Create a comprehensive patient report'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium leading-none">Report Sections:</h3>
            <div className="rounded-md border p-4 space-y-4">
              {reportSections.map((section) => (
                <div key={section.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={section.id}
                    checked={section.enabled}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <label
                    htmlFor={section.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {section.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {!patient.lastEgfrValue && (
            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-yellow-800 text-sm">
                No eGFR value available. Risk assessment will be limited.
              </p>
            </div>
          )}

          {reportGenerated && (
            <div className="flex items-center space-x-2 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg text-green-800 dark:text-green-300 animate-in fade-in duration-300">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Report generated successfully!</span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={generating}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={generatePDF} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ReportSection {
  id: string;
  name: string;
  enabled: boolean;
}