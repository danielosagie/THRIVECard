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
import FileUpload from '@/components/ui/fileupload';
import { StreamingEditableTCard } from "@/components/ui/tcard"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface FormData {
  [key: string]: string | File[] | undefined;
  firstName?: string;
  lastName?: string;
  currentGoals?: string;
  longTermGoals?: string;
  professionalExperience?: string;
  volunteerExperience?: string;
  skills?: string;
  achievements?: string;
  challenges?: string;
  workPreferences?: string;
  experienceLevel?: string;
  uploadedFiles?: File[];
}

interface Field {
  name: string;
  label: string;
  type: 'input' | 'textarea';
  tooltip: string;
  placeholder: string;
  subtext?: string;
}


interface Page {
  title: string;
  navTitle: string;
  description: string;
  fields: Field[];
}

const pages: Page[] = [
  {
    title: "Personal Details",
    navTitle: "Introduction",
    description: "Tell us about yourself and your career goals",
    fields: [
      { name: "firstName", label: "First Name", type: "input", tooltip: "Enter your legal first name", placeholder: "Enter your first name" },
      { name: "lastName", label: "Last Name", type: "input", tooltip: "Enter your legal last name", placeholder: "Enter your last name" },
      { name: "currentGoals", label: "What are your current career goals? (Next 1-2 years)", type: "textarea", tooltip: "Be specific about what you want to achieve in the near future", placeholder: "Describe your current career goals" },
      { name: "longTermGoals", label: "What are your long-term career goals? (5+ years)", type: "textarea", tooltip: "Think about where you want your career to be in 5 years or more", placeholder: "Describe your long-term career goals" },
    ],
  },
  {
    title: "Experience & Skills",
    navTitle: "Background",
    description: "Tell us about your experiences and skills",
    fields: [
      { name: "professionalExperience", label: "Describe your professional experience", type: "textarea", tooltip: "Include relevant work history, internships, and projects", placeholder: "Enter your professional experience" },
      { name: "volunteerExperience", label: "Describe any volunteer experience", type: "textarea", tooltip: "Highlight any unpaid work that demonstrates your skills and values", placeholder: "Enter your volunteer experience" },
      { name: "skills", label: "List your key skills", type: "textarea", tooltip: "Include both technical and soft skills", placeholder: "List your key skills" },
      { name: "achievements", label: "Describe your notable achievements", type: "textarea", tooltip: "Highlight accomplishments that showcase your abilities", placeholder: "Describe your achievements" },
      { name: "challenges", label: "Describe any significant challenges you've overcome", type: "textarea", tooltip: "Explain how you've grown from difficult experiences", subtext: "This helps us understand your resilience and problem-solving abilities.", placeholder: "Describe challenges you've overcome" },
    ],
  },
  {
    title: "Work Preferences",
    navTitle: "Preferences",
    description: "Tell us about your ideal work environment",
    fields: [
      { 
        name: "workPreferences", 
        label: "Describe your ideal work environment and job. What factors are most important to you in a job or workplace?", 
        type: "textarea", 
        tooltip: "Consider factors like work-life balance, company culture, job responsibilities, work schedule, company size, industry, career growth opportunities, and anything else that's important to you.",
        placeholder: "Describe your ideal work environment and important job factors"
      },
    ],
  }
];

export default function AdvancedMultiPageForm() {
  const [formData, setFormData] = useState<FormData>({})
  const [currentPage, setCurrentPage] = useState(0);
  const [pageProgress, setPageProgress] = useState<number[]>([0, 0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPersona, setGeneratedPersona] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ id: number; filename: string }[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadedData = loadFromLocalStorage();
    if (loadedData) {
      setFormData(loadedData);
      updateProgress(loadedData);
    } else {
      fetchData();
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage(formData);
    updateProgress(formData);
  }, [formData]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_input_documents`);
      if (response.data) {
        const mergedData: FormData = {};
        Object.values(response.data).forEach((content: unknown) => {
          if (typeof content === 'string') {
            Object.assign(mergedData, JSON.parse(content));
          }
        });
        setFormData(prevData => ({...prevData, ...mergedData}));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // You might want to show an error message to the user here
    }
  };

  const loadFromLocalStorage = (): FormData | null => {
    const savedData = localStorage.getItem('advancedMultiPageFormData');
    return savedData ? JSON.parse(savedData) as FormData : null;
  };

  const saveToLocalStorage = (data: FormData) => {
    localStorage.setItem('advancedMultiPageFormData', JSON.stringify(data));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const updateProgress = (data: FormData) => {
    const newPageProgress = pages.slice(0, 2).map((page) => {
      const pageFields = page.fields;
      const filledFields = pageFields.filter(field => {
        const value = data[field.name];
        return typeof value === 'string' && value.trim().length > 0;
      }).length;
      return (filledFields / pageFields.length) * 100;
    });
    setPageProgress(newPageProgress);
  };

  const handleExperienceChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      experienceLevel: value
    }));
  };

  const handleFilesChange = (files: File[]) => {
    setFormData(prevData => ({
      ...prevData,
      uploadedFiles: files
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

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await axios.post(`${API_BASE_URL}/upload_file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('File uploaded successfully:', response.data);
        // Update your state or UI as needed
      } catch (error) {
        console.error('Error uploading file:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Server response:', error.response.data);
        }
        // Handle the error (e.g., show an error message to the user)
      }
    }
  };
  
  const handleFileSelection = (fileId: number) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId) 
        : [...prev, fileId]
    );
  };

  const handleFinalSubmit = async () => {
    setIsGenerating(true);
    let fullResponse = "";
    try {
      console.log("Sending request to:", `${API_BASE_URL}/generate_persona_stream`);
      console.log("Request payload:", JSON.stringify({
        input: formData,
        selected_documents: selectedFileIds
      }));
  
      const response = await fetch(`${API_BASE_URL}/generate_persona_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: formData,
          selected_documents: selectedFileIds
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
  
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          const chunk = decoder.decode(value);
          console.log("Received chunk:", chunk);
  
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              console.log("Parsed data:", data);
              if (data.complete) {
                setIsGenerating(false);
                console.log("Generation complete. Persona ID:", data.persona_id);
                navigate('/summary', { state: { personaId: data.persona_id } });
              } else if (data.token) {
                fullResponse += data.token;
                setGeneratedPersona(fullResponse);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating persona:', error);
      setIsGenerating(false);
      alert(`Error generating persona: ${error.message}`);
    }
  };
  

  const renderFields = () => {
    const currentPageData = pages[currentPage];
    return (
      <div className="grid w-full items-center gap-4">
        {currentPage === 1 && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
              <FileUpload 
                onFilesChange={handleFileUpload}
                dropzoneText="Drag & drop your resume here, or click to select file"
                uploadedFilesText="Uploaded Resume:"
                removeFileText="Remove"
                {...uploadedFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Select files for generation:</h3>
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`file-${file.id}`} 
                          checked={selectedFileIds.includes(file.id)}
                          onChange={() => handleFileSelection(file.id)}
                        />
                        <label htmlFor={`file-${file.id}`} className="ml-2">{file.filename}</label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Select files for generation:</h3>
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`file-${file.id}`} 
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => handleFileSelection(file.id)}
                      />
                      <label htmlFor={`file-${file.id}`} className="ml-2">{file.filename}</label>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-center mt-2">OR</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Select your experience level:</h3>
              <Select onValueChange={handleExperienceChange} value={formData.experienceLevel}>
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
          </>
        )}
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
                value={formData[field.name] as string || ''}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className="p-2"
              />
            ) : (
              <Textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] as string || ''}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className={`p-2 ${currentPage === 2 ? 'min-h-[400px]' : 'min-h-[150px]'}`}
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
                {index < 2 && (
                  <Progress className="h-3 flex-grow" value={pageProgress[index]} />
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
              <CardTitle>{pages[currentPage].title}</CardTitle>
              <CardDescription>{pages[currentPage].description}</CardDescription>
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
                      disabled={isGenerating}
                      gradient="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)"
                    >
                      {isGenerating ? 'Generating...' : 'Submit All Data'}
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