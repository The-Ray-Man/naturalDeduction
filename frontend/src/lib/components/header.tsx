import { ActionIcon, Flex, Title, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

const Header: React.FC = (): React.ReactNode => {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();
  return (
    <Flex px={"md"} align="center" justify="space-between" h="100%">
      <Link href={"/"} style={{ textDecoration: "none", color: "inherit" }}>
        <Title order={2}>FMFP Made Easy</Title>
      </Link>
      <ActionIcon onClick={toggleColorScheme}>
        {colorScheme === "dark" ? <IconMoon /> : <IconSun />}
      </ActionIcon>
    </Flex>
  );
};

export default Header;
