
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';

export default function LandingPage() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-primary-light overflow-hidden">
      <div className="relative h-screen flex items-center justify-center">
        {/* Animated background elements */}
        <motion.div
          className="absolute w-72 h-72 bg-white/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Content */}
        <div className="z-10 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              CKD Care
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/90 mb-8"
          >
            Gérez vos patients atteints de maladie rénale chronique
          </motion.p>
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/login" onClick={() => setLocation('/login')}>
              <button className="px-8 py-3 bg-white text-primary-dark rounded-lg font-semibold 
                               transform hover:scale-105 transition-transform duration-200 
                               hover:shadow-lg active:scale-95">
                Commencer
              </button>
            </Link>
          </motion.div>
        </div>
        
        {/* Additional decorative elements */}
        <motion.div
          className="absolute bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: 360
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          className="absolute top-20 right-20 w-40 h-40 bg-white/5 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: -360
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  );
}
