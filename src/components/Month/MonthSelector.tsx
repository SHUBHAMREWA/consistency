import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { formatMonthLabel, prevMonth, nextMonth } from '../../utils/date';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const handlePrev = () => {
    const p = prevMonth(year, month);
    onChange(p.year, p.month);
  };

  const handleNext = () => {
    const n = nextMonth(year, month);
    onChange(n.year, n.month);
  };

  return (
    <div className="flex items-center gap-0.5 sm:gap-1.5 shrink min-w-0">
      <IconButton
        onClick={handlePrev}
        size="small"
        aria-label="Previous month"
        sx={{
          color: 'inherit',
          p: { xs: 0.5, sm: 1 },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <FaChevronLeft size={12} />
      </IconButton>

      <Typography
        variant="h6"
        component="span"
        className="text-slate-800 dark:text-purple-100"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '0.85rem', sm: '1.1rem' },
          minWidth: { xs: '105px', sm: '150px' },
          textAlign: 'center',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatMonthLabel(year, month)}
      </Typography>

      <IconButton
        onClick={handleNext}
        size="small"
        aria-label="Next month"
        sx={{
          color: 'inherit',
          p: { xs: 0.5, sm: 1 },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <FaChevronRight size={12} />
      </IconButton>
    </div>
  );
}
