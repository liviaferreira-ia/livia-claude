"use client";

import { useEffect, useState } from "react";
import { reportClientError } from "@/components/OperationalMonitor";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [trace, setTrace] = useState<string | null>(null);
  useEffect(() => { void reportClientError(error.message, error.stack, error.digest).then(setTrace); }, [error]);
  return <div className="view"><div className="card stat" style={{ maxWidth: 620, margin: "40px auto" }}><div className="eyebrow">Algo não saiu como esperado</div><h2>Já registramos este erro.</h2><p className="muted">Tente novamente. Se continuar, envie o código abaixo para a Central School.</p>{trace && <p><b>Código de atendimento: {trace}</b></p>}<button className="btn primary" onClick={reset}>Tentar novamente</button></div></div>;
}
