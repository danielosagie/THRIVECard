import React from 'react';
import { Link } from 'react-router-dom';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  // You can add any additional props here if needed
}

function UploadIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

export default function InputPage() {
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
          <h2 className="mb-4 text-xl font-semibold">1. Share Your Story:</h2>
          <p className="mb-4 text-gray-600">Describe your experiences, skills, and aspirations as a military spouse.</p>
          <Textarea placeholder="Enter your information" className="w-full mb-4 min-h-[100px]" />
          <div className="flex items-center justify-center w-full p-4 mb-4 border-2 border-dashed rounded-lg border-gray-300">
            <UploadIcon className="mr-2 h-5 w-5 text-gray-500" />
            <span className="text-gray-500">Add a PDF or Docx</span>
          </div>
          <Button className="w-full bg-[#1a202c] text-white">
            <Link to="/generate">Generate Persona</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
