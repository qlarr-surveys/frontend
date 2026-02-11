import SCQVisualization from './visualizations/SCQVisualization';
import MCQVisualization from './visualizations/MCQVisualization';
import NPSVisualization from './visualizations/NPSVisualization';
import RankingVisualization from './visualizations/RankingVisualization';
import NumberVisualization from './visualizations/NumberVisualization';
import DateVisualization from './visualizations/DateVisualization';
import TimeVisualization from './visualizations/TimeVisualization';
import DateTimeVisualization from './visualizations/DateTimeVisualization';
import MatrixSCQVisualization from './visualizations/MatrixSCQVisualization';
import MatrixMCQVisualization from './visualizations/MatrixMCQVisualization';
import TextVisualization from './visualizations/TextVisualization';
import ParagraphVisualization from './visualizations/ParagraphVisualization';
import EmailVisualization from './visualizations/EmailVisualization';
import MultipleTextVisualization from './visualizations/MultipleTextVisualization';
import AutocompleteVisualization from './visualizations/AutocompleteVisualization';
import ImageRankingVisualization from './visualizations/ImageRankingVisualization';
import ImageSCQVisualization from './visualizations/ImageSCQVisualization';
import ImageMCQVisualization from './visualizations/ImageMCQVisualization';
import IconSCQVisualization from './visualizations/IconSCQVisualization';
import IconMCQVisualization from './visualizations/IconMCQVisualization';
import IconMatrixSCQVisualization from './visualizations/IconMatrixSCQVisualization';
import IconMatrixMCQVisualization from './visualizations/IconMatrixMCQVisualization';
import FileUploadVisualization from './visualizations/FileUploadVisualization';
import SignatureVisualization from './visualizations/SignatureVisualization';
import MediaCaptureVisualization from './visualizations/MediaCaptureVisualization';
import BarcodeVisualization from './visualizations/BarcodeVisualization';
import { Paper, Typography } from '@mui/material';
import NoResponsesMessage from './common/NoResponsesMessage';

const QUESTION_TYPE_MAP = {
  SCQ: SCQVisualization,
  SINGLECHOICEQUESTION: SCQVisualization,
  MCQ: MCQVisualization,
  MULTIPLECHOICEQUESTION: MCQVisualization,
  NPS: NPSVisualization,
  NETPROMOTERSCORE: NPSVisualization,
  RANKING: RankingVisualization,
  NUMBER: NumberVisualization,
  NUMERIC: NumberVisualization,
  DATE: DateVisualization,
  TIME: TimeVisualization,
  DATETIME: DateTimeVisualization,
  DATE_TIME: DateTimeVisualization,
  MATRIX_SCQ: MatrixSCQVisualization,
  MATRIX_MCQ: MatrixMCQVisualization,
  TEXT: TextVisualization,
  SHORTTEXT: TextVisualization,
  PARAGRAPH: ParagraphVisualization,
  LONGTEXT: ParagraphVisualization,
  EMAIL: EmailVisualization,
  MULTIPLE_TEXT: MultipleTextVisualization,
  AUTOCOMPLETE: AutocompleteVisualization,
  IMAGE_RANKING: ImageRankingVisualization,
  ICON_SCQ: IconSCQVisualization,
  ICON_MCQ: IconMCQVisualization,
  SCQ_ARRAY: MatrixSCQVisualization,
  MCQ_ARRAY: MatrixMCQVisualization,
  SCQ_ICON_ARRAY: IconMatrixSCQVisualization,
  MCQ_ICON_ARRAY: IconMatrixMCQVisualization,
  IMAGE_SCQ: ImageSCQVisualization,
  IMAGE_MCQ: ImageMCQVisualization,
  FILE_UPLOAD: FileUploadVisualization,
  FILE: FileUploadVisualization,
  SIGNATURE: SignatureVisualization,
  PHOTO_CAPTURE: MediaCaptureVisualization,
  PHOTO: MediaCaptureVisualization,
  BARCODE: BarcodeVisualization,
};

export default function QuestionCard({ question }) {
  let VisualizationComponent = QUESTION_TYPE_MAP[question.type];

  // Auto-upgrade matrix visualizations to icon variants when images are available
  if (question.images?.length > 0) {
    if (VisualizationComponent === MatrixSCQVisualization) {
      VisualizationComponent = IconMatrixSCQVisualization;
    } else if (VisualizationComponent === MatrixMCQVisualization) {
      VisualizationComponent = IconMatrixMCQVisualization;
    }
  }

  if (!VisualizationComponent) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="text.secondary">
          Visualization not available for question type: {question.type}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Data: {JSON.stringify(question).substring(0, 200)}...
        </Typography>
      </Paper>
    );
  }

  if (!question.responses || question.responses.length === 0) {
    return <NoResponsesMessage />;
  }

  return <VisualizationComponent question={question} />;
}
