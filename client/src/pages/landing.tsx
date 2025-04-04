
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-primary-light text-white overflow-x-hidden">
      {/* Animated circles in background */}
      <motion.div 
        className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl font-bold mb-6">CKD Care</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Votre solution complète pour le suivi des patients atteints de Maladie Rénale Chronique
          </p>
        </motion.div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4">Suivi Personnalisé</h3>
            <p className="text-white/80">
              Surveillance continue des marqueurs clés de la MRC avec alertes en temps réel
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4">Gestion Efficace</h3>
            <p className="text-white/80">
              Tableau de bord intuitif pour la gestion des rendez-vous et des résultats d'analyses
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/10 backdrop-blur p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4">Prévention Active</h3>
            <p className="text-white/80">
              Détection précoce des complications et recommandations personnalisées
            </p>
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-semibold mb-6">Comprendre la MRC</h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
            La Maladie Rénale Chronique affecte des millions de personnes. Une prise en charge 
            précoce et un suivi régulier sont essentiels pour ralentir sa progression et 
            améliorer la qualité de vie des patients.
          </p>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <button
            onClick={() => setLocation('/login')}
            className="px-8 py-4 bg-white text-primary-dark rounded-xl font-semibold
                     transform hover:scale-105 transition-all duration-300
                     hover:shadow-xl hover:shadow-white/20"
          >
            Commencer maintenant
          </button>
          <p className="mt-4 text-white/70">
            Prenez en main la gestion de la MRC dès aujourd'hui
          </p>
        </motion.div>
      </div>
    </div>
  );
}
