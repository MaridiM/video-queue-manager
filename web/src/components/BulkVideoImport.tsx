import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, FileText, AlertCircle, CheckCircle, Download, Database } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import type { VideoImportRow } from '../lib/types';
import { DEPARTMENTS, PRIORITIES, BRONZE_LIBRARY_VIDEOS, STATUSES } from '../lib/constants';

const isValidUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

interface ValidatedRow extends VideoImportRow {
  isValid: boolean;
  errors: string[];
  id: string;
}

export function BulkVideoImport() {
  const [importedRows, setImportedRows] = useState<ValidatedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const processData = (data: Record<string, unknown>[]) => {
    const processed: ValidatedRow[] = data.map((row, index) => {
      const errors: string[] = [];
      
      if (!row.video_url) errors.push('Missing video_url');
      else if (!isValidUrl(row.video_url as string)) errors.push('Invalid URL format');
      
      if (!row.video_title) errors.push('Missing video_title');
      else if (String(row.video_title).length < 3) errors.push('Title too short');

      if (row.department && !DEPARTMENTS.includes(row.department as typeof DEPARTMENTS[number])) {
        errors.push(`Invalid department`);
      } else if (!row.department) {
        errors.push('Missing department');
      }

      if (row.priority && !PRIORITIES.includes((row.priority as string).toLowerCase() as typeof PRIORITIES[number])) {
        errors.push(`Invalid priority`);
      }

      if (row.assigned_to && !isValidEmail(row.assigned_to as string)) {
        errors.push('Invalid email');
      }

      if (row.status && !STATUSES.includes(row.status as typeof STATUSES[number])) {
        errors.push(`Invalid status`);
      }

      if (row.duration_minutes) {
        const duration = Number(row.duration_minutes);
        if (isNaN(duration) || duration <= 0 || duration > 999) {
          errors.push('Invalid duration');
        }
      }

      return {
        video_url: (row.video_url as string) || '',
        video_title: (row.video_title as string) || '',
        channel_name: row.channel_name as string | undefined,
        duration_minutes: row.duration_minutes as number | string | undefined,
        priority: row.priority as string | undefined,
        department: row.department as string | undefined,
        assigned_to: row.assigned_to as string | undefined,
        notes: row.notes as string | undefined,
        status: row.status as string | undefined,
        isValid: errors.length === 0,
        errors,
        id: `row-${index}-${Date.now()}`
      };
    });

    setImportedRows(processed);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportComplete(false);

    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            processData(json);
          } else {
            alert('Invalid JSON format. Expected an array.');
          }
        } catch {
          alert('Error parsing JSON file.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data as Record<string, unknown>[]);
          setIsProcessing(false);
        },
        error: (error) => {
          alert(`Error parsing CSV: ${error.message}`);
          setIsProcessing(false);
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  const handleImport = () => {
    const validRows = importedRows.filter(row => row.isValid);
    console.log('Importing valid rows:', validRows);
    setImportComplete(true);
    setTimeout(() => {
      setImportedRows([]);
      setFileName('');
      setImportComplete(false);
    }, 3000);
  };

  const handleReset = () => {
    setImportedRows([]);
    setFileName('');
    setImportComplete(false);
  };

  const validCount = importedRows.filter(r => r.isValid).length;
  const errorCount = importedRows.filter(r => !r.isValid).length;

  const downloadTemplate = () => {
    const csvContent = "video_url,video_title,channel_name,duration_minutes,priority,department,assigned_to,notes,status\nhttps://youtube.com/watch?v=example,Sample Video Title,Channel Name,15,medium,DEV,user@example.com,Notes here,pending";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'video_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadBronzeLibrary = () => {
    setFileName('Bronze Library (Sample)');
    setIsProcessing(true);
    setTimeout(() => {
      processData(BRONZE_LIBRARY_VIDEOS as unknown as Record<string, unknown>[]);
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Video Import</h1>
          <p className="text-slate-500 mt-1">Import multiple videos via CSV or JSON file</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadBronzeLibrary} size="sm">
            <Database className="w-4 h-4 mr-2" />
            Load Bronze Library
          </Button>
          <Button variant="outline" onClick={downloadTemplate} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>
        </div>
      </div>

      {!importedRows.length && !importComplete && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Upload size={32} />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop file here...' : 'Drag & drop CSV or JSON file'}
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Supported formats: .csv, .json (max 5MB)
            </p>
          </div>
        </div>
      )}

      {importedRows.length > 0 && (
        <div className="space-y-4 animate-in fade-in">
          <Card className="p-4 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-gray-400" size={20} />
                  <span className="font-medium text-gray-900">{fileName}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {validCount} Valid
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {errorCount} Errors
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleReset} size="sm">Cancel</Button>
                <Button onClick={handleImport} disabled={validCount === 0}>
                  Import {validCount} Videos
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Valid</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3">Dept</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importedRows.map((row) => (
                    <tr key={row.id} className={`hover:bg-gray-50/50 ${!row.isValid ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        {row.isValid ? (
                          <CheckCircle className="text-green-500 w-5 h-5" />
                        ) : (
                          <AlertCircle className="text-red-500 w-5 h-5" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.status ? (
                          <Badge variant="outline" className="bg-slate-100">{row.status}</Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate" title={row.video_title}>
                        {row.video_title || <span className="text-gray-400 italic">Missing</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate" title={row.video_url}>
                        {row.video_url || <span className="text-gray-400 italic">Missing</span>}
                      </td>
                      <td className="px-4 py-3">
                        {row.department ? <Badge variant="outline">{row.department}</Badge> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {row.priority || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-red-600 text-xs">
                        {row.errors.length > 0 && (
                          <div className="flex flex-col gap-0.5">
                            {row.errors.map((err, i) => (
                              <span key={i}>• {err}</span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {importComplete && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-green-200 shadow-sm animate-in zoom-in-95">
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Import Successful!</h2>
          <p className="text-gray-500 mb-6 text-center">
            Videos have been successfully added to the queue.
          </p>
          <Button onClick={handleReset} variant="outline">Import Another File</Button>
        </div>
      )}
    </div>
  );
}

