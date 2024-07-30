import { Button } from "@/components/ui/button";
import posterImage from "../../assets/poster.svg";
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-background py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 items-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Decode Your Past, Design Your Future
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              An AI-powered career profile generator for military spouses
            </p>
            <div className="flex items-center gap-x-6">
              <Link to="/input">
                <Button size="lg">Start Your Journey</Button>
              </Link>
              <Button variant="outline" size="lg">Learn more</Button>
            </div>
          </div>
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <img
              src={posterImage}
              alt="Hero image"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;