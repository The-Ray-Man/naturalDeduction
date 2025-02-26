"use client";
import { Statement } from "@/lib/api";
import Node, { NodeType } from "./node";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import {
  ActionIcon,
  Center,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useNodesContext } from "@/lib/hook/FormulaContext";
import { IconCopy, IconFileTypePng, IconZoomCancel } from "@tabler/icons-react";
import { treeCompleted } from "@/lib/utils/finished";
import { useWindowSize } from "react-use";
import { exportToTypst } from "@/lib/utils/export";
import { $typst } from "@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs"
import { showError, showInfo } from "@/lib/utils/notifications";
import { notifications } from "@mantine/notifications";

const TYPST_COMPILER_URL = process.env["NEXT_PUBLIC_TYPST_COMPILER_URL"] || "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm"
const TYPST_RENDERER_URL = process.env["NEXT_PUBLIC_TYPST_RENDERER_URL"] || "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm"

type ExerciseProps = {
  exercise: Statement;
};

const Exercise = ({ exercise }: ExerciseProps) => {
  const { nodes, handler, rootId, currentId, currentIdHandler } =
    useNodesContext();
  const [compiling, setCompiling] = useState<boolean>(false);

  const [done, setDone] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { width, height } = useWindowSize();

  useEffect(() => {
    if (nodes) {
      const root_node = nodes.find((n) => n.name == rootId);
      if (!root_node) {
        return;
      }
      const completed = treeCompleted(root_node, nodes);
      setDone(completed);
      setCompleted(completed);
      if (completed) {
        setTimeout(() => {
          setDone(false);
        }, 5000);
      }
    }
  }, [nodes]);

  useEffect(() => {
    if (exercise && rootId) {
      const root_node = {
        name: rootId,
        premisses: [],
        rule: undefined,
        statement: exercise,
      } as NodeType;

      handler.setState([root_node]);
    }
  }, [exercise]);

  const initializeTypst = () => {
    if (($typst as any).isInitialized) return;
    $typst.setCompilerInitOptions({
      getModule: () => TYPST_COMPILER_URL
    });
    $typst.setRendererInitOptions({
      getModule: () => TYPST_RENDERER_URL
    });
    ($typst as any).isInitialized = true;
  }

  const covertSvgToPng = async (svg: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgEl.innerHTML = svg;
      const width = parseFloat(svgEl.firstElementChild!.getAttribute("width") as string);
      const height = parseFloat(svgEl.firstElementChild!.getAttribute("height") as string);

      const img = new Image();
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      img.setAttribute("crossorigin", "anonymous");
      img.onload = async function () {
           const canvas = document.createElement("canvas");
           canvas.width = width * 2;
           canvas.height = height * 2;
           const ctx = canvas.getContext("2d");
           if (!ctx) return reject("Canvas context does not exist");
           ctx.clearRect(0, 0, width * 2, height * 2);
           ctx.drawImage(img, 0, 0, width * 2, height * 2);
           URL.revokeObjectURL(url);

           canvas.toBlob(async (blob) => {
             if (!blob) return reject("Canvas could not be exported to Blob");
             resolve(blob)
           }, "image/png");
       };
      img.src = url;
    });
  }

  const handleTypstSourceExport = async () => {
    const root = nodes?.find(node => node.name === rootId);
    if (!root) return;
    const typstStr = exportToTypst(root, nodes || []);
    await navigator.clipboard.writeText(typstStr);
    showInfo("Copied typst source to clipboard")
  }

  const handleTypstPngExport = async () => {
    const root = nodes?.find(node => node.name === rootId);
    if (!root) return;
    setCompiling(true);
    const typstStr = exportToTypst(root, nodes || []);
    initializeTypst();
    notifications.show({
      title: "Info",
      message: "Compiling typst source, this may take a while!",
      color: "gray",
    });

    try {
      const svg = await $typst.svg({ data_selection: { js: false, css: true, body: true, defs: true }, mainContent: typstStr } as any)
      const blob = await covertSvgToPng(svg);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      showInfo("Copied exported png to clipboard");
    } catch (err) {
      showError(`Failed to copy png: ${err}`)
    } finally {
      setCompiling(false)
    }
  }

  return (
    <>
      {done && <Confetti width={width} height={height} />}
      <Group w={"100%"}>
        <Stack w={50}>
          <ActionIcon
            onClick={() => currentIdHandler(rootId!)}
            disabled={rootId == currentId}
          >
            <IconZoomCancel />
          </ActionIcon>
          <Tooltip label={"Copy typst source for proof formula"}>
            <ActionIcon disabled={!completed} onClick={handleTypstSourceExport}>
              <IconCopy />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={"Export proof formula as png"}>
            <ActionIcon disabled={!completed || compiling} onClick={handleTypstPngExport}>
              <IconFileTypePng  />
            </ActionIcon>
          </Tooltip>
        </Stack>
        <Center w={"100%"}>
          <ScrollArea>
            {nodes && nodes.length > 0 ? (
              <Node
                node={nodes.find((n) => n.name == currentId)!}
                all_nodes={nodes}
              />
            ) : (
              <>
                <Text>Loading...</Text>
              </>
            )}
          </ScrollArea>
        </Center>
      </Group>
    </>
  );
};

export default Exercise;
