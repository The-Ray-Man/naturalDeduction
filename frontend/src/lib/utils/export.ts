import { Formula, Rules } from "../api";
import { NodeType } from "../components/exercise/node";
import { getTypstRuleByName } from "./rule";

export function exportToTypst(root: NodeType, nodes: Array<NodeType>): string {
  const imp = `#import "@preview/curryst:0.5.0": rule, prooftree`;
  const page = `#set page(fill: none, width: auto, height: auto, margin: (x: 1em, y: 1em))`;
  const [formula, footnotes] = exportSubformula(root, nodes, 1);
  const prooftree = `#prooftree(${formula})`;

  const conditions = (root.statement.sidecondition || []).map(
    ({ NotFree: { element, placeholder } }) => {
      return `${element.value} "not occuring freely in" ${placeholder.value}`;
    },
  );
  conditions.push(...footnotes.map(([id, note]) => `$"${id}:" ${note}$`));

  let typstStr = `${imp}\n${page}\n${prooftree}`;

  if (conditions.length > 0) {
    typstStr += "\n#set text(size: 7pt)";
    typstStr +=
      "\n#let footnotes(body) = context {\n\tpad(top: 4pt, line(length: measure(body).width, stroke: 0.5pt + black))\n\tbody\n}";
    typstStr += `\n#footnotes[#stack(dir: ttb, spacing: 4pt, ${conditions.join(", ")})]`;
  }

  return typstStr;
}

function exportSubformula(
  node: NodeType,
  nodes: Array<NodeType>,
  footnoteNumber: number,
): [string, Array<[number, string]>] {
  let name = getTypstRuleByName(node.rule as Rules, footnoteNumber);
  const lhs = node.statement.lhs.map(formulaToTypst).join(", ") || "emptyset";
  const current = formulaToTypst(node.statement.formula);
  let currentFootnoteNumber = footnoteNumber;
  const footnotes: Array<[number, string]> = [];
  if (Array.isArray(name)) {
    currentFootnoteNumber++;
    const formula = node.statement.formula as Formula & {
      type: "Exists" | "Forall";
    };
    const footnote = name[1]
      .replaceAll("%%identifier%%", formula.body.identifier.value)
      .replaceAll("%%lhs%%", lhs)
      .replaceAll("%%rhs%%", current);
    footnotes.push([footnoteNumber, footnote]);
    name = name[0];
  }

  const premisses = node.premisses
    .map((premisse) => {
      return nodes.find((node) => node.name === premisse);
    })
    .filter(Boolean)
    .map((node) => {
      const [subformula, extraFootnotes] = exportSubformula(
        node as NodeType,
        nodes,
        currentFootnoteNumber,
      );
      currentFootnoteNumber += extraFootnotes.length;
      footnotes.push(...extraFootnotes);
      return subformula;
    })
    .join(",\n");

  return [
    `rule(name: $${name}$,$${lhs} tack ${current}$,${premisses})`,
    footnotes,
  ];
}

function formulaToTypst(formula: Formula): string {
  switch (formula.type) {
    case "And":
      return `${formulaToTypst(formula.body.lhs)} and ${formulaToTypst(formula.body.rhs)}`;
    case "Or":
      return `${formulaToTypst(formula.body.lhs)} or ${formulaToTypst(formula.body.rhs)}`;
    case "Not":
      return `not ${formulaToTypst(formula.body)}`;
    case "Ident":
      return `${formula.body.value}`;
    case "Imp":
      return `${formulaToTypst(formula.body.lhs)} arrow.r ${formulaToTypst(formula.body.rhs)}`;
    case "True":
      return "top";
    case "False":
      return "bot";
    case "Forall":
      return `forall ${formulaToTypst({ type: "Ident", body: formula.body.identifier })}. ${formulaToTypst(formula.body.formula)}`;
    case "Exists":
      return `exists ${formulaToTypst({ type: "Ident", body: formula.body.identifier })}. ${formulaToTypst(formula.body.formula)}`;
    case "Predicate": {
      const vars = formula.body.identifiers.map((id) => id.value).join(", ");
      return `${formula.body.identifier.value}(${vars})`;
    }
    default:
      return "";
  }
}
