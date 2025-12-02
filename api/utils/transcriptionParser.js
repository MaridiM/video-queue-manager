/**
 * Парсит ответ AI и преобразует в JSON схему v2.0
 * @module utils/transcriptionParser
 */

/**
 * Форматирует миллисекунды в timestamp (MM:SS или HH:MM:SS)
 */
function formatTimestamp(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Вычисляет общую длительность видео из сегментов
 */
function calculateDuration(segments) {
  if (segments.length === 0) return '00:00';
  const lastSegment = segments[segments.length - 1];
  const totalMs = lastSegment.startMs + lastSegment.durationMs;
  return formatTimestamp(totalMs);
}

/**
 * Нормализует глаголы действий в стандартный формат
 */
function normalizeActionVerbs(verbs) {
  if (!verbs || typeof verbs !== 'object') {
    return {
      creation_verbs: [],
      modification_verbs: [],
      analysis_verbs: [],
      organization_verbs: [],
      communication_verbs: [],
      browser_agentic_operations: [],
      data_operations: []
    };
  }

  return {
    creation_verbs: verbs.creation_verbs || verbs.CREATION_VERBS || verbs['A. CREATION VERBS'] || [],
    modification_verbs: verbs.modification_verbs || verbs.MODIFICATION_VERBS || verbs['B. MODIFICATION VERBS'] || [],
    analysis_verbs: verbs.analysis_verbs || verbs.ANALYSIS_VERBS || verbs['C. ANALYSIS VERBS'] || [],
    organization_verbs: verbs.organization_verbs || verbs.ORGANIZATION_VERBS || verbs['D. ORGANIZATION VERBS'] || [],
    communication_verbs: verbs.communication_verbs || verbs.COMMUNICATION_VERBS || verbs['E. COMMUNICATION VERBS'] || [],
    browser_agentic_operations: verbs.browser_agentic_operations || verbs.BROWSER_AGENTIC_OPERATIONS || verbs['F. BROWSER/AGENTIC OPERATIONS'] || [],
    data_operations: verbs.data_operations || verbs.DATA_OPERATIONS || verbs['G. DATA OPERATIONS'] || []
  };
}

/**
 * Нормализует таксономический анализ в формат схемы v2.0
 */
function normalizeTaxonomyAnalysis(taxonomy) {
  if (!taxonomy || typeof taxonomy !== 'object') {
    return {};
  }

  return {
    workflows: taxonomy.workflows || taxonomy.Workflows_Identified || taxonomy['Workflows Identified'] || [],
    milestones: taxonomy.milestones || taxonomy.Milestones || [],
    tasks: taxonomy.tasks || taxonomy.Task_Templates || taxonomy['Task Templates'] || [],
    steps: taxonomy.steps || taxonomy.Step_Templates || taxonomy['Step Templates'] || [],
    projects: taxonomy.projects || taxonomy.Project_Templates || taxonomy['Project Templates'] || [],
    action_verbs: normalizeActionVerbs(taxonomy.action_verbs || taxonomy.Action_Verbs_Extracted || taxonomy['Action Verbs Extracted']),
    task_chains: taxonomy.task_chains || taxonomy.Task_Chains || taxonomy['Task Chains'] || [],
    responsibilities_vocabulary: taxonomy.responsibilities_vocabulary || taxonomy.Responsibilities_Vocabulary || taxonomy['Responsibilities Vocabulary'] || {},
    skills: taxonomy.skills || [],
    professions: taxonomy.professions || [],
    tools_matrix: taxonomy.tools_matrix || taxonomy.Tools_Technologies_Matrix || taxonomy['Tools & Technologies Matrix'] || [],
    objects_deliverables: taxonomy.objects_deliverables || taxonomy.Objects_Deliverables || taxonomy['Objects & Deliverables'] || [],
    integration_patterns: taxonomy.integration_patterns || taxonomy.Integration_Patterns || taxonomy['Integration Patterns'] || [],
    business_concepts: taxonomy.business_concepts || taxonomy.Business_Concepts_Strategy || taxonomy['Business Concepts & Strategy'] || [],
    optimization_techniques: taxonomy.optimization_techniques || taxonomy.Optimization_Best_Practices || taxonomy['Optimization & Best Practices'] || [],
    entities_summary: taxonomy.entities_summary || {},
    hierarchy_trees: taxonomy.hierarchy_trees || [],
    department_distribution: taxonomy.department_distribution || {},
    reusability_analysis: taxonomy.reusability_analysis || [],
    success_metrics: taxonomy.success_metrics || []
  };
}

/**
 * Парсит ответ AI и преобразует в JSON схему v2.0
 */
export function parseAIResponseToJSON(aiResponse, videoId, videoTitle, videoUrl, languageName, segments) {
  try {
    // Попытка 1: Парсинг чистого JSON
    let jsonData;
    try {
      // Удалить markdown code blocks если есть
      const cleaned = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      jsonData = JSON.parse(cleaned);
    } catch (e) {
      // Попытка 2: Извлечь JSON из markdown
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }
    
    // Нормализация структуры под схему v2.0
    return normalizeToSchemaV2(jsonData, videoId, videoTitle, videoUrl, languageName, segments);
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Fallback: создать базовую структуру из доступных данных
    return createFallbackJSON(videoId, videoTitle, videoUrl, languageName, segments);
  }
}

/**
 * Нормализует данные в формат схемы v2.0
 */
function normalizeToSchemaV2(data, videoId, videoTitle, videoUrl, languageName, segments) {
  // Преобразование транскрипции в формат схемы
  const transcription = segments.map(s => ({
    start: formatTimestamp(s.startMs),
    end: formatTimestamp(s.startMs + s.durationMs),
    speaker: data.metadata?.speaker || '',
    text: s.text,
    annotations: []
  }));
  
  // Извлечение video_id из данных или генерация
  let videoIdFormatted = data.video_id;
  if (!videoIdFormatted) {
    // Попытка извлечь из Video_XXX формата
    const videoMatch = videoId.match(/Video_(\d+)/);
    if (videoMatch) {
      videoIdFormatted = `Video_${videoMatch[1].padStart(3, '0')}`;
    } else {
      videoIdFormatted = `Video_${videoId}`;
    }
  }
  
  return {
    video_id: videoIdFormatted,
    video_title: data.video_title || data['Video Title'] || videoTitle || 'Unknown',
    metadata: {
      channel: data.metadata?.channel || data.metadata?.['Channel/Creator'] || '',
      creator: data.metadata?.creator || data.metadata?.['Channel/Creator'] || '',
      channel_url: data.metadata?.channel_url || data.metadata?.['Channel URL'] || '',
      video_url: data.metadata?.video_url || data.metadata?.['Video URL'] || videoUrl || '',
      duration: data.metadata?.duration || data.metadata?.['Duration'] || calculateDuration(segments),
      publication_date: data.metadata?.publication_date || data.metadata?.['Publication Date'] || '',
      extraction_date: new Date().toISOString().split('T')[0],
      extractor_version: 'v4.1',
      language: data.metadata?.language || data.metadata?.['Language'] || languageName || 'en',
      subtitles_exist: data.metadata?.subtitles_exist || false,
      topics: data.metadata?.topics || data.metadata?.['Key Topics'] || data['Key Topics'] || [],
      tools_referenced: data.metadata?.tools_referenced || data.metadata?.['Tools Referenced'] || [],
      links_referenced: data.metadata?.links_referenced || data.metadata?.['Links Referenced'] || [],
      timestamps: data.metadata?.timestamps || [],
      hashtags: data.metadata?.hashtags || []
    },
    description: data.description || data['Description'] || '',
    tags: data.tags || [],
    transcription: transcription,
    taxonomy_analysis: normalizeTaxonomyAnalysis(data.taxonomy_analysis || data.TAXONOMY_ANALYSIS || data['TAXONOMY ANALYSIS'] || {}),
    processing_status: {
      phase_1_transcription: 'complete',
      phase_2_naming: 'complete',
      phase_3_analysis: (data.taxonomy_analysis || data.TAXONOMY_ANALYSIS) ? 'complete' : 'pending',
      phase_4_objects: 'pending',
      phase_5_gap_analysis: 'pending',
      phase_6_taxonomy_updates: 'pending',
      phase_7_reporting: 'pending',
      last_updated: new Date().toISOString(),
      updated_by: 'AI Assistant'
    },
    analysis_files: [],
    provenance: {
      taxonomy_status: 'Pending_Review',
      ready_for_import: false,
      validation_required: true,
      notes: 'Generated from AI transcription',
      main_topics: data.metadata?.topics || data.metadata?.['Key Topics'] || data['Key Topics'] || [],
      key_workflows: (data.taxonomy_analysis?.workflows || data.TAXONOMY_ANALYSIS?.workflows || []).map(w => 
        w.workflow_id || w.workflow_name || (typeof w === 'string' ? w : '')
      ).filter(Boolean),
      notable_tools: data.metadata?.tools_referenced || data.metadata?.['Tools Referenced'] || []
    }
  };
}

/**
 * Создает базовую JSON структуру при ошибке парсинга
 */
function createFallbackJSON(videoId, videoTitle, videoUrl, languageName, segments) {
  // Генерация video_id
  let videoIdFormatted = `Video_${videoId}`;
  const videoMatch = videoId.match(/Video_(\d+)/);
  if (videoMatch) {
    videoIdFormatted = `Video_${videoMatch[1].padStart(3, '0')}`;
  }
  
  return {
    video_id: videoIdFormatted,
    video_title: videoTitle || 'Unknown',
    metadata: {
      video_url: videoUrl || '',
      duration: calculateDuration(segments),
      language: languageName || 'en',
      extraction_date: new Date().toISOString().split('T')[0],
      extractor_version: 'v4.1',
      topics: [],
      tools_referenced: [],
      links_referenced: []
    },
    description: '',
    tags: [],
    transcription: segments.map(s => ({
      start: formatTimestamp(s.startMs),
      end: formatTimestamp(s.startMs + s.durationMs),
      text: s.text,
      annotations: []
    })),
    taxonomy_analysis: {},
    processing_status: {
      phase_1_transcription: 'complete',
      phase_2_naming: 'pending',
      phase_3_analysis: 'pending',
      phase_4_objects: 'pending',
      phase_5_gap_analysis: 'pending',
      phase_6_taxonomy_updates: 'pending',
      phase_7_reporting: 'pending',
      last_updated: new Date().toISOString(),
      updated_by: 'AI Assistant'
    },
    analysis_files: [],
    provenance: {
      taxonomy_status: 'Pending_Review',
      ready_for_import: false,
      validation_required: true,
      notes: 'Fallback JSON structure - AI parsing failed',
      main_topics: [],
      key_workflows: [],
      notable_tools: []
    }
  };
}

