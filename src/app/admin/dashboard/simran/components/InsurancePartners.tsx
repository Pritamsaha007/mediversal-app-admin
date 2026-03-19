import Image from "next/image";
import { ArrowRight } from "lucide-react";

const partners = [
  { name: "Star Health", logo: "/star-health.svg" },
  { name: "HDFC Ergo", logo: "/hdfc-ergo.svg" },
  { name: "ICICI Lombard", logo: "/icici-lombard.svg" },
  { name: "Bajaj Allianz", logo: "/bajaj-allianz.svg" },
  { name: "National Insurance", logo: "/new-india-assurance.svg" },
  { name: "Max Bupa", logo: "/max-bupa.svg" },
];

export default function InsurancePartners() {
  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#095A50] sm:text-4xl lg:text-5xl">
            Insurance Partners
          </h2>

          <p className="mt-3 text-base text-[#161D1F] sm:text-lg">
            Cashless treatment with 30+ insurers
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center rounded-xl bg-white p-6 transition hover:shadow-soft"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={60}
                className="h-18 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#095A50] transition hover:gap-3">
            View all partners & check coverage
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
