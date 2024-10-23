import React from "react";
import TextQuestionDesign from "~/components/Questions/Text/TextQuestionDesign";
import EmailQuestionDesign from "~/components/Questions/Email/EmailQuestionDesign";
import NumberQuestionDesign from "~/components/Questions/Number/NumberQuestionDesign";
import ParagraphQuestionDesign from "~/components/Questions/Paragraph/ParagraphQuestionDesign";

import FileUploadQuestionDesign from "~/components/Questions/FileUpload/FileUploadQuestionDesign";
import DateTimeQuestionDesign from "~/components/Questions/DateTime/DateTimeQuestionDesign";
import TimeQuestionDesign from "~/components/Questions/DateTime/TimeQuestionDesign";
import SCQArray from "~/components/Questions/SCQArray/SCQArrayDesign";
import VideoDisplayDesign from "~/components/Questions/VideoDisplay/VideoDisplayDesign";
import SignatureDesign from "~/components/Questions/Signature/SignatureDesign";
import ImageDisplayDesign from "~/components/Questions/ImageDisplay/ImageDisplayDesign";
import NPSDesign from "~/components/Questions/NPS/NPSDesign";
import PhotoCaptureDesign from "../Questions/PhotoCapture/PhotoCaptureDesign";
import VideoCaptureDesign from "../Questions/VideoCapture/VideoCaptureDesign";
import BarcodeDesign from "../Questions/Barcode/BarcodeDesign";
import ChoiceQuestion from "../Questions/Choice/ChoiceDesign";
import ImageChoiceQuestion from "../Questions/Imagechoice/ImageChoiceDesign";
import SCQIconArrayDesign from "../Questions/SCQArray/SCQIconArrayDesign";

function QuestionDesignBody({ code, type, t, onMainLang, addAnswer }) {
  switch (type) {
    case "video_display":
      return (
        <VideoDisplayDesign
          key={code}
          code={code}
          t={t}
          onMainLang={onMainLang}
        />
      );
    case "image_display":
      return (
        <ImageDisplayDesign
          key={code}
          code={code}
          t={t}
          onMainLang={onMainLang}
        />
      );
    case "signature":
      return <SignatureDesign />;
    case "photo_capture":
      return <PhotoCaptureDesign code={code} />;
    case "video_capture":
      return <VideoCaptureDesign code={code} />;
    case "date_time":
      return <DateTimeQuestionDesign key={code} code={code} />;
    case "date":
      return <DateTimeQuestionDesign key={code} code={code} />;
    case "time":
      return <TimeQuestionDesign key={code} code={code} />;
    case "scq":
      return (
        <ChoiceQuestion
          key={code}
          t={t}
          onMainLang={onMainLang}
          addNewAnswer={addAnswer}
          code={code}
          type="radio"
        />
      );
    case "image_mcq":
    case "image_scq":
    case "image_ranking":
      return (
        <ImageChoiceQuestion
          key={code}
          t={t}
          onMainLang={onMainLang}
          addNewAnswer={addAnswer}
          code={code}
        />
      );
    case "icon_scq":
    case "icon_mcq":
      return (
        <ImageChoiceQuestion
          icon={true}
          key={code}
          t={t}
          onMainLang={onMainLang}
          addNewAnswer={addAnswer}
          code={code}
        />
      );
    case "scq_icon_array":
      return (
        <SCQIconArrayDesign
          onMainLang={onMainLang}
          key={code}
          type={type}
          addNewAnswer={addAnswer}
          code={code}
          t={t}
        />
      );
    case "scq_array":
      return (
        <SCQArray
          onMainLang={onMainLang}
          key={code}
          type={type}
          addNewAnswer={addAnswer}
          code={code}
          t={t}
        />
      );
    case "file_upload":
      return <FileUploadQuestionDesign key={code} code={code} />;
    case "mcq":
      return (
        <ChoiceQuestion
          key={code}
          addNewAnswer={addAnswer}
          code={code}
          onMainLang={onMainLang}
          t={t}
          type="checkbox"
        />
      );
    case "ranking":
      return (
        <ChoiceQuestion
          key={code}
          onMainLang={onMainLang}
          addNewAnswer={addAnswer}
          code={code}
          t={t}
          type="ranking"
        />
      );
    case "nps":
      return <NPSDesign key={code} code={code} />;
    case "number":
      return <NumberQuestionDesign key={code} code={code} />;
    case "text":
      return <TextQuestionDesign key={code} code={code} />;
    case "paragraph":
      return <ParagraphQuestionDesign t={t} key={code} code={code} />;
    case "barcode":
      return <BarcodeDesign t={t} key={code} code={code} />;
    case "email":
      return <EmailQuestionDesign key={code} code={code} />;
    default:
      return "";
  }
}

export default React.memo(QuestionDesignBody);
