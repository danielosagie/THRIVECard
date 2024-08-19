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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FileUpload from '@/components/ui/fileupload'; // Adjust the import path as needed

const API_BASE_URL = 'http://localhost:5000';

const pages = [
  {
    title: "Personal Details",
    navTitle: "Introduction",
    description: "Tell us about yourself and your career goals",
    fields: [
      { name: "firstName", label: "First Name", type: "input", tooltip: "Enter your legal first name" },
      { name: "lastName", label: "Last Name", type: "input", tooltip: "Enter your legal last name" },
      { name: "currentGoals", label: "What are your current career goals? (Next 1-2 years)", type: "textarea", tooltip: "Be specific about what you want to achieve in the near future" },
      { name: "longTermGoals", label: "What are your long-term career goals? (5+ years)", type: "textarea", tooltip: "Think about where you want your career to be in 5 years or more" },
    ],
    layout: (fields, handleInputChange, formData) => (
      <div className="grid grid-cols-1 gap-4">
        <div className="flex gap-10">
          {fields.slice(0, 2).map(field => (
            <div key={field.name} className="flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor={field.name} className="flex items-center">
                      {field.label} <span className="ml-1 text-gray-400">ⓘ</span>
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor={field.name} className="flex items-center">
                    {field.label} <span className="ml-1 text-gray-400">ⓘ</span>
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{field.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
      { name: "professionalExperience", label: "Describe your professional experience", type: "textarea", tooltip: "Include relevant work history, internships, and projects" },
      { name: "volunteerExperience", label: "Describe any volunteer experience", type: "textarea", tooltip: "Highlight any unpaid work that demonstrates your skills and values" },
      { name: "skills", label: "List your key skills", type: "textarea", tooltip: "Include both technical and soft skills" },
      { name: "achievements", label: "Describe your notable achievements", type: "textarea", tooltip: "Highlight accomplishments that showcase your abilities" },
      { name: "challenges", label: "Describe any significant challenges you've overcome", type: "textarea", tooltip: "Explain how you've grown from difficult experiences", subtext: "This helps us understand your resilience and problem-solving abilities." },
    ],
    layout: (fields, handleInputChange, formData, handleExperienceChange, handleFilesChange) => (
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
          <FileUpload 
            onFilesChange={handleFilesChange}
            dropzoneText="Drag & drop your resume here, or click to select file"
            uploadedFilesText="Uploaded Resume:"
            removeFileText="Remove"
          />
          <p className="text-center mt-2">OR</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Select your experience level:</h3>
          <Select onValueChange={(value) => handleExperienceChange(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="border-t border-b py-4 my-4">
          {fields.map((field) => (
            <div key={field.name} className="mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor={field.name} className="flex items-center">
                      {field.label} <span className="ml-1 text-gray-400">ⓘ</span>
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
              />
              {field.subtext && (
                <p className="text-sm text-gray-500 mt-1">{field.subtext}</p>
              )}
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
      { name: "workPreferences", label: "Describe your ideal work environment", type: "textarea", tooltip: "Consider factors like work-life balance, company culture, and job responsibilities" },
    ]
  }
];

export default function AdvancedMultiPageForm() {
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
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
    updateProgress();
  };

  const handleExperienceChange = (value) => {
    setFormData(prevData => ({
      ...prevData,
      experienceLevel: value
    }));
    updateProgress();
  };

  const handleFilesChange = (files) => {
    setFormData(prevData => ({
      ...prevData,
      uploadedFiles: files
    }));
    updateProgress();
  };

  const updateProgress = () => {
    const totalFields = pages.reduce((acc, page) => acc + page.fields.length, 0);
    const filledFields = Object.values(formData).filter(value => value && value.length > 0).length;
    const newProgress = (filledFields / totalFields) * 100;
    setProgress(newProgress);
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
      return currentPageData.layout(currentPageData.fields, handleInputChange, formData, handleExperienceChange, handleFilesChange);
    }

    return (
      <div className="grid w-full items-center gap-4">
        {currentPageData.fields.map((field) => (
          <div key={field.name} className="flex flex-col space-y-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor={field.name} className="flex items-center">
                    {field.label} <span className="ml-1 text-gray-400">ⓘ</span>
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{field.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            {field.subtext && (
              <p className="text-sm text-gray-500 mt-1">{field.subtext}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

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
                  <Progress className="h-3 flex-grow" value={progress} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>
      <div className="flex flex-col items-center w-full max-w-10xl p-8 bg-gray-100 rounded-lg shadow-md mt-8 mx-4" style={{ margin: '20px', width: 'calc(100% - 40px)'}}>
        <div className="flex flex-col p-8 bg-gray-100 rounded-lg justify-center w-full max-w-5xl">
          <Card className="max-w-2xl mx-auto">
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