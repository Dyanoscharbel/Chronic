
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-primary-light text-white overflow-x-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur p-8 rounded-xl"
          >
            <h2 className="text-2xl font-semibold mb-4">Comprendre la MRC</h2>
            <ul className="space-y-3 text-white/80">
              <li>• Détérioration progressive de la fonction rénale</li>
              <li>• 5 stades d'évolution nécessitant un suivi adapté</li>
              <li>• Impact significatif sur la qualité de vie</li>
              <li>• Nécessité d'une prise en charge précoce</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/10 backdrop-blur p-8 rounded-xl"
          >
            <h2 className="text-2xl font-semibold mb-4">Notre Solution</h2>
            <ul className="space-y-3 text-white/80">
              <li>• Suivi personnalisé des patients</li>
              <li>• Gestion des résultats biologiques</li>
              <li>• Alertes et notifications importantes</li>
              <li>• Tableaux de bord intuitifs</li>
            </ul>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-semibold mb-6">Pour une meilleure prise en charge</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Suivi régulier simplifié",
              "Décisions médicales éclairées",
              "Meilleure qualité de vie"
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="bg-white/5 p-4 rounded-lg"
              >
                {benefit}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <button
            onClick={() => setLocation('/login')}
            className="px-8 py-4 bg-white text-primary-dark rounded-xl font-semibold
                     transform hover:scale-105 transition-all duration-300
                     hover:shadow-xl hover:shadow-white/20 active:scale-95"
          >
            Commencer maintenant
          </button>
        </motion.div>
      </div>
    </div>
  );
}
