import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { SidebarOpen, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Persona {
  id: string;
  name: string;
  timestamp: string;
  description: string;
}

const ViewPage: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [editableData, setEditableData] = useState<Record<string, string>>({});
  const [generatedData, setGeneratedData] = useState<Record<string, string | string[]>>({});
  const [inputDocuments, setInputDocuments] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  useEffect(() => {
    fetchPersonas();
    fetchInputDocuments();
  }, []);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get('http://localhost:5000/test');
        console.log(response.data);
      } catch (error) {
        console.error('Error connecting to Flask server:', error);
      }
    };
    testConnection();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await axios.get<{ personas: Persona[] }>('http://localhost:5000/get_personas');
      setPersonas(response.data.personas);
    } catch (error) {
      console.error('Error fetching personas:', error);
      setTerminalOutput(JSON.stringify(error, null, 2));
    }
  };

  const fetchInputDocuments = async () => {
    try {
      const response = await axios.get<Record<string, string>>('http://localhost:5000/get_input_documents');
      setInputDocuments(response.data);
    } catch (error) {
      console.error('Error fetching input documents:', error);
      setTerminalOutput(JSON.stringify(error, null, 2));
    }
  };

  const handlePersonaSelect = async (personaId: string) => {
    try {
      const response = await axios.get<{ persona: Record<string, string | string[]> }>(`http://localhost:5000/load_persona/${personaId}`);
      setSelectedPersona(personas.find(p => p.id === personaId) || null);
      setEditableData(response.data.persona as Record<string, string>);
      setGeneratedData(response.data.persona);
    } catch (error) {
      console.error('Error loading persona:', error);
      setTerminalOutput(JSON.stringify(error, null, 2));
    }
  };

  const handleInputChange = (section: string, value: string) => {
    setEditableData(prev => ({ ...prev, [section]: value }));
  };

  const handleDocumentChange = (docName: string, content: string) => {
    setInputDocuments(prev => ({ ...prev, [docName]: content }));
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      // Update or add documents
      for (const [docName, content] of Object.entries(inputDocuments)) {
        await axios.post('http://localhost:5000/update_document', {
          filename: docName,
          content: content
        });
      }

      // Generate persona
      const response = await axios.post<Record<string, string | string[]>>('http://localhost:5000/generate_persona', {
        input: editableData.input || '',
        selected_documents: Object.keys(inputDocuments)
      });

      setGeneratedData(response.data);
      setTerminalOutput(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error updating documents or generating persona:', error);
      setTerminalOutput(JSON.stringify(error, null, 2));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 bg-white">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center gap-6'>
          <Link to="/" className="text-sm text-muted-foreground">&larr; Back</Link>
          <h1 className="text-xl font-bold">Dev Test Page</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Select onValueChange={handlePersonaSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select Persona" />
            </SelectTrigger>
            <SelectContent>
              {personas.map((persona) => (
                <SelectItem key={persona.id} value={persona.id}>{persona.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet open={isTerminalOpen} onOpenChange={setIsTerminalOpen}>
            <SheetTrigger asChild>
              <Button variant="outline"><SidebarOpen className="h-4 w-4 mr-2" /> Terminal</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Terminal</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsTerminalOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-grow mb-4">
                  <pre className="text-sm whitespace-pre-wrap">{terminalOutput}</pre>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="grid grid-cols-1 gap-4 md:grid-cols-2" style={{height: 'calc(80vh)' }}>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <Accordion type="single" collapsible className="w-full mb-4">
            <AccordionItem value="persona">
              <AccordionTrigger>Persona Input</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  value={editableData.input || ''}
                  onChange={(e) => handleInputChange('input', e.target.value)}
                  placeholder="Enter persona description..."
                  className="w-full min-h-[100px]"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="documents">
              <AccordionTrigger>Input Documents</AccordionTrigger>
              <AccordionContent>
                {Object.entries(inputDocuments).map(([docName, content]) => (
                  <Card key={docName} className="mb-4">
                    <CardHeader>
                      <CardTitle>{docName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={content}
                        onChange={(e) => handleDocumentChange(docName, e.target.value)}
                        className="min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button onClick={handleSubmit} className="mt-4" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Persona'}
          </Button>
        </ScrollArea>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {Object.entries(generatedData).map(([section, value]) => (
              <Card key={section} className="bg-gray-800 text-white">
                <CardHeader>
                  <CardTitle>{section}</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default ViewPage;