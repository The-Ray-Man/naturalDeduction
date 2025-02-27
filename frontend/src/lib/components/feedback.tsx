import {
  ActionIcon,
  Button,
  Card,
  Drawer,
  Group,
  Slider,
  Stack,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconThumbDown, IconThumbUp } from "@tabler/icons-react";
import { UUID } from "crypto";
import { useEffect, useState } from "react";
import { Exercise, usePostFeedbackMutation } from "../api";
import localStorage from "../utils/localStorage";
import { showError } from "../utils/notifications";
import Statement from "./statement";

type FeedbackProps = {
  exercise: Exercise;
};

const Feedback = ({ exercise }: FeedbackProps) => {
  const [opened, { open, close }] = useDisclosure(true);

  const [like, setLike] = useState<undefined | boolean>(undefined);

  const [difficulty, setDifficulty] = useState<number>(50);

  const [color, setColor] = useState<string>("");
  useEffect(() => {
    if (difficulty <= 40) {
      setColor("darkgreen");
    } else if (difficulty <= 70) {
      setColor("cyan");
    } else if (difficulty <= 90) {
      setColor("orange");
    } else {
      setColor("purple");
    }
  }, [difficulty]);

  const [mutation] = usePostFeedbackMutation();

  const onSubmit = () => {
    if (like == undefined) {
      showError("Please select a like or dislike");
      return;
    }
    const send_difficulty = Math.round(difficulty / 10);
    try {
      let result = mutation({
        id: exercise.id,
        feedback: { like, difficulty: send_difficulty },
      }).unwrap();
      localStorage.addFeedback(exercise.id as UUID);
      close();
    } catch (e: any) {
      console.log(e);
      showError(e.value.error);
    }
  };

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Feedback" position="right">
        <Stack align="center">
          <Card withBorder>
            <Statement statement={exercise.exercise} />
          </Card>
          <Title order={4}>Likes</Title>
          <Group>
            <ActionIcon variant={like ? "default" : "transparent"}>
              <IconThumbUp
                size={24}
                onClick={() => setLike(true)}
                color={like ? "green" : "gray"}
              ></IconThumbUp>
            </ActionIcon>
            <ActionIcon variant={like === false ? "default" : "transparent"}>
              <IconThumbDown
                size={24}
                onClick={() => setLike(false)}
                color={like == false ? "red" : "gray"}
              ></IconThumbDown>
            </ActionIcon>
          </Group>
          <Slider
            w={"100%"}
            value={difficulty}
            onChange={(value) => setDifficulty(value)}
            size={10}
            color={color}
          />
          <Button onClick={onSubmit}>Submit</Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default Feedback;
