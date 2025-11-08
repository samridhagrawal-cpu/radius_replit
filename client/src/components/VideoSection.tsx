

export default function VideoSection() {
  return (
    <section className="w-full bg-background py-16 md:py-24" data-testid="section-video">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            Watch Radius in
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-foreground text-background px-5 py-2 rounded-xl">
                30 Seconds
              </span>
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            See how brands discover and optimize their AI visibility instantly
          </p>
        </div>

        {/* Video Container with Premium Framing */}
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            {/* Subtle gradient border on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            
            {/* Main video container */}
            <div className="relative bg-background border-2 border-border rounded-2xl p-2 md:p-3 shadow-xl group-hover:border-foreground transition-all duration-300">
              {/* 16:9 Aspect Ratio Container */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-xl"
                  src="https://www.youtube.com/embed/9LQ-QDet_4c?rel=0&modestbranding=1&showinfo=0"
                  title="Radius Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  style={{ border: 'none' }}
                  data-testid="iframe-demo-video"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
