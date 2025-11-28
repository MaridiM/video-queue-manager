import { useState } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Checkbox } from './ui/Checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/Accordion';
import { FILTER_OPTIONS } from '../lib/constants';

export interface FilterState {
  status: string[];
  department: string[];
  priority: string[];
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export function FilterPanel({ onFilterChange, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    status: [],
    department: [],
    priority: []
  });

  function toggleFilter(category: keyof FilterState, value: string) {
    const currentValues = filters[category];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    const newFilters = { ...filters, [category]: newValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }

  function clearAll() {
    const emptyFilters: FilterState = {
      status: [],
      department: [],
      priority: []
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  }

  const activeFilterCount =
    filters.status.length +
    filters.department.length +
    filters.priority.length;

  return (
    <div className="w-full md:w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center">
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs h-8 px-2"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <Accordion type="multiple" defaultValue={['status', 'department', 'priority']}>
          <AccordionItem value="status">
            <AccordionTrigger>
              <span className="text-sm">Status</span>
              {filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.status.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {FILTER_OPTIONS.status.map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={filters.status.includes(option.value)}
                      onCheckedChange={() => toggleFilter('status', option.value)}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="department">
            <AccordionTrigger>
              <span className="text-sm">Department</span>
              {filters.department.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.department.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {FILTER_OPTIONS.department.map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={filters.department.includes(option.value)}
                      onCheckedChange={() => toggleFilter('department', option.value)}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="priority">
            <AccordionTrigger>
              <span className="text-sm">Priority</span>
              {filters.priority.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.priority.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {FILTER_OPTIONS.priority.map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={filters.priority.includes(option.value)}
                      onCheckedChange={() => toggleFilter('priority', option.value)}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {activeFilterCount > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.status.map(status => (
              <Badge
                key={status}
                variant="outline"
                className="cursor-pointer bg-white hover:bg-red-50 hover:text-red-600"
                onClick={() => toggleFilter('status', status)}
              >
                {status} ×
              </Badge>
            ))}
            {filters.department.map(dept => (
              <Badge
                key={dept}
                variant="outline"
                className="cursor-pointer bg-white hover:bg-red-50 hover:text-red-600"
                onClick={() => toggleFilter('department', dept)}
              >
                {dept} ×
              </Badge>
            ))}
            {filters.priority.map(priority => (
              <Badge
                key={priority}
                variant="outline"
                className="cursor-pointer bg-white hover:bg-red-50 hover:text-red-600"
                onClick={() => toggleFilter('priority', priority)}
              >
                {priority} ×
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

