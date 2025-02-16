import { Rules } from "@/lib/api";
import { Text } from "@mantine/core";

type RuleNameProps = {
  name: Rules;
};

const RuleName = ({ name }: RuleNameProps) => {
  switch (name) {
    case "AndElimL":
      return <Text>{"\u2227"}EL</Text>;
    case "AndElimR":
      return <Text>{"\u2227"}ER</Text>;
    case "AndIntro":
      return <Text>{"\u2227"}I</Text>;
    case "Ax":
      return <Text>AXIOM</Text>;
    case "ExistsElim":
      return <Text>{"\u2203"}E**</Text>;
    case "ExistsIntro":
      return <Text>{"\u2203"}I</Text>;
    case "FalseElim":
      return <Text>{"\u22A5"}E</Text>;
    case "ForallElim":
      return <Text>{"\u2200"}E</Text>;
    case "ForallIntro":
      return <Text>{"\u2200"}I*</Text>;
    case "ImplElim":
      return <Text>{"\u2192"}E</Text>;
    case "ImplIntro":
      return <Text>{"\u2192"}I</Text>;
    case "NotElim":
      return <Text>{"\u00AC"}E</Text>;
    case "NotIntro":
      return <Text>{"\u00AC"}I</Text>;
    case "OrElim":
      return <Text>{"\u2228"}E</Text>;
    case "OrIntroL":
      return <Text>{"\u2228"}I</Text>;
    case "OrIntroR":
      return <Text>{"\u2228"}I</Text>;
    case "AlphaExists":
      return (
        <Text>
          {"\u03B1"}
          {"\u2203"}***
        </Text>
      );
    case "AlphaForall":
      return (
        <Text>
          {"\u03B1"}
          {"\u2200"}***
        </Text>
      );
  }
};

export default RuleName;
