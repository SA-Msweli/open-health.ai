import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';

// --- Global declarations (for hosted environment) ---
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

// Define the types for our data and state
interface Vitals {
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  spO2: string;
}

interface TriageResult {
  severityScore: number;
  explanation: string;
  recommendedHospital: string;
  hospitalInfo: string;
}

interface TriageData {
  id: string;
  symptoms: string;
  vitals: Vitals;
  severityScore: number;
  explanation: string;
  recommendedHospital: string;
  hospitalInfo: string;
  timestamp: string;
}

// Main application component
export default function App() {
  // --- Hybrid Firebase Configuration ---
  let localFirebaseConfig: any = {};
  let localAppId: string = 'default-app-id';
  let localAuthToken: string | null = null;

  if (typeof __firebase_config !== 'undefined' && typeof __app_id !== 'undefined') {
    localFirebaseConfig = JSON.parse(__firebase_config);
    localAppId = __app_id;
    localAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
  } else {
    try {
      localFirebaseConfig = {
        apiKey: import.meta.env.API_KEY,
        authDomain: import.meta.env.AUTH_DOMAIN,
        projectId: import.meta.env.PROJECT_ID,
        storageBucket: import.meta.env.STORAGE_BUCKET,
        messagingSenderId: import.meta.env.MESSAGING_SENDER_ID,
        appId: import.meta.env.APP_ID,
      };
      localAppId = localFirebaseConfig.projectId;
    } catch (e) {
      console.error("Local environment variables not configured correctly. Please check your .env file.", e);
    }
  }

  // State management
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<TriageData[]>([]);
  const [view, setView] = useState<'form' | 'results'>('form');

  useEffect(() => {
    setTriageResult(null);
    setView('form');
  }, []);

  // --- Firebase Initialization and Authentication ---
  useEffect(() => {
    if (!localFirebaseConfig || Object.keys(localFirebaseConfig).length === 0) {
      console.error("Firebase config is missing or invalid.");
      return;
    }

    const app = initializeApp(localFirebaseConfig);
    setDb(getFirestore(app));
    setAuth(getAuth(app));

    const unsubscribe = onAuthStateChanged(getAuth(app), async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (localAuthToken) {
            await signInWithCustomToken(getAuth(app), localAuthToken);
          } else {
            await signInAnonymously(getAuth(app));
          }
        } catch (error) {
          console.error("Firebase Auth error:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [localFirebaseConfig, localAuthToken]);

  // --- Firestore History Listener ---
  useEffect(() => {
    if (db && userId) {
      const historyCollection = collection(db, `artifacts/${localAppId}/users/${userId}/triage_records`);
      const unsubscribe = onSnapshot(
        historyCollection,
        (querySnapshot) => {
          const fetchedHistory: TriageData[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            fetchedHistory.push({
              id: doc.id,
              symptoms: data.symptoms || "",
              vitals: data.vitals || { heartRate: "", bloodPressure: "", temperature: "", spO2: "" },
              severityScore: data.severityScore || 0,
              explanation: data.explanation || "",
              recommendedHospital: data.recommendedHospital || "",
              hospitalInfo: data.hospitalInfo || "",
              timestamp: data.timestamp instanceof Timestamp
                ? data.timestamp.toDate().toISOString()
                : data.timestamp || new Date().toISOString(),
            });
          });
          fetchedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setHistory(fetchedHistory);
        },
        (error) => {
          console.error("Error fetching history:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [db, userId, localAppId]);

  // --- Triage Logic Simulation ---
  const getTriageResult = (symptoms: string, vitals: Vitals): TriageResult => {
    let score = 0;
    let explanation = "Based on your reported symptoms.";
    let recommendedHospital = "General Hospital";
    let hospitalInfo = "A local hospital with a standard emergency department.";

    const symptomsLower = symptoms.toLowerCase();
    const heartRate = parseInt(vitals.heartRate, 10);
    const spO2 = parseFloat(vitals.spO2);

    if (symptomsLower.includes("chest pain") || symptomsLower.includes("difficulty breathing")) {
      score += 5;
      explanation += " Critical symptoms indicate a high priority.";
      recommendedHospital = "City Trauma Center";
      hospitalInfo = "A major trauma center with advanced cardiac and respiratory care.";
    } else if (symptomsLower.includes("fever") || symptomsLower.includes("vomiting")) {
      score += 2;
      explanation += " Symptoms suggest a common illness.";
    }

    if (!isNaN(heartRate) && heartRate > 120) {
      score += 3;
      explanation += " Elevated heart rate is a significant concern.";
    }
    if (!isNaN(spO2) && spO2 < 95) {
      score += 4;
      explanation += " Low oxygen saturation requires immediate attention.";
      recommendedHospital = "City Trauma Center";
      hospitalInfo = "A major trauma center with advanced cardiac and respiratory care.";
    }

    score = Math.min(Math.max(score, 1), 10);

    return { severityScore: score, explanation, recommendedHospital, hospitalInfo };
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !db) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const symptoms = formData.get("symptoms") as string;
    const vitals: Vitals = {
      heartRate: (formData.get("heartRate") as string) || "",
      bloodPressure: (formData.get("bloodPressure") as string) || "",
      temperature: (formData.get("temperature") as string) || "",
      spO2: (formData.get("spO2") as string) || "",
    };

    try {
      const result = await new Promise<TriageResult>((resolve) => {
        setTimeout(() => resolve(getTriageResult(symptoms, vitals)), 1500);
      });

      const triageData = {
        symptoms,
        vitals,
        severityScore: result.severityScore,
        explanation: result.explanation,
        recommendedHospital: result.recommendedHospital,
        hospitalInfo: result.hospitalInfo,
        timestamp: new Date().toISOString(),
      };

      const userTriageRef = collection(db, `artifacts/${localAppId}/users/${userId}/triage_records`);
      await addDoc(userTriageRef, triageData);

      setTriageResult(result);
      setView("results");
    } catch (error) {
      console.error("Error during triage or saving data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetView = () => {
    setTriageResult(null);
    setView("form");
  };

  // --- UI Components ---
  const TriageForm: React.FC = () => (
    <form id="triageForm" onSubmit={handleSubmit} className="space-y-6">
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="container mx-auto p-8 lg:p-12 bg-white rounded-3xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">OpenHealthAI</h1>
          <p className="text-xl text-gray-500">MVP Demo</p>
        </div>

        <div className="text-center text-sm text-gray-600 mb-6 p-4 rounded-lg bg-gray-100">
          <p>Your session ID (for data persistence):</p>
          <p id="userIdDisplay" className="font-mono break-all mt-1">
            {userId || "Authenticating..."}
          </p>
        </div>

        {view === "results" ? triageResult && <TriageResults result={triageResult} /> : <TriageForm />}

        {loading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        <HistoryList history={history} />
      </div>
    </div>
  );
}
