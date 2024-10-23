import { useState } from 'react';
import { Tooltip, Button } from '@mui/material';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { useTheme } from '@emotion/react';

const CustomTooltip = ({ title, body, url }) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const theme = useTheme();

    const tooltipContent = (
        <div>
            {title && <strong>{title}</strong>}
            {body && <p>{body}</p>}
            {url && (
                <Button
                    variant="text"
                    href={url}
                    target="_blank"
                    sx={{ padding: 0, textTransform: 'none' }}
                >
                    Read more...
                </Button>
            )}
        </div>
    );

    return (
        <Tooltip
            title={tooltipContent}
            placement="bottom-start"
            onOpen={() => setTooltipOpen(true)}
            onClose={() => setTooltipOpen(false)}
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: '#fff',
                        color: '#1a2052',
                        fontSize: '0.875rem',
                        border: '1px solid #dadde9',
                    },
                },
            }}
        >
            <HelpOutline
                sx={{
                    borderRadius: '50%',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                    backgroundColor: tooltipOpen ? theme.palette.primary.main : 'transparent',
                    color: tooltipOpen ? '#fff' : '#1a2052',
                    outline: 'none',
                    '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        outline: 'none',
                    },
                    '&:focus': {
                        outline: 'none',
                    },
                }}
                fontSize="medium"
            />
        </Tooltip>
    );
};

export default CustomTooltip;
