"use client";
import { Exercise as ExerciseType, useGetExerciseQuery } from "@/lib/api";
import Exercise from "@/lib/components/exercise/exercise";
import Matcher from "@/lib/components/exercise/matcher";
import Rules from "@/lib/components/rule/rules";
import { useDragContext } from "@/lib/hook/DragContext";
import {
  Box,
  Button,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { UUID } from "crypto";
import { Dispatch, SetStateAction } from "react";

type ExerciseInterfaceProps = {
  exercise_info: ExerciseType;
  exerciseId: UUID;
  handler: Dispatch<SetStateAction<UUID | undefined>>;
};

const ExerciseInterface = ({
  exerciseId,
  handler,
  exercise_info,
}: ExerciseInterfaceProps) => {
  const { data: exercise } = useGetExerciseQuery({
    id: exerciseId,
  });

  const { rule, target } = useDragContext();

  if (!exercise) {
    return <div>Loading...</div>;
  }

  return (
    <SimpleGrid cols={1}>
      {rule && target ? (
        <Matcher />
      ) : (
        <Box>
          <Button
            variant="transparent"
            pb={"md"}
            onClick={() => handler(undefined)}
          >
            Back to Exercises
          </Button>
          <Flex w={"100%"} gap={5} wrap="wrap">
            <Rules />
          </Flex>
          <Group className="katex">
            <Text>*x does not occur freely in any formula in Γ</Text>
            <Text>**x does not occur freely in any formula in Γ or B</Text>
            <Text>***the binding structure is preserved</Text>
          </Group>
        </Box>
      )}
      <Stack align="center" justify="center" mih={500}>
        <Exercise exercise={exercise} exercise_info={exercise_info} />
      </Stack>
    </SimpleGrid>
  );
};

export default ExerciseInterface;
