import { useState } from 'react'
import Test from './Test.jsx'


function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Test />
    </div>
  )
}

export default App
