const RISK_COLORS = {
  SAFE:      { bg: 'bg-green-500/20',  text: 'text-green-300',  border: 'border-green-500/30' },
  CAUTION:   { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  DANGEROUS: { bg: 'bg-red-500/20',    text: 'text-red-300',    border: 'border-red-500/30' },
}

const RISK_EMOJI = { SAFE: '🟢', CAUTION: '🟡', DANGEROUS: '🔴' }

function RiskScoreBar({ score }) {
  const color = score < 30 ? 'bg-green-500'
              : score < 60 ? 'bg-yellow-500'
              : 'bg-red-500'
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Risk Score</span>
        <span className="font-bold text-white">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default function RiskReport({ riskReport }) {
  if (!riskReport) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          🛡️ Risk Analysis
        </h3>
        <p className="text-xs text-gray-600">
          Risk analysis will appear here after you ask a question.
        </p>
      </div>
    )
  }

  const { overall_risk_score, risk_counts,
          dangerous_clauses, caution_clauses } = riskReport

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 
                    space-y-4">
      <h3 className="text-sm font-semibold text-gray-400">
        🛡️ Risk Analysis
      </h3>

      {/* Score */}
      <RiskScoreBar score={overall_risk_score} />

      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(risk_counts).map(([level, count]) => {
          const colors = RISK_COLORS[level]
          return (
            <div
              key={level}
              className={`rounded-lg p-2 text-center border 
                          ${colors.bg} ${colors.border}`}
            >
              <div className={`text-lg font-bold ${colors.text}`}>
                {count}
              </div>
              <div className="text-xs text-gray-400">{level}</div>
            </div>
          )
        })}
      </div>

      {/* Dangerous clauses */}
      {dangerous_clauses?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-400 mb-2">
            🔴 Dangerous Clauses
          </p>
          <div className="space-y-2">
            {dangerous_clauses.slice(0, 3).map((c, i) => (
              <div
                key={i}
                className="text-xs bg-red-500/10 border border-red-500/20 
                           rounded-lg p-2 text-red-200"
              >
                {c.clause}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caution clauses */}
      {caution_clauses?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-yellow-400 mb-2">
            🟡 Caution Clauses
          </p>
          <div className="space-y-2">
            {caution_clauses.slice(0, 3).map((c, i) => (
              <div
                key={i}
                className="text-xs bg-yellow-500/10 border border-yellow-500/20 
                           rounded-lg p-2 text-yellow-200"
              >
                {c.clause}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}