import DoctorCard from "../doctor/DoctorCard";
import { doctors } from "@/app/_lib/doctorData";

export default function MeetDoctors() {
  return (
    <section className="py-16 sm:py-20 bg-white overflow-x-visible overflow-y-hidden ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-brand-primary sm:text-4xl lg:text-5xl">
            Meet your Doctors
          </h2>
          <p className="mt-3 text-base text-text-secondary sm:text-lg">
            Experienced, compassionate doctors.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.slice(0, 3).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  );
}
