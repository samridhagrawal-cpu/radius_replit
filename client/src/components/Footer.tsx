export default function Footer() {
  return (
    <footer className="relative w-full bg-background py-24 md:py-40 pt-[0px] pb-[0px]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 
          className="text-[100px] md:text-[160px] lg:text-[200px] xl:text-[240px] font-bold leading-none tracking-tight select-none text-muted-foreground/20"
          data-testid="text-footer-radius"
        >
          Radius
        </h2>
        
        <div className="mt-16">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            © 2025 Radius. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
