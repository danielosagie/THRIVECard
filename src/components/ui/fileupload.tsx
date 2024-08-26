import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

const API_BASE_URL = 'http://localhost:5989';

const FileUpload = ({
  onFilesChange,
  dropzoneText = "Drag & drop files here, or click to select files",
  uploadedFilesText = "Uploaded Files:",
  removeFileText = "Remove"
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_uploaded_files`);
      setUploadedFiles(response.data.files);
      onFilesChange(response.data.files);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const uploadPromises = acceptedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${API_BASE_URL}/upload_file`, formData);
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

  const removeFile = async (filename) => {
    try {
      await axios.post(`${API_BASE_URL}/remove_file`, { filename });
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
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
            <span className="text-gray-500">{dropzoneText}</span>
          </>
        )}
      </div>
      <div className="mb-4">
        <h3 className="font-small mb-2">{uploadedFilesText}</h3>
        {uploadedFiles.map((file) => (
          <div key={file} className="flex items-center justify-between mb-1">
            <span>{file}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => removeFile(file)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              {removeFileText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;