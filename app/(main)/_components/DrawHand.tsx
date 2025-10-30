export const DrawHand = (
  predictions: any[],
  ctx: CanvasRenderingContext2D | null | undefined
) => {
  if (!ctx) return;

  // Loop through each prediction
  predictions.forEach((prediction) => {
    // Extract landmarks
    const landmarks = prediction.landmarks;

    // Loop through fingers
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i][0];
      const y = landmarks[i][1];

      // Draw points
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 3 * Math.PI);
      ctx.fillStyle = "#00FF00";
      ctx.fill();
    }
  });
};
