import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import GradientButton from '@/components/ui/gradientbutton';
import { Progress } from "@/components/ui/progress";
import FileUpload from '@/components/ui/FileUpload'; // Adjust the import path as needed
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = 'http://localhost:5000';

const pages = [
  {
    title: "Personal Details",
    navTitle: "Introduction",
    description: "Tell us about yourself and your career goals",
    fields: [
      { name: "firstName", label: "First Name", type: "input" },
      { name: "lastName", label: "Last Name", type: "input" },
      { name: "currentGoals", label: "What are your current career goals? (Next 1-2 years)", type: "textarea" },
      { name: "longTermGoals", label: "What are your long-term career goals? (5+ years)", type: "textarea" },
    ],
    layout: (fields, handleInputChange, formData) => (
      <div className="grid grid-cols-1 gap-4">
        <div className="flex gap-10">
          {fields.slice(0, 2).map(field => (
            <div key={field.name} className="flex-1">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>
        {fields.slice(2).map(field => (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
            />
          </div>
        ))}
      </div>
    )
  },
  {
    title: "Experience & Skills",
    navTitle: "Background",
    description: "Tell us about your experiences and skills",
    fields: [
      { name: "professionalExperience", label: "Describe your professional experience", type: "textarea" },
      { name: "volunteerExperience", label: "Describe any volunteer experience", type: "textarea" },
      { name: "skills", label: "List your key skills", type: "textarea" },
      { name: "achievements", label: "Describe your notable achievements", type: "textarea" },
      { name: "challenges", label: "Describe any significant challenges you've overcome", type: "textarea" },
    ],
    layout: (fields, handleInputChange, formData, handleExperienceChange) => (
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
          <FileUpload 
          onFilesChange={(files) => handleInputChange({ target: { name: 'uploadedFiles', value: files } })}
          dropzoneText="Upload ERP homework, resume, or cover letter"
          uploadedFilesText="Uploaded Files:"
          removeFileText="Remove"
        />
        </div>
        <h3 className="flex text-lg w-full font-semibold items-center justify-center mb-2">OR</h3>
        <div className="border-t border-b py-4 my-4">
          {fields.map((field) => (
            <div key={field.name} className="mb-4">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Work Preferences",
    navTitle: "Preferences",
    description: "Tell us about your preferences",
    fields: [
      { name: "workPreferences", label: "Outline what you need or prefer in a job to help it fit with your life. This could include preferred work hours, preferences for remote or flexible work, any relocation plans, transportation needs, childcare requirements, and more.", type: "textarea" },
    ]
  }
];

export default function EnhancedMultiPageForm() {
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const handleExperienceChange = (value) => {
    setFormData(prevData => ({
      ...prevData,
      experienceLevel: value
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
      navigate('/summary');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPageData = pages[currentPage];

  const renderFields = () => {
    if (currentPageData.layout) {
      return currentPageData.layout(currentPageData.fields, handleInputChange, formData, handleExperienceChange);
    }

    return (
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
      </div>
    );
  };

  const progressValue = ((currentPage + 1) / pages.length) * 100;

  return (
    <div className="flex flex-col items-center w-full bg-white">
      <nav className="w-full px-4 py-5 bg-white pl-20 pr-20">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center w-full justify-between space-x-4 md:space-x-8">
            {pages.map((page, index) => (
              <React.Fragment key={index}>
                <div className='flex flex-col items-center gap-4'>
                  <div className={`flex items-center justify-center w-8 h-8 text-white ${index <= currentPage ? 'bg-[#1a202c]' : 'bg-[#e2e8f0]'} rounded-full`}>
                    {index + 1}
                  </div>
                  <span className={`font-medium ${index <= currentPage ? 'text-[#1a202c]' : 'text-[#cbd5e0]'} text-center whitespace-nowrap`}>
                    {page.navTitle}
                  </span>
                </div>
                {index < pages.length - 1 && (
                  <Progress className="h-3 flex-grow" value={index < currentPage ? 100 : 0} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>
      <div className="flex flex-col items-center w-full max-w-10xl p-8 bg-gray-100 rounded-lg shadow-md mt-8 mx-4" style={{ margin: '20px', width: 'calc(100% - 40px)'}}>
        <div className="flex flex-col p-8 bg-gray-100 rounded-lg justify-center w-full max-w-5xl">
          <Card className="">
            <CardHeader>
              <CardTitle>{currentPageData.title}</CardTitle>
              <CardDescription>{currentPageData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()}>
                {renderFields()}
                <div className="flex justify-between mt-6">
                  {currentPage > 0 && (
                    <Button onClick={handleBack} variant="outline">Back</Button>
                  )}
                  {currentPage < pages.length - 1 ? (
                    <Button onClick={handleContinue}>Continue</Button>
                  ) : (
                    <GradientButton
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      gradient="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit All Data'}
                    </GradientButton>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>                
  );
}