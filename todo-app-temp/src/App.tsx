import { TaskForm } from './components/TaskForm'
import TaskList from './components/TaskList'
import './App.css'

function App() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-center">タスク管理アプリ</h1>
      <TaskForm />
      <TaskList />
    </div>
  )
}

export default App
