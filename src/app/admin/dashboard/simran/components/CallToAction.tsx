import { ArrowRight, Phone } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#095A50] sm:text-4xl lg:text-5xl">
            Your health shouldn&apos;t wait
          </h2>

          <p className="mt-4 text-base text-[#161D1F] sm:text-lg">
            Whether it&apos;s a concern or a checkup — the first step matters.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#095A50] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#095A50]/90">
              Book Appointment
              <ArrowRight className="h-5 w-5" />
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border-2 border-[#095A50] bg-white px-8 py-4 text-base font-semibold text-[#095A50] transition hover:bg-[#F0FBF9]">
              <Phone className="h-5 w-5" />
              Talk to Us
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-[#161D1F]">
            <span>Available 24/7</span>
            <span className="hidden sm:inline">•</span>
            <span>Trusted by 1,00,000+ Patients</span>
            <span className="hidden sm:inline">•</span>
            <span>No Hidden Charges</span>
          </div>
        </div>
      </div>
    </section>
  );
}
