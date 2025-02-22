import { RuleStatement as RuleStatementType } from "@/lib/api";
import { Group, Text } from "@mantine/core";
import RuleFormula from "./ruleFormula";

type RuleStatementProps = {
  rule: RuleStatementType;
  highlighted?: number | string;
};

const RuleStatement = ({ rule, highlighted }: RuleStatementProps) => {
  let rhs = <RuleFormula rule={rule.formula} highlighted={highlighted} />;

  let lhs = rule.lhs ? (
    <>
      <Text>{","}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.lhs }}
        highlighted={highlighted}
      />
    </>
  ) : (
    <></>
  );

  return (
    <Group gap={3}>
      <Text>{"\u0393"}</Text>
      {lhs}
      <Text px={3}>{"\u22A2"}</Text>
      {rhs}
    </Group>
  );
};

export default RuleStatement;
