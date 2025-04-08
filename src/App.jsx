import React, { Suspense, lazy } from "react";
import LoadingDots from "./components/common/LoadingDots";

const Android = lazy(() => import("./Android"));

const Web = lazy(() => import("./Web"));
function App() {
  switch (import.meta.env.MODE) {
    case "android-debuggable":
    case "android":
      return (
        <Suspense fallback={<LoadingDots fullHeight />}>
          <Android />
        </Suspense>
      );
    default:
      return (
        <Suspense fallback={<LoadingDots fullHeight />}>
          <Web />
        </Suspense>
      );
  }
}

export default App;
