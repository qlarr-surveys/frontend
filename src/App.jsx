import React, { Suspense, lazy } from "react";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import LoadingDots from "./components/common/LoadingDots";
const isAndroid = import.meta.env.MODE == "android-debuggable" || import.meta.env.MODE == "android";

const Web = isAndroid ? null : lazy(() => import("./Web"));
const Android = isAndroid ? lazy(() => import("./Android")) : null;

function App() {
  switch (import.meta.env.MODE) {
    case "android-debuggable":
    case "android":
      i18next
        .use(HttpBackend)
        .use(LanguageDetector)
        .init({
          fallbackLng: "en",
          ns: ["run"],
          defaultNS: "run",
          interpolation: { escapeValue: false },
          backend: {
            loadPath: "/locales/{{lng}}.json",
          },
          detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
          },
        });
      return (
        <I18nextProvider i18n={i18next}>
          <Suspense fallback={<LoadingDots fullHeight />}>
            <Android />
          </Suspense>
        </I18nextProvider>
      );
    default:
      i18next
        .use(HttpBackend)
        .use(LanguageDetector)
        .init({
          fallbackLng: "en",
          ns: ["design", "run", "manage"],
          defaultNS: "design",
          interpolation: { escapeValue: false },
          backend: {
            loadPath: (lngs, namespaces) => {
              // Get the first namespace from the array (i18next may request multiple)
              const ns = namespaces[0];
              
              if (ns === "run") {
                return "/locales/{{lng}}.json";
              } else {
                return "/src/translations/{{lng}}/{{ns}}.json";
              }
            },
          },
          detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
          },
        });
      return (
        <I18nextProvider i18n={i18next}>
          <Suspense fallback={<LoadingDots fullHeight />}>
            <Web />
          </Suspense>
        </I18nextProvider>
      );
  }
}

export default App;
