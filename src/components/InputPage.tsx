import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios, { AxiosProgressEvent } from 'axios';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Check, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Combobox, ComboboxItem } from "@/components/ui/combobox"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  // You can add any additional props here if needed
}

interface ComboboxItem {
  label: string;
  value: string;
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
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; progress: number; enabled: boolean }[]>([]);
  const [generationMethod, setGenerationMethod] = useState('ollama');
  const [hfEndpoint, setHfEndpoint] = useState('');
  const [hfToken, setHfToken] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load persisted data from localStorage
    const savedInput = localStorage.getItem('inputText');
    if (savedInput) setInputText(savedInput);

    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) setUploadedFiles(JSON.parse(savedFiles));

    const savedMethod = localStorage.getItem('generationMethod');
    if (savedMethod) setGenerationMethod(savedMethod);

    const savedEndpoint = localStorage.getItem('hfEndpoint');
    if (savedEndpoint) setHfEndpoint(savedEndpoint);

    const savedToken = localStorage.getItem('hfToken');
    if (savedToken) setHfToken(savedToken);
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem('inputText', inputText);
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('generationMethod', generationMethod);
    localStorage.setItem('hfEndpoint', hfEndpoint);
    localStorage.setItem('hfToken', hfToken);
  }, [inputText, uploadedFiles, generationMethod, hfEndpoint, hfToken]);

  const initializeLLM = async (method: string) => {
    try {
      let response;
      if (method === 'ollama') {
        response = await axios.post('http://localhost:5000/initialize_ollama');
      } else if (method === 'hf_endpoint') {
        response = await axios.post('http://localhost:5000/initialize_hf_endpoint', { 
          endpoint: hfEndpoint,
          token: hfToken
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [
      ...prev,
      ...acceptedFiles.map(file => ({ file, progress: 0, enabled: true }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const uploadFiles = async () => {
    const uploadPromises = uploadedFiles.filter(f => f.enabled).map(async ({ file }) => {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await axios.post('http://localhost:5000/upload', formData, {
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total !== undefined) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadedFiles(prev => 
                prev.map(f => 
                  f.file === file ? { ...f, progress: percentCompleted } : f
                )
              );
            } else {
              console.warn('Upload progress cannot be calculated');
            }
          }
        });
        return response.data.filename;
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    });
  
    try {
      const uploadedFileNames = await Promise.all(uploadPromises);
      return uploadedFileNames;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };
  
  const handleGeneratePersona = async () => {
    setIsLoading(true);
    try {
      const uploadedFileNames = await uploadFiles();

      const response = await fetch('http://localhost:5000/generate_persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: inputText,
          uploaded_files: uploadedFileNames,
          generation_method: generationMethod,
          hf_endpoint: hfEndpoint,
          hf_token: hfToken
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      navigate('/generate', { state: { persona: data } });
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

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(({ file }) => file !== fileToRemove));
  };

  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const toggleFileEnabled = (fileName: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileName)
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    )
  }

  const comboboxItems: ComboboxItem[] = uploadedFiles.map(f => ({
    label: f.file.name,
    value: f.file.name
  }))

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
          <Textarea 
            placeholder="Enter your information" 
            className="w-full mb-4 min-h-[100px]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Combobox
            items={uploadedFiles.map(f => ({ label: f.file.name, value: f.file.name }))}
            onChange={(value: string) => {
              const file = uploadedFiles.find(f => f.file.name === value)?.file;
              if (file) toggleFileEnabled(file);
            }}
            renderOption={(item: ComboboxItem) => (
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                {uploadedFiles.find(f => f.file.name === item.value)?.enabled && <Check className="w-4 h-4" />}
              </div>
            )}
          >
            <Button variant="outline" className="w-full justify-between">
              Manage Documents
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </Combobox>
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
                <span className="text-gray-500">Add a PDF or Docx</span>
              </>
            )}
          </div>
          {uploadedFiles.map(({ file, progress, enabled }) => (
            <div key={file.name} className="mb-2 relative">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm">{file.name}</p>
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleFileEnabled(file)}
                    className="p-0 h-auto mr-2"
                  >
                    {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFile(file)}
                    className="p-0 h-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          ))}
          <div className="w-full max-w-md">
            <Select 
              onValueChange={(value) => {
                setGenerationMethod(value);
                initializeLLM(value);
              }} 
              value={generationMethod}
            >
              <SelectTrigger className="w-full mb-2">
                <SelectValue placeholder="Select generation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="hf_endpoint">HuggingFace Endpoint</SelectItem>
              </SelectContent>
            </Select>
            
            {generationMethod === 'hf_endpoint' && (
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
                        value={hfEndpoint}
                        onChange={(e) => setHfEndpoint(e.target.value)}
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
                        type="password"
                        value={hfToken}
                        onChange={(e) => setHfToken(e.target.value)}
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
            <Button 
              className="w-full bg-[#1a202c] text-white mt-4"
              onClick={handleGeneratePersona}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Persona'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}