import { Box, Group, Text } from "@mantine/core";
import Formula from "./formula/formula";
import { Formula as FormulaType, Statement as StatementType } from "../api";

type StatementProps = {
  statement: StatementType;
  click?: (f: FormulaType) => void;
  textColor?: string;
};

const Statement = ({ statement, click, textColor }: StatementProps) => {
  return (
    <Group gap={0}>
      {statement.lhs.length == 0 && <Text>{"\u2205"}</Text>}
      {/* <Text c={textColor}>{"\u0393"}</Text> */}
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
    </Group>
  );
};

export default Statement;
