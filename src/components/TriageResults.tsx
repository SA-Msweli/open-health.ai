const TriageResults: React.FC<{ result: TriageResult }> = ({ result }) => (
  <div id="results" className="p-6 card">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Assessment Result</h2>
    <div id="resultContent" className="space-y-4">
      <p className="text-lg">
        <strong>Severity Score:</strong>{" "}
        <span id="severityScore" className="font-bold text-xl text-purple-600">
          {result.severityScore}
        </span>
      </p>
      <p className="text-sm text-gray-500">
        <span id="explanation">{result.explanation}</span>
      </p>
      <p className="text-lg">
        <strong>Recommended Hospital:</strong>{" "}
        <span id="recommendedHospital" className="font-bold text-purple-600">
          {result.recommendedHospital}
        </span>
      </p>
      <p className="text-sm text-gray-500">
        <span id="hospitalInfo">{result.hospitalInfo}</span>
      </p>
    </div>
    <div className="mt-6">
      <button
        onClick={resetView}
        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-purple-600 bg-white border-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
      >
        Start New Assessment
      </button>
    </div>
  </div>
);

const resetView = () => {
  setTriageResult(null);
  setView("form");
};

export default TriageResults;