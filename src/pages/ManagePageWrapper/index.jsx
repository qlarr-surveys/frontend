
import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
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
import useNamespaceLoader, { NAMESPACES } from "~/hooks/useNamespaceLoader";
import TokenService from "~/services/TokenService";
import { HEADER_OPTIONS } from "./headerOptions";
import { ACCESS } from "./access";

const ManagePageWrapper = ({
  headerOptions = HEADER_OPTIONS.GENERAL,
  access = ACCESS.AUTH,
  requiredRoles,
  children,
}) => {
  const location = useLocation();
  const lang = localStorage.getItem("lang");

  const { i18n } = useTranslation(NAMESPACES.MANAGE);

  // Load namespaces based on current route
  useNamespaceLoader();

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

  const isAuthenticated = TokenService.isAuthenticated();

  if (access === ACCESS.AUTH && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (access === ACCESS.GUEST && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles) {
    const hasCorrectRole = TokenService.getUser()?.roles?.some((role) =>
      requiredRoles.includes(role)
    );
    if (!hasCorrectRole) {
      return <Navigate to="/" replace />;
    }
  }

  if (!isSupportedScreenSize) {
    return <UnsupportedView />;
  }

  return (
    <CacheProvider value={cacheRtlMemo}>
      <Provider store={manageStore}>
        <ThemeProvider>
          {headerOptions.showHeader && <Header headerOptions={headerOptions} />}
          <ErrorWrapper />
          <StatefulLoadingIndicator />
          {children}
        </ThemeProvider>
      </Provider>
    </CacheProvider>
  );
};

export default ManagePageWrapper;
