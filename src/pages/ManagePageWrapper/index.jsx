import CookiesService from "~/services/CookiesService";
import React, { useEffect, useMemo, useState } from "react";
import { cacheRtl, setLangFromSession } from "~/utils/common";
import { CacheProvider } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { Provider } from "react-redux";
import { manageStore } from "~/store";
import { Header } from "~/components/manage/Header";
import ErrorWrapper from "~/components/design/ErrorWrapper";
import { StatefulLoadingIndicator } from "~/components/common/LoadingIndicator";
import ThemeProvider from "~/theme";
import UnsupportedView from "../UnsupportedView";

export const ManagePageWrapper = ({ children }) => {
  const lang = CookiesService.getValue("lang");

  const { i18n } = useTranslation("manage");

  const [isSupportedScreenSize, setIsSupportedScreenSize] = useState(() => {
    const minWidth = 768;
    const minHeight = 600;
    return window.innerWidth >= minWidth && window.innerHeight >= minHeight;
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setLangFromSession(i18n);
  }, [lang]);

  const cacheRtlMemo = useMemo(() => cacheRtl(lang), [lang]);

  useEffect(() => {
    const checkScreenSize = () => {
      const minWidth = 768;
      const minHeight = 600;

      if (window.innerWidth < minWidth || window.innerHeight < minHeight) {
        setIsSupportedScreenSize(false);
      } else {
        setIsSupportedScreenSize(true);
      }
    };

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  if (!isSupportedScreenSize) {
    return <UnsupportedView />;
  }

  return (
    <CacheProvider value={cacheRtlMemo}>
      <Provider store={manageStore}>
        <ThemeProvider>
          <Header />
          <ErrorWrapper />
          <StatefulLoadingIndicator />
          {children}
        </ThemeProvider>
      </Provider>
    </CacheProvider>
  );
};
