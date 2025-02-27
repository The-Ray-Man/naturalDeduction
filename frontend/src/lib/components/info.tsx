import { Accordion, Divider, List, Text, Title } from "@mantine/core";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import localStorage from "../utils/localStorage";

const Info = () => {
  const [value, setValue] = useState<string | null>(
    localStorage.isWelcomeCollapsed() ? null : "info",
  );

  const changeCollapse = (value: string | null) => {
    setValue(value);
    localStorage.setWelcomeCollapsed(value == null);
  };

  return (
    <Accordion value={value} onChange={changeCollapse}>
      <Accordion.Item value="info">
        <Accordion.Control>
          {" "}
          <Title order={3}>Welcome</Title>
        </Accordion.Control>
        {/* <Accordion.Control>{item.value}</Accordion.Control> */}
        <Accordion.Panel>
          <Divider />
          <Text>
            Welcome to FMFP Made Easy! This is a tool to help you learn natural
            deduction. This tool includes the following features:
          </Text>
          <List>
            <List.Item>
              <Text fw={700}>New Exercises:</Text>
              <Text>
                The added exercises are visible to everyone. You cannot add
                impossible exercises.
              </Text>
            </List.Item>
            <List.Item>
              <Text fw={700}>Apply Rules</Text>
              <Text>
                Highlighting makes matching easier. Additionally, a rule cannot
                be applied incorrectly. However, you can still choose the wrong
                rule!
              </Text>
            </List.Item>
            <List.Item>
              <Text fw={700}>Checking</Text>
              <Text>
                You can always check if the current proof tree is still
                solvable!
              </Text>
            </List.Item>
          </List>

          <Title order={4}>Entering Formulas</Title>
          <Text>
            Entering logical formulas can be cumbersome (the parser is not very
            advanced :o). Here are some tips:
          </Text>
          <List>
            <List.Item>
              <Text>Adding brackets is almost always right.</Text>
            </List.Item>
            <List.Item>
              <Text>
                Use the following words for logical symbols: and, or, not, -
                {">"}, exists_x, forall_x
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Use lowercase letters for variables and predicates only. Use
                uppercase letters for literals.
              </Text>
            </List.Item>
            <List.Item>
              <Text>Some examples:</Text>
              <List>
                <List.Item>
                  <Text>A and p(x,y)</Text>
                </List.Item>
                <List.Item>
                  <Text>exists_x (p(x,y) -{">"} q(x))</Text>
                </List.Item>
                <List.Item>
                  <Text>
                    A -{">"} (B -{">"} C)
                  </Text>
                </List.Item>
              </List>
            </List.Item>
          </List>

          <Title order={4}>Improvements</Title>
          <Text>
            If you find errors or have great ideas, you have two options: You
            can either open an issue on GitHub or fix it yourself and submit a
            pull request.
          </Text>

          <Title order={4}>Coming Soon (maybe)</Title>
          <List>
            <List.Item>
              <Text>Automated exercise generation</Text>
            </List.Item>
            <List.Item>
              <Text>Hints for which rule to apply</Text>
            </List.Item>
          </List>

          <Title order={4}>Disclaimer</Title>
          <Text>
            This is not official software for the FMFP course at ETHZ. There are
            no guarantees for correctness.
          </Text>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default Info;
