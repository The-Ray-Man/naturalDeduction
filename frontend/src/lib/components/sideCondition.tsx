import { SideCondition as SideConditionType } from "@/lib/api";
import { Group, Text } from "@mantine/core";
import Formula from "./formula/formula";

type SideConditionProps = {
  sideCondition: SideConditionType;
};

const SideCondition = ({ sideCondition }: SideConditionProps) => {
  return (
    <Group gap={5}>
      <Formula
        formula={{ type: "Ident", body: sideCondition.NotFree.element }}
      />
      <Text px={0}>is not free in</Text>
      <Formula
        formula={{ type: "Ident", body: sideCondition.NotFree.placeholder }}
      />
    </Group>
  );
};

export default SideCondition;
