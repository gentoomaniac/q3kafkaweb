import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export let UpdatePlayerKillsPie;

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


const PlayerKillsPie = (props) => {
  const [, updateState] = React.useState();
  UpdatePlayerKillsPie = React.useCallback(() => updateState({}), []);

  let players = Object.entries(props.gameState.players);

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
        text: 'player kills'
      },
    },
  };

  data.labels = [];
  data.datasets[0].data = [];

  players.forEach( (playerData) => {
    let player = playerData[1];
    data.labels.push(player.name);
    data.datasets[0].data.push(player.kills-player.deaths);
  });
  data.datasets[0].backgroundColor = chartColors.slice(0, data.labels.length)
  data.datasets[0].borderColor = chartColors.slice(0, data.labels.length)

  return <Pie data={data} options={options}/>;
}
export default PlayerKillsPie ;
