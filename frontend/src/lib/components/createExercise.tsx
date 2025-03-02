import {
  ActionIcon,
  Box,
  Button,
  ButtonGroup,
  Card,
  Center,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import { IconCheck, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  Formula as FormulaType,
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

const CreateExerciseForm = () => {
  const [opened, { open, close }] = useDisclosure(false);

  const [parseFormula] = useParseMutation();
  const [addExercise] = useCreateExerciseMutation();
  const [checkTautology] = useCheckMutation();
  const { refetch } = useGetExercisesQuery();

  const [lhs, lhsHandler] = useListState<FormulaType>([]);
  const [rhs, rhsHandler] = useState<FormulaType | undefined>(undefined);
  const [sideCon, sideConHandler] = useListState<SideConditionType>([]);

  const [input, inputHandler] = useState<string>("");
  const [parseError, setParseError] = useState<string | undefined>(undefined);

  const [formula, setFormula] = useState<FormulaType | undefined>(undefined);
  const [isPossible, setIsPossible] = useState<boolean>(false);

  useEffect(() => {
    const checkTautologyAsync = async () => {
      if (rhs) {
        try {
          let result = await checkTautology({
            createExerciseRequest: {
              statement: {
                formula: rhs,
                lhs: lhs,
                sidecondition: sideCon,
              },
            },
          }).unwrap();
          setIsPossible(result as boolean);
        } catch (error: any) {
          console.error(error.data);
        }
      } else {
        setIsPossible(false);
      }
    };

    checkTautologyAsync();
  }, [lhs, rhs, checkTautology]);

  const statement = {
    lhs: lhs,
    formula: rhs,
    sidecondition: sideCon,

  } as StatementType;

  const enterFormula = async () => {
    try {
      let result = await parseFormula({
        parseParams: { formula: input },
      }).unwrap();
      setFormula(result);
      inputHandler("");
      setParseError(undefined);
    } catch (error: any) {
      setParseError(error.data);
    }
  };

  const addLhs = () => {
    if (formula) {
      lhsHandler.setState([...lhs, formula]);
      setFormula(undefined);
    }
  };

  const setRhs = () => {
    if (formula) {
      rhsHandler(formula);
      setFormula(undefined);
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
        refetch();
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
        mih={500}
      >
        <SimpleGrid cols={2} mih={500}>
          <Stack justify="center">
            {formula ? (
              <>
                <Group justify="center">
                  <Box>
                    <Card>
                      <Center>
                        {formula && <Formula formula={formula} />}
                      </Center>
                    </Card>
                    <ButtonGroup>
                      <Button onClick={addLhs}>Add to LHS</Button>
                      <Button onClick={setRhs}>Set as RHS</Button>
                      <Button
                        onClick={() => setFormula(undefined)}
                        variant="light"
                      >
                        Clear
                      </Button>
                    </ButtonGroup>
                  </Box>
                </Group>
              </>
            ) : (
              <>
                <Group justify="center">
                  <TextInput
                    value={input}
                    onChange={(event) =>
                      inputHandler(event.currentTarget.value)
                    }
                    placeholder="Enter Formula"
                    w={"80%"}
                    rightSection={
                      <Tooltip label={<GrammarTooltip />}>
                        <IconInfoCircle />
                      </Tooltip>
                    }
                  />
                  <ActionIcon onClick={enterFormula}>
                    <IconCheck />
                  </ActionIcon>
                </Group>
                {parseError && (
                  <Textarea
                    disabled
                    value={parseError}
                    rows={6}
                    bg={"#ff8787"}
                  />
                )}
              </>
            )}
          </Stack>

          <Stack justify="center">
            {statement && <Statement statement={statement} />}
            {!isPossible && <Text>Statement is not a tautology</Text>}
          </Stack>
        </SimpleGrid>
        <Center>
          <ButtonGroup>
            <Button
              onClick={() => {
                lhsHandler.setState([]);
                rhsHandler(undefined);
              }}
              variant="light"
            >
              Clear
            </Button>
            <Button onClick={create} disabled={!isPossible || rhs == undefined}>
              Create
            </Button>
          </ButtonGroup>
        </Center>
      </Modal>
    </>
  );
};

export default CreateExerciseForm;
