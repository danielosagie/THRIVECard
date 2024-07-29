import { Button } from "@/components/ui/button";
import posterImage from "../../assets/poster.svg";

const Hero = () => {
  return (
    <div className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Decode Your Past, Design Your Future
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              An AI-powered career profile generator for military spouses
            </p>
            <div className="flex items-center gap-x-6">
              <Button size="lg">Get started</Button>
              <Button variant="outline" size="lg">Learn more</Button>
            </div>
          </div>
          <div className="relative bg-muted rounded-lg overflow-hidden h-[400px] lg:h-[600px]">
            <img
              src={posterImage}
              alt="Hero image"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;