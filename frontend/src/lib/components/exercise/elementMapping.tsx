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
      <RuleFormula
        rule={{ type: "Ident", body: { type: "Element", value: mapping.from } }}
      />
      <Text mt={-1} px={3}>
        {"\u2261"}
      </Text>
      <Formula
        formula={{
          type: "Ident",
          body: { type: "Element", value: mapping.to },
        }}
      />
    </Group>
  );
};

export default ElementMapping;
