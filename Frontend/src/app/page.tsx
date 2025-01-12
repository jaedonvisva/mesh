'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Dot {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const colors = ['#dc4174', '#e88c51', '#f4c84c'];

const BackgroundDot = ({ x, y, size, color }: Dot) => (
  <motion.div
    className="absolute rounded-full"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.5, 1] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
    }}
  />
);

export default function App() {
  const [dots, setDots] = useState<Dot[]>([]);
  const router = useRouter();

  useEffect(() => {
    const newDots = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setDots(newDots);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#222831]">
      

      {/* Hero Text Section */}
      <div className="container mx-auto px-4 z-10">
        <motion.h1
          className="text-10xl md:text-9xl font-bold text-center mb-8 leading-snug animated-gradient-text glowing-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          Mesh
        </motion.h1>

        <motion.h1
          className="text-2xl md:text-4xl font-bold text-center mb-8 leading-snug animated-gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          Connect Better. Connect More<br />Network Boosted.
        </motion.h1>

        

        {/* Button Section */}
        <motion.div
          className="text-3xl md:text-6xl flex justify-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <button
            onClick={() => router.push('/main')}
            className="bg-white text-[#2a333f] px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-500 hover:text-white transition duration-300 flex items-center shadow-lg hover:shadow-xl pulse-glow"
          >
            Boost your Network
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </motion.div>

        <motion.h1
          className="text-2xl md:text-2xl font-bold text-center mb-8 leading-snug animated-gradient-text white-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          <br />
          <br />
          DeltaHacks XI
        </motion.h1>
      </div>

      {/* Floating Background Dots */}
      {dots.map((dot) => (
        <BackgroundDot key={dot.id} {...dot} />
      ))}
    </section>
  );
}
