import { motion } from "framer-motion";

interface LevelBackgroundProps {
  success: boolean;
  showLights: boolean;
  fadeOutLights: boolean;
  levelNumber?: number;
}

export function LevelBackground({
  success,
  showLights,
  fadeOutLights,
  levelNumber,
}: LevelBackgroundProps) {
  // Function to get level background image based on level number
  const getLevelBackgroundImage = (levelNumber?: number): string => {
    if (!levelNumber) return "/assets/images/A.jpg";

    const levelImageMap: { [key: number]: string } = {
      1: "/assets/images/A.jpg",
      2: "/assets/images/B.jpg",
      3: "/assets/images/C.jpg",
      4: "/assets/images/D.jpg",
      5: "/assets/images/E.jpg",
      6: "/assets/images/AA.jpg",
      7: "/assets/images/BB.jpg",
      8: "/assets/images/CC.jpg",
      9: "/assets/images/D1.png",
      10: "/assets/images/D2.png",
      11: "/assets/images/D3.png",
      12: "/assets/images/D4.png",
    };

    return levelImageMap[levelNumber] || "/assets/images/A.jpg";
  };
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
        {/* Main Level Background */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url('${getLevelBackgroundImage(levelNumber)}')`,
            backgroundPosition: "center top",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Success Background Overlay */}
        {success && (
          <motion.div
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url('${getLevelBackgroundImage(levelNumber)}')`,
              backgroundPosition: "center top",
              filter: "brightness(1.2) saturate(1.3)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-green-500/20" />
          </motion.div>
        )}
      </div>
    </>
  );
}
