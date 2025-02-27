import { Group } from "@mantine/core";
import { RuleFormula as RuleFormulaType } from "../../api";
import {
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
} from "./ruleParts";
import { useMemo } from "react";

export type RuleFormulaProps<T extends RuleFormulaType["type"]> = {
  rule: RuleFormulaType & { type: T };
  highlighted?: number | string;
};

const RuleFormula = ({
  rule,
  highlighted,
}: RuleFormulaProps<RuleFormulaType["type"]>) => {
  const inner = useMemo(() => {
    switch (rule.type) {
      case "Ident":
        return <RuleIdent rule={rule} highlighted={highlighted} />;
      case "And":
        return <RuleAnd rule={rule} highlighted={highlighted} />;
      case "Or":
        return <RuleOr rule={rule} highlighted={highlighted} />;
      case "Not":
        return <RuleNot rule={rule} highlighted={highlighted} />;
      case "Imp":
        return <RuleImplication rule={rule} highlighted={highlighted} />;
      case "False":
        return <RuleFalse rule={rule} highlighted={highlighted} />;
      case "True":
        return <RuleTrue rule={rule} highlighted={highlighted} />;
      case "Forall":
        return <RuleForall rule={rule} highlighted={highlighted} />;
      case "Exists":
        return <RuleExists rule={rule} highlighted={highlighted} />;
      case "Substitution":
        return <RuleSubstitution rule={rule} highlighted={highlighted} />;
    }
  }, [rule, highlighted]);

  return <Group gap={0}>{inner}</Group>;
};

export default RuleFormula;
