import { transformIconMatrixMCQData } from '~/utils/analytics/dataTransformers';
import MatrixVisualization from './MatrixVisualization';

export default function IconMatrixMCQVisualization({ question }) {
  return <MatrixVisualization question={question} transformer={transformIconMatrixMCQData} useIcons showAvgSelections />;
}
