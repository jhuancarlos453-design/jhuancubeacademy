const MAP: Record<string, string> = { w: "fill-cube-w", y: "fill-cube-y", r: "fill-cube-r", o: "fill-cube-o", b: "fill-cube-b", g: "fill-cube-g", x: "fill-surface-2", "1": "fill-cube-y", "0": "fill-surface-2" };

export function FaceGrid({ face, size = 56 }: { face: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" className="shrink-0">
      <rect width="30" height="30" rx="3" className="fill-background" />
      {face.split("").map((c, i) => (
        <rect key={i} x={1 + (i % 3) * 9.5} y={1 + Math.floor(i / 3) * 9.5} width="8.5" height="8.5" rx="1.6" className={MAP[c] ?? "fill-surface-2"} />
      ))}
    </svg>
  );
}

export function CubeLogo({ size = 36 }: { size?: number }) {
  // isometric 3x3 cube
  const top = ["y", "y", "y", "y", "y", "y", "y", "y", "y"];
  const cells = (ox: number, oy: number, ux: [number, number], vx: [number, number], cls: string[]) =>
    cls.map((c, i) => {
      const a = i % 3, b = Math.floor(i / 3);
      const p = (da: number, db: number) => `${ox + (a + da) * ux[0] + (b + db) * vx[0]},${oy + (a + da) * ux[1] + (b + db) * vx[1]}`;
      return <polygon key={i} points={`${p(0.06, 0.06)} ${p(0.94, 0.06)} ${p(0.94, 0.94)} ${p(0.06, 0.94)}`} className={MAP[c]} />;
    });
  return (
    <svg width={size} height={size} viewBox="0 0 60 64" aria-label="Logo cubo">
      {cells(30, 2, [9, 5], [-9, 5], top)}
      {cells(3, 17, [9, 5], [0, 10], ["g", "g", "g", "g", "g", "g", "g", "g", "g"])}
      {cells(30, 32, [9, -5], [0, 10], ["r", "r", "r", "r", "r", "r", "r", "r", "r"])}
    </svg>
  );
}
