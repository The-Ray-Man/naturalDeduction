import { Group, Text } from "@mantine/core";
import { ElementMapping as ElementMappingType } from "@/lib/api";
import Formula from "@/lib/components/formula/formula";
import RuleFormula from "@/lib/components/rule/ruleFormula";

type ElementMappingProps = {
  mapping: ElementMappingType;
};

const ElementMapping = ({ mapping }: ElementMappingProps) => {
  return (
    <Group gap={3}>
      <RuleFormula rule={{ Ident: { Element: mapping.from } }} />
      <Text>{"\u2261"}</Text>
      <Formula formula={{ Ident: { Element: mapping.to } }} />
    </Group>
  );
};

export default ElementMapping;
