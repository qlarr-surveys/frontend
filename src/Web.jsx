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
import { HEADER_OPTIONS } from './pages/ManagePageWrapper';

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
        path={routes.iframePreviewSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <Provider store={runStore}>
              <PreviewSurveyWrapper resume={true} />
            </Provider>
          </Suspense>
        }
      />
      <Route
        path={routes.resumeIframePreviewSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <Provider store={runStore}>
              <PreviewSurveyWrapper resume={true} />
            </Provider>
          </Suspense>
        }
      />
      <Route
        path={routes.designSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper headerOptions={HEADER_OPTIONS.SURVEY}>
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
            <ManagePageWrapper  headerOptions={HEADER_OPTIONS.NONE}>
              <PrivatePreviewSurvey />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.resumePreview}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper headerOptions={HEADER_OPTIONS.NONE}>
              <PrivatePreviewSurvey />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.editSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper headerOptions={HEADER_OPTIONS.SURVEY}>
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
            <ManagePageWrapper headerOptions={HEADER_OPTIONS.SURVEY_NO_PREVIEW}>
              <PrivateDesignSurvey
                landingPage={MANAGE_SURVEY_LANDING_PAGES.RESPONSES}
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
              <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
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
              <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
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
              <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
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
              <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
                <Dashboard />
              </ManagePageWrapper>
            </PrivateComponent>
          </Suspense>
        }
      />

      <Route
        path={routes.login}
        element={
          <PublicOnlyRoute>
            <Suspense fallback={<LoadingIndicator />}>
              <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
                <AuthIllustrationLayout>
                  <LoginView />
                </AuthIllustrationLayout>
              </ManagePageWrapper>
            </Suspense>
          </PublicOnlyRoute>
        }
      />
      <Route
        path={routes.forgotPassword}
        element={
          <PublicOnlyRoute>
            <Suspense fallback={<LoadingIndicator />}>
              <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
                <AuthIllustrationLayout>
                  <ForgotPasswordView />
                </AuthIllustrationLayout>
              </ManagePageWrapper>
            </Suspense>
          </PublicOnlyRoute>
        }
      />
      <Route
        path={routes.resetPassword}
        element={
          <PublicOnlyRoute>
            <Suspense fallback={<LoadingIndicator />}>
              <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
                <ResetPasswordView />
              </ManagePageWrapper>
            </Suspense>
          </PublicOnlyRoute>
        }
      />
      <Route
        path={routes.confirmNewUser}
        element={
          <PublicOnlyRoute>
            <Suspense fallback={<LoadingIndicator />}>
              <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
                <ResetPasswordView confirmNewUser={true} />
              </ManagePageWrapper>
            </Suspense>
          </PublicOnlyRoute>
        }
      />
    </Routes>
  );
}

const PrivateDesignSurvey = ({ landingPage }) => {
  const params = useParams();
  sessionStorage.setItem("surveyId", params.surveyId);
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
  const location = useLocation();
  const responseId = getparam(useParams(), "responseId");
  return TokenService.isAuthenticated() ? (
    <PreviewSurvey responseId={responseId} />
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

const PublicOnlyRoute = ({ children }) => {
  return TokenService.isAuthenticated() ? (
    <Navigate to="/" replace />
  ) : (
    children
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
  return <RunSurvey responseId={responseId} resume={resume} />;
};

const PreviewSurveyWrapper = ({ resume = false }) => {
  const surveyId = getparam(useParams(), "surveyId");
  sessionStorage.setItem("surveyId", surveyId);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode") || "online";
  const responseId = getparam(useParams(), "responseId");
  const navigationMode = searchParams.get("navigation_mode");
  return (
    <RunSurvey
      preview={true}
      responseId={responseId}
      resume={resume}
      mode={mode}
      navigationMode={navigationMode}
    />
  );
};

export default Web;
