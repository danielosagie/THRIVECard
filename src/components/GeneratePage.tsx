import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const GeneratePage: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [generatedText, setGeneratedText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedPersona = localStorage.getItem('generatedPersona');
    if (storedPersona) {
      setGeneratedText(storedPersona);
      setProgress(100);
    } else {
      // Handle case where no persona was generated
      setError('No generated persona found. Please try again.');
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Generated Experience Card</h1>
      <Progress value={progress} className="mb-4" />
      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <pre>{generatedText}</pre>
      </div>
      <Button onClick={() => navigate('/view')} disabled={progress < 100}>
        View Experience Card
      </Button>
    </div>
  );
};

export default GeneratePage;
