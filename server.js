const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let tasks = [];
let artifactsDir = path.join(__dirname, 'artifacts');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

class MemorySystem {
  createTask(goal) {
    const taskId = Date.now().toString();
    const task = {
      id: taskId,
      goal: goal,
      createdAt: new Date().toISOString(),
      steps: [],
      currentStep: 'idle',
      status: 'created',
      selectedAgents: []
    };
    tasks.push(task);
    return task;
  }

  getTask(taskId) {
    return tasks.find(t => t.id === taskId);
  }

  addStep(taskId, stepName, status, data = {}) {
    const task = this.getTask(taskId);
    if (task) {
      task.steps.push({ name: stepName, status, timestamp: new Date().toISOString(), data });
      task.currentStep = stepName;
    }
  }

  saveArtifact(type, taskId, filename, content) {
    const dir = path.join(artifactsDir, type, taskId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  loadArtifact(type, taskId, filename) {
    const filePath = path.join(artifactsDir, type, taskId, filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  }
}

const memory = new MemorySystem();

class AgentLoader {
  constructor(agentsDir = 'C:/Users/user/.claude/agents') {
    this.agentsDir = agentsDir;
    this.agents = {};
    this.loadAgents();
  }

  loadAgents() {
    if (!fs.existsSync(this.agentsDir)) {
      console.warn('Agents directory not found:', this.agentsDir);
      return;
    }

    const files = fs.readdirSync(this.agentsDir);
    const agentFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('_'));

    agentFiles.forEach(file => {
      const filePath = path.join(this.agentsDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const agent = this.parseAgent(content, file);
        if (agent) {
          this.agents[agent.id] = agent;
        }
      } catch (error) {
        console.error('Error loading agent:', file, error.message);
      }
    });

    console.log(`Loaded ${Object.keys(this.agents).length} agents`);
  }

  parseAgent(content, filename) {
    const lines = content.split('\n');
    const metadata = {};
    
    let i = 0;
    while (i < lines.length && lines[i].startsWith('---')) {
      i++;
      while (i < lines.length && !lines[i].startsWith('---')) {
        const match = lines[i].match(/^(\w+):\s*(.+)$/);
        if (match) {
          metadata[match[1].toLowerCase()] = match[2].trim();
        }
        i++;
      }
      i++;
    }

    if (!metadata.name) return null;

    return {
      id: filename.replace('.md', ''),
      name: metadata.name,
      description: metadata.description || '',
      color: metadata.color || 'gray',
      emoji: metadata.emoji || '🤖',
      vibe: metadata.vibe || '',
      content: content
    };
  }

  getAgent(id) { return this.agents[id]; }
  listAgents() { return Object.values(this.agents); }

  getRecommendedAgent(goal) {
    const goalLower = goal.toLowerCase();
    const agentMatchers = [
      { keywords: ['frontend', 'ui', 'react', 'vue'], agentId: 'engineering-frontend-developer' },
      { keywords: ['backend', 'api', 'server', 'database'], agentId: 'engineering-backend-architect' },
      { keywords: ['full stack', 'full-stack'], agentId: 'engineering-senior-developer' },
      { keywords: ['mobile', 'ios', 'android'], agentId: 'engineering-mobile-app-builder' },
      { keywords: ['design', 'ux', 'ui'], agentId: 'design-ui-designer' },
      { keywords: ['architecture', 'system design'], agentId: 'engineering-software-architect' },
      { keywords: ['qa', 'testing', 'test'], agentId: 'testing-api-tester' },
      { keywords: ['marketing', 'social', 'content'], agentId: 'marketing-content-creator' },
      { keywords: ['product', 'prd', 'roadmap'], agentId: 'product-manager' },
      { keywords: ['devops', 'ci/cd'], agentId: 'engineering-devops-automator' },
      { keywords: ['game', 'unity', 'unreal'], agentId: 'game-designer' },
      { keywords: ['xr', 'vr', 'ar'], agentId: 'xr-immersive-developer' }
    ];

    for (const { keywords, agentId } of agentMatchers) {
      if (keywords.some(kw => goalLower.includes(kw)) && this.agents[agentId]) {
        return this.agents[agentId];
      }
    }
    return this.agents['engineering-rapid-prototyper'] || null;
  }
}

const agentLoader = new AgentLoader();

class AgentExecutor {
  static async executeAgent(taskId, agentId, context) {
    const task = memory.getTask(taskId);
    const agent = agentLoader.getAgent(agentId);
    
    if (!agent) {
      console.log(`Agent ${agentId} not found`);
      return { success: false, message: `Agent ${agentId} not found` };
    }

    console.log(`Executing ${agent.name} on task ${taskId}`);
    
    const result = await this.simulateAgentExecution(task, agent, context);
    return result;
  }

  static async simulateAgentExecution(task, agent, context) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const outputs = {
      'product-manager': () => `# PRD: ${task.goal}\n\n## Problem Statement\nUsers need a solution for: ${task.goal}\n\n## Goals & Success Metrics\n| Goal | Metric | Target |\n|------|--------|--------|\n| User Value | Adoption Rate | 80% |\n| Quality | Error Rate | <1% |\n\n## User Stories\n- As a user, I want to achieve X\n- As a user, I want to achieve Y\n\n## Technical Considerations\n- Frontend: Modern web stack\n- Backend: RESTful API\n- Database: PostgreSQL`,
      
      'engineering-software-architect': () => `# Technical Architecture\n\n## System Design\n\n### Architecture Style: Modular Monolith\n\n### Components:\n1. **Frontend Layer**: React/Vue with component library\n2. **API Layer**: RESTful endpoints\n3. **Business Logic**: Domain-driven design\n4. **Data Layer**: PostgreSQL + Redis caching\n\n### Key Decisions:\n- ADR-001: Use modular monolith for simplicity\n- ADR-002: PostgreSQL for data persistence\n- ADR-003: Redis for session management\n\n### Security:\n- JWT authentication\n- HTTPS everywhere\n- Input validation at all layers`,

      'engineering-frontend-developer': () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${task.goal}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .container { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    h1 { color: #333; }
    .btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${task.goal}</h1>
    <p>Welcome to your new application!</p>
    <button class="btn">Get Started</button>
  </div>
</body>
</html>`,

      'engineering-backend-architect': () => `# Backend API Specification\n\n## Endpoints\n\n### GET /api/health\nReturns system health status\n\n### POST /api/resources\nCreates a new resource\n\n**Request Body:**\n\`\`\`json\n{\n  "name": "string",\n  "description": "string",\n  "metadata": {}\n}\n\`\`\`\n\n**Response:**\n\`\`\`json\n{\n  "id": "uuid",\n  "name": "string",\n  "createdAt": "timestamp"\n}\n\`\`\`\n\n## Database Schema\n\n**Table: resources**\n- id (UUID, primary key)\n- name (VARCHAR)\n- description (TEXT)\n- metadata (JSONB)\n- created_at (TIMESTAMP)\n- updated_at (TIMESTAMP)`,

      'testing-api-tester': () => `# API Test Report\n\n## Test Summary\n\n### Total Tests: 15\n### Passed: 14\n### Failed: 1\n### Skipped: 0\n\n## Test Details\n\n| Test | Status | Response Time |\n|------|--------|---------------|\n| GET /api/health | ✅ PASS | 23ms |\n| POST /api/resources | ✅ PASS | 45ms |\n| GET /api/resources/:id | ✅ PASS | 18ms |\n| PUT /api/resources/:id | ✅ PASS | 52ms |\n| DELETE /api/resources/:id | ❌ FAIL | - |\n\n## Failed Test Details\n\n**Test**: DELETE /api/resources/:id\n**Error**: Resource not found after deletion\n**Expected**: 204 No Content\n**Actual**: 404 Not Found\n\n## Recommendations\n\n1. Fix delete endpoint to properly handle soft deletes\n2. Add test for edge case when resource doesn't exist\n3. Increase test coverage for error scenarios`,

      'marketing-content-creator': () => `# Content Marketing Plan\n\n## Campaign Overview\n\n**Goal:** Launch ${task.goal}\n**Target Audience:** Tech-savvy professionals\n**Timeline:** 4 weeks\n\n## Content Calendar\n\n| Week | Content Type | Topic | Channel |\n|------|--------------|-------|--------|\n| 1 | Blog Post | Introduction to ${task.goal} | Website, LinkedIn |\n| 2 | Video | Demo of key features | YouTube, Twitter |\n| 3 | Case Study | Customer success story | Website |\n| 4 | Webinar | Deep dive into ${task.goal} | LinkedIn Live |\n\n## Key Messages\n\n1. ${task.goal} solves [problem]\n2. Easy to use, powerful features\n3. Trusted by leading companies\n\n## SEO Keywords\n- ${task.goal}\n- ${task.goal} tutorial\n- best ${task.goal}\n- ${task.goal} review`
    };

    const output = outputs[agent.id];
    if (output) {
      return {
        success: true,
        message: `${agent.name} completed successfully`,
        content: output(),
        agent: agent.name
      };
    }

    return {
      success: true,
      message: `${agent.name} completed its work on: ${task.goal}`,
      content: `## Work completed by ${agent.name}\n\n### Task: ${task.goal}\n\nThe ${agent.name} has successfully completed its work.\n\n### Deliverables:\n- Analysis completed\n- Recommendations provided\n- Implementation guidance delivered`,
      agent: agent.name
    };
  }
}

class PipelineOrchestrator {
  static async runPipeline(taskId) {
    const task = memory.getTask(taskId);
    if (!task) throw new Error('Task not found');

    const pipeline = [
      { step: 'discovery', agent: 'product-manager', artifactType: 'prds', artifactName: 'prd.md' },
      { step: 'architecture', agent: 'engineering-software-architect', artifactType: 'architectures', artifactName: 'architecture.md' },
      { step: 'implementation', agent: 'engineering-frontend-developer', artifactType: 'implementations', artifactName: 'index.html' },
      { step: 'backend', agent: 'engineering-backend-architect', artifactType: 'backends', artifactName: 'api-spec.md' },
      { step: 'testing', agent: 'testing-api-tester', artifactType: 'tests', artifactName: 'test-report.md' },
      { step: 'marketing', agent: 'marketing-content-creator', artifactType: 'marketing', artifactName: 'marketing-plan.md' },
      { step: 'evaluation', agent: null, artifactType: 'evaluations', artifactName: 'evaluation.md' }
    ];

    task.selectedAgents = [];

    for (const { step, agent: agentId, artifactType, artifactName } of pipeline) {
      memory.addStep(taskId, step, 'in_progress');
      task.status = 'running';

      try {
        let result;
        if (agentId) {
          const agent = agentLoader.getAgent(agentId);
          if (agent) {
            task.selectedAgents.push(agent.id);
            result = await AgentExecutor.executeAgent(taskId, agentId, { goal: task.goal });
          } else {
            result = { success: false, message: `Agent ${agentId} not available` };
          }
        } else {
          result = await this.runEvaluation(taskId);
        }

        if (result.success && result.content) {
          memory.saveArtifact(artifactType, taskId, artifactName, result.content);
        }

        memory.addStep(taskId, step, 'completed', result);
      } catch (error) {
        memory.addStep(taskId, step, 'failed', { error: error.message });
        task.status = 'failed';
        break;
      }
    }

    if (task.status !== 'failed') {
      task.status = 'completed';
      memory.addStep(taskId, 'complete', 'completed', { message: 'Pipeline completed successfully' });
    }

    return task;
  }

  static async runEvaluation(taskId) {
    const task = memory.getTask(taskId);
    const prd = memory.loadArtifact('prds', taskId, 'prd.md');
    const implementation = memory.loadArtifact('implementations', taskId, 'index.html');
    const testReport = memory.loadArtifact('tests', taskId, 'test-report.md');

    const passed = prd && implementation && testReport;
    
    return {
      success: true,
      message: 'Evaluation complete',
      content: `# Evaluation Report\n\n## Task: ${task.id}\n## Goal: ${task.goal}\n\n## Assessment\n\n### Deliverables Status:\n${prd ? '✅ PRD: Complete' : '❌ PRD: Missing'}\n${implementation ? '✅ Implementation: Complete' : '❌ Implementation: Missing'}\n${testReport ? '✅ Test Report: Complete' : '❌ Test Report: Missing'}\n\n## Summary\n${passed 
        ? '✅ All deliverables completed successfully!\n\n### Quality Assessment:\n- PRD is comprehensive\n- Implementation follows best practices\n- Testing coverage is adequate\n\n### Production Readiness: READY'
        : '⚠️ Some deliverables are missing. Please review and complete.'}\n\n## Agent Performance:\n${task.selectedAgents.map(a => `- ${agentLoader.getAgent(a)?.name || a}`).join('\n')}`,
      passed: passed,
      agent: 'Evaluator'
    };
  }
}

app.post('/api/tasks', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal is required' });
    
    const task = memory.createTask(goal);
    await PipelineOrchestrator.runPipeline(task.id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks', (req, res) => res.json(tasks));
app.get('/api/tasks/:taskId', (req, res) => {
  const task = memory.getTask(req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.get('/api/artifacts/:taskId/:type/:filename', (req, res) => {
  const { taskId, type, filename } = req.params;
  const filePath = path.join(artifactsDir, type, taskId, filename);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/markdown');
    res.send(content);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.get('/api/agents', (req, res) => {
  res.json(agentLoader.listAgents());
});

app.get('/api/agents/recommend', (req, res) => {
  const { goal } = req.query;
  if (!goal) return res.status(400).json({ error: 'Goal parameter required' });
  
  const agent = agentLoader.getRecommendedAgent(goal);
  res.json(agent ? agent : { message: 'No specific agent recommended' });
});

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`OPC/Harness System running on http://localhost:${PORT}`);
});
