"use client";
import {
  Exercise as ExerciseType,
  Statement,
  useGetExerciseQuery,
} from "@/lib/api";
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
import SideCondition from "../sideCondition";

type ExerciseInterfaceProps = {
  exercise: Statement;
};

const ExerciseInterface = ({ exercise }: ExerciseInterfaceProps) => {
  const { rule, target } = useDragContext();

  return (
    <SimpleGrid cols={1}>
      {rule && target ? (
        <Matcher />
      ) : (
        <Box pb={0}>
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
      <Flex pt={0}>
        {exercise.sidecondition?.map((sidecondition, index) => (
          <SideCondition sideCondition={sidecondition} key={index} />
        ))}
      </Flex>
      <Stack align="center" justify="center" mih={500}>
        <Exercise exercise={exercise} />
      </Stack>
    </SimpleGrid>
  );
};

export default ExerciseInterface;
