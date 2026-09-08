import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, Check, CreditCard, Database, LineChart, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQAssistant } from '../components/FAQAssistant';
import { BrandLogo } from '../components/BrandLogo';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }

  interface ImportMeta {
    env: {
      VITE_RAZORPAY_KEY_ID?: string;
      VITE_API_URL?: string;
    };
  }
}

const dashboardMetrics = [
  { label: 'Revenue', value: '₹31.18L', change: '+12.4%' },
  { label: 'Expenses', value: '₹49.64L', change: '-3.7%' },
  { label: 'Customers', value: '1,248', change: '+8.2%' },
];

const features = [
  { icon: Upload, title: 'Bring your data', description: 'Upload the sales and expense files you already use. BizLens prepares them for analysis.' },
  { icon: BarChart3, title: 'See the whole business', description: 'Track revenue, costs, customers, products, and transactions from one calm workspace.' },
  { icon: Sparkles, title: 'Understand the why', description: 'Get clear signals about what changed and where to investigate next.' },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '₹999',
    amount: 999,
    description: 'For solo owners who want a clearer view of sales and costs.',
    features: ['1 business workspace', 'CSV uploads', 'Core dashboard metrics', 'Monthly reporting'],
  },
  {
    name: 'Growth',
    price: '₹2,499',
    amount: 2499,
    description: 'For growing teams that need more visibility and deeper review.',
    features: ['Unlimited business workspaces', 'Advanced insights', 'Customer and product trends', 'Priority support'],
    featured: true,
  },
  {
    name: 'Scale',
    price: '₹4,999',
    amount: 4999,
    description: 'For multi-store or multi-branch operations with more data volume.',
    features: ['Everything in Growth', 'Custom reporting', 'Team access controls', 'Dedicated onboarding'],
  },
];

const loadRazorpayScript = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(Boolean(window.Razorpay));
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export const Landing: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentPlan, setPaymentPlan] = useState<string>('');
  const heroCopyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroCopy = heroCopyRef.current;
    if (!heroCopy) return;

    let frame = 0;
    const updateReveal = () => {
      frame = 0;
      const bounds = heroCopy.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.82 - bounds.top) / (window.innerHeight * 0.62)));
      heroCopy.style.setProperty('--scroll-progress', progress.toString());
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateReveal);
    };

    updateReveal();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const handleRazorpayPayment = async (plan: typeof pricingPlans[number]) => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) {
      setPaymentStatus('Online payments are not configured yet. Add VITE_RAZORPAY_KEY_ID to enable checkout.');
      return;
    }

    setPaymentPlan(plan.name);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPaymentPlan('');
      setPaymentStatus('Razorpay checkout could not be loaded. Add your Razorpay key before enabling live payments.');
      return;
    }

    const RazorpayCtor = window.Razorpay;
    if (!RazorpayCtor) {
      setPaymentPlan('');
      setPaymentStatus('Razorpay is not available in this browser session.');
      return;
    }

    const razorpay = new RazorpayCtor({
      key: keyId,
      amount: plan.amount * 100,
      currency: 'INR',
      name: 'BizLens',
      description: `${plan.name} plan`,
      handler: (response: Record<string, string>) => {
        setPaymentPlan('');
        setPaymentStatus(`Payment successful for the ${plan.name} plan. Payment ID: ${response.razorpay_payment_id || 'received'}`);
      },
      prefill: {
        name: 'BizLens Customer',
      },
      theme: {
        color: '#285c63',
      },
      modal: {
        ondismiss: () => {
          setPaymentPlan('');
          setPaymentStatus('Checkout was closed before payment completed.');
        },
      },
    });

    razorpay.open();
  };

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <BrandLogo />
        </Link>
        <nav className="landing-links" aria-label="Main navigation">
          <Link to="/how-it-works">How it works</Link>
          <Link to="/features">What you can see</Link>
          <Link to="/faqs">FAQs</Link>
        </nav>
        <div className="landing-actions">
          <Link to="/login" className="landing-login">Sign in</Link>
          <Link to="/register" className="btn btn-primary landing-cta">Get started <ArrowRight size={15} /></Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div ref={heroCopyRef} className="landing-hero-copy">
            <p className="eyebrow"><span /> Business clarity, without the spreadsheet maze</p>
            <h1>Know what is happening in your business.</h1>
            <p className="landing-lede">BizLens turns everyday sales and expense data into a clear view of performance, customers, and the decisions in front of you.</p>
            <div className="landing-hero-actions">
              <Link to="/register" className="btn btn-primary landing-main-cta">Create your workspace <ArrowRight size={17} /></Link>
              <Link to="/how-it-works" className="landing-text-link">See how it works <ArrowRight size={15} /></Link>
            </div>
            <div className="landing-trust-row">
              <span><Check size={15} /> Built for small businesses</span>
              <span><Check size={15} /> Start with the data you have</span>
            </div>
          </div>

          <div className="landing-dashboard-preview" aria-label="BizLens dashboard preview">
            <div className="preview-window-bar"><span /><span /><span /><small>DMfestives / Overview</small></div>
            <div className="preview-content">
              <div className="preview-heading">
                <div><span className="preview-kicker">Tuesday, 07 September</span><h2>Your business at a glance</h2></div>
                <span className="preview-status"><span /> Data is current</span>
              </div>
              <div className="preview-metrics">
                {dashboardMetrics.map((metric) => (
                  <div className="preview-metric" key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small>{metric.change} this month</small>
                  </div>
                ))}
              </div>
              <div className="preview-chart-area">
                <div className="preview-chart-head"><strong>Revenue over time</strong><span>Last 6 months</span></div>
                <div className="preview-chart"><i /><i /><i /><i /><i /><i /><div className="preview-line" /></div>
              </div>
              <div className="preview-insight"><span><Sparkles size={14} /></span><div><strong>One useful lead</strong><p>Revenue softened in February. Explore products and regions to see where the change began.</p></div><ArrowRight size={15} /></div>
            </div>
          </div>
        </section>

        <section className="landing-proof" aria-label="BizLens benefits">
          <div><strong>One place for the questions behind the numbers</strong><span>From raw files to a confident next step.</span></div>
          <div className="proof-items"><span><Database size={17} /> Clean data</span><span><LineChart size={17} /> Useful trends</span><span><ShieldCheck size={17} /> Separate workspaces</span></div>
        </section>

        <section className="landing-pricing" id="pricing" aria-label="BizLens pricing plans">
          <div className="section-intro"><p className="eyebrow"><span /> Simple pricing</p><h2>Choose the plan that fits your business.</h2><p>Start with a focused workspace and scale up when your reporting needs grow.</p></div>
          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`pricing-card ${plan.featured ? 'pricing-card-featured' : ''}`}>
                <div className="pricing-card-header">
                  <div>
                    <p className="pricing-plan-name">{plan.name}</p>
                    <h3>{plan.price}<span>/mo</span></h3>
                  </div>
                  {plan.featured && <span className="pricing-badge">Popular</span>}
                </div>
                <p className="pricing-description">{plan.description}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}><Check size={16} /> {feature}</li>
                  ))}
                </ul>
                <button type="button" className="btn btn-primary pricing-button" onClick={() => handleRazorpayPayment(plan)} disabled={Boolean(paymentPlan)}>
                  <CreditCard size={16} /> {paymentPlan === plan.name ? 'Opening checkout...' : 'Pay with Razorpay'}
                </button>
              </article>
            ))}
          </div>
          {paymentStatus && <p className="payment-status">{paymentStatus}</p>}
        </section>

        <section className="landing-section" id="how-it-works">
          <div className="section-intro"><p className="eyebrow"><span /> A simpler rhythm</p><h2>From upload to understanding in a few steps.</h2><p>Keep your existing files. BizLens gives them a useful shape, then helps you follow the story in the numbers.</p></div>
          <div className="feature-grid" id="features">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return <article className="feature-item" key={feature.title}><span className="feature-number">0{index + 1}</span><div className="feature-icon"><Icon size={19} /></div><h3>{feature.title}</h3><p>{feature.description}</p></article>;
            })}
          </div>
        </section>

        <section className="landing-question" id="faq">
          <div><p className="eyebrow"><span /> Have a question?</p><h2>There is a guide in the corner.</h2><p>Ask the BizLens guide about uploading data, reading your dashboard, or finding the right page. It knows the current website and keeps the answer practical.</p></div>
          <div className="question-note"><MessageBubble /><span>Try “How do I get started?”</span></div>
        </section>

        <section className="landing-final-cta"><p className="eyebrow"><span /> Make the next decision easier</p><h2>Start with a clearer view.</h2><p>Create your BizLens workspace and see what your business data has been trying to tell you.</p><Link to="/register" className="btn btn-primary landing-main-cta">Get started <ArrowRight size={17} /></Link></section>
      </main>

      <footer className="landing-footer"><span>© 2026 BizLens</span><span>Small business intelligence, made legible.</span><Link to="/login">Sign in to your workspace <ArrowRight size={14} /></Link></footer>
      <FAQAssistant />
    </div>
  );
};

const MessageBubble: React.FC = () => <span className="question-bubble"><Sparkles size={18} /></span>;
