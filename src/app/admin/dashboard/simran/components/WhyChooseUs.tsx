const features = [
  {
    highlight: "3 min.",
    title: "3 min. ER Response",
    description: "Average door-to-doctor time. Every second matters",
  },
  {
    highlight: "98%",
    title: "Surgery Success",
    description: "Published outcomes across all departments.",
  },
  {
    highlight: "Free",
    title: "Video Consult",
    description: "Start with a video consultation from home.",
  },
  {
    highlight: "0%",
    title: "0% EMI Available",
    description: "No-cost EMI up to 12 months on procedures.",
  },
  {
    highlight: "Free",
    title: "Pickup & Drop",
    description: "Complimentary cab on day of surgery.",
  },
  {
    highlight: "24/7",
    title: "Coordinator",
    description: "Dedicated human for insurance & scheduling.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 bg-[#00312B]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Built different. For patients.
          </h2>

          <p className="mt-3 text-base text-white/80 sm:text-lg">
            What makes us different and why thousands of families trust us.
          </p>
        </div>

        <div className="grid gap-18 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl bg-[#F0FBF9] text-center p-8 transition hover:shadow-soft h-65 flex flex-col justify-between"
            >
              <div className="text-[48px] font-bold text-[#095A50] sm:text-5xl">
                {feature.highlight}
              </div>

              <div className="mt-6">
                <h3 className="text-[24px] font-bold text-[#161C1F]">
                  {feature.title}
                </h3>

                <p className="mt-2 text-[16px] text-[#6D7578]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
