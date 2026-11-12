import HeroSection from '@/components/hero-section-2'
import FeaturesThree from '@/components/features-3'
import Content from '@/components/content-2'
import Pricing from '@/components/pricing-2'
import FAQs from '@/components/faqs-1'
import CallToAction from '@/components/call-to-action-2'
import Footer from '@/components/footer-2'
import { BusinessSessionRedirect } from '@/components/business-session-redirect'

export default function DuskLandingPage() {
    return (
        <>
            <BusinessSessionRedirect />
            <HeroSection />
            <FeaturesThree />
            <Content />
            <Pricing />
            <FAQs />
            <CallToAction />
            <Footer />
        </>
    )
}
