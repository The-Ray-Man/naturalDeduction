import {
  Formula as FormulaType,
  Identifier as IdentifierType,
} from "@/lib/api";
import Formula, { FormulaProps } from "./formula";
import { Box, Group, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";

const And = ({ formula, click, textColor }: FormulaProps) => {
  let cast_formula = formula as { And: FormulaType[] };

  const { hovered, ref } = useHover();

  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text c={textColor}>(</Text>
      <Formula
        formula={cast_formula.And[0]}
        click={click}
        textColor={textColor}
      />
      <Text ref={ref} c={textColor}>
        {"\u2227"}
      </Text>
      <Formula
        formula={cast_formula.And[1]}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Or = ({ formula, click, textColor }: FormulaProps) => {
  let cast_formula = formula as { Or: FormulaType[] };

  const { hovered, ref } = useHover();
  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text c={textColor}>(</Text>
      <Formula
        formula={cast_formula.Or[0]}
        click={click}
        textColor={textColor}
      />
      <Text ref={ref} c={textColor}>
        {"\u2228"}
      </Text>
      <Formula
        formula={cast_formula.Or[1]}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Not = ({ formula, click, textColor }: FormulaProps) => {
  let cast_formula = formula as { Not: FormulaType };

  const { hovered, ref } = useHover();
  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text ref={ref} c={textColor}>
        ({"\u00AC"}
      </Text>
      <Formula formula={cast_formula.Not} click={click} textColor={textColor} />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Identifier = ({ formula, click, textColor }: FormulaProps) => {
  let cast_formula = formula as { Ident: IdentifierType };
  const { hovered, ref } = useHover();
  if (cast_formula.Ident.hasOwnProperty("Literal")) {
    let name = (cast_formula.Ident as { Literal: string }).Literal;
    return (
      <Group
        gap={0}
        style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
      >
        <Text ref={ref} c={textColor}>
          {name}
        </Text>
      </Group>
    );
  }

  if (cast_formula.Ident.hasOwnProperty("Element")) {
    let name = (cast_formula.Ident as { Element: string }).Element;
    return (
      <Group
        gap={0}
        style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
      >
        <Text ref={ref} c={textColor}>
          {name}
        </Text>
      </Group>
    );
  }
};

const Implication = ({ formula, click, textColor }: FormulaProps) => {
  let cast_formula = formula as { Imp: FormulaType[] };

  const { hovered, ref } = useHover();
  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text c={textColor}>(</Text>
      <Formula
        formula={cast_formula.Imp[0]}
        click={click}
        textColor={textColor}
      />
      <Text ref={ref} c={textColor}>
        {"\u2192"}
      </Text>
      <Formula
        formula={cast_formula.Imp[1]}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const True = ({ formula, click, textColor }: FormulaProps) => {
  const { hovered, ref } = useHover();
  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text ref={ref} c={textColor}>
        {"\u22A4"}
      </Text>
    </Group>
  );
};

const False = ({ formula, click, textColor }: FormulaProps) => {
  const { hovered, ref } = useHover();
  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text ref={ref} c={textColor}>
        {"\u22A5"}
      </Text>
    </Group>
  );
};

const Forall = ({ formula, click, textColor }: FormulaProps) => {
  let cast_formula = formula as { Forall: object[] };

  let element = cast_formula.Forall[0] as IdentifierType;
  let sub_formula = cast_formula.Forall[1] as FormulaType;

  const { hovered, ref } = useHover();
  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text ref={ref} c={textColor}>
        ({"\u2200"}
      </Text>
      <Formula
        formula={{ Ident: element }}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>{"."}</Text>
      <Formula formula={sub_formula} click={click} textColor={textColor} />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Exists = ({ formula, click, textColor }: FormulaProps) => {
  let cast_formula = formula as { Exists: object[] };

  let element = cast_formula.Exists[0] as IdentifierType;
  let sub_formula = cast_formula.Exists[1] as FormulaType;

  const { hovered, ref } = useHover();
  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text ref={ref} c={textColor}>
        ({"\u2203"}
      </Text>
      <Formula
        formula={{ Ident: element }}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>{"."}</Text>
      <Formula formula={sub_formula} click={click} textColor={textColor} />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Predicate = ({ formula, click, textColor }: FormulaProps) => {
  let cast_formula = formula as { Predicate: object[] };
  let name = cast_formula.Predicate[0] as IdentifierType;
  let terms = cast_formula.Predicate[1] as IdentifierType[];

  const { hovered, ref } = useHover();
  return (
    <Group
      gap={1}
      style={{ backgroundColor: hovered ? "greenyellow" : undefined }}
    >
      <Text ref={ref} c={textColor}>
        {(name as { Element: string }).Element}
      </Text>
      <Text c={textColor}>(</Text>
      {terms.map((term, index) => {
        if (index > 0) {
          return (
            <Group key={index} gap={0}>
              <Text c={textColor}>,</Text>{" "}
              <Formula
                formula={{ Ident: term }}
                click={click}
                textColor={textColor}
              />
            </Group>
          );
        }
        return (
          <Formula
            formula={{ Ident: term }}
            key={index}
            click={click}
            textColor={textColor}
          />
        );
      })}
      <Text c={textColor}>)</Text>
    </Group>
  );
};

export {
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
};
