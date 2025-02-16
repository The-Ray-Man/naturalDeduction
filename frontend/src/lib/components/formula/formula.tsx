import { Group, Text } from "@mantine/core";
import { Formula as FormulaType } from "../../api";
import {
  And,
  Or,
  Not,
  Identifier,
  Implication,
  True,
  False,
  Forall,
  Exists,
  Predicate,
} from "./formula_parts";
import { useHover } from "@mantine/hooks";

export type FormulaProps = {
  formula: FormulaType;
  highlighted?: number;
  click?: (f: FormulaType) => void;
  textColor?: string;
};

const Formula = ({ formula, click, textColor }: FormulaProps) => {
  const chooseFormula = (event: any) => {
    event.stopPropagation();
    if (click) {
      click!(formula);
    }
  };

  let inner = undefined;
  if (formula.hasOwnProperty("And")) {
    inner = <And formula={formula} click={click} textColor={textColor} />;
  }

  if (formula.hasOwnProperty("Or")) {
    inner = <Or formula={formula} click={click} textColor={textColor} />;
  }

  if (formula.hasOwnProperty("Not")) {
    inner = <Not formula={formula} click={click} textColor={textColor} />;
  }

  if (formula.hasOwnProperty("Ident")) {
    inner = (
      <Identifier formula={formula} click={click} textColor={textColor} />
    );
  }

  if (formula.hasOwnProperty("Imp")) {
    inner = (
      <Implication formula={formula} click={click} textColor={textColor} />
    );
  }

  if (formula === "True") {
    inner = <True formula={formula} click={click} textColor={textColor} />;
  }

  if (formula === "False") {
    inner = <False formula={formula} click={click} textColor={textColor} />;
  }

  if (formula.hasOwnProperty("Forall")) {
    inner = <Forall formula={formula} click={click} textColor={textColor} />;
  }

  if (formula.hasOwnProperty("Exists")) {
    inner = <Exists formula={formula} click={click} textColor={textColor} />;
  }

  if (formula.hasOwnProperty("Predicate")) {
    inner = <Predicate formula={formula} click={click} textColor={textColor} />;
  }

  return (
    <Group onClick={chooseFormula} gap={0}>
      {inner}
    </Group>
  );
};

export default Formula;
