import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatMessageDto, ChatResponseDto } from './dto/chat.dto';

interface KnowledgeBaseEntry {
  keywords: string[];
  reply: string;
  suggestions?: string[];
}

const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    keywords: [
      'what is pilotgov',
      'pilotgov',
      'about pilotgov',
      'overview',
      'platform',
      'purpose',
      'how it works',
      'mission',
    ],
    reply:
      'PilotGov is an agile public sector procurement and innovation platform that connects government departments with DPIIT-verified startups. It enables government agencies to post problem statements (Needs), discover matching cutting-edge technologies, run sandboxed pilots with transparent milestone tracking, and scale proven solutions into full-scale public contracts with verified outcomes.',
    suggestions: [
      'How do I post a Need in Identify?',
      'How does startup matching work?',
      'How does the Pilot Kanban tracker work?',
    ],
  },
  {
    keywords: [
      'post a need',
      'post need',
      'identify',
      'create need',
      'problem statement',
      'post problem',
      'new need',
      'submit need',
      'need',
    ],
    reply:
      "To post a Need in PilotGov's Identify module, submit a problem statement specifying your Department, Need title, a descriptive summary of the challenge, estimated pilot budget (e.g. ₹50L), and primary domain (such as AgriTech, CleanTech, HealthTech, Smart Mobility, or EdTech). Once submitted, PilotGov matches your need against verified startups with explainable scoring.",
    suggestions: [
      'How does startup matching and scoring work?',
      'What domains are supported?',
      'How do I track pilots in the pipeline?',
    ],
  },
  {
    keywords: [
      'matching',
      'scoring',
      'score',
      'algorithm',
      'how matching works',
      'relevance',
      'match percentage',
      'keyword overlap',
      'explainable',
    ],
    reply:
      'PilotGov uses an explainable, deterministic scoring model. Startups are matched against departmental Needs based on keyword and tag overlap with the problem description, domain alignment (e.g. AgriTech, HealthTech), Technology Readiness Level (TRL), DPIIT verification status, and past government pilot performance. No black-box AI is involved, ensuring complete procurement auditability.',
    suggestions: [
      'What is DPIIT verification?',
      'What is Technology Readiness Level (TRL)?',
      'How do I browse startups in Procure?',
    ],
  },
  {
    keywords: [
      'kanban',
      'tracker',
      'pipeline',
      'stages',
      'pilot stages',
      'applied',
      'piloting',
      'scaling',
      'completed',
      'pilot status',
      'advance',
    ],
    reply:
      'The Pilot Kanban pipeline tracks government-startup pilots across 4 transparent stages: 1) Applied (proposal submitted and under departmental review), 2) Piloting (live sandbox deployment & milestone progress), 3) Scaling (successful pilot evaluation & scaling roadmap), and 4) Completed (transitioned to full-scale departmental adoption). Advancing a card updates live progress towards deployment.',
    suggestions: [
      'What happens when a pilot is scaled?',
      'How do I advance a pilot stage?',
      'How is the scaled contract budget calculated?',
    ],
  },
  {
    keywords: [
      'scale',
      'scaled',
      'scaling',
      'scaledcontract',
      'scale up',
      'complete pilot',
      'scaled contract',
      'contract creation',
      'transition',
    ],
    reply:
      'When a pilot card advances to the "Completed" stage in the pipeline, PilotGov automatically creates a real ScaledContract record in the database. This records the startup, department, pilot start date, initial pilot budget, and an estimated scaled contract budget computed using a transparent 4x scale-up multiplier reflecting full departmental rollout.',
    suggestions: [
      'How do I view scaled contracts?',
      'What is the budget scale multiplier?',
      'How does the Pilot Kanban tracker work?',
    ],
  },
  {
    keywords: [
      'language',
      'languages',
      'vernacular',
      'hindi',
      'regional',
      'multi-language',
      'multilingual',
      'translation',
      'mother tongue',
      'localization',
    ],
    reply:
      'PilotGov is designed with multi-language and vernacular support for diverse regional governance across Indian states. Both government officials and startup founders can interact with problem statements, pilot requirements, and interface workflows in regional languages, making agile procurement accessible at central, state, and district levels.',
    suggestions: [
      'What is PilotGov?',
      'How do I post a Need?',
      'What domains are supported on PilotGov?',
    ],
  },
  {
    keywords: [
      'dpiit',
      'dpiit verified',
      'eligibility',
      'verified startup',
      'startup india',
      'provisional',
      'pending',
      'compliance',
      'verification',
    ],
    reply:
      'Startups on PilotGov are classified by eligibility status: "DPIIT Verified", "Provisional", or "Pending". DPIIT-verified startups have certified credentials recognized by Startup India, ensuring public procurement compliance, technical credibility, and fast-track eligibility for government pilots under public procurement norms.',
    suggestions: [
      'How does startup matching work?',
      'What is Technology Readiness Level (TRL)?',
      'How do I browse startups in Procure?',
    ],
  },
  {
    keywords: [
      'trl',
      'technology readiness',
      'readiness level',
      'trl score',
      'maturity',
      'readiness',
      'trl 6',
      'trl 7',
      'trl 8',
      'trl 9',
    ],
    reply:
      "Technology Readiness Level (TRL) measures the technical maturity of a startup's solution on a 1–9 scale. PilotGov prioritizes field-deployable solutions typically at TRL 6–9 (TRL 6: prototype demonstrated in relevant environment, TRL 7: operational environment prototype, TRL 8: system complete and qualified, TRL 9: proven in successful mission operations).",
    suggestions: [
      'How does startup matching work?',
      'What is DPIIT verification?',
      'How do I post a Need?',
    ],
  },
  {
    keywords: [
      'trust',
      'outcomes',
      'summary',
      'scale dashboard',
      'metrics',
      'analytics',
      'contract value',
      'public spend',
      'dashboard',
    ],
    reply:
      'The Scale and Trust dashboard provides real-time visibility into public procurement outcomes. It aggregates total scaled pilots, live ScaledContract records, departmental spending efficiency, and verified field outcomes (e.g. crop yield forecast accuracy, EHR patient coverage, solar microgrid uptime) directly from database records.',
    suggestions: [
      'What happens when a pilot is scaled?',
      'How does the Pilot Kanban tracker work?',
      'What is PilotGov?',
    ],
  },
  {
    keywords: [
      'procure',
      'browse startups',
      'domains',
      'filter',
      'search startups',
      'agritech',
      'cleantech',
      'healthtech',
      'smart mobility',
      'edtech',
    ],
    reply:
      'The Procure module allows government officers to explore verified startups filtered by domain (AgriTech, CleanTech, HealthTech, Smart Mobility, EdTech) or free-text search. Each startup profile displays mission statements, DPIIT verification, TRL level, pitch summaries, and past government pilot track records.',
    suggestions: [
      'How do I post a Need in Identify?',
      'How does startup matching work?',
      'What is Technology Readiness Level (TRL)?',
    ],
  },
  {
    keywords: [
      'budget',
      'pricing',
      'cost',
      'scale multiplier',
      '4x',
      'lakh',
      'crore',
      'how much',
      'funding',
      'estimate',
    ],
    reply:
      'Pilot budgets on PilotGov typically start with sandbox allocations (e.g. ₹25L–₹50L) for rapid operational validation. When a pilot succeeds and advances to "Completed", an estimated 4x budget multiplier is applied to represent the transition from a pilot sandbox to full municipal or state-wide departmental rollout.',
    suggestions: [
      'What happens when a pilot is scaled?',
      'How does the Pilot Kanban tracker work?',
      'How do I post a Need?',
    ],
  },
];

const FALLBACK_RESPONSE: ChatResponseDto = {
  reply:
    "I'm PilotGov's Assistant. I can help answer questions about posting departmental Needs, discovering DPIIT-verified startups, how explainable matching works, tracking pilots on the Kanban board, and scaling successful pilots into full contracts. Here are a few topics you can ask me about:",
  suggestions: [
    'What is PilotGov and how does it work?',
    'How do I post a departmental Need in the Identify module?',
    'How does the Pilot kanban tracker and scaling process work?',
  ],
};

@Injectable()
export class AssistService {
  handleChat(dto: ChatMessageDto): ChatResponseDto {
    if (!dto || typeof dto.message !== 'string' || !dto.message.trim()) {
      throw new BadRequestException('Message is required and cannot be empty');
    }

    const needle = dto.message.toLowerCase();

    let bestScore = 0;
    let bestEntry: KnowledgeBaseEntry | null = null;

    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      for (const keyword of entry.keywords) {
        if (needle.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }

    if (bestScore > 0 && bestEntry) {
      return {
        reply: bestEntry.reply,
        suggestions: bestEntry.suggestions ?? [],
      };
    }

    return FALLBACK_RESPONSE;
  }
}
