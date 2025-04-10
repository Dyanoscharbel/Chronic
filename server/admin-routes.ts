
import { Router } from "express";
import { Doctor, User, Patient } from './models';

const adminRouter = Router();

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.session.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  next();
};

// Statistiques admin
adminRouter.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalDoctors,
      totalPatients,
      totalUsers
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Liste des médecins
adminRouter.get('/doctors', requireAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Liste des patients
adminRouter.get('/patients', requireAdmin, async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('user')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default adminRouter;
