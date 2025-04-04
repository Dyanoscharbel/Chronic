
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-primary-light overflow-hidden">
      <div className="relative h-screen">
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        
        {/* Content */}
        <div className="z-10 relative max-w-6xl mx-auto px-4 py-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-6">CKD Care</h1>
            <p className="text-xl text-white/90">La solution innovante pour le suivi des patients atteints de MRC</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur p-6 rounded-lg"
            >
              <h2 className="text-2xl font-semibold mb-4">Qu'est-ce que la MRC ?</h2>
              <p className="text-white/80">
                La Maladie Rénale Chronique est une détérioration progressive et irréversible 
                des reins. Un suivi régulier et précis est essentiel pour ralentir sa progression 
                et améliorer la qualité de vie des patients.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/10 backdrop-blur p-6 rounded-lg"
            >
              <h2 className="text-2xl font-semibold mb-4">Notre Solution</h2>
              <p className="text-white/80">
                CKD Care offre aux professionnels de santé une plateforme complète pour :
                <br />• Suivre l'évolution des patients
                <br />• Gérer les rendez-vous
                <br />• Analyser les résultats de laboratoire
                <br />• Recevoir des alertes importantes
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <button 
              onClick={() => setLocation('/login')}
              className="px-8 py-3 bg-white text-primary-dark rounded-lg font-semibold 
                         transform hover:scale-105 transition-transform duration-200 
                         hover:shadow-lg active:scale-95"
            >
              Commencer maintenant
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
