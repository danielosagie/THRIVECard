import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStepper } from "@/components/ui/stepper";

export default function Input1() {
  const navigate = useNavigate();
  const { nextStep } = useStepper();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currentGoals: '',
    longTermGoals: '',
    militaryBase: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log(formData);
    nextStep();
    navigate('/input2');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>  
          <CardTitle>Introduction & Goals</CardTitle>
          <CardDescription>Tell us about yourself and your career goals</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="currentGoals">What are your current career goals? (Next 1-2 years)</Label>
                <Textarea id="currentGoals" name="currentGoals" value={formData.currentGoals} onChange={handleInputChange} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="longTermGoals">What are your long-term career goals? (5+ years)</Label>
                <Textarea id="longTermGoals" name="longTermGoals" value={formData.longTermGoals} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="militaryBase">Which base is your family stationed at?</Label>
                <Input 
                  id="militaryBase" 
                  name="militaryBase" 
                  value={formData.militaryBase} 
                  onChange={handleInputChange}
                  placeholder="Enter the name of your current military base"
                />
              </div>
              <Button onClick={handleSubmit}>Continue</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}