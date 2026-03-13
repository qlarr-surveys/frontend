import { transformMatrixMCQData } from '~/utils/analytics/dataTransformers';
import MatrixVisualization from './MatrixVisualization';

export default function MatrixMCQVisualization({ question }) {
  return <MatrixVisualization question={question} transformer={transformMatrixMCQData} showAvgSelections />;
}
