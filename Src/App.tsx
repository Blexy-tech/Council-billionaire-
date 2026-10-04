src/App.tsx ---
import { useState } from 'react'

function App() {
  const = useState(0)
  return (
    <div style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Council Billionaire</h1>
      <p>App is working - deploy fixed</p>
      <button onClick={() => setCount(c => c + 1)} style={{ padding: '10px 20px', borderRadius: 8 }}>
        Count: {count}
      </button>
    </div>
  )
}[count][setCount]

export default App
