import { 
  users, patients, doctors, labTests, patientLabResults, appointments, notifications, workflows, workflowRequirements,
  type User, type InsertUser, type Patient, type InsertPatient, type Doctor, type InsertDoctor,
  type LabTest, type InsertLabTest, type PatientLabResult, type InsertPatientLabResult,
  type Appointment, type InsertAppointment, type Notification, type InsertNotification,
  type Workflow, type InsertWorkflow, type WorkflowRequirement, type InsertWorkflowRequirement
} from "@shared/schema";
import bcrypt from 'bcrypt';

// Define the interface for our storage
export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserCredentials(email: string, password: string): Promise<User | null>;
  
  // Patient methods
  getPatients(): Promise<(Patient & { user: User })[]>;
  getPatientById(id: number): Promise<(Patient & { user: User }) | undefined>;
  getPatientByUserId(userId: number): Promise<(Patient & { user: User }) | undefined>;
  createPatient(patient: InsertPatient, user: InsertUser): Promise<Patient & { user: User }>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  
  // Doctor methods
  getDoctors(): Promise<(Doctor & { user: User })[]>;
  getDoctorById(id: number): Promise<(Doctor & { user: User }) | undefined>;
  getDoctorByUserId(userId: number): Promise<(Doctor & { user: User }) | undefined>;
  createDoctor(doctor: InsertDoctor, user: InsertUser): Promise<Doctor & { user: User }>;
  
  // Lab tests methods
  getLabTests(): Promise<LabTest[]>;
  getLabTestById(id: number): Promise<LabTest | undefined>;
  createLabTest(labTest: InsertLabTest): Promise<LabTest>;
  
  // Patient lab results methods
  getPatientLabResults(): Promise<PatientLabResult[]>;
  getPatientLabResultById(id: number): Promise<PatientLabResult | undefined>;
  getPatientLabResultsByPatientId(patientId: number): Promise<PatientLabResult[]>;
  createPatientLabResult(result: InsertPatientLabResult): Promise<PatientLabResult>;
  
  // Appointment methods
  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPatientId(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctorId(doctorId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Notification methods
  getNotifications(): Promise<Notification[]>;
  getNotificationById(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Workflow methods
  getWorkflows(): Promise<Workflow[]>;
  getWorkflowById(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  getWorkflowRequirements(workflowId: number): Promise<WorkflowRequirement[]>;
  addWorkflowRequirement(requirement: InsertWorkflowRequirement): Promise<WorkflowRequirement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private doctors: Map<number, Doctor>;
  private labTests: Map<number, LabTest>;
  private patientLabResults: Map<number, PatientLabResult>;
  private appointments: Map<number, Appointment>;
  private notifications: Map<number, Notification>;
  private workflows: Map<number, Workflow>;
  private workflowRequirements: Map<number, WorkflowRequirement>;
  
  private userId: number = 1;
  private patientId: number = 1;
  private doctorId: number = 1;
  private labTestId: number = 1;
  private resultId: number = 1;
  private appointmentId: number = 1;
  private notificationId: number = 1;
  private workflowId: number = 1;
  private requirementId: number = 1;

  constructor() {
    this.users = new Map<number, User>();
    this.patients = new Map<number, Patient>();
    this.doctors = new Map<number, Doctor>();
    this.labTests = new Map<number, LabTest>();
    this.patientLabResults = new Map<number, PatientLabResult>();
    this.appointments = new Map<number, Appointment>();
    this.notifications = new Map<number, Notification>();
    this.workflows = new Map<number, Workflow>();
    this.workflowRequirements = new Map<number, WorkflowRequirement>();
    
    // Seed some initial data - this is async but we can't make constructor async
    // so we'll just call it and handle any errors internally
    this.seedInitialData().catch(err => {
      console.error("Error seeding initial data:", err);
    });
  }

  private async seedInitialData() {
    // Create sample lab tests
    this.createLabTest({
      testName: "eGFR",
      description: "Estimated Glomerular Filtration Rate",
      unit: "mL/min",
      normalMin: 90,
      normalMax: 120
    });
    
    this.createLabTest({
      testName: "Serum Creatinine",
      description: "Measure of kidney function",
      unit: "mg/dL",
      normalMin: 0.7,
      normalMax: 1.3
    });
    
    this.createLabTest({
      testName: "Urine Albumin-to-Creatinine Ratio",
      description: "Measure of kidney damage",
      unit: "mg/g",
      normalMin: 0,
      normalMax: 30
    });
    
    this.createLabTest({
      testName: "Blood Pressure",
      description: "Systolic/Diastolic pressure",
      unit: "mmHg",
      normalMin: 90,
      normalMax: 120
    });

    // Create sample doctor
    await this.createDoctor(
      { 
        specialty: "Néphrologie",
        hospital: "Hôpital Universitaire",
        userId: 0 // Will be set by createUser
      },
      {
        firstName: "Dr. Martin",
        lastName: "Dubois",
        email: "dr.martin@example.com",
        passwordHash: "password123",
        role: "medecin"
      }
    );

    // Create sample patient
    await this.createPatient(
      {
        birthDate: "1975-05-15",
        gender: "M",
        address: "123 Rue Principale",
        phone: "+33123456789",
        ckdStage: "Stage 3A",
        userId: 0 // Will be set by createUser
      },
      {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.com",
        passwordHash: "password123",
        role: "patient"
      }
    );

    // Create sample admin
    await this.createUser({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      passwordHash: "admin123",
      role: "admin"
    });
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    const newUser: User = { 
      ...user, 
      id, 
      passwordHash: hashedPassword,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async verifyUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    return isPasswordValid ? user : null;
  }

  // Patient methods
  async getPatients(): Promise<(Patient & { user: User })[]> {
    const result: (Patient & { user: User })[] = [];
    
    for (const patient of this.patients.values()) {
      const user = await this.getUserById(patient.userId);
      if (user) {
        result.push({ ...patient, user });
      }
    }
    
    return result;
  }

  async getPatientById(id: number): Promise<(Patient & { user: User }) | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const user = await this.getUserById(patient.userId);
    if (!user) return undefined;
    
    return { ...patient, user };
  }

  async getPatientByUserId(userId: number): Promise<(Patient & { user: User }) | undefined> {
    const patient = Array.from(this.patients.values()).find(p => p.userId === userId);
    if (!patient) return undefined;
    
    const user = await this.getUserById(patient.userId);
    if (!user) return undefined;
    
    return { ...patient, user };
  }

  async createPatient(patient: InsertPatient, userData: InsertUser): Promise<Patient & { user: User }> {
    const user = await this.createUser({ ...userData, role: 'patient' });
    
    const id = this.patientId++;
    const newPatient: Patient = { ...patient, id, userId: user.id };
    this.patients.set(id, newPatient);
    
    return { ...newPatient, user };
  }

  async updatePatient(id: number, patientData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient: Patient = { ...patient, ...patientData };
    this.patients.set(id, updatedPatient);
    
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    const patient = this.patients.get(id);
    if (!patient) return false;
    
    this.patients.delete(id);
    this.users.delete(patient.userId);
    
    return true;
  }

  // Doctor methods
  async getDoctors(): Promise<(Doctor & { user: User })[]> {
    const result: (Doctor & { user: User })[] = [];
    
    for (const doctor of this.doctors.values()) {
      const user = await this.getUserById(doctor.userId);
      if (user) {
        result.push({ ...doctor, user });
      }
    }
    
    return result;
  }

  async getDoctorById(id: number): Promise<(Doctor & { user: User }) | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;
    
    const user = await this.getUserById(doctor.userId);
    if (!user) return undefined;
    
    return { ...doctor, user };
  }

  async getDoctorByUserId(userId: number): Promise<(Doctor & { user: User }) | undefined> {
    const doctor = Array.from(this.doctors.values()).find(d => d.userId === userId);
    if (!doctor) return undefined;
    
    const user = await this.getUserById(doctor.userId);
    if (!user) return undefined;
    
    return { ...doctor, user };
  }

  async createDoctor(doctor: InsertDoctor, userData: InsertUser): Promise<Doctor & { user: User }> {
    const user = await this.createUser({ ...userData, role: 'medecin' });
    
    const id = this.doctorId++;
    const newDoctor: Doctor = { ...doctor, id, userId: user.id };
    this.doctors.set(id, newDoctor);
    
    return { ...newDoctor, user };
  }

  // Lab tests methods
  async getLabTests(): Promise<LabTest[]> {
    return Array.from(this.labTests.values());
  }

  async getLabTestById(id: number): Promise<LabTest | undefined> {
    return this.labTests.get(id);
  }

  async createLabTest(labTest: InsertLabTest): Promise<LabTest> {
    const id = this.labTestId++;
    const newLabTest: LabTest = { ...labTest, id };
    this.labTests.set(id, newLabTest);
    return newLabTest;
  }

  // Patient lab results methods
  async getPatientLabResults(): Promise<PatientLabResult[]> {
    return Array.from(this.patientLabResults.values());
  }

  async getPatientLabResultById(id: number): Promise<PatientLabResult | undefined> {
    return this.patientLabResults.get(id);
  }

  async getPatientLabResultsByPatientId(patientId: number): Promise<PatientLabResult[]> {
    return Array.from(this.patientLabResults.values()).filter(result => result.patientId === patientId);
  }

  async createPatientLabResult(result: InsertPatientLabResult): Promise<PatientLabResult> {
    const id = this.resultId++;
    const newResult: PatientLabResult = { ...result, id };
    this.patientLabResults.set(id, newResult);
    return newResult;
  }

  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.patientId === patientId);
  }

  async getAppointmentsByDoctorId(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.doctorId === doctorId);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment: Appointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    
    return updatedAppointment;
  }

  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async getNotificationById(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const newNotification: Notification = { 
      ...notification, 
      id, 
      isRead: false,
      createdAt: new Date() 
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    
    return updatedNotification;
  }

  // Workflow methods
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflowById(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowId++;
    const newWorkflow: Workflow = { 
      ...workflow, 
      id, 
      createdAt: new Date() 
    };
    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  async getWorkflowRequirements(workflowId: number): Promise<WorkflowRequirement[]> {
    return Array.from(this.workflowRequirements.values())
      .filter(req => req.workflowId === workflowId);
  }

  async addWorkflowRequirement(requirement: InsertWorkflowRequirement): Promise<WorkflowRequirement> {
    const id = this.requirementId++;
    const newRequirement: WorkflowRequirement = { ...requirement, id };
    this.workflowRequirements.set(id, newRequirement);
    return newRequirement;
  }
}

export const storage = new MemStorage();
