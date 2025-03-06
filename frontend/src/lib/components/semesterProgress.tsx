import { Slider } from "@mantine/core";

const SemsterProgress = () => {
  const dates = [
    [new Date("2025-02-17"), "Semester Start"],
    [new Date("2025-03-13"), "Midterm I"],
    [new Date("2025-05-13"), "Midterm II"],
    [new Date("2025-05-30"), "Semester End"],
    [new Date("2025-08-10"), "Final Exam"],
  ];

  const duration =
    (dates[dates.length - 1][0] as Date).getTime() -
    (dates[0][0] as Date).getTime();

  const now = new Date();
  const current_progress = Math.min(
    100,
    ((now.getTime() - (dates[0][0] as Date).getTime()) / duration) * 100,
  );

  return (
    <Slider
      ml={100}
      mr={"md"}
      style={{ flexGrow: "1", pointerEvents: "none" }}
      value={current_progress}
      marks={dates.map(([date, label]) => {
        return {
          value:
            (((date as Date).getTime() - (dates[0][0] as Date).getTime()) /
              duration) *
            100,
          label: label as string,
        };
      })}
      size={"md"}
    ></Slider>
  );
};

export default SemsterProgress;
