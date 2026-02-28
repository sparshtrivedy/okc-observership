import { APP_STATUSES } from '../../types';
import { cn } from '../../lib/utils';
import { FileText, SearchCheck, CalendarCheck2, Award, Check } from 'lucide-react';

export default function StatusTimeline({ currentStatus }) {
  const currentIndex = APP_STATUSES.indexOf(currentStatus);
  const safeCurrentIndex = currentIndex < 0 ? 0 : currentIndex;

  const statusIcons = {
    Submitted: FileText,
    'Under Review': SearchCheck,
    Interview: CalendarCheck2,
    Accepted: Award,
    Onboarding: Check
  };

  return (
    <div className="flex w-full items-start pb-8 px-3 pt-3" role="list" aria-label="Application status tracker">
      {APP_STATUSES.map((status, index) => {
        const Icon = statusIcons[status] || FileText;
        const isCurrent = index === safeCurrentIndex;
        const isDone = index < safeCurrentIndex;
        const isLast = index === APP_STATUSES.length - 1;
        const segmentDone = index < safeCurrentIndex;

        return (
          <div key={status} className={cn('flex items-start', !isLast && 'flex-1')}>
            <div className="relative flex w-12 shrink-0 flex-col items-center text-center" role="listitem">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white',
                  isCurrent && 'border-clinical bg-clinical text-white',
                  isDone && 'border-clinical/60 text-clinical',
                  !isCurrent && !isDone && 'border-slate-300 text-slate-400'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={status}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p
                className={cn(
                  'absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap text-xs font-medium',
                  isCurrent || isDone ? 'text-slate-700' : 'text-slate-500'
                )}
              >
                {status}
              </p>
            </div>

            {!isLast ? (
              <div className="-ml-px mt-6 h-1 flex-1 rounded-full bg-slate-300" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-clinical transition-all duration-300"
                  style={{ width: segmentDone ? '100%' : '0%' }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
