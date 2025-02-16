"use client";
import { UUID } from "crypto";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Rules } from "../api";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { Formula as FormulaType } from "@/lib/api";

export type DragContext = {
  draggedItem: string | undefined;
  target: UUID | undefined;
  rule: Rules | undefined;
  setDraggedItem: (item: string | undefined) => void;
  setTarget: (target: UUID | undefined) => void;
  setRule: (rule: Rules | undefined) => void;
};

export const DragContext = createContext<DragContext>({
  draggedItem: undefined,
  target: undefined,
  rule: undefined,
  setDraggedItem: () => {},
  setTarget: () => {},
  setRule: () => {},
});

export const useDragContext = () => useContext(DragContext);

export const DragProvider = ({ children }: PropsWithChildren) => {
  const [draggedItem, setDraggedItem] = useState<string | undefined>(undefined);
  const [target, setTarget] = useState<UUID | undefined>(undefined);
  const [rule, setRule] = useState<Rules | undefined>(undefined);

  const handleDragStart = (event: any) => {
    setDraggedItem(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && draggedItem) {
      setRule(draggedItem as Rules);
      setTarget(event.over.id as UUID);
      setDraggedItem(undefined);
      return;
    }
  };

  return (
    <DragContext.Provider
      value={{
        draggedItem,
        target,
        rule,
        setDraggedItem,
        setTarget,
        setRule,
      }}
    >
      <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        {children}
      </DndContext>
    </DragContext.Provider>
  );
};
