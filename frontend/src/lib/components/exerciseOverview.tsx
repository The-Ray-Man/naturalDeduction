import {
  ActionIcon,
  Box,
  Button,
  ButtonGroup,
  Card,
  Center,
  Code,
  Divider,
  Flex,
  Grid,
  Group,
  List,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  Exercise,
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
import {
  IconCheck,
  IconClearAll,
  IconCross,
  IconGauge,
  IconInfoCircle,
  IconPlus,
  IconReload,
  IconStar,
  IconThumbUp,
  IconX,
} from "@tabler/icons-react";
import Formula from "./formula/formula";
import { Action } from "@dnd-kit/core/dist/store";
import { showError, showInfo } from "../utils/notifications";
import Info from "./info";
import { UUID } from "crypto";
import ExerciseInterface from "./exercise/exerciseInterface";
import localStorage from "../utils/localStorage";

const CreateExerciseForm = () => {
  const [opened, { open, close }] = useDisclosure(false);

  const [parseFormula] = useParseMutation();
  const [addExercise] = useCreateExerciseMutation();
  const [checkTautology] = useCheckMutation();
  const { refetch } = useGetExercisesQuery();

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
        await addExercise({
          createExerciseRequest: { lhs: lhs, rhs: rhs },
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

  const [selectedModus, setSelectedModus] = useState<
    "default" | "favorites" | "difficulty" | "likes" | "incompleted"
  >("default");

  const [favorites, setFavorites] = useState<UUID[]>([]);
  const [completed, setCompleted] = useState<UUID[]>([]);

  useEffect(() => {
    if (selectedModus === "favorites") {
      const favs = localStorage.allFavorites();
      setFavorites(favs);
    }
    if (selectedModus === "incompleted") {
      const incompleted = localStorage.allCompleted();
      setCompleted(incompleted);
    }
  }, [selectedModus]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<
    UUID | undefined
  >();

  if (!allExercises) {
    return <div>Loading...</div>;
  }

  if (selectedExerciseId) {
    return (
      <ExerciseInterface
        exercise_info={
          allExercises.find((exercise) => exercise.id === selectedExerciseId)!
        }
        exerciseId={selectedExerciseId}
        handler={setSelectedExerciseId}
      />
    );
  }

  const likeCompare = (a: Exercise, b: Exercise) => {
    if (a.likes == 0 && a.dislikes == 0) {
      return 1;
    } else if (b.likes == 0 && b.dislikes == 0) {
      return -1;
    }
    return b.likes / (b.likes + b.dislikes) - a.likes / (a.likes + a.dislikes);
  };

  return (
    <Stack gap={"md"}>
      <Card withBorder>
        <Info />
      </Card>
      <Card withBorder miw={500}>
        <Flex justify="space-between">
          <Title order={3}>Exercises</Title>
          <Group>
            <Tooltip label="Difficulty">
              <ActionIcon
                onClick={() => setSelectedModus("difficulty")}
                variant={selectedModus == "difficulty" ? "filled" : "light"}
              >
                <IconGauge />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Likes">
              <ActionIcon
                onClick={() => setSelectedModus("likes")}
                variant={selectedModus == "likes" ? "filled" : "light"}
              >
                <IconThumbUp />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Favorite">
              <ActionIcon
                onClick={() => setSelectedModus("favorites")}
                variant={selectedModus == "favorites" ? "filled" : "light"}
              >
                <IconStar />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Incomplete">
              <ActionIcon
                onClick={() => setSelectedModus("incompleted")}
                variant={selectedModus == "incompleted" ? "filled" : "light"}
              >
                <IconCheck />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="All">
              <ActionIcon
                onClick={() => setSelectedModus("default")}
                variant={selectedModus == "default" ? "filled" : "light"}
              >
                <IconClearAll />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Group gap={"xs"}>
            <Tooltip label="Refresh">
              <ActionIcon onClick={refetch}>
                <IconReload />
              </ActionIcon>
            </Tooltip>
            <CreateExerciseForm />
          </Group>
        </Flex>
        <Divider py={"md"} />
        <Flex
          gap={"md"}
          wrap="wrap"
          justify={selectedModus == "difficulty" ? "stretch" : undefined}
        >
          {selectedModus === "difficulty" && (
            <>
              <Stack>
                <Center miw={400}>
                  <Title order={4}>Easy</Title>
                </Center>
                {allExercises
                  .filter((ex) => ex.difficulty <= 4)
                  .toSorted(likeCompare)
                  .map((exercise, i) => (
                    <Box key={i} miw={400}>
                      <ExerciseListElement
                        key={i}
                        exercise={exercise}
                        handler={setSelectedExerciseId}
                      />
                    </Box>
                  ))}
              </Stack>
              <Divider orientation="vertical" />
              <Stack>
                <Center miw={400}>
                  <Title order={4}>Intermediate</Title>
                </Center>
                {allExercises
                  .filter((ex) => ex.difficulty <= 7 && ex.difficulty > 4)
                  .toSorted(likeCompare)
                  .map((exercise, i) => (
                    <Box key={i} miw={400}>
                      <ExerciseListElement
                        key={i}
                        exercise={exercise}
                        handler={setSelectedExerciseId}
                      />
                    </Box>
                  ))}
              </Stack>
              <Divider orientation="vertical" />
              <Stack>
                <Center miw={400}>
                  <Title order={4}>Hards</Title>
                </Center>
                {allExercises
                  .filter((ex) => ex.difficulty <= 9 && ex.difficulty > 7)
                  .toSorted(likeCompare)
                  .map((exercise, i) => (
                    <Box key={i} miw={400}>
                      <ExerciseListElement
                        key={i}
                        exercise={exercise}
                        handler={setSelectedExerciseId}
                      />
                    </Box>
                  ))}
              </Stack>
              <Divider orientation="vertical" />
              <Stack>
                <Center miw={400}>
                  <Title order={4}>Insane</Title>
                </Center>
                {allExercises
                  .filter((ex) => ex.difficulty > 9)
                  .toSorted(likeCompare)
                  .map((exercise, i) => (
                    <Box key={i} miw={400}>
                      <ExerciseListElement
                        key={i}
                        exercise={exercise}
                        handler={setSelectedExerciseId}
                      />
                    </Box>
                  ))}
              </Stack>
            </>
          )}

          {selectedModus === "likes" &&
            allExercises.toSorted(likeCompare).map((exercise, i) => (
              <Box key={i} miw={400}>
                <ExerciseListElement
                  key={i}
                  exercise={exercise}
                  handler={setSelectedExerciseId}
                />
              </Box>
            ))}

          {selectedModus === "incompleted" &&
            allExercises
              .filter((ex) => {
                return !completed.includes(ex.id as UUID);
              })
              .map((exercise, i) => (
                <Box key={i} miw={400}>
                  <ExerciseListElement
                    key={i}
                    exercise={exercise}
                    handler={setSelectedExerciseId}
                  />
                </Box>
              ))}

          {["favorites", "default"].includes(selectedModus) &&
            allExercises
              .filter((ex) => {
                if (selectedModus === "favorites") {
                  return favorites.includes(ex.id as UUID);
                } else {
                  return true;
                }
              })
              .map((exercise, i) => (
                <Box key={i} miw={400}>
                  <ExerciseListElement
                    key={i}
                    exercise={exercise}
                    handler={setSelectedExerciseId}
                  />
                </Box>
              ))}
        </Flex>
      </Card>
    </Stack>
  );
};

const GRAMMAR: Array<[string, Array<string>]> = [
  ["Tautology", ["true", "top"]],
  ["Unsatisfiable", ["false", "bot"]],
  ["Logical and", ["and", "land"]],
  ["Logical or", ["or", "lor"]],
  ["Logical not", ["not", "neg", "lnot"]],
  ["Implication", ["->", "to", "rightarrow", "implies", "arrow.r"]],
  ["All quantifier", ["forall"]],
  ["Exists quantifier", ["exists"]],
];

const GrammarTooltip: React.FC = (): React.ReactNode => {
  return (
    <Stack gap={8}>
      <Text>The following operators can be used to compose a formula:</Text>
      <List>
        {GRAMMAR.map(([name, matches]) => {
          return (
            <List.Item key={name}>
              <Group align="flex-end" gap={8}>
                <Text>{name}:</Text>
                {matches.map((match) => (
                  <Code lh={1.25} key={match}>
                    {match}
                  </Code>
                ))}
              </Group>
            </List.Item>
          );
        })}
      </List>
      <Text>
        All operators can be optionally prefixed with a <Code lh={1.25}>\</Code>{" "}
        for better LaTeX compatibility
      </Text>
    </Stack>
  );
};

export default ExerciseOverview;
