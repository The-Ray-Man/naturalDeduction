import { ActionIcon, Button, Card, Flex, Text, Title } from "@mantine/core";
import { Exercise, Statement as StatementType } from "../api";
import Statement from "./statement";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { UUID } from "crypto";

type exerciseListElementProps = {
  exercise: Exercise;
  handler : Dispatch<SetStateAction<UUID | undefined>>
};

const exerciseListElment = ({ exercise, handler }: exerciseListElementProps) => {
  return (
    <Card withBorder>
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
