import React from 'react';

interface FloatingIconProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  left: string;
  top: string;
  rotate: string;
  stacked: boolean;
  stackedLeft?: string;
  stackedTop?: string;
  style?: React.CSSProperties;
  className?: string; // ✅ Add this line
}

const FloatingIcon: React.FC<FloatingIconProps> = ({
  src,
  alt,
  width,
  height,
  left,
  top,
  rotate,
  stacked,
  stackedLeft = '40%',
  stackedTop = '85%',
  className = "", // ✅ Default to empty string
  style = {},
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = 200; // scroll distance where icons animate out
      setIsVisible(window.scrollY > triggerPoint);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <div
      // className="absolute transition-all duration-1000 mt-80 lg:mt-0 ease-in-out will-change-transform pointer-events-none"
      className="absolute transition-all duration-1000 ease-in-out will-change-transform pointer-events-none"
      style={{
        ...style,
        left: stacked ? stackedLeft : left,
        top: stacked ? stackedTop : top,
        transform: stacked ? 'translate(-50%, -50%) rotate(0deg)' : `rotate(${rotate})`,
        zIndex: stacked ? 50 : 10,
        width,
        height,
        opacity: isVisible ? 0 : 1,
      }}
    >
      <img src={src} alt={alt} width={width} height={height}
        // className="inline-block align-middle border-gray-600 border-opacity-60 rounded-xl"
                // className= ""{`inline-block ${className}`} // ✅ Apply className here
        className= "border border-gray-200 border-opacity-60 rounded-xl" // ✅ Apply className here
        
      />
    </div>
  );
};

export default FloatingIcon;














// ------last changed: 2025-08-30 below, And the above code is change to add opacity 0 for icons-------------------------

// import React from 'react';

// interface FloatingIconProps {
//   src: string;
//   alt: string;
//   width: number;
//   height: number;
//   left: string;
//   top: string;
//   rotate: string;
//   stacked: boolean;
//   stackedLeft?: string;
//   stackedTop?: string;
//   style?: React.CSSProperties;
// }

// const FloatingIcon: React.FC<FloatingIconProps> = ({
//   src,
//   alt,
//   width,
//   height,
//   left,
//   top,
//   rotate,
//   stacked,
//   stackedLeft = '28%',
//   stackedTop = '80%',
//   style = {},
// }) => {
//   return (
//     <div
//       className="absolute transition-all duration-1000 ease-in-out will-change-transform pointer-events-none"
//       style={{
//         ...style,
//         left: stacked ? stackedLeft : left,
//         top: stacked ? stackedTop : top,
//         transform: stacked ? 'translate(-50%, -50%) rotate(0deg)' : `rotate(${rotate})`,
//         zIndex: stacked ? 50 : 10,
//         width,
//         height,
//       }}
//     >
//       <img src={src} alt={alt} width={width} height={height} />
//     </div>
//   );
// };

// export default FloatingIcon;















// import React from 'react';

// interface FloatingIconProps {
//   src: string;
//   alt: string;
//   width: number;
//   height: number;
//   left: string;
//   top: string;
//   rotate: string;
//   stacked: boolean;
//   stackedLeft?: string; // New: custom stack X
//   stackedTop?: string;  // New: custom stack Y
// }

// const FloatingIcon: React.FC<FloatingIconProps> = ({
//   src,
//   alt,
//   width,
//   height,
//   left,
//   top,
//   rotate,
//   stacked,
//   stackedLeft,
//   stackedTop,
// }) => {
//   const computedLeft = stacked ? stackedLeft || '28%' : left;
//   const computedTop = stacked ? stackedTop || '80%' : top;
//   const computedTransform = stacked
//     ? 'translate(-50%, -50%) rotate(0deg)'
//     : `rotate(${rotate})`;

//   return (
//     <div
//       className="absolute transition-all duration-1000 ease-out"
//       style={{
//         left: computedLeft,
//         top: computedTop,
//         transform: computedTransform,
//         zIndex: stacked ? 50 : 10,
//       }}
//     >
//       <img
//         src={src}
//         alt={alt}
//         width={width}
//         height={height}
//         className="inline-block mx-2 align-middle border-gray-200 border-opacity-60 rounded-xl"
//         style={{ verticalAlign: 'middle' }}
//       />
//     </div>
//   );
// };

// export default FloatingIcon;
