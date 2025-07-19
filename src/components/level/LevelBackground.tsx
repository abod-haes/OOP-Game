import { motion } from "framer-motion";

interface LevelBackgroundProps {
  success: boolean;
  showLights: boolean;
  fadeOutLights: boolean;
}

export function LevelBackground({
  success,
  showLights,
  fadeOutLights,
}: LevelBackgroundProps) {
  return (
    <>
      {/* Background Flashing Layer */}
      {!success && (
        <motion.div
          className="absolute top-0 left-0 w-full h-full z-10 bg-red-600 opacity-0 pointer-events-none"
          animate={{ opacity: [0.06, 0.15, 0.06] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}

      {/* Success Lights Animation */}
      {success && showLights && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-screen bg-gradient-to-b from-yellow-300 to-transparent opacity-60 rounded-full"
              style={{ left: `${i * 12.5}%`, zIndex: 30 }}
              animate={{
                scaleY: [1, 1.5, 1],
                opacity: fadeOutLights ? 0 : [0.2, 0.4, 0],
              }}
              transition={{
                repeat: fadeOutLights ? 0 : Infinity,
                duration: 1.5 + i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            className="absolute inset-0 bg-yellow-400 mix-blend-screen opacity-0 z-20"
            animate={{
              opacity: fadeOutLights ? 0 : [0.1, 0.2, 0],
            }}
            transition={{
              repeat: fadeOutLights ? 0 : Infinity,
              duration: 2,
            }}
          />
        </>
      )}

      {/* Background Images */}
      <div className="absolute inset-0 z-[2]">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/assets/images/AA.jpg')",
            backgroundPosition: "center top",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <motion.div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/assets/images/A.jpg')",
            backgroundPosition: "center top",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: success ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </div>
    </>
  );
}
