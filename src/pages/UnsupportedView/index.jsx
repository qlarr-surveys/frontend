
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import Image from '~/components/image/image';
import CompactLayout from '~/layouts/compact';


export default function UnsupportedView() {
    const { t } = useTranslation("manage");
    return (
        <CompactLayout>

            <Box>
                <Typography variant="h4" paragraph>
                    {t("mobile_view")}
                </Typography>

                <Typography sx={{ color: 'text.secondary' }}>
                    {t("mobile_view_working")}
                </Typography>

                <Image
                    alt="maintenance"
                    src="/illustration_maintenance.svg"
                    sx={{
                        mx: 'auto',
                        maxWidth: 320,
                        my: { xs: 5, sm: 8 },
                    }}
                />

            </Box>
        </CompactLayout>

    );
}
