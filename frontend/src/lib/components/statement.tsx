import { Group, Text } from "@mantine/core";
import { Formula as FormulaType, Statement as StatementType } from "../api";
import Formula from "./formula/formula";

type StatementProps = {
  statement: StatementType;
  click?: (f: FormulaType) => void;
  textColor?: string;
  showSideCondition?: boolean;
};

const Statement = ({
  statement,
  click,
  textColor,
  showSideCondition = false,
}: StatementProps) => {
  return (
    <Group className="katex" gap={0}>
      {statement.lhs.length == 0 && <Text mb={-1}>{"\u2205"}</Text>}
      {statement.lhs.map((a, i) => {
        return (
          <Group key={i} gap={1}>
            <Formula formula={a} click={click} textColor={textColor} />
            {i < statement.lhs.length - 1 && (
              <Text pe={3} c={textColor}>
                ,
              </Text>
            )}
          </Group>
        );
      })}
      <Text px={10} fw={700} c={textColor}>
        {"\u22A2"}
      </Text>
      {statement.formula && (
        <Formula
          formula={statement.formula}
          click={click}
          textColor={textColor}
        />
      )}
      {showSideCondition && (
        <Text>{JSON.stringify(statement.sidecondition)}</Text>
      )}
    </Group>
  );
};

export default Statement;
