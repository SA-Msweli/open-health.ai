import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import type { TriageFormProps } from "./components/TriageForm";
import TriageForm from "./components/TriageForm";
import TriageResults from "./components/TriageResults";
import HistoryList from "./components/HistoryList";

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
        apiKey: import.meta.env.VITE_API_KEY,
        authDomain: import.meta.env.VITE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_APP_ID,
      };
      localAppId = localFirebaseConfig.projectId;
    } catch (e) {
      console.error("Local environment variables not configured correctly. Please check your .env file.", e);
    }
  }

  // State management
  const [db, setDb] = useState<any>(null);
  // const [auth, setAuth] = useState<any>(null);
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
    // setAuth(getAuth(app));

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
