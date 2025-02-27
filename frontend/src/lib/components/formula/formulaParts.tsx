import {
  Group,
  MantineColorScheme,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import Formula, { FormulaProps } from "./formula";

const getStyle = (hovered: boolean, colorScheme: MantineColorScheme) => {
  if (colorScheme == "dark") {
    return {
      outlineColor: "greenyellow",
      outlineWidth: 1,
      outlineStyle: hovered ? "solid" : undefined,
    };
  } else {
    return { backgroundColor: hovered ? "greenyellow" : undefined };
  }
};

const And = ({ formula, click, textColor }: FormulaProps<"And">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  // const style = colorScheme=="dark" ? {border} : {backgroundColor: hovered? "greenyello" : undefined}

  return (
    <Group
      gap={1}
      // style={{ borderColor: "greenyellow", borderWidth: 1, borderStyle: hovered ? "solid" : "undefined"}}
      style={getStyle(hovered, colorScheme)}
    >
      <Text c={textColor}>(</Text>
      <Formula formula={formula.body.lhs} click={click} textColor={textColor} />
      <Text px={3} ref={ref} c={textColor}>
        {"\u2227"}
      </Text>
      <Formula formula={formula.body.rhs} click={click} textColor={textColor} />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Or = ({ formula, click, textColor }: FormulaProps<"Or">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Group gap={1} style={getStyle(hovered, colorScheme)}>
      <Text c={textColor}>(</Text>
      <Formula formula={formula.body.lhs} click={click} textColor={textColor} />
      <Text px={3} ref={ref} c={textColor}>
        {"\u2228"}
      </Text>
      <Formula formula={formula.body.rhs} click={click} textColor={textColor} />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Not = ({ formula, click, textColor }: FormulaProps<"Not">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Group gap={1} style={getStyle(hovered, colorScheme)}>
      <Text ref={ref} c={textColor}>
        ({"\u00AC"}
      </Text>
      <Formula formula={formula.body} click={click} textColor={textColor} />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Identifier = ({ formula, click, textColor }: FormulaProps<"Ident">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  const name = formula.body.value;
  return (
    <Group gap={0} style={getStyle(hovered, colorScheme)}>
      <Text ref={ref} c={textColor}>
        {name}
      </Text>
    </Group>
  );
};

const Implication = ({ formula, click, textColor }: FormulaProps<"Imp">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Group gap={1} style={getStyle(hovered, colorScheme)}>
      <Text c={textColor}>(</Text>
      <Formula formula={formula.body.lhs} click={click} textColor={textColor} />
      <Text px={3} ref={ref} c={textColor}>
        {"\u2192"}
      </Text>
      <Formula formula={formula.body.rhs} click={click} textColor={textColor} />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const True = ({ formula, click, textColor }: FormulaProps<"True">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Group gap={1} style={getStyle(hovered, colorScheme)}>
      <Text ref={ref} c={textColor}>
        {"\u22A4"}
      </Text>
    </Group>
  );
};

const False = ({ formula, click, textColor }: FormulaProps<"False">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Group gap={1} style={getStyle(hovered, colorScheme)}>
      <Text ref={ref} c={textColor}>
        {"\u22A5"}
      </Text>
    </Group>
  );
};

const Forall = ({ formula, click, textColor }: FormulaProps<"Forall">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Group gap={1} style={getStyle(hovered, colorScheme)}>
      <Text ref={ref} c={textColor}>
        ({"\u2200"}
      </Text>
      <Formula
        formula={{ type: "Ident", body: formula.body.identifier }}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>{"."}</Text>
      <Formula
        formula={formula.body.formula}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Exists = ({ formula, click, textColor }: FormulaProps<"Exists">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Group gap={1} style={getStyle(hovered, colorScheme)}>
      <Text ref={ref} c={textColor}>
        ({"\u2203"}
      </Text>
      <Formula
        formula={{ type: "Ident", body: formula.body.identifier }}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>{"."}</Text>
      <Formula
        formula={formula.body.formula}
        click={click}
        textColor={textColor}
      />
      <Text c={textColor}>)</Text>
    </Group>
  );
};

const Predicate = ({
  formula,
  click,
  textColor,
}: FormulaProps<"Predicate">) => {
  const { hovered, ref } = useHover();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Group gap={1} style={getStyle(hovered, colorScheme)}>
      <Text ref={ref} c={textColor}>
        {formula.body.identifier.value}
      </Text>
      <Text c={textColor}>(</Text>
      {formula.body.identifiers.map((term, index) => {
        if (index > 0) {
          return (
            <Group key={index} gap={0}>
              <Text c={textColor}>,</Text>{" "}
              <Formula
                formula={{ type: "Ident", body: term }}
                click={click}
                textColor={textColor}
              />
            </Group>
          );
        }
        return (
          <Formula
            formula={{ type: "Ident", body: term }}
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
  Exists,
  False,
  Forall,
  getStyle,
  Identifier,
  Implication,
  Not,
  Or,
  Predicate,
  True,
};
