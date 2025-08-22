import React from "react";

interface Vitals {
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  spO2: string;
}

interface TriageFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

const TriageForm: React.FC<TriageFormProps> = ({ onSubmit, loading }: TriageFormProps) => (
  <form id="triageForm" onSubmit={onSubmit} className="space-y-6">
    <div>
      <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
        Describe your symptoms:
      </label>
      <textarea
        id="symptoms"
        name="symptoms"
        rows={4}
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-3"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700">Heart Rate (bpm):</label>
        <input type="number" id="heartRate" name="heartRate" placeholder="e.g., 85" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2" />
      </div>
      <div>
        <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700">Blood Pressure (mmHg):</label>
        <input type="text" id="bloodPressure" name="bloodPressure" placeholder="e.g., 120/80" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2" />
      </div>
      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature (°F):</label>
        <input type="number" step="0.1" id="temperature" name="temperature" placeholder="e.g., 98.6" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2" />
      </div>
      <div>
        <label htmlFor="spO2" className="block text-sm font-medium text-gray-700">SpO2 (%):</label>
        <input type="number" step="0.1" id="spO2" name="spO2" placeholder="e.g., 98" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2" />
      </div>
    </div>
    <div className="mt-6">
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white gradient-bg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : "Get Triage Assessment"}
      </button>
    </div>
  </form>
);

export type { Vitals, TriageFormProps };
export default TriageForm;