import React, { Suspense } from "react";
import {
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { MANAGE_SURVEY_LANDING_PAGES, routes } from "./routes";
import { lazy } from "react";
import { runStore } from "./store";
import { Provider } from "react-redux";

import { getparam } from "./networking/run";

import LoadingIndicator from "./components/common/LoadingIndicator";
import { ROLES } from "./constants/roles";
import { HEADER_OPTIONS } from './pages/ManagePageWrapper/headerOptions';
import { ACCESS } from './pages/ManagePageWrapper/access';

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
            <PrivateDesignSurvey
              landingPage={MANAGE_SURVEY_LANDING_PAGES.DESIGN}
              headerOptions={HEADER_OPTIONS.SURVEY}
            />
          </Suspense>
        }
      />
      <Route
        path={routes.preview}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper headerOptions={HEADER_OPTIONS.NONE}>
              <PreviewSurveyContent />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.resumePreview}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper headerOptions={HEADER_OPTIONS.NONE}>
              <PreviewSurveyContent />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.editSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <PrivateDesignSurvey
              landingPage={MANAGE_SURVEY_LANDING_PAGES.SETTINGS}
              headerOptions={HEADER_OPTIONS.SURVEY}
            />
          </Suspense>
        }
      />

      <Route
        path={routes.responses}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <PrivateDesignSurvey
              landingPage={MANAGE_SURVEY_LANDING_PAGES.RESPONSES}
              headerOptions={HEADER_OPTIONS.SURVEY_NO_PREVIEW}
            />
          </Suspense>
        }
      />
      <Route
        path={routes.manageUsers}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper
              headerOptions={HEADER_OPTIONS.GENERAL}
              requiredRoles={[ROLES.SUPER_ADMIN]}
            >
              <ManageUsers />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.profile}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
              <ProfileView />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.createSurvey}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper
              headerOptions={HEADER_OPTIONS.GENERAL}
              requiredRoles={[ROLES.SUPER_ADMIN]}
            >
              <CreateSurvey />
            </ManagePageWrapper>
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
            <ManagePageWrapper headerOptions={HEADER_OPTIONS.GENERAL}>
              <Dashboard />
            </ManagePageWrapper>
          </Suspense>
        }
      />

      <Route
        path={routes.login}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper
              headerOptions={HEADER_OPTIONS.AUTH}
              access={ACCESS.GUEST}
            >
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
            <ManagePageWrapper
              headerOptions={HEADER_OPTIONS.AUTH}
              access={ACCESS.GUEST}
            >
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
            <ManagePageWrapper
              headerOptions={HEADER_OPTIONS.AUTH}
              access={ACCESS.GUEST}
            >
              <ResetPasswordView />
            </ManagePageWrapper>
          </Suspense>
        }
      />
      <Route
        path={routes.confirmNewUser}
        element={
          <Suspense fallback={<LoadingIndicator />}>
            <ManagePageWrapper
              headerOptions={HEADER_OPTIONS.AUTH}
              access={ACCESS.GUEST}
            >
              <ResetPasswordView confirmNewUser={true} />
            </ManagePageWrapper>
          </Suspense>
        }
      />
    </Routes>
  );
}

const PrivateDesignSurvey = ({ landingPage, headerOptions }) => {
  const { surveyId } = useParams();
  sessionStorage.setItem("surveyId", surveyId);

  return (
    <ManagePageWrapper headerOptions={headerOptions}>
      <ManageSurvey landingPage={landingPage} />
    </ManagePageWrapper>
  );
};

const PreviewSurveyContent = () => {
  const params = useParams();
  sessionStorage.setItem("surveyId", params.surveyId);
  const responseId = getparam(params, "responseId");
  return <PreviewSurvey responseId={responseId} />;
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
