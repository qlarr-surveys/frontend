import { transformIconMatrixSCQData } from '~/utils/analytics/dataTransformers';
import MatrixVisualization from './MatrixVisualization';

export default function IconMatrixSCQVisualization({ question }) {
  return <MatrixVisualization question={question} transformer={transformIconMatrixSCQData} useIcons />;
}
