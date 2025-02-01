'use client'

type ModelSelectorProps = {
  model: string
  setModel: (model: string) => void
}

export function ModelSelector({ model, setModel }: ModelSelectorProps) {
  return (
    <div className="flex justify-center mb-4">
      <select 
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100"
      >
        <option value="openai">OpenAI</option>
        <option value="claude-sonnet">Sonnet 3.5</option>
        <option value="claude-haiku">Haiku 3.5</option>
      </select>
    </div>
  )
} 