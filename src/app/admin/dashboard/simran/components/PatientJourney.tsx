import Image from "next/image";

const connectorImages: Record<number, string> = {
  0: "/1-2.svg",
  1: "/2-3.svg",
  3: "/4-5.svg",
  4: "/5-6.svg",
};

const steps = [
  {
    number: "01",
    title: "Tell Us Your Symptoms",
    description: "Call, WhatsApp, or search symptoms",
  },
  {
    number: "02",
    title: "Get Matched",
    description: "Right specialist for your needs",
  },
  {
    number: "03",
    title: "Consult",
    description: "In-person or free video consult",
  },
  {
    number: "04",
    title: "Treatment Plan",
    description: "Costs, timelines - all explained",
  },
  {
    number: "05",
    title: "Insurance",
    description: "We handle all paperwork",
  },
  {
    number: "06",
    title: "Recovery",
    description: "Follow-ups & rehab included",
  },
];

export default function PatientJourney() {
  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#095A50] sm:text-4xl lg:text-5xl">
            Your path to better health
          </h2>

          <p className="mt-3 text-base text-[#161D1F] sm:text-lg">
            6 simple steps from symptoms diagnosis to recovery
          </p>
        </div>

        <div className="grid gap-20 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative rounded-2xl border border-[#D3D7D8] bg-white p-6 transition hover:shadow-soft h-51"
            >
              {connectorImages[index] && (
                <div className="absolute top-1/2 -right-22 hidden -translate-y-1/2 lg:block z-50 pointer-events-none">
                  <Image
                    src={connectorImages[index]}
                    alt="Step connector"
                    width={86}
                    height={48}
                    className="opacity-90"
                  />
                </div>
              )}

              <div className="text-[96px] -mt-16 font-bold text-[#095A50]">
                {step.number}
              </div>

              <h3 className="mt-4 text-[24px] font-bold text-[#161D1F]">
                {step.title}
              </h3>

              <p className="text-[16px] text-[#161D1F]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
