"use client";
// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
// import '@mantine/modals/styles.css';
import StoreProvider from "@/lib/redux/StoreProvider";
import "@mantine/notifications/styles.css";

import {
  AppShell,
  ColorSchemeScript,
  MantineProvider,
  Title,
  mantineHtmlProps,
} from "@mantine/core";
import { DragProvider } from "@/lib/hook/DragContext";
import { NodesProvider } from "@/lib/hook/FormulaContext";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import Footer from "@/lib/components/footer";
import Link from "next/link";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened] = useDisclosure();
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <StoreProvider>
          <DragProvider>
            <NodesProvider>
              <MantineProvider>
                <Notifications />
                <AppShell
                  header={{ height: 40 }}
                  navbar={{
                    width: 0,
                    breakpoint: "sm",
                    collapsed: { mobile: !opened },
                  }}
                  padding="md"
                >
                  <AppShell.Header>
                    <Link
                      href={"/"}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Title order={2} pl={"md"}>
                        FMFP Made Easy
                      </Title>
                    </Link>
                  </AppShell.Header>

                  <AppShell.Main>{children}</AppShell.Main>
                  <AppShell.Footer>
                    <Footer />
                  </AppShell.Footer>
                </AppShell>
              </MantineProvider>
            </NodesProvider>
          </DragProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
