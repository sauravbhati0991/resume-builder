import Hero from "../components/Hero";
import FeatureIntro from "../components/FeatureIntro";
import WhyChooseResumeA from "../components/WhyChooseResumeA";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import BlogSection from "../components/BlogSection";

const Home = () => {
  return (
    <>
      <Hero />
      <FeatureIntro />
      <div id="about">
        <WhyChooseResumeA />
      </div>
      <HowItWorks />
      <Pricing />
      <BlogSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </>
  );
};

export default Home;