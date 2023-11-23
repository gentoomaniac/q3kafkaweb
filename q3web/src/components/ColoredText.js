import React from 'react';

import ColorSpan from "./ColorSpan";

const ColoredText = (props) =>{
  const splits = props.text.split("^");
  if (splits[0] === '')
    splits.shift();

  const colorFragments = splits.map(item => {
      // if text fragment starts with a digit it is color formatted
      // TODO: There's an edgecase where a text started with a number.
      // The split removed the ^. The empty first element would indicate
      // if it was a plain character or a color format digit
      if (/^\d+$/.test(item[0]))
        return <ColorSpan item={item.substring(1)} color={item[0]} />;
      else
        return <span>{item}</span>
  });
  return colorFragments;
}
export default ColoredText;