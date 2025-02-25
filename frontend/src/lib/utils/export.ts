import { Formula, Rules } from "../api";
import { NodeType } from "../components/exercise/node";
import { getTypstRuleByName } from "./rule";

export function exportToTypst(root: NodeType, nodes: Array<NodeType>): string {
  return `#prooftree(${exportSubformula(root, nodes)})`;
}

function exportSubformula(node: NodeType, nodes: Array<NodeType>): string {
  const name = getTypstRuleByName(node.rule as Rules);
  const lhs = node.statement.lhs.map(formulaToTypst).join(", ");
  const current = formulaToTypst(node.statement.formula);

  const premisses = node.premisses
    .map(premisse => {
      return nodes.find(node => node.name === premisse);
    })
    .filter(Boolean)
    .map(node => exportSubformula(node as NodeType, nodes))
    .join(",\n");

  return `rule(name: $${name}$,$${lhs} tack ${current}$,${premisses})`
}

function formulaToTypst(formula: Formula): string {
  switch (formula.type) {
    case "And": return `${formulaToTypst(formula.body.lhs)} and ${formulaToTypst(formula.body.rhs)}`
    case "Or": return `${formulaToTypst(formula.body.lhs)} or ${formulaToTypst(formula.body.rhs)}`
    case "Not": return `not ${formulaToTypst(formula.body)}`
    case "Ident": return `${formula.body.value}`;
    case "Imp": return `${formulaToTypst(formula.body.lhs)} arrow.r ${formulaToTypst(formula.body.rhs)}`
    case "True": return "top"
    case "False": return "bot"
    case "Forall": return `formall ${formulaToTypst({ type: "Ident", body: formula.body.identifier })}. ${formulaToTypst(formula.body.formula)}`
    case "Exists": return `exists ${formulaToTypst({ type: "Ident", body: formula.body.identifier })}. ${formulaToTypst(formula.body.formula)}`
    case "Predicate": {
      const vars = formula.body.identifiers.map(id => id.value).join(", ");
      return `${formula.body.identifier}(${vars})`;
    }
    default: return "";
  }
}