"use client";
import { Statement } from "@/lib/api";
import Node, { NodeType } from "./node";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import {
  ActionIcon,
  Center,
  Group,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useNodesContext } from "@/lib/hook/FormulaContext";
import { IconCopy, IconZoomCancel } from "@tabler/icons-react";
import { treeCompleted } from "@/lib/utils/finished";
import { useWindowSize } from "react-use";
import { exportToTypst } from "@/lib/utils/export";

type ExerciseProps = {
  exercise: Statement;
};

const Exercise = ({ exercise }: ExerciseProps) => {
  const { nodes, handler, rootId, currentId, currentIdHandler } =
    useNodesContext();

  const [done, setDone] = useState(false);

  const { width, height } = useWindowSize();

  useEffect(() => {
    if (nodes) {
      const root_node = nodes.find((n) => n.name == rootId);
      if (!root_node) {
        return;
      }
      const completed = treeCompleted(root_node, nodes);
      setDone(completed);
      if (completed) {
        setTimeout(() => {
          setDone(false);
        }, 5000);
      }
    }
  }, [nodes]);

  useEffect(() => {
    if (exercise && rootId) {
      const root_node = {
        name: rootId,
        premisses: [],
        rule: undefined,
        statement: exercise,
      } as NodeType;

      handler.setState([root_node]);
    }
  }, [exercise]);

  const handleTypstExport = () => {
    const root = nodes?.find(node => node.name === rootId);
    if (!root) return;
    const typstStr = exportToTypst(root, nodes || []);
    // TODO: Copy to clipboard
  }

  return (
    <>
      {done && <Confetti width={width} height={height} />}
      <Group w={"100%"}>
        <Stack w={50}>
          <ActionIcon
            onClick={() => currentIdHandler(rootId!)}
            disabled={rootId == currentId}
          >
            <IconZoomCancel />
          </ActionIcon>
          <ActionIcon disabled={!done} onClick={handleTypstExport}>
            <IconCopy  />
          </ActionIcon>
        </Stack>
        <Center w={"100%"}>
          <ScrollArea>
            {nodes && nodes.length > 0 ? (
              <Node
                node={nodes.find((n) => n.name == currentId)!}
                all_nodes={nodes}
              />
            ) : (
              <>
                <Text>Loading...</Text>
              </>
            )}
          </ScrollArea>
        </Center>
      </Group>
    </>
  );
};

export default Exercise;
