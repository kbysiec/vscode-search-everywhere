import Item from "./item";

interface WorkspaceData {
  items: Map<string, Item>;
  count: number;
}

export default WorkspaceData;
