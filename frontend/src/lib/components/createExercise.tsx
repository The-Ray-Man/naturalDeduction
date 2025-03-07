import {
  ActionIcon,
  Box,
  Button,
  ButtonGroup,
  Card,
  Center,
  Divider,
  Grid,
  Group,
  Indicator,
  List,
  ListItem,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure, useListState } from "@mantine/hooks";
import {
  IconCheck,
  IconCirclePlus,
  IconCircleX,
  IconHelp,
  IconInfoCircle,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  Formula as FormulaType,
  Identifier as IdentifierType,
  SideCondition as SideConditionType,
  Statement as StatementType,
  useCheckMutation,
  useCreateExerciseMutation,
  useGetExercisesQuery,
  useParseMutation,
} from "../api";
import { showError, showInfo } from "../utils/notifications";
import Formula from "./formula/formula";
import GrammarTooltip from "./grammarTooltip";
import Statement from "./statement";
import { getAllPlaceholders } from "../utils/formula";
import { Identifier } from "./formula/formulaParts";

const CreateExerciseForm = () => {
  const [opened, { open, close }] = useDisclosure(false);

  const [[lhsFormulaStr, rhsFormulaStr], setFormulaStr] = useState<
    [string, string]
  >(["", ""]);
  const [debouncedLhsFormulaStr] = useDebouncedValue(lhsFormulaStr, 150);
  const [debouncedRhsFormulaStr] = useDebouncedValue(rhsFormulaStr, 150);

  // Api Calls
  const [parseFormula] = useParseMutation();
  const [addExercise] = useCreateExerciseMutation();
  const [checkTautology] = useCheckMutation();

  // Exercise parts
  const [lhs, lhsHandler] = useListState<FormulaType>([]);
  const [rhs, rhsHandler] = useState<FormulaType | undefined>(undefined);
  const [sideCon, sideConHandler] = useListState<SideConditionType>([]);

  const [placeholders, setPlaceholders] = useListState<IdentifierType>([]);
  const [elemente, setElemente] = useListState<IdentifierType>([]);

  // input controle
  const [lhsFormula, lhsFormulaHandler] = useState<FormulaType | undefined>(
    undefined,
  );
  const [rhsFormula, rhsFormulaHandler] = useState<FormulaType | undefined>(
    undefined,
  );
  const [parseError, setParseError] = useState<string | undefined>(undefined);

  // Sideconditions
  const [ScElement, setScElement] = useState<IdentifierType | undefined>(
    undefined,
  );
  const [ScPlaceholder, setScPlaceholder] = useState<
    IdentifierType | undefined
  >(undefined);

  // controle
  const [hasRhs, setHasRhs] = useState<boolean>(false);
  const [isTautology, setIsTautology] = useState<boolean>(false);

  const statement = {
    lhs: lhs,
    formula: rhs,
    sidecondition: sideCon,
  } as StatementType;

  const checkTautologyAsync = async () => {
    if (rhs) {
      try {
        let result = await checkTautology({
          createExerciseRequest: {
            statement: {
              formula: rhs,
              lhs: lhs || [],
              sidecondition: sideCon,
            },
          },
        }).unwrap();
        setIsTautology(result as boolean);
      } catch (error: any) {
        console.error(error.data);
      }
    } else {
      // setIsPossible(false);
    }
  };

  useEffect(() => {
    checkTautologyAsync();
  }, [rhs, lhs, sideCon]);

  useEffect(() => {
    // alert("getAllPlaceholders");

    let vars = [...getAllPlaceholders(lhs, rhs)];

    let placeholder = vars.filter((v) => v.type === "Literal");
    let elem = vars.filter((v) => v.type === "Element");

    placeholder = placeholder.filter(
      (item, idx, arr) =>
        arr.findIndex((el) => el.value === item.value) === idx,
    );
    elem = elem.filter(
      (item, idx, arr) =>
        arr.findIndex((el) => el.value === item.value) === idx,
    );

    setPlaceholders.setState(placeholder);
    setElemente.setState(elem);

    setHasRhs(rhs !== undefined);
  }, [lhs, rhs]);

  useEffect(() => {
    if (!debouncedLhsFormulaStr) return;
    parseFormulaRequest(debouncedLhsFormulaStr, true);
  }, [debouncedLhsFormulaStr]);

  useEffect(() => {
    if (!debouncedRhsFormulaStr) return;
    parseFormulaRequest(debouncedRhsFormulaStr, false);
  }, [debouncedRhsFormulaStr]);

  const parseFormulaRequest = async (formula: string, lhs: boolean) => {
    if (lhs) {
      rhsFormulaHandler(undefined);
    } else {
      lhsFormulaHandler(undefined);
    }
    try {
      let result = await parseFormula({
        parseParams: { formula: formula },
      }).unwrap();
      if (lhs) {
        lhsFormulaHandler(result);
      } else {
        rhsFormulaHandler(result);
      }
      setParseError(undefined);
    } catch (error: any) {
      setParseError(error.data);
      if (lhs) {
        lhsFormulaHandler(undefined);
      } else {
        rhsFormulaHandler(undefined);
      }
    }
  };

  const create = async () => {
    if (rhs) {
      try {
        await addExercise({
          createExerciseRequest: {
            statement: { lhs: lhs, formula: rhs, sidecondition: sideCon },
          },
        }).unwrap();
        showInfo("New Exercise created!");
        setElemente.setState([]);
        setPlaceholders.setState([]);
        lhsHandler.setState([]);
        rhsHandler(undefined);
        sideConHandler.setState([]);
        lhsFormulaHandler(undefined);
        rhsFormulaHandler(undefined);
        setHasRhs(false);
        setIsTautology(false);

        close();
      } catch (error: any) {
        showError(error.data);
      }
    }
  };

  return (
    <>
      <Tooltip label="Create">
        <ActionIcon onClick={open}>
          <IconPlus />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={close}
        size={"80%"}
        title={"Add new Exercise"}
        mih={800}
      >
        <List>
          <ListItem>
            <Text>✅ The added exercises are visible to everyone.</Text>
          </ListItem>
          <ListItem>
            <Text>
              ⚠️ This tool only checks for tautologies, and the proof system is
              incomplete. Added exercises might remain unsolvable.
            </Text>
          </ListItem>
        </List>
        <Divider mt={"md"} />
        <Stack justify="center" align="stretch" gap={0}>
          <Group>
            <Title order={4}>Statement</Title>
            <Tooltip label={<GrammarTooltip />}>
              <IconHelp />
            </Tooltip>
          </Group>

          <Group justify="center">
            <Card withBorder miw={"50%"} mih={125} mt={"xl"}>
              <Card.Section h={"100%"}>
                {!parseError && !lhsFormula && !rhsFormula && (
                  <Stack align="center" justify="center" h={125} p={0} m={0}>
                    <Text c={"dimmed"}>Preview and Feedback</Text>
                  </Stack>
                )}
                {parseError && (
                  <Textarea
                    rows={5}
                    readOnly
                    p={0}
                    m={0}
                    h={125}
                    variant="unstyled"
                    value={parseError.split("\n").slice(1).join("\n")}
                  />
                )}
                {lhsFormula && (
                  <Stack align="center" justify="center" h={125} p={0} m={0}>
                    <Formula formula={lhsFormula} />
                  </Stack>
                )}
                {rhsFormula && (
                  <Stack align="center" justify="center" h={125} p={0} m={0}>
                    <Formula formula={rhsFormula} />
                  </Stack>
                )}
              </Card.Section>
            </Card>
          </Group>
          <Grid pt={"xl"} align="center" grow columns={26}>
            <Grid.Col span={12}>
              <Group justify="right" align="center">
                {lhs.map((f, i) => (
                  <Formula
                    key={i}
                    formula={f}
                    click={() => {
                      lhsHandler.remove(i);
                    }}
                  />
                ))}
                <TextInput
                  placeholder="Enter Formula"
                  onChange={(e) =>
                    setFormulaStr(([_, rhs]) => [e?.currentTarget?.value, rhs])
                  }
                  rightSection={
                    <ActionIcon
                      variant="transparent"
                      onClick={() => {
                        if (lhsFormula) {
                          lhsHandler.append(lhsFormula);
                        }
                      }}
                    >
                      <IconPlus />
                    </ActionIcon>
                  }
                />
              </Group>
            </Grid.Col>
            <Grid.Col span={1}>
              <Center>
                <Text px={10} fw={700}>
                  {"\u22A2"}
                </Text>
              </Center>
            </Grid.Col>
            <Grid.Col span={12}>
              <Group gap={0}>
                {rhs ? (
                  <Formula formula={rhs} click={() => rhsHandler(undefined)} />
                ) : (
                  <TextInput
                    placeholder="Enter Formula"
                    onChange={(e) =>
                      setFormulaStr(([lhs, _]) => [
                        lhs,
                        e?.currentTarget?.value,
                      ])
                    }
                    rightSection={
                      <ActionIcon
                        variant="transparent"
                        onClick={() => {
                          if (rhsFormula) {
                            rhsHandler(rhsFormula);
                          }
                        }}
                      >
                        <IconPlus />
                      </ActionIcon>
                    }
                  />
                )}
              </Group>
            </Grid.Col>
          </Grid>
          <Divider my={"md"} />
          <Title order={4}>Side Conditions</Title>
          <Stack align="center">
            {sideCon.map((sc, i) => (
              <Group key={i} gap={1}>
                <Formula
                  formula={{ type: "Ident", body: sc.NotFree.element }}
                />
                <Text px={"xs"}> not free in </Text>
                <Formula
                  formula={{ type: "Ident", body: sc.NotFree.placeholder }}
                />
                <ActionIcon
                  mx={"md"}
                  variant="transparent"
                  onClick={() => sideConHandler.remove(i)}
                >
                  <IconX />
                </ActionIcon>
              </Group>
            ))}
            <Group>
              <Select
                data={elemente.map((e) => ({ value: e.value, label: e.value }))}
                placeholder="Element"
                value={ScElement?.value}
                onChange={(value) =>
                  setScElement(elemente.find((el) => el.value === value))
                }
              />
              <Text> not free in</Text>
              <Select
                data={placeholders.map((e) => ({
                  value: e.value,
                  label: e.value,
                }))}
                placeholder="Placeholder"
                value={ScPlaceholder?.value}
                onChange={(value) =>
                  setScPlaceholder(
                    placeholders.find((el) => el.value === value),
                  )
                }
              />
              <ActionIcon
                variant="transparent"
                onClick={() => {
                  if (ScElement && ScPlaceholder) {
                    sideConHandler.append({
                      NotFree: {
                        element: ScElement,
                        placeholder: ScPlaceholder,
                      },
                    });
                  }
                }}
              >
                <IconPlus />
              </ActionIcon>
            </Group>
          </Stack>
          <Divider my={"md"} />
          {/* <Title order={4}>Side Conditions</Title> */}
          <Group justify="center" pb={"md"}>
            {hasRhs ? (
              <Text>✅ Structure</Text>
            ) : (
              <Text>⚠️ Must have a Rhs</Text>
            )}
            {isTautology ? (
              <Text>✅ is tautology</Text>
            ) : (
              <Text>⚠️ Is not a tautology</Text>
            )}
          </Group>
          <Button disabled={!hasRhs || !isTautology} onClick={create}>
            Create
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

export default CreateExerciseForm;
