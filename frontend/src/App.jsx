import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [flag1,setFlag1] = useState(true);
  const [flag2,setFlag2] = useState(false);

  useEffect(() => {
    
  },[flag1,flag2])

  

  return (
    <>

      {
        flag1 ? (
          <div>
            {
              flag2 ? (
                <div>
                    <button onClick={() => {setFlag2(false)}}>inside If </button>
                  </div>
              ) : 
              (
                  <div>
                    <button onClick={() => {setFlag2(true)}}>Inside else</button>
                  </div>
              )
            } 

          </div>
        ) : 
        (
          <div >
            <button>Main else</button>
          </div>
        )


      }
      
        
    </>
  )
}

export default App
