import {
  ActionIcon,
  Box,
  Card,
  Center,
  Divider,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconClearAll,
  IconGauge,
  IconReload,
  IconStar,
  IconThumbUp,
} from "@tabler/icons-react";
import { UUID } from "crypto";
import { useEffect, useState } from "react";
import { Exercise, useGetExerciseQuery, useGetExercisesQuery } from "../api";
import localStorage from "../utils/localStorage";
import CreateExerciseForm from "./createExercise";
import ExerciseInterface from "./exercise/exerciseInterface";
import ExerciseListElement from "./exerciseListElement";
import Info from "./info";

const ExerciseOverview = () => {
  const { data: allExercises, refetch } = useGetExercisesQuery();

  const [selectedModus, setSelectedModus] = useState<
    "default" | "favorites" | "difficulty" | "likes" | "incompleted"
  >("difficulty");

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
        <Card.Section inheritPadding my={0} mb={"md"} withBorder pb={"md"}>
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
        </Card.Section>
        {selectedModus === "difficulty" && (
          <Flex
            gap={"md"}
            align={"stretch"}
            wrap="nowrap"
            justify={selectedModus == "difficulty" ? "stretch" : undefined}
            style={{ overflowX: "auto" }}
          >
            <Stack w={400}>
              <Center w={400}>
                <Title order={3}>Easy 💁‍♂️</Title>
              </Center>
              {allExercises
                .filter((ex) => ex.difficulty <= 4)
                .toSorted(likeCompare)
                .map((exercise, i) => (
                  <Box key={i} miw={400}>
                    <ExerciseListElement
                      key={i}
                      exercise={exercise}
                      showSideCondition={true}
                    />
                  </Box>
                ))}
            </Stack>
            <Divider orientation="vertical" />
            <Stack w={400}>
              <Center w={400}>
                <Title order={3}>Intermediate 😎</Title>
              </Center>
              {allExercises
                .filter((ex) => ex.difficulty <= 7 && ex.difficulty > 4)
                .toSorted(likeCompare)
                .map((exercise, i) => (
                  <Box key={i} miw={400}>
                    <ExerciseListElement
                      key={i}
                      exercise={exercise}
                      showSideCondition={true}
                    />
                  </Box>
                ))}
            </Stack>
            <Divider orientation="vertical" />
            <Stack w={400}>
              <Center w={400}>
                <Title order={3}>Hard 🫠</Title>
              </Center>
              {allExercises
                .filter((ex) => ex.difficulty <= 9 && ex.difficulty > 7)
                .toSorted(likeCompare)
                .map((exercise, i) => (
                  <Box key={i} miw={400}>
                    <ExerciseListElement
                      key={i}
                      exercise={exercise}
                      showSideCondition={true}
                    />
                  </Box>
                ))}
            </Stack>
            <Divider orientation="vertical" />
            <Stack w={400}>
              <Center w={400}>
                <Title order={3}>Insane 🥵</Title>
              </Center>
              {allExercises
                .filter((ex) => ex.difficulty > 9)
                .toSorted(likeCompare)
                .map((exercise, i) => (
                  <Box key={i} miw={400}>
                    <ExerciseListElement
                      key={i}
                      exercise={exercise}
                      showSideCondition={true}
                    />
                  </Box>
                ))}
            </Stack>
          </Flex>
        )}

        {selectedModus === "likes" && (
          <SimpleGrid cols={3}>
            {allExercises.toSorted(likeCompare).map((exercise, i) => (
              <ExerciseListElement
                key={i}
                exercise={exercise}
                showSideCondition={true}
              />
            ))}
          </SimpleGrid>
        )}

        {selectedModus === "incompleted" && (
          <SimpleGrid cols={3}>
            {allExercises
              .filter((ex) => {
                return !completed.includes(ex.id as UUID);
              })
              .map((exercise, i) => (
                <ExerciseListElement
                  key={i}
                  exercise={exercise}
                  showSideCondition={true}
                />
              ))}
          </SimpleGrid>
        )}

        {["favorites", "default"].includes(selectedModus) && (
          <SimpleGrid cols={3}>
            {allExercises
              .filter((ex) => {
                if (selectedModus === "favorites") {
                  return favorites.includes(ex.id as UUID);
                } else {
                  return true;
                }
              })
              .map((exercise, i) => (
                <ExerciseListElement
                  key={i}
                  exercise={exercise}
                  showSideCondition={true}
                />
              ))}
          </SimpleGrid>
        )}
      </Card>
    </Stack>
  );
};

export default ExerciseOverview;
