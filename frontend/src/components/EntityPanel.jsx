const ENTITY_COLORS = {
  PARTY:       { bg: 'bg-blue-500/20',   text: 'text-blue-300',   dot: 'bg-blue-400' },
  DATE:        { bg: 'bg-green-500/20',  text: 'text-green-300',  dot: 'bg-green-400' },
  MONEY:       { bg: 'bg-yellow-500/20', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  CLAUSE:      { bg: 'bg-purple-500/20', text: 'text-purple-300', dot: 'bg-purple-400' },
  OBLIGATION:  { bg: 'bg-red-500/20',    text: 'text-red-300',    dot: 'bg-red-400' },
}

export default function EntityPanel({ entities }) {
  if (!entities || entities.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          🔍 Extracted Entities
        </h3>
        <p className="text-xs text-gray-600">
          Entities will appear here after you ask a question.
        </p>
      </div>
    )
  }

  // Group by type
  const grouped = entities.reduce((acc, ent) => {
    if (!acc[ent.type]) acc[ent.type] = []
    // Deduplicate
    if (!acc[ent.type].includes(ent.text)) {
      acc[ent.type].push(ent.text)
    }
    return acc
  }, {})

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">
        🔍 Extracted Entities
      </h3>
      <div className="space-y-3">
        {Object.entries(grouped).map(([type, items]) => {
          const colors = ENTITY_COLORS[type] || ENTITY_COLORS.PARTY
          return (
            <div key={type}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${colors.dot}`}/>
                <span className="text-xs font-medium text-gray-400">
                  {type}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {items.map((item, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-1 rounded-lg 
                                ${colors.bg} ${colors.text}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}