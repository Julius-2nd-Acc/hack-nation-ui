# Hack Nation UI

This project is a Next.js-based frontend for visualizing and interacting with AI agent trace data as a flow diagram. It is designed for debugging, analysis, and exploration of agent/tool/resource chains and their performance. [Backend Repo](https://github.com/Julius-2nd-Acc/hack-nation-be).

### WHAT IS CURRENTLY MOST IMPORTANT

- The tRPC router is located in `app/server/routers/python.ts`. Only modify API-related calls here and in the frontend.
- Most important visuals are in the `app/components` directory.
- The flow route is located at `app/trace` (accessible via "localhost:3000/trace").
- For React Flow tutorials and documentation, refer to [React Flow](https://reactflow.dev/).
- Mitt is used for emitting events, including those that trigger displaying trace details in the sidebar.

### WHAT NEEDS TO BE DONE

- Add chatting functionality.
- Change polling behavior: currently, polling is done only once; it should continue as long as a chain has stopped.
- Update the Homepage (a basic system is already in place).
- Develop the Graphs tab (to display token consumption, similar to Langsmith).
- Implement autofocus on the center of the flow.

## Key Fundamentals

### 1. **Tech Stack**

- **Next.js (App Router)**: Modern React framework for SSR/SSG and routing.
- **React Flow**: Visualizes traces as interactive node/edge diagrams.
- **Material UI**: UI components (sidebar, buttons, dropdowns, etc).
- **tRPC**: Type-safe API layer for fetching trace/session data.
- **mitt**: Event emitter for node-to-sidebar communication.
- **TypeScript**: Type safety throughout the codebase.

### 2. **Core Concepts**

- **Trace Data**: Each trace represents an event (e.g., `chain_start`, `tool_start`, `llm_end`) with timing, input/output, and parameters.
- **Nodes**: Each node in the flow represents a merged pair of trace events (e.g., tool start/end), and stores all relevant trace data.
- **Edges**: Edges represent the flow of data or control between nodes.
- **Chains**: Multiple independent chains (flows) can be visualized; users can select which chain to view.
- **Sidebar**: Clicking a node opens a sidebar with all trace details, including scrollable fields for large content.

### 3. **Visual Aids**

- **Node Coloring**: Nodes are colored by response time (duration), transitioning from blue/salmon (fast) to yellow (medium) to red (slow).
- **Step Navigation**: Users can step through the flow to highlight the current node/edge.
- **Dropdown**: If multiple chains are present, a dropdown allows switching between them.

### 4. **Extensibility**

- **Custom Nodes**: Agent, Tool, and Resource nodes can be extended for more detail or interactivity.
- **Trace Parsing**: The system can be adapted to new trace formats or event types.
- **UI Customization**: Material UI and React Flow allow for easy UI/UX changes.

### 5. **Development**

- `npm install` to install dependencies.
- `npm run dev` to start the development server.
- Main code is in `app/components/` (nodes, sidebar, flow logic).
- Utility functions are in `app/util/`.

---

For more details, see the code comments and explore the components in `app/components/`.
