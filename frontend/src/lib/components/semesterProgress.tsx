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

  return (
    <Slider
      ml={100}
      mr={"md"}
      style={{ flexGrow: "1", pointerEvents: "none" }}
      value={10}
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
