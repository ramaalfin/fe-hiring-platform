"use client";

import { useEffect, useRef, useState } from "react";
import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { DrawHand } from "./DrawHand";
import Image from "next/image";
import { ChevronRightIcon } from "lucide-react";

export default function GestureWebcamCapture({
  onCapture,
}: {
  onCapture: (image: string) => void;
}) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!capturedImage) initCamera();
  }, [capturedImage]);

  const initCamera = async () => {
    setLoading(true);
    await tf.ready();
    const net = await handpose.load();
    setLoading(false);
    detectGesture(net);
  };

  const detectGesture = async (net: handpose.HandPose) => {
    const interval = setInterval(async () => {
      if (!webcamRef.current || webcamRef.current.video?.readyState !== 4)
        return;

      const video = webcamRef.current.video!;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video!.width = videoWidth;
      webcamRef.current.video!.height = videoHeight;
      canvasRef.current!.width = videoWidth;
      canvasRef.current!.height = videoHeight;

      const hands = await net.estimateHands(video);
      const ctx = canvasRef.current?.getContext("2d");
      ctx?.clearRect(0, 0, videoWidth, videoHeight);
      DrawHand(hands, ctx);

      if (hands.length > 0 && !isCounting) {
        const fingerCount = countRaisedFingers(hands[0].landmarks);
        if (fingerCount === 3) startCountdown(interval);
      }
    }, 200);
  };

  const countRaisedFingers = (landmarks: number[][]) => {
    const tips = [8, 12, 16, 20];
    let count = 0;
    tips.forEach((tip) => {
      if (landmarks[tip][1] < landmarks[tip - 2][1]) count += 1;
    });
    return count;
  };

  const startCountdown = (interval: NodeJS.Timeout) => {
    setIsCounting(true);
    let time = 3;
    setCountdown(time);

    const countdownInterval = setInterval(() => {
      time -= 1;
      setCountdown(time);

      if (time === 0) {
        clearInterval(countdownInterval);
        capturePhoto(interval);
      }
    }, 1000);
  };

  const capturePhoto = (interval: NodeJS.Timeout) => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      clearInterval(interval);
      setIsCounting(false);
      setCountdown(null);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsCounting(false);
    setCountdown(null);
  };

  const handleSubmit = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Jika belum ada foto */}
      {!capturedImage ? (
        <div className="relative">
          {loading && <p className="text-center">Loading model...</p>}

          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored
            screenshotFormat="image/jpeg"
            className="rounded-lg shadow-lg"
            width={480}
            height={360}
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0" />

          {/* Countdown overlay */}
          {isCounting && countdown !== null && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <p className="text-white text-6xl font-bold animate-pulse">
                {countdown}
              </p>
            </div>
          )}
          <p className="text-sm text-neutral-1000 my-4">
            To take a picture, follow the hand poses in the order shown below.
            The system will automatically capture the image once the final pose
            is detected.
          </p>
          <div className="flex flex-row gap-4 items-center justify-center">
            <Image
              alt="one"
              width={100}
              height={100}
              className="w-12"
              src="/assets/illustration/one.svg"
            />
            <ChevronRightIcon />
            <Image
              alt="two"
              width={100}
              height={100}
              className="w-12"
              src="/assets/illustration/two.svg"
            />
            <ChevronRightIcon />
            <Image
              alt="three"
              width={100}
              height={100}
              className="w-12"
              src="/assets/illustration/three.svg"
            />
          </div>
        </div>
      ) : (
        // Preview foto
        <div className="flex flex-col items-center">
          <img
            src={capturedImage}
            alt="Captured"
            className="rounded-lg shadow-lg mb-4 w-[480px] h-[360px] object-cover"
          />
          <div className="flex gap-4">
            <button
              onClick={handleRetake}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Retake Photo
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
