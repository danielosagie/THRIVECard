import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PersonaData {
  firstName: string;
  lastName: string;
  summary: string;
  qualifications: string[];
  goals: string[];
  skills: string[];
  nextSteps: string[];
  strengths: string[];
  lifeExperiences: string[];
  valueProposition: string[];
}

interface ExperienceCardProps {
  persona: PersonaData;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ persona }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPersona, setEditedPersona] = useState(persona);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPersona(prev => ({ ...prev, [name]: value }));
  };

  const renderSection = (title: string, content: string | string[]) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {isEditing ? (
        Array.isArray(content) ? (
          content.map((item, index) => (
            <Input
              key={index}
              name={`${title.toLowerCase()}[${index}]`}
              value={item}
              onChange={handleInputChange}
              className="mb-2"
            />
          ))
        ) : (
          <Textarea
            name={title.toLowerCase()}
            value={content}
            onChange={handleInputChange}
            className="w-full"
          />
        )
      ) : (
        Array.isArray(content) ? (
          <ul className="list-disc pl-5">
            {content.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>{content}</p>
        )
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Button variant={isEditing ? "outline" : "default"} onClick={handleEdit}>Edit</Button>
            <Button variant={isEditing ? "default" : "outline"} onClick={handleSave} className="ml-2">View</Button>
          </div>
          <div className="text-sm text-gray-500">
            Last autosave at 10:34 am - alice_vuong_v3
          </div>
          <Button variant="outline">Export</Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">{`${editedPersona.firstName} ${editedPersona.lastName}`}</h2>
            {renderSection("Summary", editedPersona.summary)}
            {renderSection("Goals", editedPersona.goals)}
            {renderSection("Next Steps", editedPersona.nextSteps)}
            {renderSection("Life Experiences", editedPersona.lifeExperiences)}
          </div>
          <div>
            {renderSection("Qualifications and Education", editedPersona.qualifications)}
            {renderSection("Skills", editedPersona.skills)}
            {renderSection("Strengths", editedPersona.strengths)}
            {renderSection("Value Proposition", editedPersona.valueProposition)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperienceCard;
