import React, { useState } from "react";
import { motion, HTMLMotionProps, useAnimationControls } from "framer-motion";
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: LucideIcon;
  text: string;
  size?: "none" | "sm" | "md" | "lg" | "full";
  iconSize?: number;
  withFullWidth?: boolean;
  className?: string;
  primary?: boolean;
  rounded?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  icon: Icon,
  text,
  size = "md",
  iconSize, 
  withFullWidth = false,
  rounded = true,
  primary = false,
  className,
  ...props
}) => {
  const shineControls = useAnimationControls();
  const [isHovering, setIsHovering] = useState(false);

  // Determine size classes
  const getSizeClasses = () => {
    switch (size) {
      case "none":
        return "px-0 py-0";
      case "sm":
        return "px-[12px] py-[6px]";
      case "md":
        return "px-[24px] py-[12px]";
      case "lg":
        return "px-[32px] py-[16px]";
      case "full":
        return "py-[12px]";
      default:
        return "px-[24px] py-[12px]";
    }
  };

  // Get the icon size based on button size
  const getIconSize = () => {
    if (iconSize) return iconSize;
    switch (size) {
      case "none":
        return 18;
      case "sm":
        return 18;
      case "md":
        return 22;
      case "lg":
        return 24;
      default:
        return 22;
    }
  };

  const handleHoverStart = () => {
    setIsHovering(true);
    shineControls.start({
      x: ["-100%", "100%"],
      opacity: [0, 0.8, 0],
      transition: { duration: 0.7, ease: "easeInOut" }
    });
  };

  const handleHoverEnd = () => {
    setIsHovering(false);
    // Optionally reset shine animation or let it complete
    shineControls.stop(); 
    shineControls.set({ x: "0%", opacity: 0 }); 
  };

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden font-medium transition-all duration-300 group", // Added group for shine pseudo-element
        "inline-flex items-center justify-center",
        "bg-blue-600 text-white", // Default solid color
        "hover:shadow-[0_0_24px_4px_rgba(59,130,246,0.4)]", // Added glow shadow on hover
        getSizeClasses(),
        withFullWidth ? "w-full" : "",
        rounded ? "rounded-full" : "",
        primary ? "rounded-lg" : "", // Assuming primary might use different rounding
        className // Allows overriding default bg and adding custom shadows
      )}
      initial="initial"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      {...props}
    >
      {/* Shine pseudo-element controlled by Framer Motion */}
      <motion.div
        className="absolute top-0 left-0 h-full w-16 transform -skew-x-[30deg] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
        animate={shineControls}
        initial={{ x: "100%", opacity: 0 }} // Start off-screen
      />

      <div className={cn(
        "relative flex items-center justify-center w-full h-full z-10", // Ensure content is above shine
      )}>
        {/* Container to hold both elements */}
        <div className={cn(
          "relative h-full flex items-center justify-center min-w-[5rem]", 
        )}>
          {/* Icon slides from left to center */}
          <motion.div
            className="absolute left-0 right-0 mx-auto flex items-center justify-center"
            variants={{
              initial: { x: -35, opacity: 0, scale: 0.8 }, // Start further left and smaller
              hover: { x: 0, opacity: 1, scale: 1 }
            }}
            transition={{ 
              type: "spring", 
              stiffness: 350, 
              damping: 20,
              delay: 0.05, // Slight delay for icon
            }}
          >
            <Icon size={getIconSize()} />
          </motion.div>

          {/* Text slides to the right and fades out */}
          <motion.span
            className="mx-auto flex items-center justify-center whitespace-nowrap"
            variants={{
              initial: { x: 0, opacity: 1, scale: 1 },
              hover: { x: 35, opacity: 0, scale: 0.8 } // Move further right and shrink
            }}
            transition={{ 
              type: "spring", 
              stiffness: 350, 
              damping: 20
            }}
          >
            {text}
          </motion.span>
        </div>
      </div>
    </motion.button>
  );
};

export default AnimatedButton;
