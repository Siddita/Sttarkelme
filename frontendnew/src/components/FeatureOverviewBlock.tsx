import React from "react";

interface FeatureOverviewBlockProps {
  title: string;
  description: string;
  videoPoster: string;
  videoSources: { src: string; type: string }[];
}

const FeatureOverviewBlock: React.FC<FeatureOverviewBlockProps> = ({
  title,
  description,
  videoPoster,
  videoSources,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Text Section */}
      <div className="flex-1 space-y-3">
        <h3 className="text-2xl font-bold text-black">{title}</h3>
        <p className="text-base text-gray-700">{description}</p>
      </div>

      {/* Video Section */}
      <div className="flex-1 overflow-hidden rounded-lg shadow-md">
        <video
          className="w-full h-auto"
          preload="none"
          playsInline
          muted
          controls
          poster={videoPoster}
          disablePictureInPicture
          controlsList="nodownload"
        >
          {videoSources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default FeatureOverviewBlock;
