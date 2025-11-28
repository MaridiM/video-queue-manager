import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ChevronDown, FileText, Upload } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Progress } from './ui/Progress';
import { MOCK_VIDEOS_FOR_UPLOAD } from '../lib/constants';

export function UploadTranscriptionScreen() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoId, setVideoId] = useState('');
  const [videoError, setVideoError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setPreview(text.slice(0, 500));
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/vtt': ['.vtt'],
      'application/x-subrip': ['.srt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!videoId) {
      setVideoError('Please select a video');
      return;
    }
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('File uploaded for video:', videoId, selectedFile.name);

    setIsUploading(false);
    setUploadComplete(true);
    
    setTimeout(() => {
      setUploadComplete(false);
      setSelectedFile(null);
      setPreview('');
      setUploadProgress(0);
      setVideoId('');
    }, 2000);
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreview('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Upload Transcription</h1>
        <p className="text-gray-500">
          Upload transcription files for videos in Phase 1 (Transcription Upload)
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Select Video *</label>
          <div className="relative">
            <select
              value={videoId}
              onChange={(e) => { setVideoId(e.target.value); setVideoError(''); }}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 appearance-none"
            >
              <option value="" disabled>Choose a video...</option>
              {MOCK_VIDEOS_FOR_UPLOAD.map(video => (
                <option key={video.id} value={video.id}>
                  {video.video_title} ({video.department})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
          </div>
          {videoError && <p className="text-sm text-red-600">{videoError}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Transcription File *</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            } ${selectedFile ? 'bg-gray-50' : ''}`}
          >
            <input {...getInputProps()} />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <FileText size={24} />
                </div>
                <p className="text-lg font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:bg-red-50 border-red-200"
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <Upload size={24} />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {isDragActive ? 'Drop the file here...' : 'Click or drag file to upload'}
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: .txt, .srt, .vtt (max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {preview && (
          <Card className="p-4 border border-gray-200 shadow-sm bg-white">
            <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} /> File Preview
            </h3>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
              <pre className="text-xs text-gray-600 overflow-auto max-h-40 whitespace-pre-wrap font-mono">
                {preview}...
              </pre>
            </div>
          </Card>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
        
        {uploadComplete && (
          <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm font-medium text-center">
            ✓ Upload complete! The video status has been updated.
          </div>
        )}

        <Button
          type="submit"
          disabled={!selectedFile || isUploading || uploadComplete}
          className="w-full"
          size="lg"
        >
          {isUploading ? 'Uploading...' : 'Upload Transcription'}
        </Button>
      </form>
    </div>
  );
}

