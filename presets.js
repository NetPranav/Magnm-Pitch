// presets.js - magnm Build & Cost Planner Configuration & Presets
//
// =============================================================================
// ANTI-HIJACKING TEAM POLICY & ARCHITECTURE RULE:
// 1. The default route ('/') must ALWAYS remain the generic magnm Software Cost Planner.
// 2. Client-specific customizations MUST live on dedicated routes: /clients/<slug> or ?client=<slug>.
// 3. To add a client pitch, add it to PLANNER_PRESETS below or create it via the /admin UI.
// 4. NEVER hardcode client names, client scopes, or client copy into index.html or app.js!
// =============================================================================

var PLANNER_PRESETS = {
  // Main route default: universal software agency planner
  general: {
    slug: "general",
    name: "General Software Cost Planner",
    badge: "",
    clientName: "",
    businessName: "",
    title: "magnm Software Cost Planner",
    lead: "A student-led development team from India. We build modern web platforms, mobile apps, SaaS, AI integrations, and cloud backend systems. Configure your software stack and get an instant quotation.",
    whatWeDo: "Full-Stack Web & SaaS, Mobile Apps (iOS/Android), Cloud Backend & APIs, AI & Automation",
    portfolio: "magnm-org.vercel.app",
    thisPlan: "Custom software & product development tailored to your requirements",
    architectureBlock: {
      heading: "Software Architecture & Capabilities",
      sub: "Engineered for performance, scale, and seamless user experiences across every device.",
      roles: [
        {
          label: "User Experience",
          points: [
            "Modern responsive web and mobile applications",
            "Intuitive workflows, accessible UI, and sub-second load times",
            "Cross-device synchronization and local caching",
            "Tailored design system matching your brand identity"
          ]
        },
        {
          label: "Backend & Cloud",
          points: [
            "Production REST / GraphQL API server architecture",
            "Scalable databases with automatic off-site backups",
            "Enterprise authentication and role-based permissions (RBAC)",
            "Secure payment gateways, webhooks, and transactional emails"
          ]
        },
        {
          label: "AI & DevOps",
          points: [
            "Automated CI/CD build pipelines and cloud deployments",
            "Real-time monitoring, uptime health checks, and error tracking",
            "Custom AI assistants, vector search, and workflow automations",
            "Monthly maintenance SLA and proactive security updates"
          ]
        }
      ]
    },
    initialSelected: ["w_front", "b_db", "b_admin", "ops_cloud"],
    sections: {
      p2: ["w_front", "w_anim", "w_portal", "w_shop", "w_search", "w_coupon", "w_seo", "w_blog", "w_forms", "w_chat", "w_lang"],
      p3: ["a_base", "a_ios", "a_store", "a_push", "a_pay", "a_bio", "a_offline", "a_share", "a_support", "a_splash"],
      p4: ["b_db", "b_google", "b_email", "b_otp", "b_roles", "b_admin", "b_pay", "b_files", "b_analytics", "b_backup", "b_notif"],
      p5: ["ai_bot", "ai_doc", "ai_search", "ai_workflow", "ops_cicd", "ops_cloud", "ops_monitor", "ops_maint"]
    }
  },

  // Preserved client pitch: Urban Company-style Booking Platform
  // Route: /clients/urban-company or ?client=urban-company
  "urban-company": {
    slug: "urban-company",
    name: "Urban Company-style Booking Platform",
    badge: "Tailored Proposal for Urban-style Platform",
    clientName: "Local Service Platform Client",
    businessName: "Urban Style Services",
    title: "magnm Build Planner",
    lead: "A student-led development team from India. We build websites, mobile apps, drone and AI software. Design your own service platform here and watch the price as you tick.",
    whatWeDo: "Websites, Android and iPhone apps, backend systems",
    portfolio: "magnm-org.vercel.app",
    thisPlan: "An Urban Company-style booking platform for your local business",
    architectureBlock: {
      heading: "What an Urban-style platform does",
      sub: "Three kinds of people use it. Each gets their own screens.",
      roles: [
        {
          label: "Customer",
          points: [
            "Browse services and prices",
            "Pick a date and a time slot",
            "Pay online or in cash",
            "Track the job, then rate it"
          ]
        },
        {
          label: "Service provider",
          points: [
            "Get a job request",
            "Accept or reject it",
            "Mark the job done",
            "Get paid after your commission"
          ]
        },
        {
          label: "You, the owner",
          points: [
            "Add services and set prices",
            "See every booking",
            "Manage your providers",
            "Track earnings and fees"
          ]
        }
      ]
    },
    initialSelected: ["w_front", "w_book", "b_google", "b_db", "a_base", "a_prov"],
    sections: {
      p2: ["w_front", "w_anim", "w_lang", "w_gallery", "w_book", "w_shop", "w_account", "w_search", "w_coupon", "w_reviews", "w_seo", "w_blog", "w_faq", "w_map", "w_wa"],
      p3: ["a_base", "a_prov", "a_ios", "a_store", "a_book", "a_pay", "a_live", "a_addr", "a_rate", "a_login", "a_push", "a_hi", "a_share", "a_support", "a_splash"],
      p4: ["b_db", "b_google", "b_email", "b_otp", "b_files", "b_backup", "b_pay", "b_admin", "b_commission", "b_coupon", "b_reviews", "b_notif"],
      p5: ["ai_bot", "ai_workflow", "ops_cloud", "ops_maint"]
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PLANNER_PRESETS: PLANNER_PRESETS };
}
