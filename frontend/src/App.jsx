import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [name , setName ] = useState("Harshal");
  const [n,setN] = useState(0);
  
  const changeName = () => {
    setN((n+1) & 1);
    n&1 ? setName("Kotkar") : setName("Harshal");
    console.log("Name changed",name,n);
  }

  return (
    <>
      <p>Name is : {name}</p>
      <button onClick={changeName}>Change name</button>
        
    </>
  )
}

export default App
