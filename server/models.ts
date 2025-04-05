
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['patient', 'medecin', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  birthDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  gender: { type: String, enum: ['M', 'F', 'Autre'], required: true },
  address: String,
  phone: String,
  ckdStage: { type: String, enum: ['Stage 1', 'Stage 2', 'Stage 3A', 'Stage 3B', 'Stage 4', 'Stage 5'] }
});

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: String,
  hospital: String
});

const labTestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  description: String,
  unit: String,
  normalMin: Number,
  normalMax: Number,
  category: String
});

const patientLabResultSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  labTest: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
  resultValue: { type: Number, required: true },
  resultDate: { type: Date, required: true }
});

export const User = mongoose.model('User', userSchema);
export const Patient = mongoose.model('Patient', patientSchema);
export const Doctor = mongoose.model('Doctor', doctorSchema);
export const LabTest = mongoose.model('LabTest', labTestSchema);
export const PatientLabResult = mongoose.model('PatientLabResult', patientLabResultSchema);

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.model('Notification', notificationSchema);
