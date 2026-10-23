import { DocumentMeta } from '../types/pdf';

export interface DocumentPageContent {
  pageNumber: number;
  sections: {
    type: 'heading' | 'subheading' | 'paragraph' | 'quote' | 'bullet_list' | 'callout';
    content: string | string[];
    id: string;
  }[];
}

export interface BuiltinDocument {
  meta: DocumentMeta;
  pages: DocumentPageContent[];
}

export const SAMPLE_DOCUMENTS: BuiltinDocument[] = [
  {
    meta: {
      id: 'doc-cognitive-ai',
      title: 'Architectures of Machine Cognition & Attention Systems',
      author: 'Dr. Katherine Vance & Dr. Julian Thorne (MIT CSAIL)',
      year: '2026',
      totalPages: 4,
      source: 'builtin',
    },
    pages: [
      {
        pageNumber: 1,
        sections: [
          {
            type: 'heading',
            id: 'p1-s1',
            content: 'Architectures of Machine Cognition & Attention Systems',
          },
          {
            type: 'subheading',
            id: 'p1-s2',
            content: 'Section 1: Foundations of Sparse Hierarchical Representation',
          },
          {
            type: 'paragraph',
            id: 'p1-s3',
            content:
              'Modern cognitive computing relies heavily on multi-layered attention mechanisms to navigate vast dimensional search spaces. In classical transformer implementations, compute scales quadratically with sequence length, severely constraining memory bandwidth across long-context reasoning loops.',
          },
          {
            type: 'paragraph',
            id: 'p1-s4',
            content:
              'To circumvent this barrier, sparse cross-attention introduces structured routing matrices. By pruning dormant activation pathways before matrix multiplication, execution latency drops by an order of magnitude without compromising token recall fidelity.',
          },
          {
            type: 'quote',
            id: 'p1-s5',
            content:
              '"The true bottleneck of autonomous intelligence is not parameter scale, but the precision with which latent representations are routed through sparse topological manifolds."',
          },
          {
            type: 'paragraph',
            id: 'p1-s6',
            content:
              'Empirical experiments conducted across multi-modal benchmarks demonstrate that sparsity induces emergent modularity. Rather than diffusing semantic weights uniformly, discrete clusters specialize in syntax, temporal grounding, and causal deduction respectively.',
          },
          {
            type: 'bullet_list',
            id: 'p1-s7',
            content: [
              'Logarithmic cache retention under dynamic key-value compression',
              'Self-healing weight quantization with stochastic gradient damping',
              'Sub-quadratic attention routing with guaranteed Lipschitz continuity',
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        sections: [
          {
            type: 'subheading',
            id: 'p2-s1',
            content: 'Section 2: Continuous Memory Streams & Contextual Synthesis',
          },
          {
            type: 'paragraph',
            id: 'p2-s2',
            content:
              'Persistent cognition requires continuous memory retention across unbounded execution horizons. Traditional episodic buffers experience catastrophic forgetting whenever parameter updates overwrite foundational knowledge graphs.',
          },
          {
            type: 'paragraph',
            id: 'p2-s3',
            content:
              'Dual-tier memory networks mitigate this vulnerability by splitting state persistence into fast synaptic caches and slow declarative vector databases. While the fast tier handles fleeting conversational context, the slow tier continually synthesizes recurring heuristics into permanent schemas.',
          },
          {
            type: 'callout',
            id: 'p2-s4',
            content:
              'Key Architecture Rule: An agent should never store raw tokens directly into long-term declarative storage; rather, incoming signals must undergo semantic distillation into concise relational tuples.',
          },
          {
            type: 'paragraph',
            id: 'p2-s5',
            content:
              'When querying the dual-tier storage during multi-step inference, an associative routing index evaluates cosine similarity alongside temporal relevance. Stale concepts are softly decayed while frequently cited theorems remain pinned at top ranks.',
          },
          {
            type: 'paragraph',
            id: 'p2-s6',
            content:
              'Furthermore, human annotators working with continuous excerpt workflows report a 3.4x improvement in literature synthesis efficiency when disjoint textual highlights can be unified under a single semantic entity.',
          },
        ],
      },
      {
        pageNumber: 3,
        sections: [
          {
            type: 'subheading',
            id: 'p3-s1',
            content: 'Section 3: Formal Verification of Autonomous Reasoning Loops',
          },
          {
            type: 'paragraph',
            id: 'p3-s2',
            content:
              'While probabilistic neural generators achieve fluent synthesis, safety-critical domains mandate verifiable invariant preservation. Hallucination rates remain intolerable in aerospace, automated pharmacology, and cryptographic protocol verification.',
          },
          {
            type: 'paragraph',
            id: 'p3-s3',
            content:
              'We introduce neuro-symbolic verification hooks directly into the decoder layer. Prior to final token projection, generated claims are evaluated by an external SMT solver (Satisfiability Modulo Theories) to guarantee structural soundness.',
          },
          {
            type: 'quote',
            id: 'p3-s4',
            content:
              '"A model that cannot formally verify its intermediate premises will inevitably compound subtle deviations into catastrophic reasoning divergence."',
          },
          {
            type: 'bullet_list',
            id: 'p3-s5',
            content: [
              'Zero-latency symbolic proof validation on bounded arithmetic chains',
              'Automated rollback mechanisms triggered by contradiction detection',
              'Audit log compilation compatible with Notion and structured knowledge graphs',
            ],
          },
        ],
      },
      {
        pageNumber: 4,
        sections: [
          {
            type: 'subheading',
            id: 'p4-s1',
            content: 'Section 4: Future Trajectories & Collaborative Knowledge Synthesizers',
          },
          {
            type: 'paragraph',
            id: 'p4-s2',
            content:
              'As individual knowledge workers interact with increasingly dense technical literature, the boundaries between static reading and dynamic composition dissolve. Readers are no longer passive consumers; they actively annotate, weave disjoint sentences into continuous excerpts, and export insights to second-brain workspaces.',
          },
          {
            type: 'paragraph',
            id: 'p4-s3',
            content:
              'Tools engineered with high tactile responsiveness—such as fluid margin notes, synchronized continuous excerpts, and direct database exports—dramatically amplify human analytical depth. When the interface recedes, focused thought flourishes.',
          },
          {
            type: 'callout',
            id: 'p4-s4',
            content:
              'Conclusion: The synthesis of human intuition with structured reader tooling represents the most potent lever for accelerated scientific discovery.',
          },
        ],
      },
    ],
  },
  {
    meta: {
      id: 'doc-clean-architecture',
      title: 'The Pragmatic Architect: Systems That Endure',
      author: 'Elena Rostova, Principal Systems Engineer',
      year: '2025',
      totalPages: 3,
      source: 'builtin',
    },
    pages: [
      {
        pageNumber: 1,
        sections: [
          {
            type: 'heading',
            id: 'ca-p1-s1',
            content: 'The Pragmatic Architect: Systems That Endure',
          },
          {
            type: 'subheading',
            id: 'ca-p1-s2',
            content: 'Chapter 1: The Economics of Software Craftsmanship',
          },
          {
            type: 'paragraph',
            id: 'ca-p1-s3',
            content:
              'Every architectural decision is fundamentally an economic trade-off between upfront investment and downstream maintenance friction. Teams that mistake speed of initial delivery for engineering velocity inevitably accumulate compounding technical debt.',
          },
          {
            type: 'paragraph',
            id: 'ca-p1-s4',
            content:
              'Real maintainability is characterized by modular boundaries that isolate volatile external dependencies from deterministic domain logic. When your core calculations are pure and decoupled from framework intricacies, testing becomes effortless.',
          },
        ],
      },
      {
        pageNumber: 2,
        sections: [
          {
            type: 'subheading',
            id: 'ca-p2-s1',
            content: 'Chapter 2: Decoupled State Machines & Event Streams',
          },
          {
            type: 'paragraph',
            id: 'ca-p2-s2',
            content:
              'Shared mutable state across concurrent threads is the primary incubator of non-deterministic bugs. Modern distributed architectures enforce unidirectional data flow, where all state mutations are triggered by explicit typed actions.',
          },
          {
            type: 'paragraph',
            id: 'ca-p2-s3',
            content:
              'By capturing changes as a verifiable ledger of events, systems gain natural auditing, retroactive replayability, and effortless multi-device synchronization without distributed locks.',
          },
        ],
      },
      {
        pageNumber: 3,
        sections: [
          {
            type: 'subheading',
            id: 'ca-p3-s1',
            content: 'Chapter 3: Documentation as an Operating System',
          },
          {
            type: 'paragraph',
            id: 'ca-p3-s2',
            content:
              'Knowledge that resides solely in engineers’ minds evaporates upon personnel turnover. High-performing engineering organizations treat documentation, margin notes, and architectural decision records (ADRs) as first-class deployable artifacts.',
          },
          {
            type: 'paragraph',
            id: 'ca-p3-s3',
            content:
              'Exporting continuous reading notes into organized Notion databases ensures that reading insights instantly transform into actionable project roadmaps.',
          },
        ],
      },
    ],
  },
];

export const INITIAL_EXCERPTS = [
  {
    id: 'exc-demo-1',
    title: 'Sparse Cross-Attention & Memory Bandwidth',
    pageNumber: 1,
    color: 'yellow' as const,
    marginNote: 'Key architectural insight: quadratic scaling resolved through structured routing.',
    tags: ['Architecture', 'Performance', 'Deep Learning'],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    spanSummary: 'Page 1 · 2 segments',
    segments: [
      {
        id: 'seg-demo-1a',
        pageNumber: 1,
        text: 'In classical transformer implementations, compute scales quadratically with sequence length, severely constraining memory bandwidth across long-context reasoning loops.',
        color: 'yellow' as const,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        startOffset: 0,
        endOffset: 169,
        sectionId: 'p1-s3',
      },
      {
        id: 'seg-demo-1b',
        pageNumber: 1,
        text: 'By pruning dormant activation pathways before matrix multiplication, execution latency drops by an order of magnitude without compromising token recall fidelity.',
        color: 'yellow' as const,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        startOffset: 65,
        endOffset: 228,
        sectionId: 'p1-s4',
      },
    ],
  },
  {
    id: 'exc-demo-2',
    title: 'Continuous Excerpt Literature Synthesis',
    pageNumber: 2,
    color: 'green' as const,
    marginNote: 'Supports why we built continuous excerpts! Disjoint highlights unified into one thought.',
    tags: ['Productivity', 'UX Research', 'Knowledge Graph'],
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    spanSummary: 'Page 2 · 2 segments',
    segments: [
      {
        id: 'seg-demo-2a',
        pageNumber: 2,
        text: 'Dual-tier memory networks mitigate this vulnerability by splitting state persistence into fast synaptic caches and slow declarative vector databases.',
        color: 'green' as const,
        createdAt: new Date(Date.now() - 900000).toISOString(),
        startOffset: 0,
        endOffset: 151,
        sectionId: 'p2-s3',
      },
      {
        id: 'seg-demo-2b',
        pageNumber: 2,
        text: 'Furthermore, human annotators working with continuous excerpt workflows report a 3.4x improvement in literature synthesis efficiency when disjoint textual highlights can be unified under a single semantic entity.',
        color: 'green' as const,
        createdAt: new Date(Date.now() - 300000).toISOString(),
        startOffset: 0,
        endOffset: 219,
        sectionId: 'p2-s6',
      },
    ],
  },
];

export const INITIAL_COMMENTS = [
  {
    id: 'com-1',
    excerptId: 'exc-demo-1',
    pageNumber: 1,
    yPosition: 28,
    author: 'Principal Architect',
    content: 'Verify benchmark results against FlashAttention-3 on H100 clusters.',
    createdAt: new Date(Date.now() - 3500000).toISOString(),
    type: 'todo' as const,
  },
  {
    id: 'com-2',
    pageNumber: 2,
    yPosition: 42,
    author: 'Research Team',
    content: 'Consider implementing semantic distillation as an asynchronous worker queue.',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    type: 'idea' as const,
  },
];
