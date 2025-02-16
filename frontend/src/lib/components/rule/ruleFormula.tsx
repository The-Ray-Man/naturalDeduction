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
} from "./rule_parts";

export type RuleFormulaProps = {
  rule: RuleFormulaType;
  highlighted?: number | string;
};

const RuleFormula = ({ rule, highlighted }: RuleFormulaProps) => {
  let inner = undefined;
  if (rule.hasOwnProperty("Ident")) {
    inner = <RuleIdent rule={rule} highlighted={highlighted} />;
  }

  if (rule.hasOwnProperty("And")) {
    inner = <RuleAnd rule={rule} highlighted={highlighted} />;
  }

  if (rule.hasOwnProperty("Or")) {
    inner = <RuleOr rule={rule} highlighted={highlighted} />;
  }

  if (rule.hasOwnProperty("Not")) {
    inner = <RuleNot rule={rule} highlighted={highlighted} />;
  }

  if (rule.hasOwnProperty("Imp")) {
    inner = <RuleImplication rule={rule} highlighted={highlighted} />;
  }

  if (rule === "False") {
    inner = <RuleFalse rule={rule} highlighted={highlighted} />;
  }
  if (rule === "True") {
    inner = <RuleTrue rule={rule} highlighted={highlighted} />;
  }
  if (rule.hasOwnProperty("Forall")) {
    inner = <RuleForall rule={rule} highlighted={highlighted} />;
  }
  if (rule.hasOwnProperty("Exists")) {
    inner = <RuleExists rule={rule} highlighted={highlighted} />;
  }
  if (rule.hasOwnProperty("Substitution")) {
    inner = <RuleSubstitution rule={rule} highlighted={highlighted} />;
  }

  return <Group gap={0}>{inner}</Group>;
};

export default RuleFormula;
