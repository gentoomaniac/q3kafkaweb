import React from 'react';

import { setupSocketIO, disconnectSocketIO} from '../main';

const ConnectPanel = () =>{
  return(
    <>
    <div>
      <button className="btn btn-light" onClick={() => setupSocketIO()}>connect</button>
    </div>
    </>
  )
}

export default ConnectPanel;