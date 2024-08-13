import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FormData {
  // Define all your form fields here
  firstName: string;
  lastName: string;
  currentGoals: string;
  longTermGoals: string;
  education: string;
  workExperiences: string;
  volunteerExperiences: string;
  lifeExperiences: string;
  skills: string;
  militaryBase: string;
  hasCar: string;
  driveDistance: string;
  alternateTransportation: string;
  preferredCommute: string;
  transportationDifficulty: string;
  hasChildren: string;
  childcareType: string;
  childcareDistance: string;
  childcareCost: string;
  specialNeeds: string;
  stayDuration: string;
  openToRelocation: string;
  relocationImpact: string;
  remoteWorkImportance: string;
  stressManagement: string;
  resourceStruggle: string;
  additionalInfo: string;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (newData: Partial<FormData>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>({
    // Initialize all form fields here
    firstName: '',
    lastName: '',
    currentGoals: '',
    longTermGoals: '',
    education: '',
    workExperiences: '',
    volunteerExperiences: '',
    lifeExperiences: '',
    skills: '',
    militaryBase: '',
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
    resourceStruggle: '',
    additionalInfo: '',
  });

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormData = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormProvider');
  }
  return context;
};