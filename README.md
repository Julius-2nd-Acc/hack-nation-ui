# Toolbox

This project is a Next.js-based frontend for visualizing and interacting with AI agent trace data as a flow diagram. It is designed for debugging, analysis, and exploration of agent/tool/resource chains and their performance. [Backend Repo](https://github.com/Julius-2nd-Acc/hack-nation-be).

## Key Fundamentals

### Running

- `npm install` to install dependencies.
- `npm run dev` to start the development server.
- Main code is in `app/components/` (nodes, sidebar, flow logic).
- Utility functions are in `app/util/`.
- To replay a node with a new prompt, select a node in the Trace tab, enter your prompt, and click Replay.

---

### 1. **Tech Stack**

- **Next.js (App Router)**: Modern React framework for SSR/SSG and routing.
- **React Flow**: Visualizes traces as interactive node/edge diagrams.
- **Material UI**: UI components (sidebar, buttons, dropdowns, etc).
- **tRPC**: Type-safe API layer for fetching trace/session data.
- **mitt**: Event emitter for node-to-sidebar communication.
- **TypeScript**: Type safety throughout the codebase.
- **Recharts**: For statistics and graph visualizations.

### 2. **Core Concepts**

- **Trace Data**: Each trace represents an event (e.g., `chain_start`, `tool_start`, `llm_end`) with timing, input/output, and parameters.
- **Nodes**: Each node in the flow represents a merged pair of trace events (e.g., tool start/end), and stores all relevant trace data.
- **Edges**: Edges represent the flow of data or control between nodes.
- **Chains**: Multiple independent chains (flows) can be visualized; users can select which chain to view.
- **Sidebar**: Clicking a node opens a sidebar with all trace details, including scrollable fields for large content.
- **Replay with Custom Prompt**: In the Trace tab, you can replay an agent node with a new prompt by entering it in the provided field and clicking Replay. (This is currently disabled for time constraints)

### 3. **Visual Aids**

- **Node Coloring**: Nodes are colored by response time (duration), transitioning from blue/salmon (fast) to yellow (medium) to red (slow).
- **Step Navigation**: Users can step through the flow to highlight the current node/edge.
- **Dropdown**: If multiple chains are present, a dropdown allows switching between them.
- **Statistics Tab**: View statistics about flows, including response times and critical nodes, with both real and sample data visualized as graphs.

### 4. **Extensibility**

- **Custom Nodes**: Agent, Tool, and Resource nodes can be extended for more detail or interactivity.
- **Trace Parsing**: The system can be adapted to new trace formats or event types.
- **UI Customization**: Material UI and React Flow allow for easy UI/UX changes.
- **Statistics/Graphs**: Easily extend the statistics tab to show more metrics or custom visualizations.

For more details, see the code comments and explore the components in `app/components/`.
