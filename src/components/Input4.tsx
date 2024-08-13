import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { X, Check, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Input4() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    additionalInfo: '',
    uploadedFiles: [] as string[],
    generationMethod: 'ollama',
    hfEndpoint: '',
    hfToken: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load persisted data from localStorage
    const savedData = localStorage.getItem('input4Data');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    fetchUploadedFiles();
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem('input4Data', JSON.stringify(formData));
  }, [formData]);

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get_uploaded_files');
      setFormData(prev => ({ ...prev, uploadedFiles: response.data.files }));
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const initializeLLM = async (method: string) => {
    try {
      let response;
      if (method === 'ollama') {
        response = await axios.post('http://localhost:5000/initialize_ollama');
      } else if (method === 'hf_endpoint') {
        response = await axios.post('http://localhost:5000/initialize_hf_endpoint', { 
          endpoint: formData.hfEndpoint,
          token: formData.hfToken
        });
      } else {
        throw new Error('Invalid generation method');
      }

      toast({
        title: `${method === 'ollama' ? 'Ollama' : 'HuggingFace Endpoint'} Initialized`,
        description: response.data.message,
        duration: 3000,
      });

      // Stream test message
      const testResponse = await axios.post('http://localhost:5000/test_llm', { method });
      toast({
        title: "Test Message",
        description: testResponse.data.message,
        duration: 5000,
      });
    } catch (error) {
      console.error(`Failed to initialize ${method === 'ollama' ? 'Ollama' : 'HuggingFace Endpoint'}:`, error);
      toast({
        title: `${method === 'ollama' ? 'Ollama' : 'HuggingFace Endpoint'} Initialization Failed`,
        description: "Check the console for more details.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadPromises = acceptedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await axios.post('http://localhost:5000/upload', formData);
        return response.data.filename;
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    });
  
    try {
      await Promise.all(uploadPromises);
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleGeneratePersona = async () => {
    setIsLoading(true);
    try {
      // Save input text as a document
      await axios.post('http://localhost:5000/save_input', { input: formData.additionalInfo });

      const response = await axios.post('http://localhost:5000/generate_persona', {
        input: formData.additionalInfo,
        generation_method: formData.generationMethod,
        hf_endpoint: formData.hfEndpoint,
        hf_token: formData.hfToken
      });

      navigate('/generate', { state: { persona: response.data } });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate persona. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="mb-4 text-xl font-semibold">4. Any Additional Information?</h2>
          <p className="mb-4 text-gray-600">Describe anything else about your experiences, skills, and aspirations as a military spouse.</p>
          <Textarea 
            placeholder="Enter your additional information" 
            className="w-full mb-4 min-h-[100px]"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
          />
          <div 
            {...getRootProps()} 
            className={`flex items-center justify-center w-full p-4 mb-4 border-2 border-dashed rounded-lg cursor-pointer ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5 text-gray-500" />
                <span className="text-gray-500">Drag & drop files here, or click to select files</span>
              </>
            )}
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Uploaded Files:</h3>
            {formData.uploadedFiles.map((file) => (
              <div key={file} className="flex items-center justify-between mb-1">
                <span>{file}</span>
              </div>
            ))}
          </div>
          <div className="w-full max-w-md">
            <Select 
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, generationMethod: value }));
                initializeLLM(value);
              }} 
              value={formData.generationMethod}
            >
              <SelectTrigger className="w-full mb-2">
                <SelectValue placeholder="Select generation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="hf_endpoint">HuggingFace Endpoint</SelectItem>
              </SelectContent>
            </Select>
            
            {formData.generationMethod === 'hf_endpoint' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mb-2">
                    Set HuggingFace Endpoint and Token
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">HuggingFace Endpoint</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter the URL for your HuggingFace Endpoint
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Input
                        id="hf-endpoint"
                        name="hfEndpoint"
                        value={formData.hfEndpoint}
                        onChange={handleInputChange}
                        placeholder="https://183:8900"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">HuggingFace API Token</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter your HuggingFace API Token
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Input
                        id="hf-token"
                        name="hfToken"
                        type="password"
                        value={formData.hfToken}
                        onChange={handleInputChange}
                        placeholder="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"
                      />
                    </div>
                    <Button onClick={() => initializeLLM('hf_endpoint')}>
                      Initialize HuggingFace Endpoint
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <div className="flex justify-between mt-6">
              <Button onClick={() => navigate(-1)}>Back</Button>
              <Button 
                onClick={handleGeneratePersona}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Persona'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}