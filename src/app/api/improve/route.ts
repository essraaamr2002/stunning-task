// src/app/api/improve/route.ts
import { NextResponse } from "next/server";

type Mode = "standard" | "ai";

type ImproveSummary = {
  audience: string;
  pages: string[];
  style: string;
  features: string[];
  lang: "ar" | "en";
  industry: string;
};

type StandardResult = {
  improved: string;
  summary: ImproveSummary;
};

type AiErrorDetails = { status?: number; code?: string; type?: string };

type AiResult =
  | { ok: true; improved: string }
  | { ok: false; reason: "AI_NOT_CONFIGURED" | "AI_ERROR"; details?: AiErrorDetails };

const DAILY_LIMIT = 10;

/** -------------------- Helpers -------------------- */
function cleanIdea(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

function detectLanguage(text: string): "ar" | "en" {
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

function pickIndustry(lower: string) {
  if (/e-?commerce|shop|store|products|checkout|cart|fashion|clothing/.test(lower)) return "ecommerce";
  if (/متجر|تجارة|الكتروني|إلكتروني|سلة|دفع|منتجات|ملابس|فاشون|تيشيرت|بنطلون/.test(lower)) return "ecommerce";
  if (/restaurant|cafe|food|menu|delivery/.test(lower) || /مطعم|كافيه|منيو|توصيل/.test(lower)) return "restaurant";
  if (
    /portfolio|cv|resume|designer|developer|freelancer/.test(lower) ||
    /بورتفوليو|سيرة ذاتية|مصمم|مبرمج|فريلانس/.test(lower)
  ) return "portfolio";
  if (/saas|app|platform|dashboard|tool|todo|tasks|task manager|productivity|kanban/.test(lower)) return "saas";
  if (/clinic|doctor|dentist|health/.test(lower) || /عيادة|دكتور|طبيب|أسنان|صحة/.test(lower)) return "health";
  return "generic";
}

function titleCase(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** -------------------- Standard improver -------------------- */
function improveIdeaStandard(raw: string): StandardResult {
  const idea = cleanIdea(raw);
  const lower = idea.toLowerCase();
  const lang = detectLanguage(idea);
  const industry = pickIndustry(lower);
  const isAr = lang === "ar";

  const audience =
    industry === "portfolio"
      ? (isAr ? "عملاء محتملين + Recruiters + شركاء محتملين" : "Clients, recruiters, and collaborators evaluating your work")
      : industry === "ecommerce"
      ? (isAr ? "متسوقين بيبحثوا عن منتجات ويشتروا أونلاين" : "Shoppers looking to discover and buy products online")
      : industry === "restaurant"
      ? (isAr ? "أشخاص قريبين عايزين يشوفوا المنيو ويطلبوا/يحجزوا" : "People nearby looking for your menu and to order / book")
      : industry === "saas"
      ? (isAr ? "مستخدمين عايزين حل بسيط ومنظم" : "People looking for a simple, trustworthy productivity tool")
      : (isAr ? "ناس بتدور على خدمتك أونلاين" : "People searching for your service online");

  const style =
    /modern|minimal|clean/.test(lower)
      ? (isAr ? "مودرن، مينيمال، واضح" : "Modern, minimal, high-contrast")
      : /luxury|premium|elegant/.test(lower)
      ? (isAr ? "فخم، أنيق، مساحات واسعة" : "Premium, elegant, spacious")
      : industry === "portfolio"
      ? (isAr ? "نظيف، واثق، يركز على المشاريع" : "Clean, confident, case-study focused")
      : industry === "ecommerce"
      ? (isAr ? "تجاري، واضح، يركز على التحويل" : "Commerce-first, clear, conversion-focused")
      : (isAr ? "ودود، واضح، يركز على التحويل" : "Friendly, clear, conversion-focused");

  const pages =
    industry === "portfolio"
      ? ["Home", "Work (Projects)", "About", "Services", "Contact"]
      : industry === "ecommerce"
      ? ["Home", "Shop / Collections", "Product Details", "Cart / Checkout", "About", "Contact / Support"]
      : industry === "restaurant"
      ? ["Home", "Menu", "Order / Reserve", "About", "Contact"]
      : industry === "saas"
      ? ["Home", "Features", "Pricing", "About", "Contact"]
      : ["Home", "Services", "About", "Contact"];

  const features: string[] =
    industry === "ecommerce"
      ? [
          isAr ? "تصنيفات + بحث" : "Product categories + search",
          isAr ? "صفحات منتج قوية (صور/سعر/وصف)" : "Strong product pages (images, price, description)",
          isAr ? "سلة + دفع" : "Cart + checkout",
          isAr ? "معلومات شحن/استرجاع + Reviews" : "Shipping/returns + reviews (trust signals)",
        ]
      : industry === "portfolio"
      ? [
          isAr ? "مشاريع + Case studies" : "Project gallery + case studies",
          isAr ? "مهارات + أدوات" : "Skills + tools",
          isAr ? "آراء عملاء / إثبات ثقة" : "Testimonials / credibility",
          isAr ? "فورم تواصل + لينك Calendar" : "Contact form + calendar link",
        ]
      : industry === "restaurant"
      ? [
          isAr ? "منيو بالأسعار" : "Menu with prices",
          isAr ? "CTA للطلب/الحجز" : "Order / reservation CTA",
          isAr ? "موقع + مواعيد" : "Location + hours",
          isAr ? "Reviews" : "Customer reviews",
        ]
      : industry === "saas"
      ? [
          isAr ? "شرح الفكرة في 3 خطوات" : "Explain the product in 3 clear steps",
          isAr ? "صور UI أو لقطات شاشة" : "UI screenshots / simple mockups",
          isAr ? "CTA للتجربة / التسجيل" : "Strong CTA (start / sign up)",
          isAr ? "FAQ يقلل اعتراضات" : "FAQ to handle objections",
        ]
      : [
          isAr ? "قيمة واضحة + CTA" : "Clear value proposition + CTA",
          isAr ? "Social proof" : "Social proof (testimonials/logos)",
          isAr ? "Lead capture form" : "Lead capture form",
        ];

  const heroHeadline =
    industry === "portfolio"
      ? (isAr ? "اعرض شغلك. وخلي التوظيف أسهل." : "Show your work. Get hired faster.")
      : industry === "ecommerce"
      ? (isAr ? "متجر ملابس أنيق — بيع أسهل." : "A clothing store people trust—and buy from.")
      : industry === "restaurant"
      ? (isAr ? "منيو واضح. طلب أسرع." : "Your menu, your story—ready to order.")
      : industry === "saas"
      ? (isAr ? "نظّم مهامك في مكان واحد." : "Organize tasks without the chaos.")
      : (isAr ? "حوّل فكرتك لموقع جاهز." : "Turn your idea into a build-ready website.");

  const heroSubheadline =
    industry === "portfolio"
      ? (isAr ? "بورتفوليو مودرن يبرز أفضل مشاريعِك ويخلي التواصل معاك سهل." : "A modern portfolio that highlights your best projects and makes it easy to contact you.")
      : industry === "ecommerce"
      ? (isAr ? "اعمل متجر ملابس سريع وواضح: تصنيفات، صفحات منتج قوية، ودفع سهل." : "Build a clean ecommerce site with clear categories, strong product pages, and a smooth checkout.")
      : industry === "saas"
      ? (isAr ? "صفحة هبوط واضحة لتطبيق مهام: تشرح القيمة بسرعة وتوجه المستخدم للتجربة." : "A clear landing page for a tasks app that explains value fast and drives sign-ups.")
      : (isAr ? "صفحة هبوط مرتبة: قيمة واضحة، أقسام منظمة، وCTA قوي." : "A crisp landing page with clear value, structured sections, and strong CTAs.");

  const primaryCTA =
    industry === "portfolio"
      ? (isAr ? "شوف أعمالي" : "View my work")
      : industry === "ecommerce"
      ? (isAr ? "تسوّق الآن" : "Shop now")
      : industry === "restaurant"
      ? (isAr ? "شوف المنيو" : "View menu")
      : industry === "saas"
      ? (isAr ? "ابدأ مجانًا" : "Start free")
      : (isAr ? "ابدأ الآن" : "Get started");

  const secondaryCTA =
    industry === "ecommerce"
      ? (isAr ? "شوف العروض" : "See best sellers")
      : industry === "saas"
      ? (isAr ? "شوف المميزات" : "See features")
      : industry === "portfolio"
      ? (isAr ? "تواصل معايا" : "Contact me")
      : null;

  const homeSections = [
    isAr ? "1) Hero (عنوان + وصف + CTA)" : "1) Hero (headline, subheadline, CTA)",
    isAr ? "2) Benefits (3–5 نقاط)" : "2) Benefits (3–5 bullets)",
    isAr ? "3) Social proof (Reviews/Logos)" : "3) Social proof (testimonials/logos)",
    isAr
      ? `4) Preview (${industry === "portfolio" ? "مشاريع مختارة" : industry === "ecommerce" ? "تصنيفات + Best sellers" : industry === "saas" ? "مميزات التطبيق" : "الخدمات"})`
      : `4) Preview (${industry === "portfolio" ? "selected projects" : industry === "ecommerce" ? "categories + best sellers" : industry === "saas" ? "product features" : "services"})`,
    isAr ? "5) How it works (3 خطوات)" : "5) How it works (3 steps)",
    isAr ? "6) FAQ (5 أسئلة)" : "6) FAQ (5 questions)",
    isAr ? "7) Final CTA + Lead form" : "7) Final CTA + Lead form",
  ];

  const improved = [
    isAr ? "Build-ready website prompt (Arabic):" : "Build-ready website prompt (English):",
    "",
    `${isAr ? "Idea" : "Idea"}: "${idea}"`,
    `${isAr ? "Website type" : "Website type"}: ${titleCase(industry)} website`,
    `${isAr ? "Target audience" : "Target audience"}: ${audience}`,
    `${isAr ? "Primary goal" : "Primary goal"}: ${isAr ? "تحويل الزائر لعميل/Lead" : "Turn visitors into a clear action (signup/lead)"}`,
    `${isAr ? "Tone & style" : "Tone & style"}: ${style}`,
    "",
    `${isAr ? "Hero section copy" : "Hero section copy"}:`,
    `- ${isAr ? "Headline" : "Headline"}: ${heroHeadline}`,
    `- ${isAr ? "Subheadline" : "Subheadline"}: ${heroSubheadline}`,
    `- ${isAr ? "Primary CTA" : "Primary CTA"}: ${primaryCTA}`,
    secondaryCTA ? `- ${isAr ? "Secondary CTA" : "Secondary CTA"}: ${secondaryCTA}` : null,
    "",
    `${isAr ? "Suggested pages" : "Suggested pages"}:`,
    `- ${pages.join("\n- ")}`,
    "",
    `${isAr ? "Home page sections (order)" : "Home page sections (order)"}:`,
    homeSections.join("\n"),
    "",
    `${isAr ? "Key features" : "Key features"}:`,
    `- ${features.join("\n- ")}`,
    "",
    `${isAr ? "Content needed from user" : "Content needed from user"}:`,
    `- ${isAr ? "اسم البراند + وصف مختصر + صور/لوجو" : "Brand name + short description + logo/images"}`,
    `- ${isAr ? "روابط سوشيال + وسيلة تواصل" : "Social links + contact method"}`,
    "",
    `${isAr ? "Constraints" : "Constraints"}:`,
    `- Mobile-first`,
    `- Fast loading`,
    `- Accessible (WCAG-friendly)`,
    `- SEO basics (titles, meta, headings)`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    improved,
    summary: { audience, pages, style, features, lang, industry },
  };
}

/** -------------------- In-memory AI daily limit (demo) -------------------- */
type Bucket = { count: number; resetAt: number };
const ipBuckets = new Map<string, Bucket>();

function getBucket(ip: string) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const b = ipBuckets.get(ip);
  if (!b || now > b.resetAt) return { count: 0, resetAt: now + dayMs };
  return b;
}

function canUseAi(ip: string) {
  const b = getBucket(ip);
  if (b.count >= DAILY_LIMIT) return { ok: false as const, remaining: 0, resetAt: b.resetAt };
  return { ok: true as const, remaining: DAILY_LIMIT - b.count, resetAt: b.resetAt };
}

function consumeAi(ip: string) {
  const b = getBucket(ip);
  const updated = { count: b.count + 1, resetAt: b.resetAt };
  ipBuckets.set(ip, updated);
  return { remaining: DAILY_LIMIT - updated.count, resetAt: updated.resetAt };
}

/** -------------------- OpenAI call (optional) -------------------- */
async function improveIdeaWithAI(ideaRaw: string): Promise<AiResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, reason: "AI_NOT_CONFIGURED" };

  const idea = cleanIdea(ideaRaw);
  const lang = detectLanguage(idea);

  const prompt = [
    `You are a senior product designer + conversion-focused web copywriter.`,
    `Turn the user idea into a BETTER, CLEARER, build-ready website prompt.`,
    `Return ONLY the final prompt. No explanations.`,
    `Write in the same language as the input (${lang === "ar" ? "Arabic" : "English"}).`,
    ``,
    `Use EXACT headings:`,
    `Build-ready website prompt:`,
    `1) Website type`,
    `2) Target audience`,
    `3) Primary goal`,
    `4) Tone & style`,
    `5) Hero section copy (headline<=10 words, subheadline 1–2 sentences, CTA 2–4 words)`,
    `6) Suggested pages`,
    `7) Home page sections (ordered 6–9)`,
    `8) Key features (5–8 bullets)`,
    `9) Content requirements`,
    `10) Constraints (mobile-first, fast, accessible, SEO basics)`,
    ``,
    `User idea: "${idea}"`,
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    let code = "AI_ERROR";
    let type = "";

    try {
      const j = JSON.parse(errText);
      code = j?.error?.code || code;
      type = j?.error?.type || "";
    } catch {}

    // Server log only (don’t show raw body to user)
    console.log("OpenAI error:", { status: res.status, code, type });

    return { ok: false, reason: "AI_ERROR", details: { status: res.status, code, type } };
  }

  const data = await res.json();
  const text = data?.output_text || data?.output?.[0]?.content?.[0]?.text || "";
  return { ok: true, improved: (text || "").trim() };
}

/** -------------------- Friendly warning mapping -------------------- */
function toFriendlyWarning(ai: AiResult): { warningCode: string; warning: string } {
  if (ai.ok) return { warningCode: "", warning: "" };

  if (ai.reason === "AI_NOT_CONFIGURED") {
    return {
      warningCode: "AI_NOT_CONFIGURED",
      warning: "AI isn’t enabled on this deployment. Using Standard instead.",
    };
  }

  const status = ai.details?.status;
  const code = ai.details?.code;
  const type = ai.details?.type;

  if (status === 429 && (code === "insufficient_quota" || type === "insufficient_quota")) {
    return {
      warningCode: "AI_NO_CREDITS",
      warning: "AI rewrite needs API credits. Using Standard instead.",
    };
  }

  if (status === 429) {
    return {
      warningCode: "AI_RATE_LIMIT",
      warning: "AI is busy right now. Using Standard instead.",
    };
  }

  if (status === 401) {
    return {
      warningCode: "AI_BAD_KEY",
      warning: "AI key looks invalid. Using Standard instead.",
    };
  }

  return {
    warningCode: "AI_FAILED",
    warning: "AI failed temporarily. Using Standard instead.",
  };
}

/** -------------------- Handler -------------------- */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const idea = body?.idea;
  const mode: Mode = body?.mode === "ai" ? "ai" : "standard";

  if (!idea || typeof idea !== "string" || cleanIdea(idea).length < 10) {
    return NextResponse.json(
      { error: "Please write a bit more detail (at least 10 characters)." },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Always compute standard (for summary chips + fallback)
  const standard = improveIdeaStandard(idea);

  if (mode === "standard") {
    return NextResponse.json({ ...standard, modeUsed: "standard" });
  }

  // AI mode (optional)
  const limit = canUseAi(ip);
  if (!limit.ok) {
    return NextResponse.json({
      ...standard,
      modeUsed: "standard",
      warningCode: "AI_LIMIT_REACHED",
      warning: `AI limit reached (${DAILY_LIMIT}/day). Using Standard instead.`,
      ai: { remaining: 0, resetAt: limit.resetAt },
    });
  }

  const ai = await improveIdeaWithAI(idea);

  // AI failed -> fallback (no raw details in UI)
  if (!ai.ok || !ai.improved) {
    const friendly = toFriendlyWarning(ai);
    return NextResponse.json({
      ...standard,
      modeUsed: "standard",
      ...friendly,
      ai: { remaining: limit.remaining, resetAt: limit.resetAt },
    });
  }

  //  consume quota ONLY on success
  const consumed = consumeAi(ip);

  return NextResponse.json({
    improved: ai.improved,
    summary: standard.summary,
    modeUsed: "ai",
    ai: { remaining: consumed.remaining, resetAt: consumed.resetAt },
  });
}
