export const fadeUp = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const stagger = {
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

export const cardHover = {
  hover: {
    y: -8,
    scale: 1.03,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    transition: { type: "spring", stiffness: 300 }
  }
};

export const buttonHover = {
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)"
  }
};
