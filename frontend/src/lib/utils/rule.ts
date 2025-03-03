import { Formula, Rules } from "../api";

export function getRuleByName(name: Rules): string {
  switch (name) {
    case "AndElimL":
      return "\u2227EL";
    case "AndElimR":
      return "\u2227ER";
    case "AndIntro":
      return "\u2227I";
    case "Ax":
      return "AXIOM";
    case "ExistsElim":
      return "\u2203E**";
    case "ExistsIntro":
      return "\u2203I";
    case "FalseElim":
      return "\u22A5E";
    case "ForallElim":
      return "\u2200E";
    case "ForallIntro":
      return "\u2200I*";
    case "ImplElim":
      return "\u2192E";
    case "ImplIntro":
      return "\u2192I";
    case "NotElim":
      return "\u00ACE";
    case "NotIntro":
      return "\u00ACI";
    case "OrElim":
      return "\u2228E";
    case "OrIntroL":
      return "\u2228I";
    case "OrIntroR":
      return "\u2228I";
    case "AlphaExists":
      return "\u03B1\u2203***";
    case "AlphaForall":
      return "\u03B1\u2200***";
  }
}

export function getTypstRuleByName(name: Rules, footnote: number): string | [string, string] {
  switch (name) {
    case "AndElimL":
      return 'and "EL"';
    case "AndElimR":
      return 'and "ER"';
    case "AndIntro":
      return 'and "I"';
    case "Ax":
      return '"AXIOM"';
    case "ExistsElim":
      return [`exists "E"^(${footnote})`, '%%identifier%% "does not occur freely in any formula in" %%lhs%% "or" %%rhs%%'];
    case "ExistsIntro":
      return 'exists "I"';
    case "FalseElim":
      return 'bot "E"';
    case "ForallElim":
      return 'forall "E"';
    case "ForallIntro":
      return [`forall "I"^$(${footnote})`, '%%identifier%% "does not occur freely in any formula in" %%lhs%%'];
    case "ImplElim":
      return 'arrow.r "E"';
    case "ImplIntro":
      return 'arrow.r "I"';
    case "NotElim":
      return 'not "E"';
    case "NotIntro":
      return 'not "I"';
    case "OrElim":
      return 'or "E"';
    case "OrIntroL":
      return 'or "I"';
    case "OrIntroR":
      return 'or "I"';
    case "AlphaExists":
      return [`alpha exists^(${footnote})`, '"the binding structure is preserved"'];
    case "AlphaForall":
      return [`alpha forall^(${footnote})`, '"the binding structure is preserved"'];
  }
}

export function getSideCondition(name: Rules): string | undefined {
  switch (name) {
    case "AlphaExists":
    case "AlphaForall":
      return "the binding structure is preserved";
    case "ExistsElim":
      return "x does not occur freely in any formula in Γ or B";
    case "ForallIntro":
      return "x does not occur freely in any formula in Γ";
  }
  return undefined;
}
