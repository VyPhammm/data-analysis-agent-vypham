import { Chat } from './components/Chat'

export function App() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <header className="border-b border-zinc-800 p-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Your AI Data Analyst</h1>
          <p className="text-zinc-400">
          I’m your AI-powered data assistant, here to help you make sense of your numbers, identify trends, 
          and uncover hidden opportunities. Whether you need data crunching or that golden nugget of insight, 
          I’m ready to dive in—just tell me what you need! 😊
          </p>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-4xl">
        <Chat />
      </main>
    </div>
  )
} 