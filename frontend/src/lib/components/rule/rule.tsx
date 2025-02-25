import { DerivationRule as DerivationRuleType } from "@/lib/api";
import { Box, Divider, Flex, Stack } from "@mantine/core";
import React from "react";
import RuleStatement from "./ruleStatement";
import RuleName from "./ruleName";

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
        </Flex>
        {/* Divider */}
        <Divider w={"100%"} />
        {/* Conclusion */}
        <RuleStatement rule={rule.conclusion} highlighted={highlighted} />
      </Stack>
      <Box pb={"14"} pl={"sm"}>
        <RuleName name={rule.name} />
      </Box>
    </Flex>
  );
};

export default DerivationRule;
