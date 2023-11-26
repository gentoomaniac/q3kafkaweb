import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export let UpdateWeaponKillsPie;

const chartColors = [
  'rgba(255, 0, 0, 0.4)',
  'rgba(128, 0, 0, 0.4)',
  'rgba(255, 255, 0, 0.4)',
  'rgba(128, 128, 0, 0.4)',
  'rgba(0, 255, 0, 0.4)',
  'rgba(0, 128, 0, 0.4)',
  'rgba(0, 255, 255, 0.4)',
  'rgba(0, 120, 128, 0.4)',
  'rgba(0, 0, 255, 0.4)',
  'rgba(0, 0, 128, 0.4)',
  'rgba(255, 0, 255, 0.4)',
  'rgba(128, 0, 128, 0.4)',
];


const WeaponKillsPie = (props) => {
  const [, updateState] = React.useState();
  UpdateWeaponKillsPie = React.useCallback(() => updateState({}), []);

  let stats = Object.entries(props.gameState.weapons);

  const data = {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 2,
    }],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'kills per weapon'
      },
    },
  };

  data.labels = [];
  data.datasets[0].data = [];

  stats.forEach( (weapon) => {
    let v = weapon[1];
    data.labels.push(v.name);
    data.datasets[0].data.push(v.kills);
  });
  data.datasets[0].backgroundColor = chartColors.slice(0, data.labels.length)
  data.datasets[0].borderColor = chartColors.slice(0, data.labels.length)

  return <Pie data={data} options={options}/>;
}
export default WeaponKillsPie;
