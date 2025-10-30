"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GestureWebcamCapture from "./GestureWebcamCapture";

export default function GestureCameraModal({
  onCapture,
}: {
  onCapture: (img: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="font-semibold bg-white border border-neutral-40 text-neutral-1000 hover:bg-opacity-90"
        >
          Take a Picture
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="">
            <h1 className="text-xl font-semibold">
              Raise Your Hand to Capture
            </h1>
            <p>We’ll take the photo once your hand pose is detected.</p>
          </div>
        </DialogHeader>

        <div className="p-4 flex flex-col items-center justify-center">
          <GestureWebcamCapture
            onCapture={(img) => {
              onCapture(img);
              setOpen(false); // Tutup modal setelah capture
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
