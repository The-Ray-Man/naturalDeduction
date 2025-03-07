"use client";
import {
  ElementMapping as ElementMappingType,
  FormulaMapping as FormulaMappingType,
  Formula as FormulaType,
  RuleIdentifier,
  useAllRulesQuery,
  useApplyRuleMutation,
  useParseMutation,
} from "@/lib/api";
import DerivationRule from "@/lib/components/rule/rule";
import Statement from "@/lib/components/statement";
import { useDragContext } from "@/lib/hook/DragContext";
import { useNodesContext } from "@/lib/hook/FormulaContext";
import { getAllIdentifiers } from "@/lib/utils/formula";
import {
  ActionIcon,
  Box,
  Button,
  ButtonGroup,
  Center,
  Checkbox,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import {
  IconCheck,
  IconHelp,
  IconInfoCircle,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { UUID } from "crypto";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ElementMapping from "./elementMapping";
import FormulaMapping from "./formulaMapping";
import { NodeType } from "./node";
import { getSideCondition } from "@/lib/utils/rule";
import { RuleIdent } from "../rule/ruleParts";
import Formula from "../formula/formula";
import { cornersOfRectangle } from "@dnd-kit/core/dist/utilities/algorithms/helpers";
import GrammarTooltip from "../grammarTooltip";

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

  const sideConditionText = getSideCondition(current_rule!.name);

  const allIdentifiers = getAllIdentifiers(current_rule!);

  const formulaIdentifier = allIdentifiers
    .filter((ident) => ident.type === "Formula")
    .map((ident) => ident.value);

  const elementIdentifier = allIdentifiers
    .filter((ident) => ident.type === "Element")
    .map((ident) => ident.value);

  const [formulaMatcher, formulaMatcherHandler] =
    useListState<FormulaMappingType>([]);
  const [elementMatcher, elementMatcherHandler] =
    useListState<ElementMappingType>([]);

  const [counter, setCounter] = useState<number | undefined>(0);
  const [highlighted, setHighlighted] = useState<number | string | undefined>(
    undefined,
  );
  const [parseError, setParseError] = useState<string>("");

  const [applyRuleRequest] = useApplyRuleMutation();
  const [parseFormula] = useParseMutation();
  const [sideCondition, setSideCondition] = useState(false);
  const [applyError, setApplyError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (counter == undefined || allIdentifiers == undefined) {
      setHighlighted(undefined);
    } else {
      let identifier = allIdentifiers[counter];
      setHighlighted(identifier.value);
    }
  }, [counter]);

  useEffect(() => {
    next();
  }, [formulaMatcherHandler, elementMatcherHandler]);

  const removeMapping = (mapping: FormulaMappingType | ElementMappingType) => {
    console.log("to remove", mapping);
    if (typeof mapping.from == "number") {
      let to_remove = mapping as FormulaMappingType;
      let index = formulaMatcher.findIndex(
        (m) => m.from === to_remove.from && m.to === to_remove.to,
      );
      formulaMatcherHandler.remove(index);
    } else {
      let to_remove = mapping as ElementMappingType;
      let index = elementMatcher.findIndex(
        (m) => m.from === to_remove.from && m.to === to_remove.to,
      );
      elementMatcherHandler.remove(index);
    }
  };

  const next = () => {
    if (allIdentifiers == undefined) return;
    let identifier_index = allIdentifiers
      ?.map((ident, i) => [ident, i] as [RuleIdentifier, number])
      .filter(([ident, i]) => {
        if (ident.type === "Formula") {
          return !formulaMatcher.find((m) => m.from === ident.value);
        } else {
          return !elementMatcher.find((m) => m.from === ident.value);
        }
      });
    console.log(identifier_index);
    if (identifier_index.length == 0) {
      setCounter(undefined);
      return;
    }

    if (counter == undefined) {
      let index = Math.min(...identifier_index.map(([ident, i]) => i));
      setCounter(index);

      return;
    }
    identifier_index.sort(([a, ai], [b, bi]) => {
      let dist_a = ai - counter;
      let dist_b = bi - counter;
      if (dist_a >= 0) {
        return -(dist_b - dist_a);
      } else {
        return -(dist_a - dist_b);
      }
    });
    let index = identifier_index[0][1];
    setCounter(index);
  };

  const handleClick = (f: FormulaType) => {
    if (counter == undefined) return;
    let lhs_matching = allIdentifiers[counter];
    if (
      lhs_matching.type == "Element" &&
      f.type === "Ident" &&
      f.body.type === "Element"
    ) {
      elementMatcherHandler.append({
        from: lhs_matching.value,
        to: f.body.value,
      });
      next();
      return;
    }

    if (lhs_matching.type === "Formula") {
      formulaMatcherHandler.append({ from: lhs_matching.value, to: f });
      next();
    }
  };

  const handleCustomFormula = async () => {
    if (customFormula) {
      try {
        let result = await parseFormula({
          parseParams: { formula: customFormula },
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
            statement: {
              formula: current_node.statement.formula,
              lhs: current_node.statement.lhs,
              sidecondition: current_node.statement.sidecondition,
            },
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

  const [customFormula, setCustomFormula] = useState("");

  if (!current_rule) {
    return <div>Something went wrong</div>;
  }

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
        <Stack pt={"md"}>
          <Box className="katex">
            <DerivationRule rule={current_rule} highlighted={highlighted} />
          </Box>

          {allIdentifiers?.map((i, index) => {
            let rhs = undefined;
            let mapping = undefined;
            if (i.type == "Formula") {
              rhs = formulaMatcher.find((m, j) => {
                return m.from === i.value;
              })?.to;
              mapping = {
                from: i.value,
                to: rhs,
              } as FormulaMappingType;
            } else {
              let name = elementMatcher.find((m, j) => {
                return m.from === i.value;
              })?.to;
              if (name) {
                rhs = {
                  type: "Ident",
                  body: { type: "Element", value: name },
                } as FormulaType;
                mapping = {
                  from: i.value,
                  to: name,
                } as ElementMappingType;
              }
            }
            return (
              <Group key={index} w={"100%"} p={0}>
                <RuleIdent
                  key={index}
                  rule={{ type: "Ident", body: i }}
                  highlighted={highlighted}
                />
                <Text>{"\u2261"}</Text>
                {rhs && mapping && (
                  <Group
                    justify="space-between"
                    styles={{ root: { flexGrow: "1" } }}
                    p={0}
                  >
                    <Formula formula={rhs} />
                    <ActionIcon
                      variant="transparent"
                      onClick={() => removeMapping(mapping)}
                    >
                      <IconX />
                    </ActionIcon>
                  </Group>
                )}
              </Group>
            );
          })}
          {current_node && (
            <Group styles={{ root: { visibility: "hidden" } }}>
              <Statement statement={current_node?.statement} />
            </Group>
          )}
        </Stack>

        <Stack>
          <Text maw={300}>
            Match the highlighted part by clicking on the formula.
          </Text>
          <Text maw={300}>
            If you need a formula not present in your statement, use the input
            field.
          </Text>
          <Center pt={"xs"}>
            <Statement
              statement={current_node?.statement!}
              click={handleClick}
            />
          </Center>
          <Group wrap="nowrap" gap={"xs"}>
            <TextInput
              value={customFormula}
              onChange={(event) => setCustomFormula(event.currentTarget.value)}
              placeholder="Custom Formula"
              w={"100%"}
              rightSection={
                <ActionIcon onClick={handleCustomFormula} variant="transparent">
                  <IconPlus />
                </ActionIcon>
              }
            />
            <Tooltip label={<GrammarTooltip />}>
              <IconHelp />
            </Tooltip>
          </Group>
          {parseError.length > 0 && (
            <Textarea disabled value={parseError} rows={6} bg={"#ff8787"} />
          )}
        </Stack>
      </Group>
      {sideConditionText && (
        <Checkbox
          checked={sideCondition}
          onChange={(event) => setSideCondition(event.currentTarget.checked)}
          label={sideConditionText}
        />
      )}

      <Center pt={"xl"}>
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
              counter != undefined ||
              (sideConditionText != undefined && !sideCondition)
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
