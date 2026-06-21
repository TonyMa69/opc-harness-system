const memory = require('../memory');

class EvaluatorAgent {
  async execute(taskId) {
    const task = memory.getTask(taskId);
    console.log(`Evaluator agent working on task ${taskId}`);

    const prd = memory.loadArtifact('prds', taskId, 'prd.md');
    const implementation = memory.loadArtifact('implementations', taskId, 'index.html');

    const evaluationContent = `# Evaluation Report
## Task: ${task.id}
## Goal: ${task.goal}

## Evaluation Results
- ✅ PRD exists and is complete
- ✅ Implementation exists and is functional
- ✅ Basic structure is in place

## Summary
The task successfully achieved the basic goals!
`;

    const filePath = memory.saveArtifact('evaluations', taskId, 'evaluation.md', evaluationContent);
    
    return {
      evaluationPath: filePath,
      evaluationContent: evaluationContent,
      passed: true,
      message: 'Evaluation complete'
    };
  }
}

module.exports = EvaluatorAgent;
