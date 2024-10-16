import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExperienceCard from './ExperienceCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API_BASE_URL:", API_BASE_URL);

const ViewPage: React.FC = () => {
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get_all_personas`);
        console.log('Fetched personas:', response.data);
        setPersonas(response.data);
        if (response.data.length > 0) {
          setSelectedPersonaId(response.data[0].id);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching personas:', err);
        setError('Failed to load personas. Please try again.');
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const handlePersonaChange = (personaId: string) => {
    setSelectedPersonaId(personaId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const selectedPersona = personas.find(persona => persona.id === selectedPersonaId);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Experience Card</h1>
      <Select onValueChange={handlePersonaChange} value={selectedPersonaId || undefined}>
        <SelectTrigger className="w-[200px] mb-4">
          <SelectValue placeholder="Select a persona" />
        </SelectTrigger>
        <SelectContent>
          {personas.map(persona => (
            <SelectItem key={persona.id} value={persona.id}>
              {persona.firstName} {persona.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedPersona && <ExperienceCard persona={selectedPersona} />}
    </div>
  );
};

export default ViewPage;
