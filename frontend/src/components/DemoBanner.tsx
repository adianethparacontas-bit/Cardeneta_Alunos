import { usaMocks } from "../services/api-client";

export function DemoBanner() {
  if (!usaMocks) return null;
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm font-bold text-amber-950" role="status">
      MODO DEMONSTRAÇÃO (dados falsos)
    </div>
  );
}
