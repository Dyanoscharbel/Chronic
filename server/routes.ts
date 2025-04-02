import { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, insertPatientSchema, insertDoctorSchema, 
  insertLabTestSchema, insertPatientLabResultSchema, insertAppointmentSchema,
  insertNotificationSchema, insertWorkflowSchema, insertWorkflowRequirementSchema
} from "@shared/schema";
import jwt from 'jsonwebtoken';
import session from 'express-session';
import MemoryStore from 'memorystore';

const MemoryStoreSession = MemoryStore(session);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const authenticate = (req: any, res: any, next: any) => {
    if (req.session.user) {
      return next();
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string };
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

  // API routes
  const apiRouter = Router();
  app.use('/api', apiRouter);

  // Auth routes
  apiRouter.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const user = await storage.verifyUserCredentials(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Set user in session
      req.session.user = { id: user.id, email: user.email, role: user.role };
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Get additional user info based on role
      let userDetails = null;
      if (user.role === 'medecin') {
        userDetails = await storage.getDoctorByUserId(user.id);
      } else if (user.role === 'patient') {
        userDetails = await storage.getPatientByUserId(user.id);
      }
      
      res.json({ token, user: { ...user, passwordHash: undefined }, userDetails });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  apiRouter.post('/auth/register', async (req, res) => {
    try {
      const { role, ...userData } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Create appropriate user type based on role
      if (role === 'medecin') {
        const { specialty, hospital, ...userFields } = userData;
        const doctor = await storage.createDoctor(
          { specialty, hospital, userId: 0 }, // userId will be set by storage
          { ...userFields, role, passwordHash: userData.password }
        );
        res.status(201).json({ ...doctor, user: { ...doctor.user, passwordHash: undefined } });
      } else if (role === 'patient') {
        const { birthDate, gender, address, phone, ckdStage, ...userFields } = userData;
        const patient = await storage.createPatient(
          { birthDate, gender, address, phone, ckdStage, userId: 0 },
          { ...userFields, role, passwordHash: userData.password }
        );
        res.status(201).json({ ...patient, user: { ...patient.user, passwordHash: undefined } });
      } else {
        // Admin or other roles
        const user = await storage.createUser({ ...userData, role, passwordHash: userData.password });
        res.status(201).json({ ...user, passwordHash: undefined });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  apiRouter.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  });

  // Users routes
  apiRouter.get('/users', authenticate, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({ ...user, passwordHash: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Patients routes
  apiRouter.get('/patients', authenticate, async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients.map(patient => ({
        ...patient,
        user: { ...patient.user, passwordHash: undefined }
      })));
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/patients/:id', authenticate, async (req, res) => {
    try {
      const patientId = parseInt(req.params.id, 10);
      const patient = await storage.getPatientById(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json({
        ...patient,
        user: { ...patient.user, passwordHash: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/patients', authenticate, async (req, res) => {
    try {
      const { firstName, lastName, email, password, birthDate, gender, address, phone, ckdStage } = req.body;
      
      // Validate data
      const userData = {
        firstName,
        lastName,
        email,
        passwordHash: password,
        role: 'patient'
      };
      
      const patientData = {
        birthDate,
        gender,
        address,
        phone,
        ckdStage,
        userId: 0 // Will be set by the storage implementation
      };
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      const patient = await storage.createPatient(patientData, userData);
      res.status(201).json({
        ...patient,
        user: { ...patient.user, passwordHash: undefined }
      });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.put('/patients/:id', authenticate, async (req, res) => {
    try {
      const patientId = parseInt(req.params.id, 10);
      const { birthDate, gender, address, phone, ckdStage } = req.body;
      
      const updatedPatient = await storage.updatePatient(patientId, {
        birthDate,
        gender,
        address,
        phone,
        ckdStage
      });
      
      if (!updatedPatient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const patientWithUser = await storage.getPatientById(patientId);
      res.json({
        ...patientWithUser,
        user: { ...patientWithUser!.user, passwordHash: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.delete('/patients/:id', authenticate, async (req, res) => {
    try {
      const patientId = parseInt(req.params.id, 10);
      const success = await storage.deletePatient(patientId);
      
      if (!success) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Doctors routes
  apiRouter.get('/doctors', authenticate, async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors.map(doctor => ({
        ...doctor,
        user: { ...doctor.user, passwordHash: undefined }
      })));
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/doctors/:id', authenticate, async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id, 10);
      const doctor = await storage.getDoctorById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      res.json({
        ...doctor,
        user: { ...doctor.user, passwordHash: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/doctors', authenticate, async (req, res) => {
    try {
      const { firstName, lastName, email, password, specialty, hospital } = req.body;
      
      const userData = {
        firstName,
        lastName,
        email,
        passwordHash: password,
        role: 'medecin'
      };
      
      const doctorData = {
        specialty,
        hospital,
        userId: 0 // Will be set by the storage implementation
      };
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      const doctor = await storage.createDoctor(doctorData, userData);
      res.status(201).json({
        ...doctor,
        user: { ...doctor.user, passwordHash: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Lab tests routes
  apiRouter.get('/lab-tests', authenticate, async (req, res) => {
    try {
      const labTests = await storage.getLabTests();
      res.json(labTests);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/lab-tests', authenticate, async (req, res) => {
    try {
      const labTest = await storage.createLabTest(req.body);
      res.status(201).json(labTest);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Patient lab results routes
  apiRouter.get('/patient-lab-results', authenticate, async (req, res) => {
    try {
      const results = await storage.getPatientLabResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/patient-lab-results/patient/:patientId', authenticate, async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId, 10);
      const results = await storage.getPatientLabResultsByPatientId(patientId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/patient-lab-results', authenticate, async (req, res) => {
    try {
      const result = await storage.createPatientLabResult(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Appointments routes
  apiRouter.get('/appointments', authenticate, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/appointments/patient/:patientId', authenticate, async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId, 10);
      const appointments = await storage.getAppointmentsByPatientId(patientId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/appointments/doctor/:doctorId', authenticate, async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId, 10);
      const appointments = await storage.getAppointmentsByDoctorId(doctorId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/appointments', authenticate, async (req, res) => {
    try {
      const appointment = await storage.createAppointment(req.body);
      
      // Create notification for patient
      await storage.createNotification({
        userId: (await storage.getPatientById(appointment.patientId))!.userId,
        message: `New appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
        isRead: false
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.put('/appointments/:id/status', authenticate, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, status);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Create notification about status change
      const patient = await storage.getPatientById(updatedAppointment.patientId);
      if (patient) {
        await storage.createNotification({
          userId: patient.userId,
          message: `Your appointment on ${new Date(updatedAppointment.appointmentDate).toLocaleDateString()} has been ${status}`,
          isRead: false
        });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Notifications routes
  apiRouter.get('/notifications', authenticate, async (req, res) => {
    try {
      // Get user ID from authenticated user
      const userId = (req as any).session.user?.id || (req as any).user.id;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/notifications/mark-read/:id', authenticate, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/notifications', authenticate, async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Workflow routes
  apiRouter.get('/workflows', authenticate, async (req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/workflows/:id', authenticate, async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id, 10);
      const workflow = await storage.getWorkflowById(workflowId);
      
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      const requirements = await storage.getWorkflowRequirements(workflowId);
      res.json({ ...workflow, requirements });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/workflows', authenticate, async (req, res) => {
    try {
      const { name, description, ckdStage, requirements } = req.body;
      
      // Get doctor ID (assuming the authenticated user is a doctor)
      const userId = (req as any).session.user?.id || (req as any).user.id;
      const doctor = await storage.getDoctorByUserId(userId);
      
      if (!doctor) {
        return res.status(403).json({ message: 'Only doctors can create workflows' });
      }
      
      const workflow = await storage.createWorkflow({
        name,
        description,
        ckdStage,
        createdBy: doctor.id
      });
      
      // Add requirements if provided
      const createdRequirements = [];
      if (requirements && Array.isArray(requirements)) {
        for (const req of requirements) {
          const requirement = await storage.addWorkflowRequirement({
            ...req,
            workflowId: workflow.id
          });
          createdRequirements.push(requirement);
        }
      }
      
      res.status(201).json({ ...workflow, requirements: createdRequirements });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/workflows/:id/requirements', authenticate, async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id, 10);
      
      // Verify the workflow exists
      const workflow = await storage.getWorkflowById(workflowId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      const requirement = await storage.addWorkflowRequirement({
        ...req.body,
        workflowId
      });
      
      res.status(201).json(requirement);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Dashboard statistics
  apiRouter.get('/dashboard/stats', authenticate, async (req, res) => {
    try {
      const patients = await storage.getPatients();
      const appointments = await storage.getAppointments();
      const results = await storage.getPatientLabResults();
      
      // Count upcoming appointments (future dates that are not cancelled)
      const now = new Date();
      const upcomingAppointments = appointments.filter(apt => 
        new Date(apt.appointmentDate) > now && apt.status !== 'cancelled'
      );
      
      // Simulate some critical alerts for demo
      const criticalAlerts = 3;
      
      // Pending lab results - same approach
      const pendingLabResults = 8;
      
      // Calculate CKD stage distribution
      const stageDistribution = {
        'Stage 1': 0,
        'Stage 2': 0,
        'Stage 3A': 0,
        'Stage 3B': 0,
        'Stage 4': 0,
        'Stage 5': 0
      };
      
      patients.forEach(patient => {
        if (patient.ckdStage && stageDistribution.hasOwnProperty(patient.ckdStage)) {
          (stageDistribution as any)[patient.ckdStage]++;
        }
      });
      
      // eGFR trend data (mock for demo)
      const months = ['January', 'February', 'March', 'April', 'May', 'June'];
      const egfrTrend = months.map((month, index) => ({
        month,
        value: 52 - index
      }));
      
      res.json({
        totalPatients: patients.length,
        upcomingAppointments: upcomingAppointments.length,
        criticalAlerts,
        pendingLabResults,
        stageDistribution,
        egfrTrend
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Recent patients for dashboard
  apiRouter.get('/dashboard/recent-patients', authenticate, async (req, res) => {
    try {
      const patients = await storage.getPatients();
      const results = await storage.getPatientLabResults();
      
      // Simulate "recently added" patients by returning a subset
      const recentPatients = patients.slice(0, Math.min(patients.length, 4));
      
      // Augment with latest eGFR value where available
      const enhancedPatients = await Promise.all(recentPatients.map(async patient => {
        // Get patient lab results
        const patientResults = await storage.getPatientLabResultsByPatientId(patient.id);
        
        // Find eGFR test results
        const eGFRResults = patientResults.filter(r => 
          r.labTestId === 1 // Assuming eGFR test ID is 1
        );
        
        // Sort by date to get latest
        eGFRResults.sort((a, b) => 
          new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime()
        );
        
        const latestEGFR = eGFRResults.length > 0 ? eGFRResults[0].resultValue : null;
        
        // Get last appointment as "last visit" date
        const appointments = await storage.getAppointmentsByPatientId(patient.id);
        appointments.sort((a, b) => 
          new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        );
        
        const lastVisit = appointments.length > 0 ? appointments[0].appointmentDate : null;
        
        // Calculate age from birth date
        const birthDate = new Date(patient.birthDate);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        
        return {
          ...patient,
          user: { ...patient.user, passwordHash: undefined },
          age,
          latestEGFR,
          lastVisit
        };
      }));
      
      res.json(enhancedPatients);
    } catch (error) {
      console.error('Dashboard recent patients error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Upcoming appointments for dashboard
  apiRouter.get('/dashboard/upcoming-appointments', authenticate, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      
      // Get future appointments that aren't cancelled
      const now = new Date();
      const upcomingAppointments = appointments
        .filter(apt => new Date(apt.appointmentDate) > now && apt.status !== 'cancelled')
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
        .slice(0, 3); // Get the next 3
      
      // Augment with patient and doctor details
      const enhancedAppointments = await Promise.all(upcomingAppointments.map(async apt => {
        const patient = await storage.getPatientById(apt.patientId);
        const doctor = await storage.getDoctorById(apt.doctorId);
        
        return {
          ...apt,
          patient: patient ? {
            id: patient.id,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
            initials: `${patient.user.firstName.charAt(0)}${patient.user.lastName.charAt(0)}`
          } : null,
          doctor: doctor ? {
            id: doctor.id,
            firstName: doctor.user.firstName,
            lastName: doctor.user.lastName
          } : null
        };
      }));
      
      res.json(enhancedAppointments);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Recent alerts for dashboard
  apiRouter.get('/dashboard/recent-alerts', authenticate, async (req, res) => {
    try {
      // For demo purposes, generate sample alerts
      const alerts = [
        {
          id: 1,
          type: 'critical',
          title: 'Critical eGFR Decline',
          message: 'Fatou Coulibaly\'s eGFR dropped from 29 to 22 in the last 3 months',
          patientId: 4,
          patientInitials: 'FC',
          time: '1 hour ago'
        },
        {
          id: 2,
          type: 'warning',
          title: 'Elevated Blood Pressure',
          message: 'Robert Moussoh\'s last three BP readings were above 160/95 mmHg',
          patientId: 1,
          patientInitials: 'RM',
          time: '3 hours ago'
        },
        {
          id: 3,
          type: 'info',
          title: 'Missed Appointment',
          message: 'Abdul Traore missed his scheduled appointment on June 12',
          patientId: 3,
          patientInitials: 'AT',
          time: 'Yesterday'
        }
      ];
      
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
