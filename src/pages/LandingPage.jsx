import { MapPinned, Car, Handshake, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  return (
    <div className="space-y-10" data-design-mode="true">
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-500 to-violet-400 px-8 py-12 text-white">
        <p className="mb-5 inline-block rounded-full bg-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-wide">
          Now accepting applications
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Clinical Observership in <span className="text-sky-300">Oklahoma City</span>
        </h1>
        <p className="mt-4 max-w-2xl text-slate-200">
          Structured observership and rotation opportunities for international medical students in a supportive outpatient clinic environment.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" className="bg-white text-blue-700 hover:bg-white/90" asChild>
            <Link to="/apply">
              Start Application <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10" asChild>
            <Link to="/student">View Student Dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <PitchCard
          icon={<MapPinned className="h-5 w-5" />}
          title="Low Cost of Living"
          body="Keep housing and transport costs manageable while focusing on your clinical learning goals."
        />
        <PitchCard
          icon={<Car className="h-5 w-5" />}
          title="Car-Friendly City"
          body="OKC offers practical commuting with easy clinic access and less daily transit friction."
        />
        <PitchCard
          icon={<Handshake className="h-5 w-5" />}
          title="Supportive Clinic Culture"
          body="Learn with an approachable team that values mentorship, professionalism, and consistency."
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meet Dr. Rakesh Shrivastava</CardTitle>
            <CardDescription>Preceptor Profile</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src="https://images.pexels.com/photos/4989149/pexels-photo-4989149.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Doctor in white coat holding a pen"
              className="mb-4 h-72 w-full rounded-xl object-cover"
              loading="lazy"
            />
            <p className="text-sm text-slate-600">
              Dr. Rakesh Shrivastava has supervised hundreds of clinical learners and focuses on practical outpatient decision-making, patient communication, and documentation quality.
            </p>
          </CardContent>
        </Card>

        <Card className="border-clinical/20 bg-blue-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-clinical">
              <Stethoscope className="h-5 w-5" /> The OKC Pitch
            </CardTitle>
            <CardDescription>Why students choose our Oklahoma City track</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p>Focused outpatient exposure with active note review and case debriefing.</p>
            <p>Predictable scheduling with clear onboarding milestones and documentation support.</p>
            <p>A practical city setup that helps visiting students adapt quickly and perform confidently.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function PitchCard({ icon, title, body }) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-clinical">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{body}</p>
      </CardContent>
    </Card>
  );
}
