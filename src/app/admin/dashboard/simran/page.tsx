import HeroSection from "./components/HeroSection";
import WhyChooseUs from "./components/WhyChooseUs";
import PatientJourney from "./components/PatientJourney";
import MobileApp from "./components/MobileApp";
import CallToAction from "./components/CallToAction";
import FAQ from "./components/FAQ";
import Testimonials from "./components/Testimonials";
import InsurancePartners from "./components/InsurancePartners";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Testimonials />
      {/* <WhyChooseUs /> */}
      {/* <PatientJourney /> */}
      {/* <InsurancePartners /> */}
      <FAQ />
      {/* <MobileApp /> */}
      {/* <CallToAction /> */}
    </>
  );
}
