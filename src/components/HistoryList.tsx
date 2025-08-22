const HistoryList: React.FC<{ history: TriageData[] }> = ({ history }) => (
  <div className="mt-8 p-6 card">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Previous Assessments</h2>
    <div id="historyList" className="space-y-4">
      {history.length > 0 ? (
        history.map((item) => (
          <div key={item.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{new Date(item.timestamp).toLocaleString()}</p>
            <p className="text-base font-semibold text-gray-800">
              Severity Score: <span className="text-purple-600">{item.severityScore}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Symptom: "
              {item.symptoms.length > 50
                ? item.symptoms.substring(0, 50) + "..."
                : item.symptoms}
              "
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Vitals: Heart Rate: {item.vitals.heartRate || "N/A"}, SpO2: {item.vitals.spO2 || "N/A"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Recommended Hospital:{" "}
              <span className="font-medium text-purple-500">{item.recommendedHospital}</span>
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No previous assessments found.</p>
      )}
    </div>
  </div>
);