import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StreamingComponent = ({ inputText, selectedDocuments }) => {
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStreaming = async () => {
    setIsStreaming(true);
    setStreamedContent('');

    try {
      const response = await fetch('http://localhost:5000/api/generate_persona_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputText, selected_documents: selectedDocuments }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        lines.forEach(line => {
          if (line.startsWith('data:')) {
            const jsonData = JSON.parse(line.slice(5));
            setStreamedContent(prev => prev + jsonData.token);
          }
        });
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div>
      <button onClick={startStreaming} disabled={isStreaming}>
        {isStreaming ? 'Streaming...' : 'Start Streaming'}
      </button>
      <div>
        {streamedContent}
      </div>
    </div>
  );
};

export default StreamingComponent;