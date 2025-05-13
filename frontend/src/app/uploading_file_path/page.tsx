"use client"

import { AudioUploader } from "@/components/audio-uploader"
import { useAuth } from "@/context/AuthContext";
import { API_HOST_BASE_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AudioUploadPage() {
  const { logout } = useAuth()
      const router = useRouter();
      useEffect(() => {
        const checkAudioEndpoint = async () => {
          try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
              logout(); // Clear context and token
              router.push("/sign_in_sign_up/sign-in"); // Redirect to sign-in
              return;
            }
      
            const res = await fetch(`${API_HOST_BASE_URL}/auth/audio/get_audios`, {
              headers: {
                token: token,
              },
            });
      
            if (!res.ok) {
              logout(); // Clear context and token
              router.push("/sign_in_sign_up/sign-in"); // Redirect to sign-in
              return;
          }
      
            // Optionally parse to ensure it's valid JSON (can be removed if not needed)
            await res.json();
          } catch (err) {
            console.error("Error checking audio endpoint:", err);
          }
        };
      
        checkAudioEndpoint();
      }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Audio</h1>
          <p className="mt-2 text-slate-600">Share your audio files with us. We support MP3, WAV, and OGG formats.</p>
        </div>

        <AudioUploader />
      </div>
    </div>
  )
}
