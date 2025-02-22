import {
  ActionIcon,
  Box,
  Button,
  ButtonGroup,
  Card,
  Center,
  Divider,
  Flex,
  Grid,
  Group,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  Formula as FormulaType,
  Statement as StatementType,
  useCheckMutation,
  useCreateExerciseMutation,
  useGetExerciseQuery,
  useGetExercisesQuery,
  useParseMutation,
} from "../api";
import ExerciseListElement from "./exerciseListElement";
import { useDisclosure, useListState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import Statement from "./statement";
import { IconCheck, IconPlus, IconReload } from "@tabler/icons-react";
import Formula from "./formula/formula";
import { Action } from "@dnd-kit/core/dist/store";
import { showError, showInfo } from "../utils/notifications";
import Info from "./info";
import { UUID } from "crypto";
import ExerciseInterface from "./exercise/exerciseInterface";

const CreateExerciseForm = () => {
  const [opened, { open, close }] = useDisclosure(false);

  const [parseFormula] = useParseMutation();
  const [addExercise] = useCreateExerciseMutation();
  const [checkTautology] = useCheckMutation();

  const [lhs, lhsHandler] = useListState<FormulaType>([]);
  const [rhs, rhsHandler] = useState<FormulaType | undefined>(undefined);

  const [input, inputHandler] = useState<string>("");
  const [parseError, setParseError] = useState<string | undefined>(undefined);

  const [formula, setFormula] = useState<FormulaType | undefined>(undefined);
  const [isPossible, setIsPossible] = useState<boolean>(false);

  useEffect(() => {
    const checkTautologyAsync = async () => {
      if (rhs) {
        try {
          let result = await checkTautology({
            statement: {
              formula: rhs,
              lhs: lhs,
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
        let result = await addExercise({
          createExerciseRequest: { lhs: lhs, rhs: rhs },
        }).unwrap();
        showInfo("New Exercise created!");
        lhsHandler.setState([]);
        rhsHandler(undefined);
        setFormula(undefined);
        setParseError(undefined);
        inputHandler("");
      } catch (error: any) {
        showError(error.data);
      }
    }
  };

  return (
    <>
      <ActionIcon onClick={open}>
        <IconPlus />
      </ActionIcon>
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
            <Button onClick={create} disabled={!isPossible || rhs == undefined}>
              Create
            </Button>
            <Button
              onClick={() => {
                lhsHandler.setState([]);
                rhsHandler(undefined);
              }}
              variant="light"
            >
              Clear
            </Button>
          </ButtonGroup>
        </Center>
      </Modal>
    </>
  );
};

const ExerciseOverview = () => {
  const { data: allExercises, refetch } = useGetExercisesQuery();

  const [selectedExerciseId, setSelectedExerciseId] = useState<
    UUID | undefined
  >();

  if (!allExercises) {
    return <div>Loading...</div>;
  }

  if (selectedExerciseId) {
    return (
      <ExerciseInterface
        exerciseId={selectedExerciseId}
        handler={setSelectedExerciseId}
      />
    );
  }

  return (
    <Flex gap={"md"}>
      {/* <Grid.Col span={6}> */}
      <Card withBorder>
        <Info />
      </Card>
      <Card withBorder miw={500}>
        <Flex justify="space-between">
          <Title order={3}>Exercises</Title>
          <Group gap={"xs"}>
            <ActionIcon onClick={refetch}>
              <IconReload />
            </ActionIcon>
            <CreateExerciseForm />
          </Group>
        </Flex>
        <Divider py={"md"} />
        <Stack>
          {allExercises.map((exercise, i) => (
            <ExerciseListElement
              key={i}
              exercise={exercise}
              handler={setSelectedExerciseId}
            />
          ))}
        </Stack>
      </Card>
      {/* </Grid.Col>
      <Grid.Col span={6}> */}
      {/* <Stack>
        <Card withBorder miw={"800"}>
          <Title order={3}>Create Exercise</Title>
          <Divider py={"md"} />

          <CreateExerciseForm />
        </Card>
      </Stack> */}
      {/* </Grid.Col> */}
    </Flex>
  );
};

export default ExerciseOverview;
