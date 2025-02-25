import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Menu,
  Stack,
} from "@mantine/core";
import Statement from "@/lib/components/statement";
import { Rules, Statement as StatementType, useCheckMutation } from "@/lib/api";
import { useEffect, useState } from "react";
import { UUID } from "crypto";
import { useDroppable } from "@dnd-kit/core";
import DropZone from "./dropzone";
import {
  IconBadge4k,
  IconCheck,
  IconDots,
  IconFocus,
  IconFocusCentered,
  IconLayoutBottombarCollapse,
  IconTrash,
  IconZoomCheck,
  IconZoomIn,
} from "@tabler/icons-react";
import { useNodesContext } from "@/lib/hook/FormulaContext";
import { treeCompleted } from "@/lib/utils/finished";
import RuleName from "@/lib/components/rule/ruleName";

function get_child_ids(node: NodeType, all_nodes: NodeType[]): UUID[] {
  let children: UUID[] = [];
  for (let premiss of node.premisses) {
    children.push(premiss);
    children = children.concat(
      get_child_ids(
        all_nodes.find((n) => n.name == premiss) as NodeType,
        all_nodes,
      ),
    );
  }
  return children;
}

function get_parent_node(
  node: NodeType,
  all_nodes: NodeType[],
): NodeType | undefined {
  for (let n of all_nodes) {
    if (n.premisses.includes(node.name)) {
      return n;
    }
  }
  return undefined;
}

export type NodeType = {
  name: UUID;
  statement: StatementType;
  rule: Rules | undefined;
  premisses: UUID[];
};

type NodeProps = {
  node: NodeType;
  all_nodes: NodeType[];
};
const Node = ({ node, all_nodes }: NodeProps) => {
  const { rootId, nodes, handler, currentId, currentIdHandler } =
    useNodesContext();

  const isRoot = rootId == node.name;

  const [check, idk] = useCheckMutation();

  const [hidden, setHidden] = useState<boolean>(false);

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [good, setIsGood] = useState<boolean | undefined>(undefined);

  const color = good == undefined ? undefined : good ? "darkgreen" : "red";

  useEffect(() => {
    let res = treeCompleted(node, all_nodes);
    setIsCompleted(res);
  }, [node, all_nodes, hidden]);

  const deleteNode = () => {
    let parent = get_parent_node(node, all_nodes);
    if (!parent || node.name == currentId) {
      alert("Cannot delete root node");
      return;
    }
    let all_childs = get_child_ids(parent, all_nodes);
    handler.filter((n) => !all_childs.includes(n.name));
    handler.applyWhere(
      (n) => n.name == parent.name,
      (n) => {
        n.rule = undefined;
        n.premisses = [];
        return n;
      },
    );
  };

  const checkNode = async () => {
    try {
      let result = await check({ statement: node.statement }).unwrap();
      setIsGood(result as boolean);
    } catch (error) {
      setIsGood(undefined);
    }
  };

  if (!node) {
    return <></>;
  }

  return (
    <Stack m={isRoot ? 16 : 0} pt={isRoot ? 10 : 0} gap={0}>
      {hidden ? (
        <Flex gap={"xl"} justify="center" align="flex-end">
          {isCompleted ? (
            <IconCheck size={20} color={"green"} />
          ) : (
            <IconDots size={20} color={"red"} />
          )}
        </Flex>
      ) : (
        <Flex gap={"xl"} justify="center" align="flex-end">
          {node && node.premisses.length > 0 && (
            <Group align="flex-end" w={"fit-content"}>
              {node.premisses.map((premiss) => {
                return (
                  <Node
                    key={premiss}
                    all_nodes={all_nodes}
                    node={all_nodes.find((n) => n.name == premiss) as NodeType}
                  />
                );
              })}
            </Group>
          )}
          {node.premisses.length == 0 && node.rule == undefined && (
            <DropZone id={node.name} />
          )}
        </Flex>
      )}
      <Group justify="center" align="start">
        <Stack gap={0}>
          <Divider
            style={{ borderColor: "currentColor" }}
            mb={8}
            mt={node.rule == undefined ? 15 : 8}
            w={"100%"}
          ></Divider>
          <Flex justify={"center"}>
            <Statement statement={node.statement} textColor={color} />
          </Flex>
        </Stack>
        <Group
          pl={node.rule == undefined ? 5 : -10}
          mt={node.rule == undefined ? 5 : -5}
          gap={15}
        >
          {node && node.rule && (
            <Box className="katex">
              <RuleName name={node.rule} />
            </Box>
          )}
          <Menu trigger="click-hover" position="right">
            <Menu.Target>
              <IconDots size={14} />
            </Menu.Target>
            <Menu.Dropdown>
              {!isRoot && (
                <>
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    onClick={deleteNode}
                  >
                    Delete Subtree
                  </Menu.Item>
                </>
              )}
              <Menu.Item
                leftSection={<IconZoomIn size={14} />}
                onClick={() => currentIdHandler(node.name)}
              >
                Focus
              </Menu.Item>
              <Menu.Item
                leftSection={<IconLayoutBottombarCollapse size={14} />}
                onClick={() => setHidden(!hidden)}
              >
                {hidden ? "Show" : "Hide"}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconZoomCheck size={14} />}
                onClick={checkNode}
              >
                Satisfiable
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Stack>
  );
};

export default Node;
