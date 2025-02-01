'use client'

type InputFieldProps = {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  stop: () => void
}

export function InputField({ 
  input, 
  handleInputChange, 
  handleSubmit, 
  isLoading, 
  stop 
}: InputFieldProps) {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-gray-700 bg-gray-800">
      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message..."
        className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md resize-none text-gray-100 placeholder-gray-400"
        rows={1}
      />
      {isLoading ? (
        <button 
          type="button"
          onClick={stop}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Stop
        </button>
      ) : (
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Send
        </button>
      )}
    </form>
  )
} 