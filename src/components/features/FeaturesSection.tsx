import React from 'react';
import Image from 'next/image';

interface FeatureCardProps {
  iconSrc: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ iconSrc, title, description }) => {
  return (
    <div className="bg-blue-800 p-6 rounded-lg shadow-xl text-white text-center flex flex-col items-center transform transition duration-300 hover:scale-105">
      <div className="bg-cyan-500 rounded-full p-4 mb-4">
        <Image src={iconSrc} alt={title} width={48} height={48} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
};

export default function FeaturesSection() {
  return (
    <section className="relative z-20 -mt-20 md:-mt-16 px-4 py-8 container mx-auto">
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          iconSrc="/icons/best-electronics.svg"
          title="Best Electronics Repair Service"
          description="It is a long established fact that a reader will be distracted by the readable content"
        />
        <FeatureCard
          iconSrc="/icons/experienced-team.svg"
          title="Repair With Experience Team"
          description="It is a long established fact that a reader will be distracted by the readable content"
        />
        <FeatureCard
          iconSrc="/icons/secure-service.svg"
          title="100% Secure Repair Service For You"
          description="It is a long established fact that a reader will be distracted by the readable content"
        />
      </div> */}
    </section>
  );
} 