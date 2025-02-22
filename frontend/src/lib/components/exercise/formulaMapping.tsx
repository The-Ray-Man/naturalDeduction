import { Group, Text } from "@mantine/core";
import { FormulaMapping as FormulaMappingType } from "@/lib/api";
import Formula from "@/lib/components/formula/formula";
import RuleFormula from "@/lib/components/rule/ruleFormula";

type FormulaMappingProps = {
  mapping: FormulaMappingType;
};

const FormulaMapping = ({ mapping }: FormulaMappingProps) => {
  return (
    <Group gap={3}>
      <RuleFormula
        rule={{ type: "Ident", body: { type: "Formula", value: mapping.from } }}
      />
      <Text>{"\u2261"}</Text>
      <Formula formula={mapping.to} />
    </Group>
  );
};

export default FormulaMapping;
