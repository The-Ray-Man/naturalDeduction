import {
  ActionIcon,
  Card,
  Divider,
  Flex,
  Grid,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronRight,
  IconStar,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import { UUID } from "crypto";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Exercise } from "../api";
import localStorage from "../utils/localStorage";
import Difficulty from "./difficulty";
import Statement from "./statement";

type exerciseListElementProps = {
  exercise: Exercise;
  handler: Dispatch<SetStateAction<UUID | undefined>>;
};

const ExerciseListElment = ({
  exercise,
  handler,
}: exerciseListElementProps) => {
  const [fav, setFav] = useState(localStorage.isFavorite(exercise.id as UUID));
  const [done, setDone] = useState(
    localStorage.isCompleted(exercise.id as UUID),
  );

  useEffect(() => {
    setFav(localStorage.isFavorite(exercise.id as UUID));
    setDone(localStorage.isCompleted(exercise.id as UUID));
  }, [exercise]);

  return (
    <Card withBorder>
      <Grid grow align="center" pb={"md"}>
        <Grid.Col span={1}>
          <Group gap={3} p={0} m={0}>
            <Text pr={5}>{exercise.likes}</Text>
            <IconThumbUp />
          </Group>
          <Group gap={3}>
            <Text pr={5}> {exercise.dislikes}</Text>
            <IconThumbDown />
          </Group>
        </Grid.Col>
        <Grid.Col span={7}>
          <Difficulty
            difficulty={Math.max(0, Math.min(10, exercise.difficulty))}
          />
        </Grid.Col>
        <Grid.Col span={1}>
          <Group justify="flex-end" gap={0}>
            <Tooltip label="toggle">
              <ActionIcon
                variant={"transparent"}
                onClick={() => {
                  localStorage.toggleFavorite(exercise.id as UUID);
                  setFav(!fav);
                }}
              >
                <IconStar color={fav ? "gold" : "gray"} />
              </ActionIcon>
            </Tooltip>
            {done ? (
              <Tooltip label="completed">
                <ActionIcon variant={"transparent"}>
                  <IconCheck color={"green"} />
                </ActionIcon>
              </Tooltip>
            ) : (
              <Tooltip label="not completed">
                <ActionIcon variant="transparent">
                  <IconCheck color={"gray"} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Grid.Col>
      </Grid>
      <Divider pb={"md"} />
      <Flex justify="space-between">
        <Statement statement={exercise.exercise} />
        <ActionIcon onClick={() => handler(exercise.id as UUID)}>
          <IconChevronRight />
        </ActionIcon>
      </Flex>
    </Card>
  );
};

export default ExerciseListElment;
