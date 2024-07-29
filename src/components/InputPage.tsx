import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from 'react-router-dom';

const InputPage = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <Link to="/" className="text-sm text-muted-foreground mb-4 block">&larr; Back to Home</Link>
      <h1 className="text-3xl font-bold mb-6">Input Your Information</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <Input id="name" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium mb-1">Skills</label>
          <Input id="skills" placeholder="Your skills" />
        </div>
        <div>
          <label htmlFor="interests" className="block text-sm font-medium mb-1">Interests</label>
          <Input id="interests" placeholder="Your interests" />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default InputPage;