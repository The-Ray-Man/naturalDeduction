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
import { useMemo } from "react";

export type FormulaProps<T extends FormulaType["type"]> = {
  formula: FormulaType & { type: T };
  highlighted?: number;
  click?: (f: FormulaType) => void;
  textColor?: string;
};

const Formula = ({
  formula,
  click,
  textColor,
}: FormulaProps<FormulaType["type"]>) => {
  const chooseFormula = (event: any) => {
    event.stopPropagation();
    if (click) {
      click!(formula);
    }
  };

  const inner = useMemo(() => {
    switch (formula.type) {
      case "And":
        return <And formula={formula} click={click} textColor={textColor} />;
      case "Or":
        return <Or formula={formula} click={click} textColor={textColor} />;
      case "Not":
        return <Not formula={formula} click={click} textColor={textColor} />;
      case "Ident":
        return (
          <Identifier formula={formula} click={click} textColor={textColor} />
        );
      case "Imp":
        return (
          <Implication formula={formula} click={click} textColor={textColor} />
        );
      case "True":
        return <True formula={formula} click={click} textColor={textColor} />;
      case "False":
        return <False formula={formula} click={click} textColor={textColor} />;
      case "Forall":
        return <Forall formula={formula} click={click} textColor={textColor} />;
      case "Exists":
        return <Exists formula={formula} click={click} textColor={textColor} />;
      case "Predicate":
        return (
          <Predicate formula={formula} click={click} textColor={textColor} />
        );
    }
  }, [formula, click, textColor]);

  return (
    <Group data-test="asdf" onClick={chooseFormula} gap={0}>
      {inner}
    </Group>
  );
};

export default Formula;
