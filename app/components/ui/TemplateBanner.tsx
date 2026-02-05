import type { ReactElement } from "react";

export function TemplateBanner(): ReactElement {
  return (
    <div className="fixed top-0 left-0 right-0 bg-emerald-600 text-white px-4 py-2 text-center text-sm font-medium z-50">
      🎨 Demo Template to play around while the app is under development
    </div>
  );
}
