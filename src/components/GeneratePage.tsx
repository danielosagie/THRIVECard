import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input"
import { X, Plus, SidebarOpen } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface Version {
  id: string;
  description: string;
}

const PERSONA_SECTIONS = [
  "Goals",
  "Life Experiences",
  "Qualifications and Education",
  "Skills",
  "Strengths",
  "Value Proposition"
];

export default function GeneratePage() {
  const location = useLocation();
  const [persona, setPersona] = useState<Record<string, string | string[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [rawOutput, setRawOutput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [streamingChat, setStreamingChat] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchVersions();
    if (location.state?.input) {
      if (textareaRef.current) {
        textareaRef.current.value = location.state.input;
      }
      generatePersona(location.state.input, location.state.uploaded_files);
    } else if (location.state?.persona) {
      setPersona(location.state.persona);
    }
  }, [location.state]);

  const generatePersona = async (input: string, uploadedFiles: string[]) => {
    setIsGenerating(true);
    setPersona({});
    setRawOutput('');
    setChatHistory([]);
    setStreamingChat('');
    try {
      const response = await fetch('http://localhost:5000/generate_persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, uploaded_files: uploadedFiles })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setRawOutput(prev => prev + chunk);
        setChatHistory(prev => [...prev, chunk]);
        setStreamingChat(prev => prev + chunk);
        try {
          const parsedChunk = JSON.parse(chunk);
          setPersona(prev => ({ ...prev, ...parsedChunk }));
        } catch (error) {
          console.error('Error parsing chunk:', error);
        }
      }
    } catch (error) {
      console.error('Error generating persona:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await fetch('http://localhost:5000/get_versions');
      const data = await response.json();
      setVersions(data.versions);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const updateTag = (category: string, index: number, newValue: string) => {
    setPersona(prev => {
      const updatedCategory = [...(prev[category] as string[])];
      updatedCategory[index] = newValue;
      return { ...prev, [category]: updatedCategory };
    });
  };

  const removeTag = (category: string, index: number) => {
    setPersona(prev => {
      const updatedCategory = (prev[category] as string[]).filter((_, i) => i !== index);
      return { ...prev, [category]: updatedCategory };
    });
  };

  const addTag = (category: string) => {
    setPersona(prev => ({
      ...prev,
      [category]: [...((prev[category] as string[]) || []), "New Tag"]
    }));
  };

  const saveVersion = async () => {
    try {
      await fetch('http://localhost:5000/save_version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona })
      });
      fetchVersions();
    } catch (error) {
      console.error('Error saving version:', error);
    }
  };

  const loadVersion = async (versionId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/load_version/${versionId}`);
      const data = await response.json();
      setPersona(data.persona);
    } catch (error) {
      console.error('Error loading version:', error);
    }
  };


  return (
    <div className="space-y-4 bg-white">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center gap-6'>
          <Link to="/input" className="text-sm text-muted-foreground">&larr; Back</Link>
          <h1 className="text-xl font-bold">Generate & Edit</h1>
          </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Load a saved persona...</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {versions.map(version => (
                <DropdownMenuItem key={version.id} onSelect={() => loadVersion(version.id)}>
                  {version.description}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={saveVersion}>Save Progress</Button>
          <Button variant="outline">Download Image</Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline"><SidebarOpen className="h-4 w-4 mr-2" /> Raw Output</Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] sm:w-[540px]">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Raw Output</h3>
                  <pre className="text-sm whitespace-pre-wrap">{rawOutput}</pre>
                  <h3 className="text-lg font-semibold">Chat History</h3>
                  <div className="bg-gray-100 p-2 rounded">
                    {chatHistory.map((message, index) => (
                      <div key={index} className="mb-2">
                        <pre className="text-sm whitespace-pre-wrap">{message}</pre>
                      </div>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold">Streaming Chat</h3>
                  <Textarea
                    value={streamingChat}
                    readOnly
                    className="w-full h-40"
                  />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="grid grid-cols-1 gap-4 md:grid-cols-2" style={{height: 'calc(80vh)' }}>
        <div className="h-full">
          <Card className="space-y-4 rounded-lg border-white">
            <CardContent className="p-0 h-auto space-y-8">
              <div className="flex items-center space-x-4 h-full">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Customize Persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="persona1">Persona 1</SelectItem>
                    <SelectItem value="persona2">Persona 2</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Documents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doc1">Document 1</SelectItem>
                    <SelectItem value="doc2">Document 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                ref={textareaRef}
                placeholder="Add Content" 
                className="w-full" 
                style={{height: 'calc(70vh)' }} 
                defaultValue="I am looking to..." 
              />
            </CardContent>
            <Button onClick={() => generatePersona(textareaRef.current?.value || '', [])}>
              {isGenerating ? 'Generating...' : 'Submit'}
            </Button>
          </Card>
        </div>
        <div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card className="bg-gray-800 text-white">
                  <CardHeader>
                    <CardTitle>{persona.Name || 'Name'}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {persona.Description || 'Description will appear here'}
                    </CardDescription>
                  </CardHeader>
                </Card>
                {PERSONA_SECTIONS.slice(0, 3).map((section) => (
                  <Card key={section} className="bg-gray-800 text-white">
                    <CardHeader>
                      <CardTitle>{section}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(persona[section]) ? (
                        persona[section].map((item: string, index: number) => (
                          <Badge key={index} className="mr-2 mb-2 relative group bg-gray-700">
                            <Input
                              value={item}
                              onChange={(e) => updateTag(section, index, e.target.value)}
                              className="bg-transparent border-none p-0 focus:ring-0 text-white"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeTag(section, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 opacity-0 hover:opacity-100 transition-opacity text-white"
                        onClick={() => addTag(section)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-4">
                {PERSONA_SECTIONS.slice(3).map((section) => (
                  <Card key={section} className="bg-gray-800 text-white">
                    <CardHeader>
                      <CardTitle>{section}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(persona[section]) ? (
                        persona[section].map((item: string, index: number) => (
                          <Badge key={index} className="mr-2 mb-2 relative group bg-gray-700">
                            <Input
                              value={item}
                              onChange={(e) => updateTag(section, index, e.target.value)}
                              className="bg-transparent border-none p-0 focus:ring-0 text-white"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeTag(section, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 opacity-0 hover:opacity-100 transition-opacity text-white"
                        onClick={() => addTag(section)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}