import { NodeType } from "@/lib/components/exercise/node";

export function treeCompleted(root: NodeType, all_nodes: NodeType[]): boolean {
  if (root.rule == undefined) {
    return false;
  }
  for (let n of root.premisses) {
    let sub_complete = treeCompleted(
      all_nodes.find((node) => node.name == n) as NodeType,
      all_nodes,
    );
    if (!sub_complete) {
      return false;
    }
  }
  return true;
}
