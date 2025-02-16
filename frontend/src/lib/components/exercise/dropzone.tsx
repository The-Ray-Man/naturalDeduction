import { useDroppable } from "@dnd-kit/core";
import { Box } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface DropZoneProps {
  id: string;
}

const DropZone: React.FC<DropZoneProps> = ({ id }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      style={{
        border: "1px dashed gray",
        backgroundColor: isOver ? "lightgreen" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0",
        borderRadius: 5,
      }}
    >
      <IconPlus style={{ strokeWidth: 1 }} />
    </Box>
  );
};

export default DropZone;
