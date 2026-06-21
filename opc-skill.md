---
name: OPC/Harness System
description: Autonomous multi-agent workflow orchestrator for product development
color: purple
emoji: 🤖
vibe: Your personal development team - product manager, architects, developers, testers all in one.
---

# OPC/Harness System Skill

## Overview
This skill provides access to the OPC/Harness autonomous development pipeline. It orchestrates multiple specialized agents to deliver complete projects from concept to production-ready deliverables.

## Available Commands

### 1. Create Task
**Usage:**
```
/opc create "Your project goal"
```

**Example:**
```
/opc create "Build a customer portal with authentication"
```

### 2. List Tasks
**Usage:**
```
/opc list
```

### 3. Get Artifact
**Usage:**
```
/opc artifact <taskId> <type> <filename>
```

**Artifact Types:**
- `prds` - Product Requirements Document
- `architectures` - System Architecture
- `implementations` - Frontend Code
- `backends` - API Specification
- `tests` - Test Report
- `marketing` - Marketing Plan
- `evaluations` - Final Evaluation

**Example:**
```
/opc artifact 1780111815587 prds prd.md
```

### 4. List Agents
**Usage:**
```
/opc agents
```

## Pipeline Phases
The system automatically runs these phases:
1. **Discovery** - Product Manager creates PRD
2. **Architecture** - Software Architect designs system
3. **Implementation** - Frontend Developer builds UI
4. **Backend** - Backend Architect designs API
5. **Testing** - QA Tester validates quality
6. **Marketing** - Content Creator plans launch
7. **Evaluation** - Final review

## Tips for Effective Use

### For Product Development
```
/opc create "Develop a SaaS project management tool"
```

### For Technical Design
```
/opc create "Design scalable microservices architecture for e-commerce"
```

### For Content Creation
```
/opc create "Create marketing campaign for new product launch"
```

## Output Location
All artifacts are saved to:
`D:\Projects\Trae_CN\opc-harness-system\artifacts\`
