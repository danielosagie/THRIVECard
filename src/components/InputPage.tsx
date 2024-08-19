import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { JSX } from 'react/jsx-runtime';
import { Progress } from "@/components/ui/progress"
import GradientButton from '@/components/ui/gradientbutton';
import confusion from "../assets/confusion.svg"
import document from "../assets/document.svg"
import think from "../assets/think.svg"
import honest from "../assets/honest.svg"

export default function InputPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center w-full bg-white">
      <nav className="w-full px-4 py-5 pl-20 pr-20 bg-white">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center w-full justify-between space-x-4 md:space-x-8">
            <div className='flex flex-col items-center gap-4'>
              <div className="flex items-center justify-center w-8 h-8 text-white bg-[#1a202c] rounded-full">
                1
              </div>
              <span className="font-medium text-[#1a202c] text-center whitespace-nowrap">
                Introduction & Goals
              </span>
            </div>
            <Progress className="h-3" value={0} />
            <div className='flex flex-col items-center gap-4'>
              <div className="flex items-center justify-center w-8 h-8 text-[#cbd5e0] bg-[#e2e8f0] rounded-full">
                2
              </div>
              <span className="font-medium text-[#cbd5e0] text-center whitespace-nowrap">
                Experiences & Skills
              </span>
            </div>
            <Progress className="h-3" value={0} />
            <div className='flex flex-col items-center gap-4'>
              <div className="flex items-center justify-center w-8 h-8 text-[#cbd5e0] bg-[#e2e8f0] rounded-full">
                3
              </div>
              <span className="font-medium text-[#cbd5e0] text-center whitespace-nowrap">
                Preferences
              </span>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex flex-col items-center w-full max-w-10xl p-8 bg-gray-100 rounded-lg shadow-md mt-8 mx-4" style={{ margin: '20px', width: 'calc(100% - 40px)'}}>
        <div className="flex flex-col p-8 bg-gray-100 rounded-lg justify-center w-full max-w-5xl">
          <h2 className="text-2xl font-bold items-center mb-4">Welcome to your THRIVE Toolkit!</h2>
          <p className="text-gray-700 mb-6">
            With the power of self-reflection and AI, craft an Experience Card and resume bullets that highlight your
            value to employers. To start, help us understand your journey by sharing your experiences, skills, and goals.
          </p>
          <h3 className="text-xl font-semibold mb-4">How to get the most out of your THRIVECard:</h3>
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-white gap-3 rounded-lg shadow-sm p-3 items-center">
              <img src={document} alt="Document icon" className="p-2 justify-center items-center mr-4" />
              <div>
                <h4 className="text-lg font-semibold">More Info = Better Results</h4>
                <p className="text-gray-600">
                  Please fill out as much of the form as possible - providing more relevant information will help
                  personalize your results.
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 gap-3 bg-white rounded-lg shadow-sm p-3 items-center">
              <img src={confusion} alt="Confusion icon" className="p-2 justify-center items-center mr-4" />
              <div>
                <h4 className="text-lg font-semibold">Don't get stuck</h4>
                <p className="text-gray-600">
                  Focus on what you know, and don't worry if you can't answer every question. You can always update your
                  responses later.
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 gap-3 bg-white rounded-lg shadow-sm p-3 items-center">
              <img src={honest} alt="Honest icon" className="p-2 justify-center items-center mr-4" />
              <div>
                <h4 className="text-lg font-semibold">No sugarcoating here</h4>
                <p className="text-gray-600">
                  Being honest about your constraints and preferences helps us guide you in creating a powerful value
                  proposition based on your unique experiences.
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-white gap- rounded-lg shadow-sm p-3 items-center">
              <img src={think} alt="Think icon" className="p-2 justify-center items-center mr-4" />
              <div>
                <h4 className="text-lg font-semibold">Don't limit yourself</h4>
                <p className="text-gray-600">
                  When listing your experience, think beyond traditional job titles - consider all of your background
                  including volunteering, daily life tasks, and personal projects.
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-6">
            Your privacy is our priority: All data is stored locally and never shared or tracked.
          </p>
          <div className="flex mt-6 space-x-4">
    
            <Link to="/">
              <Button className="text-white bg-slate-900">Learn More about THRIVE Toolkit</Button>
            </Link>

            <Link to="/input1">
              <GradientButton 
                gradient="linear-gradient(to right, #70e2ff, #cd93ff)" 
                onClick={() => console.log('Start Button Clicked')}
              >
                Get Started
              </GradientButton>
            </Link>
          
          </div>
        </div>
      </div>
    </div>
  );
}
