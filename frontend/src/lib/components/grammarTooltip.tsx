import { Code, Group, List, Stack, Text } from "@mantine/core";

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

export default GrammarTooltip;
