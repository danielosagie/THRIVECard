import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const InputPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNewJobSeeker = () => {
    navigate('/input1');
  };

  const handleExperiencedJobSeeker = () => {
    navigate('/input1');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Which of the following best describes you?</h1>
      <p className="mb-8">Click on one of the two descriptions below. This will help us guide you through self-reflection of your experiences or translation of specific experiences using the STAR format.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>New Job Seeker/Career Transitioner</CardTitle>
            <CardDescription>"I'm just starting out and exploring my career options"</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You're at the beginning of your journey, curious about different professions and eager to uncover your potential. We'll guide you through self-reflection, helping you create a personalized Experience Card that highlights the unique value you bring to employers.</p>
            <Button onClick={handleNewJobSeeker}>Select</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Experienced and Looking to Grow</CardTitle>
            <CardDescription>"I have experience and want to take the next step."</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You're returning to the workforce or considering a career shift. We'll guide you through building targeted STAR Bullets to highlight your transferable skills and help you connect with new opportunities.</p>
            <Button onClick={handleExperiencedJobSeeker}>Select</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InputPage;
