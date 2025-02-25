import { Rules } from "@/lib/api";
import { getRuleByName } from "@/lib/utils/rule";
import { Text } from "@mantine/core";

type RuleNameProps = {
  name: Rules;
};

const RuleName = ({ name }: RuleNameProps) => {
  return <Text>{getRuleByName(name)}</Text>
};

export default RuleName;
