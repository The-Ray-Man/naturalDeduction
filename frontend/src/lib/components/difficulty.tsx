import { Progress, Tooltip } from "@mantine/core";

type DifficultyProps = {
  difficulty: number;
};

const Difficulty = ({ difficulty }: DifficultyProps) => {
  let procent_difficulty = difficulty * 10;

  let easy = Math.max(0, Math.min(procent_difficulty, 40));
  let intermediate = Math.max(0, Math.min(procent_difficulty - 40, 30));
  let hard = Math.max(0, Math.min(procent_difficulty - 70, 20));
  let insane = Math.max(0, Math.min(procent_difficulty - 90, 10));

  return (
    <Progress.Root size={"md"}>
      <Tooltip label="Easy">
        <Progress.Section value={easy} color="darkgreen"></Progress.Section>
      </Tooltip>

      <Tooltip label="Intermediate">
        <Progress.Section value={intermediate} color="cyan"></Progress.Section>
      </Tooltip>

      <Tooltip label="Hard">
        <Progress.Section value={hard} color="orange"></Progress.Section>
      </Tooltip>
      <Tooltip label="Insane">
        <Progress.Section value={insane} color="purple"></Progress.Section>
      </Tooltip>
    </Progress.Root>
  );
};

export default Difficulty;
