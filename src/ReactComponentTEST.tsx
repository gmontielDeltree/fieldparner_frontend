import { useState } from 'react'
import "./App.css"

function ReactComponentTEST() {
  const [count, setCount] = useState(3)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/images/agrotools.png" className="logo" alt="FP logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default ReactComponentTEST