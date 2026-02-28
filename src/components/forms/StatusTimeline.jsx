import { APP_STATUSES } from '../../types';
import { cn } from '../../lib/utils';

export default function StatusTimeline({ currentStatus }) {
  const currentIndex = APP_STATUSES.indexOf(currentStatus);

  return (
    <ol className="grid gap-4 md:grid-cols-5">
      {APP_STATUSES.map((status, index) => {
        const done = index <= currentIndex;
        return (
          <li key={status} className="relative rounded-xl border border-slate-200 bg-white p-4">
            <div
              className={cn('mb-2 h-2 rounded-full', done ? 'bg-clinical' : 'bg-slate-200')}
              aria-label={`${status} progress`}
            />
            <p className={cn('text-sm font-semibold', done ? 'text-clinical' : 'text-slate-500')}>{status}</p>
          </li>
        );
      })}
    </ol>
  );
}
