import { DerivationRule as DerivationRuleType } from "@/lib/api";
import { Box, Divider, Flex, Group, Stack, Text } from "@mantine/core";
import RuleName from "./ruleName";
import RuleStatement from "./ruleStatement";

export type RuleProps = {
  rule: DerivationRuleType;
  highlighted?: number | string;
};

const DerivationRule = ({ rule, highlighted }: RuleProps) => {
  return (
    <Flex className="katex" justify="center" align="flex-end">
      <Stack gap={5} justify="center" align="center">
        {/* Premises */}
        <Flex gap={"xl"} justify="center" align="flex-end">
          {rule.premises.map((premise, i) => (
            <RuleStatement key={i} rule={premise} highlighted={highlighted} />
          ))}
          {rule.premises.length === 0 && (
            <Group>
              <Text>{"\u2800"}</Text>
            </Group>
          )}
        </Flex>
        {/* Divider */}
        <Divider w={"100%"} />
        {/* Conclusion */}
        <RuleStatement rule={rule.conclusion} highlighted={highlighted} />
      </Stack>
      <Box pb={"18"} pl={"sm"}>
        <RuleName name={rule.name} />
      </Box>
    </Flex>
  );
};

export default DerivationRule;
