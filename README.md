# OPC/Harness System

A simple autonomous multi-agent system inspired by the "One Person Company" (OPC) and Harness Engineering concepts!

## What is this?

This is a minimal viable version of an OPC/Harness system with:
- **Orchestrator**: Manages the workflow state machine
- **Memory System**: Tracks artifacts (PRDs, implementations, evaluations) and task state
- **Agents**: Planner, Builder, and Evaluator agents that work together
- **Simple Web UI**: To interact with the system

## Project Structure

```
opc-harness-system/
├── src/
│   ├── agents/          # Our agents live here
│   │   ├── planner.js   # Creates PRDs
│   │   ├── builder.js   # Builds implementations
│   │   └── evaluator.js # Evaluates results
│   ├── memory.js        # Memory system (stores artifacts and state)
│   ├── orchestrator.js  # Core workflow manager
│   └── server.js        # Express web server
├── public/              # Frontend UI
│   └── index.html
├── artifacts/           # Where generated files are stored
│   ├── prds/
│   ├── designs/
│   ├── implementations/
│   └── evaluations/
├── package.json
└── README.md
```

## How to Run

1. Make sure you have Node.js installed (we used v24.14.1)
2. Open a terminal in the `opc-harness-system` directory
3. Run `npm install` (if you haven't already)
4. Run `npm start`
5. Open your browser and go to `http://localhost:3000`

## How to Use

1. Type a goal in the text area (e.g., "Create a simple to-do list app")
2. Click "Start Task"
3. Watch the system progress through the steps!

## What's Next?

This is just a starting point! Future improvements could include:
- Integrating real LLMs (OpenAI, Anthropic, etc.)
- More sophisticated agents
- Benchmark system for evaluator self-improvement
- Better error handling and retries
- And much more!
