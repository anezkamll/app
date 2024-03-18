"use client";

import { signIn } from "next-auth/react";

export const RetryButton = ({ callbackUrl }: { callbackUrl: string }) => (
  <a
    className="btn-primary m-auto inline-block"
    onClick={() => signIn(undefined, { callbackUrl })}
  >
    Zkusit znova
  </a>
);
