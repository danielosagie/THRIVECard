import React, { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';

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
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPersona, setGeneratedPersona] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGeneratePersona = async () => {
    setIsLoading(true);
    try {
      // Save input text
      const inputTextBlob = new Blob([inputText], { type: 'text/plain;charset=utf-8' });
      saveAs(inputTextBlob, `input_text_${Date.now()}.txt`);

      // Save uploaded files
      uploadedFiles.forEach(file => {
        saveAs(file, file.name);
      });

      // Generate persona
      const response = await fetch('http://localhost:5000/generate_persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputText }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setGeneratedPersona(data);

      // Save generated persona
      const personaBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(personaBlob, `persona_v1_${Date.now()}.json`);

    } catch (error) {
      console.error('Error:', error);
      // Handle the error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-white">
      {/* ... (keep the existing navigation) */}
      <div className="flex flex-col items-center w-full max-w-10xl p-8 bg-gray-100 rounded-lg shadow-md mt-8 mx-4" style={{ margin: '20px', width: 'calc(100% - 40px)', height: 'calc(80vh - 40px)' }}>
        <div className="flex flex-col p-8 bg-gray rounded-lg justify-center h-screen w-full max-w-5xl">
          <h2 className="mb-4 text-xl font-semibold">1. Share Your Story:</h2>
          <p className="mb-4 text-gray-600">Describe your experiences, skills, and aspirations as a military spouse.</p>
          <Textarea 
            placeholder="Enter your information" 
            className="w-full mb-4 min-h-[100px]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div 
            className="flex items-center justify-center w-full p-4 mb-4 border-2 border-dashed rounded-lg border-gray-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="mr-2 h-5 w-5 text-gray-500" />
            <span className="text-gray-500">Add a PDF or Docx</span>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              multiple
            />
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold">Uploaded Files:</h3>
              <ul>
                {uploadedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          <Button 
            className="w-full bg-[#1a202c] text-white"
            onClick={handleGeneratePersona}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Persona'}
          </Button>
          {generatedPersona && (
            <Link to="/generate">
            <div className="mt-4">
              <h3 className="font-semibold">Generated Persona:</h3>
              <pre className="bg-gray-200 p-4 rounded-lg mt-2 overflow-auto">
                {JSON.stringify(generatedPersona, null, 2)}
              </pre>
            </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}