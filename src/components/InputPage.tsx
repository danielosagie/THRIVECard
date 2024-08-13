import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function InputPage() {
  const navigate = useNavigate();

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
        <div className="flex flex-col p-8 bg-white rounded-lg justify-center w-full max-w-5xl">
          <h2 className="mb-4 text-2xl font-semibold">Welcome to THRIVECard</h2>
          <p className="mb-6 text-gray-600">This form is here to let us get to know you as best we can. We want to know all of your experiences, skills, and aspirations as a military spouse.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Introduction & Goals</CardTitle>
                <CardDescription>5-10 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Tell us about yourself and your career aspirations.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Experiences & Skills</CardTitle>
                <CardDescription>10-15 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Share your educational background, work history, and skills.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Preferences & Constraints</CardTitle>
                <CardDescription>5-10 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Help us understand your work preferences and any constraints.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Review & Additional Info</CardTitle>
                <CardDescription>5 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Review your inputs and add any additional information.</p>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            className="w-full max-w-md mx-auto bg-[#1a202c] text-white"
            onClick={() => navigate('/input1')}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}