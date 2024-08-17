import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const API_BASE_URL = 'http://localhost:5000';

const pages = [
  {
    title: "Introduction & Career Goals",
    description: "Tell us about yourself and your career goals",
    fields: [
      { name: "firstName", label: "First Name", type: "input" },
      { name: "lastName", label: "Last Name", type: "input" },
      { name: "currentGoals", label: "What are your current career goals? (Next 1-2 years)", type: "textarea" },
      { name: "longTermGoals", label: "What are your long-term career goals? (5+ years)", type: "textarea" },
    ]
  },
  {
    title: "Share Your Experiences & Skills",
    description: "Tell us about your experiences and skills",
    fields: [
      { name: "professionalExperience", label: "Describe your professional experience", type: "textarea" },
      { name: "volunteerExperience", label: "Describe any volunteer experience", type: "textarea" },
      { name: "skills", label: "List your key skills", type: "textarea" },
      { name: "achievements", label: "Describe your notable achievements", type: "textarea" },
      { name: "challenges", label: "Describe any significant challenges you've overcome", type: "textarea" },
    ]
  },
  {
    title: "Preferences",
    description: "Tell us about your preferences",
    fields: [
      { name: "workPreferences", label: "Describe your ideal work environment", type: "textarea" },
    ]
  }
];

export default function MultiPageForm() {
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_input_documents`);
      if (response.data) {
        const mergedData = {};
        Object.values(response.data).forEach(content => {
          Object.assign(mergedData, JSON.parse(content));
        });
        setFormData(mergedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleContinue = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const fileName = `${formData.firstName}_${formData.lastName}_${date}.txt`;
      
      const formattedContent = Object.entries(formData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n\n');

      await axios.post(`${API_BASE_URL}/update_document`, {
        filename: fileName,
        content: formattedContent
      });
      
      alert('All data saved successfully!');
      // Optionally, reset the form or redirect the user
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{currentPageData.title}</CardTitle>
          <CardDescription>{currentPageData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid w-full items-center gap-4">
              {currentPageData.fields.map((field) => (
                <div key={field.name} className="flex flex-col space-y-1.5">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === 'input' ? (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-between mt-4">
                {currentPage > 0 && (
                  <Button onClick={handleBack} variant="outline">Back</Button>
                )}
                {currentPage < pages.length - 1 ? (
                  <Button onClick={handleContinue}>Continue</Button>
                ) : (
                  <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit All Data'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}