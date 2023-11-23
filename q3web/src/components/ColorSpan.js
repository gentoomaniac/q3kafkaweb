import React from 'react';

export const COLORS = {
  "0": "black",
  "1": "red",
  "2": "green",
  "3": "yellow",
  "4": "blue",
  "5": "cyan",
  "6": "pink",
  "7": "white",
  "8": "orange"
};

const ColorSpan = (props) => {
  if (props.color in COLORS)
    return <span className={COLORS[props.color]}>{props.item}</span>;
  else
    return <span>{props.item}</span>;
}

export default ColorSpan;
