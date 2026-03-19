import Image from "next/image";
import { Check } from "lucide-react";

const features = [
  "Buy Medicines",
  "Video consult from home",
  "Book & manage Lab Tests",
  "Book Homecare Services",
  "Access reports & prescriptions",
];

export default function MobileApp() {
  return (
    <section className="relative overflow-hidden bg-[#00312B] py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-0 h-96 w-96 -translate-y-1/2 rounded-full bg-[#095A50]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Your Hospital in your pocket
            </h2>

            <p className="mt-4 text-base text-white/80 sm:text-lg">
              Buy Medicines, book doctor video-consult, Lab tests, view health
              reports - all from one app.
            </p>

            <ul className="mt-8 space-y-3">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center justify-center gap-3 text-white lg:justify-start"
                >
                  <Check className="h-5 w-5 shrink-0 text-[#4CAF50]" />
                  <span className="text-base">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <a
                href="https://play.google.com/store/apps/details?id=com.mediversal_app"
                className="inline-flex items-center gap-2 rounded-xl bg-white transition hover:bg-white/90"
              >
                <Image
                  src="/google-play.svg"
                  alt="Google Play"
                  width={120}
                  height={40}
                  className="h-14 w-auto sm:h-16"
                />
              </a>

              <a
                href="https://apps.apple.com/in/app/mediversal247/id6747696221"
                className="inline-flex items-center gap-2 rounded-xl bg-white transition hover:bg-white/90"
              >
                <Image
                  src="/app-store.svg"
                  alt="App Store"
                  width={120}
                  height={40}
                  className="h-14 w-auto sm:h-16"
                />
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 rounded-4xl bg-[#0073A0]/30 blur-2xl" />

              <Image
                src="/mediversal247.svg"
                alt="Mobile App"
                width={400}
                height={600}
                className="relative h-auto w-80 sm:w-96"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
