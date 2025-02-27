import { DerivationRule, RuleIdentifier, RuleStatement } from "../api";

function getIdentifiers(statement: RuleStatement): RuleIdentifier[] {
  let identifiers = [];
  if (statement.lhs) {
    identifiers.push(statement.lhs);
  }

  const getFormulaIdentifiers = (): Array<RuleIdentifier> => {
    switch (statement.formula.type) {
      case "And":
      case "Or":
      case "Imp":
        return Object.values(statement.formula.body);
      case "Forall":
      case "Exists":
        return [
          statement.formula.body.identifier,
          ...getIdentifiers({ formula: statement.formula.body.formula }),
        ];
      case "Substitution":
        return Object.values(statement.formula.body);
      case "Ident":
      case "Not":
        return [statement.formula.body];
      default:
        return [];
    }
  };

  if (statement.formula) identifiers.push(...getFormulaIdentifiers());

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
