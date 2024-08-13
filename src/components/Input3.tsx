import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

const Input3: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hasCar: '',
    driveDistance: '',
    alternateTransportation: '',
    preferredCommute: '',
    transportationDifficulty: '',
    hasChildren: '',
    childcareType: '',
    childcareDistance: '',
    childcareCost: '',
    specialNeeds: '',
    stayDuration: '',
    openToRelocation: '',
    relocationImpact: '',
    remoteWorkImportance: '',
    stressManagement: '',
    resourceStruggle: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log(formData);
    navigate('/input4');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Preferences & Constraints</CardTitle>
          <CardDescription>Help us understand your preferences and constraints</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <Accordion type="single" collapsible>
              <AccordionItem value="transportation">
                <AccordionTrigger>Transportation</AccordionTrigger>
                <AccordionContent>
                  <div className="grid w-full items-center gap-4">
                    <Label>Do you currently have a car?</Label>
                    <RadioGroup onValueChange={(value) => handleRadioChange('hasCar', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="car-yes" />
                        <Label htmlFor="car-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="car-no" />
                        <Label htmlFor="car-no">No</Label>
                      </div>
                    </RadioGroup>
                    {formData.hasCar === 'yes' && (
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="driveDistance">How far away would you be willing to drive? (In minutes)</Label>
                        <Input id="driveDistance" name="driveDistance" value={formData.driveDistance} onChange={handleInputChange} />
                      </div>
                    )}
                    {formData.hasCar === 'no' && (
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="alternateTransportation">How do you get around/plan to?</Label>
                        <Input id="alternateTransportation" name="alternateTransportation" value={formData.alternateTransportation} onChange={handleInputChange} />
                      </div>
                    )}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="preferredCommute">What is your preferred commute length?</Label>
                      <Input id="preferredCommute" name="preferredCommute" value={formData.preferredCommute} onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="transportationDifficulty">How difficult is your current transportation situation, how has it impacted your career-search/decisions?</Label>
                      <Textarea id="transportationDifficulty" name="transportationDifficulty" value={formData.transportationDifficulty} onChange={handleInputChange} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              {/* Add similar AccordionItems for Childcare, Relocation, and Other sections */}
            </Accordion>
            <Button onClick={handleSubmit} className="mt-4">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Input3;