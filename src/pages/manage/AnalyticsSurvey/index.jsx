import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { useService } from '~/hooks/use-service';
import LoadingDots from '~/components/common/LoadingDots';
import QuestionCard from '~/components/analytics/QuestionCard';

function AnalyticsSurvey() {
  const surveyService = useService('survey');
  const { surveyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    surveyService
      .getAnalytics(surveyId)
      .then((data) => {
        setData(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Failed to load analytics data');
      })
      .finally(() => setLoading(false));
  }, [surveyId]);

  if (loading) return <LoadingDots fullHeight />;

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'error.lighter' }}>
          <Typography variant="h6" color="error">
            Error Loading Analytics
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No analytics data available
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (data.totalResponses === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Typography variant="h5">{data.surveyTitle}</Typography>
          <Typography variant="body2" color="text.secondary">
            0 responses
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Responses Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics will appear here once survey responses are submitted.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!data.questions || data.questions.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Typography variant="h5">{data.surveyTitle}</Typography>
          <Typography variant="body2" color="text.secondary">
            {data.totalResponses} total responses
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Questions Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This survey doesn't contain any analyzable questions.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
      {/* Survey Header */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5">{data.surveyTitle}</Typography>
        <Typography variant="body2" color="text.secondary">
          {data.totalResponses} total responses • {data.questions.length} questions
        </Typography>
      </Paper>

      {/* All question cards */}
      {data.questions.map((question) => (
        <Paper key={question.id} variant="outlined" sx={{ mb: 3, p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            {question.title}
          </Typography>
          <QuestionCard question={question} />
        </Paper>
      ))}
    </Box>
  );
}

export default React.memo(AnalyticsSurvey);
