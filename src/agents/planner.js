const memory = require('../memory');

class PlannerAgent {
  async execute(taskId) {
    const task = memory.getTask(taskId);
    console.log(`Planner agent working on task ${taskId}`);

    const prdContent = `# Product Requirements Document
## Goal
${task.goal}

## Overview
This document outlines the requirements for achieving the stated goal.

## Features
1. Core functionality to address the goal
2. Basic user interface
3. Simple implementation

## Acceptance Criteria
- The solution addresses the stated goal
- The implementation is functional
- Basic documentation is provided
`;

    const filePath = memory.saveArtifact('prds', taskId, 'prd.md', prdContent);
    
    return {
      prdPath: filePath,
      prdContent: prdContent,
      message: 'Planning complete'
    };
  }
}

module.exports = PlannerAgent;
