import { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Download, Filter } from 'lucide-react';
import { MOCK_NODES, MOCK_EDGES, NODE_COLORS } from '../lib/constants';

interface NodeData {
  label: string;
  category?: string;
  description?: string;
  steps?: number;
  difficulty?: string;
  file_type?: string;
}

const nodeTypes = {
  tool: ({ data }: { data: NodeData }) => (
    <div className="px-4 py-2 shadow-lg rounded-lg border-2 bg-white" style={{ borderColor: NODE_COLORS.tool }}>
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs text-gray-500">{data.category}</div>
    </div>
  ),
  workflow: ({ data }: { data: NodeData }) => (
    <div className="px-4 py-2 shadow-lg rounded-lg border-2 bg-white" style={{ borderColor: NODE_COLORS.workflow }}>
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs text-gray-500">{data.steps} steps</div>
    </div>
  ),
  action: ({ data }: { data: NodeData }) => (
    <div className="px-4 py-2 shadow-lg rounded-lg border-2 bg-white" style={{ borderColor: NODE_COLORS.action }}>
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs text-gray-500">{data.difficulty}</div>
    </div>
  ),
  object: ({ data }: { data: NodeData }) => (
    <div className="px-4 py-2 shadow-lg rounded-lg border-2 bg-white" style={{ borderColor: NODE_COLORS.object }}>
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs text-gray-500">{data.file_type}</div>
    </div>
  )
};

export function KnowledgeMapViewer() {
  const [nodes, , onNodesChange] = useNodesState(MOCK_NODES);
  const [edges, , onEdgesChange] = useEdgesState(MOCK_EDGES);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string[]>([]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const filteredNodes = nodes.filter(node => {
    if (entityTypeFilter.length === 0) return true;
    return entityTypeFilter.includes(node.type!);
  });

  const filteredEdges = edges.filter(edge => {
    const sourceVisible = filteredNodes.some(n => n.id === edge.source);
    const targetVisible = filteredNodes.some(n => n.id === edge.target);
    return sourceVisible && targetVisible;
  });

  function toggleFilter(type: string) {
    setEntityTypeFilter(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }

  function exportGraph() {
    alert('Export to PNG would happen here.');
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex-1 relative h-full">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => NODE_COLORS[node.type as keyof typeof NODE_COLORS]}
          />
          <Background gap={12} size={1} />

          <Panel position="top-left">
            <Card className="p-4 w-64 shadow-md bg-white/95 backdrop-blur-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-gray-900">
                <Filter className="w-4 h-4" />
                Filter by Type
              </h3>
              <div className="space-y-2">
                {(['tool', 'workflow', 'action', 'object'] as const).map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={entityTypeFilter.length === 0 || entityTypeFilter.includes(type)}
                      onChange={() => toggleFilter(type)}
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: NODE_COLORS[type] }}
                    />
                    <span className="text-sm capitalize text-gray-700">{type}s</span>
                  </label>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full mt-4" onClick={exportGraph}>
                <Download className="w-4 h-4 mr-2" />
                Export PNG
              </Button>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto animate-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Node Details</h2>
            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <Badge
            className="mb-4"
            style={{ 
              backgroundColor: NODE_COLORS[selectedNode.type as keyof typeof NODE_COLORS],
              color: '#fff',
              border: 'none'
            }}
          >
            {selectedNode.type?.toUpperCase()}
          </Badge>

          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">
              {(selectedNode.data as NodeData).label}
            </h3>

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-500 text-xs uppercase tracking-wide">ID</dt>
                <dd className="text-gray-900 font-mono text-xs">{selectedNode.id}</dd>
              </div>

              {Object.entries(selectedNode.data as NodeData).map(([key, value]) => {
                if (key === 'label') return null;
                return (
                  <div key={key}>
                    <dt className="font-medium text-gray-500 text-xs uppercase tracking-wide capitalize mt-2">
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="text-gray-900">{value as string}</dd>
                  </div>
                );
              })}
            </dl>
          </Card>

          <div>
            <h4 className="font-semibold mb-2 text-sm text-gray-900">Connections</h4>
            <div className="space-y-2">
              {edges
                .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                .map(edge => {
                  const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                  const otherNode = nodes.find(n => n.id === otherNodeId);
                  const isSource = edge.source === selectedNode.id;

                  return (
                    <Card key={edge.id} className="p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {edge.label}
                        </Badge>
                        <span className="text-xs text-gray-400">{isSource ? '→' : '←'}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-800">{(otherNode?.data as NodeData)?.label}</div>
                    </Card>
                  );
                })}
              {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                <p className="text-sm text-gray-500 italic">No connections found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

