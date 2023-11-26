import React from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';

Chart.register(...registerables);

export let UpdatePlayerKillsChart;

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


const PlayerKillsChart = (props) => {
  const [, updateState] = React.useState();
  UpdatePlayerKillsChart = React.useCallback(() => updateState({}), []);

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
        text: 'player kills'
      },
      scales: {
        y: {
          beginAtZero: true
        },
      },
    },
  };

  data.labels = [];
  data.datasets[0].data = [];

  const players = Object.entries(props.gameState.players);
  const sortedPlayers = players.map( (item, index) => {
    let playerData = item[1];
    playerData['chartColor'] = chartColors[index];
    return playerData;
  }).sort((a, b) => {
    return (a.kills-a.deaths <= b.kills-b.deaths) ? 1 : -1;
  });

  sortedPlayers.forEach( (player) => {
    data.labels.push(player.name);
    data.datasets[0].data.push(player.kills-player.deaths);
    data.datasets[0].backgroundColor.push(player.chartColor);
    data.datasets[0].borderColor.push(player.chartColor);
  });

  return <Bar data={data} options={options}/>;
}
export default PlayerKillsChart;
