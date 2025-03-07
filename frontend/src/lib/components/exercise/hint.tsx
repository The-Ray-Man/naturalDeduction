import {
  Rules,
  Statement as StatementType,
  Tipp,
  useGetTippMutation,
} from "@/lib/api";
import { getRuleByName } from "@/lib/utils/rule";
import {
  Accordion,
  Box,
  Button,
  Divider,
  Drawer,
  Flex,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import { IconBulb } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { RuleAnd } from "../rule/ruleParts";
import DerivationRule from "../rule/rule";
import Statement from "../statement";
import RuleName from "../rule/ruleName";

type DerivationStepProps = {
  statement: StatementType;
  premisses: StatementType[];
  rule: Rules;
};

const DerivationStep = ({
  statement,
  premisses,
  rule,
}: DerivationStepProps) => {
  return (
    <Stack gap={0}>
      <Flex gap={"xl"} justify="center" align="flex-end">
        {premisses.length > 0 && (
          <Group align="flex-end" w={"fit-content"}>
            {premisses.map((premiss, i) => {
              return <Statement statement={premiss} key={i} />;
            })}
          </Group>
        )}
      </Flex>

      <Group justify="center" align="start">
        <Stack gap={0}>
          <Divider
            style={{ borderColor: "currentColor" }}
            mb={8}
            w={"100%"}
          ></Divider>
          <Flex justify={"center"}>
            <Statement statement={statement} />
          </Flex>
        </Stack>
        <Group pl={-10} mt={-5} gap={15}>
          <Box className="katex">
            <RuleName name={rule} />
          </Box>
        </Group>
      </Group>
    </Stack>
  );
};

type HintProps = {
  statement: StatementType;
  opened: boolean;
  close: () => void;
};

const Hint = ({ statement, opened, close }: HintProps) => {
  const [getHint, refetch] = useGetTippMutation();
  const [hints, hintsHandler] = useListState<Tipp>([]);

  useEffect(() => {
    loadHint();
  }, [opened]);

  const loadHint = async () => {
    try {
      let result = await getHint({ statement: statement }).unwrap();
      hintsHandler.setState(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Drawer
        title="Hint"
        opened={opened}
        onClose={close}
        size="xl"
        position="right"
      >
        {hints.length == 0 && <Text>No Hint available</Text>}

        {hints && (
          <Accordion defaultValue="Apples">
            {hints.map((hint, i) => (
              <Accordion.Item key={i} value={i.toString()}>
                <Accordion.Control>
                  <Box className="katex">{getRuleByName(hint.rule)}</Box>
                </Accordion.Control>
                <Accordion.Panel>
                  <DerivationStep
                    statement={statement}
                    premisses={hint.premisses}
                    rule={hint.rule}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Drawer>
    </>
  );
};
export default Hint;
