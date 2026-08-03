import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { FaTableCells, FaChartLine } from 'react-icons/fa6';

interface MobileTabsProps {
  activeTab: 'habits' | 'graph';
  onChange: (tab: 'habits' | 'graph') => void;
}

export default function MobileTabs({ activeTab, onChange }: MobileTabsProps) {
  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: { xs: 'block', md: 'none' },
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <BottomNavigation
        value={activeTab}
        onChange={(_, newValue) => onChange(newValue)}
        sx={{ bgcolor: 'background.paper', height: 64 }}
      >
        <BottomNavigationAction
          label="Habits"
          value="habits"
          icon={<FaTableCells size={20} />}
          sx={{
            '&.Mui-selected': { color: 'primary.main' },
            color: 'text.secondary',
            fontSize: '0.7rem',
          }}
        />
        <BottomNavigationAction
          label="Graph"
          value="graph"
          icon={<FaChartLine size={20} />}
          sx={{
            '&.Mui-selected': { color: 'secondary.main' },
            color: 'text.secondary',
            fontSize: '0.7rem',
          }}
        />
      </BottomNavigation>
    </Paper>
  );
}
