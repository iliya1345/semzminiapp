"use client";

export default function LoadingScreen() {
  return (
    <div className="relative min-h-screen">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/loading.mp4"
        autoPlay
        loop
        muted
      />
      <div className="relative flex items-center justify-center min-h-screen">
      </div>
    </div>
  );
}
