import {
  DerivationRule,
  RuleFormula,
  RuleIdentifier,
  RuleStatement,
} from "../api";

function getIdentifiers(statement: RuleStatement): RuleIdentifier[] {
  let identifiers = [];
  if (statement.lhs) {
    identifiers.push(statement.lhs);
  }

  if (statement.formula) {
    if (statement.formula.hasOwnProperty("And")) {
      for (let identifier of (statement.formula as { And: RuleIdentifier[] })
        .And) {
        identifiers.push(identifier);
      }
    } else if (statement.formula.hasOwnProperty("Or")) {
      for (let identifier of (statement.formula as { Or: RuleIdentifier[] })
        .Or) {
        identifiers.push(identifier);
      }
    } else if (statement.formula.hasOwnProperty("Imp")) {
      for (let identifier of (statement.formula as { Imp: RuleIdentifier[] })
        .Imp) {
        identifiers.push(identifier);
      }
    } else if (statement.formula.hasOwnProperty("Forall")) {
      let formula = (statement.formula as { Forall: object[] }).Forall;
      let variable = formula[0] as RuleIdentifier;
      let sub_formula = formula[1] as RuleFormula;
      identifiers.push(variable);
      identifiers = identifiers.concat(
        getIdentifiers({ formula: sub_formula }),
      );
    } else if (statement.formula.hasOwnProperty("Exists")) {
      let formula = (statement.formula as { Exists: object[] }).Exists;
      let variable = formula[0] as RuleIdentifier;
      let sub_formula = formula[1] as RuleFormula;
      identifiers.push(variable);
      identifiers = identifiers.concat(
        getIdentifiers({ formula: sub_formula }),
      );
    } else if (statement.formula.hasOwnProperty("Substitution")) {
      for (let identifier of (
        statement.formula as { Substitution: RuleIdentifier[] }
      ).Substitution) {
        identifiers.push(identifier);
      }
    } else if (statement.formula.hasOwnProperty("Ident")) {
      identifiers.push((statement.formula as { Ident: RuleIdentifier }).Ident);
    } else if (statement.formula.hasOwnProperty("Not")) {
      identifiers.push((statement.formula as { Not: RuleIdentifier }).Not);
    }
  }

  return identifiers;
}

export function getAllIdentifiers(rule: DerivationRule): RuleIdentifier[] {
  let sub_formulas = getIdentifiers(rule.conclusion);
  for (let premise of rule.premises) {
    sub_formulas = sub_formulas.concat(getIdentifiers(premise));
  }

  let helper: String[] = [];
  let unique_identifiers: RuleIdentifier[] = [];
  for (let ident of sub_formulas) {
    let s = JSON.stringify(ident);
    if (!helper.includes(s)) {
      unique_identifiers.push(ident);
      helper.push(s);
    }
  }

  return unique_identifiers;
}
