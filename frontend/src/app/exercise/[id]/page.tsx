"use client";

import { useGetExerciseQuery } from "@/lib/api";
import ExerciseInterface from "@/lib/components/exercise/exerciseInterface";
import { UUID } from "crypto";
import { useParams } from "next/navigation";

const Page = () => {
  const { id } = useParams<{ id: UUID }>();

  const { data: exercise } = useGetExerciseQuery({ id });

  if (!exercise) {
    return <div>Loading...</div>;
  }

  return <ExerciseInterface exercise={exercise} />;
};

export default Page;
