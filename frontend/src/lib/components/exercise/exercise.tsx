"use client";
import { Statement } from "@/lib/api";
import Node, { NodeType } from "./node";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import {
  ActionIcon,
  Center,
  Group,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useNodesContext } from "@/lib/hook/FormulaContext";
import { IconCopy, IconZoomCancel } from "@tabler/icons-react";
import { treeCompleted } from "@/lib/utils/finished";
import { useWindowSize } from "react-use";
import { exportToTypst } from "@/lib/utils/export";
import { $typst, TypstSnippet } from "@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs"

type ExerciseProps = {
  exercise: Statement;
};

const Exercise = ({ exercise }: ExerciseProps) => {
  const { nodes, handler, rootId, currentId, currentIdHandler } =
    useNodesContext();
  const svgRef = useRef<SVGSVGElement>(null);

  const [done, setDone] = useState(false);

  const { width, height } = useWindowSize();

  useEffect(() => {
    if (nodes) {
      const root_node = nodes.find((n) => n.name == rootId);
      if (!root_node) {
        return;
      }
      const completed = treeCompleted(root_node, nodes);
      setDone(completed);
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

  const handleTypstExport = async () => {
    const root = nodes?.find(node => node.name === rootId);
    if (!root) return;
    const typstStr = exportToTypst(root, nodes || []);
    // TODO: Copy to clipboard

    $typst.setCompilerInitOptions({
      getModule: () =>
        'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
    });
    $typst.setRendererInitOptions({
      getModule: () =>
        'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
    });

    const text = `
      #import "@preview/curryst:0.5.0": rule, prooftree

      #set page(fill: none, width: auto, height: auto, margin: (x: 1em, y: 1em))

      ${typstStr}
    `


    console.log(text);

    const canvas = document.createElement("canvas");
    const svg = await $typst.canvas(canvas, {
      mainContent: text,
    });
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // const img = document.createElement("img");
    // img.src = dataUrl;
    // svgEl.innerHTML = svg;
    // const width = svgEl.clientWidth;
    // const height = svgEl.clientHeight;

    // new Promise((resolve, reject) => {
    //         // Create a Blob from the SVG string
    //         const blob = new Blob([svg], { type: 'image/svg+xml' });
    //         const url = URL.createObjectURL(blob);

    //         // Create an Image element
    //         const img = new Image();
    //         img.onload = () => {
    //             // Create a Canvas and draw the image
    //             const canvas = document.createElement('canvas');
    //             canvas.width = width;
    //             canvas.height = height;
    //             const ctx = canvas.getContext('2d');

    //             ctx!.clearRect(0, 0, width, height);
    //             ctx!.drawImage(img, 0, 0, width, height);

    //             // Convert canvas to PNG
    //             canvas.toBlob((blob) => {
    //                 URL.revokeObjectURL(url); // Clean up
    //                 resolve(blob);
    //             }, 'image/png');
    //         };

    //         img.onerror = (err) => {
    //             reject(err);
    //         };

    //         img.src = url;
    //     });

    // const pngDataUrl = canvas.toDataURL("image/png");
    // console.log(dataUrl)

    try {
      const png: Blob = await new Promise((resolve, reject) => canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject();
      }, "image/png", 1.0));
      const url = URL.createObjectURL(png);
      console.log(url);
      // navigator.clipboard.write([
      //   new ClipboardItem({
      //     'image/png': png
      //   })
      // ])
    } catch(e) {
      console.error(e);
    }
  }

  return (
    <>
      {done && <Confetti width={width} height={height} />}
      <svg ref={svgRef} />
      <Group w={"100%"}>
        <Stack w={50}>
          <ActionIcon
            onClick={() => currentIdHandler(rootId!)}
            disabled={rootId == currentId}
          >
            <IconZoomCancel />
          </ActionIcon>
          <ActionIcon disabled={!done} onClick={handleTypstExport}>
            <IconCopy  />
          </ActionIcon>
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
