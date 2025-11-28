import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Search, Download, Brain } from 'lucide-react';
import { MOCK_EXTRACTED_TOOLS, MOCK_EXTRACTED_WORKFLOWS, MOCK_EXTRACTED_ACTIONS, MOCK_EXTRACTED_OBJECTS } from '../lib/constants';
import type { ExtractedEntity } from '../lib/types';

export function EntityExtractionViewer() {
  const [activeTab, setActiveTab] = useState('tools');
  const [searchTerm, setSearchTerm] = useState('');

  function getClassificationColor(classification: string) {
    switch (classification) {
      case 'NEW': return 'bg-green-500 text-white border-transparent';
      case 'EXISTING': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'UPDATE': return 'bg-yellow-500 text-white border-transparent';
      default: return 'bg-blue-500 text-white border-transparent';
    }
  }

  function exportToJSON(data: ExtractedEntity[], type: string) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exported_entities_${type}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const renderEntityCard = (entity: ExtractedEntity) => (
    <Card key={entity.id} className="p-4 hover:shadow-md transition-shadow bg-white border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-slate-900">{entity.entity_name}</h3>
            <Badge className={getClassificationColor(entity.classification)}>
              {entity.classification}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] text-slate-500">
              {entity.entity_id}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{entity.description}</p>
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            {entity.category && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200">
                Category: {entity.category}
              </Badge>
            )}
            {entity.confidence_score && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200">
                Confidence: {(entity.confidence_score * 100).toFixed(0)}%
              </Badge>
            )}
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200">
              Video: {entity.video_title}
            </Badge>
          </div>
          
          {entity.metadata && Object.keys(entity.metadata).length > 0 && (
            <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-100">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Metadata</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {Object.entries(entity.metadata).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-slate-700 font-medium truncate" title={String(value)}>
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entity.entity_type === 'WORKFLOW' && (
            <div className="mt-3 p-3 bg-indigo-50 rounded-md border border-indigo-100">
              <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">Workflow Details</h4>
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="flex flex-col">
                  <span className="text-indigo-400">Steps</span>
                  <span className="text-indigo-800 font-medium">{entity.steps_count}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-indigo-400">Time</span>
                  <span className="text-indigo-800 font-medium">{entity.estimated_time_minutes} min</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-indigo-400">Difficulty</span>
                  <span className="text-indigo-800 font-medium">{entity.difficulty}</span>
                </div>
              </div>
              {entity.prerequisites && (
                <div className="mb-2">
                  <span className="text-indigo-400 text-xs block mb-1">Prerequisites:</span>
                  <ul className="list-disc list-inside text-indigo-800 text-xs">
                    {entity.prerequisites.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const filterEntities = (entities: ExtractedEntity[]) => 
    entities.filter(e => 
      e.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="text-purple-600" />
            Extracted Entities
          </h1>
          <p className="text-slate-500 mt-1">
            Review entities extracted from video transcriptions (Phase 2)
          </p>
        </div>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search entities by name or description..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-lg h-auto flex-wrap justify-start">
          <TabsTrigger value="tools" className="flex-1 min-w-[100px]">
            Tools
            <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">
              {MOCK_EXTRACTED_TOOLS.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex-1 min-w-[100px]">
            Workflows
            <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">
              {MOCK_EXTRACTED_WORKFLOWS.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex-1 min-w-[100px]">
            Actions
            <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">
              {MOCK_EXTRACTED_ACTIONS.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="objects" className="flex-1 min-w-[100px]">
            Objects
            <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">
              {MOCK_EXTRACTED_OBJECTS.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Identified Tools & Platforms</h2>
            <Button variant="outline" size="sm" onClick={() => exportToJSON(MOCK_EXTRACTED_TOOLS, 'tools')}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filterEntities(MOCK_EXTRACTED_TOOLS).map(renderEntityCard)}
            {filterEntities(MOCK_EXTRACTED_TOOLS).length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">No tools found.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Extracted Workflows</h2>
            <Button variant="outline" size="sm" onClick={() => exportToJSON(MOCK_EXTRACTED_WORKFLOWS, 'workflows')}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filterEntities(MOCK_EXTRACTED_WORKFLOWS).map(renderEntityCard)}
            {filterEntities(MOCK_EXTRACTED_WORKFLOWS).length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">No workflows found.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Identified Actions</h2>
          </div>
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No actions extracted yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="objects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Identified Objects & Files</h2>
          </div>
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No objects extracted yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

