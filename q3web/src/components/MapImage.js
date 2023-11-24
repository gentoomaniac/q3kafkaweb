import React from 'react';

export let UpdateMapImage;

let map = "";

export const SetMap = (newMap) => {
  map = newMap;
}

const MapImage = () => {
  const [, updateState] = React.useState();
  UpdateMapImage = React.useCallback(() => updateState({}), []);

  const mapShot = "/img/levelshots/" + map + ".jpg";

  if (map) {
    return (
      <>
        <img className="level-shot" src={mapShot} />
      </>
    );
  }
}

export default MapImage;