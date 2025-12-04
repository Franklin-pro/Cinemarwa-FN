import React from "react";
import { Lock, ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PermissionGate() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  from-gray-950 via-gray-900 to-black text-white px-4">
      {/* Lock Icon */}
      <div className="bg-gray-800/60 p-6 rounded-full mb-6 border border-gray-700 shadow-lg">
        <Lock className="w-14 h-14 text-blue-400" />
      </div>

      {/* Message */}
      <h1 className="text-3xl font-bold mb-3 text-center">
        Access Restricted
      </h1>
      <p className="text-gray-400 text-center max-w-md mb-6">
        Sorry, you don’t have permission to access this section.  
        This content may be available only to premium users or administrators.
      </p>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-5 py-2.5 rounded-xl transition-all duration-200"
        >
          <ArrowLeftCircle className="w-5 h-5" />
          Go Back
        </button>

        <button
          onClick={() => navigate("/upgrade")}
          className="bg-blue-500 hover:bg-blue-400 text-black px-6 py-2.5 rounded-xl font-semibold transition-all duration-200"
        >
          Upgrade Plan
        </button>
      </div>

      {/* Optional Footer */}
      <p className="text-xs text-gray-600 mt-8">
        Need access? Contact support or upgrade your account.
      </p>
    </div>
  );
}
