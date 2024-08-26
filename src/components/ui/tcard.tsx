import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { TagInput, Tag } from 'emblor';
import axios from 'axios';

interface Persona {
  name: string;
  professional_summary: string;
  qualifications_and_education: string[];
  goals: string[];
  skills: string[];
  life_experiences: string[];
  strengths: string[];
  value_proposition: string[];
  [key: string]: string | string[];
}

interface StreamingEditableTCardProps {
  personaId: string | number;
}

export function StreamingEditableTCard({ personaId }: StreamingEditableTCardProps) {
  const [persona, setPersona] = useState<Persona>({
    name: '',
    professional_summary: '',
    qualifications_and_education: [],
    goals: [],
    skills: [],
    life_experiences: [],
    strengths: [],
    value_proposition: []
  });
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchPersona = async () => {
      const response = await axios.get(`/api/get_persona/${personaId}`);
      setPersona(response.data);
    };

    fetchPersona();

    // Set up SSE for real-time updates
    const eventSource = new EventSource(`/api/stream_persona_updates/${personaId}`);
    eventSource.onmessage = (event) => {
      const updatedData = JSON.parse(event.data);
      setPersona(prevPersona => ({ ...prevPersona, ...updatedData }));
    };

    return () => {
      eventSource.close();
    };
  }, [personaId]);

  const updateCategory = async (category: keyof Persona, newTags: Tag[]) => {
    const updatedPersona = { ...persona, [category]: newTags.map(tag => tag.text) };
    setPersona(updatedPersona);
    await axios.post(`/api/update_persona/${personaId}`, { [category]: newTags.map(tag => tag.text) });
  };

  const renderTagInput = (category: keyof Persona, label: string) => (
    <div className="bg-gray-800 p-6 rounded-md">
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      <TagInput
        tags={(persona[category] as string[]).map((tag, index) => ({ id: index.toString(), text: tag }))}
        setTags={(newTags) => {
          updateCategory(category, newTags);
          return newTags; // This ensures we're returning the new state as expected by useState
        }}
        placeholder={`Add ${label.toLowerCase()}`}
        styleClasses={{
          container: 'w-full bg-gray-700 text-white',
          tag: 'bg-blue-600 text-white',
        }}
        activeTagIndex={activeTagIndex}
        setActiveTagIndex={setActiveTagIndex}
      />
    </div>
  );

  return (
    <div className="p-6 bg-gray-900 rounded-md text-white space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-md">
          <h2 className="text-xl font-bold">{persona.name}</h2>
          <p className="mt-2">{persona.professional_summary}</p>
        </div>
        {renderTagInput('qualifications_and_education', 'Qualifications and Education')}
        {renderTagInput('goals', 'Goals')}
        {renderTagInput('skills', 'Skills')}
        {renderTagInput('life_experiences', 'Life Experiences')}
        {renderTagInput('strengths', 'Strengths')}
        {renderTagInput('value_proposition', 'Value Proposition')}
      </div>
    </div>
  );
}