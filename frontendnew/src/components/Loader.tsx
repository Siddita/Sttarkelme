import React from "react";
import { TextHoverEffect } from "./ui/text-loader-effect"; // adjust path if needed

const Loader: React.FC = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="w-full h-[200px]">
        <TextHoverEffect text="STTARKEL" duration={5} />
      </div>
    </div>
  );
};

export default Loader;
