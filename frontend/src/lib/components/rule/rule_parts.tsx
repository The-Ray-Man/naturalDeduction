import { Group, Text } from "@mantine/core";
import RuleFormula, { RuleFormulaProps } from "./ruleFormula";
import { RuleIdentifier } from "@/lib/api";
import { get_color } from "@/lib/utils/color";
import { RuleFormula as RuleFormulaType } from "@/lib/api";

const RuleIdent = ({ rule, highlighted }: RuleFormulaProps) => {
  let cast_rule = rule as { Ident: RuleIdentifier };
  let letter;
  let bg_color = undefined;

  if (cast_rule.Ident.hasOwnProperty("Formula")) {
    let num = (cast_rule.Ident as { Formula: number }).Formula;
    letter = String.fromCharCode(65 + num);
    if (highlighted != undefined && highlighted == num) {
      bg_color = get_color(highlighted);
    }
  } else {
    letter = (cast_rule.Ident as { Element: string }).Element;
    if (highlighted != undefined && highlighted === letter) {
      bg_color = get_color(highlighted);
    }
  }
  return <Text style={{ background: bg_color }}>{letter}</Text>;
};

const RuleAnd = ({ rule, highlighted }: RuleFormulaProps) => {
  let cast_rule = rule as { And: RuleIdentifier[] };
  return (
    <>
      <Text>(</Text>
      <RuleFormula
        rule={{ Ident: cast_rule.And[0] }}
        highlighted={highlighted}
      />
      <Text px={3}>{"\u2227"}</Text>
      <RuleFormula
        rule={{ Ident: cast_rule.And[1] }}
        highlighted={highlighted}
      />
      <Text>)</Text>
    </>
  );
};

const RuleOr = ({ rule, highlighted }: RuleFormulaProps) => {
  let cast_rule = rule as { Or: RuleIdentifier[] };
  return (
    <>
      <Text>(</Text>
      <RuleFormula
        rule={{ Ident: cast_rule.Or[0] }}
        highlighted={highlighted}
      />
      <Text px={3}>{"\u2228"}</Text>
      <RuleFormula
        rule={{ Ident: cast_rule.Or[1] }}
        highlighted={highlighted}
      />
      <Text>)</Text>
    </>
  );
};

const RuleNot = ({ rule, highlighted }: RuleFormulaProps) => {
  let cast_rule = rule as { Not: RuleIdentifier };
  return (
    <>
      <Text>(</Text>
      <Text>{"\u00AC"}</Text>
      <RuleFormula rule={{ Ident: cast_rule.Not }} highlighted={highlighted} />
      <Text>)</Text>
    </>
  );
};

const RuleImplication = ({ rule, highlighted }: RuleFormulaProps) => {
  let cast_rule = rule as { Imp: RuleIdentifier[] };
  return (
    <>
      <Text>(</Text>
      <RuleFormula
        rule={{ Ident: cast_rule.Imp[0] }}
        highlighted={highlighted}
      />
      <Text px={3}>{"\u2192"}</Text>
      <RuleFormula
        rule={{ Ident: cast_rule.Imp[1] }}
        highlighted={highlighted}
      />
      <Text>)</Text>
    </>
  );
};

const RuleTrue = ({ rule, highlighted }: RuleFormulaProps) => {
  return <Text>{"\u22A4"}</Text>;
};

const RuleFalse = ({ rule, highlighted }: RuleFormulaProps) => {
  return <Text>{"\u22A5"}</Text>;
};

const RuleForall = ({ rule, highlighted }: RuleFormulaProps) => {
  let cast_rule = rule as { Forall: object[] };
  let letter = cast_rule.Forall[0] as RuleIdentifier;
  let sub_formula = cast_rule.Forall[1] as RuleFormulaType;

  return (
    <>
      <Text>{"\u2200"}</Text>
      <RuleFormula rule={{ Ident: letter }} highlighted={highlighted} />
      <Text>{"."}</Text>
      <RuleFormula rule={sub_formula} highlighted={highlighted} />
    </>
  );
};

const RuleExists = ({ rule, highlighted }: RuleFormulaProps) => {
  let cast_rule = rule as { Exists: object[] };
  let letter = cast_rule.Exists[0] as RuleIdentifier;
  let sub_formula = cast_rule.Exists[1] as RuleFormulaType;

  return (
    <>
      <Text>{"\u2203"}</Text>
      <RuleFormula rule={{ Ident: letter }} highlighted={highlighted} />
      <Text>{"."}</Text>
      <RuleFormula rule={sub_formula} highlighted={highlighted} />
    </>
  );
};

const RuleSubstitution = ({ rule, highlighted }: RuleFormulaProps) => {
  let cast_rule = rule as { Substitution: RuleIdentifier[] };
  let sub_formula = cast_rule.Substitution[0];
  let from = cast_rule.Substitution[1];
  let to = cast_rule.Substitution[2];

  return (
    <>
      <RuleFormula rule={{ Ident: sub_formula }} highlighted={highlighted} />
      <Text>{"["}</Text>
      <RuleFormula rule={{ Ident: from }} highlighted={highlighted} />
      <Text>{"\u2192"}</Text>
      <RuleFormula rule={{ Ident: to }} highlighted={highlighted} />
      <Text>{"]"}</Text>
    </>
  );
};

export {
  RuleIdent,
  RuleAnd,
  RuleOr,
  RuleNot,
  RuleImplication,
  RuleTrue,
  RuleFalse,
  RuleForall,
  RuleExists,
  RuleSubstitution,
};
