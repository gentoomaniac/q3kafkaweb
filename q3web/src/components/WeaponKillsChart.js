import React from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';

Chart.register(...registerables);

export let UpdateWeaponKillsChart;

const chartColors = [
  'rgba(255, 0, 0, 0.8)',
  'rgba(128, 0, 0, 0.8)',
  'rgba(255, 255, 0, 0.8)',
  'rgba(128, 128, 0, 0.8)',
  'rgba(0, 255, 0, 0.8)',
  'rgba(0, 128, 0, 0.8)',
  'rgba(0, 255, 255, 0.8)',
  'rgba(0, 120, 128, 0.8)',
  'rgba(0, 0, 255, 0.8)',
  'rgba(0, 0, 128, 0.8)',
  'rgba(255, 0, 255, 0.8)',
  'rgba(128, 0, 128, 0.8)',
];


const WeaponKillsChart = (props) => {
  const [, updateState] = React.useState();
  UpdateWeaponKillsChart = React.useCallback(() => updateState({}), []);

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
    indexAxis: 'y',
    minBarLength: 1,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'kills per weapon'
      },
      scales: {
        x: {
          beginAtZero: true
        },
      },
    },
  };

  data.labels = [];
  data.datasets[0].data = [];



  // TODO: add images
  // https://www.chartjs.org/chartjs-plugin-annotation/latest/samples/line/image.html
  const stats = Object.entries(props.gameState.weapons);
  const sortedWeapons = stats.map( (item, index) => {
    let data = item[1];
    data['chartColor'] = chartColors[index];
    return data;
  }).sort((a, b) => {
    return (a.kills <= b.kills) ? 1 : -1;
  });

  sortedWeapons.forEach( (weapon) => {
    data.labels.push(weapon.name);
    data.datasets[0].data.push(weapon.kills);
    data.datasets[0].backgroundColor.push(weapon.chartColor);
    data.datasets[0].borderColor.push(weapon.chartColor);
  });

  return <Bar data={data} options={options}/>;
}
export default WeaponKillsChart;
