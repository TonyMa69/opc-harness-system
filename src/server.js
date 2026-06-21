require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const orchestrator = require('./orchestrator');
const PlannerAgent = require('./agents/planner');
const BuilderAgent = require('./agents/builder');
const EvaluatorAgent = require('./agents/evaluator');
const memory = require('./memory');

const app = express();
const PORT = process.env.PORT || 3000;

orchestrator.registerAgent('planner', new PlannerAgent());
orchestrator.registerAgent('builder', new BuilderAgent());
orchestrator.registerAgent('evaluator', new EvaluatorAgent());

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/tasks', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }
    const task = await orchestrator.startTask(goal);
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks', (req, res) => {
  res.json(memory.getAllTasks());
});

app.get('/api/tasks/:taskId', (req, res) => {
  const task = memory.getTask(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.listen(PORT, () => {
  console.log(`OPC/Harness System running on http://localhost:${PORT}`);
});
