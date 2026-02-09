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
import FileUploadVisualization from './visualizations/FileUploadVisualization';
import SignatureVisualization from './visualizations/SignatureVisualization';
import MediaCaptureVisualization from './visualizations/MediaCaptureVisualization';
import BarcodeVisualization from './visualizations/BarcodeVisualization';
import { Paper, Typography } from '@mui/material';

const QUESTION_TYPE_MAP = {
  SCQ: SCQVisualization,
  MCQ: MCQVisualization,
  NPS: NPSVisualization,
  RANKING: RankingVisualization,
  NUMBER: NumberVisualization,
  DATE: DateVisualization,
  TIME: TimeVisualization,
  DATETIME: DateTimeVisualization,
  MATRIX_SCQ: MatrixSCQVisualization,
  MATRIX_MCQ: MatrixMCQVisualization,
  TEXT: TextVisualization,
  PARAGRAPH: ParagraphVisualization,
  EMAIL: EmailVisualization,
  MULTIPLE_TEXT: MultipleTextVisualization,
  AUTOCOMPLETE: AutocompleteVisualization,
  IMAGE_RANKING: ImageRankingVisualization,
  IMAGE_SCQ: ImageSCQVisualization,
  IMAGE_MCQ: ImageMCQVisualization,
  FILE_UPLOAD: FileUploadVisualization,
  SIGNATURE: SignatureVisualization,
  PHOTO_CAPTURE: MediaCaptureVisualization,
  BARCODE: BarcodeVisualization,
};

export default function QuestionCard({ question }) {
  const VisualizationComponent = QUESTION_TYPE_MAP[question.type];

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

  return <VisualizationComponent question={question} />;
}
