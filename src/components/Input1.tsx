import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import FileUpload from '@/components/ui/fileupload';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { API_BASE_URL } from '../config';


console.log("API_BASE_URL:", API_BASE_URL);

interface FormData {
  [key: string]: string | string[] | File[] | undefined;
  firstName?: string;
  lastName?: string;
  ageRange?: string;
  careerJourney?: string[];
  careerGoals?: string;
  education?: string;
  fieldOfStudy?: string[];
  additionalTraining?: string;
  technicalSkills?: string;
  creativeSkills?: string;
  otherSkills?: string;
  workExperiences?: string;
  volunteerExperiences?: string;
  militaryLifeExperiences?: string;
  transportation?: string;
  driveDistance?: string;
  relocationPlans?: string;
  workTypePreference?: string;
  workSchedulePreference?: string;
  idealHoursPerWeek?: string;
  regularCommitments?: string;
  stressManagement?: string;
  additionalInformation?: string;
  supportingDocuments?: File[];
}

const pages = [
  {
    title: "Getting to know you",
    navTitle: "Personal Info",
    description: "Tell us about yourself and your career goals",
    fields: [
      { name: "firstName", label: "First Name", type: "input", required: true },
      { name: "lastName", label: "Last Name", type: "input" },
      { name: "ageRange", label: "Which age range do you fit into?", type: "select", required: true, options: [
        "18-24", "25-34", "35-44", "45-54", "55+"
      ]},
      { name: "careerJourney", label: "Where are you in your career or employment journey?", type: "checkbox", options: [
        "Actively job searching", "Exploring a new career", "Re-starting my career", "Finding out who I am", "Other"
      ]},
      { name: "careerGoals", label: "What are your current career goals? List any positions and/or industries you are interested in.", type: "textarea" },
    ],
  },
  {
    title: "Share your education and skills",
    navTitle: "Education & Skills",
    description: "Tell us about your educational background and skills",
    fields: [
      { name: "education", label: "What is the highest degree you've completed?", type: "select", options: [
        "High School", "Associate's", "Bachelor's", "Master's", "Doctorate", "Other"
      ]},
      { name: "fieldOfStudy", label: "What did you study? (You can choose more than one.)", type: "checkbox", options: [
        "General Studies", "Business", "Engineering", "Computer Science", "Arts", "Sciences", "Other"
      ]},
      { name: "additionalTraining", label: "Have you received any additional training or certifications?", type: "textarea" },
      { name: "technicalSkills", label: "What are your strongest technical skills?", type: "textarea" },
      { name: "creativeSkills", label: "What creative skills do you enjoy using?", type: "textarea" },
      { name: "otherSkills", label: "Are there any other skills you're proud of?", type: "textarea" },
    ],
  },
  {
    title: "Reflect on your experiences",
    navTitle: "Experiences",
    description: "Tell us about your work, volunteer, and life experiences",
    fields: [
      { name: "workExperiences", label: "Work Experiences", type: "textarea" },
      { name: "volunteerExperiences", label: "Volunteer Experiences", type: "textarea" },
      { name: "militaryLifeExperiences", label: "Military Life Experiences", type: "textarea" },
    ],
  },
  {
    title: "Consider your preferences",
    navTitle: "Preferences",
    description: "Tell us about your work preferences and constraints",
    fields: [
      { name: "transportation", label: "Do you currently have access to a car or reliable transportation?", type: "select", options: ["Yes", "No"] },
      { name: "driveDistance", label: "If yes, how far away would you be willing to drive to work? (In minutes)", type: "input" },
      { name: "relocationPlans", label: "How long do you plan on staying in this area?", type: "input" },
      { name: "workTypePreference", label: "Which type of work do you prefer?", type: "select", options: ["Remote", "In-person", "Hybrid"] },
      { name: "workSchedulePreference", label: "What type of work schedule do you prefer?", type: "select", options: ["Full-time", "Part-time", "Flexible"] },
      { name: "idealHoursPerWeek", label: "How many hours per week would you ideally like to work?", type: "input" },
      { name: "regularCommitments", label: "Do you have any regular commitments that impact your availability?", type: "textarea" },
      { name: "stressManagement", label: "How do you manage stress related to balancing work and family responsibilities?", type: "textarea" },
    ],
  },
  {
    title: "Review your submission",
    navTitle: "Review",
    description: "Review and finalize your information",
    fields: [
      { name: "additionalInformation", label: "Is there anything else you would like to add?", type: "textarea" },
      { name: "supportingDocuments", label: "Upload supporting documents (resume, cover letter, etc.)", type: "file" },
    ],
  },
];

const GenerationSettingsSheet = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleSliderChange = (name, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [name]: value[0],
      default_prompt: prev.default_prompt.replace(`{${name}_slider}`, value[0])
    }));
  };


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent position="right" size="lg">
        <SheetHeader>
          <SheetTitle>Generation Settings</SheetTitle>
          <SheetDescription>Adjust the settings for persona generation</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">
              Provider
            </Label>
            <Select
              value={localSettings.provider}
              onValueChange={(value) => setLocalSettings({ ...localSettings, provider: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Groq">Groq</SelectItem>
                <SelectItem value="Ollama">Ollama</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api_key" className="text-right">
              API Key
            </Label>
            <Input
              id="api_key"
              value={localSettings.api_key}
              onChange={(e) => setLocalSettings({ ...localSettings, api_key: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => setLocalSettings({ ...localSettings, model: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama3-8b-8192">llama3-8b-8192</SelectItem>
                <SelectItem value="llama3-13b-8192">llama3-13b-8192</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Creativity</Label>
            <Slider
              value={[localSettings.creativity]}
              onValueChange={(value) => handleSliderChange('creativity', value)}
              max={1}
              step={0.01}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Realism</Label>
            <Slider
              value={[localSettings.realism]}
              onValueChange={(value) => handleSliderChange('realism', value)}
              max={1}
              step={0.01}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="default_prompt" className="text-right">
              Default Prompt
            </Label>
            <Textarea
              id="default_prompt"
              value={localSettings.default_prompt}
              onChange={(e) => setLocalSettings({ ...localSettings, default_prompt: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleSave}>Save Generation Settings</Button>
      </SheetContent>
    </Sheet>
  );
};


const ReviewAccordion = ({ formData }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {pages.map((page, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger>{page.title}</AccordionTrigger>
          <AccordionContent>
            {page.fields.map((field) => (
              <div key={field.name} className="mb-2">
                <Label>{field.label}</Label>
                <div className="mt-1">
                  {Array.isArray(formData[field.name])
                    ? formData[field.name].join(', ')
                    : formData[field.name] || 'Not provided'}
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};


export default function AdvancedMultiPageForm() {
  const [formData, setFormData] = useState<FormData>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageProgress, setPageProgress] = useState<number[]>(new Array(pages.length).fill(0));
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [generationSettings, setGenerationSettings] = useState(() => {
    const savedSettings = localStorage.getItem('generationSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      provider: 'Groq',
      api_key: '',
      model: 'llama3-8b-8192',
      creativity: 0.5,
      realism: 0.5,
      default_prompt: `Create a professional profile card for a job seeker using the following structure. Adapt the language and tone to reflect the individual's communication style while maintaining a professional demeanor. On a sliding scale 0 to 1.0, I want you consider and respond with these desired settings in mind (Creativity: {creativity_slider} and Realism: {realism_slider}). Use the provided responses and any additional data to craft a concise yet comprehensive overview consider those guiding rubric statistics from before for your answer: Personal Information Full name A brief, impactful professional summary highlighting key strengths and experience Qualifications and Education List relevant years of experience in key areas Highlight highest level of education and any pertinent certifications Career Goals Outline primary career aspirations and target roles or industries Skills and Preferences List top technical and soft skills Note any industry or work style preferences (e.g., remote work, flexible hours) Highlight any unique abilities or expertise Professional Development Plans Mention immediate career development goals Include any plans for further education or networking Key Strengths Emphasize 3-5 standout professional or personal strengths Relevant Life Experiences Highlight personal experiences that enhance professional capabilities Showcase adaptability, resilience, or other qualities gained from life experiences Mention any significant volunteer work or community involvement Unique Value Proposition Articulate what makes the candidate uniquely valuable to potential employers Emphasize long-term potential and diverse perspectives Format the card for clarity and impact: Use bullet points for easy readability Bold key phrases or skills to draw attention Ensure the overall length is concise (aim for one page equivalent) Tailor the content to align with the job seeker's target industry or role Incorporate all relevant information from the provided responses and any additional data, but prioritize the most impactful and relevant details. The goal is to create a compelling snapshot of the job seeker that highlights their unique qualities and potential value to employers.`
    };
  });

  const handleSaveGenerationSettings = (newSettings) => {
    setGenerationSettings(newSettings);
    localStorage.setItem('generationSettings', JSON.stringify(newSettings));
  };

  useEffect(() => {
    const loadedData = loadFromLocalStorage();
    if (loadedData) {
      setFormData(loadedData);
      updateProgress(loadedData);
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage(formData);
    updateProgress(formData);
  }, [formData]);

  const loadFromLocalStorage = (): FormData | null => {
    const savedData = localStorage.getItem('advancedMultiPageFormData');
    return savedData ? JSON.parse(savedData) as FormData : null;
  };

  const saveToLocalStorage = (data: FormData) => {
    const dataToSave = { ...data };
    delete dataToSave.supportingDocuments;
    localStorage.setItem('advancedMultiPageFormData', JSON.stringify(dataToSave));
  };

  const updateProgress = (data: FormData) => {
    const newProgress = pages.map((page) => {
      const filledFields = page.fields.filter((field) => {
        if (Array.isArray(data[field.name])) {
          return (data[field.name] as (string | File)[]).length > 0;
        }
        return !!data[field.name];
      }).length;
      return (filledFields / page.fields.length) * 100;
    });
    setPageProgress(newProgress);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      saveToLocalStorage(newData);
      return newData;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      saveToLocalStorage(newData);
      return newData;
    });
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData((prevData) => {
      const currentValues = prevData[name] as string[] || [];
      const newData = {
        ...prevData,
        [name]: checked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value)
      };
      saveToLocalStorage(newData);
      return newData;
    });
  };

  const handleFileUpload = (files: File[]) => {
    
    setFormData((prevData) => ({ ...prevData, supportingDocuments: files }));
  };

  const handleContinue = async () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      try {
        setError(null);
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (value[0] instanceof File) {
              value.forEach((file: File) => formDataToSend.append(key, file));
            } else {
              formDataToSend.append(key, JSON.stringify(value));
            }
          } else if (value !== undefined) {
            formDataToSend.append(key, value.toString());
          }
        });

        formDataToSend.append('generation_settings', JSON.stringify(generationSettings));

        console.log("Sending request to:", `${API_BASE_URL}/generate_persona_stream`);
        const response = await fetch(`${API_BASE_URL}/generate_persona_stream`, {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        let generatedPersona = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          generatedPersona += chunk;
          // You might want to update some state here to show progress
        }

        // Store the generated persona in localStorage or state management
        localStorage.setItem('generatedPersona', generatedPersona);

        console.log("Navigating to /generate");
        navigate('/generate');
      } catch (error) {
        console.error('Error generating persona:', error);
        setError('An error occurred while generating the persona. Please try again.');
      }
    }
  };
  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderFields = () => {
    const currentPageData = pages[currentPage];
    return (
      <div className="space-y-4">
        {currentPageData.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && '*'}</Label>
            {field.type === 'input' && (
              <Input
                id={field.name}
                name={field.name}
                value={formData[field.name] as string || ''}
                onChange={handleInputChange}
                required={field.required}
              />
            )}
            {field.type === 'textarea' && (
              <Textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] as string || ''}
                onChange={handleInputChange}
                required={field.required}
              />
            )}
            {field.type === 'select' && (
              <Select onValueChange={(value) => handleSelectChange(field.name, value)} value={formData[field.name] as string}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === 'checkbox' && (
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.name}-${option}`}
                      checked={(formData[field.name] as string[] || []).includes(option)}
                      onCheckedChange={(checked) => handleCheckboxChange(field.name, option, checked as boolean)}
                    />
                    <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
                  </div>
                ))}
              </div>
            )}
            {field.type === 'file' && (
              <FileUpload
                onFilesChange={handleFileUpload}
                dropzoneText="Drag & drop files here, or click to select files"
                uploadedFilesText="Uploaded Files:"
                removeFileText="Remove"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{pages[currentPage].title}</CardTitle>
        <CardDescription>{pages[currentPage].description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Progress value={pageProgress[currentPage]} className="w-full" />
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {currentPage === pages.length - 1 ? (
            <ReviewAccordion formData={formData} />
          ) : (
            renderFields()
          )}
          <div className="flex justify-between items-center">
            <Button onClick={handleBack} disabled={currentPage === 0}>Back</Button>
            <div className="flex items-center space-x-2">
              <Button onClick={handleContinue}>{currentPage === pages.length - 1 ? 'Generate Card' : 'Continue'}</Button>
              {currentPage === pages.length - 1 && (
                <GenerationSettingsSheet
                  settings={generationSettings}
                  onSave={handleSaveGenerationSettings}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
