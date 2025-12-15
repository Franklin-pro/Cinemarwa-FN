import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

function VideoPlayer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the video URL from the state or query parameter
  const videoUrl = location.state?.streamingUrl || new URLSearchParams(location.search).get('streamingUrl');

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
        <p>No video URL provided.</p>
        <button
          onClick={() => navigate(-1)}
          className="ml-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="relative w-[500px] h-[500px]">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-2 right-2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <iframe
          src={videoUrl}
          title="Movie Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  );
}

export default VideoPlayer;