import React, { Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { MANAGE_SURVEY_LANDING_PAGES, routes } from "./routes";
import { lazy } from "react";
import { runStore } from "./store";
import { Provider } from "react-redux";

import TokenService from "./services/TokenService";
import { getparam } from "./networking/run";

import LoadingIndicator from "./components/common/LoadingIndicator";
import { ROLES } from "./constants/roles";

const AuthIllustrationLayout = lazy(() => import("./layouts/authlayout"));
const ManagePageWrapper = lazy(() => import("./pages/ManagePageWrapper"));
const PreviewSurvey = lazy(() => import("./pages/PreviewSurvey"));
const ManageSurvey = lazy(() => import("./pages/ManageSurvey"));
const Page404 = lazy(() => import("./pages/Page404"));
const ForgotPasswordView = lazy(() => import("./pages/manage/ForgotPassword"));
const ResetPasswordView = lazy(() => import("./pages/manage/ResetPassword"));
const Dashboard = lazy(() => import("./pages/manage/Dashboard"));
const LoginView = lazy(() => import("./pages/manage/Login"));
const ManageUsers = lazy(() => import("./pages/manage/ManageUsers"));
const ProfileView = lazy(() => import("./pages/manage/Profile"));
const CreateSurvey = lazy(() => import("./pages/manage/CreateSurvey"));
const RunSurvey = lazy(() => import("./pages/RunSurvey"));

function Web() {
  return (
    <Routes>
      <Route
        path={routes.runSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <Provider store={runStore}>
              <RunSurveyWrapper />
            </Provider>
          </Suspense>
        }
      />
      <Route
        path={routes.resumeSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <Provider store={runStore}>
              <RunSurveyWrapper resume={true} />
            </Provider>
          </Suspense>
        }
      />
      <Route
        path={routes.iframePreviewSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <Provider store={runStore}>
              <PreviewSurveyWrapper />
            </Provider>
          </Suspense>
        }
      />
      <Route
        path={routes.iframePreviewGuestSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <Provider store={runStore}>
              <PreviewGuestSurveyWrapper />
            </Provider>
          </Suspense>
        }
      />
      <Route
        path={routes.designSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <PrivateDesignSurvey
                landingPage={MANAGE_SURVEY_LANDING_PAGES.DESIGN}
              />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.preview}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper showHeader={false}>
              <PrivatePreviewSurvey />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.guestPreview}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper  showHeader={false}>
              <PreviewSurvey guest={true} />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.editSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <PrivateDesignSurvey
                landingPage={MANAGE_SURVEY_LANDING_PAGES.SETTINGS}
              />
            </ManagePageWrapper>
          </Suspense>
        }
      />

      <Route
        path={routes.responses}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <PrivateDesignSurvey
                landingPage={MANAGE_SURVEY_LANDING_PAGES.RESPONSES}
              />
            </ManagePageWrapper>
          </Suspense>
        }
      />

      <Route
        path={routes.language}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <PrivateDesignSurvey
                landingPage={MANAGE_SURVEY_LANDING_PAGES.LANGUAGE}
              />
            </ManagePageWrapper>
          </Suspense>
        }
      />

      <Route
        path={routes.theme}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <PrivateDesignSurvey
                landingPage={MANAGE_SURVEY_LANDING_PAGES.THEME}
              />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.manageUsers}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <PrivateManageUsers roles={[ROLES.SUPER_ADMIN]}>
              <ManagePageWrapper>
                <ManageUsers />
              </ManagePageWrapper>
            </PrivateManageUsers>
          </Suspense>
        }
      />
      <Route
        path={routes.profile}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <PrivateComponent>
              <ManagePageWrapper>
                <ProfileView />
              </ManagePageWrapper>
            </PrivateComponent>
          </Suspense>
        }
      />
      <Route
        path={routes.createSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <PrivateManageUsers roles={[ROLES.SUPER_ADMIN, ROLES.SUPER_ADMIN]}>
              <ManagePageWrapper>
                <CreateSurvey />
              </ManagePageWrapper>
            </PrivateManageUsers>
          </Suspense>
        }
      />
      <Route
        path={routes.page404}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <Page404 />
          </Suspense>
        }
      />
      <Route
        path={routes.dashboard}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <PrivateComponent>
              <ManagePageWrapper>
                <Dashboard />
              </ManagePageWrapper>
            </PrivateComponent>
          </Suspense>
        }
      />

      <Route
        path={routes.login}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <AuthIllustrationLayout>
                <LoginView />
              </AuthIllustrationLayout>
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.forgotPassword}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <AuthIllustrationLayout>
                <ForgotPasswordView />
              </AuthIllustrationLayout>
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.resetPassword}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <ResetPasswordView />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.confirmNewUser}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper>
              <ResetPasswordView confirmNewUser={true} />
            </ManagePageWrapper>
          </Suspense>
        }
      />
    </Routes>
  );
}

const PrivateDesignSurvey = ({ landingPage }) => {
  const params = useParams();
  sessionStorage.setItem("surveyId", params.surveyId);
  sessionStorage.setItem("isGuest", "0");
  const location = useLocation();
  return TokenService.isAuthenticated() ? (
    <ManageSurvey landingPage={landingPage} />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const PrivatePreviewSurvey = () => {
  const params = useParams();
  sessionStorage.setItem("surveyId", params.surveyId);
  sessionStorage.setItem("isGuest", "0");
  const location = useLocation();
  return TokenService.isAuthenticated() ? (
    <PreviewSurvey />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const PrivateComponent = ({ children }) => {
  const location = useLocation();
  return TokenService.isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const PrivateManageUsers = ({ roles, children }) => {
  const location = useLocation();
  const user = TokenService.getUser();
  let hasCorrectRole = false;
  user.roles.forEach((el) => {
    if (roles.indexOf(el) > -1) {
      hasCorrectRole = true;
    }
  });

  if (!hasCorrectRole) {
    return <Navigate to="/" replace />;
  }

  return TokenService.isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const RunSurveyWrapper = ({ resume = false }) => {
  const surveyId = getparam(useParams(), "surveyId");
  const responseId = getparam(useParams(), "responseId");
  sessionStorage.setItem("surveyId", surveyId);
  sessionStorage.setItem("isGuest", "0");
  return <RunSurvey responseId={responseId} resume={resume} />;
};

const PreviewSurveyWrapper = () => {
  const surveyId = getparam(useParams(), "surveyId");
  sessionStorage.setItem("surveyId", surveyId);
  sessionStorage.setItem("isGuest", "0");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode") || "online";
  const navigationMode = searchParams.get("navigation_mode");
  return <RunSurvey preview={true} mode={mode} navigationMode={navigationMode} />;
};

const PreviewGuestSurveyWrapper = () => {
  const surveyId = getparam(useParams(), "surveyId");
  sessionStorage.setItem("surveyId", surveyId);
  sessionStorage.setItem("isGuest", "1");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode") || "online";
  const navigationMode = searchParams.get("navigation_mode");
  return <RunSurvey preview={true} guest={true} mode={mode} navigationMode={navigationMode} />;
};

export default Web;
