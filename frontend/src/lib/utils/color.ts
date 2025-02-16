function get_color(i: number | string) {
  if (typeof i === "string") {
    i = i.charCodeAt(0);
  }

  const pastelColors = [
    "#FFB3BA",
    "#FFDFBA",
    "#FFFFBA",
    "#BAFFC9",
    "#BAE1FF",
    "#D7BDE2",
    "#F7DC6F",
    "#F0B27A",
    "#AED6F1",
    "#A9DFBF",
  ];
  return pastelColors[i % pastelColors.length];
}

export { get_color };
