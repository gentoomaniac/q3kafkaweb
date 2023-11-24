import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export let UpdateWeaponKillsPie;

var data = {
  labels: [
    'MOD_GAUNTLET',
  'MOD_MACHINEGUN',
  'MOD_SHOTGUN',
  'MOD_GRENADE',
  'MOD_LIGHTNING',
  'MOD_PLASMA',
  'MOD_PLASMA_SPLASH',
  'MOD_RAILGUN',
  'MOD_ROCKET',
  'MOD_ROCKET_SPLASH',
  'MOD_BFG',
  'MOD_TRIGGER_HURT',
  'MOD_FALLING',
  'MOD_TELEFRAG'
  ],
  datasets: [Dataset()],
};

function Dataset() {
  return {
    label: 'kills per weapon',
    data: [],
    backgroundColor: [
      'rgba(255, 99, 132, 0.4)',
      'rgba(54, 162, 235, 0.4)',
      'rgba(255, 206, 86, 0.4)',
      'rgba(75, 192, 192, 0.4)',
      'rgba(153, 102, 255, 0.4)',
      'rgba(255, 159, 64, 0.4)',
      'rgba(255, 159, 64, 0.4)',
      'rgba(255, 159, 64, 0.4)',
      'rgba(255, 159, 64, 0.4)',
      'rgba(255, 159, 64, 0.4)',
      'rgba(255, 159, 64, 0.4)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 159, 64, 1)',
    ],
    borderWidth: 1,
  }
}


const WeaponKillsPie = (props) => {
  const [, updateState] = React.useState();
  UpdateWeaponKillsPie = React.useCallback(() => updateState({}), []);

  let dataset = Dataset();
  var weaponKills = props.gameState.weapons;
  for (const [key, value] of Object.entries(weaponKills)) {
    if (!data.labels.includes(value.name))
      data.labels.push(value.name);
    dataset.data.push(value.kills);
    console.log(dataset);
  }
  if (dataset.data.length > 0)
    data.datasets.push(dataset);
  console.log(data);

  return <Bar data={data} />;
}
export default WeaponKillsPie;
