import React, { useState } from "react";
import { admin } from "./abi/adminAbi";
import { insurance } from "./abi/insuranceAbi";
import Web3 from "web3";
import "./App.css";

const web3 = new Web3(Web3.givenProvider);
const contractAdminAddress = "0xF69fCD76732d71B6161c8972B7123dB2eF40A0f5";
const contractInsuranceAddress = "0x25999fF47705AC7C7D352a014e381DaFE6c7021F";
const adminContract = new web3.eth.Contract(admin, contractAdminAddress);
const insuranceContract = new web3.eth.Contract(insurance, contractInsuranceAddress);

function App() {
  const [number, setUint] = useState(0);
  const [getNumber, setGet] = useState("0");
 
  const numberSet = async (t) => {
    t.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const gas = await storageContract.methods.set(number).estimateGas();
    const post = await storageContract.methods.set(number).send({
      from: account,
      gas,
    });
  };
 
  const numberGet = async (t) => {
    t.preventDefault();
    const post = await storageContract.methods.get().call();
    setGet(post);
  };

  return (
    <div className="main">
      <div className="card">
        <form className="form" onSubmit={numberSet}>
          <label>
            Set your uint256:
            <input
              className="input"
              type="text"
              name="name"
              onChange={(t) => setUint(t.target.value)}
            />
          </label>
          <button className="button" type="submit" value="Confirm">
            Confirm
          </button>
        </form>
        <br />
        <button className="button" onClick={numberGet} type="button">
          Get your uint256
        </button>
        {getNumber}
      </div>
    </div>
  );
 }
 
 export default App;
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
