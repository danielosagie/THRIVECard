import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function InputPage2() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    education: '',
    workExperiences: '',
    volunteerExperiences: '',
    lifeExperiences: '',
    skills: '',
  });

  useEffect(() => {
    const savedData = localStorage.getItem('inputPage2Data');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inputPage2Data', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col items-center w-full bg-white">
      <nav className="w-full px-4 py-5 flex justify-between items-center bg-white">
        <Link to="/" className="text-sm text-muted-foreground">&larr; Back to Home</Link>
        <div className="flex items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center justify-center w-8 h-8 text-white bg-[#1a202c] rounded-full mr-2">1</div>
            <span className="font-medium text-[#1a202c] mr-10">Input Information</span>
            <div className="flex items-center justify-center w-8 h-8 text-[#cbd5e0] bg-[#e2e8f0] rounded-full mr-2">2</div>
            <span className="font-medium text-[#cbd5e0] mr-10">Generate & Edit</span>
            <div className="flex items-center justify-center w-8 h-8 text-[#cbd5e0] bg-[#e2e8f0] rounded-full mr-2">3</div>
            <span className="font-medium text-[#cbd5e0]">Save & Export</span>
          </div>
        </div>
        <div></div>
      </nav>
      <div className="flex flex-col items-center w-full max-w-10xl p-8 bg-gray-100 rounded-lg shadow-md mt-8 mx-4" style={{ margin: '20px', width: 'calc(100% - 40px)', height: 'calc(80vh - 40px)' }}>
        <div className="flex flex-col p-8 bg-gray rounded-lg justify-center h-screen w-full max-w-5xl">
          <h2 className="mb-4 text-xl font-semibold">2. Tell us more about your experiences (10-15 minutes)</h2>
          <p className="mb-4 text-gray-600">This form is here to let us get to know you as best we can. We want to know all of your experiences, skills, and aspirations as a military spouse.</p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="education">Education</Label>
              <Textarea 
                id="education" 
                name="education" 
                value={formData.education} 
                onChange={handleInputChange}
                placeholder="Enter Information about you"
              />
            </div>
            <div>
              <Label htmlFor="workExperiences">Work Experiences</Label>
              <Textarea 
                id="workExperiences" 
                name="workExperiences" 
                value={formData.workExperiences} 
                onChange={handleInputChange}
                placeholder="Enter your information"
              />
            </div>
            <div>
              <Label htmlFor="volunteerExperiences">Volunteer Experiences</Label>
              <Textarea 
                id="volunteerExperiences" 
                name="volunteerExperiences" 
                value={formData.volunteerExperiences} 
                onChange={handleInputChange}
                placeholder="Enter your information"
              />
            </div>
            <div>
              <Label htmlFor="lifeExperiences">Life Experiences</Label>
              <Textarea 
                id="lifeExperiences" 
                name="lifeExperiences" 
                value={formData.lifeExperiences} 
                onChange={handleInputChange}
                placeholder="Enter your information"
              />
            </div>
            <div>
              <Label htmlFor="skills">Skills</Label>
              <Textarea 
                id="skills" 
                name="skills" 
                value={formData.skills} 
                onChange={handleInputChange}
                placeholder="Enter your information"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => navigate('/input1')}>Back</Button>
            <Button onClick={() => navigate('/input3')}>Continue</Button>
          </div>
        </div>
      </div>
    </div>
  );
}