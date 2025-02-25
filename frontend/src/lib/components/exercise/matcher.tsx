"use client";
import {
  ActionIcon,
  Box,
  Button,
  ButtonGroup,
  Center,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useDragContext } from "@/lib/hook/DragContext";
import { IconCheck } from "@tabler/icons-react";
import DerivationRule from "@/lib/components/rule/rule";
import {
  ElementMapping as ElementMappingType,
  FormulaMapping as FormulaMappingType,
  Formula as FormulaType,
  RuleIdentifier,
  useAllRulesQuery,
  useApplyRuleMutation,
  useParseMutation,
} from "@/lib/api";
import { useNodesContext } from "@/lib/hook/FormulaContext";
import { getAllIdentifiers } from "@/lib/utils/formula";
import { useEffect, useState } from "react";
import { useListState } from "@mantine/hooks";
import FormulaMapping from "./formulaMapping";
import Statement from "@/lib/components/statement";
import { NodeType } from "./node";
import { UUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import ElementMapping from "./elementMapping";

const Matcher = () => {
  const {
    rule: rule_name,
    target,
    setDraggedItem,
    setRule,
    setTarget,
  } = useDragContext();

  const { data: rules } = useAllRulesQuery();
  const { nodes, handler } = useNodesContext();

  const current_rule = rules?.find((r) => r.name == rule_name);

  const current_node = nodes?.find((n) => n.name == target);

  const [formulaIdentifier, formulaIdentifierHandler] = useListState<number>(
    [],
  );
  const [elementIdentifier, elementIdentifierHandler] = useListState<string>(
    [],
  );

  const [formulaMatcher, formulaMatcherHandler] =
    useListState<FormulaMappingType>([]);
  const [elementMatcher, elementMatcherHandler] =
    useListState<ElementMappingType>([]);

  const [counter, setCounter] = useState<number>(0);
  const [parseError, setParseError] = useState<string>("");

  const [applyRuleRequest] = useApplyRuleMutation();
  const [parseFormula] = useParseMutation();
  const [applyError, setApplyError] = useState<string | undefined>(undefined);

  const handleClick = (f: FormulaType) => {
    if (counter < formulaIdentifier.length) {
      formulaMatcherHandler.append({ from: formulaIdentifier[counter], to: f });
      setCounter(counter + 1);
    } else if (
      counter >= formulaIdentifier.length &&
      counter < formulaIdentifier.length + elementIdentifier.length
    ) {
      if (f.type === "Ident" && f.body.type === "Element") {
        elementMatcherHandler.append({
          from: elementIdentifier[counter - formulaIdentifier.length],
          to: f.body.value,
        });
        setCounter(counter + 1);
      }
    }
  };

  const handleCustomFormula = async () => {
    if (value) {
      try {
        let result = await parseFormula({
          parseParams: { formula: value },
        }).unwrap();
        const f = result as FormulaType;
        handleClick(f);
        setParseError("");
      } catch (error: any) {
        setParseError(error.data as string);
      }
    }
  };

  const applyRule = async () => {
    if (rule_name && current_node) {
      try {
        const result = await applyRuleRequest({
          applyRuleParams: {
            rule: rule_name,
            statement: current_node?.statement,
            mapping: formulaMatcher,
            substitution: elementMatcher,
          },
        }).unwrap();
        const new_uuids: UUID[] = [];
        const new_nodes = result.map((n) => {
          const id = uuidv4() as UUID;
          new_uuids.push(id);
          return {
            name: id,
            premisses: [],
            rule: undefined,
            statement: n,
          } as NodeType;
        });
        handler.append(...new_nodes);
        const updated_node = {
          name: current_node.name,
          premisses: new_uuids,
          rule: rule_name,
          statement: current_node.statement,
        } as NodeType;

        handler.applyWhere(
          (n) => n.name == current_node.name,
          () => updated_node,
        );
        setRule(undefined);
        setTarget(undefined);
        setApplyError(undefined);
        setCounter(0);
      } catch (error: any) {
        setApplyError(error.data);
      }
    }
  };

  useEffect(() => {
    if (!current_rule) {
      return;
    }
    let ident = getAllIdentifiers(current_rule);

    let formulas: number[] = [];
    let elements: string[] = [];

    for (let i of ident) {
      switch (i.type) {
        case "Formula": {
          formulas.push(i.value);
          break;
        }
        case "Element": {
          elements.push(i.value);
          break;
        }
      }
    }

    formulaIdentifierHandler.setState(formulas);
    elementIdentifierHandler.setState(elements);
  }, [current_rule]);

  const [value, setValue] = useState("");

  if (nodes && !current_node) {
    return <div>Something went wrong</div>;
  }

  if (!current_rule) {
    return <div>Something went wrong</div>;
  }

  return (
    <Modal
      opened
      onClose={() => {
        setRule(undefined);
        setTarget(undefined);
        setDraggedItem(undefined);
        setApplyError(undefined);
      }}
      size={"xl"}
      title="Apply Rule"
    >
      <Group justify={"space-around"}>
        <Stack className="katex" pt={"md"}>
          <DerivationRule
            rule={current_rule}
            highlighted={
              counter < formulaIdentifier.length
                ? formulaIdentifier[counter]
                : elementIdentifier[counter - formulaIdentifier.length]
            }
          />

          {formulaMatcher.map((m, i) => {
            return <FormulaMapping mapping={m} key={i} />;
          })}

          {elementMatcher.map((m, i) => {
            return <ElementMapping mapping={m} key={i} />;
          })}
        </Stack>

        <Stack>
          <Box pt={"xs"}>
            <Statement
              statement={current_node?.statement!}
              click={handleClick}
            />
          </Box>
          <Group>
            <TextInput
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              placeholder="Custom Formula"
              w={"80%"}
            />
            <ActionIcon onClick={handleCustomFormula}>
              <IconCheck />
            </ActionIcon>
          </Group>
          {parseError.length > 0 && (
            <Textarea disabled value={parseError} rows={6} bg={"#ff8787"} />
          )}
        </Stack>
      </Group>

      <Center pt={"md"}>
        <ButtonGroup>
          <Button
            variant="light"
            onClick={() => {
              formulaMatcherHandler.setState([]);
              elementMatcherHandler.setState([]);
              setCounter(0);
              setApplyError(undefined);
              setParseError("");
            }}
          >
            Clear
          </Button>
          <Button
            disabled={
              counter < formulaIdentifier.length + elementIdentifier.length
            }
            onClick={applyRule}
          >
            Apply
          </Button>
        </ButtonGroup>
      </Center>
      <Center>{applyError && <Text>{applyError}</Text>}</Center>
    </Modal>
  );
};

export default Matcher;
