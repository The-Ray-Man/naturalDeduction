"use client";
import { UUID } from "crypto";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useListState, UseListStateHandlers } from "@mantine/hooks";
import { NodeType } from "@/lib/components/exercise/node";

export type NodesContext = {
  nodes: NodeType[] | undefined;
  handler: UseListStateHandlers<NodeType>;
  rootId: UUID | undefined;
  currentId: UUID | undefined;
  currentIdHandler: Dispatch<SetStateAction<UUID>>;
};

export const NodesContext = createContext<NodesContext>({
  nodes: undefined,
  handler: {} as UseListStateHandlers<NodeType>,
  rootId: undefined,
  currentId: undefined,
  currentIdHandler: {} as Dispatch<SetStateAction<UUID>>,
});

export const useNodesContext = () => useContext(NodesContext);

export const NodesProvider = ({ children }: PropsWithChildren) => {
  const rootId = "80375c90-d9f3-4f0f-9c60-9263c605d57a" as UUID;
  const [nodes, node_handler] = useListState([] as NodeType[]);
  const [currentId, currentIdHandler] = useState(rootId);

  return (
    <NodesContext.Provider
      value={{
        nodes: nodes,
        handler: node_handler,
        rootId: rootId,
        currentId: currentId,
        currentIdHandler: currentIdHandler,
      }}
    >
      {children}
    </NodesContext.Provider>
  );
};
