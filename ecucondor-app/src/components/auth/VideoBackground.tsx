/**
 * Video Background Component for Authentication Pages
 */

interface VideoBackgroundProps {
  title: string;
  subtitle: string;
  features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
}

export default function VideoBackground({ title, subtitle, features }: VideoBackgroundProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {/* Video Background with Blur */}
      <video
        className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        autoPlay
        muted
        loop
        playsInline
        poster="/video-poster.jpg" // Fallback poster image
      >
        <source src="/login-video.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-gradient-to-br from-ecucondor-primary to-ecucondor-tertiary"></div>
      </video>
      
      {/* Stronger Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-ecucondor-primary/85 to-ecucondor-tertiary/90"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            {title}
          </h1>
          <p className="text-xl text-gray-100 max-w-lg leading-relaxed drop-shadow-xl">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300 shadow-2xl">
                <div className="text-white drop-shadow-lg">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-white drop-shadow-lg">{feature.title}</h3>
              <p className="text-sm text-gray-100 leading-relaxed drop-shadow-md">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}