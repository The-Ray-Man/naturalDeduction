import {
  ActionIcon,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Progress,
  Text,
  Title,
} from "@mantine/core";
import { Exercise, Statement as StatementType } from "../api";
import Statement from "./statement";
import {
  IconChevronRight,
  IconStar,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { UUID } from "crypto";
import Difficulty from "./difficulty";

type exerciseListElementProps = {
  exercise: Exercise;
  handler: Dispatch<SetStateAction<UUID | undefined>>;
};

const exerciseListElment = ({
  exercise,
  handler,
}: exerciseListElementProps) => {
  return (
    <Card withBorder>
      <Group p={0} gap={0} justify="flex-start" align="center">
        <Group gap={0} w={"30%"}>
          <IconThumbUp />
          <Text pr={5}>
            {exercise.likes} / {exercise.dislikes}
          </Text>
          <IconThumbDown />
        </Group>
        <Group w={"70%"}>
          <Difficulty
            difficulty={Math.max(0, Math.min(10, exercise.difficulty))}
          />
          <ActionIcon>
            <IconStar />
          </ActionIcon>
        </Group>
      </Group>
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

export default exerciseListElment;
