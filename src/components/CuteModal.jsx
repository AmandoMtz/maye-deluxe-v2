import { motion } from 'framer-motion';

export default function CuteModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{ opacity: 0, y: 8,  scale: 0.98 }}
        transition={{ duration: .25 }}
        className="relative max-w-md mx-auto mt-28 rounded-2xl p-5 shadow-xl ring-1 ring-white/20
                   bg-[linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.06))]"
      >
        {children}
      </motion.div>
    </div>
  );
}
