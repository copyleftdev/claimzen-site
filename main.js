// ClaimZen site — nav state, scroll reveals, contact form (Web3Forms relay).

// ── Contact form ───────────────────────────────────────────────
// Submissions relay through Web3Forms so no inbox address ships in the page.
// Get a free key (10s) at https://web3forms.com using your destination email,
// then paste it below. Until then the form gracefully points to email.
const WEB3FORMS_ACCESS_KEY = "YOUR-WEB3FORMS-ACCESS-KEY";
const FALLBACK_EMAIL = "dj@codetestcode.io";

// ── Nav shadow on scroll ───────────────────────────────────────
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ── Scroll reveals ─────────────────────────────────────────────
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en, i) => {
      if (en.isIntersecting) {
        const sib = [...en.target.parentElement.children].filter(c => c.classList.contains("reveal"));
        en.target.style.transitionDelay = Math.min(sib.indexOf(en.target), 4) * 70 + "ms";
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add("in"));
}

// ── Contact form submit ────────────────────────────────────────
const form = document.getElementById("contact-form");
if (form) {
  const btn = document.getElementById("cf-submit");
  const status = document.getElementById("cf-status");
  const formError = document.getElementById("cf-form-error");
  const setStatus = (msg, cls) => { status.textContent = msg; status.className = "cf-status" + (cls ? " " + cls : ""); };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.hidden = true;
    if (form.querySelector(".botcheck").checked) return;   // honeypot
    if (!form.checkValidity()) { form.reportValidity(); return; }

    if (WEB3FORMS_ACCESS_KEY.startsWith("YOUR-")) {
      setStatus("", "");
      formError.hidden = false;
      formError.innerHTML = `The form isn't wired to an inbox yet — email us at <a href="mailto:${FALLBACK_EMAIL}">${FALLBACK_EMAIL}</a>.`;
      return;
    }

    btn.disabled = true; const label = btn.textContent; btn.textContent = "Sending…"; setStatus("", "");
    const fd = new FormData(form);
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: "ClaimZen — new early-access request",
      from_name: "claimzen.ai contact form",
      name: fd.get("name"), email: fd.get("email"),
      organization: fd.get("organization") || "—",
      volume: fd.get("volume") || "—",
      message: fd.get("message"),
    };
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        form.reset();
        setStatus("Thanks — we'll be in touch shortly.", "ok");
      } else {
        setStatus("", ""); formError.hidden = false;
        formError.innerHTML = `Something went wrong. Email us at <a href="mailto:${FALLBACK_EMAIL}">${FALLBACK_EMAIL}</a>.`;
      }
    } catch {
      setStatus("", ""); formError.hidden = false;
      formError.innerHTML = `Network error. Email us at <a href="mailto:${FALLBACK_EMAIL}">${FALLBACK_EMAIL}</a>.`;
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  });
}
