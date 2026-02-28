import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export default function GatekeeperModal({ open, onEligibilityChange }) {
  const [hasVisa, setHasVisa] = useState(null);
  const [canTravel, setCanTravel] = useState(null);

  const complete = hasVisa !== null && canTravel !== null;
  const eligible = hasVisa && canTravel;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl" hideClose>
        <DialogHeader>
          <DialogTitle>Eligibility Check Before Application</DialogTitle>
          <DialogDescription>
            We only accept candidates who can attend in person in Oklahoma City.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Question
            title="Do you have a valid US Visa?"
            value={hasVisa}
            onChange={setHasVisa}
          />
          <Question title="Can you travel to OKC for in-person rotation?" value={canTravel} onChange={setCanTravel} />

          {complete && !eligible ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              You are not eligible for this cycle because this program is strictly in-person and visa sponsorship is not available.
            </div>
          ) : null}
          {complete && eligible ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              You are eligible to continue with the application.
            </div>
          ) : null}

          <Button onClick={() => onEligibilityChange(eligible)} disabled={!complete || !eligible}>
            Continue to Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Question({ title, value, onChange }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-800">{title}</p>
      <div className="flex gap-2">
        <Button variant={value === true ? 'default' : 'outline'} onClick={() => onChange(true)}>
          Yes
        </Button>
        <Button variant={value === false ? 'default' : 'outline'} onClick={() => onChange(false)}>
          No
        </Button>
      </div>
    </div>
  );
}
