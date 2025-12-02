# Future Integrations & Features

## 🤖 AI Case Generation System

### Overview
Enable students to practice with AI-generated diagnostic cases and allow professors to create custom cases with AI assistance.

---

## Part 1: Professor Case Builder

### Features
- Interactive 3D model for selecting faulty parts
- Form-based case creation interface
- AI-assisted content generation (descriptions, repair procedures)
- Preview & test mode before publishing
- Save to Supabase database

### Interface Design
```
┌─────────────────────────────────────────┐
│ Create Diagnostic Case                  │
├─────────────────────────────────────────┤
│ System: [Brakes ▼]                      │
│ Difficulty: [Intermediate ▼]             │
│ Title: [________________________________]│
│                                          │
│ Customer Complaint (what they say):     │
│ [_____________________________________] │
│                                          │
│ Vehicle Info:                            │
│ [_____________________________________] │
│                                          │
│ Select Faulty Parts (click on 3D model):│
│ ┌─────────────────────────────────────┐│
│ │        [3D Model Here]               ││
│ │  Selected: brake_pad_front_left ✓    ││
│ └─────────────────────────────────────┘│
│                                          │
│ Tool Readings:                           │
│ ├─ Scanner Readings                      │
│ ├─ Multimeter Readings                   │
│ └─ Caliper Readings (auto-generate)     │
│                                          │
│ Diagnoses (add 4 options):               │
│ ┌─ ✓ Worn Brake Pads (correct)          │
│ ├─ ○ Warped Rotors                      │
│ ├─ ○ Stuck Caliper                      │
│ └─ ○ Low Brake Fluid                    │
│                                          │
│ Repair Procedure:                        │
│ [AI Generate] [Manual Entry]             │
│                                          │
│ [Preview] [Save Case] [Cancel]           │
└─────────────────────────────────────────┘
```

### Database Schema
```sql
CREATE TABLE diagnostic_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES professors(id),
  is_ai_generated BOOLEAN DEFAULT false,
  system VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  customer_complaint TEXT NOT NULL,
  vehicle_info TEXT NOT NULL,
  faulty_parts JSONB NOT NULL,
  tool_readings JSONB NOT NULL,
  options JSONB NOT NULL,
  correct_diagnosis VARCHAR(100) NOT NULL,
  explanation TEXT NOT NULL,
  repair_procedure JSONB NOT NULL,
  estimated_cost VARCHAR(50),
  time_to_complete VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  course_id UUID REFERENCES courses(id)
);

CREATE INDEX idx_diagnostic_cases_system ON diagnostic_cases(system);
CREATE INDEX idx_diagnostic_cases_difficulty ON diagnostic_cases(difficulty);
CREATE INDEX idx_diagnostic_cases_created_by ON diagnostic_cases(created_by);
CREATE INDEX idx_diagnostic_cases_course ON diagnostic_cases(course_id);
```

### Data Structure
```javascript
{
  id: 'prof_case_001',
  created_by: 'professor_uuid',
  is_ai_generated: false,
  system: 'brakes',
  difficulty: 'Intermediate',
  title: 'Squealing Noise When Braking',
  customerComplaint: 'My car makes a loud squealing noise...',
  vehicleInfo: '2018 Honda Civic, 45,000 miles',
  faultyParts: ['brake_pad_front_left', 'brake_pad_front_right'],
  toolReadings: {
    caliper: {
      brake_pad_front_left: { 
        value: 2.0, 
        unit: 'mm', 
        status: 'FAIL', 
        spec: '3mm min' 
      }
    }
  },
  options: [
    { 
      id: 'worn_pads', 
      label: 'Worn Brake Pads', 
      description: 'Brake pads below minimum thickness' 
    }
  ],
  correctDiagnosis: 'worn_pads',
  explanation: 'The brake pads are worn...',
  repairProcedure: [
    '1. Lift vehicle and secure on jack stands',
    '2. Remove wheel and tire assembly'
  ],
  estimatedCost: '$150-$250',
  timeToComplete: '1-2 hours'
}
```

---

## Part 2: AI Practice Case Generator

### Student Flow

#### 1. Random Generation Mode (Quick Practice)
```
┌──────────────────────────────────────────┐
│ 🤖 AI Practice Mode                      │
├──────────────────────────────────────────┤
│ What do you want to practice?            │
│                                           │
│ System: [Select System ▼]                │
│  ┌─ Engine                               │
│  ├─ Brakes                               │
│  ├─ Transmission                         │
│  └─ ... (all 7 systems)                  │
│                                           │
│ Difficulty: [○ Easy ● Medium ○ Hard]     │
│                                           │
│ [🎲 Generate Random Case]                │
└──────────────────────────────────────────┘
```

**AI generates:**
- Random faulty parts selection
- Realistic customer complaint
- 4 plausible diagnosis options
- Tool readings with realistic values
- Complete repair procedure
- Cost and time estimates

#### 2. Custom Generation Mode (Targeted Practice)
```
┌──────────────────────────────────────────┐
│ 🎯 Custom Practice Case                  │
├──────────────────────────────────────────┤
│ 1. Select Faulty Parts:                  │
│   ┌─────────────────────────────────────┐│
│   │     [Interactive 3D Model]           ││
│   │  □ brake_pad_front_left              ││
│   │  □ brake_pad_front_right             ││
│   │  □ brake_rotor_front                 ││
│   └─────────────────────────────────────┘│
│                                           │
│ 2. Symptom Type:                         │
│   □ Noise (squealing, grinding, etc.)    │
│   □ Vibration                            │
│   □ Leak (fluid)                         │
│   □ Warning Light                        │
│                                           │
│ 3. Severity:                             │
│   ○ Minor  ● Moderate  ○ Severe          │
│                                           │
│ [🎯 Generate Custom Case]                │
└──────────────────────────────────────────┘
```

**Student controls:**
- Which parts are faulty (checkboxes on 3D model)
- Type of symptom (noise, vibration, leak, warning light)
- Severity level (minor, moderate, severe)

**AI generates:**
- Customer complaint matching student's selections
- Diagnosis options (with common misdiagnoses)
- Tool readings showing the selected faults
- Step-by-step repair guide

---

## Part 3: AI Implementation

### AI Provider Options

#### Option A: OpenAI GPT-4 (Recommended)
**Pros:**
- Most reliable for structured data generation
- Excellent automotive technical knowledge
- Consistent JSON output formatting
- Good at following complex instructions

**Cons:**
- Requires API key
- Cost: ~$0.01-0.03 per case
- Need to handle rate limits

**Setup:**
```javascript
// .env
VITE_OPENAI_API_KEY=sk-...

// src/services/aiCaseGenerator.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side (move to backend later)
});
```

#### Option B: Google Gemini
**Pros:**
- Free tier available (60 requests/minute)
- Good for educational use
- Multimodal (can analyze 3D screenshots)
- No credit card required initially

**Cons:**
- Slightly less consistent with JSON formatting
- Rate limits on free tier

**Setup:**
```javascript
// .env
VITE_GOOGLE_AI_KEY=...

// Using @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY);
```

#### Option C: Claude (Anthropic)
**Pros:**
- Excellent instruction following
- Lower hallucination rate
- Good safety guardrails
- Great for technical content

**Cons:**
- Requires API key
- Similar cost to OpenAI
- Need to manage rate limits

#### Option D: Local LLM (Ollama)
**Pros:**
- Completely free
- No API rate limits
- Privacy (no data sent externally)
- Works offline

**Cons:**
- Requires local installation
- Slower generation
- Lower quality than cloud models
- Need powerful machine

### AI Prompt Engineering

#### Example Prompt for Random Generation:
```javascript
const generateRandomCasePrompt = (system, difficulty) => `
You are an expert automotive diagnostic instructor creating realistic training cases.

REQUIREMENTS:
- System: ${system}
- Difficulty: ${difficulty}
- Generate a realistic diagnostic scenario

GENERATE:
1. Customer complaint (realistic quote from vehicle owner, 1-2 sentences)
2. Vehicle information (make, model, year, mileage - make it realistic)
3. 1-3 faulty parts from this system (realistic combination)
4. Four diagnosis options (one correct, three plausible but incorrect)
5. Tool readings showing the fault (use appropriate tools for the system)
6. Clear explanation of the problem
7. 8-10 step repair procedure
8. Realistic cost estimate (parts + labor)
9. Time estimate

IMPORTANT RULES:
- Use realistic part names matching 3D model (brake_pad_front_left, spark_plug_cylinder_3, etc.)
- Tool readings must be numerically accurate (brake pads: 1-12mm, voltage: 0-14V, etc.)
- Costs should be realistic for 2024 ($50-500 for most repairs)
- Time: 0.5-4 hours for most repairs
- Incorrect diagnoses should be PLAUSIBLE misdiagnoses, not random

OUTPUT FORMAT (strict JSON):
{
  "title": "Brief descriptive title",
  "customerComplaint": "What the customer says",
  "vehicleInfo": "Year Make Model, mileage",
  "faultyParts": ["part_name_1", "part_name_2"],
  "toolReadings": {
    "scanner": {...},
    "multimeter": {...},
    "caliper": {...}
  },
  "options": [
    {"id": "diagnosis_id", "label": "Label", "description": "Description"}
  ],
  "correctDiagnosis": "diagnosis_id",
  "explanation": "Technical explanation",
  "repairProcedure": ["Step 1", "Step 2", ...],
  "estimatedCost": "$XXX-$YYY",
  "timeToComplete": "X-Y hours"
}

Generate the case now:
`;
```

#### Example Prompt for Custom Generation:
```javascript
const generateCustomCasePrompt = (system, faultyParts, symptomType, severity) => `
You are an expert automotive diagnostic instructor.

STUDENT SELECTIONS:
- System: ${system}
- Faulty Parts: ${faultyParts.join(', ')}
- Symptom Type: ${symptomType}
- Severity: ${severity}

Create a realistic diagnostic case where the customer experiences ${symptomType} symptoms 
at ${severity} severity level, caused by the selected faulty parts.

[... rest of prompt similar to above ...]
`;
```

### Implementation Files

#### `/src/services/aiCaseGenerator.js`
```javascript
export class AICaseGenerator {
  constructor(apiKey, provider = 'openai') {
    this.apiKey = apiKey;
    this.provider = provider;
    // Initialize client based on provider
  }

  async generateRandomCase(system, difficulty) {
    // Call AI API with prompt
    // Validate response
    // Return formatted case
  }

  async generateCustomCase(system, faultyParts, symptomType, severity) {
    // Call AI API with custom prompt
    // Validate response
    // Return formatted case
  }

  validateCase(caseData) {
    // Ensure all required fields present
    // Validate tool readings are realistic
    // Check part names exist in system
    // Return true/false + errors
  }
}
```

#### `/src/views/student/AIPracticeMode.jsx`
```javascript
// New component for AI practice interface
// System selector
// Difficulty selector
// Generate button
// Loading state
// Preview generated case
// Start practice button
```

#### `/src/views/professor/CaseBuilder.jsx`
```javascript
// New component for professor case creation
// 3D model with part selection
// Form for case details
// AI-assist buttons
// Preview mode
// Save to database
```

---

## Part 4: Smart Features

### Quality Control
- **AI Review Queue**: AI-generated cases reviewed by professor before publishing
- **Student Feedback**: "Was this case realistic?" rating system
- **Auto-Validation**: Flag unrealistic values (brake pad thickness < 0mm, voltage > 15V)
- **Version History**: Track edits to professor-created cases

### Adaptive Difficulty
- **Performance Tracking**: Track student accuracy per system
- **Dynamic Generation**: Generate harder cases after consecutive correct answers
- **Weak Area Focus**: Generate more cases for struggling topics
- **Personalized Practice**: AI learns student's weak points

### Part Selection Intelligence
- **Compatibility Rules**: Can't select incompatible parts together
- **Common Patterns**: Worn brake pads often → scored rotors
- **Seasonal Issues**: More battery cases in winter, AC in summer
- **Realistic Combinations**: Parts that actually fail together

### Tool Reading Generation
```javascript
// Smart tool reading generator
const generateToolReadings = (system, faultyParts) => {
  const readings = {};
  
  // For each compatible tool with this system
  toolCompatibility[system].forEach(tool => {
    readings[tool] = {};
    
    // For each faulty part
    faultyParts.forEach(part => {
      // Generate realistic FAIL reading
      readings[tool][part] = generateRealisticReading(tool, part, 'FAIL');
    });
    
    // Add some OK readings for context
    const healthyParts = getHealthyParts(system, faultyParts);
    healthyParts.slice(0, 2).forEach(part => {
      readings[tool][part] = generateRealisticReading(tool, part, 'OK');
    });
  });
  
  return readings;
};
```

---

## Part 5: Implementation Roadmap

### Phase 1: Database & Core Structure (Week 1)
- [x] Create diagnostic_cases table in Supabase
- [ ] Add CRUD functions for cases
- [ ] Test data insertion/retrieval
- [ ] Set up Row Level Security policies

### Phase 2: Professor Case Builder (Week 2)
- [ ] Build case creation form UI
- [ ] Integrate 3D model for part selection
- [ ] Add tool readings input
- [ ] Create preview mode
- [ ] Implement save to database
- [ ] Add edit/delete functionality

### Phase 3: AI Integration - Basic (Week 3)
- [ ] Choose AI provider (OpenAI recommended)
- [ ] Set up API credentials
- [ ] Create prompt templates
- [ ] Build aiCaseGenerator service
- [ ] Add "Generate Random Case" button
- [ ] Implement response validation
- [ ] Add error handling

### Phase 4: AI Integration - Advanced (Week 4)
- [ ] Build custom case generation UI
- [ ] Add 3D part picker for students
- [ ] Implement symptom/severity selection
- [ ] Create custom prompt generation
- [ ] Add loading states and progress
- [ ] Test edge cases

### Phase 5: Smart Features (Week 5)
- [ ] Add case quality validation
- [ ] Implement student feedback system
- [ ] Create adaptive difficulty algorithm
- [ ] Add performance tracking
- [ ] Build review queue for AI cases

### Phase 6: Polish & Testing (Week 6)
- [ ] User testing with students
- [ ] Gather feedback
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation

---

## Part 6: Cost Estimation

### AI API Costs (OpenAI GPT-4)
- Input: ~1,000 tokens per prompt = $0.01
- Output: ~1,500 tokens per response = $0.02
- **Total per case: ~$0.03**

### Monthly Estimates:
- 100 students × 10 practice cases/month = 1,000 cases
- 1,000 cases × $0.03 = **$30/month**

### Alternative: Free Tier (Google Gemini)
- 60 requests/minute
- 1,500 requests/day
- **Enough for ~50,000 cases/month FREE**

---

## Part 7: Security & Best Practices

### API Key Security
```javascript
// ❌ DON'T: Expose API key in frontend
const apiKey = 'sk-1234567890abcdef';

// ✅ DO: Call backend endpoint
const response = await fetch('/api/generate-case', {
  method: 'POST',
  body: JSON.stringify({ system, difficulty })
});
```

### Backend Implementation (Recommended)
```javascript
// Backend endpoint (Express.js example)
app.post('/api/generate-case', async (req, res) => {
  const { system, difficulty, userId } = req.body;
  
  // Verify user is authenticated
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  // Rate limiting (max 10 cases per hour per user)
  const usage = await checkUserUsage(userId);
  if (usage > 10) return res.status(429).json({ error: 'Rate limit exceeded' });
  
  // Generate case
  const caseData = await aiGenerator.generateRandomCase(system, difficulty);
  
  // Save to database
  const savedCase = await db.diagnostic_cases.insert({
    ...caseData,
    is_ai_generated: true,
    created_by: userId
  });
  
  res.json(savedCase);
});
```

### Rate Limiting
- Students: 10 AI cases per hour
- Professors: 50 AI assists per hour
- Prevent abuse and manage costs

---

## Part 8: Testing Strategy

### Unit Tests
```javascript
describe('AICaseGenerator', () => {
  it('should generate valid case structure', async () => {
    const caseData = await generator.generateRandomCase('brakes', 'Easy');
    expect(caseData).toHaveProperty('title');
    expect(caseData).toHaveProperty('faultyParts');
    expect(caseData.options).toHaveLength(4);
  });

  it('should validate tool readings are realistic', () => {
    const isValid = generator.validateToolReadings({
      caliper: { brake_pad: { value: 2.0, unit: 'mm' } }
    });
    expect(isValid).toBe(true);
  });
});
```

### Integration Tests
- Test full flow: Select system → Generate → Save → Load → Practice
- Verify database constraints
- Test error handling

### User Acceptance Testing
- Have actual students try AI practice mode
- Gather feedback on case realism
- Measure completion rates

---

## Part 9: Future Enhancements

### Advanced AI Features
- **Multi-fault scenarios**: 2-3 interconnected problems
- **Progressive difficulty**: Cases get harder as student improves
- **Conversational AI**: Chat with virtual customer for more details
- **Image generation**: AI generates photos of damaged parts

### Gamification
- **Achievement**: "AI Master" - Complete 50 AI cases
- **Leaderboard**: Top AI practice scores
- **Daily challenge**: Random AI case each day

### Analytics Dashboard
- Professor sees: "Which AI-generated cases are hardest?"
- Student sees: "Your AI practice stats"
- System metrics: AI generation success rate, average cost

---

## Questions to Answer Before Implementation

1. **AI Provider**: OpenAI (paid) or Google Gemini (free tier)?
2. **Backend Required**: Use Supabase Edge Functions or separate backend?
3. **Cost Limit**: Max $ per month for AI generation?
4. **Review Process**: All AI cases reviewed, or auto-publish with feedback?
5. **Part Library**: Do we need to maintain a list of valid part names?

---

## Contact for Implementation

When ready to implement, provide:
- [ ] Chosen AI provider + API key
- [ ] Budget for AI costs (if using paid)
- [ ] Priority features (professor builder vs AI practice)
- [ ] Timeline preferences

---

**Document Version**: 1.0  
**Last Updated**: December 1, 2024  
**Status**: Pending Implementation
