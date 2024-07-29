import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';
import Hero from "./ui/hero"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const HomePage = () => {
  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-6">Featured Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Career Transition Tips</CardTitle>
              <CardDescription>Advice for military spouses</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Learn about the best practices for transitioning your career as a military spouse.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Remote Work Opportunities</CardTitle>
              <CardDescription>Flexible jobs for mobile lifestyles</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Discover remote work opportunities that fit well with the military lifestyle.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Education Resources</CardTitle>
              <CardDescription>Continuing education for spouses</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explore educational resources and programs available to military spouses.</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-12 space-y-4">
          <Button asChild className="w-full">
            <Link to="/input">Start Your Journey</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/generate">Generate Resources</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;