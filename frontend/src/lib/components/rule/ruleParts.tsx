import { get_color } from "@/lib/utils/color";
import { Text, useMantineColorScheme } from "@mantine/core";
import { useMemo } from "react";
import { getStyle } from "../formula/formulaParts";
import RuleFormula, { RuleFormulaProps } from "./ruleFormula";

const RuleIdent = ({ rule, highlighted }: RuleFormulaProps<"Ident">) => {
  const [letter, bgColor] = useMemo(() => {
    switch (rule.body.type) {
      case "Formula":
        return [
          String.fromCharCode(65 + rule.body.value),
          highlighted !== undefined &&
            highlighted === rule.body.value &&
            get_color(highlighted),
        ];
      case "Element":
        return [
          rule.body.value,
          highlighted !== undefined &&
            highlighted === rule.body.value &&
            get_color(highlighted),
        ];
    }
  }, [rule.body, highlighted]);

  const { colorScheme } = useMantineColorScheme();

  const style = getStyle(
    highlighted !== undefined && highlighted === rule.body.value,
    colorScheme,
  );

  return <Text style={style}>{letter}</Text>;
};

const RuleAnd = ({ rule, highlighted }: RuleFormulaProps<"And">) => {
  return (
    <>
      <Text>(</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.lhs }}
        highlighted={highlighted}
      />
      <Text px={3}>{"\u2227"}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.rhs }}
        highlighted={highlighted}
      />
      <Text>)</Text>
    </>
  );
};

const RuleOr = ({ rule, highlighted }: RuleFormulaProps<"Or">) => {
  return (
    <>
      <Text>(</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.lhs }}
        highlighted={highlighted}
      />
      <Text px={3}>{"\u2228"}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.rhs }}
        highlighted={highlighted}
      />
      <Text>)</Text>
    </>
  );
};

const RuleNot = ({ rule, highlighted }: RuleFormulaProps<"Not">) => {
  return (
    <>
      <Text>(</Text>
      <Text>{"\u00AC"}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body }}
        highlighted={highlighted}
      />
      <Text>)</Text>
    </>
  );
};

const RuleImplication = ({ rule, highlighted }: RuleFormulaProps<"Imp">) => {
  return (
    <>
      <Text>(</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.lhs }}
        highlighted={highlighted}
      />
      <Text px={3}>{"\u2192"}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.rhs }}
        highlighted={highlighted}
      />
      <Text>)</Text>
    </>
  );
};

const RuleTrue = ({ rule, highlighted }: RuleFormulaProps<"True">) => {
  return <Text>{"\u22A4"}</Text>;
};

const RuleFalse = ({ rule, highlighted }: RuleFormulaProps<"False">) => {
  return <Text>{"\u22A5"}</Text>;
};

const RuleForall = ({ rule, highlighted }: RuleFormulaProps<"Forall">) => {
  return (
    <>
      <Text>{"\u2200"}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.identifier }}
        highlighted={highlighted}
      />
      <Text>{"."}</Text>
      <RuleFormula rule={rule.body.formula} highlighted={highlighted} />
    </>
  );
};

const RuleExists = ({ rule, highlighted }: RuleFormulaProps<"Exists">) => {
  return (
    <>
      <Text>{"\u2203"}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.identifier }}
        highlighted={highlighted}
      />
      <Text>{"."}</Text>
      <RuleFormula rule={rule.body.formula} highlighted={highlighted} />
    </>
  );
};

const RuleSubstitution = ({
  rule,
  highlighted,
}: RuleFormulaProps<"Substitution">) => {
  return (
    <>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.identifier }}
        highlighted={highlighted}
      />
      <Text>{"["}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.lhs }}
        highlighted={highlighted}
      />
      <Text px={3}>{"\u2192"}</Text>
      <RuleFormula
        rule={{ type: "Ident", body: rule.body.rhs }}
        highlighted={highlighted}
      />
      <Text>{"]"}</Text>
    </>
  );
};

export {
  RuleAnd,
  RuleExists,
  RuleFalse,
  RuleForall,
  RuleIdent,
  RuleImplication,
  RuleNot,
  RuleOr,
  RuleSubstitution,
  RuleTrue,
};
