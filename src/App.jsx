import React, { Suspense, lazy, useEffect } from "react";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import LoadingDots from "./components/common/LoadingDots";
import { isAndroid } from "./utils/common";

const Web = isAndroid ? null : lazy(() => import("./Web"));
const Android = isAndroid ? lazy(() => import("./Android")) : null;

function App() {
  switch (import.meta.env.MODE) {
    case "android-debuggable":
    case "android":
      useEffect(() => {
        i18next
          .use(HttpBackend)
          .use(LanguageDetector)
          .init({
            fallbackLng: "en",
            ns: ["run"],
            defaultNS: "run",
            partialBundledLanguages: true,
            interpolation: { escapeValue: false },
            backend: {
              loadPath: "/locales/{{lng}}-{{ns}}.json",
            },
            detection: {
              order: ["localStorage", "navigator"],
              caches: ["localStorage"],
            },
            supportedLngs: ["en", "ar", "de", "es", "pt", "fr", "nl"],
          });
      }, []);

      return (
        <I18nextProvider i18n={i18next}>
          <Suspense fallback={<LoadingDots fullHeight />}>
            <Android />
          </Suspense>
        </I18nextProvider>
      );
    default:
      useEffect(() => {
        i18next
          .use(HttpBackend)
          .use(LanguageDetector)
          .init({
            fallbackLng: "en",
            ns: ["design", "run", "manage"],
            defaultNS: "design",
            partialBundledLanguages: true,
            interpolation: { escapeValue: false },
            backend: {
              loadPath: "/locales/{{lng}}-{{ns}}.json",
            },
            detection: {
              order: ["localStorage", "navigator"],
              caches: ["localStorage"],
            },
            supportedLngs: ["en", "ar", "de", "es", "pt", "fr", "nl"],
            load: "languageOnly", // Optional: loads 'en' instead of 'en-US'
          });
      }, []);

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
